import { spawn, execFile } from "promisify-child-process";
import { mkdir, readFile, stat } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const distDir = resolve(rootDir, "dist");
const gsProCli = process.env.GS_PRO_CLI || "D:/engamd89-dev/js-ts/gs-pro/cli/dist/cli.js";
// NOTE: computed at module scope — inside `new Promise((resolve, …))` the name
// `resolve` is the promise resolver, NOT node:path resolve (shadowing).
const viteBin = resolve(rootDir, "node_modules", "vite", "bin", "vite.js");

const ROUTES = [
  // English
  { locale: "en", path: "/" },
  { locale: "en", path: "/skills" },
  { locale: "en", path: "/experience" },
  { locale: "en", path: "/projects" },
  { locale: "en", path: "/education" },
  { locale: "en", path: "/certifications" },
  { locale: "en", path: "/languages" },
  { locale: "en", path: "/contact" },
  { locale: "en", path: "/privacy" },
  { locale: "en", path: "/terms" },
  // Turkish
  { locale: "tr", path: "/" },
  { locale: "tr", path: "/skills" },
  { locale: "tr", path: "/experience" },
  { locale: "tr", path: "/projects" },
  { locale: "tr", path: "/education" },
  { locale: "tr", path: "/certifications" },
  { locale: "tr", path: "/languages" },
  { locale: "tr", path: "/contact" },
  { locale: "tr", path: "/privacy" },
  { locale: "tr", path: "/terms" },
];

const PREVIEW_PORT = 4173;
const PREVIEW_HOST = "localhost";
const PREVIEW_URL = `http://${PREVIEW_HOST}:${PREVIEW_PORT}`;

// Parallel capture workers: one per CPU minus one (min 1), leaving a core
// for the vite preview server + Chrome.
const CONCURRENCY = Math.max(1, availableParallelism() - 1);

// Per-route resilience: gs-pro-cli's own 60s tab timeout covers page load,
// the 150s watchdog covers CDP-connect/evaluate hangs past it, and failed
// captures retry (transient CDP contention under parallelism self-heals).
const CAPTURE_MAX_ATTEMPTS = 3;
const CAPTURE_TIMEOUT_MS = 150000;
const CAPTURE_RETRY_DELAY_MS = 2000;

// Graceful shutdown: in-flight capture processes + preview server are
// tracked so SIGINT/SIGTERM terminates the whole tree instead of
// orphaning Chrome-driving children mid-capture.
const activeCaptures = new Set();
let previewProc = null;
let shuttingDown = false;

async function shutdown(signal, exitCode) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n${signal} received — stopping ${activeCaptures.size} capture(s) + preview...`);
  for (const proc of activeCaptures) {
    try {
      proc.kill("SIGTERM");
    } catch {
      // Already exited — nothing to do.
    }
    if (process.platform === "win32" && proc.pid) {
      await execFile("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { stdio: "ignore" }).catch(() => {});
    }
  }
  activeCaptures.clear();
  await sweepPreviewTabs();
  if (previewProc) await stopPreview(previewProc);
  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown("SIGINT", 130));
process.on("SIGTERM", () => shutdown("SIGTERM", 143));

// CDP endpoint the captures run against. Must match the gs-pro-cli
// defaults (we don't pass --host/--port), same coupling as gsProCli above.
const CDP_HOST = "127.0.0.1";
const CDP_PORT = 9222;

function cdpGet(path) {
  return new Promise((resolve) => {
    const req = http.get({ host: CDP_HOST, port: CDP_PORT, path }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

// Post-run tab sweep: gs-pro-cli closes its own tab in `finally`, but under
// parallel load some tabs survive (closeTarget-vs-detach race inside the
// CLI — 11 closed, 9 leaked in a verified 20/20 run). Rather than depending
// on the leaky component, enforce the invariant here: close every page
// target serving our preview origin. Matches by URL prefix, so the user's
// own tabs are never touched. Never fails the build — warns only.
async function sweepPreviewTabs() {
  const list = await cdpGet("/json/list");
  if (!list || list.status !== 200) {
    console.warn("⚠ tab sweep skipped: CDP endpoint unreachable");
    return;
  }
  let targets;
  try {
    targets = JSON.parse(list.data);
  } catch {
    console.warn("⚠ tab sweep skipped: bad /json/list response");
    return;
  }
  const prefixes = [`${PREVIEW_URL}/`, `http://127.0.0.1:${PREVIEW_PORT}/`];
  const ours = targets.filter(
    (t) => t.type === "page" && typeof t.url === "string" && prefixes.some((p) => t.url.startsWith(p)),
  );
  if (ours.length === 0) return;
  let closed = 0;
  for (const t of ours) {
    const res = await cdpGet(`/json/close/${t.id}`);
    if (res && res.status === 200) {
      closed++;
    } else {
      console.warn(`⚠ tab sweep: could not close ${t.url}`);
    }
  }
  console.log(`🧹 tab sweep: closed ${closed}/${ours.length} leftover capture tab(s)`);
}

function startPreview() {
  return new Promise((resolve, reject) => {
    // Spawn vite.js directly (no vite.cmd shim, no shell) so `preview` is the
    // real server process: exitCode/kill() track the actual server, and
    // preview.kill() terminates it instead of an already-exited .cmd wrapper.
    // (viteBin is hoisted to module scope — see NOTE above.)
    const preview = spawn(process.execPath, [viteBin, "preview", "--host", "localhost", "--port", String(PREVIEW_PORT)], {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"],
    });
    // promisify-child-process creates its internal promise EAGERLY: it rejects
    // when the process is signal-killed (stopPreview SIGTERMs it) or exits
    // nonzero. We manage the lifecycle via events below, so swallow the
    // internal promise — otherwise the SIGTERM at shutdown surfaces as an
    // unhandled rejection and crashes Node (default throw behavior).
    preview.catch(() => {});

    let settled = false;
    let stdout = "";
    let stderr = "";

    preview.stdout.on("data", (data) => {
      const text = data.toString();
      stdout += text;
      if (!settled && (text.includes("127.0.0.1") || text.includes("localhost"))) {
        settled = true;
        resolve({ preview, stdout, stderr });
      }
    });

    preview.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    preview.on("error", (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });

    preview.on("exit", (code) => {
      if (!settled) {
        settled = true;
        if (code !== 0) {
          reject(new Error(`vite preview exited with code ${code}\n${stderr}`));
        } else {
          resolve({ preview, stdout, stderr });
        }
      }
    });

    // Fallback timeout — if no signal after 10s, assume ready
    setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({ preview, stdout, stderr });
      }
    }, 10000);
  });
}

async function stopPreview(preview) {
  if (!preview || preview.killed || preview.exitCode !== null) return;
  preview.kill("SIGTERM");
  // Windows: ensure the whole process tree dies (SIGTERM may leave orphans).
  // promisify-child-process has no sync API, so the fire-and-forget taskkill
  // becomes an awaited promise — `.catch` covers "already exited".
  if (process.platform === "win32" && preview.pid) {
    await execFile("taskkill", ["/PID", String(preview.pid), "/T", "/F"], { stdio: "ignore" }).catch(() => {});
  }
}

async function captureRoute(route, attempt = 1, isAlive = () => true) {
  const url = `${PREVIEW_URL}/${route.locale}${route.path}`;
  const outDir = resolve(distDir, route.locale, route.path === "/" ? "" : route.path.replace(/^\//, ""));
  const outFile = resolve(outDir, "index.html");

  await mkdir(outDir, { recursive: true });
  const runStart = Date.now();

  if (await runCaptureOnce(route, url, outFile, runStart)) return true;
  // Preview died mid-capture — don't burn retries, let the pool abort.
  if (!isAlive()) return false;
  if (attempt < CAPTURE_MAX_ATTEMPTS) {
    console.warn(`↻ retry ${url} (attempt ${attempt + 1}/${CAPTURE_MAX_ATTEMPTS})`);
    await new Promise((r) => setTimeout(r, CAPTURE_RETRY_DELAY_MS * attempt));
    return captureRoute(route, attempt + 1, isAlive);
  }
  return false;
}

// Single gs-pro-cli invocation. Never rejects — every outcome (timeout,
// spawn error, nonzero exit, stale/empty output) resolves false so one bad
// route can never take down the worker pool (Promise.all) with it.
function runCaptureOnce(route, url, outFile, runStart) {
  return new Promise((resolve) => {
    const args = ["--open-url", url, "--full-html", "-o", outFile, "--open-url-tab-timeout", "60"];

    // Windows: resolve node via cmd.exe (bare "node" without a shell is
    // unreliable under uv_spawn PATH lookup); shell stays false so the
    // child is a real process the close listener tracks.
    const proc = spawn("cmd.exe", ["/c", "node", gsProCli, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    activeCaptures.add(proc);
    // Same eager-promise hazard as startPreview: a nonzero gs-pro-cli exit
    // rejects the internal promise. Exit codes are handled via the 'close'
    // listener below (tolerant per-route loop), so swallow it here to avoid
    // an unhandled rejection crashing the whole prerender run.
    proc.catch(() => {});

    let settled = false;
    const settle = (value) => {
      if (!settled) {
        settled = true;
        clearTimeout(watchdog);
        activeCaptures.delete(proc);
        resolve(value);
      }
    };

    // Watchdog: gs-pro-cli's own 60s tab timeout covers page load, but CDP
    // connect / Runtime.evaluate can hang past it — never let one route
    // stall the build forever.
    const watchdog = setTimeout(() => {
      console.warn(`⚠ capture timed out after ${CAPTURE_TIMEOUT_MS / 1000}s for ${url} — killing process tree`);
      try {
        proc.kill("SIGKILL");
      } catch {
        // Already exited — nothing to do.
      }
      if (process.platform === "win32" && proc.pid) {
        execFile("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { stdio: "ignore" }).catch(() => {});
      }
      settle(false);
    }, CAPTURE_TIMEOUT_MS);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("error", (err) => {
      console.warn(`⚠ Failed to spawn capture for ${url}: ${err.message}`);
      settle(false);
    });

    // 'close' (not 'exit'): guarantees stdio is flushed before we verify.
    proc.on("close", async (code) => {
      if (code !== 0) {
        console.warn(`⚠ gs-pro-cli exited ${code} for ${url}: ${stderr.trim()}`);
        settle(false);
        return;
      }

      // Verify the file was written by THIS run and has content. The mtime
      // guard rejects stale output from a previous build when the CLI
      // exits 0 without writing (or fails to overwrite).
      try {
        const fileStat = await stat(outFile).catch(() => null);
        if (!fileStat || fileStat.mtimeMs < runStart) {
          console.warn(`⚠ Missing or stale output for ${url}`);
          settle(false);
          return;
        }
        const content = await readFile(outFile, "utf-8");
        if (content.includes("<title>") && content.includes('<div id="root">')) {
          console.log(`✓ ${route.locale}${route.path} → ${outFile}`);
          settle(true);
          return;
        }
        if (content.includes("ERR_CONNECTION_REFUSED") || content.includes("loadTimeDataRaw")) {
          console.warn(`⚠ Chrome error page captured for ${url} (preview server may have crashed)`);
        } else {
          console.warn(`⚠ Empty or invalid output for ${url}`);
        }
        settle(false);
      } catch (err) {
        console.warn(`⚠ Failed to verify ${url}: ${err.message}`);
        settle(false);
      }
    });
  });
}

async function main() {
  console.log("Starting vite preview...");
  const { preview } = await startPreview();

  // Give the server a moment to fully initialize
  await new Promise((r) => setTimeout(r, 2000));

  console.log(`\nCapturing ${ROUTES.length} routes with ${CONCURRENCY} workers...\n`);

  let success = 0;
  let next = 0;
  let aborted = false;
  previewProc = preview;
  const isPreviewAlive = () => !shuttingDown && preview && !preview.killed && preview.exitCode === null;

  async function worker(id) {
    // Stagger worker startup so Chrome isn't hit with N CDP sessions at once.
    await new Promise((r) => setTimeout(r, id * 300));
    while (!aborted && !shuttingDown) {
      const i = next++;
      if (i >= ROUTES.length) return;
      // Check if preview server is still alive
      if (!isPreviewAlive()) {
        aborted = true;
        console.error(`❌ vite preview server has died. Aborting. (killed=${preview?.killed} exitCode=${preview?.exitCode} signal=${preview?.signalCode} pid=${preview?.pid})`);
        return;
      }
      if (await captureRoute(ROUTES[i], 1, isPreviewAlive)) {
        success++;
      }
    }
  }

  const workerCount = Math.min(CONCURRENCY, ROUTES.length);
  await Promise.all(Array.from({ length: workerCount }, (_, id) => worker(id)));
  const failed = ROUTES.length - success;

  console.log(`\nDone: ${success} succeeded, ${failed} failed`);

  await sweepPreviewTabs();
  await stopPreview(preview);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});

import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const distDir = resolve(rootDir, "dist");
const gsProCli = process.env.GS_PRO_CLI || "D:/engamd89-dev/js-ts/gs-pro/cli/dist/cli.js";

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
];

const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

function startPreview() {
  return new Promise((resolve, reject) => {
    const binDir = resolve(rootDir, "node_modules", ".bin");
    const preview = spawn("vite.cmd", ["preview", "--port", String(PREVIEW_PORT)], {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      env: { ...process.env, PATH: `${binDir}${process.env.PATH}` },
    });

    let settled = false;

    let stdout = "";
    let stderr = "";

    preview.stdout.on("data", (data) => {
      const text = data.toString();
      stdout += text;
      if (!settled && (text.includes("Local:") || text.includes("localhost"))) {
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

async function captureRoute(route) {
  const url = `${PREVIEW_URL}/${route.locale}${route.path}`;
  const outDir = resolve(distDir, route.locale, route.path === "/" ? "" : route.path.replace(/^\//, ""));
  const outFile = resolve(outDir, "index.html");

  await mkdir(outDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const args = [
      "--open-url",
      url,
      "--full-html",
      "-o",
      outFile,
      "--open-url-tab-timeout",
      "60",
    ];

    const proc = spawn("node", [gsProCli, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to capture ${url}: ${err.message}`));
    });

    proc.on("exit", async (code) => {
      if (code !== 0) {
        console.warn(`⚠ gs-pro-cli exited ${code} for ${url}: ${stderr.trim()}`);
        resolve(false);
        return;
      }

      // Verify the file was written and has content
      try {
        if (existsSync(outFile)) {
          const content = await readFile(outFile, "utf-8");
          if (content.includes("<title>")) {
            console.log(`✓ ${route.locale}${route.path} → ${outFile}`);
            resolve(true);
            return;
          }
        }
        console.warn(`⚠ Empty or missing output for ${url}`);
        resolve(false);
      } catch (err) {
        console.warn(`⚠ Failed to verify ${url}: ${err.message}`);
        resolve(false);
      }
    });
  });
}

async function main() {
  console.log("Starting vite preview...");
  const { preview } = await startPreview();

  // Give the server a moment to fully initialize
  await new Promise((r) => setTimeout(r, 2000));

  console.log(`\nCapturing ${ROUTES.length} routes...\n`);

  let success = 0;
  let failed = 0;

  for (const route of ROUTES) {
    const result = await captureRoute(route);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log(`\nDone: ${success} succeeded, ${failed} failed`);

  if (preview) {
    preview.kill();
  }
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const __dirname = import.meta.dirname;

// Paths
const localesDir = join(__dirname, "../public/locales");
const publicDir = join(__dirname, "../public");
const envPath = join(__dirname, "../.env");

const enPath = join(localesDir, "en/translation.json");
const trPath = join(localesDir, "tr/translation.json");

// Function to compute SHA1 hash of content (handles binary/text)
function computeHash(content) {
  return createHash("sha1").update(content).digest("hex").slice(0, 8); // 40-char hex; slice(0,10) for shorter if needed
}

// Hash locales (en/tr translation.json) - text files
function hashLocales() {
  if (!existsSync(enPath) || !existsSync(trPath)) {
    console.error("Error: Locale files not found.");
    process.exit(1);
  }

  const enContent = readFileSync(enPath);
  const trContent = readFileSync(trPath);
  const enHash = computeHash(enContent);
  const trHash = computeHash(trContent);
  return `${enHash}-${trHash}`; // Combined: ~80 chars
}

// Hash all other public files (recursive, binary-safe)
function hashPublicAssets() {
  let hash = createHash("sha1");
  const hashPublicFile = (filePath) => {
    if (!existsSync(filePath)) return;

    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      // Recurse into subdirs (e.g., data/, sd-favicon/)
      readdirSync(filePath).forEach((child) => hashPublicFile(join(filePath, child)));
    } else if (stats.isFile() && !filePath.includes("locales")) {
      // Exclude locales
      try {
        const content = readFileSync(filePath);
        hash.update(content);
      } catch (err) {
        console.warn(`Warning: Could not read ${filePath}: ${err.message}`);
      }
    }
  };

  // Start from public/ root
  readdirSync(publicDir).forEach((child) => hashPublicFile(join(publicDir, child)));
  return hash.digest("hex").slice(0, 8); // 40-char hex
}

// Compute hashes
console.log("Computing SHA1 hashes...");
const localesHash = hashLocales();
const assetsHash = hashPublicAssets();

console.log(`Locales SHA1 Hash: ${localesHash}`);
console.log(`Public Assets SHA1 Hash: ${assetsHash}`);

// Read/update .env
let envContent = "";
if (existsSync(envPath)) {
  envContent = readFileSync(envPath, "utf8");
} else {
  console.log("Creating new .env file.");
}

const envLines = envContent.split("\n").filter((line) => line.trim());
const localesLine = `VITE_LOCALE_HASH=${localesHash}`;
const assetsLine = `VITE_ASSET_HASH=${assetsHash}`;
let updatedLines = envLines.filter((line) => !line.startsWith("VITE_LOCALE_HASH=") && !line.startsWith("VITE_ASSET_HASH="));
updatedLines.unshift(localesLine, assetsLine);

// Write back
writeFileSync(envPath, updatedLines.join("\n") + "\n");
console.log("\nUpdated .env:");
console.log(`VITE_LOCALE_HASH=${localesHash}`);
console.log(`VITE_ASSET_HASH=${assetsHash}`);

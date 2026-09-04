import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = resolve(__dirname, "..", "public", "sitemap.xml");

const today = new Date().toISOString().split("T")[0];

const content = readFileSync(sitemapPath, "utf-8");

// Bump <lastmod> to today per <url> block — but skip yearly entries
// (privacy/terms): their dates must reflect real content changes, otherwise
// every build teaches crawlers to distrust lastmod.
const updated = content.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
  if (/<changefreq>yearly<\/changefreq>/.test(block)) return block;
  return block.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
});

if (updated !== content) {
  writeFileSync(sitemapPath, updated, "utf-8");
}
console.log(`[update-sitemap] Updated lastmod to ${today} (yearly entries untouched)`);

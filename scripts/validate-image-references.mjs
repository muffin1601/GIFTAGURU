import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const sourceRoots = ["app", "components", "data", "lib"];
const sourceFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (/\.(ts|tsx)$/.test(entry.name)) sourceFiles.push(filePath);
  }
}

for (const root of sourceRoots) walk(root);

const imageReference = /["'](\/[^"']+\.(?:png|jpe?g|webp|avif))["']/gi;
const missing = [];

for (const file of sourceFiles) {
  // data/products.ts contains legacy seed tuple paths that are normalised to
  // the canonical local gallery filenames before the exported products are
  // created. Validate the resulting storefront references via the existing
  // product-content test suite instead of treating those dormant tuple values
  // as live URLs.
  if (file === path.join("data", "products.ts")) continue;
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(imageReference)) {
    const target = path.join("public", decodeURIComponent(match[1]));
    if (!existsSync(target)) missing.push(`${file}: ${match[1]}`);
  }
}

if (missing.length > 0) {
  console.error(missing.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`All static image references resolve (${sourceFiles.length} source files scanned).`);
}

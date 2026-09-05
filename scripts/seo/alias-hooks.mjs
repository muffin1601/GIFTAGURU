/**
 * Teaches plain `node` two resolution conventions the app relies on but the
 * Node ESM resolver does not implement: the "@/..." path alias from
 * tsconfig.json, and TypeScript's extensionless relative imports ("./types").
 *
 * The SEO scripts and the SEO regression test import the application's own
 * modules so they check what actually ships rather than a copy of it. Node
 * strips the types natively, but bundler-style resolution is Next's job, not
 * Node's -- so without this hook any module importing a value through "@/..."
 * or "./sibling" fails to link.
 *
 * `module.registerHooks` (synchronous, Node 22.15+/24+) runs during linking,
 * which is why this must be loaded with `--import` rather than a plain
 * `import` statement inside the consuming module: a static import would be
 * resolved before the hook was ever registered.
 */
import { registerHooks } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const EXTENSIONS = [".ts", ".tsx", ".mts", ".js", ".mjs", ".json"];

/** Try `base` itself, then each extension, then an index file inside it. */
function firstExistingFile(base) {
  const candidates = [
    base,
    ...EXTENSIONS.map((e) => base + e),
    ...EXTENSIONS.map((e) => path.join(base, "index" + e)),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const url = firstExistingFile(path.join(ROOT, specifier.slice(2)));
      if (url) return { url, shortCircuit: true };
    }

    // Extensionless relative imports between the app's own TS modules.
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      if (!path.extname(specifier) && context.parentURL?.startsWith("file:")) {
        const from = path.dirname(fileURLToPath(context.parentURL));
        const url = firstExistingFile(path.resolve(from, specifier));
        if (url) return { url, shortCircuit: true };
      }
    }

    return nextResolve(specifier, context);
  },
});

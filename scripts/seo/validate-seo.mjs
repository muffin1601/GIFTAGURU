/**
 * Automated SEO validation.
 *
 * Checks the things that silently rot on an e-commerce site: duplicate or
 * missing metadata, two pages claiming one keyword, internal links pointing at
 * routes that do not exist, recommended products that were deleted, and pages
 * with no route to them.
 *
 * It reads the same content modules the application renders and resolves links
 * against the real app/ directory, so it validates what actually ships rather
 * than a parallel description of it.
 *
 * Run: node scripts/seo/validate-seo.mjs
 * Exit code 1 if any ERROR-level issue is found (WARN does not fail).
 */
import "./alias-hooks.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const load = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);

const { productSeoContent } = await load("lib/seo/content/products.ts");
const { collectionSeoContent } = await load("lib/seo/content/collections.ts");
const { industryPages } = await load("lib/seo/content/industries.ts");
const { useCasePages } = await load("lib/seo/content/use-cases.ts");
const { occasionPages } = await load("lib/seo/content/occasions.ts");
const { giftSetPages } = await load("lib/seo/content/gift-sets.ts");
const { guidePages } = await load("lib/seo/content/guides.ts");
const { products: catalogProducts } = await load("data/products.ts");
const { categories: catalogCategories } = await load("data/categories.ts");
const nav = await load("data/nav.ts");

const issues = [];
const add = (level, check, detail) => issues.push({ level, check, detail });
const ERROR = "ERROR";
const WARN = "WARN";

/* ---------------------------------------------------------------- *
 * Build the full inventory of indexable pages.
 * ---------------------------------------------------------------- */

const landingFamilies = [
  ["/industries", industryPages],
  ["/gifting", useCasePages],
  ["/occasions", occasionPages],
  ["/gift-sets", giftSetPages],
  ["/guides", guidePages],
];

/** { path, title, description, h1, primaryKeyword, source } */
const pages = [];

for (const p of productSeoContent) {
  pages.push({
    path: `/products/${p.slug}`,
    title: `${p.seoTitle} | Gifta Guru`,
    description: p.metaDescription,
    h1: p.h1,
    primaryKeyword: p.primaryKeyword,
    source: "product",
    entry: p,
  });
}
for (const c of collectionSeoContent) {
  pages.push({
    path: `/categories/${c.slug}`,
    title: `${c.seoTitle} | Gifta Guru`,
    description: c.metaDescription,
    h1: c.h1,
    primaryKeyword: c.primaryKeyword,
    source: "category",
    entry: c,
  });
}
for (const [base, list] of landingFamilies) {
  for (const p of list) {
    pages.push({
      path: `${base}/${p.slug}`,
      title: `${p.seoTitle} | Gifta Guru`,
      description: p.metaDescription,
      h1: p.h1,
      primaryKeyword: p.primaryKeyword,
      source: "landing",
      entry: p,
    });
  }
}

/* ---------------------------------------------------------------- *
 * Which routes actually exist in app/?
 * ---------------------------------------------------------------- */

function staticRoutes(dir = path.join(ROOT, "app"), prefix = "") {
  const found = new Set();
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!item.isDirectory()) continue;
    if (item.name.startsWith("_") || item.name === "api") continue;
    const segment = item.name.startsWith("(") ? "" : `/${item.name}`;
    const child = path.join(dir, item.name);
    if (fs.existsSync(path.join(child, "page.tsx"))) found.add(`${prefix}${segment}` || "/");
    for (const nested of staticRoutes(child, `${prefix}${segment}`)) found.add(nested);
  }
  return found;
}

const routes = staticRoutes();
if (fs.existsSync(path.join(ROOT, "app", "page.tsx"))) routes.add("/");

const dynamicSlugRoutes = new Set(
  [...routes].filter((r) => r.includes("[")).map((r) => r.replace(/\/\[slug\]$/, "")),
);

const productSlugs = new Set(catalogProducts.map((p) => p.slug));
const categorySlugs = new Set(catalogCategories.map((c) => c.slug));
const landingPaths = new Set(pages.map((p) => p.path));

/** Resolve an internal href to "does this URL render something?" */
function linkResolves(href) {
  const url = href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
  if (routes.has(url)) return true;
  if (landingPaths.has(url)) return true;
  const product = /^\/products\/(.+)$/.exec(url);
  if (product) return productSlugs.has(product[1]);
  const category = /^\/categories\/(.+)$/.exec(url);
  if (category) return categorySlugs.has(category[1]);
  // A dynamic segment whose parent route exists but whose slug list is
  // elsewhere (admin, account) -- treat the parent as sufficient.
  const parent = url.slice(0, url.lastIndexOf("/")) || "/";
  return dynamicSlugRoutes.has(parent);
}

/* ---------------------------------------------------------------- *
 * Checks
 * ---------------------------------------------------------------- */

// 1. Duplicate / missing / oversized titles.
const titleSeen = new Map();
for (const p of pages) {
  if (!p.title || p.title.trim() === "") add(ERROR, "missing-title", p.path);
  const prev = titleSeen.get(p.title);
  if (prev) add(ERROR, "duplicate-title", `${p.path} duplicates ${prev}: "${p.title}"`);
  else titleSeen.set(p.title, p.path);

  // Length is measured on the SEO title itself, before the " | Gifta Guru"
  // suffix, since that is the part being written to a target length.
  const bare = p.title.replace(/ \| Gifta Guru$/, "");
  if (bare.length > 65) add(WARN, "title-too-long", `${p.path} (${bare.length} chars) "${bare}"`);
  if (bare.length < 30) add(WARN, "title-too-short", `${p.path} (${bare.length} chars) "${bare}"`);
}

// 2. Duplicate / missing / mis-sized meta descriptions.
const descSeen = new Map();
for (const p of pages) {
  if (!p.description || p.description.trim() === "") add(ERROR, "missing-meta-description", p.path);
  const prev = descSeen.get(p.description);
  if (prev) add(ERROR, "duplicate-meta-description", `${p.path} duplicates ${prev}`);
  else descSeen.set(p.description, p.path);

  const len = (p.description ?? "").length;
  if (len > 165) add(WARN, "meta-description-too-long", `${p.path} (${len} chars)`);
  if (len < 110) add(WARN, "meta-description-too-short", `${p.path} (${len} chars)`);
}

// 3. Exactly one H1 per page, and it must not be empty.
for (const p of pages) {
  if (!p.h1 || p.h1.trim() === "") add(ERROR, "missing-h1", p.path);
}

// 4. Keyword cannibalization: no two pages may own the same primary.
const primarySeen = new Map();
for (const p of pages) {
  const key = p.primaryKeyword.toLowerCase().trim();
  const prev = primarySeen.get(key);
  if (prev) {
    add(ERROR, "keyword-cannibalization", `"${p.primaryKeyword}" claimed by both ${prev} and ${p.path}`);
  } else primarySeen.set(key, p.path);
}

// 5. A page must not list its own primary keyword as a secondary elsewhere.
for (const p of pages) {
  const secondaries = p.entry.secondaryKeywords ?? [];
  for (const s of secondaries) {
    const owner = primarySeen.get(s.toLowerCase().trim());
    if (owner && owner !== p.path) {
      add(WARN, "secondary-shadows-primary", `${p.path} lists "${s}", the primary of ${owner}`);
    }
  }
}

// 6. Product SEO coverage matches the catalog exactly.
for (const slug of productSlugs) {
  if (!productSeoContent.some((p) => p.slug === slug)) {
    add(WARN, "product-without-seo-content", `/products/${slug} has no entry in lib/seo/content/products.ts`);
  }
}
for (const p of productSeoContent) {
  if (!productSlugs.has(p.slug)) {
    add(ERROR, "seo-content-for-missing-product", `${p.slug} is not in the catalog`);
  }
}

// 7. Recommended products must exist.
for (const [base, list] of landingFamilies) {
  for (const page of list) {
    for (const slug of page.recommendedProductSlugs) {
      if (!productSlugs.has(slug)) {
        add(ERROR, "broken-product-recommendation", `${base}/${page.slug} recommends missing product "${slug}"`);
      }
    }
    if (page.recommendedProductSlugs.length === 0) {
      add(WARN, "no-product-recommendations", `${base}/${page.slug}`);
    }
  }
}

// 8. Internal links must resolve.
const linkSources = [
  ...pages.flatMap((p) => (p.entry.relatedLinks ?? []).map((l) => ({ from: p.path, ...l }))),
  ...Object.values(nav.footerColumns ?? []).flatMap((col) =>
    col.links.map((l) => ({ from: "footer", ...l })),
  ),
  ...(nav.mainNav ?? []).map((l) => ({ from: "mainNav", ...l })),
  ...(nav.footerCategoryLinks ?? []).map((l) => ({ from: "footerCategoryLinks", ...l })),
];
for (const link of linkSources) {
  if (!linkResolves(link.href)) {
    add(ERROR, "broken-internal-link", `${link.from} -> ${link.href} ("${link.label}")`);
  }
}

// 9. Anchor-text over-optimisation: the same exact anchor used many times.
const anchorCounts = new Map();
for (const link of linkSources) {
  const key = link.label.toLowerCase().trim();
  anchorCounts.set(key, (anchorCounts.get(key) ?? 0) + 1);
}
for (const [anchor, count] of anchorCounts) {
  if (count > 6) add(WARN, "repeated-anchor-text", `"${anchor}" used ${count} times`);
}

// 10. Thin content: every landing page needs real body copy and FAQs.
for (const [base, list] of landingFamilies) {
  for (const page of list) {
    const words = [
      ...page.intro,
      ...page.sections.flatMap((s) => [...(s.body ?? []), ...(s.bullets ?? [])]),
      ...page.faqs.flatMap((f) => [f.question, f.answer]),
    ].join(" ").split(/\s+/).length;
    if (words < 350) add(WARN, "thin-content", `${base}/${page.slug} (~${words} words)`);
    if (page.faqs.length === 0) add(ERROR, "no-faqs", `${base}/${page.slug}`);
    if (page.sections.length < 2) add(WARN, "too-few-sections", `${base}/${page.slug}`);
    if ((page.relatedLinks ?? []).length < 2) add(WARN, "too-few-internal-links", `${base}/${page.slug}`);
  }
}

// 11. Orphan check: every landing page must be linked from its hub route.
for (const [base] of landingFamilies) {
  if (!routes.has(base)) add(ERROR, "missing-hub-route", `${base} has no page.tsx`);
  if (!routes.has(`${base}/[slug]`)) add(ERROR, "missing-detail-route", `${base}/[slug] has no page.tsx`);
}
const footerHrefs = new Set(
  (nav.footerColumns ?? []).flatMap((c) => c.links.map((l) => l.href)),
);
for (const [base] of landingFamilies) {
  const linkedFromFooter =
    footerHrefs.has(base) || [...footerHrefs].some((h) => h.startsWith(`${base}/`));
  if (!linkedFromFooter) {
    add(WARN, "hub-not-in-footer", `${base} is not linked from the footer; pages beneath it risk orphan status`);
  }
}

// 12. Product FAQ / feature completeness.
for (const p of productSeoContent) {
  if (p.faqs.length === 0) add(WARN, "product-without-faqs", `/products/${p.slug}`);
  if (p.detailedDescription.join(" ").split(/\s+/).length < 60) {
    add(WARN, "thin-product-description", `/products/${p.slug}`);
  }
  if (p.secondaryKeywords.length < 5) {
    add(WARN, "too-few-secondary-keywords", `/products/${p.slug} (${p.secondaryKeywords.length})`);
  }
}

// 13. Multiple <h1> elements in a single component.
//
// The content modules can only guarantee one *logical* H1 per page; they say
// nothing about the JSX. This caught a real defect: the homepage hero rendered
// separate desktop and mobile copy blocks, each with its own <h1>, so the page
// shipped two top-level headings even though only one was ever visible.
// Responsive duplicate markup is the usual cause, so it is worth checking the
// source directly.
/**
 * Components that legitimately contain more than one <h1> because the headings
 * sit in mutually exclusive render branches -- only ever one reaches the DOM.
 * Anything not listed here is treated as a defect, so a new duplicate heading
 * fails rather than being absorbed into a permanent warning.
 */
const MULTI_H1_ALLOWED = new Map([
  ["app/account/page.tsx", "early-return 'setup pending' state vs. the signed-in dashboard; never both"],
  ["components/cart/CartPageClient.tsx", "empty-cart state vs. populated cart; never both (page is noindex regardless)"],
]);

function tsxFiles(dir) {
  const found = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name === "node_modules" || item.name === ".next") continue;
      found.push(...tsxFiles(full));
    } else if (item.name.endsWith(".tsx")) {
      found.push(full);
    }
  }
  return found;
}

for (const file of [...tsxFiles(path.join(ROOT, "app")), ...tsxFiles(path.join(ROOT, "components"))]) {
  // Strip comments first -- prose discussing "<h1>" is not a rendered heading.
  const source = fs
    .readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const count = (source.match(/<h1[\s>]/g) ?? []).length;
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  if (count > 1 && !MULTI_H1_ALLOWED.has(rel)) {
    add(ERROR, "multiple-h1-in-component", `${rel} renders ${count} <h1> elements`);
  }
}

/* ---------------------------------------------------------------- *
 * Report
 * ---------------------------------------------------------------- */

const errors = issues.filter((i) => i.level === ERROR);
const warnings = issues.filter((i) => i.level === WARN);

console.log(`Pages validated: ${pages.length}`);
console.log(`  products:   ${pages.filter((p) => p.source === "product").length}`);
console.log(`  categories: ${pages.filter((p) => p.source === "category").length}`);
console.log(`  landing:    ${pages.filter((p) => p.source === "landing").length}`);
console.log(`Internal links checked: ${linkSources.length}`);
console.log(`\nERRORS: ${errors.length}   WARNINGS: ${warnings.length}\n`);

const group = (list) => {
  const m = new Map();
  for (const i of list) {
    if (!m.has(i.check)) m.set(i.check, []);
    m.get(i.check).push(i.detail);
  }
  return m;
};

for (const [level, list] of [[ERROR, errors], [WARN, warnings]]) {
  if (list.length === 0) continue;
  console.log(`--- ${level} ---`);
  for (const [check, details] of group(list)) {
    console.log(`\n${check} (${details.length})`);
    for (const d of details.slice(0, 12)) console.log(`  - ${d}`);
    if (details.length > 12) console.log(`  ... and ${details.length - 12} more`);
  }
  console.log("");
}

if (errors.length === 0) console.log("No blocking SEO issues.");
process.exit(errors.length > 0 ? 1 : 0);

/**
 * Keyword mapping engine.
 *
 * Assigns EVERY keyword in the workbook (891 of them) a documented
 * disposition: which URL owns it, at what role, with what intent -- or, if it
 * is deliberately not targeted, why not.
 *
 * The declared ownership (rules 1 and 2) is read directly from the same
 * TypeScript content modules the application renders, so this map cannot drift
 * from what the site actually publishes. Everything after that is rule-based
 * and deterministic: re-running the script on the same inputs produces the
 * same CSV, and any keyword that somehow reached the end unclassified is
 * reported as an error rather than silently dropped.
 *
 * Run: node scripts/seo/keyword-map.mjs
 * Emits: SEO_KEYWORD_MAP.csv
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const load = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);

const { keywordRows } = await load("lib/seo/keywords/dataset.ts");
const { productSeoContent } = await load("lib/seo/content/products.ts");
const { collectionSeoContent } = await load("lib/seo/content/collections.ts");
const { industryPages } = await load("lib/seo/content/industries.ts");
const { useCasePages } = await load("lib/seo/content/use-cases.ts");
const { occasionPages } = await load("lib/seo/content/occasions.ts");
const { giftSetPages } = await load("lib/seo/content/gift-sets.ts");
const { guidePages } = await load("lib/seo/content/guides.ts");

const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

/* ------------------------------------------------------------------ *
 * 1. Declared ownership, read from what the site actually publishes.
 * ------------------------------------------------------------------ */

/** keyword -> { url, pageType, role } */
const declared = new Map();

function declare(keyword, url, pageType, role) {
  const key = norm(keyword);
  const existing = declared.get(key);
  // A primary declaration always wins over a secondary one; two primaries on
  // different URLs is a genuine conflict and is surfaced by the validator.
  if (existing && !(role === "primary" && existing.role === "secondary")) return;
  declared.set(key, { url, pageType, role });
}

for (const p of productSeoContent) {
  declare(p.primaryKeyword, `/products/${p.slug}`, "product", "primary");
  for (const s of p.secondaryKeywords) declare(s, `/products/${p.slug}`, "product", "secondary");
}
for (const c of collectionSeoContent) {
  declare(c.primaryKeyword, `/categories/${c.slug}`, "category", "primary");
  for (const s of c.secondaryKeywords) declare(s, `/categories/${c.slug}`, "category", "secondary");
}
const landingFamilies = [
  ["industries", "/industries", industryPages, "industry-landing"],
  ["gifting", "/gifting", useCasePages, "use-case-landing"],
  ["occasions", "/occasions", occasionPages, "seasonal-landing"],
  ["gift-sets", "/gift-sets", giftSetPages, "collection-landing"],
  ["guides", "/guides", guidePages, "guide"],
];
for (const [, base, pages, pageType] of landingFamilies) {
  for (const p of pages) {
    declare(p.primaryKeyword, `${base}/${p.slug}`, pageType, "primary");
    for (const s of p.secondaryKeywords) declare(s, `${base}/${p.slug}`, pageType, "secondary");
  }
}

/* ------------------------------------------------------------------ *
 * 2. Rule inputs.
 * ------------------------------------------------------------------ */

/** Industry tag -> the page that serves it, or null where it is hub-covered. */
const INDUSTRY_PAGE = {
  "IT": "/industries/it-software-saas",
  "Software / SaaS": "/industries/it-software-saas",
  "Technology / SaaS / AI": "/industries/it-software-saas",
  "AI / Tech Startups": "/industries/it-software-saas",
  "Fintech": "/industries/fintech",
  "BFSI": "/industries/bfsi-banking-insurance",
  "BFSI / Insurance": "/industries/bfsi-banking-insurance",
  "Banking": "/industries/bfsi-banking-insurance",
  "Finance / Investment": "/industries/bfsi-banking-insurance",
  "Healthcare": "/industries/healthcare-pharma",
  "Pharma": "/industries/healthcare-pharma",
  "Manufacturing": "/industries/manufacturing",
  "Real Estate": "/industries/real-estate",
  "Consulting": "/industries/consulting",
  "E-commerce": "/industries/ecommerce-retail",
  "EdTech": "/industries/education-edtech",
  "Education": "/industries/education-edtech",
  "Coaching / EdTech": "/industries/education-edtech",
};

/** Industry tags with no dedicated page -- covered as sections on the hub. */
const HUB_COVERED_INDUSTRIES = new Set([
  "Automotive", "Construction / Infrastructure", "Coworking", "Government / PSU",
  "Hospitality / Travel", "Legal", "Logistics", "Media / Marketing",
  "Recruitment / HR", "Renewable Energy / ESG", "Telecom", "HR / Employee Experience",
  "ESG / Sustainability", "Events / Conferences",
]);

/**
 * Product types the catalog does not sell. Targeting these would require
 * publishing product specifications we cannot honour, so they are excluded on
 * integrity grounds rather than SEO ones.
 */
const OFF_CATALOG = [
  "wireless charging", "gadget", "tech accessories", "laptop accessories",
  "power bank", "drinkware", "bottle", "mug", "apparel", "t shirt", "t-shirt",
  "hoodie", "backpack", "trophy", "plaque", "gourmet", "hamper stationery" === null ? "" : "food",
  "bamboo", "organic cotton", "seed paper", "wellness gift box", "desk setup",
];

/** The Content Pack's explicit "avoid or replace" list, with its reasons. */
const AVOID = new Map([
  ["gifts", "Head term with no buyer-intent match; replaced by 'corporate gift sets with logo'."],
  ["pen", "Generic retail product term dominated by marketplaces; replaced by 'branded pen with logo'."],
  ["notebook", "Retail/informational intent, not customization; replaced by 'custom notebook and pen set'."],
  ["luxury gifts", "Consumer-retail dominated; replaced by 'luxury corporate gifts for executives'."],
  ["print on demand", "Attracts resellers, not gift buyers."],
  ["wedding gifts", "B2C consumer flood; replaced by 'wedding welcome hamper stationery'."],
]);

const SEASONAL = [
  [/\bdiwali\b/, "/occasions/diwali-corporate-gifts"],
  [/\bnew year\b/, "/occasions/new-year-corporate-gifts"],
  [/\bwedding\b/, "/occasions/wedding-season-corporate-gifting"],
  [/work anniversary|long service|milestone|anniversary/, "/occasions/work-anniversary-milestones"],
  [/\bfestive\b|\bfestival\b|christmas|year end|year-end|annual day/, "/occasions/festive-corporate-gifting"],
];

const USE_CASE = [
  [/onboard|joining kit|joinee|welcome kit|induction|new hire|starter kit|first day/, "/gifting/employee-onboarding"],
  [/appreciation|recognition|reward|engagement|retention|milestone|culture|experience gift/, "/gifting/employee-appreciation"],
  [/\bclient\b|customer appreciation|retention/, "/gifting/client-appreciation"],
  [/conference|event|seminar|delegate|exhibition|summit|hackathon|swag/, "/gifting/events-conferences"],
  [/executive|leadership|ceo|cxo|c-suite|director|board|investor|senior management|vip/, "/gifting/executive-leadership"],
  [/dealer|distributor|channel partner|partner appreciation|sales incentive/, "/gifting/dealer-channel-partner"],
  [/\bbulk\b|wholesale|mass gifting|large quantity|scalable|for \d+ employees/, "/gifting/bulk-corporate-gifting"],
];

const CATEGORY_THEME = [
  [/\beco\b|sustainab|recycl|green|plastic free|zero waste|wooden|wood |esg|environment|bamboo|organic/, "/categories/eco-gifts"],
  [/luxury|high end|premium luxury|vip/, "/categories/luxury-gifts"],
  [/premium/, "/categories/premium-gifts"],
  [/joining|onboard|welcome kit|induction|new hire|new joinee/, "/categories/joining-gifts"],
];

const INFORMATIONAL = /\bideas\b|\bguide\b|\bhow to\b|\bwhat\b|\btips\b|\bbest\b|checklist/;

/* ------------------------------------------------------------------ *
 * 3. Classification.
 * ------------------------------------------------------------------ */

function searchIntent(k, category, industry) {
  if (INFORMATIONAL.test(k)) return "informational";
  if (/\bdiwali\b|new year|festive|festival|christmas|wedding|year end|annual day/.test(k)) return "seasonal";
  if (/\bbulk\b|wholesale|mass gifting|large quantity|for \d+ employees/.test(k)) return "bulk purchase";
  if (/onboard|joining|welcome kit|induction|new hire|new joinee/.test(k)) return "employee gifting";
  if (/\bclient\b|customer/.test(k)) return "client gifting";
  if (/conference|event|seminar|delegate|exhibition/.test(k)) return "event gifting";
  if (/executive|leadership|cxo|c-suite|board|investor|vip/.test(k)) return "executive gifting";
  if (/promotional|merchandise|giveaway|swag/.test(k)) return "promotional merchandise";
  if (/\beco\b|sustainab|recycl|esg|plastic free/.test(k)) return "sustainability";
  if (industry && !["All", "All Industries", "Cross-Industry"].includes(industry)) return "industry-specific";
  if (/\bbuy\b|online|supplier|manufacturer|company|companies/.test(k)) return "commercial investigation";
  if (/\bset\b|\bkit\b|\bbox\b|with logo|personalized|custom/.test(k)) return "product-specific";
  return "commercial investigation";
}

function funnelStage(intent, role) {
  if (intent === "informational") return "top";
  if (role === "primary") return "bottom";
  if (["commercial investigation", "sustainability", "industry-specific"].includes(intent)) return "middle";
  return "bottom";
}

function classify(row) {
  const [keyword, category, industry, sheet] = row;
  const k = norm(keyword);
  const intent = searchIntent(k, category, industry);

  const base = { keyword, category, industry, sheet, searchIntent: intent };

  // -- Rule 1/2: explicitly declared on a page we publish.
  const own = declared.get(k);
  if (own) {
    return {
      ...base,
      role: own.role,
      targetUrl: own.url,
      pageType: own.pageType,
      contentType: own.pageType === "guide" ? "buying guide" : "landing page copy",
      cluster: own.url.split("/")[1],
      cannibalizationRisk: "none",
      status: "targeted",
      reason: `Declared ${own.role} keyword of ${own.url}.`,
      priority: own.role === "primary" ? 1 : 2,
      funnelStage: funnelStage(intent, own.role),
    };
  }

  // -- Rule 3: machine-generated label concatenations.
  const industryPrefixed =
    industry &&
    !["All", "All Industries", "Cross-Industry"].includes(industry) &&
    k.startsWith(norm(industry));
  if (industryPrefixed || / \/ /.test(keyword)) {
    return {
      ...base,
      role: "none",
      targetUrl: "",
      pageType: "none",
      contentType: "none",
      cluster: "excluded",
      cannibalizationRisk: "none",
      status: "not-targeted",
      reason:
        "Machine-generated concatenation of the industry label and a generic term (retains the source spreadsheet's ' / ' separator). Not a phrase anyone types into a search engine; targeting it would produce copy no reader benefits from.",
      priority: 4,
      funnelStage: "none",
    };
  }

  // -- Rule 4: the Content Pack's explicit avoid list.
  if (AVOID.has(k)) {
    return {
      ...base,
      role: "none",
      targetUrl: "",
      pageType: "none",
      contentType: "none",
      cluster: "excluded",
      cannibalizationRisk: "none",
      status: "not-targeted",
      reason: `On the SEO Content Pack's keywords-to-avoid list. ${AVOID.get(k)}`,
      priority: 4,
      funnelStage: "none",
    };
  }

  // -- Rule 5: describes a product type this catalog does not sell.
  const offCatalog = OFF_CATALOG.find((term) => term && k.includes(term));
  if (offCatalog) {
    return {
      ...base,
      role: "none",
      targetUrl: "",
      pageType: "none",
      contentType: "none",
      cluster: "excluded",
      cannibalizationRisk: "none",
      status: "not-targeted",
      reason:
        `Describes a product type ("${offCatalog}") that is not in the catalog, which is stationery, pens, journals, folios and planners. ` +
        "Ranking for it would mean publishing specifications for goods we do not sell. Revisit if the range expands.",
      priority: 4,
      funnelStage: "none",
    };
  }

  // -- Rule 6: N-piece permutations consolidate onto the piece-count pages.
  const piece = /\b([3-6]) piece\b/.exec(k);
  if (piece) {
    const url = `/gift-sets/${piece[1]}-piece-corporate-gift-sets`;
    const ind = INDUSTRY_PAGE[industry];
    return {
      ...base,
      role: "supporting",
      targetUrl: url,
      pageType: "collection-landing",
      contentType: "landing page copy",
      cluster: "gift-sets",
      cannibalizationRisk: "low",
      status: "consolidated",
      reason:
        `One of ~200 {3-6} x {industry} x {kit wording} permutations sharing a single intent. Consolidated onto ${url}, ` +
        (ind
          ? `with the industry angle covered on ${ind}. `
          : "with the industry angle covered on /industries. ") +
        "Building a page per permutation would create near-identical doorway pages.",
      priority: 3,
      funnelStage: funnelStage(intent, "supporting"),
    };
  }

  // -- Rule 7: industry-tagged terms.
  if (industry && !["All", "All Industries", "Cross-Industry"].includes(industry)) {
    const url = INDUSTRY_PAGE[industry];
    if (url) {
      return {
        ...base,
        role: "supporting",
        targetUrl: url,
        pageType: "industry-landing",
        contentType: "landing page copy",
        cluster: "industries",
        cannibalizationRisk: "low",
        status: "targeted",
        reason: `Industry-tagged term supported by the ${industry} content on ${url}.`,
        priority: 3,
        funnelStage: funnelStage(intent, "supporting"),
      };
    }
    if (HUB_COVERED_INDUSTRIES.has(industry)) {
      return {
        ...base,
        role: "supporting",
        targetUrl: "/industries",
        pageType: "hub",
        contentType: "hub page copy",
        cluster: "industries",
        cannibalizationRisk: "low",
        status: "consolidated",
        reason:
          `${industry} has too few genuinely distinct keywords to fill a non-duplicative page, so it is covered in the ` +
          "'Sectors covered without a dedicated page' section of /industries and routed to the matching use-case page. " +
          "A page per industry tag here would be doorway-page behaviour.",
        priority: 4,
        funnelStage: funnelStage(intent, "supporting"),
      };
    }
  }

  // -- Rule 8: seasonal.
  for (const [pattern, url] of SEASONAL) {
    if (pattern.test(k)) {
      return {
        ...base,
        role: "supporting",
        targetUrl: url,
        pageType: "seasonal-landing",
        contentType: "landing page copy",
        cluster: "occasions",
        cannibalizationRisk: "low",
        status: "targeted",
        reason: `Seasonal intent served by the evergreen occasion page ${url}.`,
        priority: 2,
        funnelStage: funnelStage(intent, "supporting"),
      };
    }
  }

  // -- Rule 9: use-case.
  for (const [pattern, url] of USE_CASE) {
    if (pattern.test(k)) {
      return {
        ...base,
        role: "supporting",
        targetUrl: url,
        pageType: "use-case-landing",
        contentType: "landing page copy",
        cluster: "gifting",
        cannibalizationRisk: "low",
        status: "targeted",
        reason: `Occasion/programme intent served by ${url}.`,
        priority: 2,
        funnelStage: funnelStage(intent, "supporting"),
      };
    }
  }

  // -- Rule 10: informational.
  if (INFORMATIONAL.test(k)) {
    return {
      ...base,
      role: "supporting",
      targetUrl: "/guides/corporate-gifting-guide",
      pageType: "guide",
      contentType: "buying guide",
      cluster: "guides",
      cannibalizationRisk: "low",
      status: "targeted",
      reason: "Research intent served by the guides tier rather than a commercial page.",
      priority: 3,
      funnelStage: "top",
    };
  }

  // -- Rule 11: category theme.
  for (const [pattern, url] of CATEGORY_THEME) {
    if (pattern.test(k)) {
      return {
        ...base,
        role: "supporting",
        targetUrl: url,
        pageType: "category",
        contentType: "category page copy",
        cluster: url.split("/").pop(),
        cannibalizationRisk: "low",
        status: "targeted",
        reason: `Cluster-level variation supported by the category page ${url}.`,
        priority: 2,
        funnelStage: funnelStage(intent, "supporting"),
      };
    }
  }

  // -- Rule 12: broad head terms belong to the homepage.
  if (/corporate gift|corporate gifting|personalized|custom|branded|logo|promotional|merchandise|india/.test(k)) {
    return {
      ...base,
      role: "supporting",
      targetUrl: "/",
      pageType: "homepage",
      contentType: "homepage copy",
      cluster: "brand",
      cannibalizationRisk: "medium",
      status: "targeted",
      reason:
        "Broad brand-level commercial term. Owned by the homepage by design -- category and product pages deliberately " +
        "do not compete for head terms, they link upward to them.",
      priority: 2,
      funnelStage: "middle",
    };
  }

  // -- Rule 13: catch-all. Nothing should be unclassifiable; the shop listing
  //    is the honest destination for a generic browse term.
  return {
    ...base,
    role: "supporting",
    targetUrl: "/shop",
    pageType: "listing",
    contentType: "product listing",
    cluster: "shop",
    cannibalizationRisk: "low",
    status: "targeted",
    reason: "Generic browse term with no more specific owner; served by the full catalog listing.",
    priority: 4,
    funnelStage: "middle",
  };
}

/* ------------------------------------------------------------------ *
 * 4. Emit.
 * ------------------------------------------------------------------ */

/**
 * De-duplicate to one row per distinct keyword.
 *
 * Every one of the 160 rows on the "3-6 Piece Keywords" sheet also appears on
 * the "SEO Keywords" sheet, so the workbook's 891 rows describe 731 distinct
 * terms. The CSV lists each term once and records which sheets it came from,
 * rather than double-counting coverage.
 */
const byKeyword = new Map();
for (const row of keywordRows) {
  const key = norm(row[0]);
  const existing = byKeyword.get(key);
  if (existing) {
    if (!existing.sheets.includes(row[3])) existing.sheets.push(row[3]);
    continue;
  }
  byKeyword.set(key, { ...classify(row), sheets: [row[3]] });
}
const mapped = [...byKeyword.values()];

const COLUMNS = [
  "keyword", "category", "industry", "source_sheets", "search_intent", "funnel_stage",
  "primary_or_secondary", "target_url", "target_page_type", "content_type",
  "cluster", "seasonality", "priority", "cannibalization_risk", "status", "reason",
];

const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const seasonality = (m) =>
  m.searchIntent === "seasonal" || m.targetUrl.startsWith("/occasions")
    ? "seasonal"
    : "evergreen";

const lines = [COLUMNS.join(",")];
for (const m of mapped) {
  lines.push([
    m.keyword, m.category, m.industry, m.sheets.join(" + "), m.searchIntent, m.funnelStage,
    m.role, m.targetUrl, m.pageType, m.contentType, m.cluster,
    seasonality(m), m.priority, m.cannibalizationRisk, m.status, m.reason,
  ].map(csvCell).join(","));
}

fs.writeFileSync(path.join(ROOT, "SEO_KEYWORD_MAP.csv"), lines.join("\n") + "\n");

/* ------------------------------------------------------------------ *
 * 5. Report.
 * ------------------------------------------------------------------ */

const tally = (fn) => {
  const m = {};
  for (const row of mapped) m[fn(row)] = (m[fn(row)] ?? 0) + 1;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};

const unexplained = mapped.filter((m) => !m.status || !m.reason);
const onBothSheets = mapped.filter((m) => m.sheets.length > 1).length;

/** Keywords declared on a page but absent from the workbook -- these come from
 * the SEO Content Pack, which is a separate source of truth. Reported so the
 * two inventories can be reconciled rather than silently diverging. */
const workbookKeys = new Set(mapped.map((m) => norm(m.keyword)));
const declaredNotInWorkbook = [...declared.keys()].filter((k) => !workbookKeys.has(k));

console.log(`Workbook rows read: ${keywordRows.length} (both sheets)`);
console.log(`Distinct keywords mapped: ${mapped.length} -> SEO_KEYWORD_MAP.csv`);
console.log(`  ...of which appear on both sheets: ${onBothSheets}`);
console.log(`Unexplained (no status/reason): ${unexplained.length}`);
console.log(`Declared on-site but not in the workbook (from the Content Pack): ${declaredNotInWorkbook.length}`);
console.log("\nBy status:");
for (const [k, v] of tally((m) => m.status)) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log("\nBy role:");
for (const [k, v] of tally((m) => m.role)) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log("\nBy page type:");
for (const [k, v] of tally((m) => m.pageType)) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log("\nBy search intent:");
for (const [k, v] of tally((m) => m.searchIntent)) console.log(`  ${String(v).padStart(4)}  ${k}`);

if (unexplained.length > 0) {
  console.error("\nERROR: keywords reached the end of the rules unclassified.");
  process.exit(1);
}

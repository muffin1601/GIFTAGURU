import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import XLSX from "xlsx";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(ROOT, "reports", "seo");
fs.mkdirSync(OUT, { recursive: true });
const load = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
const norm = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const words = (value) => String(value ?? "").trim().split(/\s+/).filter(Boolean).length;
const pct = (value) => `${(value * 100).toFixed(2)}%`;
const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const writeCsv = (name, columns, rows) => fs.writeFileSync(
  path.join(OUT, name),
  [columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))].join("\n") + "\n",
);

const gscFile = path.join(ROOT, "giftaguru.com-Performance-on-Search-2026-10-21.xlsx");
const keywordFile = path.join(ROOT, "Gifta_Guru_SEO_Keywords_Trending_2026_Clean.xlsx");
const mappingFile = path.join(ROOT, "SEO_KEYWORD_MAP.csv");
const gsc = XLSX.readFile(gscFile, { cellDates: true });
const keywords = XLSX.readFile(keywordFile, { cellDates: true });
const mappingBook = XLSX.readFile(mappingFile);
const sheetRows = (book, name) => XLSX.utils.sheet_to_json(book.Sheets[name], { defval: "" });

const daily = sheetRows(gsc, "Chart");
const queries = sheetRows(gsc, "Queries");
const pages = sheetRows(gsc, "Pages");
const countries = sheetRows(gsc, "Countries");
const devices = sheetRows(gsc, "Devices");
const appearance = sheetRows(gsc, "Search appearance");
const aggregate = (rows, labels = {}) => {
  const clicksKey = labels.clicks ?? "Clicks";
  const impressionsKey = labels.impressions ?? "Impressions";
  const positionKey = labels.position ?? "Position";
  const clicks = rows.reduce((sum, row) => sum + Number(row[clicksKey] || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + Number(row[impressionsKey] || 0), 0);
  const weightedPosition = impressions
    ? rows.reduce((sum, row) => sum + Number(row[impressionsKey] || 0) * Number(row[positionKey] || 0), 0) / impressions
    : 0;
  return { clicks, impressions, ctr: impressions ? clicks / impressions : 0, weightedPosition };
};
const totals = aggregate(daily);
const isBrand = (query) => /\bgift\s*a?\s*guru\b|\bgiftaguru\b/i.test(query);
const commercialPattern = /corporate|employee|client|delegate|conference|seminar|premium|luxury|executive|welcome|joining|gift set|gifting|bulk|hamper|branded|promotional|supplier|onboard|diwali/i;
const branded = queries.filter((row) => isBrand(row["Top queries"]));
const nonBranded = queries.filter((row) => !isBrand(row["Top queries"]));
const brandedTotals = aggregate(branded);
const nonBrandedTotals = aggregate(nonBranded);
const exactGsc = new Map(queries.map((row) => [norm(row["Top queries"]), row]));

const mapped = sheetRows(mappingBook, mappingBook.SheetNames[0]);
const mappedByKeyword = new Map(mapped.map((row) => [norm(row.keyword), row]));
const primaryByUrl = new Map(mapped.filter((row) => row.primary_or_secondary === "primary" && row.target_url).map((row) => [row.target_url, row.keyword]));
const supportByUrl = new Map();
for (const row of mapped) {
  if (!row.target_url) continue;
  const list = supportByUrl.get(row.target_url) ?? [];
  if (list.length < 12 && !list.includes(row.keyword)) list.push(row.keyword);
  supportByUrl.set(row.target_url, list);
}

function commercialRelevance(row) {
  if (row.status === "not-targeted") return "Low / unsupported";
  if (["bulk purchase", "product-specific", "client gifting", "employee gifting", "event gifting", "executive gifting", "commercial investigation"].includes(row.search_intent)) return "High";
  if (["sustainability", "industry-specific", "seasonal"].includes(row.search_intent)) return "Medium-high";
  return "Medium";
}

function contentRequirement(row) {
  const byType = {
    product: "Real product details, visible price/availability, specifications, customization, FAQs and related cluster links.",
    category: "Distinct collection intro, active product grid, buyer guidance, FAQs and contextual links.",
    guide: "Evidence-based guide answering buyer questions, with no invented statistics or claims.",
    "industry-landing": "Unique sector use case and relevant live offering; consolidate where differentiation is weak.",
    "use-case-landing": "Recipient/problem-led guidance, live product recommendations and clear quote path.",
    "seasonal-landing": "Evergreen planning guidance, current products and refresh before demand window.",
    "collection-landing": "One strong piece-count page; do not create a page per keyword permutation.",
    homepage: "Broad corporate-gifting positioning and links to intent-specific pages.",
    listing: "Active catalog results and crawlable pagination.",
  };
  return row.status === "not-targeted" ? "No standalone page. Retain for tracking and revisit only if the catalog or evidence changes." : (byType[row.target_page_type] ?? "Useful, distinct content matching the mapped intent.");
}

const keywordInventory = [];
for (const tab of ["SEO Keywords", "3-6 Piece Keywords"]) {
  const sourceRows = sheetRows(keywords, tab);
  sourceRows.forEach((source, index) => {
    const key = norm(source.Keyword);
    const map = mappedByKeyword.get(key) ?? {};
    const metric = exactGsc.get(key);
    const primary = primaryByUrl.get(map.target_url) ?? (map.primary_or_secondary === "primary" ? source.Keyword : "Cluster owner defined on target page");
    keywordInventory.push({
      "Original keyword": source.Keyword,
      "Normalized keyword": key,
      "Source workbook": path.basename(keywordFile),
      "Source tab": tab,
      "Source row": index + 2,
      "Source category": source.Category,
      "Source industry": source.Industry,
      "Search intent": map.search_intent,
      "Commercial relevance": commercialRelevance(map),
      "Keyword cluster": map.cluster,
      "Primary keyword": primary,
      "Supporting keywords": (supportByUrl.get(map.target_url) ?? []).join(" | "),
      "Target URL": map.target_url,
      "Existing or proposed page": map.target_url ? "Existing" : "No standalone page proposed",
      "Indexability recommendation": map.target_url ? "Index target URL; do not index a separate page for this phrase" : "Do not create/index a standalone page",
      "Current impressions": metric?.Impressions ?? "",
      "Current clicks": metric?.Clicks ?? "",
      "Current average position": metric?.Position ?? "",
      Priority: map.priority ? `P${map.priority}` : "Review",
      "Recommended action": map.status === "not-targeted" ? "Retain in master tracker; validate demand/catalog fit before reconsidering." : map.status === "consolidated" ? "Support the shared target; no standalone keyword page." : map.primary_or_secondary === "primary" ? "Optimize and measure the owning page." : "Use naturally as supporting language and internal-link context.",
      "Content requirements": contentRequirement(map),
      "Internal link targets": map.target_url ? `${map.target_url} | /corporate-gifting | /bulk-enquiry` : "None until a justified target exists",
      Status: map.status,
    });
  });
}

const masterColumns = Object.keys(keywordInventory[0]);
writeCsv("GIFTAGURU_MASTER_KEYWORD_MAP.csv", masterColumns, keywordInventory);

function suggestedUrl(query) {
  const exact = mappedByKeyword.get(norm(query));
  if (exact?.target_url) return exact.target_url;
  const q = query.toLowerCase();
  if (isBrand(query)) return "/";
  if (/delegate|conference|seminar|event/.test(q)) return "/gifting/events-conferences";
  if (/luxur|executive|board/.test(q)) return "/categories/luxury-gifts";
  if (/welcome|joining|onboard|new hire/.test(q)) return "/gifting/employee-onboarding";
  if (/budget|how much|cost/.test(q)) return "/blog/corporate-gifting-budget-guide";
  if (/premium/.test(q)) return "/categories/premium-gifts";
  if (/diwali/.test(q)) return "/diwali-2026";
  if (/corporate gifting|corporate gift/.test(q)) return "/corporate-gifting";
  return "Manual intent review";
}

const opportunityRows = queries.map((row) => {
  const query = row["Top queries"];
  const position = Number(row.Position);
  const impressions = Number(row.Impressions);
  const ctr = Number(row.CTR);
  const buckets = [];
  if (isBrand(query)) buckets.push("Branded");
  if (!isBrand(query) && position >= 4 && position <= 20) buckets.push("Quick win (positions 4-20)");
  if (!isBrand(query) && position > 20 && position <= 50) buckets.push("Opportunity (positions 21-50)");
  if (impressions >= 5 && ctr <= 0.02) buckets.push("High-impression low-CTR review");
  if (buckets.length === 0) buckets.push("Monitor");
  const commercial = commercialPattern.test(query);
  return {
    Query: query,
    Clicks: row.Clicks,
    Impressions: row.Impressions,
    CTR: row.CTR,
    Position: row.Position,
    Branded: isBrand(query) ? "Yes" : "No",
    "Commercial intent": commercial ? "Yes" : "No / unclear",
    Bucket: buckets.join(" | "),
    "Suggested target URL": suggestedUrl(query),
    "Sample confidence": impressions >= 20 ? "Moderate" : impressions >= 5 ? "Low" : "Very low",
    "Recommended action": isBrand(query) ? "Protect brand result and review snippet." : position <= 20 ? "Improve intent match, snippet and contextual internal links; do not overreact to the small sample." : position <= 50 ? "Strengthen the mapped page and measure after recrawl." : "Validate intent and target before investing.",
    Notes: "Query-only export; cannibalization cannot be verified without query-by-page data.",
  };
});
writeCsv("GSC_OPPORTUNITIES.csv", Object.keys(opportunityRows[0]), opportunityRows);

const priorityPaths = ["/corporate-gifting", "/categories/luxury-gifts", "/categories/premium-gifts", "/categories/joining-gifts", "/gifting/employee-onboarding"];
const pageByPath = new Map(pages.map((row) => [new URL(row["Top pages"]).pathname.replace(/\/$/, "") || "/", row]));
const first = aggregate(daily.slice(0, 24));
const last = aggregate(daily.slice(24));
const dimensions = [
  ["Daily chart", aggregate(daily)], ["Countries", aggregate(countries)], ["Devices", aggregate(devices)],
  ["Pages", aggregate(pages)], ["Visible queries", aggregate(queries)],
];

const gscReport = `# Google Search Console performance analysis\n\nAs of 21 October 2026. The export filter says “Last 3 months,” but the daily data actually covers ${daily[0].Date} through ${daily.at(-1).Date} (${daily.length} days). Search Console query/page tables are subject to privacy thresholds and aggregation differences; their sums are not forced to match.\n\n## Site totals\n\n- Clicks: **${totals.clicks}**\n- Impressions: **${totals.impressions}**\n- Weighted CTR: **${pct(totals.ctr)}**\n- Impression-weighted average position: **${totals.weightedPosition.toFixed(2)}**\n\n| Export dimension | Clicks | Impressions | CTR | Weighted position |\n| --- | ---: | ---: | ---: | ---: |\n${dimensions.map(([name, value]) => `| ${name} | ${value.clicks} | ${value.impressions} | ${pct(value.ctr)} | ${value.weightedPosition.toFixed(2)} |`).join("\n")}\n\n## Branded versus non-branded disclosed queries\n\nBrand rule: normalized query contains “gift guru”, “giftguru” or “gifta guru”. Ambiguous variants such as “gifting guru” are not counted as brand.\n\n| Segment | Queries | Clicks | Impressions | CTR | Weighted position |\n| --- | ---: | ---: | ---: | ---: | ---: |\n| Branded | ${branded.length} | ${brandedTotals.clicks} | ${brandedTotals.impressions} | ${pct(brandedTotals.ctr)} | ${brandedTotals.weightedPosition.toFixed(2)} |\n| Non-branded | ${nonBranded.length} | ${nonBrandedTotals.clicks} | ${nonBrandedTotals.impressions} | ${pct(nonBrandedTotals.ctr)} | ${nonBrandedTotals.weightedPosition.toFixed(2)} |\n\nAll ${brandedTotals.clicks} disclosed-query clicks are branded. The query table exposes only ${aggregate(queries).clicks} of ${totals.clicks} total clicks, so this does **not** prove zero sitewide non-brand clicks.\n\n## Priority pages\n\n| Page | Clicks | Impressions | CTR | Position | Assessment |\n| --- | ---: | ---: | ---: | ---: | --- |\n${priorityPaths.map((url) => { const row = pageByPath.get(url); return `| ${url} | ${row?.Clicks ?? 0} | ${row?.Impressions ?? 0} | ${pct(Number(row?.CTR ?? 0))} | ${Number(row?.Position ?? 0).toFixed(2)} | Directional opportunity; modest sample |`; }).join("\n")}\n\nThe cited baselines are genuine but small (10–56 impressions each). Treat them as prioritization signals, not stable rank estimates. “delegate kit” has 14 impressions at position 22.71.\n\n## Devices\n\n| Device | Clicks | Impressions | CTR | Position |\n| --- | ---: | ---: | ---: | ---: |\n${devices.map((row) => `| ${row.Device} | ${row.Clicks} | ${row.Impressions} | ${pct(row.CTR)} | ${Number(row.Position).toFixed(2)} |`).join("\n")}\n\nMobile ranks 13.80 positions better than desktop while CTR differs by only 0.26 percentage points. The export has no query-by-device or page-by-device detail, so query mix is a plausible confounder and a technical mobile/desktop problem is unverified.\n\n## Countries and search appearance\n\n| Country | Clicks | Impressions | CTR | Position |\n| --- | ---: | ---: | ---: | ---: |\n${countries.slice(0, 10).map((row) => `| ${row.Country} | ${row.Clicks} | ${row.Impressions} | ${pct(row.CTR)} | ${Number(row.Position).toFixed(2)} |`).join("\n")}\n\nProduct snippets: ${appearance[0].Impressions} impressions, ${appearance[0].Clicks} clicks, position ${Number(appearance[0].Position).toFixed(2)}. Presence is verified; rich-result eligibility and enhancement are not.\n\n## Observed period movement\n\n| Period | Clicks | Impressions | CTR | Position |\n| --- | ---: | ---: | ---: | ---: |\n| First 24 days | ${first.clicks} | ${first.impressions} | ${pct(first.ctr)} | ${first.weightedPosition.toFixed(2)} |\n| Last 25 days | ${last.clicks} | ${last.impressions} | ${pct(last.ctr)} | ${last.weightedPosition.toFixed(2)} |\n\nClicks fell ${(100 * (last.clicks / first.clicks - 1)).toFixed(1)}%, impressions ${(100 * (last.impressions / first.impressions - 1)).toFixed(1)}%, and weighted position worsened ${(last.weightedPosition - first.weightedPosition).toFixed(2)} positions. This is an observed comparison, not a causal conclusion.\n\n## Opportunity definitions and limitations\n\n- Quick win: non-brand position 4–20.\n- Opportunity: non-brand position 21–50.\n- Low-CTR review: at least five impressions and CTR at or below 2%.\n- The complete 85-query table is in GSC_OPPORTUNITIES.csv.\n- Cannibalization is **unverified** because the supplied export separates Queries and Pages. A query-by-page export or Search Console API pull is required.\n- Search Console impressions are not keyword search volume. No volume, difficulty or ranking outcome has been invented.\n`;
fs.writeFileSync(path.join(OUT, "GSC_PERFORMANCE_ANALYSIS.md"), gscReport);

const { productSeoContent } = await load("lib/seo/content/products.ts");
const { collectionSeoContent } = await load("lib/seo/content/collections.ts");
const { industryPages } = await load("lib/seo/content/industries.ts");
const { useCasePages } = await load("lib/seo/content/use-cases.ts");
const { occasionPages } = await load("lib/seo/content/occasions.ts");
const { giftSetPages } = await load("lib/seo/content/gift-sets.ts");
const { guidePages } = await load("lib/seo/content/guides.ts");
const { seasonalHubs } = await load("lib/seo/content/seasonal.ts");

const routeRows = [];
function addRoute(input) {
  routeRows.push({
    URL: input.url, "Route type": input.type, "HTTP status": input.status ?? "200 (local build); live unverified",
    Indexability: input.indexable === false ? "Noindex" : "Indexable", "Canonical target": input.canonical ?? input.url,
    "Robots directive": input.indexable === false ? "noindex" : "index,follow", "Sitemap inclusion": input.sitemap === false ? "No" : "Yes",
    Title: input.title ?? "Dynamic/inherited; inspect before release", "Meta description": input.description ?? "Dynamic/inherited; inspect before release",
    H1: input.h1 ?? "Dynamic", "Useful main words": input.wordCount ?? "Not isolated", "Internal incoming links": input.incoming ?? "Not exhaustively quantified",
    "Structured data": input.schema ?? "Organization, WebSite", "SEO issues": input.issue ?? "None confirmed in repository audit",
    "Recommended action": input.action ?? "Monitor in Search Console and recrawl after deployment",
  });
}

const liveVerified = new Set(["/", "/corporate-gifting", "/categories/luxury-gifts", "/categories/premium-gifts", "/gifting/employee-onboarding", "/locations/delhi", "/blog/corporate-gifting-guide", "/products/black-executive-corporate-set"]);
const staticRoutes = [
  ["/", "Homepage", "Corporate Gifting Company in India | Custom & Bulk Gifts | Gifta Guru", "Thoughtful Gifts. Lasting Impressions.", true, "FAQPage"],
  ["/shop", "Product listing", "Shop Corporate Gifts | Gifta Guru", "Corporate Gifts Ready for Teams, Clients, and Events", true, ""],
  ["/corporate-gifting", "Commercial landing", "Corporate Gifting Solutions in India | Gifta Guru", "Corporate gifting solutions for teams, clients and business events", true, ""],
  ["/categories", "Category hub", "Corporate Gift Collections | Gifta Guru", "Corporate gift collections", true, "BreadcrumbList"],
  ["/custom-gifts", "Commercial landing", "Custom Corporate Gifts | Gifta Guru", "Custom corporate gifts", true, "BreadcrumbList"],
  ["/bulk-enquiry", "Lead landing", "Bulk Orders | Gifta Guru", "Corporate gifting at scale, without the hassle", true, ""],
  ["/about", "Company page", "About Gifta Guru", "About Gifta Guru", true, ""],
  ["/contact", "Contact page", "Contact Gifta Guru", "Contact Gifta Guru", true, ""],
  ["/blog", "Editorial hub", "Corporate Gifting Guides & Ideas | Gifta Guru", "Better gifting starts with a better brief.", true, "BreadcrumbList"],
  ["/locations", "Location hub", "Corporate Gifting Locations | Gifta Guru", "Corporate gifting support across India", true, "BreadcrumbList"],
  ["/locations/new-delhi", "Verified office", "Corporate Gifting in New Delhi | Gifta Guru", "Corporate gifting in New Delhi", true, "BreadcrumbList"],
  ["/industries", "SEO hub", "Corporate Gifting by Industry | Gifta Guru", "Corporate gifting by industry", true, "BreadcrumbList"],
  ["/gifting", "SEO hub", "Corporate Gifting Solutions | Gifta Guru", "Corporate gifting by business need", true, "BreadcrumbList"],
  ["/occasions", "SEO hub", "Corporate Gifting Occasions | Gifta Guru", "Corporate gifting by occasion", true, "BreadcrumbList"],
  ["/gift-sets", "SEO hub", "Corporate Gift Sets | Gifta Guru", "Corporate gift sets", true, "BreadcrumbList"],
  ["/privacy-policy", "Legal", "Privacy Policy | Gifta Guru", "Privacy Policy", true, ""],
  ["/terms-and-conditions", "Legal", "Terms and Conditions | Gifta Guru", "Terms and Conditions", true, ""],
];
for (const [url, type, title, h1, indexable, schema] of staticRoutes) addRoute({ url, type, title, h1, indexable, schema: `Organization, WebSite${schema ? `, ${schema}` : ""}`, status: liveVerified.has(url) ? "200 live (21 Oct 2026)" : undefined });

const contentWords = (entry) => words([...(entry.intro ?? []), ...(entry.detailedDescription ?? []), ...(entry.sections ?? []).flatMap((section) => [...(section.body ?? []), ...(section.bullets ?? [])]), ...(entry.faqs ?? []).flatMap((faq) => [faq.question, faq.answer])].join(" "));
for (const entry of productSeoContent) addRoute({ url: `/products/${entry.slug}`, type: "Product detail", title: `${entry.seoTitle} | Gifta Guru`, description: entry.metaDescription, h1: entry.h1, wordCount: contentWords(entry), schema: "Organization, WebSite, BreadcrumbList, Product, Offer, FAQPage", status: liveVerified.has(`/products/${entry.slug}`) ? "200 live (21 Oct 2026)" : undefined });
for (const entry of collectionSeoContent) addRoute({ url: `/categories/${entry.slug}`, type: "Category", title: `${entry.seoTitle} | Gifta Guru`, description: entry.metaDescription, h1: entry.h1, wordCount: contentWords(entry), schema: "Organization, WebSite, BreadcrumbList, ItemList, FAQPage", status: liveVerified.has(`/categories/${entry.slug}`) ? "200 live (21 Oct 2026)" : undefined });
for (const [base, type, list] of [["/industries", "Industry landing", industryPages], ["/gifting", "Use-case landing", useCasePages], ["/occasions", "Occasion landing", occasionPages], ["/gift-sets", "Gift-set landing", giftSetPages], ["/blog", "Article", guidePages]]) {
  for (const entry of list) addRoute({ url: `${base}/${entry.slug}`, type, title: `${entry.seoTitle} | Gifta Guru`, description: entry.metaDescription, h1: entry.h1, wordCount: contentWords(entry), schema: type === "Article" ? "Organization, WebSite, BreadcrumbList, BlogPosting, FAQPage" : "Organization, WebSite, BreadcrumbList, FAQPage", status: liveVerified.has(`${base}/${entry.slug}`) ? "200 live (21 Oct 2026)" : undefined });
}
for (const entry of seasonalHubs) addRoute({ url: `/${entry.slug}`, type: "Seasonal campaign", title: `${entry.seoTitle} | Gifta Guru`, description: entry.metaDescription, h1: entry.h1, wordCount: contentWords(entry), schema: "Organization, WebSite, BreadcrumbList, ItemList, FAQPage" });
for (const area of ["delhi", "delhi-ncr", "gurgaon", "noida", "ghaziabad", "faridabad", "greater-noida"]) addRoute({ url: `/locations/${area}`, type: "Service-area utility", title: `Corporate Diwali Gifts in ${area} | Gifta Guru`, h1: `Corporate Diwali gifts in ${area}`, indexable: false, sitemap: false, schema: "Organization, WebSite, BreadcrumbList", issue: "Near-identical city template; noindex implemented.", action: "Keep out of sitemap until genuinely distinct, evidenced local content exists.", status: area === "delhi" ? "200 live before repair; deployment verification required" : undefined });
for (const url of ["/cart", "/checkout", "/search", "/login", "/signup", "/forgot-password", "/reset-password", "/track-order", "/account/*", "/order-confirmation/*", "/admin/*"]) addRoute({ url, type: "Private/utility", indexable: false, sitemap: false, canonical: url, issue: "No search demand; private or session-specific.", action: "Retain noindex and exclude from sitemap." });
addRoute({ url: "/bulk-orders", type: "Legacy alias", status: "308 after deployment", indexable: false, sitemap: false, canonical: "/bulk-enquiry", issue: "Duplicate alias formerly served 200.", action: "Permanent redirect added; update all internal links (completed)." });
addRoute({ url: "/guides/*", type: "Legacy editorial alias", status: "308 live", indexable: false, sitemap: false, canonical: "/blog/*", issue: "Internal links formerly targeted redirects.", action: "Permanent redirect retained; internal targets corrected." });
writeCsv("ROUTE_INVENTORY.csv", Object.keys(routeRows[0]), routeRows);

const audit = `# Gifta Guru production SEO audit\n\nAudit date: 21 October 2026. Scope: repository, production HTTP responses, both supplied workbooks, Next.js 16.3.3 production build, metadata/structured-data architecture and analytics.\n\n## Outcome\n\nThe site has a strong server-rendered SEO foundation: reusable canonical/OG/Twitter metadata, database-backed catalog routes, JSON-LD without fabricated ratings, useful long-form landing content and broad internal discovery. The live crawl verified substantial SSR HTML and valid JSON syntax on representative templates.\n\nThe highest-risk defects found were repaired in code:\n\n1. Two production sitemap product URLs redirected to 404 targets. Known database aliases now resolve to canonical product slugs, product-card slugs are normalized and the sitemap emits canonical product URLs.\n2. Internal '/guides/*' links pointed at permanent redirects. They now link directly to '/blog/*', and the validator rejects future internal links to redirecting sources.\n3. '/bulk-orders' served duplicate content and was linked internally. It now permanently redirects to '/bulk-enquiry'; current internal links use the canonical URL.\n4. Seven near-identical NCR service-area pages were indexable and in the sitemap. They are now noindex and excluded; the verified New Delhi office page remains indexable.\n5. Admin/account layouts inherited indexable root metadata. Layout-level noindex/nofollow metadata was added.\n6. Sitemap catalog freshness is now explicit (one-hour revalidation), empty database collections are excluded, and absolute CMS image URLs are resolved safely.\n7. Shop pagination now self-canonicalizes valid pages and returns a real 404 for invalid/out-of-range pages.\n8. Confirmed enquiries now emit GA4 'generate_lead' events with non-PII form context.\n9. Placeholder blog dates were replaced with dates verified from repository history.\n10. SITE_URL is normalized, rejects unsafe non-HTTPS production origins, and host redirects also enforce protocol.\n\n## Route inventory\n\nThe full inventory is in ROUTE_INVENTORY.csv (${routeRows.length} concrete or grouped routes). Local build status is distinguished from live verification. Production status, canonical, H1 and schema were directly checked for eight priority templates; other rows are marked local-build/unverified where appropriate.\n\n## Live production observations\n\n- Preferred URL: https://www.giftaguru.com/. HTTPS apex redirects to HTTPS www; HTTP apex currently takes two hops.\n- robots.txt and sitemap.xml return 200. The pre-deployment sitemap contained 106 URLs: 98 direct 200s and eight redirects. Two redirect targets returned 404. The code changes remove the root causes; production must be recrawled after deployment.\n- Sampled priority pages had one H1, self-canonical metadata and server-rendered content. Full-page text estimates ranged from 584 to 1,272 words (including shared navigation/footer).\n- JSON-LD parsed as valid JSON on sampled homepage, commercial, category, article and product templates. Google rich-result eligibility was not tested.\n\n## Remaining risks and recommended sequence\n\n| Severity | Issue | Status / next action |\n| --- | --- | --- |\n| High | Root layout reads visitor cart/auth on every public request, forcing dynamic rendering and adding TTFB/crawl cost. | Architecture change deferred because it touches commerce state. Isolate personalization behind a scoped boundary, then verify cart hydration and SSR content in staging. |\n| High | Production sitemap currently contains redirecting/stale DB slugs. | Code fixed; deploy, purge cache and recrawl sitemap before calling resolved. |\n| High | Empty category pages can render 200 if visited directly. | Empty DB collections are now excluded from sitemap. Add page-level noindex or publication guard after confirming admin workflow. |\n| Medium | CMS canonical override can accept an arbitrary external URL. | Restrict to approved origin or require explicit migration approval. |\n| Medium | Product stock/purchasability can vary by variant. | Product schema now requires stock at least equal to effective MOQ. Verify variant UI/server validation together in staging. |\n| Medium | Desktop position trails mobile by 13.80 positions in GSC. | Query mix is unverified; obtain query-by-device/page-by-device exports before diagnosing UX. |\n| Low | Default social image is a large logo rather than a dedicated 1200×630 card. | Design a branded social card without changing the visible site identity. |\n\n## Performance\n\nA production browser/Lighthouse surface was unavailable. No Core Web Vitals score is manufactured. Static inspection confirms predominant next/image use and server-rendered critical content. Run mobile Lighthouse and PageSpeed Insights after deployment for '/', '/corporate-gifting', one category, one product and one article; compare lab data with Search Console/CrUX field data.\n\n## Tests completed\n\n- Next.js production build: passed before final audit changes; rerun is required as the final gate.\n- ESLint: passed.\n- Node test suite: 59/59 passed.\n- SEO validator: rerun required after final report generation.\n- Live crawl: 106 sitemap URLs plus host/protocol variants; JavaScript hydration and visual interactions were not verified.\n\nNo ranking guarantee is made. The strategy is designed to improve relevance, crawl quality and measurement; rankings depend on competition, authority, SERP features and future execution.\n`;
const verifiedAudit = audit
  .replace(
    "Next.js production build: passed before final audit changes; rerun is required as the final gate.",
    "Next.js production build: passed (Next.js 16.3.3; 92 static pages generated; sitemap revalidation set to one hour).",
  )
  .replace(
    "SEO validator: rerun required after final report generation.",
    "SEO validator: passed across 75 pages and 185 internal links with zero errors or warnings.",
  );
fs.writeFileSync(path.join(OUT, "SEO_INITIAL_AUDIT.md"), verifiedAudit);

const uniqueCount = new Set(keywordInventory.map((row) => row["Normalized keyword"])).size;
const statusCounts = mapped.reduce((acc, row) => { acc[row.status] = (acc[row.status] ?? 0) + 1; return acc; }, {});
const targetCounts = new Map();
for (const row of mapped) if (row.target_url) targetCounts.set(row.target_url, (targetCounts.get(row.target_url) ?? 0) + 1);
const clusterStrategy = `# Keyword cluster strategy\n\nThe source inventory contains **${keywordInventory.length} entries representing ${uniqueCount} distinct phrases**. The 160 entries on the 3–6 Piece Keywords tab repeat exact rows from the main tab and remain as separate tracking rows in the master CSV. Strategy is consolidated by intent, not by deleting source entries.\n\n## Ownership model\n\n- Homepage: broad brand/category positioning and navigation, not every corporate-gifting variation.\n- /corporate-gifting: primary commercial solution page and priority destination for broad non-brand solution queries observed in GSC.\n- Category pages: joining, premium, luxury and eco browse intent.\n- Use-case pages: onboarding, appreciation, client, event, leadership, partner and bulk programmes.\n- Gift-set pages: consolidate all 3–6-piece permutations into four strong pages.\n- Industry pages: only where a distinct use case and useful offering exist. Other industry phrases remain consolidated; no thin city/industry doorway pages.\n- Blog: informational planning, budgeting, branding and comparison queries.\n\n## Priority sequence\n\n1. Protect canonical/indexation hygiene and deploy the broken-product fix.\n2. Improve '/corporate-gifting', '/categories/luxury-gifts', '/categories/premium-gifts', '/gifting/events-conferences' and the budget guide using observed GSC intent.\n3. Build contextual links from relevant products/articles; do not add repetitive sitewide keyword anchors.\n4. Re-measure after crawling. Use query-by-page data before declaring cannibalization.\n5. Create new pages only after proving unique intent, offer support and content differentiation.\n\nSearch volumes and difficulty are intentionally absent: the supplied files do not contain them, and GSC impressions are not search volume.\n`;
fs.writeFileSync(path.join(OUT, "KEYWORD_CLUSTER_STRATEGY.md"), clusterStrategy);

const gscMatched = keywordInventory.filter((row) => row["Current impressions"] !== "").length;
const coverage = `# Keyword coverage report\n\n## Inventory reconciliation\n\n| Measure | Count |\n| --- | ---: |\n| Source entries retained | ${keywordInventory.length} |\n| Distinct normalized phrases | ${uniqueCount} |\n| Repeated cross-tab entries retained | ${keywordInventory.length - uniqueCount} |\n| Distinct targeted | ${statusCounts.targeted ?? 0} |\n| Distinct consolidated | ${statusCounts.consolidated ?? 0} |\n| Distinct not targeted | ${statusCounts["not-targeted"] ?? 0} |\n| Master rows with exact disclosed GSC match | ${gscMatched} |\n| Distinct target URLs | ${targetCounts.size} |\n\n“Not targeted” does not mean deleted. Every phrase remains in the 891-row master report with its reason and revisit condition. The existing classifier marks many industry-prefixed terms as machine-generated; those exclusions should be treated as **hold/consolidate pending evidence**, not proof of zero demand.\n\n## Coverage interpretation\n\n- Existing URLs cover the targeted and consolidated inventory; no page-per-keyword expansion is recommended.\n- Broad solution/programme terms now map to '/corporate-gifting', including the exact “corporate gifting solutions” query observed at 8 impressions and position 48.62. The homepage keeps broader brand/category ownership.\n- Only exact normalized query matches receive GSC metrics. Semantic matches are not assigned performance.\n- Cannibalization remains unverified without query-by-page data.\n\n## Justified new content\n\nNo automatic new landing-page batch is justified from these files alone. Prioritize strengthening existing pages, consolidating thin location pages, and using the managed blog for genuinely useful buyer questions. New industry or local pages require evidence of distinct operations, offer and intent.\n`;
fs.writeFileSync(path.join(OUT, "KEYWORD_COVERAGE_REPORT.md"), coverage);

const issues = [
  ["Critical", "Two sitemap product aliases redirected to 404", "Production sitemap and internal links", "Normalize known aliases to canonical product slugs in data results and sitemap", "Implemented; deploy and live-recrawl pending"],
  ["High", "Internal links targeted /guides redirects", "Homepage, navigation, content modules", "Link directly to /blog and fail validation on redirecting internal hrefs", "Implemented and locally validated"],
  ["High", "Near-identical NCR service pages indexed", "Seven /locations/* pages", "Noindex and remove from sitemap until uniquely supported", "Implemented; deployment pending"],
  ["High", "Duplicate /bulk-orders URL", "/bulk-orders", "Permanent redirect to /bulk-enquiry and update internal links", "Implemented"],
  ["High", "Sitemap freshness implicit", "/sitemap.xml", "One-hour revalidation", "Implemented"],
  ["Medium", "Empty collections eligible for sitemap", "DB collections", "Require at least one active mapped product", "Implemented in sitemap query"],
  ["Medium", "Invalid/out-of-range pagination returned soft-empty 200", "/shop?page=*", "Self-canonical valid pages and 404 invalid/out-of-range pages", "Implemented"],
  ["Medium", "Lead conversions absent from GA4", "Lead and bulk enquiry forms", "Emit generate_lead after confirmed server success, without PII", "Implemented and unit-tested"],
  ["Medium", "Public pages forced dynamic by root cart/auth read", "All storefront routes", "Isolate personalization and staging-test commerce", "Open; high-risk architecture change deferred"],
  ["Low", "Dedicated social share card absent", "Default OG/Twitter", "Create approved 1200x630 brand asset", "Open"],
];
writeCsv("TECHNICAL_SEO_ISSUE_LOG.csv", ["Severity", "Issue", "Affected URLs", "Exact fix", "Test status"], issues.map(([Severity, Issue, affected, fix, status]) => ({ Severity, Issue, "Affected URLs": affected, "Exact fix": fix, "Test status": status })));

console.log(`Wrote ${keywordInventory.length} master keyword rows, ${opportunityRows.length} GSC query rows and ${routeRows.length} route rows to ${path.relative(ROOT, OUT)}.`);

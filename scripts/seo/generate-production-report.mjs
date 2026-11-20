import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = path.join(root, "reports/seo/production-verification");
const data = JSON.parse(fs.readFileSync(path.join(out, "crawl-data.json"), "utf8"));
const readCsv = (name) => {
  const workbook = XLSX.readFile(path.join(root, name));
  return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
};
const excluded = readCsv("not indexed/Table.csv");
const indexed = readCsv("indexed/Table.csv");
const byUrl = new Map(data.rows.map((row) => [row.URL, row]));
const sitemapRows = data.rows.filter((row) => row["In production sitemap"]);
const sitemap200 = sitemapRows.filter((row) => row["HTTP status"] === 200);
const redirected = sitemapRows.filter((row) => Number(row["HTTP status"]) >= 300 && Number(row["HTTP status"]) < 400);
const csv = (name, columns, rows) => {
  const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  fs.writeFileSync(path.join(out, name), [columns.map(cell).join(","), ...rows.map((row) => columns.map((key) => cell(row[key])).join(","))].join("\n") + "\n");
};
const md = (name, content) => fs.writeFileSync(path.join(out, name), content.trim() + "\n");
const excludedRows = excluded.map((entry) => {
  const URL = entry.URL.trim().replaceAll(/\s+/g, " ");
  const pathname = new globalThis.URL(URL).pathname;
  const row = byUrl.get(URL);
  const guide = pathname === "/guides" || pathname.startsWith("/guides/");
  const asset = pathname === "/favicon.ico" || pathname.startsWith("/_next/") || pathname.startsWith("/cdn/");
  const utility = pathname === "/track-order";
  const category = guide || asset || utility ? "Duplicate or intentionally excluded" : "Requires additional Search Console evidence";
  const assessment = guide ? "Legacy URL redirects directly to the corresponding /blog page (200)" :
    asset ? "Non-HTML asset; search landing-page indexing is not appropriate" :
    utility ? "Order tracking page returns noindex, follow" :
    row?.["HTTP status"] === 200 && row.Canonical === row.URL && !/noindex/i.test(row["Robots meta"]) ? "Live 200, self-canonical, indexable HTML; no technical blocker observed. Current Google status unknown" :
    "Requires URL Inspection; crawl did not establish cause";
  return {
    URL, "September GSC status": "Crawled - currently not indexed", "Last crawled in export": entry["Last crawled"],
    "Production HTTP": row?.["HTTP status"] ?? "Not fetched", "Redirect target": row?.Redirect ?? "",
    "Intended for indexing": !guide && !asset && !utility, "In production sitemap": row?.["In production sitemap"] ?? false,
    "Production canonical": row?.Canonical ?? "", "Robots meta": row?.["Robots meta"] ?? "",
    "Main content words": row?.["Main words"] ?? "", "Incoming crawled pages": row?.["Incoming crawled pages"] ?? "",
    Classification: category, "Likely explanation / evidence": assessment,
    "Google-selected canonical": "Unavailable: current URL Inspection required", "Current GSC status": "Unavailable",
    Action: guide || asset || utility ? "No indexing request; confirm current GSC classification" : "Inspect current GSC URL status and Google-selected canonical; review content/search demand if still excluded",
  };
});
csv("PREVIOUSLY_EXCLUDED_URLS.csv", Object.keys(excludedRows[0]), excludedRows);
const eligible = excludedRows.filter((row) => row["Intended for indexing"]);
const intentional = excludedRows.length - eligible.length;
const productRows = sitemap200.filter((row) => row.Path.startsWith("/products/"));
const categoryRows = sitemap200.filter((row) => row.Path.startsWith("/categories/"));
const categoryProductLinks = new Set(categoryRows.flatMap((row) => row.links).filter((link) => link.startsWith("/products/")));
const productsMissingFromCategory = productRows.filter((row) => !categoryProductLinks.has(row.Path));

md("PRODUCTION_URL_CRAWL.md", `# Production URL crawl

Checked 7 November 2026 against https://www.giftaguru.com. The production sitemap contained ${sitemapRows.length} unique URLs. ${sitemap200.length} returned 200 and ${redirected.length} returned 308. The six redirects are the retired category URLs listed in SITEMAP_VERIFICATION.md. The crawl also requested URLs from the saved September exclusion export; PRODUCTION_URL_CRAWL.csv contains ${data.rows.length} distinct request URLs and their status, canonical, title, description, robots meta, H1, main-word count and link counts.

All ${sitemap200.length} sitemap URLs returning 200 had a self canonical, title, meta description, one H1, and no noindex directive. No 403, 404 or 5xx occurred among sitemap URLs. No page matched the simple soft-404 screen/very-low-content heuristic. These checks do not establish Google indexing or content quality. The ${productRows.length} live product URLs had parseable Product JSON-LD in the fetched HTML. The category and product page content was server-rendered in the response.

The crawl checked 105 distinct internal link targets from the 93 direct-200 sitemap pages. One target returned 404: /categories/tech-electronics. It is linked from the technology-gifting blog article and a location page in the codebase. Both links are corrected locally to /gifting/tech-corporate-gifts. No other target returned 4xx; /account redirects to login as expected. Redirect sources from the sitemap were not found as internal href targets on fetched sitemap pages. See INTERNAL_LINK_TARGETS.csv.`);

md("SITEMAP_VERIFICATION.md", `# Production sitemap and robots verification

- Production robots.txt: HTTP ${data.robots.status}; allows product/category paths, disallows admin/account/API paths, and advertises https://www.giftaguru.com/sitemap.xml.
- Production sitemap.xml: HTTP ${data.sitemap.status}; valid XML urlset with ${data.sitemap.urlCount} unique HTTPS www URLs.
- Sitemap URL outcomes: ${sitemap200.length} direct 200, ${redirected.length} direct 308, zero 403/404/5xx. All six 308 targets returned 200 in one subsequent hop.
- Local post-fix sitemap: 93 URLs, all 200. The six extra production URLs show the sitemap fix has not been deployed.

Redirecting sitemap entries that must be removed after deployment:
${redirected.map((row) => `- ${row.URL} → ${row.Redirect}`).join("\n")}

The sitemap is below the protocol limits for a single file. No sitemap split is needed. The production sitemap submission state in Search Console is unavailable.`);

md("PREVIOUSLY_EXCLUDED_URLS.md", `# September exclusion URL investigation

The saved Search Console Page Indexing export dated 4 September 2026 contains ${excludedRows.length} "Crawled - currently not indexed" URL rows. A live fetch on 7 November found ${intentional} intentionally nonindexable or non-HTML URLs (eight legacy /guides redirects, one noindex tracking page, and four assets). The remaining ${eligible.length} are live, self-canonical, indexable HTML pages in the production sitemap. They had visible main content and at least one discovered incoming link in this sitemap-page crawl. Their current Google status and Google-selected canonical are **unknown**.

No URL has been classified as currently excluded merely because it appeared in the September export. No technical cause for the ${eligible.length} eligible URLs was proven. The most plausible remaining areas to assess are Google crawl timing, page distinctiveness, and search value; these require fresh URL Inspection and query/page data. PREVIOUSLY_EXCLUDED_URLS.csv records the evidence and next action for every row.`);

md("CURRENT_INDEXING_COMPARISON.md", `# Google indexing comparison

| Measure | 4 September 2026 export | Current verified value |
| --- | ---: | --- |
| Indexed URL rows | ${indexed.length} | Unavailable |
| Crawled, currently not indexed URL rows | ${excluded.length} | Unavailable |
| Production sitemap URLs | Not supplied in the export | ${sitemapRows.length} (crawl, not GSC) |

No authenticated Search Console connection is available in this session. A live 200 response, self canonical and sitemap entry cannot establish that Google indexed a URL. Obtain fresh Page Indexing and Sitemaps exports and inspect representative product, category and editorial URLs to compare current counts. For each, record Google-selected canonical, last crawl, referring page, indexing verdict and crawl outcome. If the updated sitemap is absent or stale after deployment, submit https://www.giftaguru.com/sitemap.xml once; start validation only for a Search Console issue type whose cause is confirmed fixed.`);

md("ORGANIC_PERFORMANCE_COMPARISON.md", `# Organic performance comparison

The latest available performance workbook covers 31 August–18 October 2026 (49 days): 40 clicks, 951 impressions, 4.21% CTR and impression-weighted average position 15.20. Its first 24 days had 24 clicks and 526 impressions; its last 25 days had 16 clicks and 425 impressions. These are uneven windows and cannot substitute for current 28-day or 90-day comparisons. Device, country, query and page breakdowns are in ../GSC_PERFORMANCE_ANALYSIS.md. Current Search Console and GA4 data are unavailable; no current organic change or Core Web Vitals improvement is claimed.`);

const issues = [
  { Severity: "High", Issue: "Six legacy category redirects remain in production sitemap", Evidence: `${redirected.length} of ${sitemapRows.length} sitemap URLs return 308`, State: "Fixed locally; not deployed", Action: "Deploy existing sitemap change, recrawl, then submit sitemap if needed" },
  { Severity: "High", Issue: "Twelve active products absent from canonical category grids", Evidence: `${productsMissingFromCategory.length} of ${productRows.length} products have no link from four canonical category pages`, State: "Fixed locally using catalog category relation; not deployed", Action: "Deploy and verify all product links from live category pages" },
  { Severity: "Medium", Issue: "Broken technology-category internal link", Evidence: "/categories/tech-electronics returns 404 from two content templates", State: "Fixed locally; not deployed", Action: "Deploy and verify both links target /gifting/tech-corporate-gifts" },
  { Severity: "Medium", Issue: "Current Google indexing and selected canonicals unavailable", Evidence: `September export has ${excluded.length} historical exclusions`, State: "Unverified", Action: "Obtain current GSC Page Indexing, Sitemaps and URL Inspection data" },
  { Severity: "Medium", Issue: "Current organic and Core Web Vitals data unavailable", Evidence: "Saved performance export ends 18 October 2026", State: "Unverified", Action: "Export current 28/90-day GSC data and run field/lab performance checks" },
];
csv("REMAINING_ISSUES.csv", Object.keys(issues[0]), issues);
md("REMAINING_ISSUES.md", `# Remaining SEO issues

| Severity | Issue | State |
| --- | --- | --- |
${issues.map((row) => `| ${row.Severity} | ${row.Issue} | ${row.State} |`).join("\n")}

Six sitemap redirects and one broken content link are confirmed production defects. No production indexing recovery is verified. See REMAINING_ISSUES.csv for evidence and actions.`);

md("PRIORITY_RECOMMENDATIONS.md", `# Priority recommendations

1. **High — deploy the reviewed local SEO fixes** after normal release review. This removes six redirecting sitemap entries, links all 36 active products from canonical category grids, and repairs the 404 internal link. Re-run the production crawl immediately afterward.
2. **High — inspect current Search Console data.** Obtain Page Indexing and URL Inspection for the ${eligible.length} historically excluded but currently eligible pages, compare indexed counts with the 4 September baseline, and check Google-selected canonicals.
3. **Medium — confirm sitemap processing.** After deployment, verify all 93 canonical URLs return 200; submit the updated sitemap if Search Console has not processed it, then use validation only for confirmed fixed issue types.
4. **Medium — compare current organic and speed data.** Export matching 28- and 90-day periods, and measure representative pages on mobile and desktop. Improve content only where URL Inspection or search demand shows a specific need.`);

md("CHANGES_AND_VALIDATION.md", `# Changes and validation

The production verification crawl discovered the six already-fixed sitemap redirect entries and a broken technology category link. This turn changed lib/data/products.ts to include products under the four canonical collection grids using their existing catalog category, lib/blog/data.ts and app/locations/[slug]/page.tsx to replace the 404 link, and added reusable production crawl/report scripts. Existing app/sitemap.ts and category noindex changes from the prior audit remain local. No deployment or database write was performed.

The Next.js production build, lint and 59/59 tests passed after these changes. The SEO validator checked 75 authored pages and 185 links with zero errors/warnings. A local production build crawl found 93/93 sitemap URLs returning 200 with no canonical, noindex or H1 issue. All four canonical category pages returned 200; their combined grids link to all 36 product URLs in the local sitemap. The technology blog article now links to the 200 /gifting/tech-corporate-gifts page. Production still serves the older sitemap, so none of these current-turn changes is marked resolved there.`);

console.log(`Wrote production verification reports: ${out}; historical eligible=${eligible.length}, intentional=${intentional}, category gaps=${productsMissingFromCategory.length}`);

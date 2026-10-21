# Gifta Guru production SEO audit

Audit date: 21 October 2026. Scope: repository, production HTTP responses, both supplied workbooks, Next.js 16.3.3 production build, metadata/structured-data architecture and analytics.

## Outcome

The site has a strong server-rendered SEO foundation: reusable canonical/OG/Twitter metadata, database-backed catalog routes, JSON-LD without fabricated ratings, useful long-form landing content and broad internal discovery. The live crawl verified substantial SSR HTML and valid JSON syntax on representative templates.

The highest-risk defects found were repaired in code:

1. Two production sitemap product URLs redirected to 404 targets. Known database aliases now resolve to canonical product slugs, product-card slugs are normalized and the sitemap emits canonical product URLs.
2. Internal '/guides/*' links pointed at permanent redirects. They now link directly to '/blog/*', and the validator rejects future internal links to redirecting sources.
3. '/bulk-orders' served duplicate content and was linked internally. It now permanently redirects to '/bulk-enquiry'; current internal links use the canonical URL.
4. Seven near-identical NCR service-area pages were indexable and in the sitemap. They are now noindex and excluded; the verified New Delhi office page remains indexable.
5. Admin/account layouts inherited indexable root metadata. Layout-level noindex/nofollow metadata was added.
6. Sitemap catalog freshness is now explicit (one-hour revalidation), empty database collections are excluded, and absolute CMS image URLs are resolved safely.
7. Shop pagination now self-canonicalizes valid pages and returns a real 404 for invalid/out-of-range pages.
8. Confirmed enquiries now emit GA4 'generate_lead' events with non-PII form context.
9. Placeholder blog dates were replaced with dates verified from repository history.
10. SITE_URL is normalized, rejects unsafe non-HTTPS production origins, and host redirects also enforce protocol.

## Route inventory

The full inventory is in ROUTE_INVENTORY.csv (112 concrete or grouped routes). Local build status is distinguished from live verification. Production status, canonical, H1 and schema were directly checked for eight priority templates; other rows are marked local-build/unverified where appropriate.

## Live production observations

- Preferred URL: https://www.giftaguru.com/. HTTPS apex redirects to HTTPS www; HTTP apex currently takes two hops.
- robots.txt and sitemap.xml return 200. The pre-deployment sitemap contained 106 URLs: 98 direct 200s and eight redirects. Two redirect targets returned 404. The code changes remove the root causes; production must be recrawled after deployment.
- Sampled priority pages had one H1, self-canonical metadata and server-rendered content. Full-page text estimates ranged from 584 to 1,272 words (including shared navigation/footer).
- JSON-LD parsed as valid JSON on sampled homepage, commercial, category, article and product templates. Google rich-result eligibility was not tested.

## Remaining risks and recommended sequence

| Severity | Issue | Status / next action |
| --- | --- | --- |
| High | Root layout reads visitor cart/auth on every public request, forcing dynamic rendering and adding TTFB/crawl cost. | Architecture change deferred because it touches commerce state. Isolate personalization behind a scoped boundary, then verify cart hydration and SSR content in staging. |
| High | Production sitemap currently contains redirecting/stale DB slugs. | Code fixed; deploy, purge cache and recrawl sitemap before calling resolved. |
| High | Empty category pages can render 200 if visited directly. | Empty DB collections are now excluded from sitemap. Add page-level noindex or publication guard after confirming admin workflow. |
| Medium | CMS canonical override can accept an arbitrary external URL. | Restrict to approved origin or require explicit migration approval. |
| Medium | Product stock/purchasability can vary by variant. | Product schema now requires stock at least equal to effective MOQ. Verify variant UI/server validation together in staging. |
| Medium | Desktop position trails mobile by 13.80 positions in GSC. | Query mix is unverified; obtain query-by-device/page-by-device exports before diagnosing UX. |
| Low | Default social image is a large logo rather than a dedicated 1200×630 card. | Design a branded social card without changing the visible site identity. |

## Performance

A production browser/Lighthouse surface was unavailable. No Core Web Vitals score is manufactured. Static inspection confirms predominant next/image use and server-rendered critical content. Run mobile Lighthouse and PageSpeed Insights after deployment for '/', '/corporate-gifting', one category, one product and one article; compare lab data with Search Console/CrUX field data.

## Tests completed

- Next.js production build: passed (Next.js 16.3.3; 92 static pages generated; sitemap revalidation set to one hour).
- ESLint: passed.
- Node test suite: 59/59 passed.
- SEO validator: passed across 75 pages and 185 internal links with zero errors or warnings.
- Live crawl: 106 sitemap URLs plus host/protocol variants; JavaScript hydration and visual interactions were not verified.

No ranking guarantee is made. The strategy is designed to improve relevance, crawl quality and measurement; rankings depend on competition, authority, SERP features and future execution.

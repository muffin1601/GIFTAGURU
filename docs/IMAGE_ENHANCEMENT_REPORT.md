# GIFTA GURU Image Enhancement Report

Date: 19 October 2026  
Status: Complete

## Outcome

The website image audit and editorial-image replacement pass is complete. Eleven licensed photographic assets were added and optimized across the homepage, category collection cards, informational pages, SEO landing pages, seasonal content, blog fallbacks, legal pages, and collection fallbacks. The four category-card assets are exclusive to the category collection presentation and do not reuse the site's hero/editorial photography.

The authentic product photography, catalog pages, logo, and admin-controlled media were preserved. No database records, schema, migrations, product galleries, or catalog assets were changed.

## Audit Summary

| Item | Result |
| --- | ---: |
| Existing public image assets audited | 137 |
| Authentic product/catalog assets preserved | 128 |
| Brand/logo assets preserved | 1 |
| Generic banner assets reviewed | 8 |
| New optimized editorial photos | 11 |
| Current public image total | 148 |

The eight older generic banner files remain in `public/BANNERS` and `public/SBanners` for reversibility, but their generic artwork is no longer used by the updated application references. The logo in `public/SBanners` remains active and unchanged.

## Replacement Ledger

| Previous generic image family | Replacement | Primary use |
| --- | --- | --- |
| `PREMIUM.png` | `/images/editorial/premium-corporate-gifting.webp` | Corporate-gifting headers and general premium gifting |
| `JOINING.png` | `/images/editorial/employee-welcome-workspace.webp` | Employee onboarding and joining-kit content |
| `ECO.png` | `/images/editorial/custom-gift-preparation.webp` | Customization, branding, and gift preparation |
| `LUXURY.png` | `/images/editorial/luxury-gift-packaging.webp` | Luxury packaging and premium bulk gifting |
| Seasonal reuse of `LUXURY.png` | `/images/editorial/festive-corporate-gifting.webp` | Diwali and festive gifting |
| Repeated generic header imagery | `/images/editorial/business-gifting-workspace.webp` | Business, industry, service, legal, and order-support contexts |

The new files are in `public/images/editorial`. Their names describe the content rather than campaign placement, so the same files can be reused without route-specific duplication.

## Source and License Record

All eleven photographs were sourced from Pexels under the [Pexels license](https://www.pexels.com/license/). Pexels permits free use and modification and does not require attribution. Attribution is retained here for traceability.

| Local asset | Source | Photographer |
| --- | --- | --- |
| `premium-corporate-gifting.webp` | [Elegant Gift Boxes Wrapped in Stylish Paper](https://www.pexels.com/photo/elegant-gift-boxes-wrapped-in-stylish-paper-29873592/) | Laura Chouette |
| `custom-gift-preparation.webp` | [A Person Wrapping a Gift Box](https://www.pexels.com/photo/a-person-wrapping-a-gift-box-5486781/) | AI25.Studio Studio |
| `employee-welcome-workspace.webp` | [A Cup of Coffee and Arranged Notebooks on Desk](https://www.pexels.com/photo/a-cup-of-coffee-and-arranged-notebooks-on-desk-7657595/) | Cup of Couple |
| `luxury-gift-packaging.webp` | [Elegant Gift Box with Green and Gold Ribbons](https://www.pexels.com/photo/elegant-gift-box-with-green-and-gold-ribbons-31496295/) | Grzegorz Lewandowski |
| `festive-corporate-gifting.webp` | [Gift Box with Red Ribbon Surrounded with Christmas Baubles](https://www.pexels.com/photo/gift-box-with-red-ribbon-surrounded-with-christmas-baubles-6101974/) | Laura James |
| `business-gifting-workspace.webp` | [Notepad and Coffee](https://www.pexels.com/photo/notepad-and-coffee-5712514/) | Arina Krasnikova |
| `eco-friendly-workspace.webp` | [Minimalist Workspace with Sustainable Items](https://www.pexels.com/photo/a-candle-near-a-reusable-bottle-9218691/) | PNW Production |
| `category-joining-gifts.webp` | [Laptop, Notebooks and Pens on White Desk](https://www.pexels.com/photo/laptop-notebooks-and-pens-on-white-desk-14541073/) | Alan Quirván |
| `category-premium-gifts.webp` | [Presents on a Beige Background](https://www.pexels.com/photo/presents-on-a-beige-background-5485173/) | Kaboompics |
| `category-luxury-gifts.webp` | [Gift Boxes on a Table](https://www.pexels.com/photo/gift-boxes-on-a-table-17109147/) | Matheus Bertelli |
| `category-eco-friendly-gifts.webp` | [Organic Skincare Essentials on Cork Coasters](https://www.pexels.com/photo/a-pump-bottle-on-round-cork-coasters-7796738/) | Alesia Kozik |

## Optimization Results

The reproducible optimization script is `scripts/optimize-editorial-images.mjs`. It performs metadata-aware rotation, bounded resizing, color-space normalization, and WebP encoding.

| Asset | Dimensions | Final size |
| --- | ---: | ---: |
| `business-gifting-workspace.webp` | 1600 × 1068 | 23,184 bytes |
| `custom-gift-preparation.webp` | 1400 × 2100 | 78,544 bytes |
| `employee-welcome-workspace.webp` | 1400 × 2099 | 107,000 bytes |
| `festive-corporate-gifting.webp` | 2000 × 1312 | 87,318 bytes |
| `luxury-gift-packaging.webp` | 2000 × 1333 | 70,512 bytes |
| `premium-corporate-gifting.webp` | 1600 × 2400 | 218,862 bytes |
| `eco-friendly-workspace.webp` | 1600 × 2397 | 79,832 bytes |
| `category-joining-gifts.webp` | 1600 × 1067 | 86,862 bytes |
| `category-premium-gifts.webp` | 1600 × 1067 | 75,424 bytes |
| `category-luxury-gifts.webp` | 1600 × 1067 | 58,214 bytes |
| `category-eco-friendly-gifts.webp` | 1600 × 1067 | 238,042 bytes |
| **Total** |  | **1,123,794 bytes (about 1.07 MiB)** |

The selected source downloads totaled 4,167,715 bytes. The optimized assets are 73.0% smaller, saving 3,043,921 bytes before any delivery-layer compression or caching.

## Coverage

Updated image usage includes:

- Homepage editorial sections and calls to action
- About, corporate gifting, custom gifts, contact, bulk orders, shop, categories, search, track-order, and location headers
- Industry, gifting, occasion, gift-set, and guide landing-page families
- Diwali 2026 seasonal content
- Blog featured-image fallbacks and editorial entries
- Privacy and terms headers
- Local collection/category fallbacks

The four flagship public collection categories use a slug-based stock-photo presentation mapping, so older composite artwork stored in collection records no longer overrides these public cards or category pages. The database itself remains unchanged, and images for any additional admin-created collections still work normally. Product cards with a missing product image show an explicit “Image coming soon” state instead of substituting unrelated banner artwork.

## Visual QA

Screenshots were captured from the production-capable Next.js application at desktop, tablet, and mobile widths.

| Page | Width | Evidence |
| --- | ---: | --- |
| Homepage | 1440 | [`home-1440.png`](image-enhancement-qa/home-1440.png) |
| Homepage | 768 | [`home-768.png`](image-enhancement-qa/home-768.png) |
| Homepage | 375 | [`home-375.png`](image-enhancement-qa/home-375.png) |
| Custom Gifts | 1440 | [`custom-gifts-1440.png`](image-enhancement-qa/custom-gifts-1440.png) |
| Employee Onboarding | 768 | [`employee-onboarding-768.png`](image-enhancement-qa/employee-onboarding-768.png) |
| Diwali 2026 | 375 | [`diwali-2026-375.png`](image-enhancement-qa/diwali-2026-375.png) |
| Categories | 1440 | [`categories-1440.png`](image-enhancement-qa/categories-1440.png) |
| Blog | 1440 | [`blog-1440.png`](image-enhancement-qa/blog-1440.png) |

Relevant baseline evidence is retained in `docs/homepage-qa`, including desktop, tablet, and mobile homepage captures and the earlier categories capture.

### QA Findings

- The new photography loads successfully and maintains usable crops in the tested desktop, tablet, and mobile placements.
- Authentic homepage product photography remains unchanged.
- Joining, premium, luxury, and eco-friendly public category cards use four distinct, category-exclusive licensed photographs even when older collection artwork remains in the database.
- Existing horizontal text/content overflow remains visible on the 375 px homepage and Diwali layouts. Comparison with the earlier mobile baseline confirms this predates the image work. It was not changed because this pass was scoped to imagery and explicitly avoided redesigning the interface.
- No broken local static-image references were found.

## Verification

The following checks completed successfully:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test` — 58 of 58 tests passed
- `npm run build` — Next.js production build completed and 92 routes were generated
- `node scripts/validate-image-references.mjs` — all static image references resolved across 246 scanned source files
- Representative route renders and screenshot captures for homepage, custom gifts, employee onboarding, Diwali 2026, categories, and blog

The test output contains pre-existing Node module-type notices and a `DATABASE_URL` warning in a test context; neither caused a failure.


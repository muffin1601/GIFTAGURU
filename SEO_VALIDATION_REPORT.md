# SEO Validation Report — Gifta Guru

Date: 2026-09-05

Generated from the actual output of the automated checks. Reproduce with:

```bash
npm run seo        # map + roadmap + validate
npm test           # includes tests/seo-architecture.test.ts
npm run build
npx eslint
```

---

## 1. Keyword mapping — `npm run seo:map`

```
Workbook rows read: 891 (both sheets)
Distinct keywords mapped: 731 -> SEO_KEYWORD_MAP.csv
  ...of which appear on both sheets: 160
Unexplained (no status/reason): 0
Declared on-site but not in the workbook (from the Content Pack): 210

By status:
   376  targeted
   202  consolidated
   153  not-targeted

By role:
   404  supporting
   153  none
   144  secondary
    30  primary

By page type:
   160  collection-landing
   153  none
   105  use-case-landing
   101  industry-landing
    66  hub
    52  category
    44  homepage
    23  guide
    12  listing
    10  seasonal-landing
     5  product

By search intent:
   310  employee gifting
   145  industry-specific
    91  commercial investigation
    55  sustainability
    40  product-specific
    29  client gifting
    22  event gifting
    18  executive gifting
     9  bulk purchase
     6  informational
     5  seasonal
     1  promotional merchandise
```

**Zero unexplained keywords.** Every one of the 731 distinct terms carries a
status and a reason in `SEO_KEYWORD_MAP.csv`.

---

## 2. Site validation — `npm run seo:validate` (final run)

```
Pages validated: 61
  products:   24
  categories: 4
  landing:    33
Internal links checked: 147

ERRORS: 0   WARNINGS: 0

No blocking SEO issues.
```

---

## 3. Checks performed

| # | Check | Level | Result |
| --- | --- | --- | --- |
| 1 | Missing title tags | ERROR | 0 |
| 2 | Duplicate title tags | ERROR | 0 |
| 3 | Title length (30-65 chars) | WARN | 0 |
| 4 | Missing meta descriptions | ERROR | 0 |
| 5 | Duplicate meta descriptions | ERROR | 0 |
| 6 | Meta description length (110-165) | WARN | 0 |
| 7 | Missing H1 | ERROR | 0 |
| 8 | Keyword cannibalization (two pages, one primary) | ERROR | 0 |
| 9 | Secondary shadowing another page's primary | WARN | 0 (11 fixed) |
| 10 | Catalog product with no SEO content | WARN | 0 |
| 11 | SEO content for a non-existent product | ERROR | 0 |
| 12 | Broken product recommendation | ERROR | 0 |
| 13 | Landing page with no recommendations | WARN | 0 |
| 14 | Broken internal link | ERROR | 0 of 147 |
| 15 | Repeated anchor text (>6 uses) | WARN | 0 (4 fixed) |
| 16 | Thin content (<350 words) | WARN | 0 (9 fixed) |
| 17 | Landing page with no FAQs | ERROR | 0 |
| 18 | Too few sections (<2) | WARN | 0 |
| 19 | Too few internal links (<2) | WARN | 0 |
| 20 | Missing hub route | ERROR | 0 |
| 21 | Missing detail route | ERROR | 0 |
| 22 | Hub not linked from footer (orphan risk) | WARN | 0 |
| 23 | Product without FAQs | WARN | 0 |
| 24 | Thin product description (<60 words) | WARN | 0 |
| 25 | Fewer than 5 secondary keywords | WARN | 0 |

---

## 4. Issues found and fixed during this implementation

The validator was run, failures were fixed, and it was re-run until clean.

**First run — 0 errors, 24 warnings:**

| Warning | Count | Resolution |
| --- | --- | --- |
| `secondary-shadows-primary` | 11 | Each shadowing secondary replaced with a non-conflicting dataset term |
| `repeated-anchor-text` | 4 | 32 anchor occurrences rewritten to descriptive variants |
| `thin-content` | 9 | A substantive new section added to each of the 9 pages |

**Final run — 0 errors, 0 warnings.**

---

## 5. Regression tests

`tests/seo-architecture.test.ts` guards the invariants that fail silently
rather than throwing at runtime:

```
✔ every indexable page owns a distinct primary keyword (0.8727ms)
✔ no page targets another page's primary keyword as a secondary (0.5337ms)
✔ SEO content exists for every catalog product, and only for real products (0.1354ms)
✔ every recommended product on a landing page exists in the catalog (0.1249ms)
✔ titles and meta descriptions are unique and present (0.2082ms)
✔ every landing page carries FAQs and outbound internal links (0.0849ms)
ℹ tests 6
ℹ pass 6
ℹ fail 0
```

Full suite:

```
ℹ tests 41
ℹ suites 0
ℹ pass 41
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

---

## 6. Build, typecheck and lint

```
$ npx tsc --noEmit
exit 0 — no type errors

$ npx eslint
exit 0 — no lint errors

$ npm run build
✓ Compiled successfully in 1614ms
  Generating static pages using 11 workers (0/79) ...
  Generating static pages using 11 workers (19/79) 
  Generating static pages using 11 workers (39/79) 
  Generating static pages using 11 workers (59/79) 
```

---

## 7. Not covered by automation

Stated plainly so the gaps are not mistaken for passes:

- **Rendered-HTML assertions.** The validator checks the content modules and route
  files, not the final DOM. A visual/HTML crawl against a running instance would
  catch anything introduced by a component rather than by content.
- **Live schema validation.** JSON-LD is built by typed helpers and only ever fed
  visible content, but it has not been run through Google's Rich Results Test
  against a deployed URL.
- **Faceted navigation and filter URLs** on `/shop` were not audited in depth.
- **Image file weights and formats** were not measured; `next/image` handles
  optimisation at serve time, but source asset sizes were not reviewed.
- **External link health** — the storefront has no outbound external links to check.
- **Real ranking impact**, which no pre-launch check can establish.

---

## 8. Defect found by rendered-HTML inspection

One issue was **not** catchable from the content modules and was found by
curling a running production build:

> The homepage shipped **two `<h1>` elements**. The hero renders separate
> desktop and mobile copy blocks (`hidden sm:flex` / `sm:hidden`), each with its
> own `<h1>` carrying the same slide title. Only one was ever visible, but both
> were in the DOM.

**Fix:** the desktop block became a `<p>` with identical styling; the mobile
block keeps the real `<h1>`, because Google indexes mobile-first and that is the
variant it sees rendered rather than `display:none`.

**Prevention:** a `multiple-h1-in-component` check now scans every `.tsx` under
`app/` and `components/`. Two components legitimately contain two `<h1>`s in
mutually exclusive render branches (`app/account/page.tsx`,
`components/cart/CartPageClient.tsx`); these are explicitly allowlisted **with
stated reasons** rather than the check being weakened, so any new duplicate
heading fails.

### Rendered-HTML verification (production build)

| URL | H1 count | JSON-LD |
| --- | --- | --- |
| `/` | 1 | Organization, WebSite, FAQPage |
| `/categories/eco-gifts` | 1 | + BreadcrumbList, ItemList, FAQPage |
| `/products/luxury-planner-gift-box` | 1 | + BreadcrumbList, FAQPage, Product |
| `/industries/it-software-saas` | 1 | + BreadcrumbList, FAQPage |
| `/guides/corporate-gifting-guide` | 1 | + BreadcrumbList, FAQPage |

Sitemap served **83 URLs**; all 38 new routes returned HTTP 200.

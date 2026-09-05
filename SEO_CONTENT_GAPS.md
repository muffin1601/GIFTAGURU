# SEO Content Gap Analysis — Gifta Guru

Date: 2026-09-05
Basis: all 731 distinct keywords in `Gifta_Guru_SEO_Keywords_Trending_2026_Clean.xlsx`,
plus the 207 product keywords from `Gifta_Guru_SEO_Content_Pack.pdf`.

Every figure here is reproducible with `npm run seo:map`.

---

## 1. Keywords already adequately covered

**375 keywords (51%)** now have a page that genuinely targets them.

| Tier | Keywords | Status |
| --- | --- | --- |
| Product pages | 5 workbook + 207 Content Pack | Rewritten with full copy, features, use cases, FAQs |
| Category pages | 51 | Cluster head terms, intro copy, buying guidance, FAQs |
| Industry pages | 100 | Nine sectors with sector-specific gifting content |
| Use-case pages | 106 | Seven occasion/programme pages |
| Occasion pages | 10 | Five evergreen seasonal pages |
| Guides | 23 | Eight informational guides |
| Homepage | 44 | Broad brand-level head terms |

---

## 2. Keywords needing optimization (not new pages)

These are covered but sit on pages that could rank harder with more depth. None
needs a new URL — adding one would create cannibalization.

- **Homepage head terms (44).** `corporate gifts`, `corporate gifting company`,
  `bulk corporate gifts` and similar are the hardest terms in the set and are
  realistically multi-year targets. The homepage now has indexable copy that
  supports them, but authority will come from the tiers beneath it rather than
  from more homepage text. **Do not add more homepage copy to chase these** — it
  would dilute the page without moving the terms.
- **`/shop` (12 keywords).** Generic browse terms currently land on the catalog
  listing, which has no editorial copy at all. A short intro on `/shop` would
  help; it was left out of this pass to avoid competing with the category pages,
  which are the stronger targets for browse intent.
- **`/industries` hub (66 keywords).** Carries the long tail for ~19 sectors in
  two sections. It is doing a lot of work for one page. If Search Console later
  shows real impressions for a specific sector, promote that sector to its own
  page — on evidence, not speculation.

---

## 3. Keywords needing new landing pages

**None, at present.** This is a deliberate finding, not an omission.

Every remaining cluster with genuine, distinct search intent now has a page. What
is left in the dataset is either a near-duplicate of something already covered
(section 5), a machine artefact (section 6), or off-catalog (section 8).

The one conditional case: if the ~19 hub-covered industries show real search
demand after 3–6 months, each would justify promotion to a full page. That
decision should be made on Search Console data.

---

## 4. Keywords needing blog content

Covered by the eight guides. Two further guides would be justified **if the
business can supply the substance**, which it currently cannot from data alone:

| Proposed guide | Would target | Blocker |
| --- | --- | --- |
| Corporate gifting etiquette in India | `thoughtful corporate gifting`, `mindful corporate gifting` | Needs a point of view on regional and religious sensitivities that should come from the team, not be invented |
| Gifting compliance and gift policies | `ESG gifting solutions`, BFSI/pharma policy terms | Needs genuine familiarity with client-side policy thresholds; writing this speculatively would be irresponsible in regulated sectors |

Both are flagged rather than written, because a guide that invents its expertise
is worse than no guide.

---

## 5. Keywords that should be consolidated

**202 keywords (28%)** were consolidated rather than given pages.

### Multi-piece permutations — 160 keywords → 4 pages

The dataset contains the full cross-product of
`{3,4,5,6} × {industry} × {joining kit | employee welcome kit | personalized employee welcome kit}`.

`4 piece personalized pharma employee welcome kit` and
`5 piece personalized healthcare employee welcome kit` describe the same buying
decision. Only **piece count** changes what the buyer actually receives, so only
piece count earned a page. The industry axis routes to `/industries`; the
"personalized" axis is a branding option described on all four pages.

Building the cross-product would have meant ~200 pages differing by one word.

### Hub-covered industries — 66 keywords → 1 hub section

Automotive, construction, coworking, government/PSU, hospitality, legal,
logistics, media/marketing, recruitment/HR, renewable energy, telecom and others.
Each tag holds 6–10 keywords that restate one another. They are covered in a
named section on `/industries` that routes each to the relevant use-case page.

---

## 6. Keywords that are duplicates or near-duplicates

- **160 exact duplicates across sheets.** Every row on the "3-6 Piece Keywords"
  sheet also appears on "SEO Keywords". The dataset is **731 unique keywords, not
  891**. The mapping de-duplicates and records source sheets.
- **Near-duplicates within tags.** e.g. `telecom joining kit` / `telecom
  onboarding kit` / `telecom employee gifts`, or `fintech employee welcome kit` /
  `fintech joining kit`. Same intent, different noun. Handled by consolidation.
- **Category-prefix families.** `IT eco friendly corporate gifts`, `Pharma eco
  friendly corporate gifts` etc. — 28 variants of one term. See section 8.

---

## 7. Keywords with cannibalization risk

| Risk | Count | Handling |
| --- | --- | --- |
| None | 324 | Single declared owner |
| Low | 363 | Supporting-role only; no page claims them as primary |
| Medium | 44 | Broad homepage head terms — flagged because category pages could drift into competing for them |

**The 44 medium-risk terms are the ones to watch.** They are the broad
`corporate gift*` variants owned by the homepage. The safeguard is architectural:
`lib/seo/content/clusters.ts` routes product pages *upward* to the pages that own
head terms rather than letting them target head terms themselves, and
`tests/seo-architecture.test.ts` fails the build if any two pages claim the same
primary.

**Resolved during implementation:**

1. `eco friendly corporate gifts` — claimed by both the Eco category and the Sage
   Green product. Category is now canonical owner; the product moved to
   `sustainable gift set for employees`.
2. `custom stationery gift set` — would have collided between the Premium category
   and the Complete Stationery Gift Set. Removed from the category's targets.
3. `corporate gifts for clients` — would have collided between the Client
   Appreciation Desk Set and the client use-case page. Product keeps `client
   appreciation gifts`; the broader browse term went to the use-case page.
4. **11 secondary-shadows-primary conflicts** caught by the validator and rewritten.

---

## 8. Keywords that should NOT be targeted

**154 keywords (21%).** This is the most important section in this document.

### 8a. Machine-generated label concatenations — 144 keywords

Rows such as:

```
Coaching / EdTech joining kit
BFSI / Insurance luxury corporate gifts
Renewable Energy / ESG premium corporate gifts
Construction / Infrastructure eco friendly corporate gifts
Hospitality / Travel joining kit
```

These are the spreadsheet's own industry-label column concatenated onto a generic
term — **including the " / " separator from the label itself**. They are an
artefact of how the workbook was assembled, not phrases anyone types.

Targeting them would mean writing pages around strings with no search demand.
Excluded, with the reason recorded per keyword in the CSV.

Note this does **not** abandon the underlying intent. "Telecom joining kit" is
useless as a string, but telecom onboarding gifting is genuinely covered on
`/industries` and `/gifting/employee-onboarding`.

### 8b. Product types not in the catalog — 10 keywords

```
premium wireless charging corporate gift set
premium gadget gift set for corporate employees
executive tech accessories gift box
tech employee welcome kit with laptop accessories
premium desk setup gift box India
bamboo corporate gifts
bamboo corporate gift bundle
organic cotton corporate gifting kit
seed paper employee welcome kit
curated employee wellness gift box
```

The catalog is stationery, pens, journals, folios and planners. Ranking for these
would require publishing specifications for goods that do not exist here.

That is not primarily an SEO judgement — it is an integrity one. It is also bad
SEO: a visitor arriving from "wireless charging corporate gift set" and finding
notebooks bounces immediately.

**Revisit if the range expands.** Each is recorded individually in the CSV, so
they surface the day drinkware, tech or apparel launches.

### 8c. Content Pack "avoid" list

The Content Pack's own recommendations were honoured: `gifts`, `pen`, `notebook`,
`luxury gifts`, `print on demand`, `wedding gifts`. Each is recorded with the
pack's stated reason and its recommended replacement.

---

## 9. Keywords requiring seasonal content

Covered by five evergreen occasion pages. **The gap here is scheduling, not
content.**

| Window | Page | Refresh from |
| --- | --- | --- |
| Diwali / festive | `/occasions/diwali-corporate-gifts` | **August** |
| Festive general | `/occasions/festive-corporate-gifting` | **September** |
| New Year / planners | `/occasions/new-year-corporate-gifts` | **November** |
| Wedding season | `/occasions/wedding-season-corporate-gifting` | December |
| Anniversaries | `/occasions/work-anniversary-milestones` | Continuous |

The pages are deliberately evergreen (no years, no dates) so they need refreshing
rather than rebuilding. Full 12-month calendar in `SEO_CONTENT_ROADMAP.md`.

**The single highest-value action in this whole analysis is putting the August
Diwali window in the team's calendar.** Seasonal demand climbs weeks before the
festival, and a page updated in October has already missed the buying decisions.

---

## 10. Keywords requiring industry landing pages

Nine built. **~19 sectors deliberately not built**, covered on the hub instead.

The test each sector had to pass:

1. Enough genuinely distinct keyword variation to fill a page
2. A gifting motion specific to that sector, not just a renamed one
3. Products in this catalog that actually suit it
4. Something useful to say that the category pages do not already say

Sectors that failed on criteria 1 and 2 — telecom, logistics, legal, automotive,
hospitality, media, coworking, government/PSU, construction, recruitment,
renewable energy and others — hold 6–10 near-identical keywords each. Nine pages
built on those would differ by a single noun, which Google treats as doorway
pages and which would risk the authority of the nine legitimate pages.

**Promotion criterion, for later:** if Search Console shows a hub-covered sector
generating real impressions, that is evidence of demand the hub section is
already capturing, and the sector has earned its own page. Make that call on
data, not on the fact that the keyword exists in a spreadsheet.

---

## Summary

| Category | Keywords | % |
| --- | --- | --- |
| Adequately covered | 375 | 51% |
| Consolidated onto shared pages | 202 | 28% |
| Deliberately not targeted | 154 | 21% |
| **Needing a new page** | **0** | **0%** |
| **Unexplained** | **0** | **0%** |

The honest headline: **79% of the dataset is now working for the site, and the
remaining 21% is excluded on documented grounds** — not overlooked. Chasing that
last fifth would have meant publishing pages for phrases nobody searches, or for
products that do not exist.

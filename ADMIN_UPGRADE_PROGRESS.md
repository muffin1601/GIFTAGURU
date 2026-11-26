# Admin Upgrade — Progress

Last updated: 2026-11-26 · Phases 1–2 complete · Nothing committed, pushed or deployed.

## Phase 1 — Audit, navigation, layout, dashboard ✅

### Audit findings (they shape later phases)
| Area | Finding | Consequence |
|---|---|---|
| Catalogue size | 36 products, 5 categories, 1 variant each, 122 images (all in `/public` paths) | Server pagination still used; built for thousands |
| SKU vs code | 12 of 36 products have a variant SKU ≠ `product_code` | Imports must match by **ID → product code → SKU**, never by name |
| Subcategories | Categories are flat (no `parent_id`) | Needs an additive migration in Phase 4 |
| Material / colour / size | No columns; free-form spec labels ("Material (bottle)", "Ink colour") | Exposed as virtual columns bound to an **exact** spec label; near-miss labels untouched |
| SEO title | Not in the DB. Comes from static code (`lib/seo/content/products.ts`) keyed **by slug**, else product name | Read-only in the grid. Changing a slug would silently drop that product's SEO copy → slug read-only in grid until Phase 5 adds redirects |
| Meta description | `products.seo_description`, falling back to static content | "Missing meta" = neither exists |
| Alt text | `product_images.alt_text` | "Image alt text" column = primary image's alt |
| Roles | Enum has `customer/admin/super_admin`; live DB has 3 super_admins | Capability layer added now; new roles are a Phase 6 migration |
| Migrations | Custom runner over `supabase/migrations/*.sql` (not Prisma migrate) | Phase 1–2 needed **no** migration |

### Delivered
- Shell: collapsible sidebar (remembered), grouped navigation, breadcrumbs, global search (Products / Orders / Leads, `/` shortcut), light / dark / system theme (remembered), user + role in the top bar.
- Dashboard: catalogue, data-quality and enquiry figures from live data. Every catalogue number uses the same filter builder as the product table, so clicking a stat opens exactly those products. Includes category distribution, recent enquiries, recently added / updated, featured, quick actions. Existing order and revenue figures were kept (real data).

## Phase 2 — Product table, inline editing, Save All, bulk operations ✅

- **Grid** (`/admin/products`): 28 configurable columns. Server-side search (name, SKU, code, slug, ID), filters (category, status, featured, price range, data quality, SEO quality), sorting, pagination (25 / 50 / 100 / 200). Show/hide, resize and drag-to-reorder columns; image + name columns frozen; sticky header; full-screen mode. Layout and page size remembered per browser.
- **Excel-style editing**: Edit Table mode; double-click, Enter, F2 or just type; editors for text, numbers, long text, lists, specs, a searchable category picker, a status picker, Yes/No switches, and an image picker for the primary image. Tab / Enter / arrow navigation, Shift / drag range selection, Ctrl+C / Ctrl+V with Excel & Sheets (multi-row, multi-column, quoted multi-line cells), Ctrl+D fill down, Delete clears, Space toggles, undo / redo (200 steps). Modified cells highlighted; validation errors shown in the cell; change and error counters; warning before leaving with unsaved changes.
- **Save All**: one transaction, all or nothing. Every value re-validated on the server (types, lengths, SKU uniqueness, category exists, MRP > price, price above volume tiers, image belongs to product). Rows locked with `SELECT … FOR UPDATE` and checked against the `updatedAt` the editor loaded. If someone else saved first, nothing is written and the admin chooses "Use their version" or "Keep my edits on top of theirs". Audit log entry per product with before / after of changed fields only.
- **Bulk operations** (selected rows, or all rows matching the filters): category, set price, ± % price with rounding, MRP, MOQ, status (activate / deactivate / archive), featured, customisable, short / full / meta description (fill blanks or replace; `{name}` `{code}` `{category}` tokens from real data only), any specification, image alt text, duplicate as drafts, delete. The server preview shows matched / will change / already set / skipped-with-reason, plus a before → after table. Apply recomputes under row locks in batches of 100, refuses if the matching set changed since preview, and writes one audit entry including before values (for Phase 3 rollback). Products with orders are never deleted. Delete is super-admin only and requires typing DELETE.
- **Export** (`/api/admin/products/export`): XLSX / CSV of the current filter, selected rows, visible columns, SEO-only, or a blank template. Includes stable IDs, codes and SKUs. Formula-injection-safe. Logged.
- **Permissions**: `lib/auth/permissions.ts` capability map plus `requirePermission()`, enforced in every new server action and the export route.

### Changed / new files
- New: `lib/auth/permissions.ts`, `lib/admin/products/{grid-schema,query,bulk}.ts`, `lib/admin/spreadsheet.ts`, `lib/actions/product-grid.ts`, `app/api/admin/products/export/route.ts`, `components/admin/product-grid/{ProductGrid,CellEditor,BulkEditDialog,usePersistentPrefs}.tsx|ts`, `components/admin/useLocalSetting.ts`, `tests/admin-product-grid.test.ts`
- Modified: `lib/auth/admin.ts` (added `requirePermission`), `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/products/page.tsx`, `components/admin/AdminShell.tsx`, `app/globals.css` (admin-scoped styles only; existing admin table rules narrowed to `:not(.pg-table)`)
- Storefront: **no changes**.

### Migrations
None.

### Test results
- `npm test`: **75 / 75 pass** (16 new: parsing, validation, spec overlays, clipboard round-trip, formula neutralising, bulk price / text / spec / alt / delete / duplicate rules, role permissions)
- `tsc --noEmit`: clean · `eslint` on changed files: clean · `npm run build`: passes
- Browser (temporary fixture page, since removed; no database): locked-until-Edit-mode, type-to-replace, Enter moves down, invalid number rejected in the editor, MRP ≤ price flagged, 2×2 Excel paste with one bad cell flagged, fill-down, undo / redo, category search picker, save blocked while errors exist, discard restores all, broken-image detection, dark mode + persistence. Unauthenticated Save was refused (redirected to login); unauthenticated export returned 401.
- Bugs found and fixed while testing: frozen columns overlapped (CSS precedence); broken images not flagged when they failed before hydration; "open product" icon sat under the name text; pager text invisible in dark mode.

### Not yet verified (needs a test database)
The only configured database is the live Supabase project, and this session has no admin login. **Save All, conflict detection and bulk Apply have not run against a real database.** Their logic is unit-tested and type-checked, but they need an end-to-end run on a Supabase branch or copy before sign-off.

## Pending
- **Phase 3**: full import workflow (column mapping, preview, create / update / both modes, blank ≠ clear, error report download, import history, rollback using the bulk audit entries). The toolbar "Import" currently opens the existing price-file importer.
- **Phase 4**: subcategories (`categories.parent_id` migration), category SEO fields and ordering, image library (multi-upload, drag-and-drop, WebP, duplicate detection, bulk assign by SKU), `#images` anchor on the product page.
- **Phase 5**: SEO module (a DB `seo_title` override wired into `generateMetadata`, plus a slug-redirect table so slugs can be edited safely), content management.
- **Phase 6**: new roles (enum migration), user management UI, enquiry assignment / follow-ups, reports, activity-log filters.
- **Phase 7**: end-to-end tests on a test DB, security review, performance pass.

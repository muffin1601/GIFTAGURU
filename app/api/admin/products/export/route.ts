import { NextResponse, type NextRequest } from "next/server";
import * as XLSX from "xlsx";
import { getAdminSession } from "@/lib/auth/admin";
import { roleCan } from "@/lib/auth/permissions";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { COLUMN_BY_KEY, formatCellText, type ColumnKey } from "@/lib/admin/products/grid-schema";
import { buildProductWhere, gridProductSelect, normalizeFilters, parseSort, toGridRow } from "@/lib/admin/products/query";
import { neutralizeFormula, toCsv } from "@/lib/admin/spreadsheet";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Column order for a complete export. Product ID first so re-imports match by ID. */
const FULL: ColumnKey[] = [
  "id", "productCode", "sku", "name", "categoryId", "slug", "status", "isFeatured", "basePrice", "compareAtPrice", "minOrderQuantity",
  "isCustomizable", "customizationOptions", "description", "longDescription", "specifications", "material", "colour", "size",
  "seoTitle", "seoDescription", "occasionTags", "imageAlt", "indexing", "createdAt", "updatedAt",
];
const SEO: ColumnKey[] = ["id", "productCode", "sku", "name", "slug", "status", "seoTitle", "seoDescription", "occasionTags", "imageAlt", "indexing"];

/**
 * Product export. Query parameters:
 *   format   csv | xlsx (default xlsx)
 *   preset   full | seo | template (template = headers only)
 *   ids      comma-separated product IDs (selected rows); otherwise the grid filters apply
 *   columns  optional comma-separated column keys to restrict the export
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Sign in as an admin." }, { status: 401 });
  if (!roleCan(admin.role, "products.export")) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const format = params.format === "csv" ? "csv" : "xlsx";
  const preset = params.preset === "seo" ? "seo" : params.preset === "template" ? "template" : "full";
  let columns = preset === "seo" ? SEO : FULL;
  if (params.columns) {
    const requested = params.columns.split(",").filter((key): key is ColumnKey => key in COLUMN_BY_KEY);
    // ID and code are always included so the file can be safely re-imported.
    if (requested.length) columns = [...new Set<ColumnKey>(["id", "productCode", ...requested])].filter((key) => FULL.includes(key));
  }
  const withImages = preset === "full";

  const header = [...columns.map((key) => COLUMN_BY_KEY[key].label), ...(withImages ? ["Image URLs"] : [])];
  const body: Array<Array<string | number | null>> = [];

  if (preset !== "template") {
    const ids = (params.ids ?? "").split(",").filter((id) => UUID.test(id)).slice(0, 5000);
    const where = ids.length ? { id: { in: ids } } : await buildProductWhere(normalizeFilters(params));
    const { orderBy } = parseSort(params.sort, params.dir);
    const categories = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
    const ctx = { categories };

    // Batched so very large catalogues never load into memory at once.
    for (let skip = 0; ; skip += 500) {
      const batch = await prisma.product.findMany({ where, orderBy, skip, take: 500, select: gridProductSelect });
      for (const product of batch) {
        const row = toGridRow(product);
        body.push([
          ...columns.map((key) => {
            const value = row.values[key];
            const type = COLUMN_BY_KEY[key].type;
            if ((type === "money" || type === "int") && typeof value === "number") return value;
            return formatCellText(key, value, ctx);
          }),
          ...(withImages ? [row.images.map((image) => image.url).join(" | ")] : []),
        ]);
      }
      if (batch.length < 500) break;
    }

    await logAdminAction(admin, {
      action: "product.exported",
      entityType: "product",
      after: { format, preset, rows: body.length, selected: ids.length > 0, filters: ids.length ? undefined : normalizeFilters(params) },
    });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const name = `giftaguru-products-${preset}-${stamp}.${format}`;

  if (format === "csv") {
    return new NextResponse(toCsv([header, ...body]), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" },
    });
  }

  const sheet = XLSX.utils.aoa_to_sheet([header, ...body.map((row) => row.map((cell) => (typeof cell === "string" ? neutralizeFormula(cell) : cell)))]);
  sheet["!cols"] = header.map((label) => ({ wch: Math.min(60, Math.max(12, label.length + 2)) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Products");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}

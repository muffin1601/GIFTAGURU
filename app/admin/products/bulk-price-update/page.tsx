import BulkPriceUpdate from "@/components/admin/BulkPriceUpdate";
import { prisma } from "@/lib/prisma";

export default async function BulkPriceUpdatePage() {
  const variants = await prisma.productVariant.findMany({ where: { isDefault: true }, include: { product: { select: { name: true, basePrice: true } } } });
  return <BulkPriceUpdate products={variants.map((variant) => ({ productCode: variant.sku, name: variant.product.name, currentPrice: Number(variant.product.basePrice) }))} />;
}

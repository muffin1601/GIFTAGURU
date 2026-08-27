import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/data/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const products = await searchProducts({
    query: q,
    categorySlug: category,
    limit: 10,
  });

  return NextResponse.json({
    results: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      image: product.image,
      price: product.price,
    })),
  });
}

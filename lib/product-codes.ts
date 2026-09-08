import { prisma } from "@/lib/prisma";

export const DEFAULT_PRODUCT_CODE_FORMAT = "GG-{NUMBER:4}";

export function isValidProductCodeFormat(value: string): boolean {
  return /^[A-Za-z0-9._/-]*\{NUMBER(?::[1-8])?\}[A-Za-z0-9._/-]*$/.test(value);
}

export function formatProductCode(format: string, number: number): string {
  const match = format.match(/\{NUMBER(?::(\d+))?\}/);
  if (!match) return format;
  const width = Number(match[1] ?? 4);
  return format.replace(match[0], String(number).padStart(width, "0"));
}

export async function getProductCodeFormat(): Promise<string> {
  const setting = await prisma.storeSetting.findUnique({ where: { key: "product_code_format" }, select: { value: true } });
  const value = typeof setting?.value === "string" ? setting.value.trim() : "";
  return isValidProductCodeFormat(value) ? value : DEFAULT_PRODUCT_CODE_FORMAT;
}

export async function generateNextProductCode(): Promise<string> {
  const format = await getProductCodeFormat();
  let number = (await prisma.productVariant.count()) + 1;
  for (;;) {
    const code = formatProductCode(format, number++);
    if (!(await prisma.productVariant.findUnique({ where: { sku: code }, select: { id: true } }))) return code;
  }
}

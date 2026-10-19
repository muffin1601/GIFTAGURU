import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDirectory = path.join(root, ".tmp-editorial");
const outputDirectory = path.join(root, "public", "images", "editorial");

const images = [
  ["wrapped-gift-boxes.jpg", "premium-corporate-gifting.webp", 1600],
  ["gift-wrapping-process.jpg", "custom-gift-preparation.webp", 1400],
  ["notebooks-workspace.jpg", "employee-welcome-workspace.webp", 1400],
  ["green-gold-gift.jpg", "luxury-gift-packaging.webp", 2000],
  ["festive-gold-gift.jpg", "festive-corporate-gifting.webp", 2000],
  ["minimal-notebook-coffee.jpg", "business-gifting-workspace.webp", 1600],
  ["eco-friendly-workspace.jpg", "eco-friendly-workspace.webp", 1600],
  ["category-joining-gifts.jpg", "category-joining-gifts.webp", 1600],
  ["category-premium-gifts.jpg", "category-premium-gifts.webp", 1600],
  ["category-luxury-gifts.jpg", "category-luxury-gifts.webp", 1600],
  ["category-eco-friendly-gifts.jpg", "category-eco-friendly-gifts.webp", 1600],
];

await mkdir(outputDirectory, { recursive: true });

for (const [source, destination, width] of images) {
  const input = path.join(sourceDirectory, source);
  const output = path.join(outputDirectory, destination);

  await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(output);
}

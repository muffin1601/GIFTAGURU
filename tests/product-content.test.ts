import assert from "node:assert/strict";
import test from "node:test";
import { asFaqs, asFeatures, asSpecifications, asStringItems, productContentFormSchema } from "../lib/product-content.ts";

const validBase = {
  longDescription: "A useful product introduction.",
  keyFeatures: JSON.stringify([{ title: "Useful feature", description: "A factual explanation." }]),
  specifications: JSON.stringify([{ label: "Material", value: "Stainless steel" }]),
  packageIncludes: JSON.stringify(["Product", "Gift box"]),
  customizationOptions: "[]",
  brandingMethods: "[]",
  additionalDetails: "[]",
  faqs: JSON.stringify([{ question: "Can it be branded?", answer: "Branding is available on request." }]),
  seoDescription: "A concise search description.",
  contentSource: "Supplier catalogue",
  sourceUrl: "https://example.com/product",
  lastVerifiedAt: "2026-09-25",
};

test("structured product content accepts ordered, complete rows", () => {
  const parsed = productContentFormSchema.parse(validBase);
  assert.equal(parsed.keyFeatures[0].title, "Useful feature");
  assert.deepEqual(parsed.packageIncludes, ["Product", "Gift box"]);
  assert.equal(parsed.faqs[0].question, "Can it be branded?");
});

test("structured product content rejects malformed JSON and blank rows", () => {
  assert.equal(productContentFormSchema.safeParse({ ...validBase, keyFeatures: "not-json" }).success, false);
  assert.equal(productContentFormSchema.safeParse({ ...validBase, packageIncludes: JSON.stringify([""]) }).success, false);
});

test("storefront JSON readers fail closed for malformed database values", () => {
  assert.deepEqual(asFeatures([{ title: "", description: "bad" }]), []);
  assert.deepEqual(asSpecifications({ label: "Material", value: "Steel" }), []);
  assert.deepEqual(asStringItems(["Item", ""]), []);
  assert.deepEqual(asFaqs([{ question: "Question", answer: "" }]), []);
});

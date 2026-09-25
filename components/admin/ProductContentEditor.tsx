"use client";

import { useState } from "react";
import type { ProductFaq, ProductFeature, ProductSpecification } from "@/lib/product-content";

type ContentValue = {
  longDescription?: string | null;
  keyFeatures?: ProductFeature[];
  specifications?: ProductSpecification[];
  packageIncludes?: string[];
  customizationOptions?: string[];
  brandingMethods?: string[];
  additionalDetails?: ProductSpecification[];
  faqs?: ProductFaq[];
  seoDescription?: string | null;
  contentSource?: string | null;
  sourceUrl?: string | null;
  lastVerifiedAt?: string | null;
};

function MoveButtons({ index, length, move, remove }: { index: number; length: number; move: (from: number, to: number) => void; remove: () => void }) {
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" className="btn btn-secondary px-2 py-1 text-xs" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Move item up">↑</button>
      <button type="button" className="btn btn-secondary px-2 py-1 text-xs" disabled={index === length - 1} onClick={() => move(index, index + 1)} aria-label="Move item down">↓</button>
      <button type="button" className="btn btn-secondary px-2 py-1 text-xs" onClick={remove}>Remove</button>
    </div>
  );
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

type PairItem = ProductFeature | ProductSpecification;

function PairEditor({ title, name, addLabel, firstLabel, secondLabel, items, onChange }: { title: string; name: string; addLabel: string; firstLabel: string; secondLabel: string; items: PairItem[]; onChange: (items: PairItem[]) => void }) {
  const isFeature = name === "keyFeatures";
  return (
    <fieldset className="space-y-3 border-t border-line pt-5">
      <legend className="font-display text-xl text-navy-950">{title}</legend>
      <input type="hidden" name={name} value={JSON.stringify(items.filter((item) => Object.values(item).every((value) => value.trim())))} />
      {items.map((item, index) => {
        const first = isFeature ? (item as ProductFeature).title : (item as ProductSpecification).label;
        const second = isFeature ? (item as ProductFeature).description : (item as ProductSpecification).value;
        return (
          <div key={index} className="grid gap-2 border border-line p-3 sm:grid-cols-[1fr_2fr_auto] sm:items-start">
            <label className="text-xs font-semibold text-ink-600">{firstLabel}<input className="field-input mt-1 text-sm" value={first} onChange={(event) => onChange(items.map((entry, itemIndex) => itemIndex === index ? (isFeature ? { title: event.target.value, description: second } : { label: event.target.value, value: second }) : entry))} /></label>
            <label className="text-xs font-semibold text-ink-600">{secondLabel}<textarea className="field-input mt-1 text-sm" rows={2} value={second} onChange={(event) => onChange(items.map((entry, itemIndex) => itemIndex === index ? (isFeature ? { title: first, description: event.target.value } : { label: first, value: event.target.value }) : entry))} /></label>
            <MoveButtons index={index} length={items.length} move={(from, to) => onChange(moveItem(items, from, to))} remove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
          </div>
        );
      })}
      <button type="button" className="btn btn-secondary text-sm" onClick={() => onChange([...items, isFeature ? { title: "", description: "" } : { label: "", value: "" }])}>+ {addLabel}</button>
    </fieldset>
  );
}

function ListEditor({ title, name, items, onChange }: { title: string; name: string; items: string[]; onChange: (items: string[]) => void }) {
  return (
    <fieldset className="space-y-3 border-t border-line pt-5">
      <legend className="font-display text-xl text-navy-950">{title}</legend>
      <input type="hidden" name={name} value={JSON.stringify(items.filter((item) => item.trim()))} />
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <textarea aria-label={`${title} item ${index + 1}`} rows={2} className="field-input text-sm" value={item} onChange={(event) => onChange(items.map((entry, itemIndex) => itemIndex === index ? event.target.value : entry))} />
          <MoveButtons index={index} length={items.length} move={(from, to) => onChange(moveItem(items, from, to))} remove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      ))}
      <button type="button" className="btn btn-secondary text-sm" onClick={() => onChange([...items, ""])}>+ Add item</button>
    </fieldset>
  );
}

export default function ProductContentEditor({ value = {} }: { value?: ContentValue }) {
  const [features, setFeatures] = useState<ProductFeature[]>(value.keyFeatures ?? []);
  const [specifications, setSpecifications] = useState<ProductSpecification[]>(value.specifications ?? []);
  const [includes, setIncludes] = useState(value.packageIncludes ?? []);
  const [customization, setCustomization] = useState(value.customizationOptions ?? []);
  const [branding, setBranding] = useState(value.brandingMethods ?? []);
  const [details, setDetails] = useState<ProductSpecification[]>(value.additionalDetails ?? []);
  const [faqs, setFaqs] = useState<ProductFaq[]>(value.faqs ?? []);

  return (
    <div className="space-y-5 sm:col-span-2">
      <div className="border-t border-line pt-5">
        <h3 className="font-display text-2xl text-navy-950">Product content</h3>
        <p className="mt-1 text-sm text-ink-600">Only completed rows are saved. Use the arrows to control storefront order.</p>
      </div>
      <label className="block space-y-1 text-sm font-medium text-navy-950">Product introduction<textarea name="longDescription" rows={6} maxLength={8000} defaultValue={value.longDescription ?? ""} className="field-input text-sm" /></label>
      <PairEditor title="Key features" name="keyFeatures" addLabel="Add feature" firstLabel="Feature name" secondLabel="Description" items={features} onChange={(items) => setFeatures(items as ProductFeature[])} />
      <PairEditor title="Specifications" name="specifications" addLabel="Add specification" firstLabel="Label" secondLabel="Value" items={specifications} onChange={(items) => setSpecifications(items as ProductSpecification[])} />
      <ListEditor title="Package / hamper includes" name="packageIncludes" items={includes} onChange={setIncludes} />
      <ListEditor title="Customization options" name="customizationOptions" items={customization} onChange={setCustomization} />
      <ListEditor title="Branding methods" name="brandingMethods" items={branding} onChange={setBranding} />
      <PairEditor title="Additional product details" name="additionalDetails" addLabel="Add detail" firstLabel="Label" secondLabel="Value" items={details} onChange={(items) => setDetails(items as ProductSpecification[])} />
      <fieldset className="space-y-3 border-t border-line pt-5">
        <legend className="font-display text-xl text-navy-950">FAQ</legend>
        <input type="hidden" name="faqs" value={JSON.stringify(faqs.filter((faq) => faq.question.trim() && faq.answer.trim()))} />
        {faqs.map((faq, index) => <div key={index} className="grid gap-2 border border-line p-3 sm:grid-cols-[1fr_2fr_auto]"><label className="text-xs font-semibold text-ink-600">Question<input className="field-input mt-1 text-sm" value={faq.question} onChange={(event) => setFaqs(faqs.map((entry, itemIndex) => itemIndex === index ? { ...entry, question: event.target.value } : entry))} /></label><label className="text-xs font-semibold text-ink-600">Answer<textarea rows={2} className="field-input mt-1 text-sm" value={faq.answer} onChange={(event) => setFaqs(faqs.map((entry, itemIndex) => itemIndex === index ? { ...entry, answer: event.target.value } : entry))} /></label><MoveButtons index={index} length={faqs.length} move={(from, to) => setFaqs(moveItem(faqs, from, to))} remove={() => setFaqs(faqs.filter((_, itemIndex) => itemIndex !== index))} /></div>)}
        <button type="button" className="btn btn-secondary text-sm" onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}>+ Add question</button>
      </fieldset>
      <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">SEO product description<textarea name="seoDescription" rows={3} maxLength={500} defaultValue={value.seoDescription ?? ""} className="field-input text-sm" /></label>
        <label className="space-y-1 text-sm font-medium text-navy-950">Internal content source<input name="contentSource" maxLength={200} defaultValue={value.contentSource ?? ""} className="field-input text-sm" /></label>
        <label className="space-y-1 text-sm font-medium text-navy-950">Source URL (admin only)<input name="sourceUrl" type="url" maxLength={1000} defaultValue={value.sourceUrl ?? ""} className="field-input text-sm" /></label>
        <label className="space-y-1 text-sm font-medium text-navy-950">Last verified<input name="lastVerifiedAt" type="date" defaultValue={value.lastVerifiedAt?.slice(0, 10) ?? ""} className="field-input text-sm" /></label>
      </div>
    </div>
  );
}

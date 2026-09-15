"use client";

import { useState } from "react";

export default function ProductCategoryCodePreview({
  categories,
}: {
  categories: Array<{ id: string; name: string; codePrefix: string | null; nextNumber: number }>;
}) {
  const [categoryId, setCategoryId] = useState("");
  const category = categories.find((item) => item.id === categoryId);

  return (
    <label className="space-y-1 text-sm font-medium text-navy-950">
      Category
      <select
        name="categoryId"
        required
        value={categoryId}
        onChange={(event) => setCategoryId(event.target.value)}
        className="field-input text-sm"
      >
        <option value="">Choose a category</option>
        {categories.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} ({item.codePrefix ?? "prefix needed"})
          </option>
        ))}
      </select>
      <span className="block text-xs font-normal text-ink-600">
        Product code preview: {category?.codePrefix ? `${category.codePrefix}-${String(category.nextNumber).padStart(4, "0")}` : "choose a category"}. The saved code is allocated securely by the server.
      </span>
    </label>
  );
}

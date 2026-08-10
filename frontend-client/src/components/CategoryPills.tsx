"use client";

import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";

interface Category {
  id: string;
  name: string;
}

export function CategoryPills({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiClient
      .get<Category[]>("/category/public")
      .then(({ data }) => setCategories(data));
  }, []);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          selected === null
            ? "bg-accent text-white"
            : "border border-border text-text-muted hover:bg-surface"
        }`}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selected === c.id
              ? "bg-accent text-white"
              : "border border-border text-text-muted hover:bg-surface"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

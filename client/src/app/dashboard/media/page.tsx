"use client";

import { useEffect, useState, useRef } from "react";
import { Trash2, Upload, Loader2 } from "lucide-react";
import { ProtectedRoute } from "../../../components/ProtectedRoute";
import { mediaApi, MediaRecord } from "../../../lib/media-api";

const CATEGORIES = [
  "CAMPAIGN",
  "CATEGORY",
  "PRODUCT",
  "JOURNEY",
  "TESTIMONIAL",
  "GALLERY",
];

function MediaLibraryContent() {
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await mediaApi.getAll({
        category: category || undefined,
        search: search || undefined,
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [category]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} item(s)? This can't be undone.`))
      return;
    await mediaApi.bulkDelete(Array.from(selected));
    setSelected(new Set());
    load();
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      await mediaApi.bulkUpload(Array.from(files), category || "GALLERY");
      load();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Media Library
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {items.length} files
          </p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={15} /> Delete {selected.size}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} />
            )}
            Upload
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex-1 max-w-xs"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filename or tag"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </form>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm outline-none"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="text-sm text-text-secondary">
            No media yet. Upload your first file.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {items.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`group relative aspect-square overflow-hidden rounded-lg border-2 ${
                  isSelected
                    ? "border-accent"
                    : "border-transparent hover:border-border"
                }`}
              >
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white">
                  {item.category}
                </span>
                {isSelected && (
                  <div className="absolute inset-0 bg-accent/30" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MediaLibraryPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
      <MediaLibraryContent />
    </ProtectedRoute>
  );
}

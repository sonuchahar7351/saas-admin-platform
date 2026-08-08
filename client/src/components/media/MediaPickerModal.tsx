"use client";

import { useEffect, useRef, useState } from "react";
import { X, Search, Upload, Check, Loader2 } from "lucide-react";
import { mediaApi, MediaRecord } from "../../lib/media-api";

const CATEGORIES = [
  "CAMPAIGN",
  "CATEGORY",
  "PRODUCT",
  "JOURNEY",
  "TESTIMONIAL",
  "GALLERY",
];

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  defaultCategory,
  multiple = false,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (items: MediaRecord[]) => void;
  defaultCategory?: string;
  multiple?: boolean;
}) {
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(defaultCategory || "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
    if (open) {
      setSelectedIds(new Set());
      load();
    }
  }, [open, category]);

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const toggleSelect = (item: MediaRecord) => {
    if (!multiple) {
      onSelect([item]);
      onClose();
      return;
    }
    const next = new Set(selectedIds);
    next.has(item.id) ? next.delete(item.id) : next.add(item.id);
    setSelectedIds(next);
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      await mediaApi.bulkUpload(Array.from(files), category || "GALLERY");
      await load();
    } finally {
      setUploading(false);
    }
  };

  const confirmSelection = () => {
    onSelect(items.filter((i) => selectedIds.has(i.id)));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col rounded-xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Media Library</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <form
            onSubmit={runSearch}
            className="flex flex-1 items-center gap-2 rounded-lg border border-border px-3 py-1.5"
          >
            <Search size={14} className="text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename or tag"
              className="w-full text-sm outline-none"
            />
          </form>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm outline-none"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            Upload
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-sm text-text-secondary">Loading…</p>
          ) : items.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <p className="text-sm text-text-secondary">
                No media found. Upload something to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {items.map((item) => {
                const selected = selectedIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelect(item)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                      selected
                        ? "border-accent"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {selected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-accent/30">
                        <div className="rounded-full bg-accent p-1">
                          <Check size={14} className="text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {multiple && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <span className="text-sm text-text-secondary">
              {selectedIds.size} selected
            </span>
            <button
              onClick={confirmSelection}
              disabled={selectedIds.size === 0}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              Use selected
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

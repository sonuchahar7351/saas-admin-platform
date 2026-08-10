"use client";

import { useEffect, useRef, useState } from "react";
import { RichEditor, RichEditorHandle } from "./editor/RichEditor";
import { AiGenerateButton } from "./AiGenerateButton";
import { PresetEditor } from "./PresetEditor";
import { ImageUploadField } from "./ImageUploadField";
import { categoriesApi, CategoryRecord } from "../lib/categories-api";
import { aiApi } from "../lib/ai-api";
import { NgoRecord, ngosApi } from "@/lib/ngo-api";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface CampaignFormValues {
  title: string;
  slug: string;
  ngoId: string;
  categoryId: string;
  goalAmount: string;
  shortDescription: string;
  expiryDate: string;
  cardImageId: string | null;
  cardImageUrl: string | null;
  story: any;
  isAddress: boolean;
  donationPresets: { value: number; isDefault: boolean }[];
  tipPresets: { value: number; isDefault: boolean }[];
}

const DEFAULT_VALUES: CampaignFormValues = {
  title: "",
  slug: "",
  ngoId: "",
  categoryId: "",
  goalAmount: "",
  shortDescription: "",
  expiryDate: "",
  cardImageId: null,
  cardImageUrl: null,
  story: { type: "doc", content: [{ type: "paragraph" }] },
  isAddress: false,
  donationPresets: [
    { value: 1000, isDefault: false },
    { value: 2000, isDefault: true },
    { value: 3000, isDefault: false },
  ],
  tipPresets: [
    { value: 7, isDefault: false },
    { value: 10, isDefault: true },
    { value: 12, isDefault: false },
  ],
};

export function CampaignForm({
  mode,
  initialValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  initialValues?: Partial<CampaignFormValues>;
  onSubmit: (values: CampaignFormValues) => Promise<void>;
}) {
  const [ngos, setNgos] = useState<NgoRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [slugTouched, setSlugTouched] = useState(mode === "edit"); // in edit mode, don't auto-overwrite an existing slug
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<RichEditorHandle>(null);

  const [form, setForm] = useState<CampaignFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  useEffect(() => {
    ngosApi.getAll().then(({ data }) => setNgos(data));
    categoriesApi.getAll().then(({ data }) => setCategories(data));
  }, []);

  // if initialValues arrive after the first render (async fetch in edit mode), sync them in
  useEffect(() => {
    if (initialValues) {
      setForm((f) => ({ ...f, ...initialValues }));
      if (initialValues.story)
        editorRef.current?.setContent(initialValues.story);
    }
  }, [initialValues]);

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: slugTouched ? f.slug : slugify(title),
    }));
  };

  const handleGenerateStory = async () => {
    if (
      !form.title ||
      !form.categoryId ||
      !form.goalAmount ||
      !form.shortDescription
    ) {
      setError(
        "Fill in title, category, goal amount, and short description before generating a story.",
      );
      return;
    }
    setError("");
    const categoryName =
      categories.find((c) => c.id === form.categoryId)?.name || "";
    const { data } = await aiApi.generateCampaignStory({
      title: form.title,
      categoryName,
      goalAmount: Number(form.goalAmount),
      description: form.shortDescription,
    });
    setForm((f) => ({ ...f, story: data.story }));
    editorRef.current?.setContent(data.story);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-5 rounded-xl border border-border bg-surface p-6"
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium">Title</label>
        <input
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Slug</label>
        <input
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setForm({ ...form, slug: e.target.value });
          }}
          className="w-full rounded-lg border border-border px-3 py-2.5 font-mono text-sm outline-none focus:border-accent"
          placeholder="auto-generated-from-title"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">NGO</label>
          <select
            value={form.ngoId}
            onChange={(e) => setForm({ ...form, ngoId: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
            required
          >
            <option value="">Select NGO</option>
            {ngos.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Goal amount (₹)
          </label>
          <input
            type="number"
            value={form.goalAmount}
            onChange={(e) => setForm({ ...form, goalAmount: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Expiry date
          </label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Short description
        </label>
        <textarea
          value={form.shortDescription}
          onChange={(e) =>
            setForm({ ...form, shortDescription: e.target.value })
          }
          rows={3}
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
          required
        />
      </div>

      <ImageUploadField
        label="Card image"
        category="CAMPAIGN"
        mediaId={form.cardImageId}
        initialUrl={form.cardImageUrl}
        onChange={(id, url) =>
          setForm({ ...form, cardImageId: id, cardImageUrl: url })
        }
      />

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium">Story</label>
          <AiGenerateButton onGenerate={handleGenerateStory} />
        </div>
        <RichEditor
          ref={editorRef}
          content={form.story}
          onChange={(story) => setForm((f) => ({ ...f, story }))}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isAddress || false}
          onChange={(e) => setForm({ ...form, isAddress: e.target.checked })}
        />
        Require full address at checkout (city, state, street)
      </label>

      <PresetEditor
        label="Donation amount presets"
        unit="₹"
        presets={form.donationPresets}
        onChange={(donationPresets) => setForm({ ...form, donationPresets })}
      />
      <PresetEditor
        label="Tip percentage presets"
        unit="%"
        presets={form.tipPresets}
        onChange={(tipPresets) => setForm({ ...form, tipPresets })}
      />

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {saving
          ? "Saving…"
          : mode === "create"
            ? "Create campaign"
            : "Save changes"}
      </button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../../../../components/ProtectedRoute";
import { campaignsApi } from "../../../../lib/campaigns-api";
import { categoriesApi, CategoryRecord } from "../../../../lib/categories-api";
import { PresetEditor } from "../../../../components/PresetEditor";
import { ImageUploadField } from "../../../../components/ImageUploadField";
import { NgoRecord, ngosApi } from "@/lib/ngo-api";
import { RichEditor } from "../../../../components/editor/RichEditor";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CreateCampaignForm() {
  const router = useRouter();
  const [ngos, setNgos] = useState<NgoRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [story, setStory] = useState<any>({
    type: "doc",
    content: [{ type: "paragraph" }],
  });

  const [form, setForm] = useState({
    title: "",
    slug: "",
    ngoId: "",
    categoryId: "",
    goalAmount: "",
    shortDescription: "",
    expiryDate: "",
    cardImageId: null as string | null,
  });

  const [donationPresets, setDonationPresets] = useState([
    { value: 1000, isDefault: false },
    { value: 2000, isDefault: true },
    { value: 3000, isDefault: false },
  ]);

  const [tipPresets, setTipPresets] = useState([
    { value: 7, isDefault: false },
    { value: 10, isDefault: true },
    { value: 12, isDefault: false },
  ]);

  useEffect(() => {
    ngosApi.getAll().then(({ data }) => setNgos(data));
    categoriesApi.getAll().then(({ data }) => setCategories(data));
  }, []);

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: slugTouched ? f.slug : slugify(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await campaignsApi.create({
        title: form.title,
        slug: form.slug || undefined,
        ngoId: form.ngoId,
        categoryId: form.categoryId,
        goalAmount: Number(form.goalAmount),
        shortDescription: form.shortDescription,
        cardImageId: form.cardImageId || undefined,
        expiryDate: new Date(form.expiryDate).toISOString(),
        story: story,
        donationPresets: donationPresets.map((p) => ({
          amount: p.value,
          isDefault: p.isDefault,
        })),
        tipPresets: tipPresets.map((p) => ({
          percentage: p.value,
          isDefault: p.isDefault,
        })),
      });
      router.push("/dashboard/campaigns");
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not create campaign.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Create campaign
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Section 1 of several — content and basics.
      </p>

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

        <div>
          <label className="mb-1.5 block text-sm font-medium">Story</label>
          <RichEditor content={story} onChange={setStory} />
        </div>

        <ImageUploadField
          label="Card image"
          category="CAMPAIGN"
          mediaId={form.cardImageId}
          onChange={(id) => setForm({ ...form, cardImageId: id })}
        />

        <PresetEditor
          label="Donation amount presets"
          unit="₹"
          presets={donationPresets}
          onChange={setDonationPresets}
        />
        <PresetEditor
          label="Tip percentage presets"
          unit="%"
          presets={tipPresets}
          onChange={setTipPresets}
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create campaign"}
        </button>
      </form>
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
      <CreateCampaignForm />
    </ProtectedRoute>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { campaignsApi } from "../../../../../../lib/campaigns-api";
import {
  RichEditor,
  RichEditorHandle,
} from "../../../../../../components/editor/RichEditor";
import { ImageUploadField } from "../../../../../../components/ImageUploadField";
import { useRef } from "react";
import { morphCampaignsApi } from "@/lib/morph-campaign-api";
import { apiClient } from "@/lib/api-client";

export default function MorphContentPage() {
  const { id } = useParams();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugError, setSlugError] = useState("");
  const editorRef = useRef<RichEditorHandle>(null);

  useEffect(() => {
    morphCampaignsApi.getById(id as string).then(({ data }: any) => {
      setForm({
        title: data.title,
        shortDescription: data.shortDescription,
        cardImageId: data.cardImageId,
        cardImageUrl: data.cardImageUrl,
        story: data.story,
      });
      setSlug(data.slug);
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await campaignsApi.update(
        id as string,
        {
          title: form.title,
          shortDescription: form.shortDescription,
          cardImageId: form.cardImageId,
          story: form.story,
        } as any,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSlugSave = async () => {
    setSlugError("");
    setSlugSaving(true);
    try {
      await apiClient.patch(`/campaigns/morph/${id}/slug`, { slug });
    } catch (err: any) {
      setSlugError(err.response?.data?.message || "Could not update slug.");
    } finally {
      setSlugSaving(false);
    }
  };

  if (!form) return <p className="text-sm text-text-secondary">Loading…</p>;

  return (
    <div className="space-y-5 rounded-xl border border-border bg-surface p-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Slug</label>
        {slugError && (
          <p className="mb-1.5 text-xs text-red-600">{slugError}</p>
        )}
        <div className="flex gap-2">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="flex-1 rounded-lg border border-border px-3 py-2 font-mono text-sm outline-none focus:border-accent"
          />
          <button
            onClick={handleSlugSave}
            disabled={slugSaving}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-bg disabled:opacity-50"
          >
            {slugSaving ? "Saving…" : "Update slug"}
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
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
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <ImageUploadField
        label="Card image"
        category="CAMPAIGN"
        mediaId={form.cardImageId}
        initialUrl={form.cardImageUrl}
        onChange={(imgId, url) =>
          setForm({ ...form, cardImageId: imgId, cardImageUrl: url })
        }
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Story</label>
        <RichEditor
          ref={editorRef}
          content={form.story}
          onChange={(story) => setForm({ ...form, story })}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

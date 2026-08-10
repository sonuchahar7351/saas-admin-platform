"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Pencil, Sparkles } from "lucide-react";
import {
  testimonialsApi,
  TestimonialRecord,
} from "../../../../../../lib/testimonials-api";
import { campaignsApi } from "../../../../../../lib/campaigns-api";
import { ImageUploadField } from "../../../../../../components/ImageUploadField";

function TestimonialsContent() {
  const { id: campaignId } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [items, setItems] = useState<TestimonialRecord[]>([]);
  const [editing, setEditing] = useState<Partial<TestimonialRecord> | null>(
    null,
  );
  const [persona, setPersona] = useState("");
  const [generating, setGenerating] = useState(false);

  const load = () =>
    testimonialsApi
      .getByCampaign(campaignId as string)
      .then(({ data }) => setItems(data));

  useEffect(() => {
    campaignsApi
      .getById(campaignId as string)
      .then(({ data }) => setCampaign(data));
    load();
  }, [campaignId]);

  const openNew = () =>
    setEditing({ name: "", designation: "", description: "", imageId: null });

  const handleGenerate = async () => {
    if (!campaign || !persona) return;
    setGenerating(true);
    try {
      const { data } = await testimonialsApi.generateAi(
        campaign.title,
        persona,
      );
      setEditing((e) => ({
        ...e,
        name: (data as any).name,
        designation: (data as any).designation,
        description: (data as any).description,
      }));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (editing.id) await testimonialsApi.update(editing.id, editing);
    else await testimonialsApi.create({ ...editing, campaignId });
    setEditing(null);
    setPersona("");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await testimonialsApi.delete(id);
    load();
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {items.length} testimonial(s)
        </p>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={16} /> Add testimonial
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-start gap-3">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-bg text-xs font-medium text-text-secondary">
                  {item.name[0]}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                {item.designation && (
                  <p className="text-xs text-text-secondary">
                    {item.designation}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing(item)}
                  className="rounded-md p-1 hover:bg-bg"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-md p-1 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-text-secondary">
              {item.description}
            </p>
            <label className="mt-2 flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={item.isActive}
                onChange={() =>
                  testimonialsApi
                    .update(item.id, { isActive: !item.isActive })
                    .then(load)
                }
              />
              Approved / visible publicly
            </label>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-2 rounded-xl border border-dashed border-border p-10 text-center text-sm text-text-secondary">
            No testimonials yet.
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
            <h2 className="mb-4 font-display text-lg font-semibold">
              {editing.id ? "Edit testimonial" : "New testimonial"}
            </h2>
            <div className="mb-3 flex gap-2">
              <input
                placeholder="Who's speaking? (e.g. 'a grateful parent')"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={handleGenerate}
                disabled={generating || !persona}
                className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
              >
                <Sparkles size={13} /> {generating ? "…" : "Generate"}
              </button>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Name"
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                placeholder="Designation (optional)"
                value={editing.designation || ""}
                onChange={(e) =>
                  setEditing({ ...editing, designation: e.target.value })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <textarea
                placeholder="Testimonial"
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <ImageUploadField
                label="Photo"
                category="TESTIMONIAL"
                mediaId={editing.imageId || null}
                initialUrl={editing.imageUrl}
                onChange={(imgId) => setEditing({ ...editing, imageId: imgId })}
              />
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  setEditing(null);
                  setPersona("");
                }}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TestimonialsPage() {
  return <TestimonialsContent />;
}

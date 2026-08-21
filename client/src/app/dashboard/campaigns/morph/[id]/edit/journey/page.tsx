"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Pencil, Sparkles, GripVertical } from "lucide-react";
import { journeyApi, JourneyRecord } from "@/lib/journey-api";
import { campaignsApi } from "@/lib/campaigns-api";
import { ImageUploadField } from "@/components/ImageUploadField";

function JourneyContent() {
  const { id: campaignId } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [items, setItems] = useState<JourneyRecord[]>([]);
  const [editing, setEditing] = useState<Partial<JourneyRecord> | null>(null);
  const [context, setContext] = useState("");
  const [generating, setGenerating] = useState(false);

  const load = () =>
    journeyApi
      .getByCampaign(campaignId as string)
      .then(({ data }) => setItems(data));

  useEffect(() => {
    campaignsApi
      .getById(campaignId as string)
      .then(({ data }) => setCampaign(data));
    load();
  }, [campaignId]);

  const openNew = () =>
    setEditing({
      title: "",
      description: "",
      order: items.length,
      imageId: null,
    });

  const handleGenerate = async () => {
    if (!campaign || !context) return;
    setGenerating(true);
    try {
      const { data } = await journeyApi.generateAi(campaign.title, context);
      setEditing((e) => ({
        ...e,
        title: (data as any).title,
        description: (data as any).description,
        order: e?.order ?? items.length,
      }));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (editing.id) await journeyApi.update(editing.id, editing);
    else await journeyApi.create({ ...editing, campaignId });
    setEditing(null);
    setContext("");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this journey step?")) return;
    await journeyApi.delete(id);
    load();
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-text-secondary">{items.length} step(s)</p>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={16} /> Add step
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
          >
            <GripVertical size={16} className="text-text-secondary" />
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="line-clamp-1 text-xs text-text-secondary">
                {item.description}
              </p>
            </div>
            <button
              onClick={() => setEditing(item)}
              className="rounded-md p-1.5 hover:bg-bg"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => handleDelete(item.id!)}
              className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-text-secondary">
            No journey steps yet.
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
            <h2 className="mb-4 font-display text-lg font-semibold">
              {editing.id ? "Edit step" : "New step"}
            </h2>
            <div className="mb-3 flex gap-2">
              <input
                placeholder="Stage context for AI (e.g. 'initial fundraising launch')"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={handleGenerate}
                disabled={generating || !context}
                className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
              >
                <Sparkles size={13} /> {generating ? "…" : "Generate"}
              </button>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Title"
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <textarea
                placeholder="Description"
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <ImageUploadField
                label="Image"
                category="JOURNEY"
                mediaId={editing.imageId || null}
                initialUrl={editing.imageUrl}
                onChange={(imgId) => setEditing({ ...editing, imageId: imgId })}
              />
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  setEditing(null);
                  setContext("");
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

export default function JourneyPage() {
  return <JourneyContent />;
}

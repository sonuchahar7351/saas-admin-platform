"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  X,
} from "lucide-react";
import { updatesApi, UpdateRecord } from "../../../../../../lib/updates-api";
import { campaignsApi } from "../../../../../../lib/campaigns-api";
import {
  RichEditor,
  RichEditorHandle,
} from "../../../../../../components/editor/RichEditor";
import { MediaPickerModal } from "../../../../../../components/media/MediaPickerModal";
import { useRef } from "react";

function GlimpseSection({
  update,
  onRefresh,
}: {
  update: UpdateRecord;
  onRefresh: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeGlimpseId, setActiveGlimpseId] = useState<string | null>(null);

  const handleNewGlimpse = () => {
    setActiveGlimpseId(null); // null = creating a fresh glimpse
    setPickerOpen(true);
  };

  const handleAddToExisting = (glimpseId: string) => {
    setActiveGlimpseId(glimpseId);
    setPickerOpen(true);
  };

  const handleSelect = async (items: { id: string }[]) => {
    const mediaIds = items.map((i) => i.id);
    if (activeGlimpseId) {
      await updatesApi.addGlimpseImages(activeGlimpseId, mediaIds);
    } else {
      await updatesApi.createGlimpse(update.id, mediaIds);
    }
    onRefresh();
  };

  const handleDeleteGlimpse = async (id: string) => {
    if (!confirm("Delete this glimpse and all its images?")) return;
    await updatesApi.deleteGlimpse(id);
    onRefresh();
  };

  const handleRemoveImage = async (id: string) => {
    await updatesApi.removeGlimpseImage(id);
    onRefresh();
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Glimpses
        </p>
        <button
          onClick={handleNewGlimpse}
          className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          <Plus size={12} /> Add glimpse
        </button>
      </div>

      {update.glimpses.length === 0 ? (
        <p className="text-xs text-text-secondary">No glimpses yet.</p>
      ) : (
        <div className="space-y-3">
          {update.glimpses.map((g) => (
            <div key={g.id} className="rounded-lg border border-border p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  {g.images.length} image(s)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToExisting(g.id)}
                    className="text-text-secondary hover:text-accent"
                  >
                    <ImagePlus size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteGlimpse(g.id)}
                    className="text-text-secondary hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative h-16 w-16 overflow-hidden rounded-md border border-border"
                  >
                    {img.url && (
                      <img
                        src={img.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                    <button
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        defaultCategory="GALLERY"
        multiple
        onSelect={handleSelect}
      />
    </div>
  );
}

function UpdatesContent() {
  const { id: campaignId } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [updates, setUpdates] = useState<UpdateRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    id?: string;
    title: string;
    content: any;
  } | null>(null);
  const [aiContext, setAiContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const editorRef = useRef<RichEditorHandle>(null);

  const load = () =>
    updatesApi
      .getByCampaign(campaignId as string)
      .then(({ data }) => setUpdates(data));

  useEffect(() => {
    campaignsApi
      .getById(campaignId as string)
      .then(({ data }) => setCampaign(data));
    load();
  }, [campaignId]);

  const openNew = () =>
    setEditing({
      title: "",
      content: { type: "doc", content: [{ type: "paragraph" }] },
    });

  const handleGenerate = async () => {
    if (!campaign || !aiContext) return;
    setGenerating(true);
    try {
      const { data } = await updatesApi.generateAi(campaign.title, aiContext);
      setEditing((e) => (e ? { ...e, content: data.content } : e));
      editorRef.current?.setContent(data.content);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (editing.id) {
      await updatesApi.update(editing.id, {
        title: editing.title,
        content: editing.content,
      });
    } else {
      await updatesApi.create({
        campaignId: campaignId as string,
        title: editing.title,
        content: editing.content,
      });
    }
    setEditing(null);
    setAiContext("");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this update and all its glimpses?")) return;
    await updatesApi.delete(id);
    load();
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {updates.length} update(s)
        </p>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={16} /> New update
        </button>
      </div>

      <div className="space-y-3">
        {updates.map((u) => (
          <div
            key={u.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{u.title}</p>
                <p className="text-xs text-text-secondary">
                  {new Date(u.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setEditing({ id: u.id, title: u.title, content: u.content })
                  }
                  className="rounded-md px-2 py-1 text-xs text-text-secondary hover:bg-bg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() =>
                    setExpandedId(expandedId === u.id ? null : u.id)
                  }
                  className="rounded-md p-1.5 hover:bg-bg"
                >
                  {expandedId === u.id ? (
                    <ChevronUp size={15} />
                  ) : (
                    <ChevronDown size={15} />
                  )}
                </button>
              </div>
            </div>
            {expandedId === u.id && (
              <GlimpseSection update={u} onRefresh={load} />
            )}
          </div>
        ))}
        {updates.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-text-secondary">
            No updates yet.
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-xl bg-surface p-6 shadow-2xl">
            <h2 className="mb-4 font-display text-lg font-semibold">
              {editing.id ? "Edit update" : "New update"}
            </h2>

            <input
              placeholder="Title"
              value={editing.title}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
              className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />

            <div className="mb-3 flex gap-2">
              <input
                placeholder="What happened? (context for AI)"
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={handleGenerate}
                disabled={generating || !aiContext}
                className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
              >
                <Sparkles size={13} /> {generating ? "…" : "Generate"}
              </button>
            </div>

            <RichEditor
              ref={editorRef}
              content={editing.content}
              onChange={(content) => setEditing({ ...editing, content })}
            />

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  setEditing(null);
                  setAiContext("");
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

export default function UpdatesPage() {
  return <UpdatesContent />;
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, Images, Sparkles } from "lucide-react";
import { mediaApi } from "../lib/media-api";
import { MediaPickerModal } from "./media/MediaPickerModal";
import { showError, showSuccess } from "@/lib/toast";

export function ImageUploadField({
  label,
  category,
  mediaId,
  initialUrl,
  onChange,
  className = "h-40 w-full",
}: {
  label: string;
  category: string;
  initialUrl?: string | null;
  mediaId: string | null;
  onChange: (mediaId: string | null, previewUrl: string | null) => void;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // keep preview in sync if the parent loads data asynchronously (edit mode)
  useEffect(() => {
    if (initialUrl && !preview) setPreview(initialUrl);
  }, [initialUrl]);

  const handleFile = async (file: File) => {
    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    try {
      const { data } = await mediaApi.upload(file, category);
      onChange((data as any).id, (data as any).url);
    } catch {
      setPreview(null);
      onChange(null, null);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const { data } = await mediaApi.generate(prompt, category);
      setPreview(data.url);
      onChange(data.id, data.url);
      setGenerateOpen(false);
      setPrompt("");
      showSuccess("Image generated");
    } catch (err) {
      showError(
        err,
        "Could not generate that image. Try a different description.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {preview || mediaId ? (
        <div
          className={`relative overflow-hidden rounded-lg border border-border ${className}`}
        >
          {preview && (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          )}
          {(uploading || generating) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 size={20} className="animate-spin text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onChange(null, null);
            }}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-32 flex-1 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-text-secondary hover:border-accent hover:text-accent"
          >
            <Upload size={18} />
            <span className="text-xs">Upload new</span>
          </button>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex h-32 flex-1 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-text-secondary hover:border-accent hover:text-accent"
          >
            <Images size={18} />
            <span className="text-xs">Choose existing</span>
          </button>
          <button
            type="button"
            onClick={() => setGenerateOpen(true)}
            className="flex h-32 flex-1 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-accent/40 bg-accent/5 text-accent hover:border-accent"
          >
            <Sparkles size={18} />
            <span className="text-xs">Generate with AI</span>
          </button>
        </div>
      )}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        defaultCategory={category}
        onSelect={([item]) => {
          setPreview(item.url);
          onChange(item.id, item.url);
        }}
      />
      {generateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
            <h2 className="mb-1 font-display text-lg font-semibold">Generate image with AI</h2>
            <p className="mb-4 text-sm text-text-secondary">Describe what you want — the image will be generated to fit a charitable campaign.</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Children in a rural classroom receiving new books, warm afternoon light"
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              autoFocus
            />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setGenerateOpen(false)} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-bg">Cancel</button>
              <button onClick={handleGenerate} disabled={generating || !prompt.trim()} className="flex-1 rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50">
                {generating ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

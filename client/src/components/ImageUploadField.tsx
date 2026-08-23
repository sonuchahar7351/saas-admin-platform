"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, Images } from "lucide-react";
import { mediaApi } from "../lib/media-api";
import { MediaPickerModal } from "./media/MediaPickerModal";

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
          {uploading && (
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
    </div>
  );
}

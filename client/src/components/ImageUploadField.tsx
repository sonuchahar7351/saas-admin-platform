"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { mediaApi } from "../lib/media-api";

export function ImageUploadField({
  label,
  category,
  mediaId,
  onChange,
}: {
  label: string;
  category: string;
  mediaId: string | null;
  onChange: (mediaId: string | null, previewUrl: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {preview || mediaId ? (
        <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border">
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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-text-secondary hover:border-accent hover:text-accent"
        >
          <Upload size={18} />
          <span className="text-xs">Click to upload</span>
        </button>
      )}
    </div>
  );
}

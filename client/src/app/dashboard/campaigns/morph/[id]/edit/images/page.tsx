"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { X, Plus } from "lucide-react";
import { campaignsApi } from "@/lib/campaigns-api";
import { MediaPickerModal } from "@/components/media/MediaPickerModal";

export default function CampaignImagesPage() {
  const { id } = useParams();
  const [banners, setBanners] = useState<{ id: string; url: string }[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    campaignsApi.getById(id as string).then(({ data }: any) => {
      setBanners(
        (data.bannerImageIds || []).map((imgId: string, i: number) => ({
          id: imgId,
          url: data.bannerImageUrls?.[i] || "",
        })),
      );
    });
  }, [id]);

  const save = async (nextIds: string[]) => {
    setSaving(true);
    try {
      await campaignsApi.update(
        id as string,
        { bannerImageIds: nextIds } as any,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = (items: { id: string; url: string }[]) => {
    const nextBanners = [
      ...banners,
      ...items.filter((i) => !banners.some((b) => b.id === i.id)),
    ];
    setBanners(nextBanners);
    save(nextBanners.map((b) => b.id));
  };

  const handleRemove = (imgId: string) => {
    const next = banners.filter((b) => b.id !== imgId);
    setBanners(next);
    save(next.map((b) => b.id));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Banner images</p>
          <p className="text-xs text-text-secondary">
            Shown in the campaign's image carousel on the storefront.
          </p>
        </div>
        <button
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus size={15} /> Add images
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-text-secondary">
          No banner images yet.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <img src={b.url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => handleRemove(b.id)}
                className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {saving && <p className="mt-2 text-xs text-text-secondary">Saving…</p>}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        defaultCategory="CAMPAIGN"
        multiple
        onSelect={handleAdd}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  campaignUpdatesApi,
  CampaignUpdate,
} from "../../lib/campaign-updates-api";
import { StoryRenderer } from "../StoryRenderer";
import { ImageLightbox } from "../ImageLightBox";

export function UpdatesTimeline({ campaignId }: { campaignId: string }) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  useEffect(() => {
    campaignUpdatesApi
      .getByCampaign(campaignId)
      .then(({ data }) => setUpdates(data));
  }, [campaignId]);

  if (updates.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 font-heading text-xl font-semibold">Updates</h2>
      <div className="space-y-8 border-l border-border pl-5">
        {updates.map((u) => {
          const allImages = u.glimpses.flatMap((g) =>
            g.images.map((i) => i.url).filter(Boolean),
          ) as string[];

          return (
            <div key={u.id} className="relative">
              <span className="absolute -left-6.5 top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
              <p className="text-xs text-text-muted">
                {new Date(u.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="mt-1 font-heading text-base font-semibold">
                {u.title}
              </p>
              <div className="mt-1 text-sm text-text-muted">
                <StoryRenderer content={u.content} />
              </div>

              {u.glimpses.length > 0 && (
                <div className="mt-4 space-y-3">
                  {u.glimpses.map((g) => {
                    const glimpseImages = g.images
                      .map((i) => i.url)
                      .filter(Boolean) as string[];
                    if (glimpseImages.length === 0) return null;

                    return (
                      <div
                        key={g.id}
                        className="grid grid-cols-3 gap-2 sm:grid-cols-4"
                      >
                        {glimpseImages.map((url, i) => (
                          <button
                            key={i}
                            onClick={() =>
                              setLightbox({
                                images: allImages,
                                index: allImages.indexOf(url),
                              })
                            }
                            className="aspect-square overflow-hidden rounded-lg border border-border"
                          >
                            <img
                              src={url}
                              alt=""
                              className="h-full w-full object-cover transition-transform hover:scale-105"
                            />
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

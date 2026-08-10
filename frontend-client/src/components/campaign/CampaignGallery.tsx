"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CampaignGallery({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return null;

  return (
    <div>
      <div className="relative h-72 overflow-hidden rounded-2xl sm:h-96">
        <img
          src={images[index]}
          alt=""
          className="h-full w-full object-cover transition-opacity duration-300"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setIndex((i) => (i - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${i === index ? "border-accent" : "border-transparent opacity-70"}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

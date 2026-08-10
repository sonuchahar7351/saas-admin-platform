"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { testimonialsApi, HomepageTestimonial } from "../lib/testimonials-api";

export function TestimonialsSection() {
  const [items, setItems] = useState<HomepageTestimonial[]>([]);

  useEffect(() => {
    testimonialsApi.getForHomepage().then(({ data }) => setItems(data));
  }, []);

  if (items.length === 0) return null; // honest empty state — section just doesn't render rather than showing fake content

  return (
    <section className="my-20">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
          Stories from our donors
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <Quote size={18} className="text-accent/40" />
            <p className="mt-3 text-sm text-text-muted">{t.description}</p>
            <div className="mt-4 flex items-center gap-2.5 border-t border-border pt-4">
              {t.imageUrl ? (
                <img
                  src={t.imageUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-xs font-medium">
                  {t.name[0]}
                </div>
              )}
              <div>
                <p className="text-xs font-medium">{t.name}</p>
                {t.designation && (
                  <p className="text-xs text-text-muted">{t.designation}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

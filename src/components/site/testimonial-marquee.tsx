"use client";

import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  TestimonialMarquee — two rows of continuously scrolling cards      */
/*  (top row drifts left, bottom row drifts right; pauses on hover)    */
/* ------------------------------------------------------------------ */

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

function MarqueeCard({ t, dark }: { t: Testimonial; dark?: boolean }) {
  const isBn = t.language === "bn";
  return (
    <figure
      className={cn(
        "flex w-[300px] shrink-0 flex-col rounded-3xl p-6 sm:w-[360px] sm:p-7",
        dark
          ? "bg-white/6 ring-1 ring-white/12"
          : "border border-blue-100/70 bg-white shadow-[0_12px_36px_-18px_rgba(0,32,96,0.18)]"
      )}
    >
      <div className="flex items-center justify-between">
        <Quote
          className={cn(
            "h-6 w-6 rotate-180",
            dark ? "text-amber-400/90" : "text-brand-blue/70"
          )}
          aria-hidden="true"
        />
        <span
          className="flex items-center gap-0.5"
          aria-label={`${t.rating} out of 5 stars`}
        >
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star
              key={i}
              className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
          ))}
        </span>
      </div>
      <blockquote
        className={cn(
          "mt-4 line-clamp-4 flex-1 text-sm leading-relaxed",
          isBn && "font-heading",
          dark ? "text-blue-50" : "text-slate-600"
        )}
      >
        {t.text}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-blue-100/60 pt-4 dark:border-white/10">
        <Avatar className="h-10 w-10 border-2 border-amber-200">
          <AvatarFallback className="font-heading text-xs font-bold text-brand-navy">
            {initialsOf(t.name)}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 text-left">
          <span
            className={cn(
              "block truncate text-sm font-bold",
              isBn && "font-heading",
              dark ? "text-white" : "text-brand-navy"
            )}
          >
            {t.name}
          </span>
          {t.treatment && (
            <span
              className={cn(
                "block truncate text-xs",
                dark ? "text-blue-200/75" : "text-slate-500"
              )}
            >
              {t.treatment}
              {t.location ? ` • ${t.location}` : ""}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

function MarqueeRow({
  items,
  direction,
  dark,
  duration,
}: {
  items: Testimonial[];
  direction: "left" | "right";
  dark?: boolean;
  duration: number;
}) {
  /* Repeat the set 4× and translate −50% → one half = 2 sets,
     wide enough for a seamless loop on any viewport. */
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className="marquee-edge-fade group/row overflow-hidden">
      <ul
        className={cn(
          "animate-marquee-x flex w-max gap-5",
          direction === "right" && "marquee-reverse"
        )}
        style={{ animationDuration: `${duration}ms` }}
        aria-hidden={false}
      >
        {loop.map((t, i) => (
          <li key={`${t.name}-${i}`}>
            <MarqueeCard t={t} dark={dark} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TestimonialMarquee({
  testimonials,
  dark = false,
}: {
  testimonials: Testimonial[];
  dark?: boolean;
}) {
  if (testimonials.length === 0) return null;
  /* split into two rows — even indices top (drift left),
     odd indices bottom (drift right) */
  const rowA = testimonials.filter((_, i) => i % 2 === 0);
  const rowB = testimonials.filter((_, i) => i % 2 === 1);
  /* ensure both rows have content even with 1 testimonial */
  if (rowB.length === 0) rowB.push(testimonials[0]);

  return (
    <div
      className="space-y-5"
      role="region"
      aria-label="Patient testimonials"
    >
      <MarqueeRow
        items={rowA}
        direction="left"
        dark={dark}
        duration={48000}
      />
      <MarqueeRow
        items={rowB}
        direction="right"
        dark={dark}
        duration={56000}
      />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Testimonial carousel — autoplay, swipe-friendly, bilingual         */
/* ------------------------------------------------------------------ */

export function TestimonialCarousel({
  testimonials,
  dark = false,
}: {
  testimonials: Testimonial[];
  dark?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = testimonials.length;

  const next = useCallback(
    () => setIndex((i) => (i + 1) % count),
    [count]
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const t = testimonials[index];
  const initials = t.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const isBn = t.language === "bn";

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx > 48) prev();
        else if (dx < -48) next();
        touchStartX.current = null;
      }}
    >
      <div className="relative min-h-[340px] sm:min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.figure
            key={index}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "mx-auto flex h-full max-w-3xl flex-col items-center rounded-[2rem] px-6 py-10 text-center sm:px-12",
              dark
                ? "bg-white/5 ring-1 ring-white/10"
                : "border border-blue-100/70 bg-white shadow-[0_16px_50px_-20px_rgba(0,32,96,0.18)]"
            )}
            aria-live="polite"
          >
            <Quote
              className={cn(
                "h-9 w-9 rotate-180",
                dark ? "text-amber-400/90" : "text-brand-blue/80"
              )}
              aria-hidden="true"
            />
            <div className="mt-4 flex items-center gap-1" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4.5 w-4.5 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
              ))}
            </div>
            <blockquote
              className={cn(
                "mt-5 flex-1 text-base leading-relaxed sm:text-lg",
                isBn && "font-heading",
                dark ? "text-blue-50" : "text-slate-700"
              )}
            >
              {t.text}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-4">
              <Avatar className="h-13 w-13 border-2 border-amber-200">
                <AvatarFallback className="font-heading font-bold text-brand-navy">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-left">
                <span
                  className={cn(
                    "block text-sm font-bold",
                    isBn && "font-heading",
                    dark ? "text-white" : "text-brand-navy"
                  )}
                >
                  {t.name}
                </span>
                {t.treatment && (
                  <span
                    className={cn(
                      "block text-xs",
                      dark ? "text-blue-200/80" : "text-slate-500"
                    )}
                  >
                    {t.treatment}
                    {t.location ? ` • ${t.location}` : ""}
                  </span>
                )}
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous testimonial"
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 transition-all duration-300",
            dark
              ? "bg-white/10 text-white ring-white/20 hover:bg-brand-blue"
              : "bg-blue-50 text-brand-navy ring-blue-100 hover:bg-brand-blue hover:text-white"
          )}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial selector">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-400",
                i === index
                  ? "w-8 bg-brand-blue"
                  : dark
                    ? "w-2 bg-white/30 hover:bg-white/60"
                    : "w-2 bg-blue-200 hover:bg-brand-blue/60"
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next testimonial"
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 transition-all duration-300",
            dark
              ? "bg-white/10 text-white ring-white/20 hover:bg-brand-blue"
              : "bg-blue-50 text-brand-navy ring-blue-100 hover:bg-brand-blue hover:text-white"
          )}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

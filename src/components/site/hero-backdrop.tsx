"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroSlide } from "@/lib/data/hero-media";
import {
  HERO_IMAGE_DURATION_MS,
  HERO_VIDEO_DURATION_MS,
} from "@/lib/data/hero-media";
import { useBundle } from "@/components/site/content-provider";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  HeroBackdrop — full-bleed background media layer                   */
/*                                                                     */
/*  • Images advance every 5s and zoom in slowly across that window    */
/*  • YouTube videos play muted/looping for 20s, then advance          */
/*  • The exact image → video order comes from the admin-managed       */
/*    HeroSlide rows (Configuration → Hero → playlist)                 */
/*  • Always-on navy gradient overlay for text readability             */
/*  • Optional clickable indicator bars                                */
/* ------------------------------------------------------------------ */

type HeroBackdropProps = {
  slides: HeroSlide[];
  /** How long each image stays on screen (ms). */
  imageDuration?: number;
  /** How long each video stays on screen (ms). */
  videoDuration?: number;
  overlay?: "deep" | "medium" | "light";
  indicators?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export function HeroBackdrop({
  slides,
  imageDuration = HERO_IMAGE_DURATION_MS,
  videoDuration = HERO_VIDEO_DURATION_MS,
  overlay = "deep",
  indicators = false,
  priority = false,
  className,
  sizes = "100vw",
}: HeroBackdropProps) {
  const count = slides.length;
  const [active, setActive] = useState(0);

  /* Keep the index valid if the admin removes slides while the page is
     open (live content refresh) — otherwise the rotation could point at
     a slide that no longer exists. */
  const safeActive = count > 0 ? active % count : 0;

  useEffect(() => {
    if (count <= 1) return;
    let timer: number | undefined;

    const schedule = () => {
      const current = slides[safeActive];
      const duration = current?.type === "youtube" ? videoDuration : imageDuration;
      timer = window.setTimeout(() => {
        setActive((i) => (i + 1) % count);
      }, duration);
    };

    /* Pause while the tab is hidden (saves battery + avoids a burst of
       skipped slides), then restart the current slide's full duration
       when the visitor comes back. */
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (timer) window.clearTimeout(timer);
        schedule();
      } else if (timer) {
        window.clearTimeout(timer);
        timer = undefined;
      }
    };

    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [safeActive, count, imageDuration, videoDuration, slides]);

  if (count === 0) return null;
  const current = slides[safeActive];

  return (
    <>
      {/* media + overlay layer (purely decorative) */}
      <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
        {/* navy base (behind everything) */}
        <span className="absolute inset-0 bg-brand-navy" />

        {/* image layers — stacked, crossfading, slow zoom-in */}
        {slides.map((slide, i) => {
          if (slide.type !== "image") return null;
          const isActive = i === safeActive;
          return (
            <div
              key={`${slide.type}-${slide.src}-${i}`}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1600ms] ease-out",
                isActive ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                priority={priority && i === 0}
                sizes={sizes}
                style={
                  isActive
                    ? { animationDuration: `${imageDuration}ms` }
                    : undefined
                }
                className={cn("object-cover", isActive && "hero-kenburns")}
              />
            </div>
          );
        })}

        {/* active YouTube video layer (cover-fit) */}
        {current?.type === "youtube" && (
          <div
            className="hero-media-box absolute inset-0"
            style={{ containerType: "size" } as React.CSSProperties}
          >
            <iframe
              key={`${current.id}-${safeActive}`}
              className="hero-video-frame"
              src={`https://www.youtube.com/embed/${current.id}?autoplay=1&mute=1&loop=1&playlist=${current.id}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&cc_load_policy=0`}
              title="Clinic video"
              allow="autoplay; encrypted-media; picture-in-picture"
              tabIndex={-1}
            />
          </div>
        )}

        {/* overlay — navy gradients for readability. "light" keeps the
            photos/videos clearly visible while large bold white type
            still passes contrast against the gradient. */}
        <span
          className={cn(
            "absolute inset-0",
            overlay === "deep"
              ? "bg-brand-navy/72"
              : overlay === "medium"
                ? "bg-brand-navy/55"
                : "bg-brand-navy/46"
          )}
        />
        <span
          className={cn(
            "absolute inset-0 bg-gradient-to-b",
            overlay === "deep"
              ? "from-brand-navy/90 via-brand-navy/25 to-brand-navy/95"
              : overlay === "medium"
                ? "from-brand-navy/80 via-brand-navy/10 to-brand-navy/85"
                : "from-brand-navy/78 via-brand-navy/32 to-brand-navy/85"
          )}
        />
        {/* subtle side vignette */}
        <span
          className={cn(
            "absolute inset-0 bg-gradient-to-r via-transparent",
            overlay === "light"
              ? "from-brand-navy/25 to-brand-navy/25"
              : "from-brand-navy/45 to-brand-navy/45"
          )}
        />
      </div>

      {/* indicator bars (interactive → outside the aria-hidden layer) */}
      {indicators && count > 1 && (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={`${slide.type}-${i}`}
              type="button"
              aria-label={`Show hero slide ${i + 1}`}
              aria-current={i === safeActive}
              onClick={() => setActive(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === safeActive
                  ? "w-9 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  : "w-4 bg-white/35 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  SiteHeroBackdrop — HeroBackdrop wired to the live CMS settings.    */
/*  Every page hero uses this so the timing configured in the admin    */
/*  panel (defaults: image 5s · video 20s) applies everywhere.         */
/* ------------------------------------------------------------------ */

export function SiteHeroBackdrop({
  slides,
  ...props
}: Omit<HeroBackdropProps, "imageDuration" | "videoDuration">) {
  const { settings } = useBundle();
  const imageSeconds = Number(settings?.heroImageDuration) || 5;
  const videoSeconds = Number(settings?.heroVideoDuration) || 20;
  return (
    <HeroBackdrop
      slides={slides}
      imageDuration={Math.max(1, imageSeconds) * 1000}
      videoDuration={Math.max(1, videoSeconds) * 1000}
      {...props}
    />
  );
}

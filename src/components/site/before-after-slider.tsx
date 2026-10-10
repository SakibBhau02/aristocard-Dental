"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  BeforeAfterSlider — draggable comparison slider (clip-path based)  */
/* ------------------------------------------------------------------ */

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  className,
  rounded = "rounded-[1.75rem]",
}: {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  className?: string;
  rounded?: string;
}) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      updateFromClientX(e.clientX);
    },
    [updateFromClientX]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      updateFromClientX(e.clientX);
    },
    [updateFromClientX]
  );

  const stopDrag = useCallback(() => {
    draggingRef.current = false;
    setDragging(false);
  }, []);

  /* Keyboard support on the handle */
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPosition((p) => Math.max(0, p - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPosition((p) => Math.min(100, p + 5));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`group relative aspect-square select-none overflow-hidden ${rounded} ring-1 ring-blue-100 ${className ?? ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrag}
      onPointerLeave={stopDrag}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-label="Before and after comparison slider — drag to compare"
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={{ cursor: dragging ? "grabbing" : "ew-resize", touchAction: "none" }}
    >
      {/* After (base layer) */}
      <Image
        src={afterSrc}
        alt={afterAlt}
        fill
        sizes="(max-width: 768px) 92vw, 440px"
        className="object-cover"
        draggable={false}
      />

      {/* Before layer — clipped with clip-path (no nested width math) */}
      <Image
        src={beforeSrc}
        alt={beforeAlt}
        fill
        sizes="(max-width: 768px) 92vw, 440px"
        className="object-cover"
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />

      {/* Labels */}
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-brand-navy/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        Before
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-emerald-500/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        After
      </span>

      {/* Divider line + handle */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_16px_rgba(30,125,255,0.65)]"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white bg-brand-blue text-white shadow-xl shadow-blue-900/40 transition-transform duration-300 group-hover:scale-110">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 fill-current"
            aria-hidden="true"
          >
            <path d="M8.05 16.59 12.64 12 8.05 7.41 9.46 6l6 6-6 6-1.41-1.41zM15.95 6l-1.41 1.41L19.12 12l-4.58 4.59L15.95 18l6-6-6-6z" />
          </svg>
        </span>
      </div>
    </div>
  );
}

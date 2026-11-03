"use client";

import { useCallback, useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Auto-hiding chrome (header + floating buttons)                     */
/*                                                                     */
/*  Reading-first behaviour for a media-heavy marketing site:          */
/*  • scrolling DOWN hides the header so hero photos/videos are clear  */
/*  • scrolling UP brings it straight back                             */
/*  • moving the pointer to the top edge (or tab-focusing inside it)   */
/*    also brings it back — desktop users never have to hunt for it    */
/*  • near the top of the page it is always visible                    */
/* ------------------------------------------------------------------ */

type Options = {
  /** Scroll distance before hiding kicks in. */
  threshold?: number;
  /** Below this scroll offset the header is always shown. */
  topReveal?: number;
  /** Pointer distance from the top edge that reveals the header. */
  pointerZone?: number;
};

export function useAutoHideHeader({
  threshold = 140,
  topReveal = 80,
  pointerZone = 90,
}: Options = {}) {
  const [hidden, setHidden] = useState(false);

  const reveal = useCallback(() => setHidden(false), []);
  const hide = useCallback(() => setHidden(true), []);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const measure = () => {
      ticking = false;
      const y = window.scrollY;

      if (y <= topReveal) {
        setHidden(false);
        lastY = y;
        return;
      }

      /* Ignore tiny jitters (trackpads emit ±1px constantly). */
      if (Math.abs(y - lastY) < 6) return;

      if (y > lastY && y > threshold) setHidden(true);
      else if (y < lastY) setHidden(false);

      lastY = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    /* Desktop: nudging the pointer to the top edge reveals the header
       before the user reaches the navigation. */
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.clientY <= pointerZone) {
        setHidden(false);
      }
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [threshold, topReveal, pointerZone]);

  return { hidden, reveal, hide };
}

/* ------------------------------------------------------------------ */
/*  Direction-only helper for floating elements (FAB stack)            */
/* ------------------------------------------------------------------ */

export function useScrollDirection({ threshold = 80 } = {}) {
  const [down, setDown] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const measure = () => {
      ticking = false;
      const y = window.scrollY;
      if (y < threshold) {
        setDown(false);
        lastY = y;
        return;
      }
      if (Math.abs(y - lastY) < 8) return;
      setDown(y > lastY);
      lastY = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return down;
}

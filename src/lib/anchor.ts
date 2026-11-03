"use client";

/* ------------------------------------------------------------------ */
/*  In-page section scrolling for the client-side router               */
/*                                                                     */
/*  The public site renders one page at a time inside AnimatePresence  */
/*  (mode="wait"), so a plain "#section" link would be swallowed by the */
/*  link interceptor and the target section does not exist yet at      */
/*  click time. These helpers navigate first, then scroll once the      */
/*  section has mounted and the layout has settled.                     */
/* ------------------------------------------------------------------ */

const NAV_OFFSET = 92;

/** True while the user is actively scrolling — stop fighting them. */
function makeInterruptGuard() {
  let interrupted = false;
  const stop = () => {
    interrupted = true;
  };
  const opts = { passive: true } as AddEventListenerOptions;
  window.addEventListener("wheel", stop, opts);
  window.addEventListener("touchmove", stop, opts);
  window.addEventListener("keydown", stop, opts);
  return {
    get interrupted() {
      return interrupted;
    },
    dispose() {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", stop);
    },
  };
}

/**
 * Scroll to #id.
 *
 * Waits for the section to mount (the page transition takes a few frames),
 * then re-asserts the position for a short window: the router scrolls the
 * window to the top on navigation and lazily-loaded images keep shifting
 * the layout, so a single scroll call can be undone.
 */
export function scrollToId(id: string, maxFrames = 150) {
  if (typeof window === "undefined") return;
  const guard = makeInterruptGuard();

  const settle = (element: HTMLElement, framesLeft: number) => {
    if (guard.interrupted || framesLeft <= 0) {
      guard.dispose();
      return;
    }
    const top = element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    const desired = Math.max(top, 0);
    if (Math.abs(window.scrollY - desired) > 6) {
      window.scrollTo({ top: desired, behavior: "instant" as ScrollBehavior });
    }
    window.requestAnimationFrame(() => settle(element, framesLeft - 1));
  };

  const wait = (framesLeft: number) => {
    if (guard.interrupted || framesLeft <= 0) {
      guard.dispose();
      return;
    }
    const element = document.getElementById(id);
    if (!element) {
      window.requestAnimationFrame(() => wait(framesLeft - 1));
      return;
    }
    /* Give the router's own scroll-to-top effect a beat, then hold the
       position for ~1.5s (~90 frames): lazy images keep shifting the
       layout above the target, so a single scroll call drifts. */
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => settle(element, 90))
    );
  };

  window.requestAnimationFrame(() => wait(maxFrames));
}

/** Navigate to a route, then scroll to a section on it. */
export function goToSection(
  navigate: (to: string) => void,
  path: string,
  id: string
) {
  navigate(path);
  scrollToId(id);
}

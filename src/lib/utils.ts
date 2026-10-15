import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useSyncExternalStore } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* Platform-aware search-shortcut label: ⌘K on Apple devices, Ctrl K
 * everywhere else (Windows / Linux / Android). Uses the same
 * useSyncExternalStore pattern as the router: the server snapshot (⌘K)
 * hydrates byte-identical, then the client snapshot takes over after
 * hydration — no setState-in-effect, no hydration mismatch.        */
const NOOP_SUBSCRIBE = () => () => {};

function platformShortcutLabel(): string {
  if (typeof navigator === "undefined") return "⌘K";
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "⌘K" : "Ctrl K";
}

export function useSearchShortcutLabel(): string {
  return useSyncExternalStore(
    NOOP_SUBSCRIBE,
    platformShortcutLabel,
    () => "⌘K"
  );
}

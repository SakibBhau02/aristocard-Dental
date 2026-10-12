"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { useRouter } from "@/lib/router";
import { useLang } from "@/lib/i18n";
import { useBundle } from "@/components/site/content-provider";

/* ------------------------------------------------------------------ */
/*  Floating quick-contact buttons (mobile-first) + scroll-to-top      */
/*  Scroll-to-top carries a gradient progress ring that fills as the   */
/*  page scrolls — position feedback at a glance.                       */
/* ------------------------------------------------------------------ */

/* Ring geometry: 48×48 viewBox, r=21 → circumference ≈ 131.9 */
const RING_R = 21;
const RING_C = 2 * Math.PI * RING_R;

export function FloatingContact() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const { settings } = useBundle();
  const [showTop, setShowTop] = useState(false);
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const measure = () => {
      ticking.current = false;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setShowTop(y > 700);
      setProgress(max > 0 ? Math.min(1, Math.max(0, y / max)) : 1);
    };
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <motion.div
        className="fab-stack fixed bottom-5 right-5 z-40 flex flex-col items-end gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <a
          href={`https://wa.me/${settings.phoneRaw.replace("+", "")}?text=${encodeURIComponent(
            lang === "bn"
              ? "আসসালামু আলাইকুম, আমি Aristocrat Dental Care-এ অ্যাপয়েন্টমেন্ট নিতে চাই।"
              : "Hello, I would like to book an appointment at Aristocrat Dental Care."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp (opens in new tab)"
          className="group relative inline-flex h-13 w-13 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-600/40 ring-4 ring-white/60 backdrop-blur transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        >
          <span
            className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse-ring"
            aria-hidden="true"
          />
          <MessageCircle className="relative h-5.5 w-5.5" aria-hidden="true" />
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 sm:block">
            {d.fab.whatsapp}
          </span>
        </a>

        <a
          href={`tel:${settings.phoneRaw}`}
          aria-label={`Call ${settings.phone}`}
          className="group relative inline-flex h-13 w-13 items-center justify-center rounded-full bg-brand-blue text-white shadow-xl shadow-blue-600/40 ring-4 ring-white/60 backdrop-blur transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        >
          <Phone className="h-5.5 w-5.5" aria-hidden="true" />
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 sm:block">
            {settings.phone}
          </span>
        </a>

        <button
          type="button"
          onClick={() => navigate("/appointment")}
          aria-label="Book appointment online"
          className="group relative inline-flex h-13 w-13 items-center justify-center rounded-full bg-brand-navy text-white shadow-xl shadow-navy-900/50 ring-4 ring-white/60 backdrop-blur transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        >
          <CalendarCheck className="h-5.5 w-5.5" aria-hidden="true" />
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 sm:block">
            {d.fab.book}
          </span>
        </button>
      </motion.div>

      {/* Scroll-to-top (bottom-left, away from the contact stack) —
          gradient progress ring fills as the page scrolls */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            onClick={scrollTop}
            aria-label="Scroll back to top"
            className="scroll-top-btn fixed bottom-5 left-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-navy shadow-xl shadow-navy-900/15 ring-1 ring-blue-100 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-navy hover:text-white hover:shadow-2xl"
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.85 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ring sits just inside the button edge; arrow above it */}
            <svg
              viewBox="0 0 48 48"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="adc-scroll-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#002060" />
                  <stop offset="55%" stopColor="#1e7dff" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <circle
                className="scroll-ring-track"
                cx="24"
                cy="24"
                r={RING_R}
                fill="none"
                strokeWidth="2.5"
              />
              <circle
                className="scroll-ring-fill"
                cx="24"
                cy="24"
                r={RING_R}
                fill="none"
                strokeWidth="2.5"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - progress)}
              />
            </svg>
            <ArrowUp className="relative h-5 w-5" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

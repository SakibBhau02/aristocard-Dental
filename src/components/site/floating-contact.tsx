"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { useRouter } from "@/lib/router";
import { useLang } from "@/lib/i18n";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Floating quick-contact buttons (mobile-first) + scroll-to-top      */
/* ------------------------------------------------------------------ */

export function FloatingContact() {
  const { navigate } = useRouter();
  const { d } = useLang();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <motion.div
        className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <a
          href={`https://wa.me/${site.phoneRaw.replace("+", "")}`}
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
          href={`tel:${site.phoneRaw}`}
          aria-label={`Call ${site.phone}`}
          className="group relative inline-flex h-13 w-13 items-center justify-center rounded-full bg-brand-blue text-white shadow-xl shadow-blue-600/40 ring-4 ring-white/60 backdrop-blur transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        >
          <Phone className="h-5.5 w-5.5" aria-hidden="true" />
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 sm:block">
            {site.phone}
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

      {/* Scroll-to-top (bottom-left, away from the contact stack) */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            onClick={scrollTop}
            aria-label="Scroll back to top"
            className="fixed bottom-5 left-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-navy shadow-xl shadow-navy-900/15 ring-1 ring-blue-100 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-navy hover:text-white hover:shadow-2xl"
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.85 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ArrowUp className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

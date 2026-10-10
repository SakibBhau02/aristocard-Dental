"use client";

import { motion } from "framer-motion";
import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { useRouter } from "@/lib/router";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Floating quick-contact buttons (mobile-first)                      */
/* ------------------------------------------------------------------ */

export function FloatingContact() {
  const { navigate } = useRouter();

  return (
    <motion.div
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href={`https://wa.me/${site.phoneRaw.replace("+", "")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp (opens in new tab)"
        className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/40 transition-transform duration-300 hover:scale-110"
      >
        <span
          className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse-ring"
          aria-hidden="true"
        />
        <MessageCircle className="relative h-5.5 w-5.5" aria-hidden="true" />
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 sm:block">
          WhatsApp us
        </span>
      </a>

      <a
        href={`tel:${site.phoneRaw}`}
        aria-label={`Call ${site.phone}`}
        className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-white shadow-xl shadow-blue-500/40 transition-transform duration-300 hover:scale-110"
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
        className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-white shadow-xl shadow-navy-900/40 ring-1 ring-white/25 transition-transform duration-300 hover:scale-110"
      >
        <CalendarCheck className="h-5.5 w-5.5" aria-hidden="true" />
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 sm:block">
          Book appointment
        </span>
      </button>
    </motion.div>
  );
}

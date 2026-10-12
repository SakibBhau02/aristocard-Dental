"use client";

import { motion } from "framer-motion";
import {
  CalendarCheck,
  Compass,
  HelpCircle,
  Home,
  Phone,
  Stethoscope,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang } from "@/lib/i18n";
import { useBundle } from "@/components/site/content-provider";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  404 — bilingual, helpful destinations (EN / বাংলা)                 */
/* ------------------------------------------------------------------ */

export function NotFoundPage() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const { settings } = useBundle();
  const bn = lang === "bn";

  usePageMeta({
    title: "Page Not Found (404)",
    description:
      "The page you're looking for doesn't exist or has moved. Explore our dental services, doctors or book an appointment instead.",
  });

  const destinations = [
    {
      label: d.chrome.nav.home,
      hint: bn ? "আমাদের সম্পর্কে সবকিছু" : "Everything about us",
      to: "/",
      Icon: Home,
    },
    {
      label: d.chrome.nav.services,
      hint: bn ? "১১টি বিশেষ চিকিৎসা" : "11 specialty treatments",
      to: "/services",
      Icon: Stethoscope,
    },
    {
      label: d.chrome.nav.doctors,
      hint: bn ? "বিশেষজ্ঞ ডেন্টিস্ট প্যানেল" : "Our specialist panel",
      to: "/doctors",
      Icon: Compass,
    },
    {
      label: bn ? "সাধারণ জিজ্ঞাসা" : "FAQs",
      hint: bn ? "৫০+ প্রশ্নের উত্তর" : "50+ answered questions",
      to: "/faqs",
      Icon: HelpCircle,
    },
  ];

  return (
    <section className="hero-mesh relative overflow-hidden px-4 py-24 text-center sm:py-28">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl">
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/50"
        >
          <Compass className="h-10 w-10 text-brand-blue" aria-hidden="true" />
          <span className="absolute -right-1 -top-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 font-heading text-xs font-bold text-brand-navy shadow-lg">
            404
          </span>
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="font-heading mt-8 text-3xl font-bold text-brand-navy text-balance sm:text-4xl"
        >
          {bn ? "এই পৃষ্ঠাটি হারিয়ে গেছে" : "This page wandered off"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14 }}
          className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600"
        >
          {bn
            ? "আপনি যে পৃষ্ঠাটি খুঁজছেন তা নেই বা সরানো হয়েছে। চলুন সুস্থ হাসির পথে ফিরে আসি।"
            : "The page you're looking for doesn't exist or has moved. Let's get you back to a healthy smile."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <Button
            asChild
            className="btn-shine rounded-full bg-brand-blue px-8 py-6 font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-brand-navy"
          >
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
              className="inline-flex items-center gap-2"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              {bn ? "হোমে ফিরুন" : "Back to Home"}
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-brand-blue/30 px-8 py-6 font-bold text-brand-navy hover:bg-blue-50"
          >
            <a
              href="#/appointment"
              onClick={(e) => {
                e.preventDefault();
                navigate("/appointment");
              }}
              className="inline-flex items-center gap-2"
            >
              <CalendarCheck className="h-5 w-5 text-brand-blue" aria-hidden="true" />
              {d.chrome.book}
            </a>
          </Button>
        </motion.div>

        {/* destination cards */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {destinations.map((dest, i) => (
            <motion.button
              key={dest.to}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28 + i * 0.06 }}
              onClick={() => navigate(dest.to)}
              className="card-shine group rounded-2xl border border-blue-100/80 bg-white p-4 text-left shadow-[0_10px_30px_-16px_rgba(0,32,96,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_18px_40px_-16px_rgba(30,125,255,0.3)]"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand-blue ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-110">
                <dest.Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <span className="mt-3 block text-sm font-bold text-brand-navy">
                {dest.label}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">{dest.hint}</span>
            </motion.button>
          ))}
        </div>

        <p className="mt-10 inline-flex items-center gap-2 text-sm text-slate-500">
          <Phone className="h-4 w-4 text-brand-blue" aria-hidden="true" />
          {bn ? "সাহায্য দরকার? কল করুন" : "Need help? Call"}{" "}
          <a
            href={`tel:${settings.phoneRaw}`}
            className="font-bold text-brand-blue underline decoration-blue-200 underline-offset-4 hover:text-brand-navy"
          >
            {settings.phone}
          </a>
        </p>
      </div>
    </section>
  );
}

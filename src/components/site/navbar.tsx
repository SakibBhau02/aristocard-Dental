"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Clock, Menu, Phone, X } from "lucide-react";
import { useRouter } from "@/lib/router";
import { useLang } from "@/lib/i18n";
import { navItems, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/site/language-toggle";

/* ------------------------------------------------------------------ */
/*  Navbar — sticky, glass on scroll, mobile drawer, EN/বাংলা toggle   */
/* ------------------------------------------------------------------ */

export function Navbar() {
  const { path, navigate } = useRouter();
  const { d } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    const target = href.replace("#", "");
    if (target === "/") return path === "/";
    return path === target || path.startsWith(`${target}/`);
  };

  const navigateAndClose = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  /* localized nav labels — order matches navItems in site.ts */
  const navLabels = [
    d.chrome.nav.home,
    d.chrome.nav.about,
    d.chrome.nav.services,
    d.chrome.nav.gallery,
    d.chrome.nav.doctors,
    d.chrome.nav.blog,
    d.chrome.nav.pricing,
    d.chrome.nav.contact,
  ];

  return (
    <>
      {/* Top info bar */}
      <div className="hidden bg-brand-navy text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
          <div className="flex items-center gap-5 text-blue-100/90">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              {d.chrome.hours}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              {d.chrome.hotline} {site.phone}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold tracking-wide text-amber-200">
              {d.chrome.tagline}
            </span>
            <span className="h-3.5 w-px bg-white/20" aria-hidden="true" />
            <LanguageToggle variant="pill" />
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "glass border-b border-blue-100/70 shadow-[0_8px_30px_-12px_rgba(0,32,96,0.25)]"
            : "bg-white"
        )}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              navigateAndClose("/");
            }}
            className="group flex items-center gap-3"
            aria-label="Aristocrat Dental Care & Orthodontic Center — Home"
          >
            <div className="relative h-11 w-auto">
              <Image
                src="/logo.png"
                alt="Aristocrat Dental Care & Orthodontic Center logo"
                width={176}
                height={39}
                priority
                className="h-full w-auto object-contain transition-opacity duration-300"
              />
            </div>
          </a>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item, i) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateAndClose(item.href.replace("#", ""));
                    }}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-3 py-2 text-[13px] font-semibold transition-colors duration-300 xl:px-3.5 xl:text-sm",
                      active
                        ? "text-brand-blue"
                        : "text-slate-700 hover:text-brand-blue"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-blue-100/90 shadow-[inset_0_0_0_1px_rgba(30,125,255,0.18)]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {navLabels[i]}
                    <span
                      className={cn(
                        "absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-gold transition-all duration-300",
                        active ? "opacity-100 scale-100" : "opacity-0 scale-0"
                      )}
                      aria-hidden="true"
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          {/* CTA + mobile lang toggle */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              className="relative hidden overflow-hidden rounded-full bg-brand-blue px-6 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy hover:shadow-xl hover:shadow-blue-700/25 lg:inline-flex"
            >
              <a
                href="#/appointment"
                onClick={(e) => {
                  e.preventDefault();
                  navigateAndClose("/appointment");
                }}
                className="inline-flex items-center gap-2"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {d.chrome.book}
              </a>
            </Button>

            {/* Mobile language toggle */}
            <LanguageToggle variant="compact" className="lg:hidden" />

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-brand-navy ring-1 ring-blue-100 transition-colors hover:bg-blue-50 lg:hidden"
              aria-expanded={open}
              aria-label={open ? d.chrome.closeMenu : d.chrome.openMenu}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-brand-navy/45 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-2xl lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              role="dialog"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b border-blue-50 px-5 py-4">
                <Image
                  src="/logo.png"
                  alt="Aristocrat Dental Care logo"
                  width={160}
                  height={36}
                  className="h-9 w-auto object-contain"
                />
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 ring-1 ring-blue-100"
                  onClick={() => setOpen(false)}
                  aria-label={d.chrome.closeMenu}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <ul className="flex-1 overflow-y-auto px-4 py-6">
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateAndClose(item.href.replace("#", ""));
                      }}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-5 py-4 text-base font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-blue-50 text-brand-blue"
                          : "text-slate-700 hover:bg-blue-50/60 hover:text-brand-blue"
                      )}
                    >
                      {navLabels[i]}
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" aria-hidden="true" />
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="space-y-3 border-t border-blue-50 p-5">
                <div className="flex items-center justify-between rounded-2xl bg-ice px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {d.chrome.langLabel}
                  </span>
                  <LanguageToggle
                    variant="pill"
                    className="bg-white ring-blue-100"
                  />
                </div>
                <Button
                  asChild
                  className="w-full rounded-2xl bg-brand-blue py-6 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-brand-navy"
                >
                  <a
                    href="#/appointment"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateAndClose("/appointment");
                    }}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                    {d.chrome.book}
                  </a>
                </Button>
                <a
                  href={`tel:${site.phoneRaw}`}
                  className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-brand-navy ring-1 ring-blue-100"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {site.phone}
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

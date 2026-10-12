"use client";

/* ------------------------------------------------------------------ */
/*  ADMIN — modular staff shell (#/admin)                              */
/*  • Login gate: passcode → POST /api/admin/login (httpOnly session    */
/*    cookie, 8h); session probed via GET /api/admin/session.          */
/*  • Professional sidebar shell (desktop lg+) with grouped modules:   */
/*    Dashboard · Bookings · Engagement · Content · Configuration.     */
/*    Mobile: top bar + hamburger → Sheet drawer.                      */
/*  • Panels live in ./panels/* — the six live modules were extracted  */
/*    verbatim from the former monolithic page; the nine CMS modules   */
/*    are wired placeholders pending their editors.                    */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  CircleHelp,
  Home,
  Inbox,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mails,
  Menu,
  MonitorPlay,
  Newspaper,
  Settings,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { usePageMeta } from "@/lib/router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AdminView } from "./admin-shared";
import { OverviewPanel } from "./panels/overview-panel";
import { AppointmentsPanel } from "./panels/appointments-panel";
import { ReviewsPanel } from "./panels/reviews-panel";
import { MessagesPanel } from "./panels/messages-panel";
import { SubscribersPanel } from "./panels/subscribers-panel";
import { PatientsPanel } from "./panels/patients-panel";
import { DoctorsPanel } from "./panels/doctors-panel";
import { BlogPanel } from "./panels/blog-panel";
import { FaqsPanel } from "./panels/faqs-panel";
import { CasesPanel } from "./panels/cases-panel";
import { ServicesPanel } from "./panels/services-panel";
import { HomepagePanel } from "./panels/homepage-panel";
import { AboutPanel } from "./panels/about-panel";
import { HeroPanel } from "./panels/hero-panel";
import { SettingsPanel } from "./panels/settings-panel";

const LEGACY_SESSION_KEY = "adc-admin-code"; /* pre-session era; cleared on boot */

/* ------------------------------------------------------------------ */
/*  Sidebar navigation model                                            */
/* ------------------------------------------------------------------ */

type NavEntry = {
  id: AdminView;
  label: string;
  title: string;
  description: string;
  icon: typeof LayoutDashboard;
  badge?: "appointments" | "reviews" | "messages";
};

type BadgeState = {
  appointments: number | null;
  reviews: number | null;
  messages: number | null;
};

const NAV_GROUPS: { label: string; items: NavEntry[] }[] = [
  {
    label: "Dashboard",
    items: [
      {
        id: "overview",
        label: "Overview",
        title: "Clinic Overview",
        description: "Cross-module KPIs, the 14-day booking trend and quick jumps into every module.",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Bookings",
    items: [
      {
        id: "appointments",
        label: "Appointments",
        title: "Appointment Dashboard",
        description: "Bookings & schedules — confirm, complete or cancel patient visits.",
        icon: CalendarDays,
        badge: "appointments",
      },
    ],
  },
  {
    label: "Engagement",
    items: [
      {
        id: "reviews",
        label: "Reviews",
        title: "Review Moderation",
        description: "Approve, reject or delete patient reviews before they appear on the site.",
        icon: Star,
        badge: "reviews",
      },
      {
        id: "messages",
        label: "Messages",
        title: "Message Inbox",
        description: "Contact-form messages with reply links and handled/new triage.",
        icon: Inbox,
        badge: "messages",
      },
      {
        id: "subscribers",
        label: "Subscribers",
        title: "Newsletter Subscribers",
        description: "The clinic newsletter mailing list with CSV export.",
        icon: Mails,
      },
      {
        id: "patients",
        label: "Patients",
        title: "Patient Accounts",
        description: "Portal accounts with expandable booking drilldowns.",
        icon: Users,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        id: "doctors",
        label: "Doctors",
        title: "Doctors",
        description: "Manage the doctor directory — profiles, credentials, photos and order.",
        icon: Stethoscope,
      },
      {
        id: "blog",
        label: "Blog Posts",
        title: "Blog Posts",
        description: "Write, publish and update dental health articles.",
        icon: Newspaper,
      },
      {
        id: "faqs",
        label: "FAQs",
        title: "FAQs",
        description: "Frequently asked questions shown across the website.",
        icon: CircleHelp,
      },
      {
        id: "cases",
        label: "Smile Cases",
        title: "Smile Cases",
        description: "Before/after smile transformation case gallery.",
        icon: Smile,
      },
      {
        id: "services",
        label: "Services",
        title: "Services",
        description: "Treatment catalogue — names, imagery and per-service details.",
        icon: Sparkles,
      },
      {
        id: "homepage",
        label: "Homepage",
        title: "Homepage Content",
        description: "Hero copy, highlights and the homepage section blocks.",
        icon: Home,
      },
      {
        id: "about",
        label: "About Page",
        title: "About Page Content",
        description: "Story, timeline and facility blocks for the about page.",
        icon: Building2,
      },
      {
        id: "hero",
        label: "Hero & Videos",
        title: "Hero Slides & Videos",
        description: "Background slides and YouTube videos behind page heroes.",
        icon: MonitorPlay,
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        id: "settings",
        label: "Site Settings",
        title: "Site Settings",
        description: "Clinic contact details, socials and global configuration.",
        icon: Settings,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  AdminPage — session gate + shell                                    */
/* ------------------------------------------------------------------ */

export function AdminPage() {
  usePageMeta({
    title: "Admin — Staff Dashboard",
    description: "Staff-only clinic management dashboard.",
  });

  /* noindex for this back-office page */
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    meta.dataset.adminNoindex = "true";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  const [authState, setAuthState] = useState<"checking" | "locked" | "open">(
    "checking"
  );

  /* Restore an existing cookie session (and clear any legacy
     pre-session-era key) — the passcode is never re-sent or stored. */
  useEffect(() => {
    try {
      sessionStorage.removeItem(LEGACY_SESSION_KEY);
    } catch {
      /* ignore */
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/session");
        if (!cancelled) setAuthState(res.ok ? "open" : "locked");
      } catch {
        if (!cancelled) setAuthState("locked");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* clearing the local state matters more than the network call */
    }
    setAuthState("locked");
  }, []);

  if (authState === "checking") return <AdminBoot />;

  return authState === "open" ? (
    <AdminShell onLogout={handleLogout} />
  ) : (
    <AdminGate onUnlock={() => setAuthState("open")} />
  );
}

/* ------------------------------------------------------------------ */
/*  Boot state while restoring the cookie session                       */
/* ------------------------------------------------------------------ */

function AdminBoot() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-brand-navy via-[#022450] to-[#011a34] px-4 py-24">
      <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center gap-4"
      >
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-blue-100/80">Checking your session…</p>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Passcode gate (visuals polished; auth logic unchanged)              */
/* ------------------------------------------------------------------ */

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (checking) return;
    setError(null);
    setChecking(true);
    try {
      /* The passcode travels once, in this request body — the server
         responds with an httpOnly session cookie that does the rest. */
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value.trim() }),
      });
      if (res.status === 401) {
        setError("Incorrect passcode. Please try again.");
        return;
      }
      if (res.status === 429) {
        setError("Too many attempts. Please wait a few minutes and try again.");
        return;
      }
      if (!res.ok) throw new Error("Server error");
      onUnlock();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-brand-navy via-[#022450] to-[#011a34] px-4 py-20">
      <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-blue/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 right-[12%] h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="mb-7 text-center">
          <p className="font-heading text-xl font-bold tracking-wide text-white">
            Aristocrat Dental Care
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300/90">
            Admin Panel
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-shine rounded-[2rem] border border-white/40 bg-white p-8 shadow-[0_32px_80px_-24px_rgba(0,10,40,0.7)] sm:p-10"
        >
          <div className="flex items-center justify-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-navy to-brand-blue text-white shadow-lg shadow-navy-900/30 ring-1 ring-blue-900/20">
              <Lock className="h-7 w-7" aria-hidden="true" />
            </span>
          </div>
          <h1 className="font-heading mt-6 text-center text-2xl font-bold text-brand-navy">
            Staff Access Only
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
            Enter the clinic admin passcode to manage appointments and site
            content. This area is for Aristocrat Dental Care staff.
          </p>

          <label htmlFor="admin-code" className="sr-only">
            Admin passcode
          </label>
          <input
            id="admin-code"
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Admin passcode"
            className="mt-7 h-13 w-full rounded-2xl border border-blue-100 bg-ice px-5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
          />

          {error && (
            <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600 ring-1 ring-rose-100">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={checking || value.trim().length === 0}
            className="mt-5 h-12 w-full rounded-2xl bg-brand-navy text-sm font-bold text-white shadow-lg shadow-navy-900/25 hover:bg-brand-blue disabled:opacity-60"
          >
            {checking ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
            )}
            Unlock Dashboard
          </Button>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-400">
            You'll stay signed in for 8 hours on this device. Demo passcode:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
              aristocrat-2026
            </code>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Session expired interstitial                                        */
/* ------------------------------------------------------------------ */

function SessionExpiredCard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="max-w-md rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <Lock className="mx-auto h-8 w-8 text-amber-600" aria-hidden="true" />
        <h2 className="font-heading mt-4 text-lg font-bold text-amber-900">
          Session expired
        </h2>
        <p className="mt-2 text-sm text-amber-800">
          Your session ended (it expires after 8 hours for security).
          Please sign in again to continue.
        </p>
        <Button onClick={onLogout} className="mt-5 rounded-full bg-amber-600 hover:bg-amber-700">
          Back to sign-in
        </Button>
      </div>
    </div>
  );
}

/* Resolve the active module's header metadata (title / description /
   icon / group label). Cheap lookup — no memoization needed. */
function navMeta(view: AdminView) {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => i.id === view);
    if (item) return { ...item, group: group.label };
  }
  return { ...NAV_GROUPS[0].items[0], group: NAV_GROUPS[0].label };
}

/* ------------------------------------------------------------------ */
/*  AdminShell — sidebar + content area + mobile Sheet                  */
/* ------------------------------------------------------------------ */

function AdminShell({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<AdminView>("overview");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [badges, setBadges] = useState<BadgeState>({
    appointments: null,
    reviews: null,
    messages: null,
  });

  const handleExpired = useCallback(() => setSessionExpired(true), []);
  const setAppointmentsBadge = useCallback(
    (n: number) => setBadges((b) => ({ ...b, appointments: n })),
    []
  );
  const setReviewsBadge = useCallback(
    (n: number) => setBadges((b) => ({ ...b, reviews: n })),
    []
  );
  const setMessagesBadge = useCallback(
    (n: number) => setBadges((b) => ({ ...b, messages: n })),
    []
  );
  const syncBadges = useCallback(
    (appointments: number, reviews: number, messages: number) =>
      setBadges({ appointments, reviews, messages }),
    []
  );

  /* One light call carries every sidebar badge count before the staff
     member opens each view. (Cookie auth — no header.) */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/overview");
        if (res.status === 401) {
          setSessionExpired(true);
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data) return;
        setBadges({
          appointments: data.appointmentStats?.pending ?? 0,
          reviews: data.reviewStats?.pendingApproval ?? 0,
          messages: data.messageStats?.unhandled ?? 0,
        });
      } catch {
        /* badges are best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const navigate = useCallback((next: AdminView) => {
    setView(next);
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  }, []);

  const meta = navMeta(view);

  if (sessionExpired) return <SessionExpiredCard onLogout={onLogout} />;

  let panel: React.ReactNode = null;
  switch (view) {
    case "overview":
      panel = (
        <OverviewPanel
          onSessionExpired={handleExpired}
          onNavigate={navigate}
          onBadgeCounts={syncBadges}
        />
      );
      break;
    case "appointments":
      panel = (
        <AppointmentsPanel
          onSessionExpired={handleExpired}
          onPendingChange={setAppointmentsBadge}
        />
      );
      break;
    case "reviews":
      panel = (
        <ReviewsPanel
          onSessionExpired={handleExpired}
          onPendingChange={setReviewsBadge}
        />
      );
      break;
    case "messages":
      panel = (
        <MessagesPanel
          onSessionExpired={handleExpired}
          onUnhandledChange={setMessagesBadge}
        />
      );
      break;
    case "subscribers":
      panel = <SubscribersPanel onSessionExpired={handleExpired} />;
      break;
    case "patients":
      panel = <PatientsPanel onSessionExpired={handleExpired} />;
      break;
    case "doctors":
      panel = <DoctorsPanel onSessionExpired={handleExpired} />;
      break;
    case "blog":
      panel = <BlogPanel onSessionExpired={handleExpired} />;
      break;
    case "faqs":
      panel = <FaqsPanel onSessionExpired={handleExpired} />;
      break;
    case "cases":
      panel = <CasesPanel onSessionExpired={handleExpired} />;
      break;
    case "services":
      panel = <ServicesPanel onSessionExpired={handleExpired} />;
      break;
    case "homepage":
      panel = <HomepagePanel onSessionExpired={handleExpired} />;
      break;
    case "about":
      panel = <AboutPanel onSessionExpired={handleExpired} />;
      break;
    case "hero":
      panel = <HeroPanel onSessionExpired={handleExpired} />;
      break;
    case "settings":
      panel = <SettingsPanel onSessionExpired={handleExpired} />;
      break;
  }

  return (
    <div className="section-wash flex-1 pb-16 lg:pb-20">
      <div className="lg:flex lg:min-h-screen lg:items-start">
        {/* Desktop sidebar — sticks to the viewport while content scrolls
            (the site navbar scrolls away; offset 0 keeps it flush) */}
        <aside className="hidden w-64 shrink-0 lg:sticky lg:top-0 lg:block lg:h-screen lg:flex-col bg-gradient-to-b from-brand-navy via-[#022450] to-[#011a34] text-white">
          <SidebarChrome
            view={view}
            badges={badges}
            onNavigate={navigate}
            onLogout={onLogout}
          />
        </aside>

        {/* Content column */}
        <div className="min-w-0 flex-1">
          {/* Mobile admin bar */}
          <div className="border-b border-blue-100 bg-white/90 backdrop-blur lg:hidden">
            <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNavOpen(true)}
                aria-label="Open admin navigation"
                className="rounded-xl border-blue-200 text-brand-navy hover:bg-blue-50"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
              <div className="min-w-0 flex-1">
                <p className="font-heading truncate text-sm font-bold text-brand-navy">
                  Aristocrat Admin
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {meta.group}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                aria-label="Sign out"
                title="Sign out"
                className="rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Module header strip */}
          <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            <header className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-lg shadow-navy-900/25">
                <meta.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Admin · {meta.group}
                </p>
                <h1 className="font-heading truncate text-xl font-bold text-brand-navy">
                  {meta.title}
                </h1>
              </div>
              <p className="ml-auto hidden max-w-sm text-right text-sm leading-relaxed text-slate-500 md:block lg:max-w-md">
                {meta.description}
              </p>
            </header>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 md:hidden">
              {meta.description}
            </p>
          </div>

          {/* Active panel */}
          <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8 lg:pt-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                {panel}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent
          side="left"
          className="w-80 gap-0 border-0 bg-gradient-to-b from-brand-navy via-[#022450] to-[#011a34] p-0 text-white sm:max-w-none"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
            <SheetDescription>Switch between admin modules</SheetDescription>
          </SheetHeader>
          <SidebarChrome
            view={view}
            badges={badges}
            onNavigate={navigate}
            onLogout={onLogout}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SidebarChrome — header + grouped nav + footer (shared by aside      */
/*  and the mobile Sheet)                                               */
/* ------------------------------------------------------------------ */

function SidebarChrome({
  view,
  badges,
  onNavigate,
  onLogout,
}: {
  view: AdminView;
  badges: BadgeState;
  onNavigate: (view: AdminView) => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 font-heading text-lg font-black text-brand-navy shadow-lg shadow-amber-900/20"
          aria-hidden="true"
        >
          A
        </span>
        <div className="min-w-0">
          <p className="font-heading truncate text-sm font-bold leading-tight text-white">
            Aristocrat Dental Care
          </p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/70">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Grouped navigation */}
      <nav
        className="scroll-area min-h-0 flex-1 overflow-y-auto px-3 py-4"
        aria-label="Admin modules"
      >
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && "mt-5")}>
            <p className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-300/60">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  active={view === item.id}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge ? badges[item.badge] : undefined}
                  onClick={() => onNavigate(item.id)}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-white/10 p-3">
        <a
          href="#/"
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-blue-200/70 transition-colors duration-200 hover:bg-white/5 hover:text-white"
        >
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5">
            <Home className="h-4 w-4" aria-hidden="true" />
          </span>
          View site
        </a>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-rose-300/80 transition-colors duration-200 hover:bg-rose-500/10 hover:text-rose-200"
        >
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5">
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </span>
          Sign out
        </button>
      </div>
    </div>
  );
}

function SidebarItem({
  active,
  label,
  icon: Icon,
  badge,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number | null;
  onClick: () => void;
}) {
  return (
    <li className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-200",
          active
            ? "bg-white/10 text-white"
            : "text-blue-200/70 hover:bg-white/5 hover:text-white"
        )}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-amber-400"
            aria-hidden="true"
          />
        )}
        <span
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
            active ? "bg-white/15 text-amber-300" : "bg-white/5 text-blue-200/80"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {typeof badge === "number" && badge > 0 && (
          <span className="shrink-0 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-brand-navy">
            {badge}
          </span>
        )}
      </button>
    </li>
  );
}

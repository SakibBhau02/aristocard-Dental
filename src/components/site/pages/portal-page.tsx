"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarClock,
  CalendarX2,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Hash,
  Info,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserRound,
  UserRoundPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { usePageMeta, useRouter } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { useBundle } from "@/components/site/content-provider";
import { PageHeader } from "@/components/site/shared";
import { Reveal } from "@/components/site/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/data/dictionary";

/* ------------------------------------------------------------------ */
/*  PATIENT PORTAL — quick check, login/register, full dashboard        */
/*  (EN / বাংলা). Session lives in an httpOnly cookie — the ONLY way   */
/*  to know the state is GET /api/patient/me (200 vs 401).            */
/* ------------------------------------------------------------------ */

type ApptStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

type PatientProfile = {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

type PatientAppointment = {
  id: string;
  refCode: string;
  name: string;
  phone: string;
  email: string | null;
  date: string; // YYYY-MM-DD
  time: string; // "10:00 AM" style
  doctorSlug: string | null;
  serviceSlug: string | null;
  notes: string | null;
  status: ApptStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
};

type PatientReview = {
  id: string;
  rating: number;
  title: string | null;
  message: string;
  serviceSlug: string | null;
  approved: boolean;
  createdAt: string;
};

type DashboardData = {
  patient: PatientProfile;
  appointments: PatientAppointment[];
  reviews: PatientReview[];
  stats: {
    totalAppointments: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    reviews: number;
  };
};

type Mode = "quick" | "login" | "register";

/* Same visual language as the status page's badges */
const statusStyles: Record<ApptStatus, { badge: string; dot: string; icon: LucideIcon }> = {
  PENDING: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  CONFIRMED: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    icon: BadgeCheck,
  },
  COMPLETED: {
    badge: "bg-blue-50 text-brand-blue ring-blue-200",
    dot: "bg-brand-blue",
    icon: CheckCircle2,
  },
  CANCELLED: {
    badge: "bg-rose-50 text-rose-600 ring-rose-200",
    dot: "bg-rose-400",
    icon: XCircle,
  },
};

const PHONE_RE = /^01[3-9]\d{8}$/;
/* Matches the backend's own validation messages, shown client-side too */
const PHONE_ERROR = "Please provide a valid Bangladeshi mobile number (e.g. 01712345678).";
const NAME_ERROR = "Please enter your full name (min 2 characters).";
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function formatDateLabel(iso: string, lang: Lang): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(
    lang === "bn" ? "bn-BD" : "en-GB",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );
}

function formatShortDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function localTodayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

/* ------------------------------------------------------------------ */
/*  Shared bits                                                         */
/* ------------------------------------------------------------------ */

function StatusBadge({ status, lang }: { status: ApptStatus; lang: Lang }) {
  const { d } = useLang();
  const style = statusStyles[status] ?? statusStyles.PENDING;
  const label = d.statusPage.status[status]?.label ?? status;
  const StatusIcon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ring-1",
        style.badge
      )}
    >
      <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
      {lang === "bn" ? toBnDigits(label) : label}
    </span>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <motion.p
      id={id}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-1.5 text-xs font-medium text-rose-600"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </motion.p>
  );
}

/* Password input with the eye toggle */
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  showLabel,
  hideLabel,
  className,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  showLabel: string;
  hideLabel: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          "h-13 rounded-2xl border-blue-100 bg-ice/60 pr-12 text-base font-semibold text-brand-navy placeholder:font-normal placeholder:text-slate-400 focus:border-brand-blue focus:bg-white",
          className
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-blue-50 hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
      >
        {visible ? (
          <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
        ) : (
          <Eye className="h-4.5 w-4.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

function PhoneField({
  id,
  value,
  onChange,
  label,
  hint,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-brand-navy">
        {label} <span className="text-rose-500">*</span>
      </Label>
      <div className="relative">
        <Phone
          className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, "").slice(0, 11))}
          inputMode="numeric"
          placeholder="01XXXXXXXXX"
          autoComplete="tel"
          className="h-13 rounded-2xl border-blue-100 bg-ice/60 pl-11 text-base font-semibold tracking-wide text-brand-navy placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-brand-blue focus:bg-white"
        />
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/* Inline API/error banner */
function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-sm text-rose-700"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                           */
/* ------------------------------------------------------------------ */

export function PortalPage() {
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.portalPage;
  const { toast } = useToast();
  const { navigate } = useRouter();
  const { services, doctors, settings } = useBundle();

  usePageMeta({
    title: "Patient Portal — Bookings & Dental Records",
    description:
      "Check your Aristocrat Dental Care bookings instantly with your phone number, or create a free patient account for your full visit history, treatment notes and one-tap cancelling.",
  });

  /* --- session / dashboard ------------------------------------------ */
  const [session, setSession] = useState<"checking" | "guest" | "authed">("checking");
  const [dash, setDash] = useState<DashboardData | null>(null);

  const refreshDashboard = useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        const res = await fetch("/api/patient/me", { credentials: "same-origin" });
        if (res.ok) {
          setDash((await res.json()) as DashboardData);
          setSession("authed");
          return true;
        }
        /* 401 — not (or no longer) signed in */
        setDash(null);
        setSession("guest");
        if (!opts?.silent) {
          toast({ title: t.sessionExpired, variant: "destructive" });
        }
        return false;
      } catch {
        setSession("guest");
        return false;
      }
    },
    [t, toast]
  );

  /* Probe the session once on mount (httpOnly cookie rides along) */
  useEffect(() => {
    void refreshDashboard({ silent: true });
  }, []);

  /* --- auth card mode ----------------------------------------------- */
  const [mode, setMode] = useState<Mode>("quick");

  /* --- quick check --------------------------------------------------- */
  const [quickPhone, setQuickPhone] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState("");
  const [quickResults, setQuickResults] = useState<PatientAppointment[] | null>(null);

  const submitQuickCheck = async (e?: FormEvent) => {
    e?.preventDefault();
    if (quickLoading) return;
    setQuickError("");
    setQuickResults(null);
    const phone = quickPhone.trim();
    if (!PHONE_RE.test(phone)) {
      setQuickError(PHONE_ERROR);
      return;
    }
    setQuickLoading(true);
    try {
      const res = await fetch(`/api/appointments?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (!res.ok) {
        setQuickError(data.error ?? t.toastGenericFail);
      } else {
        const found = (data.appointments ?? []) as PatientAppointment[];
        setQuickResults(found);
        if (found.length === 0) setQuickError(t.quickEmpty);
      }
    } catch {
      setQuickError(t.toastGenericFailDesc.replace("{phone}", settings.phone));
    } finally {
      setQuickLoading(false);
    }
  };

  /* --- login --------------------------------------------------------- */
  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const switchMode = useCallback((next: Mode) => {
    setMode(next);
    setQuickError("");
    setLoginError("");
    setRegisterError("");
  }, []);

  /* Upsell → jump to the login tab with the phone pre-filled */
  const goToLoginWithPhone = (phone: string) => {
    setLoginForm((f) => ({ ...f, phone }));
    switchMode("login");
  };

  const submitLogin = async (e?: FormEvent) => {
    e?.preventDefault();
    if (loggingIn) return;
    setLoginError("");
    const phone = loginForm.phone.trim();
    if (!PHONE_RE.test(phone)) {
      setLoginError(PHONE_ERROR);
      return;
    }
    if (!loginForm.password) return;
    setLoggingIn(true);
    try {
      const res = await fetch("/api/patient/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: loginForm.password }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error ?? t.toastLoginFail);
        toast({ title: t.toastLoginFail, description: data.error, variant: "destructive" });
        return;
      }
      toast({ title: t.toastLoginOk, description: t.toastLoginOkDesc });
      setLoginForm((f) => ({ ...f, password: "" }));
      await refreshDashboard({ silent: true });
    } catch {
      setLoginError(t.toastGenericFailDesc.replace("{phone}", settings.phone));
    } finally {
      setLoggingIn(false);
    }
  };

  /* --- register ------------------------------------------------------ */
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registering, setRegistering] = useState(false);

  const registerValid =
    registerForm.name.trim().length >= 2 &&
    registerForm.phone.length === 11 &&
    registerForm.password.length >= 8;

  const submitRegister = async (e?: FormEvent) => {
    e?.preventDefault();
    if (registering) return;
    setRegisterError("");
    const f = registerForm;
    if (f.name.trim().length < 2) {
      setRegisterError(NAME_ERROR);
      return;
    }
    const phone = f.phone.trim();
    if (!PHONE_RE.test(phone)) {
      setRegisterError(PHONE_ERROR);
      return;
    }
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
      setRegisterError("Please provide a valid email address.");
      return;
    }
    if (!PASSWORD_RE.test(f.password)) {
      setRegisterError(t.registerPasswordHint);
      return;
    }
    if (f.password !== f.confirm) {
      setRegisterError(t.registerMismatch);
      return;
    }
    setRegistering(true);
    try {
      const res = await fetch("/api/patient/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name.trim(),
          phone,
          email: f.email.trim() || undefined,
          password: f.password,
        }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error ?? t.toastRegisterFail);
        toast({ title: t.toastRegisterFail, description: data.error, variant: "destructive" });
        return;
      }
      toast({ title: t.toastRegisterOk, description: t.toastRegisterOkDesc });
      setRegisterForm({ name: "", phone: "", email: "", password: "", confirm: "" });
      await refreshDashboard({ silent: true });
    } catch {
      setRegisterError(t.toastGenericFailDesc.replace("{phone}", settings.phone));
    } finally {
      setRegistering(false);
    }
  };

  /* --- logout -------------------------------------------------------- */
  const [loggingOut, setLoggingOut] = useState(false);
  const doLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/patient/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      /* network hiccup — still reset locally */
    } finally {
      setLoggingOut(false);
      setDash(null);
      setSession("guest");
      setQuickResults(null);
      setQuickPhone("");
      switchMode("quick");
      toast({ title: t.toastLoggedOut, description: t.toastLoggedOutDesc });
    }
  };

  /* --- cancel (session-verified — no phone re-entry) ------------------ */
  const [cancelTarget, setCancelTarget] = useState<PatientAppointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const performCancel = async () => {
    if (!cancelTarget || cancelling) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/patient/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refCode: cancelTarget.refCode }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: t.toastCancelFail,
          description: data.error ?? t.toastGenericFailDesc.replace("{phone}", settings.phone),
          variant: "destructive",
        });
        return;
      }
      toast({ title: t.toastCancelOk, description: t.toastCancelOkDesc });
      const ref = cancelTarget.refCode;
      setDash((prev) =>
        prev
          ? {
              ...prev,
              appointments: prev.appointments.map((a) =>
                a.refCode === ref ? { ...a, status: "CANCELLED" as const } : a
              ),
              stats: {
                ...prev.stats,
                upcoming: Math.max(0, prev.stats.upcoming - 1),
                cancelled: prev.stats.cancelled + 1,
              },
            }
          : prev
      );
      setCancelTarget(null);
    } catch {
      toast({
        title: t.toastCancelFail,
        description: t.toastGenericFailDesc.replace("{phone}", settings.phone),
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  /* --- profile settings ---------------------------------------------- */
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const startEditProfile = () => {
    if (!dash) return;
    setProfileForm({ name: dash.patient.name, email: dash.patient.email ?? "" });
    setProfileError("");
    setEditingProfile(true);
  };

  const submitProfile = async (e?: FormEvent) => {
    e?.preventDefault();
    if (savingProfile || !dash) return;
    setProfileError("");
    const name = profileForm.name.trim();
    if (name.length < 2) {
      setProfileError("Name must be at least 2 characters.");
      return;
    }
    if (profileForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      setProfileError("Please provide a valid email address.");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/patient/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: profileForm.email.trim() || undefined }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error ?? t.toastGenericFail);
        toast({ title: t.toastGenericFail, description: data.error, variant: "destructive" });
        return;
      }
      toast({ title: t.toastProfileOk, description: data.message });
      setEditingProfile(false);
      await refreshDashboard({ silent: true });
    } catch {
      setProfileError(t.toastGenericFailDesc.replace("{phone}", settings.phone));
    } finally {
      setSavingProfile(false);
    }
  };

  /* --- change password ----------------------------------------------- */
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const submitPassword = async (e?: FormEvent) => {
    e?.preventDefault();
    if (savingPw) return;
    setPwError("");
    if (!pwForm.current) return;
    if (!PASSWORD_RE.test(pwForm.next)) {
      setPwError(t.registerPasswordHint);
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError(t.registerMismatch);
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/patient/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error ?? t.toastGenericFail);
        return;
      }
      toast({ title: t.toastPasswordOk, description: data.message });
      setPwForm({ current: "", next: "", confirm: "" });
    } catch {
      setPwError(t.toastGenericFailDesc.replace("{phone}", settings.phone));
    } finally {
      setSavingPw(false);
    }
  };

  /* --- derived dashboard lists ---------------------------------------- */
  const todayISO = localTodayISO();
  const isUpcoming = (a: PatientAppointment) =>
    (a.status === "PENDING" || a.status === "CONFIRMED") && a.date >= todayISO;

  const upcoming =
    dash?.appointments.filter(isUpcoming).sort((a, b) =>
      a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
    ) ?? [];
  /* Full reverse-chronological record of every booking (API order: date desc) */
  const history = dash?.appointments ?? [];

  /* ================================================================== */
  /*  RENDER                                                             */
  /* ================================================================== */

  const modeTabs: { id: Mode; label: string; hint: string; icon: LucideIcon }[] = [
    { id: "quick", label: t.tabQuick, hint: t.tabQuickHint, icon: Search },
    { id: "login", label: t.tabLogin, hint: t.tabLoginHint, icon: UserRound },
    { id: "register", label: t.tabRegister, hint: t.tabRegisterHint, icon: UserRoundPlus },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[{ label: d.chrome.nav.home, to: "/" }, { label: t.breadcrumb }]}
      />

      <section className="hero-mesh relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
          {/* ---------- session probe ---------- */}
          {session === "checking" && (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center" aria-live="polite">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-lg shadow-blue-100 ring-1 ring-blue-100">
                <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-brand-navy/70">{t.loadingDashboard}</p>
            </div>
          )}

          {/* ---------- guest: auth card ---------- */}
          {session === "guest" && (
            <Reveal>
              <div className="rounded-[2rem] border border-blue-100/80 bg-white p-5 shadow-[0_24px_60px_-24px_rgba(0,32,96,0.25)] sm:p-8">
                {/* 3-way segmented control */}
                <div
                  className="relative mx-auto flex w-full max-w-xl rounded-2xl bg-ice p-1.5"
                  role="tablist"
                  aria-label={t.title}
                >
                  {modeTabs.map((tab) => {
                    const active = mode === tab.id;
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => switchMode(tab.id)}
                        className={cn(
                          "relative flex-1 rounded-xl px-2 py-2 transition-colors duration-300 sm:px-3",
                          active ? "text-white" : "text-brand-navy/70 hover:text-brand-navy"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="portal-mode-pill"
                            className="absolute inset-0 rounded-xl bg-brand-navy shadow-lg shadow-navy-900/25"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span className="relative flex flex-col items-center gap-0.5">
                          <span className="flex items-center gap-1.5 text-[13px] font-bold sm:text-sm">
                            <TabIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {tab.label}
                          </span>
                          <span
                            className={cn(
                              "text-center text-[10px] font-medium leading-tight sm:text-[11px]",
                              active ? "text-blue-200" : "text-slate-400"
                            )}
                          >
                            {tab.hint}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {/* ================= QUICK CHECK ================= */}
                  {mode === "quick" && (
                    <motion.div
                      key="quick"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="mt-7"
                    >
                      <div className="text-center">
                        <h2 className="font-heading text-xl font-bold text-brand-navy sm:text-2xl">
                          {t.quickTitle}
                        </h2>
                        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
                          {t.quickDesc}
                        </p>
                      </div>

                      <form onSubmit={submitQuickCheck} className="mx-auto mt-6 max-w-md">
                        <PhoneField
                          id="quick-phone"
                          value={quickPhone}
                          onChange={setQuickPhone}
                          label={t.quickPhoneLabel}
                          hint={t.quickPhoneHint}
                        />
                        <Button
                          type="submit"
                          disabled={quickLoading || quickPhone.length !== 11}
                          className="mt-6 h-13 w-full rounded-2xl bg-brand-blue text-base font-bold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy hover:shadow-xl disabled:translate-y-0 disabled:opacity-50"
                        >
                          {quickLoading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                              {t.quickSearching}
                            </>
                          ) : (
                            <>
                              <Search className="h-5 w-5" aria-hidden="true" />
                              {t.quickFind}
                            </>
                          )}
                        </Button>
                      </form>

                      <AnimatePresence>
                        {quickError && (
                          <div className="mx-auto mt-5 max-w-md">
                            <ErrorBanner message={quickError} />
                          </div>
                        )}
                      </AnimatePresence>

                      {/* results */}
                      <AnimatePresence>
                        {quickResults && quickResults.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="mt-8"
                            aria-live="polite"
                          >
                            <h3 className="font-heading text-lg font-bold text-brand-navy">
                              {t.quickResultsTitle.replace(
                                "{count}",
                                bn ? toBnDigits(quickResults.length) : String(quickResults.length)
                              )}
                            </h3>
                            <div className="mt-4 space-y-5">
                              {quickResults.map((appt, i) => (
                                <Reveal key={appt.refCode} delay={Math.min(i * 0.06, 0.3)}>
                                  <PortalAppointmentCard appt={appt} />
                                </Reveal>
                              ))}
                            </div>

                            {/* upsell → login with phone pre-filled */}
                            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-ice/70 p-5 sm:flex-row sm:items-center">
                              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm ring-1 ring-amber-100">
                                <Sparkles className="h-6 w-6" aria-hidden="true" />
                              </span>
                              <div className="flex-1">
                                <p className="font-heading text-sm font-bold text-brand-navy">
                                  {t.quickUpsellTitle}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                  {t.quickUpsellText}
                                </p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => goToLoginWithPhone(quickPhone.trim())}
                                className="h-12 shrink-0 rounded-2xl bg-brand-navy px-5 text-sm font-bold text-white shadow-lg shadow-navy-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-blue hover:shadow-xl"
                              >
                                <UserRound className="h-4 w-4" aria-hidden="true" />
                                {t.tabLogin}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* ================= LOGIN ================= */}
                  {mode === "login" && (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="mt-7"
                    >
                      <div className="text-center">
                        <h2 className="font-heading text-xl font-bold text-brand-navy sm:text-2xl">
                          {t.loginTitle}
                        </h2>
                        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
                          {t.loginDesc}
                        </p>
                      </div>

                      <form onSubmit={submitLogin} className="mx-auto mt-6 max-w-md" noValidate>
                        <PhoneField
                          id="login-phone"
                          value={loginForm.phone}
                          onChange={(v) => setLoginForm((f) => ({ ...f, phone: v }))}
                          label={t.loginPhoneLabel}
                        />
                        <div className="mt-4 space-y-2">
                          <Label htmlFor="login-password" className="text-sm font-semibold text-brand-navy">
                            {t.loginPasswordLabel} <span className="text-rose-500">*</span>
                          </Label>
                          <PasswordInput
                            id="login-password"
                            value={loginForm.password}
                            onChange={(v) => setLoginForm((f) => ({ ...f, password: v }))}
                            autoComplete="current-password"
                            showLabel={t.loginShow}
                            hideLabel={t.loginHide}
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={
                            loggingIn ||
                            loginForm.phone.length !== 11 ||
                            loginForm.password.length === 0
                          }
                          className="mt-6 h-13 w-full rounded-2xl bg-brand-blue text-base font-bold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy hover:shadow-xl disabled:translate-y-0 disabled:opacity-50"
                        >
                          {loggingIn ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                              {t.loginSubmitting}
                            </>
                          ) : (
                            <>
                              <UserRound className="h-5 w-5" aria-hidden="true" />
                              {t.loginSubmit}
                            </>
                          )}
                        </Button>

                        <p className="mt-4 text-center text-xs text-slate-500">
                          {t.loginNoAccount}{" "}
                          <button
                            type="button"
                            onClick={() => switchMode("register")}
                            className="font-semibold text-brand-blue underline-offset-4 transition-colors hover:text-brand-navy hover:underline"
                          >
                            {t.loginNoAccountCta}
                          </button>
                        </p>
                        <p className="mt-3 flex items-start justify-center gap-1.5 rounded-2xl bg-ice/60 px-4 py-3 text-center text-[11px] leading-relaxed text-slate-500 ring-1 ring-blue-100/50">
                          <Phone className="mt-0.5 h-3 w-3 shrink-0 text-brand-blue" aria-hidden="true" />
                          {t.loginForgot.replace("{phone}", bn ? toBnDigits(settings.phone) : settings.phone)}
                        </p>
                      </form>

                      <AnimatePresence>
                        {loginError && (
                          <div className="mx-auto mt-5 max-w-md">
                            <ErrorBanner message={loginError} />
                          </div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* ================= REGISTER ================= */}
                  {mode === "register" && (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="mt-7"
                    >
                      <div className="text-center">
                        <h2 className="font-heading text-xl font-bold text-brand-navy sm:text-2xl">
                          {t.registerTitle}
                        </h2>
                        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
                          {t.registerDesc}
                        </p>
                      </div>

                      <form
                        onSubmit={submitRegister}
                        className="mx-auto mt-6 max-w-md"
                        noValidate
                      >
                        <div className="space-y-2">
                          <Label htmlFor="register-name" className="text-sm font-semibold text-brand-navy">
                            {t.registerNameLabel} <span className="text-rose-500">*</span>
                          </Label>
                          <div className="relative">
                            <UserRound
                              className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                              aria-hidden="true"
                            />
                            <Input
                              id="register-name"
                              value={registerForm.name}
                              onChange={(e) =>
                                setRegisterForm((f) => ({ ...f, name: e.target.value.slice(0, 80) }))
                              }
                              placeholder={bn ? "আপনার নাম" : "Your full name"}
                              autoComplete="name"
                              className="h-13 rounded-2xl border-blue-100 bg-ice/60 pl-11 text-base font-semibold text-brand-navy placeholder:font-normal placeholder:text-slate-400 focus:border-brand-blue focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <PhoneField
                            id="register-phone"
                            value={registerForm.phone}
                            onChange={(v) => setRegisterForm((f) => ({ ...f, phone: v }))}
                            label={t.registerPhoneLabel}
                            hint={t.registerPhoneHint}
                          />
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label htmlFor="register-email" className="text-sm font-semibold text-brand-navy">
                            {t.registerEmailLabel}
                          </Label>
                          <div className="relative">
                            <Mail
                              className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                              aria-hidden="true"
                            />
                            <Input
                              id="register-email"
                              type="email"
                              value={registerForm.email}
                              onChange={(e) =>
                                setRegisterForm((f) => ({ ...f, email: e.target.value.slice(0, 120) }))
                              }
                              placeholder="you@example.com"
                              autoComplete="email"
                              className="h-13 rounded-2xl border-blue-100 bg-ice/60 pl-11 text-base text-brand-navy placeholder:font-normal placeholder:text-slate-400 focus:border-brand-blue focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label htmlFor="register-password" className="text-sm font-semibold text-brand-navy">
                            {t.registerPasswordLabel} <span className="text-rose-500">*</span>
                          </Label>
                          <PasswordInput
                            id="register-password"
                            value={registerForm.password}
                            onChange={(v) => setRegisterForm((f) => ({ ...f, password: v }))}
                            autoComplete="new-password"
                            showLabel={t.loginShow}
                            hideLabel={t.loginHide}
                          />
                          <p className="text-xs text-slate-500">{t.registerPasswordHint}</p>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label htmlFor="register-confirm" className="text-sm font-semibold text-brand-navy">
                            {t.registerConfirmLabel} <span className="text-rose-500">*</span>
                          </Label>
                          <PasswordInput
                            id="register-confirm"
                            value={registerForm.confirm}
                            onChange={(v) => setRegisterForm((f) => ({ ...f, confirm: v }))}
                            autoComplete="new-password"
                            showLabel={t.loginShow}
                            hideLabel={t.loginHide}
                          />
                          <FieldError
                            id="register-confirm-error"
                            message={
                              registerForm.confirm && registerForm.confirm !== registerForm.password
                                ? t.registerMismatch
                                : undefined
                            }
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={registering || !registerValid}
                          className="mt-6 h-13 w-full rounded-2xl bg-brand-navy text-base font-bold text-white shadow-lg shadow-navy-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-blue hover:shadow-xl disabled:translate-y-0 disabled:opacity-50"
                        >
                          {registering ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                              {t.registerSubmitting}
                            </>
                          ) : (
                            <>
                              <UserRoundPlus className="h-5 w-5" aria-hidden="true" />
                              {t.registerSubmit}
                            </>
                          )}
                        </Button>

                        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-ice/60 px-4 py-3 text-[11px] leading-relaxed text-slate-500 ring-1 ring-blue-100/50">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                          {t.registerLinkNote}
                        </div>

                        <p className="mt-4 text-center text-xs text-slate-500">
                          {t.registerHaveAccount}{" "}
                          <button
                            type="button"
                            onClick={() => switchMode("login")}
                            className="font-semibold text-brand-blue underline-offset-4 transition-colors hover:text-brand-navy hover:underline"
                          >
                            {t.registerHaveAccountCta}
                          </button>
                        </p>
                      </form>

                      <AnimatePresence>
                        {registerError && (
                          <div className="mx-auto mt-5 max-w-md">
                            <ErrorBanner message={registerError} />
                          </div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          )}

          {/* ---------- authed: dashboard ---------- */}
          {session === "authed" && !dash && (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center" aria-live="polite">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-lg shadow-blue-100 ring-1 ring-blue-100">
                <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-brand-navy/70">{t.loadingDashboard}</p>
            </div>
          )}

          {session === "authed" && dash && (
            <div className="space-y-8">
              {/* ===== welcome banner ===== */}
              <Reveal>
                <div className="hero-mesh-dark noise relative overflow-hidden rounded-[2rem] p-6 shadow-2xl shadow-navy-900/30 sm:p-8">
                  <span
                    className="animate-glow-drift pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-blue/25 blur-3xl"
                    aria-hidden="true"
                  />
                  <span
                    className="animate-glow-drift pointer-events-none absolute -bottom-20 -left-14 h-48 w-48 rounded-full bg-teal-400/15 blur-3xl"
                    style={{ animationDelay: "-7s" }}
                    aria-hidden="true"
                  />
                  <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 sm:gap-5">
                      {/* avatar initials */}
                      <span
                        className="font-heading inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-2xl font-bold text-white ring-1 ring-white/25 backdrop-blur-sm"
                        aria-hidden="true"
                      >
                        {initialsOf(dash.patient.name)}
                      </span>
                      <div>
                        <h2 className="font-heading text-xl font-bold leading-snug text-white sm:text-2xl">
                          {t.welcome.replace("{name}", dash.patient.name)}
                        </h2>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-blue-100/80">
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                            <span className="font-semibold tracking-wide">
                              {bn ? toBnDigits(dash.patient.phone) : dash.patient.phone}
                            </span>
                          </span>
                          <span className="hidden h-3 w-px bg-white/20 sm:block" aria-hidden="true" />
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarCheck className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                            {t.memberSince.replace(
                              "{date}",
                              formatShortDate(dash.patient.createdAt, lang)
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={doLogout}
                      disabled={loggingOut}
                      className="h-12 shrink-0 rounded-2xl bg-white/10 px-5 text-sm font-bold text-white ring-1 ring-white/25 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 hover:ring-white/40 disabled:opacity-60 sm:ml-auto"
                    >
                      {loggingOut ? (
                        <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
                      )}
                      {t.logout}
                    </Button>
                  </div>
                </div>
              </Reveal>

              {/* ===== stats ===== */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  {
                    label: t.statUpcoming,
                    value: dash.stats.upcoming,
                    icon: CalendarClock,
                    tile: "bg-brand-blue/10 text-brand-blue ring-brand-blue/15",
                  },
                  {
                    label: t.statCompleted,
                    value: dash.stats.completed,
                    icon: CheckCircle2,
                    tile: "bg-emerald-50 text-emerald-600 ring-emerald-100",
                  },
                  {
                    label: t.statTotal,
                    value: dash.stats.totalAppointments,
                    icon: CalendarCheck,
                    tile: "bg-amber-50 text-amber-600 ring-amber-100",
                  },
                  {
                    label: t.statReviews,
                    value: dash.stats.reviews,
                    icon: Star,
                    tile: "bg-teal-50 text-teal-600 ring-teal-100",
                  },
                ].map((card, i) => (
                  <Reveal key={card.label} delay={i * 0.06}>
                    <div className="card-lift group rounded-3xl border border-blue-100/80 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100">
                      <span
                        className={cn(
                          "inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-110",
                          card.tile
                        )}
                      >
                        <card.icon className="h-5.5 w-5.5" aria-hidden="true" />
                      </span>
                      <p className="font-heading mt-4 text-3xl font-bold tabular-nums text-brand-navy">
                        {bn ? toBnDigits(card.value) : String(card.value)}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {card.label}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* ===== upcoming appointments ===== */}
              <Reveal>
                <section aria-labelledby="portal-upcoming">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/15">
                      <CalendarClock className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h2 id="portal-upcoming" className="font-heading text-xl font-bold text-brand-navy sm:text-2xl">
                      {t.upcomingTitle}
                    </h2>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-blue ring-1 ring-blue-100">
                      {bn ? toBnDigits(upcoming.length) : String(upcoming.length)}
                    </span>
                  </div>

                  {upcoming.length === 0 ? (
                    <div className="mt-5 flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-blue-200/80 bg-ice/40 px-6 py-10 text-center">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm ring-1 ring-blue-100">
                        <CalendarClock className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <p className="max-w-sm text-sm leading-relaxed text-slate-500">{t.upcomingEmpty}</p>
                      <Button
                        type="button"
                        onClick={() => navigate("/appointment")}
                        className="btn-shine h-12 rounded-2xl bg-brand-blue px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy hover:shadow-xl"
                      >
                        <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                        {t.upcomingEmptyCta}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-5">
                      {upcoming.map((appt, i) => (
                        <Reveal key={appt.refCode} delay={Math.min(i * 0.06, 0.3)}>
                          <PortalAppointmentCard
                            appt={appt}
                            highlighted
                            cancelLabel={t.cancelBooking}
                            onCancel={() => setCancelTarget(appt)}
                          />
                        </Reveal>
                      ))}
                    </div>
                  )}
                </section>
              </Reveal>

              {/* ===== visit history timeline ===== */}
              <Reveal>
                <section aria-labelledby="portal-history">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/15">
                      <Clock className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h2 id="portal-history" className="font-heading text-xl font-bold text-brand-navy sm:text-2xl">
                      {t.historyTitle}
                    </h2>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-blue ring-1 ring-blue-100">
                      {bn ? toBnDigits(history.length) : String(history.length)}
                    </span>
                  </div>

                  {history.length === 0 ? (
                    <div className="mt-5 flex items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-blue-200/80 bg-ice/40 px-6 py-8 text-center">
                      <Clock className="h-5 w-5 shrink-0 text-brand-blue" aria-hidden="true" />
                      <p className="text-sm leading-relaxed text-slate-500">{t.historyEmpty}</p>
                    </div>
                  ) : (
                    <ol className="relative mt-6 space-y-6 border-l-2 border-dashed border-blue-200 pl-7 sm:pl-9">
                      {history.map((appt, i) => {
                        const style = statusStyles[appt.status] ?? statusStyles.PENDING;
                        const svc = services.find((s) => s.slug === appt.serviceSlug);
                        const doc = doctors.find((d2) => d2.slug === appt.doctorSlug);
                        const isPast = new Date(`${appt.date}T23:59:59`) < new Date();
                        return (
                          <motion.li
                            key={appt.refCode}
                            initial={{ opacity: 0, x: -14 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
                            className="relative"
                          >
                            {/* timeline dot */}
                            <span
                              className={cn(
                                "absolute top-6 -left-[37px] h-3.5 w-3.5 rounded-full ring-4 ring-ice/80 sm:-left-[45px]",
                                style.dot
                              )}
                              aria-hidden="true"
                            />
                            <article className="card-shine relative overflow-hidden rounded-[1.5rem] border border-blue-100/80 bg-white shadow-[0_10px_40px_-16px_rgba(0,32,96,0.18)]">
                              <div
                                className={cn(
                                  "flex flex-wrap items-center justify-between gap-3 border-b border-blue-50/80 px-5 py-3.5 sm:px-6",
                                  appt.status === "CANCELLED" ? "bg-rose-50/50" : "bg-ice/60"
                                )}
                              >
                                <StatusBadge status={appt.status} lang={lang} />
                                <span className="font-mono text-xs font-bold tracking-wider text-brand-navy/70">
                                  {appt.refCode}
                                </span>
                              </div>
                              <div className="space-y-3 p-5 sm:p-6">
                                <div className="flex items-start gap-3.5">
                                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/15">
                                    <CalendarClock className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                  <div>
                                    <p className="font-heading text-base font-bold leading-snug text-brand-navy">
                                      {formatDateLabel(appt.date, lang)}
                                    </p>
                                    <p className="mt-0.5 text-xs font-semibold text-brand-blue">
                                      {isPast ? t.wasScheduledAt : t.scheduledAt} {bn ? toBnDigits(appt.time) : appt.time}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid gap-2.5 text-xs sm:grid-cols-2">
                                  <div className="flex items-center gap-2 rounded-xl bg-ice/50 px-3 py-2 ring-1 ring-blue-100/50">
                                    <Stethoscope className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                                    <span className="text-slate-500">{t.service}</span>
                                    <span className="ml-auto text-right font-semibold text-brand-navy">
                                      {svc
                                        ? bn && svc.nameBn
                                          ? svc.nameBn
                                          : svc.name
                                        : t.general}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 rounded-xl bg-ice/50 px-3 py-2 ring-1 ring-blue-100/50">
                                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                                    <span className="text-slate-500">{t.specialist}</span>
                                    <span className="ml-auto text-right font-semibold text-brand-navy">
                                      {doc?.name ?? t.assignedLater}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 rounded-xl bg-ice/50 px-3 py-2 ring-1 ring-blue-100/50">
                                    <Clock className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                                    <span className="text-slate-500">{t.requested}</span>
                                    <span className="ml-auto font-semibold text-brand-navy">
                                      {formatShortDate(appt.createdAt, lang)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 rounded-xl bg-ice/50 px-3 py-2 ring-1 ring-blue-100/50">
                                    <Hash className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                                    <span className="text-slate-500">{t.sourceLabel}</span>
                                    <span className="ml-auto font-semibold text-brand-navy">
                                      {appt.source === "WEBSITE" ? t.sourceWebsite : appt.source}
                                    </span>
                                  </div>
                                </div>

                                {appt.notes && (
                                  <div className="flex items-start gap-2.5 rounded-xl bg-ice/70 px-3.5 py-2.5 text-xs leading-relaxed text-brand-navy/80 ring-1 ring-blue-100/60">
                                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                                    <span>
                                      <span className="font-semibold">{t.yourNote}</span> {appt.notes}
                                    </span>
                                  </div>
                                )}

                                {appt.updatedAt !== appt.createdAt && (
                                  <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                    <Clock className="h-3 w-3" aria-hidden="true" />
                                    {t.updated} {formatShortDate(appt.updatedAt, lang)}
                                  </p>
                                )}
                              </div>
                            </article>
                          </motion.li>
                        );
                      })}
                    </ol>
                  )}
                </section>
              </Reveal>

              {/* ===== my reviews ===== */}
              <Reveal>
                <section aria-labelledby="portal-reviews">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 ring-1 ring-amber-100">
                      <Star className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h2 id="portal-reviews" className="font-heading text-xl font-bold text-brand-navy sm:text-2xl">
                      {t.reviewsTitle}
                    </h2>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-blue ring-1 ring-blue-100">
                      {bn ? toBnDigits(dash.reviews.length) : String(dash.reviews.length)}
                    </span>
                  </div>

                  {dash.reviews.length === 0 ? (
                    <div className="mt-5 flex items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-blue-200/80 bg-ice/40 px-6 py-8 text-center">
                      <Star className="h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
                      <p className="max-w-md text-sm leading-relaxed text-slate-500">{t.reviewsEmpty}</p>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      {dash.reviews.map((rev, i) => {
                        const svc = services.find((s) => s.slug === rev.serviceSlug);
                        return (
                          <motion.article
                            key={rev.id}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.25) }}
                            className="card-lift flex flex-col rounded-3xl border border-blue-100/80 bg-white p-5 shadow-[0_10px_30px_-16px_rgba(0,32,96,0.16)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1" aria-label={`Rating ${rev.rating} out of 5`}>
                                {Array.from({ length: 5 }).map((_, s) => (
                                  <Star
                                    key={s}
                                    className={cn(
                                      "h-4 w-4",
                                      s < rev.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-slate-100 text-slate-200"
                                    )}
                                    aria-hidden="true"
                                  />
                                ))}
                              </div>
                              {!rev.approved && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 ring-1 ring-amber-200">
                                  <Clock className="h-3 w-3" aria-hidden="true" />
                                  {t.pendingReview}
                                </span>
                              )}
                            </div>
                            {rev.title && (
                              <h3 className="font-heading mt-3 text-sm font-bold text-brand-navy">
                                {rev.title}
                              </h3>
                            )}
                            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{rev.message}</p>
                            <p className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-blue-50 pt-3 text-[11px] text-slate-400">
                              {svc && (
                                <span className="font-semibold text-brand-blue">
                                  {bn && svc.nameBn ? svc.nameBn : svc.name}
                                </span>
                              )}
                              <span aria-hidden="true">•</span>
                              <span>{formatShortDate(rev.createdAt, lang)}</span>
                            </p>
                          </motion.article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </Reveal>

              {/* ===== profile + security ===== */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* profile settings */}
                <Reveal>
                  <section
                    aria-labelledby="portal-profile"
                    className="flex h-full flex-col rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_10px_30px_-16px_rgba(0,32,96,0.16)] sm:p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/15">
                          <UserRound className="h-5.5 w-5.5" aria-hidden="true" />
                        </span>
                        <div>
                          <h2 id="portal-profile" className="font-heading text-lg font-bold text-brand-navy">
                            {t.profileTitle}
                          </h2>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t.profileDesc}</p>
                        </div>
                      </div>
                      {!editingProfile && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={startEditProfile}
                          className="h-11 shrink-0 rounded-xl border-blue-100 bg-white text-brand-navy hover:bg-ice"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          <span className="hidden sm:inline">{t.profileEdit}</span>
                          <span className="sr-only sm:hidden">{t.profileEdit}</span>
                        </Button>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {editingProfile ? (
                        <motion.form
                          key="profile-edit"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          onSubmit={submitProfile}
                          className="mt-5 flex flex-1 flex-col"
                          noValidate
                        >
                          <div className="space-y-2">
                            <Label htmlFor="profile-name" className="text-sm font-semibold text-brand-navy">
                              {t.registerNameLabel}
                            </Label>
                            <Input
                              id="profile-name"
                              value={profileForm.name}
                              onChange={(e) =>
                                setProfileForm((f) => ({ ...f, name: e.target.value.slice(0, 80) }))
                              }
                              autoComplete="name"
                              className="h-12 rounded-2xl border-blue-100 bg-ice/60 text-base font-semibold text-brand-navy focus:border-brand-blue focus:bg-white"
                            />
                          </div>
                          <div className="mt-4 space-y-2">
                            <Label htmlFor="profile-email" className="text-sm font-semibold text-brand-navy">
                              {t.registerEmailLabel}
                            </Label>
                            <div className="relative">
                              <Mail
                                className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                                aria-hidden="true"
                              />
                              <Input
                                id="profile-email"
                                type="email"
                                value={profileForm.email}
                                onChange={(e) =>
                                  setProfileForm((f) => ({ ...f, email: e.target.value.slice(0, 120) }))
                                }
                                autoComplete="email"
                                className="h-12 rounded-2xl border-blue-100 bg-ice/60 pl-11 text-base text-brand-navy focus:border-brand-blue focus:bg-white"
                              />
                            </div>
                          </div>
                          <FieldError id="profile-error" message={profileError} />
                          <div className="mt-auto flex gap-3 pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingProfile(false)}
                              className="h-12 flex-1 rounded-2xl border-blue-100 bg-white text-brand-navy hover:bg-ice"
                            >
                              {t.profileCancel}
                            </Button>
                            <Button
                              type="submit"
                              disabled={savingProfile || profileForm.name.trim().length < 2}
                              className="h-12 flex-1 rounded-2xl bg-brand-blue font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy hover:shadow-xl disabled:translate-y-0 disabled:opacity-50"
                            >
                              {savingProfile ? (
                                <>
                                  <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                                  {t.profileSaving}
                                </>
                              ) : (
                                t.profileSave
                              )}
                            </Button>
                          </div>
                        </motion.form>
                      ) : (
                        <motion.dl
                          key="profile-view"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className="mt-5 flex-1 space-y-3"
                        >
                          <div className="flex items-center gap-3 rounded-2xl bg-ice/50 px-4 py-3.5 ring-1 ring-blue-100/50">
                            <UserRound className="h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
                            <dt className="text-xs text-slate-500">{t.registerNameLabel}</dt>
                            <dd className="ml-auto text-right text-sm font-semibold text-brand-navy">
                              {dash.patient.name}
                            </dd>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl bg-ice/50 px-4 py-3.5 ring-1 ring-blue-100/50">
                            <Phone className="h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
                            <dt className="text-xs text-slate-500">{t.loginPhoneLabel}</dt>
                            <dd className="ml-auto text-right text-sm font-semibold tabular-nums text-brand-navy">
                              {bn ? toBnDigits(dash.patient.phone) : dash.patient.phone}
                            </dd>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl bg-ice/50 px-4 py-3.5 ring-1 ring-blue-100/50">
                            <Mail className="h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
                            <dt className="text-xs text-slate-500">{t.registerEmailLabel}</dt>
                            <dd className="ml-auto break-all text-right text-sm font-semibold text-brand-navy">
                              {dash.patient.email ?? "—"}
                            </dd>
                          </div>
                        </motion.dl>
                      )}
                    </AnimatePresence>
                  </section>
                </Reveal>

                {/* change password */}
                <Reveal delay={0.08}>
                  <section
                    aria-labelledby="portal-security"
                    className="flex h-full flex-col rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_10px_30px_-16px_rgba(0,32,96,0.16)] sm:p-7"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                        <ShieldCheck className="h-5.5 w-5.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 id="portal-security" className="font-heading text-lg font-bold text-brand-navy">
                          {t.securityTitle}
                        </h2>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t.securityDesc}</p>
                      </div>
                    </div>

                    <form onSubmit={submitPassword} className="mt-5 flex flex-1 flex-col" noValidate>
                      <div className="space-y-2">
                        <Label htmlFor="pw-current" className="text-sm font-semibold text-brand-navy">
                          {t.securityCurrentLabel} <span className="text-rose-500">*</span>
                        </Label>
                        <PasswordInput
                          id="pw-current"
                          value={pwForm.current}
                          onChange={(v) => setPwForm((f) => ({ ...f, current: v }))}
                          autoComplete="current-password"
                          showLabel={t.loginShow}
                          hideLabel={t.loginHide}
                        />
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="pw-new" className="text-sm font-semibold text-brand-navy">
                          {t.securityNewLabel} <span className="text-rose-500">*</span>
                        </Label>
                        <PasswordInput
                          id="pw-new"
                          value={pwForm.next}
                          onChange={(v) => setPwForm((f) => ({ ...f, next: v }))}
                          autoComplete="new-password"
                          showLabel={t.loginShow}
                          hideLabel={t.loginHide}
                          className="h-12"
                        />
                        <p className="text-xs text-slate-500">{t.registerPasswordHint}</p>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="pw-confirm" className="text-sm font-semibold text-brand-navy">
                          {t.securityConfirmLabel} <span className="text-rose-500">*</span>
                        </Label>
                        <PasswordInput
                          id="pw-confirm"
                          value={pwForm.confirm}
                          onChange={(v) => setPwForm((f) => ({ ...f, confirm: v }))}
                          autoComplete="new-password"
                          showLabel={t.loginShow}
                          hideLabel={t.loginHide}
                          className="h-12"
                        />
                        <FieldError
                          id="pw-confirm-error"
                          message={
                            pwForm.confirm && pwForm.confirm !== pwForm.next
                              ? t.registerMismatch
                              : undefined
                          }
                        />
                      </div>
                      <FieldError id="pw-error" message={pwError} />
                      <div className="mt-auto pt-6">
                        <Button
                          type="submit"
                          disabled={
                            savingPw ||
                            pwForm.current.length === 0 ||
                            pwForm.next.length < 8 ||
                            pwForm.confirm.length === 0
                          }
                          className="h-12 w-full rounded-2xl bg-brand-navy font-bold text-white shadow-lg shadow-navy-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-blue hover:shadow-xl disabled:translate-y-0 disabled:opacity-50"
                        >
                          {savingPw ? (
                            <>
                              <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                              {t.securitySubmitting}
                            </>
                          ) : (
                            <>
                              <KeyRound className="h-4.5 w-4.5" aria-hidden="true" />
                              {t.securitySubmit}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </section>
                </Reveal>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- cancel confirmation (shadcn AlertDialog) ---------- */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent className="rounded-3xl border-blue-100 bg-white sm:max-w-md">
          <AlertDialogHeader className="items-start text-left sm:flex-row sm:items-center">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100 sm:mb-0">
              <CalendarX2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="mt-3 sm:mt-0 sm:pl-2">
              <AlertDialogTitle className="font-heading text-lg font-bold text-brand-navy">
                {t.cancelTitle}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1 text-sm leading-relaxed text-slate-600">
                {t.cancelText
                  .replace("{ref}", cancelTarget?.refCode ?? "")
                  .replace("{date}", cancelTarget ? formatDateLabel(cancelTarget.date, lang) : "")
                  .replace(
                    "{time}",
                    cancelTarget ? (bn ? toBnDigits(cancelTarget.time) : cancelTarget.time) : ""
                  )}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-2xl border-blue-100 bg-white text-sm font-semibold text-brand-navy hover:bg-ice sm:flex-none sm:px-6">
              {t.keepBooking}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void performCancel();
              }}
              disabled={cancelling}
              className="h-12 flex-1 rounded-2xl bg-rose-500 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:bg-rose-600 disabled:opacity-50 sm:flex-none sm:px-6"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                  {t.securitySubmitting}
                </>
              ) : (
                t.yesCancel
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Appointment card — status-page visual language                      */
/*  (used by quick-check results + upcoming dashboard section)          */
/* ------------------------------------------------------------------ */

function PortalAppointmentCard({
  appt,
  highlighted = false,
  cancelLabel,
  onCancel,
}: {
  appt: PatientAppointment;
  highlighted?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
}) {
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.portalPage;
  const st = d.statusPage;
  const { services, doctors } = useBundle();

  const style = statusStyles[appt.status] ?? statusStyles.PENDING;
  const label = st.status[appt.status]?.label ?? appt.status;
  const blurb = st.status[appt.status]?.blurb ?? "";
  const StatusIcon = style.icon;
  const svc = services.find((s) => s.slug === appt.serviceSlug);
  const doc = doctors.find((d2) => d2.slug === appt.doctorSlug);
  const isPast = new Date(`${appt.date}T23:59:59`) < new Date();
  const cancellable =
    (appt.status === "PENDING" || appt.status === "CONFIRMED") && !isPast && onCancel;

  return (
    <article
      className={cn(
        "card-shine relative overflow-hidden rounded-[1.75rem] border bg-white shadow-[0_10px_40px_-16px_rgba(0,32,96,0.18)]",
        highlighted
          ? "border-brand-blue/30 ring-1 ring-brand-blue/20"
          : "border-blue-100/80"
      )}
    >
      {/* status ribbon */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b border-blue-50/80 px-6 py-4 sm:px-8",
          appt.status === "CANCELLED" ? "bg-rose-50/50" : "bg-ice/60"
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "relative inline-flex h-3 w-3 rounded-full",
              style.dot,
              appt.status === "PENDING" && "animate-pulse"
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ring-1",
              style.badge
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </span>
        </div>
        <span className="font-mono text-sm font-bold tracking-wider text-brand-navy/70">
          {appt.refCode}
        </span>
      </div>

      <div className="grid gap-5 p-6 sm:grid-cols-[1.4fr_1fr] sm:p-8">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/15">
              <CalendarClock className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold leading-snug text-brand-navy">
                {formatDateLabel(appt.date, lang)}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-brand-blue">
                {isPast ? t.wasScheduledAt : t.scheduledAt} {bn ? toBnDigits(appt.time) : appt.time}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{blurb}</p>
            </div>
          </div>

          {appt.notes && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-ice/70 px-4 py-3 text-xs leading-relaxed text-brand-navy/80 ring-1 ring-blue-100/60">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
              <span>
                <span className="font-semibold">{t.yourNote}</span> {appt.notes}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-2xl bg-ice/50 p-5 ring-1 ring-blue-100/50">
          <div className="flex items-center gap-2.5 text-sm">
            <UserRound className="h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
            <span className="text-slate-500">{st.patient}</span>
            <span className="ml-auto font-semibold text-brand-navy">{appt.name}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Stethoscope className="h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
            <span className="text-slate-500">{t.service}</span>
            <span className="ml-auto text-right font-semibold text-brand-navy">
              {svc ? (bn && svc.nameBn ? svc.nameBn : svc.name) : t.general}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <BadgeCheck className="h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
            <span className="text-slate-500">{t.specialist}</span>
            <span className="ml-auto text-right font-semibold text-brand-navy">
              {doc?.name ?? t.assignedLater}
            </span>
          </div>
          <div className="flex items-center gap-2.5 border-t border-blue-100/70 pt-3 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
            {t.requested} {formatShortDate(appt.createdAt, lang)}
          </div>
        </div>
      </div>

      {cancellable && cancelLabel && onCancel && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-blue-50/80 bg-slate-50/60 px-6 py-4 sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <CalendarX2 className="h-4 w-4" aria-hidden="true" />
            {cancelLabel}
          </Button>
        </div>
      )}
    </article>
  );
}

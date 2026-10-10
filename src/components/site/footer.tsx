"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  ArrowUp,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useLang } from "@/lib/i18n";
import { services } from "@/lib/data/services";
import { site } from "@/lib/site";
import { useToast } from "@/hooks/use-toast";
import { ClinicStatusBadge } from "@/components/site/clinic-status";

/* ------------------------------------------------------------------ */
/*  Footer — sticky bottom, rich links, trust signals                  */
/* ------------------------------------------------------------------ */

export function Footer() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const { toast } = useToast();
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const quickLinks = [
    { label: d.footer.quickLinks[0], to: "/" },
    { label: d.footer.quickLinks[1], to: "/about" },
    { label: d.footer.quickLinks[2], to: "/services" },
    { label: d.footer.quickLinks[3], to: "/gallery" },
    { label: d.footer.quickLinks[4], to: "/doctors" },
    { label: d.footer.quickLinks[5], to: "/blog" },
    { label: d.footer.quickLinks[6], to: "/estimator" },
    { label: d.footer.quickLinks[7], to: "/contact" },
    { label: d.footer.quickLinks[8], to: "/appointment" },
    { label: d.footer.quickLinks[9], to: "/status" },
    { label: d.footer.quickLinks[10], to: "/faqs" },
  ];

  return (
    <footer className="relative mt-auto bg-brand-navy pb-[env(safe-area-inset-bottom)] text-white">
      {/* top wave divider — melts the page into the navy footer */}
      <svg
        className="pointer-events-none absolute -top-7 left-0 right-0 h-8 w-full text-brand-navy sm:-top-9 sm:h-10"
        viewBox="0 0 1440 44"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,44 L0,26 C180,2 360,40 540,22 C700,7 820,38 980,26 C1140,14 1300,36 1440,16 L1440,44 Z"
          fill="currentColor"
        />
      </svg>
      {/* decorative glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(48rem 26rem at 90% -10%, rgba(30,125,255,0.22), transparent 60%), radial-gradient(40rem 24rem at -10% 110%, rgba(14,165,165,0.12), transparent 60%)",
        }}
      />
      <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Image
              src="/logo-white.png"
              alt="Aristocrat Dental Care & Orthodontic Center logo"
              width={220}
              height={49}
              className="h-11 w-auto object-contain"
            />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-blue-100/85">
              {site.name} — {lang === "bn"
                ? "উত্তরা, ঢাকার একটি আধুনিক, সুসজ্জিত ডেন্টাল ক্লিনিক — অত্যাধুনিক প্রযুক্তি, কঠোর জীবাণুমুক্তকরণ ও বিশেষজ্ঞ চিকিৎসার সমন্বয়ে।"
                : "a modern, well-equipped dental clinic in Uttara, Dhaka combining advanced technology, strict sterilization and specialist care."}{" "}
              {d.chrome.tagline}
            </p>
            <div className="mt-5 flex items-center gap-2" aria-label="Rated 4.9 out of 5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
              ))}
              <span className="ml-1 text-sm font-semibold text-white">
                4.9/5
              </span>
              <span className="text-xs text-blue-200/70">
                {d.footer.reviews}
              </span>
            </div>
            <div className="mt-6 flex items-center gap-3">
              {[
                { label: "Facebook", href: site.social.facebook, Icon: Facebook, hover: "hover:bg-[#1877F2] hover:ring-[#1877F2]" },
                { label: "Instagram", href: site.social.instagram, Icon: Instagram, hover: "hover:bg-[#E1306C] hover:ring-[#E1306C]" },
                { label: "LinkedIn", href: site.social.linkedin, Icon: Linkedin, hover: "hover:bg-[#0A66C2] hover:ring-[#0A66C2]" },
              ].map(({ label, href, Icon, hover }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (opens in new tab)`}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 ${hover}`}
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer quick links">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
              {d.footer.quickLinksTitle}
            </h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <a
                    href={`#${link.to}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(link.to);
                    }}
                    className="group inline-flex items-center gap-2 text-sm text-blue-100/80 transition-colors hover:text-white"
                  >
                    <span
                      className="h-px w-3 bg-amber-400/70 transition-all duration-300 group-hover:w-5"
                      aria-hidden="true"
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <nav aria-label="Footer services">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
              {d.footer.servicesTitle}
            </h3>
            <ul className="mt-5 space-y-3">
              {services.slice(0, 8).map((s) => (
                <li key={s.slug}>
                  <a
                    href={`#/services/${s.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/services/${s.slug}`);
                    }}
                    className="group inline-flex items-center gap-2 text-sm text-blue-100/80 transition-colors hover:text-white"
                  >
                    <span
                      className="h-px w-3 bg-amber-400/70 transition-all duration-300 group-hover:w-5"
                      aria-hidden="true"
                    />
                    {lang === "bn" && s.shortNameBn ? s.shortNameBn : s.shortName}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#/services"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/services");
                  }}
                  className="text-sm font-semibold text-amber-300 hover:text-amber-200"
                >
                  {d.footer.viewAllServices}
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
              {d.footer.contactTitle}
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={`tel:${site.phoneRaw}`}
                  className="flex items-start gap-3 text-blue-100/85 transition-colors hover:text-white"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs text-blue-200/70">
                      {d.footer.hotlineLabel}
                    </span>
                    <span className="font-semibold">{site.phone}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-start gap-3 text-blue-100/85 transition-colors hover:text-white"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="break-all">
                    <span className="block text-xs text-blue-200/70">{d.footer.emailLabel}</span>
                    {site.email}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-blue-100/85">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs text-blue-200/70">{d.footer.locationLabel}</span>
                  {site.addressShort}
                </span>
              </li>
              <li className="flex items-start gap-3 text-blue-100/85">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs text-blue-200/70">{d.footer.hoursLabel}</span>
                  {d.footer.hours}
                  <ClinicStatusBadge variant="on-dark" className="mt-1.5 text-xs" showTime={false} />
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <NewsletterSignup
          email={email}
          setEmail={setEmail}
          subscribed={subscribed}
          setSubscribed={setSubscribed}
          subscribing={subscribing}
          setSubscribing={setSubscribing}
          toast={toast}
        />

        {/* Trust strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
          {[0, 1, 2].map((i) => {
            const icons = [ShieldCheck, CalendarCheck, MessageCircle];
            const Icon = icons[i];
            return (
              <span
                key={i}
                className="inline-flex items-center gap-2 text-xs font-medium text-blue-100/90"
              >
                <Icon className="h-4 w-4 text-amber-400" aria-hidden="true" />
                {d.footer.trust[i]}
              </span>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-blue-200/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. {d.footer.rights}
          </p>
          <p className="text-center sm:text-right">{d.footer.credit}</p>
        </div>
      </div>

      {/* Back to top */}
      <BackToTop />
    </footer>
  );
}

function BackToTop() {
  const { d } = useLang();
  const [visible, setVisible] = useStateSafe(false);
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={d.footer.backToTop}
      className={`fixed bottom-24 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-navy text-white shadow-xl shadow-navy-900/30 ring-1 ring-white/20 transition-all duration-500 hover:bg-brand-blue ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Newsletter signup — uses POST /api/newsletter                      */
/* ------------------------------------------------------------------ */

type ToastFn = (opts: {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | null | undefined;
}) => void;

function NewsletterSignup({
  email,
  setEmail,
  subscribed,
  setSubscribed,
  subscribing,
  setSubscribing,
  toast,
}: {
  email: string;
  setEmail: (v: string) => void;
  subscribed: boolean;
  setSubscribed: (v: boolean) => void;
  subscribing: boolean;
  setSubscribing: (v: boolean) => void;
  toast: ToastFn;
}) {
  const { d } = useLang();

  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    if (subscribing) return;
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({
        title: d.footer.newsletter.invalid,
        description: d.footer.newsletter.invalidDesc,
        variant: "destructive",
      });
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed");
      setSubscribed(true);
      toast({
        title: d.footer.newsletter.success,
        description: data.message ?? d.footer.newsletter.successDesc,
      });
    } catch (err) {
      toast({
        title: d.footer.newsletter.failed,
        description:
          err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-7 sm:p-9">
      <span
        className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-brand-blue/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h3 className="flex items-center gap-2.5 font-heading text-lg font-bold text-white">
            <Sparkles className="h-5 w-5 text-amber-400" aria-hidden="true" />
            {d.footer.newsletter.title}
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-blue-100/80">
            {d.footer.newsletter.description}
          </p>
        </div>

        {subscribed ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-500/15 p-5 ring-1 ring-emerald-400/30">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" aria-hidden="true" />
            <p className="text-sm font-semibold text-emerald-200">
              {d.footer.newsletter.subscribed}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col gap-3 sm:flex-row"
            noValidate
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address for newsletter
            </label>
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={d.footer.newsletter.placeholder}
              className="h-12 flex-1 rounded-2xl border-0 bg-white/10 px-5 text-sm text-white placeholder:text-blue-200/50 ring-1 ring-white/15 backdrop-blur transition-all duration-300 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 text-sm font-bold text-brand-navy shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 disabled:translate-y-0 disabled:opacity-70"
            >
              {subscribing ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4.5 w-4.5" aria-hidden="true" />
              )}
              {d.footer.newsletter.subscribe}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* tiny safe state helper to avoid SSR hydration issues */
function useStateSafe(initial: boolean) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    const onScroll = () => setValue(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return [value, setValue] as const;
}

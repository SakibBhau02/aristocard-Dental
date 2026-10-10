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
import { services } from "@/lib/data/services";
import { site } from "@/lib/site";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  Footer — sticky bottom, rich links, trust signals                  */
/* ------------------------------------------------------------------ */

export function Footer() {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about" },
    { label: "Our Services", to: "/services" },
    { label: "Smile Gallery", to: "/gallery" },
    { label: "Our Doctors", to: "/doctors" },
    { label: "Health Blog", to: "/blog" },
    { label: "Cost Estimator", to: "/estimator" },
    { label: "Contact", to: "/contact" },
    { label: "Book Appointment", to: "/appointment" },
    { label: "Check Appointment Status", to: "/status" },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden bg-brand-navy text-white">
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
              {site.name} — a modern, well-equipped dental clinic in Uttara,
              Dhaka combining advanced technology, strict sterilization and
              specialist care. {site.tagline}
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
                (3,200+ patient reviews)
              </span>
            </div>
            <div className="mt-6 flex items-center gap-3">
              {[
                { label: "Facebook", href: site.social.facebook, Icon: Facebook },
                { label: "Instagram", href: site.social.instagram, Icon: Instagram },
                { label: "LinkedIn", href: site.social.linkedin, Icon: Linkedin },
              ].map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (opens in new tab)`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-blue hover:shadow-lg hover:shadow-blue-500/30"
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer quick links">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
              Quick Links
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
              Our Services
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
                    {s.shortName}
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
                  View all 11 services →
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
              Get In Touch
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
                      Hotline (Call or WhatsApp)
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
                    <span className="block text-xs text-blue-200/70">Email</span>
                    {site.email}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-blue-100/85">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs text-blue-200/70">Location</span>
                  {site.addressShort}
                </span>
              </li>
              <li className="flex items-start gap-3 text-blue-100/85">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs text-blue-200/70">Opening Hours</span>
                  {site.hours}
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
          {[
            { Icon: ShieldCheck, label: "Strict Sterilization Protocols" },
            { Icon: CalendarCheck, label: "Same-Week Appointments" },
            { Icon: MessageCircle, label: "Bilingual Care: বাংলা & English" },
          ].map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 text-xs font-medium text-blue-100/90"
            >
              <Icon className="h-4 w-4 text-amber-400" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-blue-200/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="text-center sm:text-right">
            Excellence in Every Smile — Uttara, Dhaka, Bangladesh
          </p>
        </div>
      </div>

      {/* Back to top */}
      <BackToTop />
    </footer>
  );
}

function BackToTop() {
  const [visible, setVisible] = useStateSafe(false);
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
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
  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    if (subscribing) return;
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
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
        title: "Subscribed!",
        description: data.message ?? "Dental health tips are on their way.",
      });
    } catch (err) {
      toast({
        title: "Subscription failed",
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
            Dental health tips, worth reading
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-blue-100/80">
            One short, genuinely useful email a month — seasonal care reminders,
            clinic offers and new expert guides from our blog. No spam, ever.
          </p>
        </div>

        {subscribed ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-500/15 p-5 ring-1 ring-emerald-400/30">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" aria-hidden="true" />
            <p className="text-sm font-semibold text-emerald-200">
              You&apos;re on the list — welcome aboard!
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
              placeholder="your@email.com"
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
              Subscribe
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

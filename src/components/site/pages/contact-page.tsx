"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { PageHeader, CtaBanner } from "@/components/site/shared";
import { Reveal, SectionHeading } from "@/components/site/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  CONTACT PAGE (EN / বাংলা)                                          */
/* ------------------------------------------------------------------ */

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Aristocrat Dental Care & Orthodontic Center",
  url: "https://aristocratdentalcarebd.com/#/contact",
  mainEntity: {
    "@type": "Organization",
    name: site.name,
    telephone: site.phoneRaw,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Uttara",
      addressRegion: "Dhaka",
      addressCountry: "BD",
    },
    openingHours: "Sa-Th 10:00-21:00",
  },
};

export function ContactPage() {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.contactPage;
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  usePageMeta({
    title: "Contact Us — Book a Dental Appointment in Uttara, Dhaka",
    description:
      "Get in touch with Aristocrat Dental Care & Orthodontic Center, Uttara Dhaka. Call 01715-027522, email aristocratdentalcare01@gmail.com or send us a message — we reply within hours.",
    jsonLd: contactJsonLd,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // basic validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({
        title: t.toastRequired,
        description: t.toastRequiredDesc,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSent(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      toast({
        title: t.toastSent,
        description: t.toastSentDesc,
      });
    } catch (err) {
      toast({
        title: t.toastFailed,
        description:
          err instanceof Error
            ? err.message
            : t.toastFailedDesc,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const contactCards = [
    {
      icon: Phone,
      label: t.callLabel,
      value: site.phone,
      href: `tel:${site.phoneRaw}`,
      note: t.callNote,
      accent: "bg-brand-blue",
    },
    {
      icon: MessageCircle,
      label: t.waLabel,
      value: t.waValue,
      href: `https://wa.me/${site.phoneRaw.replace("+", "")}?text=${encodeURIComponent(
        lang === "bn"
          ? "আসসালামু আলাইকুম, আমি Aristocrat Dental Care-এ অ্যাপয়েন্টমেন্ট নিতে চাই।"
          : "Hello, I would like to book an appointment at Aristocrat Dental Care."
      )}`,
      note: t.waNote,
      accent: "bg-emerald-500",
    },
    {
      icon: Mail,
      label: t.emailLabel,
      value: site.email,
      href: `mailto:${site.email}`,
      note: t.emailNote,
      accent: "bg-brand-navy",
    },
    {
      icon: MapPin,
      label: t.visitLabel,
      value: t.visitValue,
      href: "https://maps.google.com/?q=aristocrat+dental+care+uttara",
      note: t.visitNote,
      accent: "bg-teal-600",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[{ label: d.chrome.nav.home, to: "/" }, { label: d.chrome.nav.contact }]}
      />

      <section className="py-14 sm:py-18" aria-label="Contact information and form">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Left: contact info */}
            <div>
              <SectionHeading
                align="left"
                eyebrow={t.channelsEyebrow}
                title={t.channelsTitle}
              />

              <div className="mt-8 space-y-4">
                {contactCards.map((card, i) => (
                  <Reveal key={i} delay={i * 0.07}>
                    <a
                      href={card.href}
                      target={card.href.startsWith("http") ? "_blank" : undefined}
                      rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="group flex items-center gap-5 rounded-3xl border border-blue-100/80 bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_18px_40px_-16px_rgba(30,125,255,0.3)] sm:p-6"
                    >
                      <span
                        className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.accent} text-white shadow-lg transition-transform duration-500 group-hover:scale-110`}
                      >
                        <card.icon className="h-6.5 w-6.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          {card.label}
                        </span>
                        <span className="mt-0.5 block break-all font-heading text-base font-bold text-brand-navy group-hover:text-brand-blue sm:text-lg">
                          {card.value}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {card.note}
                        </span>
                      </span>
                    </a>
                  </Reveal>
                ))}
              </div>

              {/* hours & social */}
              <Reveal delay={0.2} className="mt-6">
                <div className="rounded-3xl bg-brand-navy p-6 sm:p-7">
                  <h3 className="flex items-center gap-2.5 font-heading text-base font-bold text-white">
                    <Clock className="h-5 w-5 text-amber-300" aria-hidden="true" />
                    {t.hoursTitle}
                  </h3>
                  <dl className="mt-4 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <dt className="text-blue-200/80">{t.daysSatThu}</dt>
                      <dd className="font-semibold text-white">{t.timeSatThu}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-blue-200/80">{t.friday}</dt>
                      <dd className="font-semibold text-amber-300">{t.fridayNote}</dd>
                    </div>
                  </dl>
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
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-blue"
                      >
                        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right: form */}
            <Reveal delay={0.1}>
              <div className="rounded-[2rem] border border-blue-100/80 bg-white p-7 shadow-[0_16px_50px_-24px_rgba(0,32,96,0.25)] sm:p-9">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-14 text-center"
                  >
                    <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" aria-hidden="true" />
                    </span>
                    <h3 className="font-heading mt-6 text-2xl font-bold text-brand-navy">
                      {t.successTitle}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
                      {t.successText.replace("{phone}", site.phone)}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-8 rounded-full border-brand-blue/30 px-7 font-semibold text-brand-navy hover:bg-blue-50"
                      onClick={() => setSent(false)}
                    >
                      {t.sendAnother}
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                        <MessageSquare className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="font-heading text-xl font-bold text-brand-navy sm:text-2xl">
                          {t.formTitle}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {t.formNote}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contact-name" className="text-sm font-semibold text-brand-navy">
                            {t.nameLabel} <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            id="contact-name"
                            name="name"
                            autoComplete="name"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder={t.namePlaceholder}
                            className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone" className="text-sm font-semibold text-brand-navy">
                            {t.phoneLabel}
                          </Label>
                          <Input
                            id="contact-phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder={t.phonePlaceholder}
                            className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email" className="text-sm font-semibold text-brand-navy">
                          {t.emailLabel} <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="contact-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder={t.emailPlaceholder}
                          className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-subject" className="text-sm font-semibold text-brand-navy">
                          {t.subjectLabel}
                        </Label>
                        <Input
                          id="contact-subject"
                          name="subject"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          placeholder={t.subjectPlaceholder}
                          className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-message" className="text-sm font-semibold text-brand-navy">
                          {t.messageLabel} <span className="text-rose-500">*</span>
                        </Label>
                        <Textarea
                          id="contact-message"
                          name="message"
                          required
                          rows={5}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder={t.messagePlaceholder}
                          className="resize-none rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-2xl bg-brand-blue py-6 text-base font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy disabled:translate-y-0 disabled:opacity-70"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                            {t.sending}
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" aria-hidden="true" />
                            {t.send}
                          </>
                        )}
                      </Button>
                      <p className="text-center text-xs text-slate-400">
                        {t.privacyNote}
                      </p>
                    </form>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="pb-16 sm:pb-20" aria-label="Clinic location map">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] border border-blue-100/80 shadow-[0_16px_50px_-24px_rgba(0,32,96,0.25)]">
              <iframe
                title="Map — Aristocrat Dental Care & Orthodontic Center, Uttara Dhaka"
                src="https://maps.google.com/maps?q=Aristocrat%20Dental%20Care%20Uttara%20Dhaka&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="h-[380px] w-full border-0 sm:h-[440px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBanner
        title={t.ctaTitle}
        description={t.ctaDescription}
      />
    </>
  );
}

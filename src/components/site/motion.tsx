"use client";

import { motion, useInView, useMotionValue, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Scroll-reveal wrapper — subtle, professional motion               */
/* ------------------------------------------------------------------ */

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stagger container & item                                           */
/* ------------------------------------------------------------------ */

export function StaggerContainer({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.09, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */

export function AnimatedCounter({
  value,
  suffix = "",
  decimals = 0,
  className,
  formatBn,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
  /** When provided, renders Bangla digits with this suffix */
  formatBn?: { suffix?: string };
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 32, stiffness: 90 });

  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const render = (v: number) => {
    const fixed = v.toFixed(decimals);
    if (formatBn) {
      return fixed.replace(/[0-9]/g, (dg) => bnDigits[Number(dg)]) + (formatBn.suffix ?? "");
    }
    return fixed + suffix;
  };

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    const unsub = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = render(latest);
      }
    });
    return unsub;
  }, [spring, decimals, suffix, formatBn]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {render(0)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Section heading — eyebrow + title + flourish + description         */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  dark?: boolean;
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]",
          dark
            ? "bg-white/10 text-blue-200 ring-1 ring-white/15"
            : "bg-blue-50 text-brand-blue ring-1 ring-blue-100"
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dark ? "bg-amber-400" : "bg-brand-blue"
          )}
          aria-hidden="true"
        />
        {eyebrow}
      </span>
      <h2
        className={cn(
          "font-heading mt-4 text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-[2.75rem]",
          dark ? "text-white" : "text-brand-navy"
        )}
      >
        {title}
      </h2>
      <span
        className={cn(
          "heading-flourish mt-5",
          align === "center" ? "justify-center" : "",
          dark ? "heading-flourish--gold" : ""
        )}
        aria-hidden="true"
      />
      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            dark ? "text-blue-100/80" : "text-slate-600"
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Global scroll progress bar — slim brand gradient under the navbar  */
/* ------------------------------------------------------------------ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-gold"
      style={{ scaleX }}
    />
  );
}

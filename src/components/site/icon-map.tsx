"use client";

import {
  Activity,
  Anchor,
  Baby,
  Crown,
  Gem,
  Grid3x3,
  Heart,
  Leaf,
  Scissors,
  Smile,
  Sparkles,
  Users,
  Wallet,
  Zap,
  ShieldCheck,
  Microscope,
  HeartHandshake,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Activity,
  Anchor,
  Baby,
  Crown,
  Gem,
  Grid3x3,
  Heart,
  Leaf,
  Scissors,
  Smile,
  Sparkles,
  Users,
  Wallet,
  Zap,
  ShieldCheck,
  Microscope,
  HeartHandshake,
  BadgeCheck,
};

export function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}

export const categoryColors: Record<string, { bg: string; text: string; ring: string }> = {
  Restorative: { bg: "bg-blue-50", text: "text-brand-blue", ring: "ring-blue-100" },
  Cosmetic: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  Orthodontics: { bg: "bg-teal-50", text: "text-teal-600", ring: "ring-teal-100" },
  Surgical: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
  Preventive: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
};

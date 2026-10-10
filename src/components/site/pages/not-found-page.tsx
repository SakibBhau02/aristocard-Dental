"use client";

import { Compass, Home } from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const { navigate } = useRouter();

  usePageMeta({
    title: "Page Not Found (404)",
    description:
      "The page you're looking for doesn't exist or has moved. Explore our dental services, doctors or book an appointment instead.",
  });

  return (
    <section className="hero-mesh flex flex-col items-center justify-center px-4 py-32 text-center">
      <span className="relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/50">
        <Compass className="h-10 w-10 text-brand-blue" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 font-heading text-xs font-bold text-brand-navy">
          404
        </span>
      </span>
      <h1 className="font-heading mt-8 text-3xl font-bold text-brand-navy sm:text-4xl">
        This page wandered off
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
        The page you're looking for doesn't exist or has moved. Let's get you
        back to a healthy smile.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          className="rounded-full bg-brand-blue px-8 py-6 font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-brand-navy"
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
            Back to Home
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-full border-brand-blue/30 px-8 py-6 font-bold text-brand-navy hover:bg-blue-50"
        >
          <a
            href="#/services"
            onClick={(e) => {
              e.preventDefault();
              navigate("/services");
            }}
            className="inline-flex items-center gap-2"
          >
            Browse Services
          </a>
        </Button>
      </div>
    </section>
  );
}

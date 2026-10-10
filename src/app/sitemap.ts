import type { MetadataRoute } from "next";
import { services } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";
import { blogPosts } from "@/lib/data/blog";

const BASE = "https://aristocratdentalcarebd.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/#/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/#/services", priority: 0.9, changeFrequency: "weekly" },
    { path: "/#/gallery", priority: 0.85, changeFrequency: "monthly" },
    { path: "/#/doctors", priority: 0.8, changeFrequency: "monthly" },
    { path: "/#/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/#/estimator", priority: 0.85, changeFrequency: "monthly" },
    { path: "/#/contact", priority: 0.7, changeFrequency: "yearly" },
    { path: "/#/appointment", priority: 0.9, changeFrequency: "monthly" },
    { path: "/#/status", priority: 0.6, changeFrequency: "monthly" },
    { path: "/#/faqs", priority: 0.7, changeFrequency: "monthly" },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority,
  }));

  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${BASE}/#/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const doctorPages: MetadataRoute.Sitemap = doctors.map((d) => ({
    url: `${BASE}/#/doctors/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${BASE}/#/blog/${p.slug}`,
    lastModified: new Date(p.updated),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...servicePages, ...doctorPages, ...blogPages];
}

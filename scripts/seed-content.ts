/* ------------------------------------------------------------------ */
/*  Content seed — migrates the static data files into the CMS tables. */
/*  Idempotent: safe to run repeatedly (upsert by slug / ordered).     */
/*  Run: bun run scripts/seed-content.ts                               */
/* ------------------------------------------------------------------ */

import { PrismaClient } from "@prisma/client";
import { doctors as staticDoctors } from "../src/lib/data/doctors";
import { blogPosts as staticPosts } from "../src/lib/data/blog";
import { generalFaqs as staticFaqs } from "../src/lib/data/faqs";
import { smileCases as staticCases } from "../src/lib/data/smile-cases";
import { services as staticServices } from "../src/lib/data/services";
import { homeHeroImages } from "../src/lib/data/hero-media";
import {
  defaultHomeContent,
  defaultAboutContent,
  defaultSettings,
} from "../src/lib/content/shared";

const db = new PrismaClient();

async function seed() {
  /* ---- Doctors ---- */
  for (let i = 0; i < staticDoctors.length; i++) {
    const d = staticDoctors[i];
    await db.doctor.upsert({
      where: { slug: d.slug },
      create: {
        slug: d.slug,
        legacyId: d.id,
        sort: i,
        name: d.name,
        credentialsJson: JSON.stringify(d.credentials),
        role: d.role,
        roleBn: d.roleBn,
        department: d.department,
        departmentBn: d.departmentBn,
        bio: d.bio,
        experienceYears: d.experienceYears,
        patientsTreated: d.patientsTreated,
        rating: d.rating,
        specializationsJson: JSON.stringify(d.specializations),
        languagesJson: JSON.stringify(d.languages),
        consultationDaysJson: JSON.stringify(d.consultationDays),
        accent: d.accent,
        photo: d.photo ?? null,
        active: true,
      },
      /* update keeps sort + photo defaults only when the admin has not
         set a custom photo already (null = untouched) */
      update: { sort: i },
    });
  }

  /* ---- Blog posts ---- */
  for (const p of staticPosts) {
    await db.blogPost.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        titleBn: p.titleBn,
        excerpt: p.excerpt,
        excerptBn: p.excerptBn,
        category: p.category,
        readTime: p.readTime,
        date: p.date,
        updated: p.updated,
        author: p.author,
        authorCredentials: p.authorCredentials,
        featured: p.featured ?? false,
        tagsJson: JSON.stringify(p.tags),
        serviceRefsJson: p.serviceRefs ? JSON.stringify(p.serviceRefs) : null,
        image: p.image,
        imageAlt: p.imageAlt,
        quickAnswer: p.quickAnswer,
        quickAnswerBn: p.quickAnswerBn,
        sectionsJson: JSON.stringify(p.sections),
        sectionsBnJson: p.sectionsBn ? JSON.stringify(p.sectionsBn) : null,
        status: "PUBLISHED",
      },
      update: {},
    });
  }

  /* ---- FAQs ---- */
  const existingFaqs = await db.faq.count();
  if (existingFaqs === 0) {
    for (let i = 0; i < staticFaqs.length; i++) {
      const f = staticFaqs[i];
      await db.faq.create({
        data: {
          sort: i,
          question: f.question,
          questionBn: f.questionBn,
          answer: f.answer,
          answerBn: f.answerBn,
          active: true,
        },
      });
    }
  }

  /* ---- Smile cases ---- */
  for (let i = 0; i < staticCases.length; i++) {
    const c = staticCases[i];
    await db.smileCase.upsert({
      where: { slug: c.id },
      create: {
        slug: c.id,
        sort: i,
        treatment: c.treatment,
        category: c.category,
        serviceSlug: c.serviceSlug || null,
        beforeSrc: c.beforeSrc,
        afterSrc: c.afterSrc,
        beforeAlt: c.beforeAlt,
        afterAlt: c.afterAlt,
        title: c.title,
        patient: c.patient,
        age: c.age,
        duration: c.duration,
        proceduresJson: JSON.stringify(c.procedures),
        result: c.result,
        featured: c.featured ?? false,
      },
      update: { sort: i },
    });
  }

  /* ---- Service content overlays (complete snapshot of every field) ---- */
  for (const s of staticServices) {
    await db.serviceContent.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        name: s.name,
        nameBn: s.nameBn,
        shortName: s.shortName,
        shortNameBn: s.shortNameBn,
        tagline: s.tagline,
        taglineBn: s.taglineBn,
        excerpt: s.excerpt,
        excerptBn: s.excerptBn,
        image: s.image,
        icon: s.icon,
        duration: s.duration,
        longevity: s.longevity,
        anesthesia: s.anesthesia,
        featured: s.featured ?? false,
        overviewJson: JSON.stringify(s.overview),
        benefitsJson: JSON.stringify(s.benefits),
        processJson: JSON.stringify(s.process),
        idealJson: JSON.stringify(s.ideal),
        faqsJson: JSON.stringify(s.faqs),
      },
      update: {},
    });
  }

  /* ---- Home hero slides ---- */
  const existingHero = await db.heroSlide.count({ where: { scope: "home" } });
  if (existingHero === 0) {
    for (let i = 0; i < homeHeroImages.length; i++) {
      const s = homeHeroImages[i];
      if (s.type !== "image") continue;
      await db.heroSlide.create({
        data: {
          scope: "home",
          sort: i,
          kind: "image",
          src: s.src,
          alt: s.alt,
          active: true,
        },
      });
    }
  }

  /* ---- Page blocks (home / about / settings) ---- */
  const blocks: [string, unknown][] = [
    ["home", defaultHomeContent()],
    ["about", defaultAboutContent()],
    ["settings", defaultSettings()],
  ];
  for (const [key, data] of blocks) {
    await db.pageBlock.upsert({
      where: { key },
      create: { key, dataJson: JSON.stringify(data) },
      update: {},
    });
  }

  const counts = {
    doctors: await db.doctor.count(),
    posts: await db.blogPost.count(),
    faqs: await db.faq.count(),
    cases: await db.smileCase.count(),
    services: await db.serviceContent.count(),
    heroSlides: await db.heroSlide.count(),
    pageBlocks: await db.pageBlock.count(),
  };
  console.log("✅ Content seed complete:", counts);
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

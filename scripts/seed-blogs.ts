import { db } from "../src/lib/db";
import { posts01 } from "./blog-seed/posts-01";
import { posts02 } from "./blog-seed/posts-02";
import { posts03 } from "./blog-seed/posts-03";
import { posts04 } from "./blog-seed/posts-04";
import { posts05 } from "./blog-seed/posts-05";
import { posts06 } from "./blog-seed/posts-06";
import type { NewBlogPost } from "./blog-seed/type";

/* ------------------------------------------------------------------ */
/*  Seed 24 SEO/AEO/GEO-optimized blog posts into the BlogPost        */
/*  table (idempotent upsert by slug). Existing 5 posts untouched.    */
/* ------------------------------------------------------------------ */

const ALL: NewBlogPost[] = [
  ...posts01,
  ...posts02,
  ...posts03,
  ...posts04,
  ...posts05,
  ...posts06,
];

async function main() {
  console.log(`Seeding ${ALL.length} blog posts…`);
  let created = 0;
  let updated = 0;
  const slugs = new Set<string>();

  for (const p of ALL) {
    if (slugs.has(p.slug)) throw new Error(`Duplicate slug in seed: ${p.slug}`);
    slugs.add(p.slug);

    if (p.sections.length === 0) throw new Error(`${p.slug}: no sections`);
    if (p.sectionsBn.length === 0) throw new Error(`${p.slug}: no BN sections`);
    for (const s of [...p.sections, ...p.sectionsBn]) {
      if (!s.heading || s.body.length === 0) {
        throw new Error(`${p.slug}: section without heading/body`);
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) throw new Error(`${p.slug}: bad date ${p.date}`);

    const data = {
      slug: p.slug,
      title: p.title,
      titleBn: p.titleBn,
      excerpt: p.excerpt,
      excerptBn: p.excerptBn,
      category: p.category,
      readTime: p.readTime,
      date: p.date,
      updated: p.updated ?? null,
      author: p.author,
      authorCredentials: p.authorCredentials,
      featured: p.featured ?? false,
      tagsJson: JSON.stringify(p.tags),
      serviceRefsJson: p.serviceRefs.length ? JSON.stringify(p.serviceRefs) : null,
      image: p.image,
      imageAlt: p.imageAlt,
      quickAnswer: p.quickAnswer,
      quickAnswerBn: p.quickAnswerBn,
      sectionsJson: JSON.stringify(
        p.sections.map((s) => ({
          heading: s.heading,
          body: s.body,
          ...(s.list ? { list: s.list } : {}),
        }))
      ),
      sectionsBnJson: JSON.stringify(
        p.sectionsBn.map((s) => ({
          heading: s.heading,
          body: s.body,
          ...(s.list ? { list: s.list } : {}),
        }))
      ),
      status: "PUBLISHED" as const,
    };

    const existing = await db.blogPost.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await db.blogPost.update({ where: { slug: p.slug }, data });
      updated++;
    } else {
      await db.blogPost.create({ data });
      created++;
    }
  }

  const total = await db.blogPost.count();
  const published = await db.blogPost.count({ where: { status: "PUBLISHED" } });
  console.log(`✅ Seeded ${ALL.length} posts (${created} created, ${updated} updated)`);
  console.log(`📚 BlogPost table now: ${total} rows (${published} published)`);

  // Per-service coverage audit
  const services = await db.serviceContent.findMany({ select: { slug: true } });
  const serviceSlugs = services.map((s) => s.slug);
  const allPosts = await db.blogPost.findMany({
    select: { serviceRefsJson: true },
  });
  const counts: Record<string, number> = {};
  for (const row of allPosts) {
    const refs = row.serviceRefsJson ? (JSON.parse(row.serviceRefsJson) as string[]) : [];
    for (const ref of refs) counts[ref] = (counts[ref] ?? 0) + 1;
  }
  console.log("\nService coverage (posts referencing each service):");
  for (const s of serviceSlugs) {
    const n = counts[s] ?? 0;
    const flag = n >= 2 ? "✓" : "✗ NEEDS MORE";
    console.log(`  ${flag} ${s}: ${n}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });

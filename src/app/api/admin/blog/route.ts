import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapBlogPost } from "@/lib/content/shared";
import {
  guard, readJson, bad, notFound, serverError, ok,
  s, os, n, b, strList, validSlug, clamp, clampLen,
} from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  Admin API — Blog management (full CRUD, bilingual, drafts)         */
/*  GET    /api/admin/blog         → all posts (incl. drafts)          */
/*  POST   /api/admin/blog         → create (no id) / update (id)      */
/*  DELETE /api/admin/blog?id=…    → remove                             */
/* ------------------------------------------------------------------ */

type SectionInput = { heading?: unknown; body?: unknown; list?: unknown };

function sanitizeSections(input: unknown): { heading: string; body: string[]; list?: string[] }[] {
  if (!Array.isArray(input)) return [];
  const out: { heading: string; body: string[]; list?: string[] }[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const sec = raw as SectionInput;
    const heading = s(sec.heading).trim();
    const body = strList(sec.body);
    if (!heading && body.length === 0) continue;
    const list = strList(sec.list);
    out.push({
      heading: clampLen(heading, 200),
      body: body.map((p) => clampLen(p, 4000)),
      ...(list.length ? { list: list.map((li) => clampLen(li, 400)) } : {}),
    });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  try {
    const rows = await db.blogPost.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json({ posts: rows.map((r) => mapBlogPost(r as unknown as Record<string, unknown>)) });
  } catch (err) {
    return serverError("blog", err);
  }
}

export async function POST(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  try {
    const body = await readJson(req);
    if (!body) return bad("A valid JSON body is required.");

    const id = os(body.id);
    const title = clampLen(s(body.title).trim(), 200);
    if (title.length < 5) return bad("Post title must be at least 5 characters.");

    const slug = os(body.slug) ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!validSlug(slug)) return bad("Slug must be lowercase letters, numbers and hyphens (2-80 chars).");

    const excerpt = clampLen(s(body.excerpt).trim(), 600);
    if (excerpt.length < 10) return bad("Excerpt must be at least 10 characters.");
    const quickAnswer = clampLen(s(body.quickAnswer).trim(), 1200);
    if (quickAnswer.length < 10) return bad("Quick answer must be at least 10 characters.");

    const sections = sanitizeSections(body.sections);
    if (sections.length === 0) return bad("At least one content section is required.");

    const sectionsBn = sanitizeSections(body.sectionsBn);
    const dateMatch = /^\d{4}-\d{2}-\d{2}$/.test(s(body.date));
    const date = dateMatch ? s(body.date) : new Date().toISOString().slice(0, 10);

    const serviceRefs = strList(body.serviceRefs);
    const status = s(body.status) === "DRAFT" ? "DRAFT" : "PUBLISHED";

    const data = {
      slug,
      title,
      titleBn: os(body.titleBn),
      excerpt,
      excerptBn: os(body.excerptBn),
      category: clampLen(s(body.category, "General").trim() || "General", 60),
      readTime: clampLen(s(body.readTime, "5 min read").trim() || "5 min read", 30),
      date,
      updated: os(body.updated),
      author: clampLen(s(body.author, "Dr. Shazia Khanam").trim() || "Dr. Shazia Khanam", 120),
      authorCredentials: clampLen(s(body.authorCredentials, "BDS, MDS").trim() || "BDS, MDS", 150),
      featured: b(body.featured, false),
      tagsJson: JSON.stringify(strList(body.tags)),
      serviceRefsJson: serviceRefs.length ? JSON.stringify(serviceRefs) : null,
      image: os(body.image),
      imageAlt: os(body.imageAlt),
      quickAnswer,
      quickAnswerBn: os(body.quickAnswerBn),
      sectionsJson: JSON.stringify(sections),
      sectionsBnJson: sectionsBn.length ? JSON.stringify(sectionsBn) : null,
      status,
    };

    if (id) {
      const existing = await db.blogPost.findUnique({ where: { id } });
      if (!existing) return notFound("No post found with that id.");
      if (slug !== existing.slug) {
        const clash = await db.blogPost.findUnique({ where: { slug } });
        if (clash && clash.id !== id) return bad("Another post already uses that slug.");
      }
      const row = await db.blogPost.update({ where: { id }, data });
      return ok({ post: mapBlogPost(row as unknown as Record<string, unknown>), id }, "Post updated.");
    }

    const clash = await db.blogPost.findUnique({ where: { slug } });
    if (clash) return bad("A post with that slug already exists.");
    const row = await db.blogPost.create({ data });
    return ok({ post: mapBlogPost(row as unknown as Record<string, unknown>), id: row.id }, "Post created.");
  } catch (err) {
    return serverError("blog", err);
  }
}

export async function DELETE(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  try {
    const id = req.nextUrl.searchParams.get("id") ?? "";
    if (!id) return bad("An ?id= query parameter is required.");
    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) return notFound("No post found with that id.");
    await db.blogPost.delete({ where: { id } });
    return ok({ id }, "Post deleted.");
  } catch (err) {
    return serverError("blog", err);
  }
}

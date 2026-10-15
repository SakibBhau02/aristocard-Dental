/* ------------------------------------------------------------------ */
/*  One-time migration: every local image -> Cloudflare R2, then       */
/*  rewrite Neon content rows (/images/..., /uploads/...) to R2 URLs.   */
/*  Idempotent: re-uploads overwrite the same keys; DB rows already on  */
/*  R2 URLs are skipped. Code-level static paths (logo/og in layout,   */
/*  footer) intentionally stay local — they ship with the Vercel build. */
/*  Run: npx tsx scripts/migrate-images-to-r2.ts                        */
/* ------------------------------------------------------------------ */

import { createRequire } from "module";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, sep } from "path";

const require = createRequire(process.cwd() + "/package.json");
const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3") as typeof import("@aws-sdk/client-s3");

/* ---- env (no dotenv dependency) ---- */
const env: Record<string, string> = {};
for (const line of readFileSync(process.cwd() + "/.env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
for (const k of ["DATABASE_URL", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL"]) {
  if (!env[k]) throw new Error(`Missing ${k} in .env`);
  process.env[k] = env[k];
}
const PUBLIC_BASE = env.R2_PUBLIC_URL.replace(/\/+$/, "");

const CT: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".avif": "image/avif", ".ico": "image/x-icon",
};

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
});

/* ---- collect local image files ---- */
function walk(dir: string, base: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, e.name);
    if (e.isDirectory()) walk(abs, base, out);
    else if (/\.(png|jpe?g|webp|gif|svg|avif|ico)$/i.test(e.name)) out.push(relative(base, abs).split(sep).join("/"));
  }
  return out;
}
const publicFiles = walk(join(process.cwd(), "public"), join(process.cwd(), "public"));
const legacyFiles = walk(join(process.cwd(), "upload"), join(process.cwd(), "upload"));

const uploaded = new Map<string, string>(); // local site path -> R2 url
async function put(key: string, body: Buffer, file: string) {
  const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
  await s3.send(new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME, Key: key, Body: body,
    ContentType: CT[ext] ?? "application/octet-stream",
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${PUBLIC_BASE}/${key}`;
}

let fileCount = 0;
async function main() {
for (const rel of publicFiles) {
  const url = await put(rel, readFileSync(join(process.cwd(), "public", rel)), rel);
  uploaded.set(`/${rel}`, url);
  fileCount++;
}
for (const rel of legacyFiles) {
  const url = await put(`uploads/legacy/${rel}`, readFileSync(join(process.cwd(), "upload", rel)), rel);
  uploaded.set(`/uploads/legacy/${rel}`, url);
  fileCount++;
}
console.log(`FILES_UPLOADED=${fileCount} (public=${publicFiles.length}, legacy=${legacyFiles.length})`);

/* ---- rewrite Neon rows ---- */
const db = new PrismaClient();
const stats: Record<string, number> = {};
async function rewriteField(
  table: string, findMany: () => Promise<any[]>,
  getVal: (r: any) => string | null, save: (r: any, url: string) => Promise<unknown>
) {
  let n = 0;
  for (const row of await findMany()) {
    const v = getVal(row);
    if (!v || !v.startsWith("/")) continue;
    const url = uploaded.get(v);
    if (!url) { console.log(`SKIP ${table} ${row.id ?? row.slug ?? row.key}: ${v} (no local file)`); continue; }
    await save(row, url);
    n++;
  }
  stats[table] = (stats[table] ?? 0) + n;
}

await rewriteField("doctor.photo", () => db.doctor.findMany(), (r) => r.photo,
  (r, url) => db.doctor.update({ where: { id: r.id }, data: { photo: url } }));
await rewriteField("blog.image", () => db.blogPost.findMany(), (r) => r.image,
  (r, url) => db.blogPost.update({ where: { id: r.id }, data: { image: url } }));
await rewriteField("case.before", () => db.smileCase.findMany(), (r) => r.beforeSrc,
  (r, url) => db.smileCase.update({ where: { id: r.id }, data: { beforeSrc: url } }));
await rewriteField("case.after", () => db.smileCase.findMany(), (r) => r.afterSrc,
  (r, url) => db.smileCase.update({ where: { id: r.id }, data: { afterSrc: url } }));
await rewriteField("service.image", () => db.serviceContent.findMany(), (r) => r.image,
  (r, url) => db.serviceContent.update({ where: { slug: r.slug }, data: { image: url } }));
for (const row of await db.heroSlide.findMany()) {
  if (row.kind !== "image" || !row.src.startsWith("/")) continue;
  const url = uploaded.get(row.src);
  if (!url) { console.log(`SKIP hero ${row.id}: ${row.src}`); continue; }
  await db.heroSlide.update({ where: { id: row.id }, data: { src: url } });
  stats["hero.src"] = (stats["hero.src"] ?? 0) + 1;
}
/* PageBlock dataJson: replace every known local path with its R2 URL */
for (const row of await db.pageBlock.findMany()) {
  let json = row.dataJson;
  let hits = 0;
  for (const [local, url] of uploaded) {
    if (json.includes(`"${local}"`)) { json = json.split(`"${local}"`).join(`"${url}"`); hits++; }
  }
  if (json !== row.dataJson) {
    await db.pageBlock.update({ where: { key: row.key }, data: { dataJson: json } });
    stats[`pageblock.${row.key}`] = hits;
  }
}
console.log("DB_REWRITES=" + JSON.stringify(stats));
await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

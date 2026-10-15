import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/* ------------------------------------------------------------------ */
/*  Cloudflare R2 storage (S3-compatible)                               */
/*                                                                     */
/*  Env (see .env.example):                                             */
/*   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,             */
/*   R2_BUCKET_NAME, R2_PUBLIC_URL (public r2.dev or custom domain)    */
/*                                                                     */
/*  Uploads go to:  uploads/YYYY/MM/<uuid>.<ext>                       */
/*  and are served from R2_PUBLIC_URL (public bucket / custom domain). */
/*  Local dev without R2 vars falls back to public/uploads/ (see        */
/*  /api/admin/upload) — Vercel's filesystem is read-only, so R2 is    */
/*  REQUIRED in production.                                            */
/* ------------------------------------------------------------------ */

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel serverless body limit)

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export function r2Enabled(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
  );
}

function r2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
  });
}

export function publicUrlFor(key: string): string {
  return `${(process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
}

/** Accepts local form paths (/images/…, /uploads/…) and R2 https URLs. */
export function isAllowedImageSrc(src: string): boolean {
  if (src.startsWith("/")) return true;
  if (src.startsWith("https://") || src.startsWith("http://")) {
    try {
      const host = new URL(src).hostname.toLowerCase();
      const configured = process.env.R2_PUBLIC_URL
        ? new URL(process.env.R2_PUBLIC_URL).hostname.toLowerCase()
        : null;
      if (configured && host === configured) return true;
      if (host.endsWith(".r2.dev") || host.endsWith(".r2.cloudflarestorage.com")) return true;
      return false; // no hotlinking to random hosts
    } catch {
      return false;
    }
  }
  return false;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "Only PNG, JPEG, WebP or GIF images are allowed.";
  }
  if (file.size <= 0) return "The uploaded file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return "Image must be 4 MB or smaller.";
  return null;
}

function extFor(file: File): string {
  const fromType: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const byType = fromType[file.type];
  if (byType) return byType;
  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  return /^[a-z0-9]{2,4}$/.test(fromName) ? fromName : "png";
}

export function buildUploadKey(file: File): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return `uploads/${yyyy}/${mm}/${id}.${extFor(file)}`;
}

export async function uploadToR2(
  key: string,
  body: Uint8Array | Buffer,
  contentType: string
): Promise<string> {
  const bucket = process.env.R2_BUCKET_NAME ?? "";
  await r2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return publicUrlFor(key);
}

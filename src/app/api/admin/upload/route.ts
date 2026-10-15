import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { bad, guard, serverError } from "@/lib/content/admin-api";
import {
  buildUploadKey,
  isAllowedImageSrc,
  r2Enabled,
  uploadToR2,
  validateImageFile,
} from "@/lib/r2";

/* ------------------------------------------------------------------ */
/*  Admin API — Image upload                                            */
/*  POST /api/admin/upload (multipart form, field "file") → { url }    */
/*                                                                     */
/*  Production (Vercel, read-only filesystem) → Cloudflare R2, needs    */
/*  R2_* env (see .env.example). Local dev without R2 vars falls back   */
/*  to public/uploads/ so the admin panel keeps working offline.        */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) return bad("No file attached (field name: file).");

    const invalid = validateImageFile(file);
    if (invalid) return bad(invalid);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const key = buildUploadKey(file);

    if (r2Enabled()) {
      const url = await uploadToR2(key, bytes, file.type);
      if (!isAllowedImageSrc(url)) return serverError("upload", new Error("R2 URL rejected"));
      return NextResponse.json({ url });
    }

    /* ---- local-dev fallback (never used on Vercel) ---- */
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Image storage is not configured. Set the R2_* environment variables." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }
    const rel = key; // uploads/YYYY/MM/<uuid>.<ext>
    const abs = join(process.cwd(), "public", rel);
    await mkdir(join(abs, ".."), { recursive: true });
    await writeFile(abs, bytes);
    return NextResponse.json({ url: `/${rel}` });
  } catch (err) {
    return serverError("upload", err);
  }
}

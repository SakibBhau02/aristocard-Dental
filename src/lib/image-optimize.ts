/* ------------------------------------------------------------------ */
/*  Client-side image optimiser                                        */
/*                                                                     */
/*  Every admin upload goes through this before it ever touches the    */
/*  network: the picture is decoded, scaled down to a sane web size,   */
/*  and re-encoded as WebP. A 12 MP phone photo (6–8 MB) typically     */
/*  lands around 150–350 KB, so uploads stay far below the server      */
/*  body limit and the site serves far less data.                      */
/*                                                                     */
/*  Animated GIFs are passed through untouched (rasterising them       */
/*  would freeze the animation). Anything the browser cannot decode    */
/*  is also passed through — the server then normalises it with sharp. */
/* ------------------------------------------------------------------ */

export const IMAGE_MAX_DIMENSION = 1920;
export const IMAGE_WEBP_QUALITY = 0.82;
/** Hard ceiling for the original file the admin picks (bytes). */
export const IMAGE_MAX_SOURCE_BYTES = 30 * 1024 * 1024; // 30 MB

export type OptimizedImage = {
  file: File;
  /** Size of the file the admin picked. */
  originalBytes: number;
  /** Size of what will actually be uploaded. */
  bytes: number;
  width: number;
  height: number;
  /** True when the bytes were re-encoded (i.e. not the original file). */
  converted: boolean;
};

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This image could not be read by the browser."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/** "holiday photo.JPG" → "holiday photo.webp" */
function webpName(name: string): string {
  const base = name.replace(/\.[^.\\/]+$/, "") || "image";
  return `${base}.webp`;
}

/**
 * Decode → resize → encode as WebP.
 *
 * Never throws: if anything fails (unsupported codec, no canvas, zero
 * sized bitmap) the original file is returned unchanged so the upload
 * still succeeds. Callers only need to upload `result.file`.
 */
export async function optimizeImageForUpload(
  input: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<OptimizedImage> {
  const maxDimension = options.maxDimension ?? IMAGE_MAX_DIMENSION;
  const quality = options.quality ?? IMAGE_WEBP_QUALITY;

  const passthrough: OptimizedImage = {
    file: input,
    originalBytes: input.size,
    bytes: input.size,
    width: 0,
    height: 0,
    converted: false,
  };

  if (typeof window === "undefined" || typeof document === "undefined") return passthrough;
  if (!input.type.startsWith("image/")) return passthrough;
  /* keep animated gifs animated */
  if (input.type === "image/gif") return passthrough;
  if (input.size === 0) return passthrough;

  try {
    let source: ImageBitmap | HTMLImageElement;
    let width = 0;
    let height = 0;

    if (typeof createImageBitmap === "function") {
      try {
        source = await createImageBitmap(input, { imageOrientation: "from-image" });
      } catch {
        source = await createImageBitmap(input);
      }
      width = source.width;
      height = source.height;
    } else {
      source = await loadImageElement(input);
      width = source.naturalWidth || source.width;
      height = source.naturalHeight || source.height;
    }

    if (!width || !height) return passthrough;

    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return passthrough;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source as CanvasImageSource, 0, 0, targetW, targetH);
    if ("close" in source && typeof source.close === "function") source.close();

    let blob = await canvasToBlob(canvas, "image/webp", quality);
    let contentType = "image/webp";

    /* Browsers without a WebP encoder silently fall back to PNG. */
    if (!blob || blob.type !== "image/webp") {
      blob = await canvasToBlob(canvas, "image/jpeg", 0.86);
      contentType = "image/jpeg";
    }
    if (!blob) return passthrough;

    /* Re-encoding an already-tiny WebP can make it bigger — keep the
       original in that case instead of shipping a worse file. */
    const alreadySmallWebp =
      input.type === "image/webp" && input.size <= blob.size && scale === 1;
    if (alreadySmallWebp) {
      return { ...passthrough, width: targetW, height: targetH };
    }

    const file = new File([blob], contentType === "image/webp" ? webpName(input.name) : input.name, {
      type: contentType,
      lastModified: Date.now(),
    });

    return {
      file,
      originalBytes: input.size,
      bytes: file.size,
      width: targetW,
      height: targetH,
      converted: true,
    };
  } catch {
    return passthrough;
  }
}

/** "1.4 MB" / "320 KB" — compact label for the upload UI. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ */
/*  Image src guard (client side)                                      */
/*                                                                     */
/*  Uploads return an absolute R2 URL, not a "/images/…" path — so     */
/*  form validation must accept https:// sources too. The server       */
/*  still runs the strict host check in lib/r2.ts.                     */
/* ------------------------------------------------------------------ */
export function looksLikeImageSrc(value: string): boolean {
  const src = value.trim();
  if (!src) return false;
  if (src.startsWith("/")) return true;
  return /^https?:\/\/\S+$/i.test(src);
}

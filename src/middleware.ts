import { NextResponse, type NextRequest } from "next/server";

/* ------------------------------------------------------------------ */
/*  Middleware — admin API freshness guard                              */
/*                                                                     */
/*  Every /api/admin/* response is forced to `no-store` so neither the  */
/*  browser HTTP cache nor any intermediate cache can replay a stale    */
/*  payload. Without this, an admin panel that re-fetches a list after  */
/*  a save (or on tab revisit / window focus) could be served the       */
/*  pre-save copy — making edits look like they were never persisted    */
/*  even though the database was already updated.                       */
/*                                                                     */
/*  Applies to all methods incl. GET, and to both success and error     */
/*  responses. CSV exports already set their own headers; `no-store`    */
/*  is compatible with those.                                           */
/* ------------------------------------------------------------------ */

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  return res;
}

export const config = {
  matcher: ["/api/admin/:path*"],
};

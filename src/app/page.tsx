import { SiteShell } from "@/components/site/site-shell";
import { getContentBundle } from "@/lib/content/server";

/* Server component — loads the full CMS content bundle from the DB
   (with static-file fallback) so the first paint is SEO-safe and
   flash-free.

   IMPORTANT: this route must be rendered per request, never frozen at
   build time. Every public URL ("/", /about, /services/… — the SPA shell
   is served for all of them through the rewrite in next.config.ts) reads
   its text and images from the CMS, so a prerendered copy would keep
   serving the build-day snapshot after an admin upload: the panel shows
   the new photo, the database has it, but the live site keeps showing the
   old one until the next deployment. `force-dynamic` makes the HTML match
   the database on the very next request (the bundle itself is still
   memoised per instance and re-keyed whenever content changes). */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Home() {
  const content = await getContentBundle();
  return <SiteShell initialContent={content} />;
}

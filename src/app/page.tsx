import { SiteShell } from "@/components/site/site-shell";
import { getContentBundle } from "@/lib/content/server";

/* Server component — loads the full CMS content bundle from the DB
   (with static-file fallback) so the first paint is SEO-safe and
   flash-free. Admin edits are picked up on the next request. */
export default async function Home() {
  const content = await getContentBundle();
  return <SiteShell initialContent={content} />;
}

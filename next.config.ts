import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  /* Admin-uploaded images live on Cloudflare R2 (see src/lib/r2.ts).
     next/image needs the R2 host allow-listed: the configured
     R2_PUBLIC_URL host plus the default *.r2.dev public subdomains. */
  images: {
    remotePatterns: [
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
            },
          ]
        : []),
      { protocol: "https" as const, hostname: "*.r2.dev" },
    ],
  },
  /* SPA-style clean URLs: the public site is a single-route app
     (src/app/page.tsx renders every page client-side). This afterFiles
     rewrite maps every unknown path back to "/" so deep links such as
     /about, /services/dental-implants or /blog/<slug> survive a hard
     refresh and are indexable — no hash fragments, real history entries.
     Reserved prefixes (API, uploads) and real files are untouched:
     afterFiles rewrites run only after filesystem + route checks miss. */
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/((?!api/|_next/|uploads/|favicon\\.ico).+)",
          destination: "/",
        },
      ],
    };
  },
};

export default nextConfig;

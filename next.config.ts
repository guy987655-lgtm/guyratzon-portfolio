import type { NextConfig } from "next";

const indexing = process.env.INDEXING === "true";
// PostHog through our own origin (/ingest), so host-based blockers don't drop events.
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
const posthogAssets = posthogHost.replace("://eu.i.", "://eu-assets.i.").replace("://us.i.", "://us-assets.i.");
const noindex = { key: "X-Robots-Tag", value: "noindex, nofollow" };

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Required by the PostHog proxy: its API paths end with a slash.
  skipTrailingSlashRedirect: true,
  experimental: {
    globalNotFound: true,
  },
  images: {
    formats: ["image/webp"],
    qualities: [75, 90],
  },
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `${posthogAssets}/static/:path*` },
      { source: "/ingest/:path*", destination: `${posthogHost}/:path*` },
    ];
  },
  async headers() {
    return [
      // The review page stays out of every index, forever.
      { source: "/_review", headers: [noindex] },
      // Until launch the whole site answers noindex (robots.txt stays open so crawlers can see it).
      ...(indexing ? [] : [{ source: "/:path*", headers: [noindex] }]),
    ];
  },
};

export default nextConfig;

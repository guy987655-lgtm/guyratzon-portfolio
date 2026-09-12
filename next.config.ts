import type { NextConfig } from "next";

const indexing = process.env.INDEXING === "true";
const noindex = { key: "X-Robots-Tag", value: "noindex, nofollow" };

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    globalNotFound: true,
  },
  images: {
    formats: ["image/webp"],
    qualities: [75, 90],
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

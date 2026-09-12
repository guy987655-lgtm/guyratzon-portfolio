import type { MetadataRoute } from "next";
import { INDEXING, SITE_URL } from "@/lib/site";

/**
 * Crawling stays allowed even before launch: a Disallow would stop crawlers from ever seeing the
 * noindex header/meta. Until INDEXING=true every response carries noindex instead.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    ...(INDEXING ? { sitemap: `${SITE_URL}/sitemap.xml` } : {}),
  };
}

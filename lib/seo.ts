import type { Metadata } from "next";
import { localizePath, locales, type Locale } from "./i18n";
import { INDEXING, SITE_URL } from "./site";

/**
 * Canonical + hreflang (he, en, x-default → he) + Open Graph for a locale-less path such as
 * "/work/specv". Robots stays noindex until launch.
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  ogImage,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
}): Metadata {
  const url = (l: Locale) => `${SITE_URL}${localizePath(path, l)}`;
  const languages = Object.fromEntries(locales.map((l) => [l, url(l)])) as Record<string, string>;
  languages["x-default"] = url("he");

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: url(locale), languages },
    openGraph: {
      type: "website",
      url: url(locale),
      title,
      description,
      locale: locale === "he" ? "he_IL" : "en_US",
      alternateLocale: locale === "he" ? ["en_US"] : ["he_IL"],
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: ogImage ? "summary_large_image" : "summary", title, description },
    robots: INDEXING ? { index: true, follow: true } : { index: false, follow: false },
  };
}

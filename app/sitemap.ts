import type { MetadataRoute } from "next";
import { projectMeta } from "@/content/projects";
import { localizePath } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

/** Every public page in both languages, each listing its alternate. /_review is never listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/how-i-work", "/about", ...projectMeta.map((p) => `/work/${p.slug}`), "/work/specv/data"];
  return paths.flatMap((path) =>
    (["he", "en"] as const).map((locale) => ({
      url: `${SITE_URL}${localizePath(path, locale)}`,
      alternates: {
        languages: {
          he: `${SITE_URL}${localizePath(path, "he")}`,
          en: `${SITE_URL}${localizePath(path, "en")}`,
          "x-default": `${SITE_URL}${localizePath(path, "he")}`,
        },
      },
    })),
  );
}

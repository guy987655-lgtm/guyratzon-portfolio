"use client";

import { useEffect } from "react";
import { takeEntry, track } from "@/lib/analytics";

/**
 * Fires project_open on arrival (not on the click that left the previous page, which would be
 * lost to navigation). Also reports clicks on the "open the live site" link.
 */
export function ProjectOpen({ slug }: { slug: string }) {
  useEffect(() => {
    track("project_open", { slug, entry: takeEntry() });
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[data-live-link]");
      if (link) track("live_site_click", { slug, from: "page" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [slug]);
  return null;
}

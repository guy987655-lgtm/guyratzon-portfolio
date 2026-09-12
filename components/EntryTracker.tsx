"use client";

import { useEffect } from "react";
import { rememberEntry } from "@/lib/analytics";

/** Records how a visitor reached a project page (links carry data-entry="card|peek|nav|next"). */
export function EntryTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[data-entry]");
      const entry = link?.dataset.entry;
      if (entry === "card" || entry === "peek" || entry === "nav" || entry === "next") rememberEntry(entry);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}

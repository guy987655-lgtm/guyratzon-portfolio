"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { consumeHandoff, restoreScrollPosition } from "@/lib/handoff";

/**
 * Applies a handoff left by the previous page (language switch): re-opens panels, restores the
 * reading position, and re-opens a quick peek. Analytics events in the handoff are picked up by
 * the analytics module when it loads.
 */
export function HandoffRestore() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const handoff = consumeHandoff(pathname);
    if (!handoff) return;
    for (const id of handoff.openDetails ?? []) {
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement) el.open = true;
    }
    if (handoff.section) restoreScrollPosition(handoff.section, handoff.sectionRatio ?? 0);
    if (handoff.peek) window.dispatchEvent(new CustomEvent("peek:open", { detail: handoff.peek }));
    if (handoff.event) {
      (window as unknown as { __pendingEvents?: unknown[] }).__pendingEvents ??= [];
      (window as unknown as { __pendingEvents: unknown[] }).__pendingEvents.push(handoff.event);
      window.dispatchEvent(new CustomEvent("analytics:pending"));
    }
  }, [pathname]);

  return null;
}

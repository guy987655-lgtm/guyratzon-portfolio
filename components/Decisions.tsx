"use client";

import { useLayoutEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { InlineScript } from "./InlineScript";

type Item = { id: string; title: string; why: string; tradeoff: string };

const MOBILE = "(max-width: 767px)";

/**
 * Decision cards as semantic <details>: open on desktop, folded on mobile, every word in the HTML
 * either way. Hard navigations fold them during parsing (inline script, no flash); soft
 * navigations fold them before paint (layout effect).
 */
export function Decisions({ slug, items, labels }: { slug: string; items: Item[]; labels: { why: string; tradeoff: string } }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || el.dataset.folded || !window.matchMedia(MOBILE).matches) return;
    el.querySelectorAll("details").forEach((d) => (d.open = false));
    el.dataset.folded = "1";
  }, []);

  return (
    <div ref={root} id={`decisions-${slug}`} className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <details
          key={item.id}
          id={`decision-${item.id}`}
          open
          onToggle={(e) => {
            if ((e.currentTarget as HTMLDetailsElement).open) track("decision_expand", { slug, title: item.id });
          }}
          className="group rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] open:pb-6"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
            <span>{item.title}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-1 size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm font-semibold text-accent">{labels.why}</dt>
              <dd className="mt-1">{item.why}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-muted">{labels.tradeoff}</dt>
              <dd className="mt-1">{item.tradeoff}</dd>
            </div>
          </dl>
        </details>
      ))}
      <InlineScript
        html={`{var r=document.getElementById(${JSON.stringify(`decisions-${slug}`)});if(r&&window.matchMedia(${JSON.stringify(MOBILE)}).matches){r.querySelectorAll("details").forEach(function(d){d.open=false});r.dataset.folded="1"}}`}
      />
    </div>
  );
}

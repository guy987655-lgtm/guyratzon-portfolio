"use client";

import { useEffect, useState } from "react";

/**
 * Sticky in-page navigation. Plain anchor links (work without JS); an IntersectionObserver
 * highlights the section being read.
 */
export function JumpBar({ items, label }: { items: { id: string; label: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="sticky top-16 z-30 border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 text-sm [scrollbar-width:none] sm:px-6">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={`block rounded-full px-3 py-1.5 font-medium transition-colors duration-150 ${
                active === item.id ? "bg-ink text-paper" : "text-muted hover:bg-sunken hover:text-ink"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

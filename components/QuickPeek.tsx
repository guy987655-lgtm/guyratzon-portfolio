"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { rememberEntry, track } from "@/lib/analytics";
import type { Shot } from "@/lib/screenshots";

export type PeekItem = {
  slug: string;
  title: string;
  tagline: string;
  points: string[];
  href: string;
  liveUrl?: string;
  screens: { light: Shot | null; dark: Shot | null; caption: string }[];
};

type Labels = { close: string; readStory: string; openLive: string; points: string; screen: string; previous: string; next: string; demoData: string };

/**
 * The quick look: one native modal <dialog> for all cards (Esc, focus trap and top layer for free;
 * background scroll is locked by CSS). Opened by any [data-peek-trigger] link — without JS those
 * links simply go to the full story. Closes on Esc, a click outside, or a downward swipe.
 */
export function QuickPeek({ items, labels, rtl }: { items: Record<string, PeekItem>; labels: Labels; rtl: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const track_ = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchY = useRef<number | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const item = slug ? items[slug] : undefined;

  const open = useCallback(
    (next: string) => {
      if (!items[next]) return;
      setSlug(next);
      setIndex(0);
      if (!dialog.current?.open) dialog.current?.showModal();
      track("quick_peek_open", { slug: next });
    },
    [items],
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-peek-trigger]");
      if (!trigger || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      opener.current = trigger;
      open(trigger.dataset.peekTrigger!);
    };
    const onOpenEvent = (e: Event) => open((e as CustomEvent<string>).detail);
    document.addEventListener("click", onClick);
    window.addEventListener("peek:open", onOpenEvent);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("peek:open", onOpenEvent);
    };
  }, [open]);

  const close = () => dialog.current?.close();

  const scrollTo = (i: number) => {
    const el = track_.current;
    const slide = el?.children[i] as HTMLElement | undefined;
    if (!el || !slide) return;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = track_.current;
    if (!el) return;
    const i = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  const total = item?.screens.length ?? 0;
  const go = (delta: number) => {
    const next = Math.min(total - 1, Math.max(0, index + delta));
    scrollTo(next);
    track("gallery_interact", { slug, device: "peek" });
  };

  return (
    <dialog
      ref={dialog}
      data-peek={slug ?? undefined}
      aria-labelledby="peek-title"
      onClose={() => {
        setSlug(null);
        opener.current?.focus();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close(); // backdrop
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(rtl ? -1 : 1);
        if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
      }}
      onTouchStart={(e) => {
        touchY.current = e.touches[0]?.clientY ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchY.current;
        const end = e.changedTouches[0]?.clientY;
        touchY.current = null;
        if (start != null && end != null && end - start > 90 && (dialog.current?.scrollTop ?? 0) <= 0) close();
      }}
      className="peek m-0 mt-auto w-full max-w-none rounded-t-3xl bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50 sm:m-auto sm:max-w-3xl sm:rounded-3xl"
    >
      {item && (
        <div className="max-h-[92dvh] overflow-y-auto">
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-line sm:hidden" aria-hidden="true" />
          <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-4 sm:px-7 sm:pt-6">
            <div>
              <h2 id="peek-title" className="text-2xl font-bold tracking-tight">
                {item.title}
              </h2>
              <p className="mt-1 text-muted">{item.tagline}</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-sunken"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className="relative px-5 sm:px-7">
            <div
              ref={track_}
              onScroll={onScroll}
              className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl border border-line bg-sunken [scrollbar-width:none]"
              aria-roledescription="carousel"
            >
              {item.screens.map((s, i) => (
                <figure key={i} className="w-full shrink-0 snap-center" aria-label={labels.screen.replace("{n}", String(i + 1)).replace("{total}", String(total))}>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {[s.light, s.dark]
                      .filter((shot, j, arr): shot is Shot => !!shot && arr.findIndex((o) => o?.file === shot.file) === j)
                      .map((shot, j, arr) => (
                        <Image
                          key={shot.file}
                          src={shot.file}
                          alt={s.caption}
                          width={shot.width}
                          height={shot.height}
                          sizes="(min-width: 640px) 700px, 100vw"
                          className={`absolute inset-0 h-full w-full object-cover object-top ${arr.length > 1 ? (j === 0 ? "dark:hidden" : "hidden dark:block") : ""}`}
                        />
                      ))}
                    <span className="absolute start-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-paper">{labels.demoData}</span>
                  </div>
                  <figcaption className="px-4 py-2.5 text-sm text-muted">{s.caption}</figcaption>
                </figure>
              ))}
            </div>
            {total > 1 && (
              <div className="mt-3 flex items-center justify-center gap-3">
                <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label={labels.previous} className="inline-flex size-9 items-center justify-center rounded-full border border-line disabled:opacity-40">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <span className="text-sm tabular-nums text-muted" aria-live="polite">
                  {labels.screen.replace("{n}", String(index + 1)).replace("{total}", String(total))}
                </span>
                <button type="button" onClick={() => go(1)} disabled={index >= total - 1} aria-label={labels.next} className="inline-flex size-9 items-center justify-center rounded-full border border-line disabled:opacity-40">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <section className="px-5 pt-5 sm:px-7">
            <h3 className="text-sm font-semibold text-muted">{labels.points}</h3>
            <ul className="mt-2 space-y-2">
              {item.points.map((p, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>

          <footer className="flex flex-wrap gap-3 px-5 pb-6 pt-5 sm:px-7">
            <a href={item.href} onClick={() => rememberEntry("peek")} className="rounded-full bg-accent px-5 py-2.5 font-medium text-accent-ink hover:opacity-90">
              {labels.readStory}
            </a>
            {item.liveUrl && (
              <a
                href={item.liveUrl}
                target="_blank"
                rel="noopener"
                onClick={() => track("live_site_click", { slug: item.slug, from: "peek" })}
                className="rounded-full border border-line px-5 py-2.5 font-medium hover:bg-sunken"
              >
                {labels.openLive} ↗
              </a>
            )}
          </footer>
        </div>
      )}
    </dialog>
  );
}

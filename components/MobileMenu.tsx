"use client";

import { useRef } from "react";

type Item = { href: string; label: string };

/**
 * Hamburger → full-screen layer (native modal <dialog>: Esc, focus trap and focus return for free).
 * Holds the main nav, the five projects by name, and both toggles, so any destination is ≤ 2 taps away.
 */
export function MobileMenu({
  nav,
  projects,
  projectsLabel,
  openLabel,
  closeLabel,
  children,
}: {
  nav: Item[];
  projects: Item[];
  projectsLabel: string;
  openLabel: string;
  closeLabel: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label={openLabel}
        aria-haspopup="dialog"
        className="inline-flex size-10 items-center justify-center rounded-full hover:bg-sunken md:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <dialog
        ref={ref}
        aria-label={projectsLabel}
        onClick={(e) => {
          // Links inside close the layer; clicking the backdrop area does too.
          if ((e.target as HTMLElement).closest("a") || e.target === ref.current) ref.current?.close();
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-paper p-0 text-ink backdrop:bg-black/40 open:flex open:flex-col"
      >
        <div className="flex items-center justify-end border-b border-line px-4 py-3">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label={closeLabel}
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-sunken"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-6 py-6">
          <ul className="space-y-1 text-2xl font-semibold">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="block rounded-lg py-2 hover:text-accent">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          {projects.length > 0 && (
            <>
              <p className="mt-8 text-sm font-medium text-muted">{projectsLabel}</p>
              <ul className="mt-2 space-y-1 text-lg">
                {projects.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="block rounded-lg py-1.5 hover:text-accent">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
        <div className="flex items-center justify-between border-t border-line px-6 py-4">{children}</div>
      </dialog>
    </>
  );
}

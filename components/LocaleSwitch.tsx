"use client";

import { usePathname } from "next/navigation";
import { captureScrollPosition, rememberLocale, writeHandoff } from "@/lib/handoff";
import { alternatePath, localeNames, locales, type Locale } from "@/lib/i18n";

/**
 * `עברית | EN`. The other language is a real <a hreflang> to the same page, so it works without JS
 * and is crawlable. With JS, the click also remembers the choice (cookie) and hands the reading
 * position and open panels to the destination page.
 */
export function LocaleSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? `/${locale}`;

  function onSwitch(target: Locale, href: string) {
    rememberLocale(target);
    const openDetails = Array.from(document.querySelectorAll<HTMLDetailsElement>("details[open][id]")).map((d) => d.id);
    const peek = document.querySelector<HTMLDialogElement>("dialog[open][data-peek]")?.dataset.peek;
    writeHandoff({
      to: href,
      ...captureScrollPosition(),
      openDetails,
      peek,
      event: { name: "locale_switch", props: { from: locale, to: target, page: pathname } },
    });
  }

  return (
    <nav aria-label={label} className="flex items-center text-sm font-medium">
      {locales.map((l, i) => {
        const href = alternatePath(pathname, l);
        return (
          <span key={l} className="flex items-center">
            {i > 0 && (
              <span aria-hidden="true" className="px-1.5 text-line">
                |
              </span>
            )}
            {l === locale ? (
              <span aria-current="true" lang={l} className="rounded px-1.5 py-1 text-ink">
                {localeNames[l]}
              </span>
            ) : (
              <a
                href={href}
                hrefLang={l}
                lang={l}
                onClick={() => onSwitch(l, href)}
                className="rounded px-1.5 py-1 text-muted underline-offset-4 transition-colors duration-150 hover:text-ink hover:underline"
              >
                {localeNames[l]}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}

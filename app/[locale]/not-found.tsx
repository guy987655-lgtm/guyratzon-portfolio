"use client";

import { useParams } from "next/navigation";
import { hasLocale, localizePath } from "@/lib/i18n";
import { getMessages } from "@/messages";

/** 404 inside a locale (e.g. /en/work/unknown). Unmatched URLs outside [locale] use app/global-not-found.tsx. */
export default function LocaleNotFound() {
  const params = useParams<{ locale?: string }>();
  const locale = hasLocale(params?.locale) ? params.locale : "he";
  const m = getMessages(locale);
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-bold">{m.notFound.title}</h1>
      <p className="mt-3 text-muted">{m.notFound.body}</p>
      <a href={`${localizePath("/", locale)}#work`} className="mt-8 inline-block rounded-full bg-accent px-5 py-2.5 font-medium text-accent-ink">
        {m.notFound.back}
      </a>
    </div>
  );
}

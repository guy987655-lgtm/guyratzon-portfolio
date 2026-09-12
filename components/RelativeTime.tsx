"use client";

import { useId } from "react";
import { relativeDays } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { InlineScript } from "./InlineScript";

/**
 * "Updated 3 days ago", correct on every visit of a statically rendered page: the server renders
 * its best guess, an inline script re-computes it during HTML parsing (hard navigations), and the
 * client render handles soft navigations. Pattern from Next's "Preventing flash" guide.
 */
export function RelativeTime({ iso, locale, template }: { iso: string; locale: Locale; template: string }) {
  const id = useId();
  const text = template.replace("{when}", relativeDays(iso, locale));
  const script = `{var n=document.getElementById(${JSON.stringify(id)});if(n){var f=function(d){var p=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Jerusalem",year:"numeric",month:"2-digit",day:"2-digit"}).format(d);return Date.parse(p)};var diff=Math.round((f(new Date(${JSON.stringify(iso)}))-f(new Date()))/864e5);var r=new Intl.RelativeTimeFormat(${JSON.stringify(locale)},{numeric:"auto"});var w=Math.abs(diff)<30?r.format(diff,"day"):Math.abs(diff)<365?r.format(Math.round(diff/30),"month"):r.format(Math.round(diff/365),"year");n.textContent=${JSON.stringify(template)}.replace("{when}",w)}}`;
  return (
    <>
      <time id={id} dateTime={iso} suppressHydrationWarning>
        {text}
      </time>
      <InlineScript html={script} />
    </>
  );
}

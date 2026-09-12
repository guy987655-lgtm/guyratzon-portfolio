import { NextResponse, type NextRequest } from "next/server";
import { hasLocale, localizePath, LOCALE_COOKIE, negotiate } from "./lib/i18n";

/**
 * Language redirect for paths that arrive without a /he or /en prefix.
 * Priority: the `locale` cookie (set by the language switch) → Accept-Language → Hebrew.
 * Prefixed paths never reach this function (see matcher), so static pages stay proxy-free.
 */
export function proxy(request: NextRequest) {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = hasLocale(cookie) ? cookie : negotiate(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = localizePath(url.pathname, locale);
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: [
    // Everything except: already-prefixed paths, Next internals, the review page, public asset
    // folders, the analytics proxy, and any path that looks like a file (has an extension).
    "/((?!(?:he|en)(?:/|$)|_next/|_review|%5Freview|api/|ingest/|exhibit/|og/|diagrams/|.*\\.[\\w]+$).*)",
  ],
};

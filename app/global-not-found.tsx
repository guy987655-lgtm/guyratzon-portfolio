import type { Metadata } from "next";
import Link from "next/link";
import { Heebo } from "next/font/google";
import { THEME_SCRIPT } from "@/lib/theme";
import { he } from "@/messages/he";
import { en } from "@/messages/en";
import "./globals.css";

const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo", display: "swap" });

export const metadata: Metadata = {
  title: `${he.notFound.title} · ${en.notFound.title}`,
  robots: { index: false, follow: false },
};

/** Unmatched URLs outside any locale. We can't know the language here, so both are shown. */
export default function GlobalNotFound() {
  return (
    <html lang="he" dir="rtl" className={heebo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <main className="mx-auto grid max-w-3xl flex-1 place-content-center gap-12 px-6 py-24 text-center sm:grid-cols-2">
          <section>
            <h1 className="text-2xl font-bold">{he.notFound.title}</h1>
            <p className="mt-2 text-muted">{he.notFound.body}</p>
            <Link href="/he#work" hrefLang="he" className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 font-medium text-accent-ink">
              {he.notFound.back}
            </Link>
          </section>
          <section lang="en" dir="ltr">
            <h2 className="text-2xl font-bold">{en.notFound.title}</h2>
            <p className="mt-2 text-muted">{en.notFound.body}</p>
            <Link href="/en#work" hrefLang="en" className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 font-medium text-accent-ink">
              {en.notFound.back}
            </Link>
          </section>
        </main>
      </body>
    </html>
  );
}

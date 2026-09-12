import type { Viewport } from "next";
import { Heebo, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { EntryTracker } from "@/components/EntryTracker";
import { Footer } from "@/components/Footer";
import { HandoffRestore } from "@/components/HandoffRestore";
import { Header } from "@/components/Header";
import { dirOf, hasLocale, locales } from "@/lib/i18n";
import { THEME_SCRIPT } from "@/lib/theme";
import { getMessages } from "@/messages";
import { projectNavItems } from "@/content/projects";
import "../globals.css";

// One stack for both languages: Inter carries Latin, Heebo carries Hebrew (browser picks per glyph).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const heebo = Heebo({ subsets: ["hebrew"], variable: "--font-heebo", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#111312" },
  ],
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const m = getMessages(locale);

  return (
    <html lang={locale} dir={dirOf(locale)} className={`${inter.variable} ${heebo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
        >
          {m.a11y.skipToContent}
        </a>
        <Header locale={locale} projects={projectNavItems(locale)} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} />
        <HandoffRestore />
        <EntryTracker />
      </body>
    </html>
  );
}

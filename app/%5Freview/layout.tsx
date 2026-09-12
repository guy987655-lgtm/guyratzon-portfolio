import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Review · screenshots",
  robots: { index: false, follow: false, nocache: true },
};

/** Internal review page (/_review). Its own root layout; never linked, never indexed. */
export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="font-sans">{children}</body>
    </html>
  );
}

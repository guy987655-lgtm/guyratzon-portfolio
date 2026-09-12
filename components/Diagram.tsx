import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "@/lib/i18n";

/**
 * A pre-rendered Mermaid diagram (scripts/render-assets.ts), inlined as SVG so it uses the page's
 * fonts and theme colors — an <img> could do neither. Renders nothing if the asset isn't built yet.
 */
export function Diagram({ id, locale, caption }: { id: string; locale: Locale; caption: string }) {
  const file = join(process.cwd(), "public", "diagrams", `${id}-${locale}.svg`);
  if (!existsSync(file)) return null;
  const svg = readFileSync(file, "utf8");
  return (
    <figure className="overflow-x-auto rounded-2xl border border-line bg-surface p-4 sm:p-6">
      <div className="diagram mx-auto min-w-[36rem] max-w-4xl [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption className="mt-3 text-center text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}

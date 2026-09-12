import QRCode from "qrcode";
import { localizePath, type Locale } from "./i18n";
import { SITE_URL } from "./site";

export type ResumeTheme = "light" | "dark";

/** Where each résumé variant's QR points: its own language, its own look, tagged as a QR scan. */
export function qrUrl(locale: Locale, theme: ResumeTheme, origin = SITE_URL): string {
  return `${origin}${localizePath("/", locale)}?s=qr&t=${theme}`;
}

const INK = "#111111";
const PAPER = "#ffffff";

/**
 * QR as SVG. Modules are ALWAYS dark on light — inverted codes fail on some scanners. For a dark
 * résumé the code sits on a light rounded tile with padding, so it still reads as intentional.
 * Error correction M, quiet zone of 4 modules (the spec minimum).
 */
export async function qrSvg(url: string, theme: ResumeTheme): Promise<string> {
  const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const quiet = 4;
  const size = n + quiet * 2;
  let path = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (qr.modules.get(y, x)) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
  }
  const tilePad = theme === "dark" ? 2 : 0;
  const total = size + tilePad * 2;
  const tile =
    theme === "dark"
      ? `<rect width="${total}" height="${total}" rx="${total * 0.08}" fill="${PAPER}"/>`
      : `<rect width="${total}" height="${total}" fill="${PAPER}"/>`;
  const label = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" aria-label="${label}">${tile}<path transform="translate(${tilePad} ${tilePad})" fill="${INK}" d="${path}"/></svg>\n`;
}

export function qrModuleCount(url: string): number {
  return QRCode.create(url, { errorCorrectionLevel: "M" }).modules.size;
}

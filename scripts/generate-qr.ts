/**
 * M12 — run only after Guy approves the site. Writes the four résumé QR codes + PNG previews:
 *   qr/qr-{he,en}-{light,dark}.svg  →  <SITE_URL>/{he,en}?s=qr&t={light,dark}
 * and decodes every PNG back to make sure it carries exactly the intended URL.
 *   SITE_URL=https://guyratzon.vercel.app tsx scripts/generate-qr.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import jsQR from "jsqr";
import sharp from "sharp";
import { qrModuleCount, qrSvg, qrUrl, type ResumeTheme } from "../lib/qr";
import { SITE_URL } from "../lib/site";

const out = join(process.cwd(), "qr");
mkdirSync(out, { recursive: true });

for (const locale of ["he", "en"] as const) {
  for (const theme of ["light", "dark"] as ResumeTheme[]) {
    const url = qrUrl(locale, theme);
    const svg = await qrSvg(url, theme);
    const name = `qr-${locale}-${theme}`;
    writeFileSync(join(out, `${name}.svg`), svg);
    const png = await sharp(Buffer.from(svg), { density: 600 }).resize(900, 900, { kernel: "nearest" }).flatten({ background: theme === "dark" ? "#1c1b19" : "#ffffff" }).png().toBuffer();
    writeFileSync(join(out, `${name}-preview.png`), png);
    const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data;
    if (decoded !== url) throw new Error(`${name}: decodes to ${decoded ?? "nothing"}, expected ${url}`);
    const modules = qrModuleCount(url) + 8;
    console.log(`✓ ${name}.svg → ${url} (${modules} modules incl. quiet zone; at 2 cm print ≈ ${(20 / modules).toFixed(2)} mm/module)`);
  }
}
console.log(`\nPrint the domain next to each code: ${new URL(SITE_URL).host}`);

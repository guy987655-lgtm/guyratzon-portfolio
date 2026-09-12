import jsQR from "jsqr";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { qrSvg, qrUrl } from "@/lib/qr";

async function decode(svg: string, background: string) {
  const png = await sharp(Buffer.from(svg), { density: 600 }).resize(600, 600, { kernel: "nearest" }).flatten({ background }).png().toBuffer();
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data;
}

describe("résumé QR codes", () => {
  it("point at the matching language and look, tagged as a scan", () => {
    expect(qrUrl("he", "light", "https://example.test")).toBe("https://example.test/he?s=qr&t=light");
    expect(qrUrl("en", "dark", "https://example.test")).toBe("https://example.test/en?s=qr&t=dark");
  });

  for (const theme of ["light", "dark"] as const) {
    it(`decode back to their URL (${theme} résumé)`, async () => {
      const url = qrUrl("en", theme, "https://guyratzon.vercel.app");
      const svg = await qrSvg(url, theme);
      expect(await decode(svg, theme === "dark" ? "#1c1b19" : "#ffffff")).toBe(url);
    });
  }

  it("keeps modules dark on a light tile even for the dark résumé", async () => {
    const svg = await qrSvg("https://guyratzon.vercel.app/he?s=qr&t=dark", "dark");
    expect(svg).toContain('fill="#111111"');
    expect(svg).toContain('fill="#ffffff"');
  });
});

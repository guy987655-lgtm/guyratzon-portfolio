/**
 * Local-only capture of the IBI dashboard on an invented portfolio (manual exhibit: no live link,
 * no manifest endpoint, zero changes to the dashboard's repo).
 *
 *  1. Copies ONLY the dashboard's code files (html/js/css/vendor — never a .json) to a temp dir.
 *  2. Serves them on 127.0.0.1 and injects the invented portfolio through the dashboard's own
 *     embed mode (window.__EMBED__), so the page makes no data requests at all.
 *  3. Refuses to run if any invented security overlaps a real one (prints only the count).
 *  4. Captures the allowlisted tabs with the same safety gates as the CI pipeline and writes
 *     public/exhibit/ibi/manual/ + data/screenshots/ibi.json.
 *
 *   tsx scripts/screenshots/ibi-harness.ts [--dashboard ../IBI/portfolio/dashboard] [--channel chrome]
 */
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { sourceFor } from "../../config/sources";
import { ibi } from "../../content/projects/ibi";
import type { TourRoute } from "../../lib/exhibit/schema";
import { buildIbiFixture, BENCHMARKS, SECURITIES } from "./ibi-fixture";
import { captureRoutes, ROOT, writeSite } from "./lib";

const arg = (flag: string) => (process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : undefined);
const DASHBOARD = resolve(arg("--dashboard") ?? join(ROOT, "..", "IBI", "portfolio", "dashboard"));
const channel = arg("--channel");
const PORT = 4199;
const CODE_FILES = ["index.html", "app.js", "style.css", "vendor/uPlot.iife.min.js", "vendor/uPlot.min.css"];
const MIME: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" };

function overlapWithReal(): number {
  const file = join(DASHBOARD, "symbols.json");
  if (!existsSync(file)) return 0;
  const real = JSON.parse(readFileSync(file, "utf8")) as Record<string, { yahoo?: string; he?: string }>;
  const realKeys = new Set(Object.keys(real));
  const realYahoo = new Set(Object.values(real).map((v) => v?.yahoo).filter(Boolean));
  const realNames = new Set(Object.values(real).map((v) => v?.he).filter(Boolean));
  let hits = 0;
  for (const s of SECURITIES) {
    if (realKeys.has(s.key) || realYahoo.has(s.yahoo) || realNames.has(s.he)) hits++;
  }
  for (const b of Object.values(BENCHMARKS)) if (realYahoo.has(b)) hits++;
  return hits;
}

async function main() {
  const overlap = overlapWithReal();
  console.log(`overlap between invented and real securities: ${overlap}`);
  if (overlap !== 0) throw new Error("the invented portfolio overlaps real securities — refusing to capture");

  // 1. code only
  const dir = mkdtempSync(join(tmpdir(), "ibi-harness-"));
  for (const f of CODE_FILES) {
    const src = join(DASHBOARD, "public", f);
    if (!existsSync(src)) throw new Error(`missing dashboard file ${f}`);
    mkdirSync(join(dir, f, ".."), { recursive: true });
    copyFileSync(src, join(dir, f));
  }

  // 2. static server for exactly those files
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname)).replace(/^\/+/, "") || "index.html";
    if (!CODE_FILES.includes(path)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[extname(path)] ?? "application/octet-stream" }).end(readFileSync(join(dir, path)));
  });
  await new Promise<void>((ok) => server.listen(PORT, "127.0.0.1", ok));
  const base = `http://127.0.0.1:${PORT}`;

  const fixture = buildIbiFixture();
  const source = sourceFor("ibi");
  const routes: TourRoute[] = source.allowedPaths.map((a) => ({
    id: a.id,
    path: a.path,
    locale: "he",
    caption: ibi.gallery.find((g) => g.route === a.id)?.caption ?? { he: a.id, en: a.id },
  }));

  const browser = await chromium.launch(channel ? { channel } : {});
  try {
    const raw = await captureRoutes({
      browser,
      base,
      routes,
      locales: ["he"],
      prepare: async (page) => {
        await page.addInitScript({ content: `window.__EMBED__ = ${JSON.stringify(fixture)};` });
        await page.addInitScript(() => {
          document.addEventListener("DOMContentLoaded", () => {
            const banner = document.createElement("div");
            banner.setAttribute("data-demo-banner", "");
            banner.textContent = "מצב הדגמה — תיק בדוי לגמרי";
            banner.style.cssText = "background:#f1c46e;color:#2b2314;font:600 12px/24px system-ui,sans-serif;text-align:center;letter-spacing:.02em";
            document.body.prepend(banner);
            const tab = new URLSearchParams(location.search).get("tab");
            const w = window as unknown as { selectTab?: (t: string) => void };
            setTimeout(() => {
              // The single-security tab opens on an invented fund with a buy and a partial sale.
              // (S is the dashboard's script-scoped state object, reachable only from global code.)
              if (tab === "instrument") new Function("try { S.instKey = '7700102'; } catch (e) {}")();
              if (tab && typeof w.selectTab === "function") w.selectTab(tab);
              setTimeout(() => document.documentElement.setAttribute("data-exhibit-ready", ""), 400);
            }, 50);
          });
        });
      },
    });
    const index = await writeSite({ slug: "ibi", mode: "manual", base, manifestVersion: "manual", raw, outSubdir: "manual" });
    console.log(`→ ${index.shots.length} shots`);
  } finally {
    await browser.close();
    server.close();
    rmSync(dir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

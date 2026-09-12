/**
 * Pre-renders build-time visuals with a real browser, so visitors download no rendering code:
 *  - Mermaid diagrams → public/diagrams/<id>-<locale>.svg (inlined by components/Diagram.tsx)
 *  - Open Graph images → public/og/<page>-<locale>.png (Satori can't lay out Hebrew RTL)
 * public/diagrams/manifest.json records a hash of each source + the Mermaid version; check-i18n
 * fails the build when a diagram is missing or stale.
 *   tsx scripts/render-assets.ts [--channel chrome]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { diagrams } from "../content/diagrams";
import { diagramHash } from "../lib/diagram-hash";
import { projects } from "../content/projects";
import { en } from "../messages/en";
import { he } from "../messages/he";

const ROOT = process.cwd();
const channel = process.argv.includes("--channel") ? process.argv[process.argv.indexOf("--channel") + 1] : undefined;
const mermaidVersion = JSON.parse(readFileSync(join(ROOT, "node_modules/mermaid/package.json"), "utf8")).version as string;
const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=block">`;

async function renderDiagrams(browser: import("@playwright/test").Browser) {
  const outDir = join(ROOT, "public", "diagrams");
  mkdirSync(outDir, { recursive: true });
  const manifest: Record<string, string> = {};
  const page = await browser.newPage();
  // Same families the site uses, so label widths measured here match the page exactly.
  await page.setContent(
    `<!doctype html><html><head>${FONTS}<style>:root{--font-heebo:'Heebo'}body{margin:0;line-height:1.5;font-family:var(--font-heebo),sans-serif}</style></head><body></body></html>`,
  );
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.addScriptTag({ path: join(ROOT, "node_modules/mermaid/dist/mermaid.min.js") });
  for (const [id, source] of Object.entries(diagrams)) {
    for (const locale of ["he", "en"] as const) {
      const svg = await page.evaluate(
        async ({ code, name, rtl }) => {
          const m = (window as unknown as { mermaid: { initialize: (c: object) => void; render: (id: string, code: string) => Promise<{ svg: string }> } }).mermaid;
          m.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: "base",
            fontFamily: "var(--font-heebo), sans-serif",
            themeVariables: {
              fontFamily: "var(--font-heebo), sans-serif",
              fontSize: "15px",
              primaryColor: "#ffffff",
              primaryTextColor: "#1c1b19",
              primaryBorderColor: "#cfc8bb",
              lineColor: "#8a857b",
              secondaryColor: "#ffffff",
              tertiaryColor: "#ffffff",
            },
            flowchart: { htmlLabels: true, curve: "basis", padding: 14, nodeSpacing: 36, rankSpacing: 52 },
          });
          document.documentElement.dir = rtl ? "rtl" : "ltr";
          const { svg } = await m.render(name, code);
          return svg;
        },
        { code: source[locale], name: `d-${id}-${locale}`, rtl: locale === "he" },
      );
      writeFileSync(join(outDir, `${id}-${locale}.svg`), svg);
      console.log(`✓ diagram ${id} ${locale}`);
    }
    manifest[id] = diagramHash(source, ROOT);
  }
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify({ mermaid: mermaidVersion, diagrams: manifest }, null, 2) + "\n");
  await page.close();
}

function ogHtml(title: string, subtitle: string, locale: "he" | "en") {
  const dir = locale === "he" ? "rtl" : "ltr";
  const tag = locale === "he" ? "תיק עבודות · גיא רצון" : "Portfolio · Guy Ratzon";
  return `<!doctype html><html lang="${locale}" dir="${dir}"><head>${FONTS}<style>
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;font-family:'Heebo',sans-serif;
    background:radial-gradient(ellipse at top, #e3efe9, #f8f6f1 65%);color:#1c1b19;display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px}
    .tag{font-size:26px;font-weight:600;color:#1f5f4a}.title{font-size:84px;font-weight:700;letter-spacing:-.02em;line-height:1.05;margin:0}
    .sub{font-size:34px;color:#5b574f;margin-top:22px;line-height:1.35;max-width:980px}.bar{height:10px;width:160px;border-radius:99px;background:#1f5f4a}
  </style></head><body><div class="tag">${tag}</div><div><h1 class="title">${title}</h1><div class="sub">${subtitle}</div></div><div class="bar"></div></body></html>`;
}

async function renderOg(browser: import("@playwright/test").Browser) {
  const outDir = join(ROOT, "public", "og");
  mkdirSync(outDir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const pages: { name: string; he: [string, string]; en: [string, string] }[] = [
    { name: "home", he: [he.home.name, he.home.role], en: [en.home.name, en.home.role] },
    ...projects.map((p) => ({ name: p.slug, he: [p.title.he, p.tagline.he] as [string, string], en: [p.title.en, p.tagline.en] as [string, string] })),
  ];
  for (const p of pages) {
    for (const locale of ["he", "en"] as const) {
      const [title, sub] = p[locale];
      await page.setContent(ogHtml(title, sub, locale));
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      await page.screenshot({ path: join(outDir, `${p.name}-${locale}.png`) });
      console.log(`✓ og ${p.name} ${locale}`);
    }
  }
  await page.close();
}

const browser = await chromium.launch(channel ? { channel } : {});
try {
  await renderDiagrams(browser);
  await renderOg(browser);
} finally {
  await browser.close();
}

/**
 * Screenshot pipeline for the "auto" sources.
 *   tsx scripts/screenshots/capture.ts                       # every auto source, production URLs
 *   tsx scripts/screenshots/capture.ts --slug tape --slug piggybank
 *   tsx scripts/screenshots/capture.ts --base tape=http://localhost:4101   # local demo server
 *   tsx scripts/screenshots/capture.ts --channel chrome      # use the installed Chrome (local runs)
 *
 * Writes public/exhibit/<slug>/*.webp, data/screenshots/<slug>.json and data/manifests/<slug>.json.
 * Exits non-zero if any site failed; a failed site keeps all of its previous files.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { sources } from "../../config/sources";
import { ExhibitManifestSchema, type ExhibitManifest } from "../../lib/exhibit/schema";
import { captureRoutes, CaptureError, enforceAllowlist, ROOT, writeSite } from "./lib";

function parseArgs(argv: string[]) {
  const slugs: string[] = [];
  const bases = new Map<string, string>();
  let channel: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--slug" && next) (slugs.push(next), i++);
    else if (arg === "--base" && next) {
      const [slug, url] = next.split("=");
      if (slug && url) bases.set(slug, url);
      i++;
    } else if (arg === "--channel" && next) (channel = next, i++);
  }
  return { slugs, bases, channel };
}

async function fetchManifest(base: string): Promise<ExhibitManifest> {
  // /api/exhibit on a real deployment; plain /exhibit.json when a local static server has no rewrites.
  for (const path of ["/api/exhibit", "/exhibit.json"]) {
    try {
      const res = await fetch(new URL(path, base), { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) continue;
      const parsed = ExhibitManifestSchema.safeParse(await res.json());
      if (!parsed.success) {
        throw new CaptureError(`manifest invalid: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      }
      return parsed.data;
    } catch (err) {
      if (err instanceof CaptureError) throw err;
    }
  }
  throw new CaptureError(`no manifest at ${base}`);
}

async function main() {
  const { slugs, bases, channel } = parseArgs(process.argv.slice(2));
  const targets = sources.filter((s) => s.capture === "auto" && (slugs.length === 0 || slugs.includes(s.slug)));
  if (!targets.length) throw new Error("nothing to capture");

  const browser = await chromium.launch(channel ? { channel } : {});
  const failures: string[] = [];
  try {
    for (const source of targets) {
      const base = bases.get(source.slug) ?? source.siteUrl;
      console.log(`\n${source.slug} ← ${base}`);
      try {
        const manifest = await fetchManifest(base);
        if (manifest.slug !== source.slug) throw new CaptureError(`manifest slug is "${manifest.slug}"`);
        if (!manifest.demoMode.supported) throw new CaptureError("demo mode not supported");
        const routes = enforceAllowlist(manifest.tourRoutes ?? [], source.allowedPaths);
        if (!routes.length) throw new CaptureError("no tour routes");
        const raw = await captureRoutes({ browser, base, routes, locales: manifest.locales ?? ["en"] });
        const index = await writeSite({ slug: source.slug, mode: "auto", base, manifestVersion: manifest.version, raw });
        mkdirSync(join(ROOT, "data", "manifests"), { recursive: true });
        writeFileSync(join(ROOT, "data", "manifests", `${source.slug}.json`), JSON.stringify(manifest, null, 2) + "\n");
        const counts = index.shots.reduce<Record<string, number>>((acc, s) => ((acc[s.status] = (acc[s.status] ?? 0) + 1), acc), {});
        console.log(`  → ${index.shots.length} shots ${JSON.stringify(counts)}`);
      } catch (err) {
        failures.push(source.slug);
        console.error(`  ✗ ${source.slug}: ${(err as Error).message} — previous images kept`);
      }
    }
  } finally {
    await browser.close();
  }
  if (failures.length) {
    console.error(`\nfailed: ${failures.join(", ")}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

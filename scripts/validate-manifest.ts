/**
 * Validates exhibit manifests against the contract.
 *   tsx scripts/validate-manifest.ts ../tapecalc/exhibit.json https://tapecalc-mu.vercel.app/api/exhibit
 */
import { readFileSync } from "node:fs";
import { ExhibitManifestSchema } from "../lib/exhibit/schema";

async function load(source: string): Promise<{ json: unknown; headers?: Headers }> {
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { json: await res.json(), headers: res.headers };
  }
  return { json: JSON.parse(readFileSync(source, "utf8")) };
}

let failed = false;
for (const source of process.argv.slice(2)) {
  try {
    const { json, headers } = await load(source);
    const result = ExhibitManifestSchema.safeParse(json);
    if (!result.success) {
      failed = true;
      console.error(`✗ ${source}`);
      for (const issue of result.error.issues) console.error(`   ${issue.path.join(".") || "(root)"}: ${issue.message}`);
      continue;
    }
    const cache = headers?.get("cache-control");
    if (headers && !/public/.test(cache ?? "")) console.warn(`  ! ${source}: Cache-Control is "${cache}"`);
    console.log(`✓ ${source} — ${result.data.slug} v${result.data.version}, ${result.data.tourRoutes?.length ?? 0} tour route(s)`);
  } catch (err) {
    failed = true;
    console.error(`✗ ${source}: ${(err as Error).message}`);
  }
}
process.exit(failed ? 1 : 0);

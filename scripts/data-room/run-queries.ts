/**
 * Runs the data-room queries against SpeCV's SYNTHETIC warehouse and saves the results.
 *
 * Uses SpeCV's own PGlite harness (real PostgreSQL in WASM, no network): replays the migrations,
 * loads the fixed-seed generated dataset, runs analytics.refresh_all(true), then executes each
 * query in content/data-room/queries.ts. No production database is involved at any point.
 *   tsx scripts/data-room/run-queries.ts [--specv ../precicv]
 */
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { dataRoomQueries } from "../../content/data-room/queries";

const ROOT = process.cwd();
const argIndex = process.argv.indexOf("--specv");
const SPECV = resolve(argIndex >= 0 ? process.argv[argIndex + 1]! : join(ROOT, "..", "precicv"));
const SYNTH = join(SPECV, "scripts", "synthetic");

const { PGlite } = await import(pathToFileURL(join(SPECV, "node_modules", "@electric-sql", "pglite", "dist", "index.js")).href);
const { setupPlatform, applyMigrations, loadGraph } = await import(pathToFileURL(join(SYNTH, "pglite-load.mjs")).href);
const { generate } = await import(pathToFileURL(join(SYNTH, "generate.ts")).href);
const config = await import(pathToFileURL(join(SYNTH, "config.ts")).href);

const db = new PGlite();
await setupPlatform(db);
const failed: string[] = await applyMigrations(db, join(SPECV, "supabase", "migrations"));
if (failed.length) throw new Error(`migrations failed: ${failed.join(", ")}`);
await loadGraph(db, generate());
const refresh = (await db.query(`select analytics.refresh_all(true) as r`)).rows[0].r;
if (refresh.failed) throw new Error(`refresh_all: ${refresh.failed} step(s) failed`);

const results: Record<string, { columns: string[]; rows: (string | number | null)[][] }> = {};
for (const q of dataRoomQueries) {
  const res = await db.query(q.sql);
  const columns: string[] = res.fields.map((f: { name: string }) => f.name);
  const rows = res.rows.map((row: Record<string, unknown>) =>
    columns.map((c) => {
      const v = row[c];
      if (v instanceof Date) return v.toISOString().slice(0, 10);
      if (typeof v === "bigint") return Number(v);
      if (v === null || typeof v === "number") return v;
      const n = Number(v);
      return typeof v === "string" && v !== "" && !Number.isNaN(n) && /^-?\d+(\.\d+)?$/.test(v) ? n : String(v);
    }),
  );
  results[q.id] = { columns, rows };
  console.log(`✓ ${q.id}: ${rows.length} row(s)`);
  console.table(rows.map((r: (string | number | null)[]) => Object.fromEntries(columns.map((c, i) => [c, r[i]]))));
}

writeFileSync(
  join(ROOT, "content", "data-room", "results.json"),
  JSON.stringify({ seed: config.SEED, asOf: config.ASOF.toISOString?.() ?? String(config.ASOF), results }, null, 2) + "\n",
);
await db.close();

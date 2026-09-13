/**
 * Hourly (GitHub Actions): has any auto source deployed to production since the last check?
 * Compares each project's latest READY production deployment id with the state file and prints
 * the changed slugs (one per line) — the workflow then dispatches a screenshot run for each.
 *   VERCEL_TOKEN=… tsx scripts/poll-deploys.ts .deploy-state.json
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { sources } from "../config/sources";

const stateFile = process.argv[2] ?? ".deploy-state.json";
const token = process.env.VERCEL_TOKEN;
const team = process.env.VERCEL_TEAM_ID;
if (!token) {
  // Not configured yet (the secret is added by Guy): nothing to compare, and no failure emails.
  console.error("VERCEL_TOKEN is not set — skipping");
  process.exit(0);
}

const state: Record<string, string> = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : {};
const changed: string[] = [];

for (const source of sources) {
  if (source.capture !== "auto" || !source.vercelProject) continue;
  const params = new URLSearchParams({ projectId: source.vercelProject, target: "production", state: "READY", limit: "1" });
  if (team) params.set("teamId", team);
  const res = await fetch(`https://api.vercel.com/v6/deployments?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    console.error(`${source.slug}: Vercel API ${res.status}`);
    continue;
  }
  const id = ((await res.json()) as { deployments?: { uid?: string }[] }).deployments?.[0]?.uid;
  if (!id) continue;
  // First run records the baseline without triggering a capture for everything.
  if (state[source.slug] && state[source.slug] !== id) changed.push(source.slug);
  state[source.slug] = id;
}

writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n");
process.stdout.write(changed.join("\n") + (changed.length ? "\n" : ""));

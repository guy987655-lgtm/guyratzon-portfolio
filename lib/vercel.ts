import "server-only";

/**
 * Last READY production deployment of a source project, from the Vercel API. Cached for an hour
 * (the pages' ISR safety net). Any failure — no token, timeout, 4xx — returns null and the caller
 * falls back to the manifest's updatedAt; nothing on the page breaks.
 */
export async function lastProductionDeploy(project: string | undefined): Promise<string | null> {
  const token = process.env.VERCEL_TOKEN;
  if (!project || !token) return null;
  const params = new URLSearchParams({ projectId: project, target: "production", state: "READY", limit: "1" });
  if (process.env.VERCEL_TEAM_ID) params.set("teamId", process.env.VERCEL_TEAM_ID);
  try {
    const res = await fetch(`https://api.vercel.com/v6/deployments?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600, tags: ["deploys"] },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { deployments?: { ready?: number; created?: number }[] };
    const d = body.deployments?.[0];
    const ms = d?.ready ?? d?.created;
    return ms ? new Date(ms).toISOString() : null;
  } catch {
    return null;
  }
}

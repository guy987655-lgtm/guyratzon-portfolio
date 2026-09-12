import { notFound } from "next/navigation";

/**
 * Screenshot review gate. Only exists on Vercel preview deployments (which are behind Vercel
 * Authentication) and in local dev — production answers 404.
 */
export default function ReviewPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold">Screenshot review</h1>
      <p className="mt-2 text-muted">No screenshots captured yet.</p>
    </main>
  );
}

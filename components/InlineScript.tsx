/**
 * An inline script that runs during HTML parsing on hard navigations and is inert on the client
 * (`text/plain`), so React doesn't warn about rendering <script>. Pattern from Next's
 * "Preventing flash before hydration" guide. Soft navigations need a client-side counterpart.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

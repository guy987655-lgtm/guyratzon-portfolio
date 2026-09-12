"use client";

import { useState } from "react";

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {}
      }}
      className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium hover:bg-sunken"
    >
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}

/**
 * The one fictional persona behind every demo fixture, in every source site.
 * Fixtures are written from scratch around her — never derived from Guy's real data.
 * (The name already appears in SpeCV's sample CV, src/lib/sample-cv.ts.)
 */
export const persona = {
  name: { he: "דנה כהן", en: "Dana Cohen" },
  role: { he: "אנליסטית נתונים", en: "Data analyst" },
  city: { he: "תל אביב", en: "Tel Aviv" },
  /** A fixed "today" for demo fixtures that depend on the calendar. */
  demoNow: "2026-06-15T10:00:00+03:00",
  ranges: {
    monthlyBudgetIls: 10_000,
    weightKg: { start: 68.4, end: 66.9 },
  },
} as const;

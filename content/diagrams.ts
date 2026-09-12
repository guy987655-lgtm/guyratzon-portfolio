import type { L10n } from "@/lib/i18n";

/**
 * Mermaid sources, one per language (labels are translated, structure is identical).
 * Rendered to inline SVG by scripts/render-assets.ts; never rendered in the visitor's browser.
 */
export const diagrams: Record<string, L10n> = {
  "specv-flow": {
    he: `flowchart RL
  U["דפדפן: קורות חיים, מודעות ושאלון"] -->|"אירועי משפך אנונימיים"| C[("טבלאות לכידה")]
  U --> A["שכבת API ב-Next.js"]
  A --> L["Claude: קורות חיים, דוח שינויים וניתוח פערים"]
  A --> D[("Postgres: פרופילים, משרות, יצירות")]
  C --> E["רענון שעתי"]
  D --> E
  E --> W[("מחסן בסכמת כוכב")]`,
    en: `flowchart LR
  U["Browser: CV, postings, questionnaire"] -->|"anonymous funnel events"| C[("Capture tables")]
  U --> A["Next.js API layer"]
  A --> L["Claude: CV, change report, gap analysis"]
  A --> D[("Postgres: profiles, jobs, generations")]
  C --> E["Hourly refresh"]
  D --> E
  E --> W[("Star-schema warehouse")]`,
  },
  "ibi-pipeline": {
    he: `flowchart RL
  R["דוחות תנועות מהברוקר"] --> P["נירמול בפייתון, מקומית"]
  H["היסטוריית מחירים, נאספת בדפדפן"] --> P
  P --> F[("קובץ נתונים מאחורי מפתח")]
  F --> UI["דשבורד: JavaScript ו-uPlot"]
  Q["פונקציה בוורסל: מחירי היום"] --> UI`,
    en: `flowchart LR
  R["Broker transaction reports"] --> P["Python normalization, local"]
  H["Price history, harvested in the browser"] --> P
  P --> F[("Data file behind a key")]
  F --> UI["Dashboard: JavaScript + uPlot"]
  Q["Vercel function: today's prices"] --> UI`,
  },
  "tape-model": {
    he: `flowchart RL
  A["שורה 1: 10,000"] --> B["שורה 2: הקודמת − 3,200"]
  B --> C["שורה 3: הקודמת − 1,450"]
  C --> D["שורה 4: הקודמת − 380"]
  X["עריכה של מספר ישן"] -.->|"חישוב מחדש בשרשרת"| B`,
    en: `flowchart LR
  A["Line 1: 10,000"] --> B["Line 2: previous − 3,200"]
  B --> C["Line 3: previous − 1,450"]
  C --> D["Line 4: previous − 380"]
  X["Edit an earlier number"] -.->|"chain recalculates"| B`,
  },
  "worldcup-data": {
    he: `flowchart RL
  S[("לוח משחקים סטטי")] --> M["מיזוג"]
  E["API ציבורי של ESPN"] -->|"תוצאות, יחסים, כושר"| M
  M --> G["שלב הבתים: לפי צמד נבחרות ותאריך"]
  M --> K["נוקאאוט: לפי תאריך ושעה"]
  G --> UI["ממשק בעברית ובאנגלית"]
  K --> UI`,
    en: `flowchart LR
  S[("Static schedule")] --> M["Merge"]
  E["ESPN public API"] -->|"scores, odds, form"| M
  M --> G["Groups: team pair + date"]
  M --> K["Knockouts: date + time slot"]
  G --> UI["Hebrew and English UI"]
  K --> UI`,
  },
  "specv-erd": {
    he: `erDiagram
  direction RL
  dim_visitor ||--o{ fact_visit : ""
  dim_acquisition ||--o{ fact_visit : ""
  dim_visitor ||--o{ fact_jd_submission : ""
  dim_user ||--o{ fact_jd_submission : ""
  dim_company ||--o{ fact_jd_submission : ""
  dim_role ||--o{ fact_jd_submission : ""
  dim_user ||--o{ fact_generation : ""
  dim_company ||--o{ fact_generation : ""
  dim_role ||--o{ fact_generation : ""
  dim_user ||--o{ fact_purchase : ""
  dim_sku ||--o{ fact_purchase : ""
  dim_user ||--o{ fact_signup : ""
  dim_visitor ||--o{ fact_signup : ""
  dim_acquisition ||--o{ fact_signup : ""`,
    en: `erDiagram
  direction LR
  dim_visitor ||--o{ fact_visit : ""
  dim_acquisition ||--o{ fact_visit : ""
  dim_visitor ||--o{ fact_jd_submission : ""
  dim_user ||--o{ fact_jd_submission : ""
  dim_company ||--o{ fact_jd_submission : ""
  dim_role ||--o{ fact_jd_submission : ""
  dim_user ||--o{ fact_generation : ""
  dim_company ||--o{ fact_generation : ""
  dim_role ||--o{ fact_generation : ""
  dim_user ||--o{ fact_purchase : ""
  dim_sku ||--o{ fact_purchase : ""
  dim_user ||--o{ fact_signup : ""
  dim_visitor ||--o{ fact_signup : ""
  dim_acquisition ||--o{ fact_signup : ""`,
  },
};

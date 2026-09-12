import type { Project } from "../types";

export const specv: Project = {
  slug: "specv",
  title: { he: "SpeCV", en: "SpeCV" },
  tagline: { he: "התאמת קורות חיים למשרה ספציפית", en: "Tailors a résumé to one specific job" },
  depth: "full",
  recommended: true,
  liveUrl: "https://preci-cv.vercel.app/demo",
  stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Supabase", "Postgres", "Claude API", "PostHog", "Vercel"],
  builtAt: "2026-07-03",
  usage: {
    he: "מוצר שבניתי מקצה לקצה ורץ בפרודקשן מאז יולי 2026.",
    en: "A product I built end to end, running in production since July 2026.",
  },
  interfaceLocales: ["en"],
  cardFact: {
    he: "42 טבלאות במודל הנתונים, כולל מחסן בסכמת כוכב",
    en: "42 tables in the data model, including a star-schema warehouse",
  },
  overview: {
    he: "SpeCV מקבל קורות חיים ומודעת דרושים, ומחזיר קורות חיים של עמוד אחד שמותאמים למשרה הזו, יחד עם דוח שמסביר כל שינוי. הוא נועד למי שמגיש להרבה משרות ורוצה שכל הגשה תדבר בשפה של המודעה.",
    en: "SpeCV takes a CV and a job posting and returns a one-page CV tailored to that job, with a report explaining every change. It's for people applying widely who want each application to speak the posting's language.",
  },
  peek: [
    {
      he: "כל שינוי בקורות החיים מגיע עם נימוק מתוך המודעה: שקיפות במקום קופסה שחורה.",
      en: "Every change to the CV comes with a reason from the posting: transparency, not a black box.",
    },
    {
      he: "לפני שמשקיעים בהתאמה, המודעה נבדקת מול הקווים האדומים שהמשתמש הגדיר.",
      en: "Before any tailoring, the posting is checked against the user's own dealbreakers.",
    },
    {
      he: "מאחורי המוצר יש מחסן נתונים בסכמת כוכב, שנבנה ונבדק על נתונים סינתטיים.",
      en: "Behind the product sits a star-schema warehouse, built and tested on synthetic data.",
    },
  ],
  problem: {
    he: "להתאים קורות חיים לכל משרה לוקח שעה, ורוב הכלים שעושים את זה אוטומטית מחזירים טקסט מלוטש בלי לומר מה השתנה. מי שמגיש לעשרים משרות צריך גם מהירות וגם שליטה: לדעת מה נכתב בשמו, ולמה.",
    en: "Tailoring a CV to each job takes an hour, and most tools that automate it hand back polished text without saying what changed. Someone applying to twenty jobs needs speed and control: knowing what was written in their name, and why.",
  },
  approach: {
    he: "המשתמש מעלה קורות חיים ועונה פעם אחת על שאלון קצר. לכל מודעה, SpeCV בודק קודם את הקווים האדומים, למשל כמה ימים בשבוע במשרד, ורק אחר כך מבקש מהמודל לכתוב גרסה מותאמת לפי סכמה קשיחה: קורות החיים, דוח השינויים, ניתוח פערים וסימולציית ראיון.\n\nהממשק בנוי סביב סקירה ולא סביב יצירה. כל שינוי מסומן, אפשר לערוך ישירות ולבחור עיצוב מתוך עשרות תבניות, והקבצים נוצרים רק אחרי אישור. מתחת לממשק יש שכבת לכידה (מבקרים, ביקורים ואירועי משפך) ומחסן נתונים נפרד שמתרענן כל שעה.",
    en: "The user uploads a CV and answers a short questionnaire once. For each posting, SpeCV first checks the dealbreakers, such as days per week in the office, and only then asks the model for a tailored version against a strict schema: the CV, a change report, a gap analysis and an interview simulation.\n\nThe interface is built around review rather than generation. Every change is marked, the CV can be edited in place and dressed in dozens of templates, and files are created only after approval. Underneath sits a capture layer (visitors, visits, funnel events) and a separate warehouse that refreshes hourly.",
  },
  diagram: "specv-flow",
  decisions: [
    {
      id: "specv-change-report",
      title: { he: "דוח שינויים במקום טקסט מלוטש", en: "A change report, not just polished text" },
      why: {
        he: "משתמש שלא יודע מה השתנה לא יסמוך על הגרסה החדשה, וגם לא יוכל להגן עליה בראיון. הדוח הופך את הפלט למשהו שאפשר לבדוק שורה אחרי שורה.",
        en: "A user who can't see what changed won't trust the new version, or be able to defend it in an interview. The report turns the output into something you can check line by line.",
      },
      tradeoff: {
        he: "כל יצירה ארוכה ויקרה יותר, כי המודל מחזיר גם את השינויים וגם את הנימוקים, והסכמה שהוא חייב לעמוד בה נוקשה יותר.",
        en: "Every generation is longer and costlier: the model returns the changes and the reasons, against a stricter schema.",
      },
    },
    {
      id: "specv-dealbreakers",
      title: { he: "קווים אדומים לפני תשלום", en: "Dealbreakers before payment" },
      why: {
        he: "המשאב הכי יקר של מחפש עבודה הוא זמן שהושקע במשרה שלא התאימה מלכתחילה. בדיקה מוקדמת חוסכת לו גם כסף וגם אכזבה.",
        en: "A job seeker's scarcest resource is time spent on a role that was never a fit. An early check saves both money and disappointment.",
      },
      tradeoff: {
        he: "קריאה נוספת למודל לפני כל התאמה, ומקרים שבהם הבדיקה מסמנת בעיה שאין.",
        en: "One more model call before every tailoring, and the occasional false alarm.",
      },
    },
    {
      id: "specv-first-party-funnel",
      title: { he: "משפך משלי לצד פוסטהוג", en: "My own funnel next to PostHog" },
      why: {
        he: "כל המשפך האנונימי — העלאת קורות חיים, מודעות ושאלון — חי בדפדפן ומגיע לשרת רק אם נרשמים. בלי מזהה מבקר ואירועי משפך בצד השרת, השאלה 'כמה משרות הועלו' סופרת רק את מי ששרד עד ההרשמה.",
        en: "The whole anonymous funnel — CV upload, postings, questionnaire — lives in the browser and reaches the server only on signup. Without a visitor id and server-side funnel events, 'how many jobs were uploaded' counts only the people who made it to signup.",
      },
      tradeoff: {
        he: "חמש טבלאות לכידה, פונקציות מאובטחות ועוגייה חתומה לתחזק, ומדיניות פרטיות שצריכה לכסות את כולן.",
        en: "Five capture tables, locked-down functions and a signed cookie to maintain, and a privacy policy that has to cover all of them.",
      },
    },
    {
      id: "specv-synthetic-first",
      title: { he: "נתונים סינתטיים לפני נתונים אמיתיים", en: "Synthetic data before real data" },
      why: {
        he: "המחסן נבנה כשעוד כמעט לא היו משתמשים. גנרטור עם זרע קבוע מייצר שנה שלמה של תנועה, כך שכל שאילתה וכל כלל ספירה נבדקים לפני שהם פוגשים נתונים אמיתיים.",
        en: "The warehouse was built before there were real users to speak of. A fixed-seed generator produces a full year of traffic, so every query and counting rule is tested before it meets real data.",
      },
      tradeoff: {
        he: "נתונים סינתטיים משקפים את ההנחות שלי ולא התנהגות אמיתית. הם בודקים את הצנרת, לא את התובנות.",
        en: "Synthetic data reflects my assumptions, not real behaviour. It tests the plumbing, not the insights.",
      },
    },
  ],
  whatBroke: {
    he: "משתמש סיים את כל התהליך — קורות חיים, ארבע מודעות, שאלון והרשמה — ובשלב הייבוא האחרון השרת החזיר שגיאה והכול נעלם. הסיבה: כשהמודל לא מצא שם חברה במודעה, הוא ענה במשפט שלם במקום מחרוזת ריקה, ומשפט של 140 תווים עבר את מגבלת 120 התווים של השדה. משרה אחת עם 'שם חברה' ארוך הפילה איתה את שלוש האחרות. התיקון: שדות שהמודל כותב נחתכים במקום להידחות, ורשומה שאי אפשר לקרוא נושרת לבד בלי לקחת איתה את השאר. תווית קצוצה היא עניין קוסמטי; ייבוא שאבד הוא לא.",
    en: "A user finished the whole flow — CV, four postings, questionnaire, signup — and the final import returned an error that wiped it all. The cause: when the model found no company name in a posting, it answered with a full sentence instead of an empty string, and 140 characters broke the field's 120-character cap. One job with a long 'company name' took the other three down with it. The fix: fields the model writes are truncated instead of rejected, and an unreadable entry drops out on its own. A clipped label is cosmetic; a lost import isn't.",
  },
  gallery: [
    {
      route: "workspace",
      caption: {
        he: "סביבת העבודה: קורות החיים המותאמים לצד דוח השינויים",
        en: "The workspace: the tailored CV beside the change report",
      },
      callouts: {
        desktop: [
          { n: 1, x: 76, y: 26.4, text: { he: "אחרי סקירה ועריכה, אישור אחד יוצר את הקבצים", en: "After review and edits, one approval creates the files" } },
          { n: 2, x: 3.2, y: 37, text: { he: "קו אדום שנמצא במודעה: שלושה ימים במשרד", en: "A dealbreaker found in the posting: three office days" } },
          { n: 3, x: 38.8, y: 46.8, text: { he: "עשרות תבניות עיצוב, עם המלצה לפי המשרה", en: "Dozens of templates, with picks matched to the job" } },
          { n: 4, x: 2.2, y: 49.6, text: { he: "דוח השינויים: מה נמחק, מה נוסף ולמה", en: "The change report: what was cut, what was added, and why" } },
          { n: 5, x: 61.5, y: 86, text: { he: "קורות החיים המותאמים, עם עריכה ישירה", en: "The tailored CV, editable in place" } },
        ],
      },
    },
    {
      route: "match-analysis",
      devices: ["desktop"],
      caption: {
        he: "ניתוח ההתאמה: ציון, חוזקות, פערים והמלצות",
        en: "Match analysis: a score, strengths, gaps and recommendations",
      },
    },
    {
      route: "interview",
      devices: ["desktop"],
      caption: {
        he: "סימולציית ראיון: נאום של 30 שניות ושאלות צפויות, כל אחת עם הסבר למה שואלים אותה",
        en: "Interview simulation: a 30-second pitch and likely questions, each with why it gets asked",
      },
    },
    {
      route: "sample",
      devices: ["desktop"],
      caption: {
        he: "הדוגמה החינמית: כל קורות החיים, וחצי מכל מקטע גלוי",
        en: "The free sample: the whole CV, with half of every section readable",
      },
    },
  ],
};

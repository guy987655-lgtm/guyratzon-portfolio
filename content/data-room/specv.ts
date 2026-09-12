import type { L10n } from "@/lib/i18n";
import type { Decision } from "../types";
import type { DataRoomQueryId } from "./queries";

type Table = { name: string; kind: "fact" | "dimension"; grain: L10n; columns: { name: string; note: L10n }[] };

/**
 * SpeCV's data-model room. Everything here describes the design (from the migrations and the
 * analytics hand-off) or numbers computed on the SYNTHETIC dataset — never production data.
 */
export const dataRoom = {
  title: { he: "חדר מודל הנתונים של SpeCV", en: "SpeCV's data model room" },
  lead: {
    he: "מאחורי SpeCV יש שני מסדים באותו Postgres: טבלאות המוצר, ומחסן אנליטי נפרד בסכמת כוכב שמתרענן כל שעה. כאן אפשר לראות איך הוא בנוי, אילו החלטות קיבלתי בדרך, ושלוש שאילתות שרצות עליו.",
    en: "Behind SpeCV sit two models in one Postgres: the product tables, and a separate star-schema warehouse that refreshes hourly. Here's how it's built, the calls I made along the way, and three queries that run on it.",
  },
  whySynthetic: {
    title: { he: "למה נתונים סינתטיים", en: "Why synthetic data" },
    body: {
      he: "המחסן נבנה כשכמעט לא היו בו משתמשים. כדי לבדוק שאילתות, כללי ספירה ותהליך ה-ETL לפני שהם פוגשים נתונים אמיתיים, כתבתי גנרטור שמייצר שנה של תנועה: מבקרים, ביקורים, משרות, יצירות, הרשמות והזמנות.\n\nהבדיקה רצה על PostgreSQL אמיתי בתוך WASM (PGlite): כל המיגרציות לפי הסדר, טעינת הנתונים, ה-ETL המלא, ואז השוואה בין מה שהמחסן בנה לבין 'האמת' שהגנרטור יודע מראש. כך נתפסו שני באגים אמיתיים בשלבי ה-ETL לפני שהגיעו לפרודקשן. כל המספרים בעמוד הזה מגיעים מהנתונים הסינתטיים.",
      en: "The warehouse was built when it had almost no users. To test queries, counting rules and the ETL before they met real data, I wrote a generator that produces a year of traffic: visitors, visits, jobs, generations, signups and orders.\n\nThe test runs on real PostgreSQL inside WASM (PGlite): every migration in order, the data load, the full ETL, then a comparison between what the warehouse built and the ground truth the generator knows up front. That caught two real ETL bugs before they reached production. Every number on this page comes from the synthetic data.",
    },
  },
  erd: {
    id: "specv-erd",
    caption: {
      he: "חלק מהמחסן: חמש טבלאות עובדה והממדים שלהן. כל טבלת עובדה מתחברת גם ל-dim_date.",
      en: "Part of the warehouse: five fact tables and their dimensions. Every fact also joins dim_date.",
    },
  },
  dictionaryTitle: { he: "מילון נתונים", en: "Data dictionary" },
  tables: [
    {
      name: "fact_visit",
      kind: "fact",
      grain: {
        he: "ביקור אחד: סשן דפדפן של מבקר אחד, שנחתך אחרי 30 דקות בלי פעילות, בחצות UTC או אחרי 12 שעות.",
        en: "One visit: a browser session by one visitor, cut after 30 idle minutes, at UTC midnight, or at 12 hours.",
      },
      columns: [
        { name: "duration_seconds", note: { he: "מצטבר (סכום = זמן כולל באתר). נחתך בפינג האחרון, כך שהשהייה בעמוד האחרון לא נראית.", en: "Additive (sum = total time on site). Cut at the last ping, so dwell on the final page is invisible." } },
        { name: "converted_to_signup", note: { he: "האם הביקור הסתיים בהרשמה.", en: "Whether the visit ended in a signup." } },
        { name: "bot_suspect", note: { he: "מסנן, לא מדד.", en: "A filter, not a measure." } },
      ],
    },
    {
      name: "fact_jd_submission",
      kind: "fact",
      grain: {
        he: "מודעת דרושים אחת שהוגשה ברגע אחד על ידי מבקר אחד. הגשות אנונימיות והגשות מחשבון יושבות באותה טבלה, כי השאלה העסקית לא מתעניינת באיזה צד של ההרשמה המשרה הגיעה.",
        en: "One job description submitted at one moment by one visitor. Anonymous and account submissions share the table, because the business question doesn't care which side of signup a job arrived on.",
      },
      columns: [
        { name: "is_anonymous", note: { he: "הוגשה לפני הרשמה.", en: "Submitted before signup." } },
        { name: "is_first_for_visitor_jd", note: { he: "הבסיס ל'כמה משרות הועלו': ההגשה הראשונה של אותה מודעה על ידי אותו מבקר מוכר.", en: "The basis of 'jobs uploaded': the first submission of a posting by a known visitor." } },
        { name: "jd_hash", note: { he: "המפתח היחיד שמחבר הדבקה אנונימית לשורת המשרה שהיא הפכה אליה.", en: "The only key joining an anonymous paste to the job row it later became." } },
      ],
    },
    {
      name: "fact_generation",
      kind: "fact",
      grain: { he: "גרסה אחת של קורות חיים מותאמים למשרה אחת.", en: "One revision of one tailored CV for one job." },
      columns: [
        { name: "match_score", note: { he: "לא מצטבר — ממוצע בלבד. NULL ולא 0 כשהמודל השמיט את ניתוח הפערים.", en: "Non-additive — average only. NULL, not 0, when the model omitted the gap analysis." } },
        { name: "match_score_is_missing", note: { he: "מבדיל בין 'המודל לא החזיר ציון' לבין ציון 0 אמיתי.", en: "Tells 'the model returned no score' apart from a genuine 0." } },
      ],
    },
    {
      name: "fact_purchase",
      kind: "fact",
      grain: { he: "פתיחה אחת של משרה.", en: "One job unlock." },
      columns: [
        { name: "amount_cents", note: { he: "0 יכול להיות ניצול קרדיט, מענק במצב חינמי או פתיחה חינמית באמת.", en: "0 can mean a credit spend, a free-mode grant, or a genuinely free unlock." } },
        { name: "is_credit_spend · is_free_mode_grant", note: { he: "הדגלים שמפרידים בין שלושת סוגי ה-0, פעם אחת, ב-ETL.", en: "The flags that separate the three kinds of zero, once, in the ETL." } },
      ],
    },
    {
      name: "fact_signup",
      kind: "fact",
      grain: { he: "חשבון רשום אחד, שנרשם פעם אחת.", en: "One registered account, recorded once." },
      columns: [
        { name: "acquisition_key", note: { he: "המגע הראשון ולא האחרון: מה הביא את האדם למוצר.", en: "First touch, not last: what brought the person to the product." } },
        { name: "signup_visitor_key", note: { he: "המבקר שנרשם. נכתב פעם אחת ולא נדרס לעולם.", en: "The visitor who signed up. Written once, never overwritten." } },
      ],
    },
    {
      name: "fact_user_day",
      kind: "fact",
      grain: { he: "משתמש רשום אחד ביום קלנדרי, רציף מההרשמה ועד היום.", en: "One registered user per calendar date, dense from signup to today." },
      columns: [
        { name: "balances", note: { he: "יתרות חצי-מצטברות לצד דלתאות יומיות: מסכמים בין משתמשים, לעולם לא בין תאריכים.", en: "Semi-additive balances beside daily deltas: sum across users, never across dates." } },
      ],
    },
    {
      name: "dim_company · dim_company_alias",
      kind: "dimension",
      grain: { he: "חברה קנונית אחת. Google, google inc ו-Google Inc. הן אותה חברה.", en: "One canonical company. Google, google inc and Google Inc. are one company." },
      columns: [
        { name: "raw_variant_count", note: { he: "כמה איותים שונים התאחדו לחברה הזו.", en: "How many spellings were merged into this company." } },
        { name: "alias.source = 'human'", note: { he: "תיקון ידני שה-ETL לעולם לא דורס.", en: "A manual fix the ETL never overwrites." } },
      ],
    },
    {
      name: "dim_date",
      kind: "dimension",
      grain: { he: "יום קלנדרי אחד.", en: "One calendar day." },
      columns: [{ name: "is_weekend", note: { he: "שישי ושבת — החלטה של שוק, לא עובדה קלנדרית.", en: "Friday and Saturday — a market decision, not a calendar fact." } }],
    },
  ] satisfies Table[],
  decisionsTitle: { he: "החלטות במודל", en: "Modeling decisions" },
  decisions: [
    {
      id: "dr-grain",
      title: { he: "הגרעין נקבע לפי השאלה", en: "Grain follows the question" },
      why: {
        he: "גרעין הוא ההחלטה היחידה שאי אפשר להפוך בזול. כל טבלת עובדה מתחילה במשפט אחד שמגדיר מה שורה אחת מייצגת, לפי השאלה שהיא צריכה לענות עליה, ולא לפי השורות שבמקרה שלמות.",
        en: "Grain is the one decision you can't cheaply reverse. Every fact table opens with one sentence defining what a row is, set by the question it must answer rather than by which rows happen to be complete.",
      },
      tradeoff: {
        he: "טבלאות רחבות יותר, וחלק מהשאלות דורשות חיבור בין שתי טבלאות עובדה.",
        en: "Wider tables, and some questions need two fact tables joined.",
      },
    },
    {
      id: "dr-unknown-member",
      title: { he: "חבר 'לא ידוע' במקום NULL", en: "An 'unknown' member instead of NULL" },
      why: {
        he: "מפתחות ממד מקבלים ברירת מחדל ‎-1: שורה אמיתית בממד שמייצגת 'לא ידוע'. כך inner join לעולם לא מפיל שורה בשקט.",
        en: "Dimension keys default to -1, a real row meaning 'unknown', so an inner join can never silently drop a fact.",
      },
      tradeoff: {
        he: "צריך לזכור לסנן את ‎-1 כשרוצים רק ערכים ידועים; שכחה מנפחת את קטגוריית ה'לא ידוע'.",
        en: "You have to remember to filter -1 for known values only; forgetting inflates the 'unknown' bucket.",
      },
    },
    {
      id: "dr-additivity",
      title: { he: "החיבוריות כתובה על העמודה", en: "Additivity written on the column" },
      why: {
        he: "ציון התאמה הוא ממוצע; יתרת קרדיט מסתכמת בין משתמשים ולעולם לא בין תאריכים. ההערה על העמודה היא הדבר היחיד שעומד בין דשבורד עתידי לבין מספר שגוי שאף אחד לא ישים לב אליו.",
        en: "A match score is an average; a credit balance sums across users but never across dates. The column comment is all that stands between a future dashboard and a wrong number nobody notices.",
      },
      tradeoff: {
        he: "זה תיעוד ולא אכיפה: שום דבר לא מונע ממישהו לסכם עמודה שכתוב עליה 'ממוצע בלבד'.",
        en: "It documents, it doesn't enforce: nothing stops someone summing a column marked 'average only'.",
      },
    },
    {
      id: "dr-jobs-uploaded",
      title: { he: "'משרות שהועלו' עם יוצא מן הכלל", en: "'Jobs uploaded', with a carve-out" },
      why: {
        he: "משרה נספרת פעם אחת לכל מבקר מוכר. בגרסה הראשונה, שני אנשים שהגישו לאותה מודעה נספרו כמשרה אחת. זה נתפס כשהנתונים הראו תפקיד עם יותר חברות ממשרות — מצב שלא יכול להתקיים.",
        en: "A job counts once per known visitor. The first version collapsed two people applying to the same posting into one job. It was caught when the data showed a role with more companies than jobs — which can't happen.",
      },
      tradeoff: {
        he: "כלל שקשה יותר להסביר, וכל שאילתה על משרות חייבת להשתמש בדגל ולא ב-count(*).",
        en: "A harder rule to explain, and every jobs query must use the flag, not count(*).",
      },
    },
  ] satisfies Decision[],
  generator: {
    title: { he: "הגנרטור", en: "The generator" },
    body: {
      he: "גנרטור בטייפסקריפט עם זרע קבוע, כך שכל ריצה מייצרת בדיוק אותם נתונים. הוא מייצר 12 חודשים של תנועה ל-800 מבקרים, עם משקלים לפי חודש, יום בשבוע ושעה, ושיעורי המרה לכל שלב במשפך. רשימה של 25 חברות טכנולוגיה מגיעה עם וריאציות איות מכוונות, כדי שיהיה מה לאחד.\n\nלכל חשבון סינתטי יש כתובת בדומיין ‎.invalid, שלא יכולה לקבל מייל, וכל שורה מסומנת כסינתטית, כך שאפשר למחוק את כולן בפקודה אחת. הגנרטור גם מחשב מראש את התוצאה הנכונה של כל ספירה, והבדיקה משווה אותה למה שהמחסן בנה.",
      en: "A TypeScript generator with a fixed seed, so every run produces exactly the same data. It creates 12 months of traffic for 800 visitors, weighted by month, weekday and hour, with a conversion rate for each funnel step. A list of 25 tech companies comes with deliberate spelling variants, so there's something to merge.\n\nEvery synthetic account uses a .invalid address that can't receive mail, and every row is flagged synthetic so all of it can be removed in one command. The generator also computes the correct answer to every count up front, and the test compares it with what the warehouse built.",
    },
  },
  queriesTitle: { he: "שלוש שאילתות", en: "Three queries" },
  queries: [
    {
      id: "uploads-before-signup",
      question: {
        he: "כמה משרות הועלו בכל חודש, וכמה מהן היו מתפספסות אילו סופרים רק חשבונות רשומים?",
        en: "How many jobs were uploaded each month — and how many would a count of accounts alone have missed?",
      },
      insight: {
        he: "בנתונים הסינתטיים, בין 41% ל-76% מהמשרות בכל חודש הועלו לפני הרשמה. ספירה של משרות בחשבונות בלבד הייתה מסתירה עד שלוש מכל ארבע העלאות, ולכן שתי הצורות יושבות באותה טבלה.",
        en: "On the synthetic data, 41% to 76% of each month's jobs were uploaded before signup. Counting account jobs alone would have hidden up to three uploads in four — which is why both sit in one table.",
      },
    },
    {
      id: "signup-by-source",
      question: {
        he: "מאיזה מקור מגיעים המבקרים שנרשמים?",
        en: "Which traffic sources produce signups?",
      },
      insight: {
        he: "תנועה ישירה מביאה הכי הרבה ביקורים ואת שיעור ההרשמה הנמוך ביותר (8.5%), בערך שליש מחיפוש ומרשתות חברתיות. דוח שממוין לפי נפח בלבד היה מצביע על הערוץ הלא נכון.",
        en: "Direct traffic brings the most visits and the lowest signup rate (8.5%), about a third of search and social. A report sorted by volume alone would point at the wrong channel.",
      },
    },
    {
      id: "roles-and-companies",
      question: {
        he: "לאילו תחומים מתאימים קורות חיים, ובכמה חברות — אחרי איחוד האיותים?",
        en: "Which role families get tailored for, and across how many companies — after spellings are merged?",
      },
      insight: {
        he: "בכל תחום, 27–35 חברות מגיעות תחת 81–93 איותים שונים. בלי שלב האיחוד, כל חברה הייתה נספרת בממוצע כמעט שלוש פעמים, וכל דירוג של 'חברות מובילות' היה שגוי.",
        en: "In every family, 27–35 companies arrive under 81–93 different spellings. Without the merge step, each company would be counted nearly three times on average, and any 'top companies' ranking would be wrong.",
      },
    },
  ] satisfies { id: DataRoomQueryId; question: L10n; insight: L10n }[],
  scale: {
    title: { he: "מה היה נשבר בסקייל", en: "What would break at scale" },
    body: {
      he: "המחסן מתרענן כל שעה ב-pg_cron, בתוך אותו Postgres שמשרת את המוצר, ורענון מלא רץ פעם בשבוע. בנפחים של היום זה זניח. בסקייל, הרענון יתחרה במוצר על אותו מסד, ואיחוד שמות החברות — השוואה רכה בין מחרוזות — צפוי להיות הראשון להאט.\n\nהצעדים הבאים: רענון אינקרמנטלי בלבד לפי watermark, שכבר קיים לרוב השלבים; העברת המחסן למסד נפרד; ומעבר של איחוד השמות מכללים לטבלת כינויים שמתוחזקת חצי-אוטומטית.",
      en: "The warehouse refreshes hourly on pg_cron inside the same Postgres that serves the product, with a full rebuild weekly. At today's volume that's negligible. At scale, refreshes would compete with the product for one database, and company-name merging — fuzzy string matching — would likely be the first step to slow down.\n\nNext steps: incremental-only refreshes by watermark, which most steps already support; moving the warehouse to its own database; and shifting name merging from rules to a semi-automatically maintained alias table.",
    },
  },
};

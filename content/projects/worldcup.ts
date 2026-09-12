import type { Project } from "../types";

export const worldcup: Project = {
  slug: "worldcup",
  title: { he: "מונדיאל 2026", en: "World Cup 2026" },
  tagline: { he: "לוח המשחקים של המונדיאל, עם מודל תחזיות", en: "The World Cup schedule, with a prediction model" },
  depth: "full",
  liveUrl: "https://world-cup-2026-alpha-beryl.vercel.app/?demo=1",
  liveFrame: true,
  stack: ["Vite", "JavaScript", "ESPN API", "Vercel Analytics"],
  builtAt: "2026-06-06",
  usage: {
    he: "אתר שבניתי לקראת המונדיאל ותחזקתי לאורך כל הטורניר. TODO(guy): לאשר, ולהוסיף למי הוא נבנה",
    en: "A site I built ahead of the World Cup and maintained throughout the tournament. TODO(guy): confirm, and add who it was for",
  },
  interfaceLocales: ["he", "en"],
  cardFact: { he: "104 משחקים, בעברית ובאנגלית", en: "104 matches, in Hebrew and English" },
  overview: {
    he: "לוח המשחקים של המונדיאל בעברית ובאנגלית, עם תוצאות חיות, יחסים, טבלאות בתים ועץ פלייאוף עם הסתברויות. הסינון המרכזי: משחקים של נבחרות טופ שנופלים בשעות שמתאימות לילדים.",
    en: "The World Cup schedule in Hebrew and English, with live scores, odds, group tables and a playoff bracket with probabilities. The main filter: top-team matches that fall at kid-friendly hours.",
  },
  peek: [
    {
      he: "מתג אחד משאיר רק משחקים של נבחרות טופ בחלון השעות של הילדים, לפי אזור הזמן שנבחר.",
      en: "One switch keeps only top-team matches inside the kids' time window, in the chosen time zone.",
    },
    {
      he: "הלוח נטען מקובץ סטטי, והתוצאות החיות נמזגות לתוכו. אם ESPN לא עונה, הלוח עדיין עולה.",
      en: "The schedule loads from a static file and live scores merge on top. If ESPN is down, the schedule still loads.",
    },
    {
      he: "עץ הפלייאוף מתמלא לבד, ולפני שנקבעים הזוגות הוא מציג את הזוגות הצפויים לפי המודל.",
      en: "The bracket fills itself in, and before pairings are set it shows the model's projected matchups.",
    },
  ],
  problem: {
    he: "לוחות המשחקים הרשמיים כתובים בשעון אמריקאי ובאנגלית, ולא עונים על השאלה שעניינה אותנו בבית: איזה משחק טוב אפשר לראות עם הילדים הערב. TODO(guy): לאשר",
    en: "Official schedules are in US time and in English, and don't answer the question we actually had at home: which good match can we watch with the kids tonight? TODO(guy): confirm",
  },
  approach: {
    he: "לוח המשחקים הוא קובץ JSON סטטי, כך שהוא נטען תמיד. מעליו נמזגת שכבה חיה מה-API הציבורי של ESPN: תוצאות, מבקיעים, החזקת כדור, כושר ויחסים. משחקי בתים מחוברים לפי צמד הנבחרות והתאריך, ומשחקי נוקאאוט לפי משבצת התאריך והשעה, כי שמות הנבחרות לא ידועים מראש.\n\nכל הממשק כתוב פעמיים, בעברית מימין לשמאל ובאנגלית משמאל לימין, כולל שמות נבחרות, שלבים ומשפטי ההסבר. בחירת אזור זמן מעדכנת את השעות וגם את חלון השעות של הילדים.",
    en: "The schedule is a static JSON file, so it always loads. A live layer from ESPN's public API merges on top: scores, scorers, possession, form and odds. Group matches join on the team pair and date, knockout matches on the date-and-time slot, since the teams aren't known in advance.\n\nThe whole interface exists twice, Hebrew right-to-left and English left-to-right, down to team names, stages and help text. Picking a time zone shifts the kickoff times and the kids' time window with them.",
  },
  diagram: "worldcup-data",
  decisions: [
    {
      id: "worldcup-static-plus-live",
      title: { he: "לוח סטטי ושכבה חיה מעליו", en: "A static schedule with a live layer on top" },
      why: {
        he: "הלוח לא משתנה, התוצאות כן. כשהן נפרדות, תקלה ב-API החיצוני פוגעת רק בתוצאות, והלוח ממשיך לעבוד.",
        en: "The schedule doesn't change; the scores do. Keeping them apart means an outage in the external API costs only the scores, never the schedule.",
      },
      tradeoff: {
        he: "צריך לחבר בין שני מקורות שלא חולקים מזהה משותף, וכל חיבור כזה יכול להיכשל בשקט.",
        en: "Two sources with no shared id have to be joined, and every such join can fail silently.",
      },
    },
    {
      id: "worldcup-bidi",
      title: { he: "עברית מלאה, לא תרגום של ממשק", en: "Real Hebrew, not a translated UI" },
      why: {
        he: "תוצאה כמו 2-1 מתהפכת בכיוון מימין לשמאל. כל מחרוזת שמשלבת מספרים, שמות באנגלית וחצים עוברת טיפול כיווני משלה.",
        en: "A score like 2-1 flips in right-to-left text. Every string mixing numbers, English names and arrows gets its own direction handling.",
      },
      tradeoff: {
        he: "כל רכיב נבדק פעמיים, וחלק מהתיקונים ספציפיים לכיוון אחד.",
        en: "Every component gets tested twice, and some fixes apply to one direction only.",
      },
    },
    {
      id: "worldcup-projected-bracket",
      title: { he: "עץ שמנחש לפני שהוא יודע", en: "A bracket that guesses before it knows" },
      why: {
        he: "עץ ריק עם 'המנצחת במשחק 73' לא מעניין אף אחד. מודל פשוט מדרג את הזוגות הצפויים לפי טבלאות הבתים, ומפנה את מקומו לתוצאה האמיתית ברגע שהיא נקבעת.",
        en: "An empty bracket full of 'winner of match 73' interests nobody. A simple model ranks the likely pairings from the group tables and gives way to the real result the moment it's in.",
      },
      tradeoff: {
        he: "תחזית שמוצגת לצד תוצאות אמיתיות צריכה סימון ברור, אחרת היא נקראת כעובדה.",
        en: "A projection shown next to real results needs clear labeling, or it reads as fact.",
      },
    },
  ],
  whatBroke: {
    he: "תוצאות משחקי הנוקאאוט מתחברות לשורות בלוח לפי תאריך ושעה. כששעת הפתיחה של משחק 79 בקובץ הלוח הייתה שגויה, התוצאה החיה לא מצאה את השורה שלה, והמשחק נשאר 'ממתין' גם אחרי שהסתיים. מפתח חיבור שנשען על שעה הופך כל טעות בנתונים לשורה שנעלמת בשקט. התיקון היה בנתונים ולא בקוד.",
    en: "Knockout results join schedule rows on date and time. When match 79's kickoff time in the schedule file was wrong, the live result never found its row, and the match stayed 'upcoming' after it ended. A join key built on a time turns every data error into a silently missing row. The fix was in the data, not the code.",
  },
  gallery: [
    {
      route: { he: "schedule-he", en: "schedule-en" },
      caption: { he: "הלוח ביום האחרון של שלב הבתים", en: "The schedule on the last day of the group stage" },
    },
    {
      route: { he: "bracket-he", en: "bracket-en" },
      caption: { he: "עץ הפלייאוף עם הזוגות הצפויים לפי המודל", en: "The playoff bracket with the model's projected pairings" },
    },
  ],
};

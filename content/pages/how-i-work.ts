import type { L10n } from "@/lib/i18n";

export type ProseSection = { id: string; title: L10n; body: L10n };

export const howIWork: { title: L10n; lead: L10n; sections: ProseSection[] } = {
  title: { he: "איך אני עובד", en: "How I work" },
  lead: {
    he: "שלושה הרגלים שחוזרים בכל אחד מהפרויקטים באתר, ומקום אחד שבו אני לא מוותר על שיקול הדעת שלי.",
    en: "Three habits that show up in every project on this site, and the places where I don't hand over judgment.",
  },
  sections: [
    {
      id: "question-first",
      title: { he: "מתחיל מהשאלה, לא מהכלי", en: "Start from the question, not the tool" },
      body: {
        he: "לפני שאני פותח עורך, אני כותב במשפט אחד מה צריך להיות נכון כדי שהדבר יעבוד, ומה ישכנע אותי שהוא לא עובד. ב-SpeCV המשפט היה: מחפש עבודה יסמוך על קורות חיים שנכתבו בשבילו רק אם יראה מה השתנה. ממנו נגזרו דוח השינויים, הסכמה הקשיחה שהמודל חייב לעמוד בה, וממשק שבנוי סביב סקירה ולא סביב יצירה.",
        en: "Before opening an editor, I write one sentence: what has to be true for this to work, and what would convince me it doesn't. For SpeCV it was: a job seeker will trust a CV written for them only if they can see what changed. The change report, the strict schema the model must meet, and an interface built around review all came from that sentence.",
      },
    },
    {
      id: "claude-code",
      title: { he: "בונה עם Claude Code, ומחליט בעצמי", en: "Build with Claude Code, decide myself" },
      body: {
        he: "את רוב הקוד כותב Claude Code, ואני עובד מולו כמו מול מפתח מהיר מאוד שצריך כיוון: מגדיר את הבעיה, קורא כל שינוי, ומחליט. יש שלושה מקומות שבהם אני לא מוותר על שיקול הדעת שלי, כי אלה ההחלטות שהכי קשה לתקן אחר כך: מודל הנתונים (מה שורה אחת מייצגת ואיך סופרים), פרטיות (מה נשמר, איפה ולכמה זמן), ומה למדוד.\n\nגם האתר הזה נבנה כך. כל מסך בו מגיע ממצב הדגמה שבניתי בכל אחד מהפרויקטים, וצנרת הצילומים מסרבת לשמור צילום אם אין עליו באנר הדגמה — כלל שקבעתי מראש, כי טעות אחת כאן הייתה חושפת נתונים אישיים.",
        en: "Claude Code writes most of the code, and I work with it like a very fast developer who needs direction: I frame the problem, read every change, and decide. There are three places where I keep my own judgment, because they're the hardest decisions to undo: the data model (what a row means and how things are counted), privacy (what's stored, where, and for how long), and what to measure.\n\nThis site was built the same way. Every screen comes from a demo mode I added to each project, and the screenshot pipeline refuses to save a shot that lacks a demo banner — a rule I set up front, because one mistake here would expose personal data.",
      },
    },
    {
      id: "measure",
      title: { he: "סוגר את הלולאה במדידה", en: "Close the loop with measurement" },
      body: {
        he: "מדידה היא שלב קבוע בכל פרויקט ולא תוספת בדיעבד: מגדירים מראש אילו אירועים חשובים, מטמיעים אותם עם השחרור, ובודקים אחרי שבוע אם ההנחות החזיקו. ב-SpeCV, הכלל של 'כמה משרות הועלו' ספר בהתחלה משרה ששני אנשים הגישו אליה כמשרה אחת. זה נתפס רק כי הנתונים הראו תפקיד עם יותר חברות ממשרות — מצב שלא יכול להתקיים. הכלל תוקן, והבדיקה שתפסה אותו הפכה לחלק מהצנרת.\n\nגם תיק העבודות נמדד. מוגדרים בו מראש האירועים שעונים על שאלה אחת: האם מי שקיבל את קורות החיים שלי נשאר, הבין וזכר. בלי הקלטות סשן ובלי זיהוי של אנשים — רק דפוסים מצטברים.",
        en: "Measurement is a fixed step in every project, not an afterthought: decide up front which events matter, ship them with the release, and check a week later whether the assumptions held. In SpeCV, the 'jobs uploaded' rule first counted a posting two people applied to as one job. It was caught only because the data showed a role with more companies than jobs — which can't happen. The rule was fixed, and the check that caught it became part of the pipeline.\n\nThis portfolio is measured too. Its events are defined up front to answer one question: did someone who got my résumé stay, understand, and remember? No session recordings, no identifying people — only aggregate patterns.",
      },
    },
  ],
};

import type { L10n } from "@/lib/i18n";

export type ProseSection = { id: string; title: L10n; body: L10n };

export const howIWork: { title: L10n; lead: L10n; sections: ProseSection[] } = {
  title: { he: "איך אני עובד", en: "How I work" },
  lead: {
    he: "שלושה דברים שחוזרים בכל אחד מהפרויקטים באתר: איך אני בוחר מה לבנות, איך אני כותב את זה לפני שורת הקוד הראשונה, ואיפה אני לא מוותר על שיקול הדעת שלי.",
    en: "Three things that repeat across every project on this site: how I choose what to build, how I write it down before the first line of code, and where I don't hand over judgment.",
  },
  sections: [
    {
      id: "need-first",
      title: { he: "מתחיל מהצורך, לא ממה שקיים", en: "Start from the need, not from what exists" },
      body: {
        he: "הפסקתי להיות רק לקוח של טכנולוגיה. כשיש לי צורך, אני כבר לא מחפש את הכלי הקרוב ביותר ומתפשר על הפער - אני מתייחס לצורך ברצינות, גם כשהוא שלי בלבד. רוב הכלים בנויים לממוצע של הרבה אנשים, ולכן כמעט תמיד נשאר מרחק בין מה שהם עושים לבין מה שבאמת היה עוזר לי. כשהמרחק הזה חוזר כל יום, זה סימן שהפתרון צריך להיבנות ולא להימצא.\n\nלפני שאני פותח עורך, אני כותב במשפט אחד מה צריך להיות נכון כדי שהדבר יעבוד, ומה ישכנע אותי שהוא לא עובד. המשפט הזה מבדיל בין צורך אמיתי לבין רעיון שנשמע טוב, ואליו אני חוזר בסוף כדי לדעת אם באמת סיימתי.",
        en: "I stopped being only a consumer of technology. When I have a need, I no longer reach for the closest available tool and settle for the gap - I take the need seriously, even when it's mine alone. Most tools are built for the average of many people, so there's almost always distance between what they do and what would actually help me. When that distance shows up every day, it's a sign the solution has to be built rather than found.\n\nBefore opening an editor, I write one sentence: what has to be true for this to work, and what would convince me it doesn't. That sentence separates a real need from an idea that merely sounds good, and it's what I come back to at the end to know whether I'm actually done.",
      },
    },
    {
      id: "prd",
      title: { he: "כל רעיון עובר דרך PRD", en: "Every idea goes through a PRD" },
      body: {
        he: "אחרי שיש רעיון, אני עדיין לא פותח עורך - אני כותב PRD. כל סעיף בו בנוי מארבעה חלקים קבועים: רקע, מצב מצוי, מצב רצוי, ומה המצב הרצוי פותר.\n\nהמבנה הקבוע הזה עושה שני דברים. הוא מכריח אותי לתאר את הקיים לפני שאני מתאר את הפתרון - ולא פעם אחת גיליתי שם שאין בעיה, או שהבעיה היא לא זו שחשבתי. והוא הופך את החלק הרביעי למבחן: אם אני לא מצליח לכתוב מה המצב הרצוי פותר, הסעיף יורד מה-PRD.\n\nזה גם מה שהופך את Claude Code לשימושי באמת. מפרט שכתוב ככה כמעט לא משאיר מקום לפרשנות, וזה ההבדל בין קוד שאני צריך לתקן אחר כך לבין קוד שאני רק צריך לקרוא ולאשר.",
        en: "Once there's an idea, I still don't open an editor - I write a PRD. Every section in it has the same four parts: background, current state, desired state, and what the desired state solves.\n\nThat fixed structure does two things. It forces me to describe what exists before I describe the fix - and more than once that's where I found there was no problem, or that the problem wasn't the one I thought. And it turns the fourth part into a test: if I can't write down what the desired state solves, the section comes out of the PRD.\n\nIt's also what makes Claude Code genuinely useful. A spec written this way leaves almost no room for interpretation, and that's the difference between code I have to fix afterwards and code I only have to read and approve.",
      },
    },
    {
      id: "claude-code",
      title: { he: "בונה עם Claude Code, ומחליט בעצמי", en: "Build with Claude Code, decide myself" },
      body: {
        he: "את רוב הקוד כותב Claude Code, ואני עובד מולו כמו מול מפתח מהיר מאוד שצריך כיוון: מגדיר את הבעיה, קורא כל שינוי, ומחליט. יש שלושה מקומות שבהם אני לא מוותר על שיקול הדעת שלי, כי אלה ההחלטות שהכי קשה לתקן אחר כך: מודל הנתונים (מה שורה אחת מייצגת ואיך סופרים), פרטיות (מה נשמר, איפה ולכמה זמן), ומה למדוד.\n\nבפועל אני מתחלף בין שלושה כובעים על אותו פרויקט: מפתח ששואל אם הארכיטקטורה תחזיק, איש מוצר ששואל אם הפלואו פשוט מספיק, ואיש דאטה ששואל מה נמדוד ואיך. הכובע השלישי הוא זה שאני הכי טוב בו, ובדיוק לכן אני שם אותו אחרון - קל מדי לבנות מוצר שנוח למדוד אותו ולא נוח להשתמש בו.\n\nגם האתר הזה נבנה כך. כל מסך בו מגיע ממצב הדגמה שבניתי בכל אחד מהפרויקטים, וצנרת הצילומים מסרבת לשמור צילום אם אין עליו באנר הדגמה - כלל שקבעתי מראש, כי טעות אחת כאן הייתה חושפת נתונים אישיים.",
        en: "Claude Code writes most of the code, and I work with it like a very fast developer who needs direction: I frame the problem, read every change, and decide. There are three places where I keep my own judgment, because they're the hardest decisions to undo: the data model (what a row means and how things are counted), privacy (what's stored, where, and for how long), and what to measure.\n\nIn practice I switch between three hats on the same project: a developer asking whether the architecture will hold, a product person asking whether the flow is simple enough, and a data person asking what we'll measure and how. The third hat is the one I'm best at, which is exactly why I put it on last - it's too easy to build something that's convenient to measure and inconvenient to use.\n\nThis site was built the same way. Every screen comes from a demo mode I added to each project, and the screenshot pipeline refuses to save a shot that lacks a demo banner - a rule I set up front, because one mistake here would expose personal data.",
      },
    },
  ],
};

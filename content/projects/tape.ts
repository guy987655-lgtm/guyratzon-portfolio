import type { Project } from "../types";

export const tape: Project = {
  slug: "tape",
  title: { he: "Tape Calculator", en: "Tape Calculator" },
  tagline: {
    he: "מחשבון סרט שבו כל חישוב נשאר על הסרט, עם הערה לכל שורה",
    en: "A tape calculator that keeps every calculation, with a note on each line",
  },
  depth: "full",
  liveUrl: "https://tapecalc-mu.vercel.app/?demo=1",
  stack: ["HTML", "CSS", "JavaScript", "localStorage"],
  builtAt: "2026-05-19",
  usage: {
    he: "כלי שבניתי לעצמי ומשתמש בו מאז מאי 2026. TODO(guy): לאשר את התאריך ואת השימוש",
    en: "A tool I built for myself and have used since May 2026. TODO(guy): confirm the date and the use",
  },
  interfaceLocales: ["en"],
  preferDevice: "mobile",
  cardFact: { he: "קובץ HTML אחד, בלי תלויות", en: "One HTML file, zero dependencies" },
  overview: {
    he: "מחשבון עם סרט, כמו של פעם: כל חישוב נשאר על הסרט, עם הערה לצידו. אני משתמש בו לתקציב חודשי: מתחילים מסכום, כל הוצאה מקזזת, ורואים כמה נשאר עד האיפוס. TODO(guy): לאשר את תיאור השימוש",
    en: "A calculator with a paper-style tape: every calculation stays on the tape, with a note beside it. I use it for a monthly budget: start from an amount, subtract each expense, see what's left until the reset. TODO(guy): confirm the use case",
  },
  peek: [
    {
      he: "לכל שורה יש הערה, כך שהסרט נקרא כמו רשימת הוצאות ולא כמו טור מספרים.",
      en: "Every line carries a note, so the tape reads like an expense list, not a column of numbers.",
    },
    {
      he: "לחיצה על מספר בשורה ישנה משנה אותו, וכל השורות שאחריה מחושבות מחדש בשרשרת.",
      en: "Tap a number in an earlier line to change it, and every line after it recalculates.",
    },
    {
      he: "קובץ HTML אחד בלי שום תלות, עם שמירה ב-localStorage בלבד.",
      en: "A single HTML file with no dependencies, saving only to localStorage.",
    },
  ],
  problem: {
    he: "מחשבון רגיל שוכח: אחרי שלוש הוצאות כבר לא ברור מה חיסרתי ומאיפה הגיע המספר. גיליון אלקטרוני זוכר, אבל הוא כבד מדי לחישוב של שנייה בטלפון.",
    en: "A regular calculator forgets: three expenses in, it's unclear what was subtracted or where the number came from. A spreadsheet remembers, but it's too heavy for a one-second sum on a phone.",
  },
  approach: {
    he: "המודל פשוט: רשימת שורות, וכל שורה היא התוצאה של השורה הקודמת, אופרטור ומספר. החישוב נעשה משמאל לימין כמו במחשבון סרט אמיתי, ועריכה של שורה ישנה מחשבת מחדש את כל מה שאחריה.\n\nרוב העבודה הייתה בפרטי המגע: מקלדת שממלאת את הגובה גם במצב לאורך וגם לרוחב, ידית למזעור המחשבון, גרירה שמשנה את היחס בין הסרט למקלדת, ותיקוני תצוגה לספארי באייפון.",
    en: "The model is simple: a list of lines, each one the previous line's result, an operator and a number. Evaluation runs left to right like a real tape calculator, and editing an earlier line recalculates everything after it.\n\nMost of the work was in the touch details: a keypad that fills the height in portrait and landscape, a handle to collapse the calculator, a drag handle between tape and keypad, and display fixes for Safari on iPhone.",
  },
  diagram: "tape-model",
  decisions: [
    {
      id: "tape-chain",
      title: { he: "כל שורה נשענת על הקודמת", en: "Each line builds on the last" },
      why: {
        he: "כך הסרט הוא היסטוריה רציפה ולא אוסף חישובים נפרדים, ותיקון של מספר אחד מעדכן את כל השרשרת במקום לחייב לחשב הכול מחדש.",
        en: "The tape becomes one continuous history rather than separate sums, and fixing one number updates the whole chain instead of starting over.",
      },
      tradeoff: {
        he: "אי אפשר לחשב שני תרגילים לא קשורים על אותו סרט בלי לנקות אותו.",
        en: "Two unrelated sums can't share a tape without clearing it.",
      },
    },
    {
      id: "tape-integers",
      title: { he: "רק מספרים שלמים", en: "Whole numbers only" },
      why: {
        he: "בתקציב, אגורות הן רעש. ביטול הנקודה העשרונית פינה מקום במקלדת לכפתור 00 וחסך טעויות הקלדה. TODO(guy): לאשר את הנימוק",
        en: "In a budget, cents are noise. Dropping the decimal point freed a key for 00 and removed a class of typos. TODO(guy): confirm the reasoning",
      },
      tradeoff: {
        he: "המחשבון לא מתאים לחישובים מדויקים כמו ריבית או המרת מטבע.",
        en: "It won't do precise math like interest or currency conversion.",
      },
    },
    {
      id: "tape-single-file",
      title: { he: "קובץ אחד, בלי build", en: "One file, no build" },
      why: {
        he: "אין מה לשבור: פותחים את הקובץ והוא עובד, בכל שרת סטטי ואפילו בלי שרת בכלל.",
        en: "Nothing to break: open the file and it works, on any static host or none at all.",
      },
      tradeoff: {
        he: "1,300 שורות של HTML, CSS ו-JavaScript באותו קובץ. כל שינוי עובר דרך אותו מקום.",
        en: "1,300 lines of HTML, CSS and JavaScript in one file; every change goes through the same place.",
      },
    },
  ],
  whatBroke: {
    he: "בגרסה הראשונה, בספארי באייפון, השורה התחתונה של המקלדת נחתכה. 100vh כולל את השטח שמאחורי שורת הכתובת, ולכן הפריסה הייתה גבוהה מהמסך. התיקון: גובה של 100dvh פחות אזור הבטיחות בתחתית, ובמצב לרוחב מקלדת שממלאת את הגובה הפנוי במקום גובה קבוע.",
    en: "In the first version, Safari on iPhone cut off the keypad's bottom row. 100vh includes the area behind the address bar, so the layout was taller than the screen. The fix: 100dvh minus the bottom safe area, and in landscape a keypad that fills the available height instead of a fixed one.",
  },
  gallery: [
    {
      route: "tape",
      caption: {
        he: "תקציב חודשי שיורד שורה אחרי שורה, עם הערה לכל הוצאה",
        en: "A monthly budget running down line by line, with a note on every expense",
      },
    },
  ],
};

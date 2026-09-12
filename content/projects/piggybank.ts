import type { Project } from "../types";

export const piggybank: Project = {
  slug: "piggybank",
  title: { he: "PiggyBank", en: "PiggyBank" },
  tagline: { he: "מעקב יומי אחרי הרגלי אכילה ומשקל", en: "Daily tracking of eating habits and weight" },
  depth: "compact",
  liveUrl: "https://pigi-cal.vercel.app/?demo=1",
  stack: ["HTML", "CSS", "JavaScript", "SVG", "localStorage"],
  builtAt: "2026-07-17",
  usage: {
    he: "כלי שבניתי לעצמי ומשתמש בו מאז יולי 2026. TODO(guy): לאשר את התאריך ואת השימוש",
    en: "A tool I built for myself and have used since July 2026. TODO(guy): confirm the date and the use",
  },
  interfaceLocales: ["en"],
  cardFact: { he: "שני מסכים: לוח שנה ומגמות", en: "Two screens: a calendar and trends" },
  overview: {
    he: "לוח שנה למשקל ולהרגלי אכילה: שוקלים, מטביעים חזרזיר על ימים של הגזמה ומשקולת על ימי אימון, ורואים את החודש כולו בגרף אחד.",
    en: "A calendar for weight and eating habits: log a weigh-in, stamp a pig on the days you overdid it and a dumbbell on workout days, and see the month in one chart.",
  },
  peek: [
    {
      he: "בוחרים חותמת פעם אחת, ואז כל הקשה על יום מטביעה אותה. שנייה ביום.",
      en: "Pick a stamp once, then each tap on a day stamps it. One second a day.",
    },
    {
      he: "ימים בלי שקילה מקבלים אינטרפולציה, כך שקו המגמה לא נקטע.",
      en: "Days without a weigh-in are interpolated, so the trend line never breaks.",
    },
    {
      he: "בלי חשבון ובלי שרת: הכול נשמר בטלפון.",
      en: "No account, no server: everything stays on the phone.",
    },
  ],
  problem: {
    he: "אפליקציות מעקב דורשות יותר מדי קלט, ולכן ננטשות אחרי שבוע. רציתי משהו שלוקח שנייה ביום ועדיין מראה מגמה אמיתית לאורך החודש.",
    en: "Trackers ask for too much input, so they're abandoned within a week. I wanted something that takes a second a day and still shows a real trend across the month.",
  },
  approach: {
    he: "שני מסכים בלבד. בלוח השנה בוחרים חותמת פעם אחת ומקישים על ימים, או מקישים על יום כדי להקליד משקל. במסך המגמות, גרף SVG שנבנה ביד מראה את המשקל לאורך החודש יחד עם החותמות של כל יום, וכרטיסים עם השינוי נטו וספירת החותמות.",
    en: "Just two screens. On the calendar you arm a stamp once and tap days, or tap a day to type a weight. The trends screen draws a hand-built SVG chart of the month's weight alongside each day's stamps, plus cards for the net change and stamp counts.",
  },
  decisions: [
    {
      id: "piggybank-armed-stamp",
      title: { he: "חותמת 'דרוכה' במקום טופס", en: "An 'armed' stamp instead of a form" },
      why: {
        he: "הקלט הנפוץ ביותר, 'הגזמתי היום', הופך להקשה אחת. ככל שהקלט זול יותר, כך המעקב שורד יותר זמן.",
        en: "The most common input, 'I overdid it today', becomes a single tap. The cheaper the input, the longer the tracking lasts.",
      },
      tradeoff: {
        he: "קל להטביע בטעות על היום הלא נכון. הקשה נוספת על אותו יום מבטלת את החותמת.",
        en: "It's easy to stamp the wrong day; tapping it again removes the stamp.",
      },
    },
    {
      id: "piggybank-interpolation",
      title: { he: "קו רציף גם בימים חסרים", en: "A continuous line through missing days" },
      why: {
        he: "שקילה לא קורית כל יום. אינטרפולציה ליניארית מראה את הכיוון במקום להבליט את הימים שנשכחו.",
        en: "Weigh-ins don't happen daily. Linear interpolation shows direction instead of highlighting the days you forgot.",
      },
      tradeoff: {
        he: "הקו מציג ערכים שלא נמדדו. ההערה מתחת לגרף אומרת את זה במפורש.",
        en: "The line shows values that were never measured; a note under the chart says so plainly.",
      },
    },
  ],
  gallery: [
    {
      route: "calendar",
      caption: { he: "לוח החודש: שקילות, חזרזירים ואימונים", en: "The month: weigh-ins, pigs and workouts" },
    },
    {
      route: "trends",
      caption: { he: "מגמת המשקל לאורך החודש, עם ספירת החותמות", en: "Weight across the month, with the stamp counts" },
    },
  ],
};

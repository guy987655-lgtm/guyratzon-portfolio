import type { L10n } from "@/lib/i18n";
import type { ProseSection } from "./how-i-work";

/** Drafted from Guy's master profile; every section needs his read before launch. */
export const about: { title: L10n; lead: L10n; sections: ProseSection[] } = {
  title: { he: "אודות", en: "About" },
  lead: {
    he: "אנליסט דאטה בכיר. הופך דאטה מורכב לסיפור ברור שאפשר לפעול לפיו, ומשלב AI בכל שלב בדרך. TODO(guy): לעבור על כל העמוד",
    en: "Senior data analyst. I turn complex data into clear stories people can act on, with AI woven into every step. TODO(guy): review this whole page",
  },
  sections: [
    {
      id: "path",
      title: { he: "איך הגעתי לדאטה", en: "How I got to data" },
      body: {
        he: "התחלתי כאנליסט פיננסי בעולם האשראי והחיתום, שם למדתי לקרוא מספרים שמישהו מקבל לפיהם החלטה על כסף. ב-FrontStory, חברת מדיה דיגיטלית, הייתי האנליסט היחיד — בלי מנטור, עם הרבה דאטה ושאלות אמיתיות. שם הובלתי, יחד עם מפתח, פרויקט אוטומציה שפתח וסגר ניסויי מונטיזציה לפי ביצועים כדי להתמודד עם עונתיות.\n\nמ-2022 אני אנליסט מוצר ב-Artlist, בצוות הליבה. אני מוביל פיצ'רים מקצה לקצה מבחינת הדאטה: מגדיר מדדים ויעדים, כותב את מפרט האירועים, מתכנן ניסויי A/B, ועוקב אחרי ההשקה בדשבורדים יומיים. במקביל אני חונך אנליסטים חדשים בפרויקטים הראשונים שלהם.",
        en: "I started as a financial analyst in credit and underwriting, where I learned to read numbers someone makes a money decision on. At FrontStory, a digital media company, I was the only analyst — no mentor, plenty of data, real questions. There, with a developer, I led an automation project that opened and closed monetization tests by performance to handle seasonality.\n\nSince 2022 I've been a product analyst on Artlist's core team. I own features end to end on the data side: metrics and goals, the event spec, A/B test design, and launch monitoring through daily dashboards. I also mentor new analysts through their first projects.",
      },
    },
    {
      id: "interests",
      title: { he: "מה מעניין אותי", en: "What interests me" },
      body: {
        he: "הרגע שבו מספר משנה החלטה. ניסויים שמתוכננים כמו שצריך מראש — עוצמה סטטיסטית, גודל מדגם וזמן עד מובהקות — כדי שלא ירוצו יותר מדי זמן. וההשפעה של AI על העבודה עצמה: בניתי שכבה סמנטית על Snowflake שמחוברת דרך MCP, כך שאנליסטים ואנשי מוצר שואלים שאלות על תחום שלם בלי לכתוב כל שאילתה מאפס.\n\nהפרויקטים באתר הם ההמשך הטבעי: כשחסר לי כלי, אני בונה אותו, מודד אותו, ומשתמש בו.",
        en: "The moment a number changes a decision. Experiments planned properly up front — power, sample size, time to significance — so they don't run longer than they should. And what AI does to the work itself: I built a semantic layer on Snowflake, connected through MCP, so analysts and product people can question a whole area without writing every query from scratch.\n\nThe projects on this site are the natural next step: when I'm missing a tool, I build it, measure it, and use it.",
      },
    },
    {
      id: "next",
      title: { he: "מה אני מחפש", en: "What I'm looking for" },
      body: {
        he: "תפקיד של אנליסט דאטה בכיר, או תפקיד ב-Data Product או במונטיזציה של מוצר — בצוות שבו הדאטה משפיע על ההחלטות, ועם מקום לשלב AI בעבודה. TODO(guy): לאשר",
        en: "A senior data analyst role, or one in data product or product monetization — on a team where data shapes decisions, with room to bring AI into the work. TODO(guy): confirm",
      },
    },
  ],
};

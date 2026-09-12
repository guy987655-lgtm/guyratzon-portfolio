import type { Project } from "../types";

/**
 * IBI is shown ONLY through manual screenshots of a fully invented portfolio (no live link, no
 * manifest endpoint). Never mention real amounts, holdings, securities or dates of trades here.
 */
export const ibi: Project = {
  slug: "ibi",
  title: { he: "תיק ההשקעות ב-IBI", en: "IBI Portfolio Tracker" },
  tagline: { he: "מעקב וניתוח של תיק השקעות אישי", en: "Tracks and analyzes a personal investment portfolio" },
  depth: "full",
  stack: ["JavaScript", "uPlot", "Python", "Vercel Functions", "Yahoo Finance"],
  builtAt: "2026-07-20",
  usage: {
    he: "כלי שבניתי לעצמי ומשתמש בו מאז יולי 2026. הנתונים שלו מתעדכנים כמעט כל יום.",
    en: "A tool I built for myself and have used since July 2026, with data refreshed almost daily.",
  },
  interfaceLocales: ["he"],
  cardFact: {
    he: "שש לשוניות, מהיום הנוכחי ועד תזרים חודשי",
    en: "Six tabs, from today's moves to monthly cash flow",
  },
  overview: {
    he: "דשבורד פרטי שמרכז את תיק ההשקעות שלי: שווי, תשואה, אחזקות, דיבידנדים ותזרים, עם מחירים שמתעדכנים במהלך יום המסחר. הוא נבנה לשימוש אישי, וכאן הוא מוצג על תיק בדוי לגמרי.",
    en: "A private dashboard for my investment portfolio: value, returns, holdings, dividends and cash flow, with prices that update during the trading day. It was built for personal use; here it runs on an entirely made-up portfolio.",
  },
  peek: [
    {
      he: "דוחות גולמיים מהברוקר עוברים נירמול בסקריפט פייתון מקומי לקובץ נתונים אחד.",
      en: "Raw broker reports are normalized by a local Python script into a single data file.",
    },
    {
      he: "רווח ממומש מחושב בשיטת FIFO, ורווח 'על הנייר' רק על הכמות שעוד פתוחה.",
      en: "Realized gains use FIFO; paper gains count only the quantity still open.",
    },
    {
      he: "כל נייר מקבל גרף מול מדד ייחוס, עם סימון של כל קנייה, מכירה ודיבידנד.",
      en: "Each security gets a chart against a benchmark, with every buy, sell and dividend marked.",
    },
  ],
  problem: {
    he: "אתר הברוקר מראה את המצב הנוכחי, אבל לא עונה על השאלות שבאמת מעניינות: כמה הרווחתי מכל נייר אחרי עמלות, איך התיק התנהג מול מדד, וכמה ריבית ודיבידנדים נכנסו בכל חודש.",
    en: "The broker's site shows where things stand, but not the questions that matter: what each security really earned after fees, how the portfolio did against a benchmark, and how much interest and dividend income arrived each month.",
  },
  approach: {
    he: "סקריפטים מקומיים בפייתון קוראים את דוחות התנועות ותמונות המצב של הברוקר, מנרמלים אותם לקובץ אחד, ומשלימים היסטוריית מחירים לכל נייר. הממשק כתוב ב-JavaScript נקי עם uPlot, בלי framework, ופונקציות קטנות בוורסל מביאות מחירים חיים.\n\nהחישובים רצים בדפדפן: שווי התיק לאורך זמן מתוך התנועות והמחירים, רווח ממומש לפי FIFO, זיהוי מכירות שהן בעצם רוטציה בין ניירות, ופירוק של התשואה לרווח הון, דיבידנדים וריבית.",
    en: "Local Python scripts read the broker's transaction reports and snapshots, normalize them into one file, and backfill a price history for every security. The interface is plain JavaScript with uPlot, no framework, and small Vercel functions fetch live prices.\n\nThe math runs in the browser: portfolio value over time from transactions and prices, FIFO realized gains, spotting sales that were really a rotation between securities, and splitting returns into capital gains, dividends and interest.",
  },
  diagram: "ibi-pipeline",
  decisions: [
    {
      id: "ibi-no-framework",
      title: { he: "JavaScript נקי במקום framework", en: "Plain JavaScript instead of a framework" },
      why: {
        he: "דף אחד שנטען מהר ומתעדכן פעם ביום לא צריך build ולא ניהול state. uPlot מצייר אלפי נקודות בלי להתאמץ, גם בטלפון.",
        en: "One page that loads fast and updates once a day needs no build step or state management. uPlot draws thousands of points effortlessly, even on a phone.",
      },
      tradeoff: {
        he: "ככל שנוספו לשוניות, הקוד גדל לקובץ של יותר מ-2,000 שורות שקשה לנווט בו.",
        en: "As tabs piled up, the code grew into a 2,000-plus-line file that's hard to navigate.",
      },
    },
    {
      id: "ibi-local-pipeline",
      title: { he: "צנרת נתונים שרצה אצלי", en: "A data pipeline that runs on my machine" },
      why: {
        he: "דוחות הברוקר נשארים במחשב שלי. לענן מגיע רק קובץ הנתונים המעובד, מאחורי מפתח גישה. TODO(guy): לאשר אחרי תיקון החשיפה בדשבורד",
        en: "Broker reports stay on my machine. Only the processed data file reaches the cloud, behind an access key. TODO(guy): confirm after the dashboard exposure fix",
      },
      tradeoff: {
        he: "העדכון תלוי בי: יום שלא הרצתי את הסקריפט הוא יום שבו הדשבורד מראה נתונים של אתמול.",
        en: "Updates depend on me: a day I don't run the script is a day the dashboard shows yesterday.",
      },
    },
    {
      id: "ibi-rotation",
      title: { he: "מכירה שהיא בעצם החלפה", en: "A sale that's really a swap" },
      why: {
        he: "מכירה של נייר וקנייה של נייר אחר באותם ימים ובסכום דומה היא החלטת הקצאה, לא 'מימוש רווח'. הדשבורד מזהה צמדים כאלה לפי חלון זמן ויחס גודל, ומציג אותם בנפרד.",
        en: "Selling one security and buying another within days, for a similar amount, is an allocation decision, not 'taking profit'. The dashboard detects such pairs by time window and size ratio and shows them separately.",
      },
      tradeoff: {
        he: "הכלל הוא היוריסטיקה עם שני ספים שבחרתי ידנית, ולכן יש מקרי קצה שהוא מסווג לא נכון.",
        en: "It's a heuristic with two hand-picked thresholds, so some edge cases get misclassified.",
      },
    },
  ],
  whatBroke: {
    he: "הפונקציה בוורסל שהביאה היסטוריית מחירים מ-Yahoo Finance עבדה מצוין מקומית ונכשלה בפרודקשן: Yahoo חוסם בקשות משרתי הענן של Vercel. במקום להילחם בחסימה, הפרדתי בין שני סוגי הנתונים. היסטוריה נאספת דרך הדפדפן, שבו Yahoo עונה, ונשמרת כקובץ סטטי. הפונקציה בענן נשארה רק למחירים של היום.",
    en: "The Vercel function that fetched price history from Yahoo Finance worked locally and failed in production: Yahoo blocks requests from Vercel's cloud servers. Rather than fight the block, I split the two kinds of data. History is harvested through the browser, where Yahoo answers, and saved as a static file. The cloud function now handles only today's prices.",
  },
  gallery: [
    {
      route: "overview",
      caption: { he: "מבט-על: שווי התיק לאורך זמן, הקצאה ואחזקות", en: "Overview: portfolio value over time, allocation and holdings" },
    },
    {
      route: "today",
      caption: { he: "היום: שינוי יומי לכל נייר ודיבידנדים קרובים", en: "Today: the daily move for each security and upcoming dividends" },
    },
    {
      route: "instrument",
      caption: { he: "נייר בודד: גרף מחיר מול מדד, עם כל קנייה ומכירה מסומנת", en: "Single security: price against a benchmark, every trade marked" },
    },
    {
      route: "cashflow",
      caption: { he: "תזרים: ריבית ודיבידנדים חודש אחרי חודש", en: "Cash flow: interest and dividends, month by month" },
    },
  ],
};

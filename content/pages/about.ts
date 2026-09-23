import type { L10n } from "@/lib/i18n";
import type { ProseSection } from "./how-i-work";

export const about: { title: L10n; lead: L10n; sections: ProseSection[] } = {
  title: { he: "אודות", en: "About" },
  lead: {
    he: "אנליסט דאטה בכיר. הופך דאטה מורכב לסיפור ברור שאפשר לפעול לפיו, ומשלב AI בכל שלב בדרך.",
    en: "Senior data analyst. I turn complex data into clear stories people can act on, with AI woven into every step.",
  },
  sections: [
    {
      id: "path",
      title: { he: "איך הגעתי לדאטה", en: "How I got to data" },
      body: {
        he: "התחלתי כאנליסט פיננסי בחיתום אשראי. אליי הגיעו העסקאות האפורות - אלה שלא עוברות אישור אוטומטי - ותפקידי היה להעריך את רמת הסיכון ולהחליט אם לאשר אותן. זו הייתה עבודה אנליטית במהותה, אבל הטכנולוגיה סביבה הייתה בסיסית, ורציתי לעשות את אותה עבודה עם דאטה וכלים ברמה אחרת.\n\nלכן יצאתי ללמוד דאטה אנליטיקס, ועוד במהלך הקורס הצטרפתי לסטארט-אפ FrontStory כאנליסט הדאטה הראשון בחברה.",
        en: "I started as a financial analyst in credit underwriting. The gray-area deals - the ones that don't clear automatic approval - came to me, and my job was to assess the risk and decide whether to approve them. The work was analytical at its core, but the technology around it was basic, and I wanted to do the same work with far better data and tools.\n\nSo I went to study data analytics, and while still in the course I joined the startup FrontStory as its first data analyst.",
      },
    },
    {
      id: "career",
      title: { he: "2017-2026: מוניטיזציה ומוצר", en: "2017-2026: monetization and product" },
      body: {
        he: "ב-FrontStory עבדתי במחלקת המוניטיזציה, על מקסום הערך מכל משתמש. בצד הגלוי - מבנה האתרים ומיקום הפרסומות, כך שכל סשן ייצר יותר חשיפות. מאחורי הקלעים - תזמון הצגת המודעות וקביעה אילו מפרסמים מתחרים על כל מקום, הכול לפי סגמנטים של מדינה, מכשיר וקמפיין. כדי לעשות את זה בקנה מידה, בניתי מערכת שפותחת ניסויים אוטומטית ובוחרת מנצח בכל מחזור. בשנה הראשונה היא הכניסה כמיליון דולר.\n\nאחרי יותר מארבע שנים של השפעה ישירה על הרווח, רציתי לעבוד במחלקת דאטה בוגרת לצד אנליסטים סניורים, ועברתי ל-Artlist. עקומת הלמידה הייתה תלולה - וזה בדיוק מה שחיפשתי. בשלב הראשון התמקדתי במשתמשים שעוד לא משלמים: החוויה הראשונה במוצר, מה מביא אותם לעמוד המחירים, ומה הופך ביקור בעמוד התשלום למנוי. בשלב השני עברתי לליבת המוצר ולמשתמשים המשלמים: איך הם מאמצים פיצ'רים, מה מעמיק את השימוש, ואיך כל זה מתורגם לשימור. לאורך הדרך הובלתי פיצ'רים מקצה לקצה בצד הדאטה - מדדים, מפרט אירועים, ניסויי A/B ודשבורדי השקה - וחנכתי אנליסטים חדשים.",
        en: "At FrontStory I worked in monetization, on getting the most value out of every user. On the visible side, that meant site layout and ad placement, so each session produced more impressions. Behind the scenes, it meant ad timing and deciding which advertisers compete for each slot - all by segments of country, device and campaign. To do this at scale, I built a system that opens tests automatically and picks a winner every cycle. In its first year it brought in about $1M.\n\nAfter more than four years of direct impact on profit, I wanted a mature data department and senior analysts to learn from, so I moved to Artlist. The learning curve was steep - exactly what I was after. First I focused on users who don't pay yet: the first experience in the product, what brings them to the pricing page, and what turns a checkout visit into a subscription. Then I moved to the core product and paying users: how they adopt features, what deepens usage, and how all of it translates into retention. Throughout, I owned features end to end on the data side - metrics, event specs, A/B tests and launch dashboards - and mentored new analysts.",
      },
    },
    {
      id: "interests",
      title: { he: "מה מעניין אותי היום", en: "What interests me today" },
      body: {
        he: "עבודת דאטה שבה AI הוא חלק מהתשתית, ולא כלי צדדי. התפקיד של האנליסט כבר לא להחזיק את המשקפת ולדווח מה ראה, אלא לבנות את המשקפות לשאר הארגון. בפועל זה אומר שכבה סמנטית מעל מחסן הנתונים, שמגדירה מה כל מדד אומר ואיך סופרים אותו ומחוברת דרך MCP, כך שאנשי מוצר ואנליסטים מתחקרים תחום שלם בשפה טבעית; וסקילים וסוכנים לתהליכים שחוזרים על עצמם, כך שהידע לא נשאר אצלי אלא הופך לכלי self-serve שאחרים סומכים עליו.\n\nמה שלא משתנה הוא החלק האנושי: להחליט מה שואלים, לוודא שהמספר אמין, ולהפוך ממצאים לסיפור שמוביל להחלטה. ה-AI מקצר את הדרך מהשאלה לנתון - הוא לא בונה את הטיעון.",
        en: "Data work where AI is part of the infrastructure, not a tool on the side. An analyst's job is no longer to hold the binoculars and report what they saw, but to build the binoculars for everyone else. In practice that means a semantic layer over the warehouse that defines what each metric means and how it's counted, connected through MCP so product people and analysts can question a whole domain in plain language; and skills and agents for the processes that repeat, so the knowledge doesn't stay with me but becomes a self-serve tool others can trust.\n\nWhat doesn't change is the human part: deciding what to ask, making sure the number is trustworthy, and turning findings into a story that leads to a decision. AI shortens the path from question to number - it doesn't build the argument.",
      },
    },
    {
      id: "next",
      title: { he: "לאן זה הולך", en: "Where this is going" },
      body: {
        he: "היום אני לומד באינטנסיביות את עולם ה-AI, ובעיקר את תחום ה-AI analytics - גם באופן עצמאי, דרך מסלולי ההסמכה של Anthropic ו-OpenAI והפרויקטים שבאתר הזה, וגם בקורס על אפיון והטמעה של אוטומציות AI.\n\nהכיוון ברור לי: הצומת שבין AI לאנליטיקה. לא כמי שמשתמש בכלי AI, אלא כמי שבונה את התשתית שהופכת אותם לאמינים מספיק כדי להחליט לפיהם.",
        en: "Right now I'm learning the AI field intensively, AI analytics above all - on my own, through Anthropic's and OpenAI's certification tracks and the projects on this site, and in a course on specifying and implementing AI automations.\n\nThe direction is clear to me: the intersection of AI and analytics. Not as someone who uses AI tools, but as someone who builds the infrastructure that makes them trustworthy enough to decide on.",
      },
    },
  ],
};

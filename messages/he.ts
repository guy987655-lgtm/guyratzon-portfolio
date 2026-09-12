/**
 * Hebrew UI strings — the source of truth for the Messages shape.
 * English must provide exactly the same keys (messages/en.ts is typed against this object).
 */
export const he = {
  meta: {
    siteName: "גיא רצון — תיק עבודות",
    description:
      "תיק העבודות של גיא רצון: חמישה מוצרים שבניתי, איך בניתי אותם, ואיזה החלטות קיבלתי בדרך. כל המסכים מוצגים עם נתוני הדגמה.",
  },
  a11y: {
    skipToContent: "דלג לתוכן",
    mainNav: "ניווט ראשי",
    openMenu: "פתיחת תפריט",
    closeMenu: "סגירת תפריט",
    toggleTheme: "החלפת ערכת צבע",
    languageSwitch: "בחירת שפה",
    close: "סגירה",
    previous: "הקודם",
    next: "הבא",
  },
  nav: {
    work: "עבודות",
    howIWork: "איך אני עובד",
    about: "אודות",
    home: "דף הבית",
    projects: "הפרויקטים",
  },
  footer: {
    linkedin: "לינקדאין",
    email: "מייל",
    note: "נבנה ומתוחזק על ידי גיא רצון. כל המסכים באתר מציגים נתוני הדגמה בלבד.",
  },
  notFound: {
    title: "העמוד לא נמצא",
    body: "הכתובת לא קיימת, או שהעמוד עבר מקום.",
    back: "חזרה לתפריט העבודות",
  },
};

export type Messages = typeof he;

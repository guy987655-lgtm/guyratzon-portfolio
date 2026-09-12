/** Fixed public origin. Never derived from VERCEL_URL, so previews still emit production canonicals. */
export const SITE_URL = (process.env.SITE_URL ?? "https://guyratzon.vercel.app").replace(/\/$/, "");

/** Global indexing switch. Off until Guy approves launch (M11 gate); flipped in M12. */
export const INDEXING = process.env.INDEXING === "true";

export const CONTACT = {
  linkedin: "https://www.linkedin.com/in/guy-ratzon",
  email: "GuyRatzon1@gmail.com",
} as const;

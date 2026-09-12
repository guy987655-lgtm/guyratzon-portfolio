export type Theme = "light" | "dark";

export const THEME_KEY = "theme"; // localStorage — set only by the header toggle
export const QR_THEME_KEY = "qrTheme"; // sessionStorage — from the QR link's ?t=
export const SOURCE_KEY = "src"; // sessionStorage — from the QR link's ?s= (read by analytics)

/**
 * Runs in <head> during HTML parsing, before first paint.
 * 1. Captures ?t= and ?s= from the QR link into sessionStorage and strips them from the URL.
 * 2. Applies the theme: toggle choice → QR theme → (nothing; CSS follows the OS).
 */
export const THEME_SCRIPT = `(function(){try{var d=document.documentElement,u=new URL(location.href),p=u.searchParams,ss=sessionStorage,c=0,t=p.get("t"),s=p.get("s");if(t==="light"||t==="dark"){ss.setItem("${QR_THEME_KEY}",t);p.delete("t");c=1}if(s&&/^[a-z]{1,16}$/.test(s)){ss.setItem("${SOURCE_KEY}",s);p.delete("s");c=1}var v=localStorage.getItem("${THEME_KEY}")||ss.getItem("${QR_THEME_KEY}");if(v==="light"||v==="dark")d.setAttribute("data-theme",v);if(c){var q=p.toString();history.replaceState(history.state,"",u.pathname+(q?"?"+q:"")+u.hash)}}catch(e){}})()`;

/** The theme currently in effect, whether chosen explicitly or inherited from the OS. */
export function currentTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

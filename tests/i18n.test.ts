import { describe, expect, it } from "vitest";
import { alternatePath, isFallback, localizePath, negotiate, splitLocale, tr } from "@/lib/i18n";

describe("negotiate", () => {
  it("defaults to Hebrew without a header", () => {
    expect(negotiate(null)).toBe("he");
    expect(negotiate("")).toBe("he");
  });
  it("respects q-values and order", () => {
    expect(negotiate("en-US,en;q=0.9")).toBe("en");
    expect(negotiate("fr-FR,en;q=0.5,he;q=0.8")).toBe("he");
    expect(negotiate("he-IL,en;q=0.9")).toBe("he");
    expect(negotiate("en;q=0.2,he;q=0")).toBe("en");
  });
  it("treats legacy iw as Hebrew and falls back for unknown languages", () => {
    expect(negotiate("iw")).toBe("he");
    expect(negotiate("de-DE,fr")).toBe("he");
  });
});

describe("paths", () => {
  it("splits and prefixes", () => {
    expect(splitLocale("/he/work/specv")).toEqual({ locale: "he", rest: "/work/specv" });
    expect(splitLocale("/en")).toEqual({ locale: "en", rest: "/" });
    expect(splitLocale("/hello")).toEqual({ locale: null, rest: "/hello" });
    expect(localizePath("/", "en")).toBe("/en");
    expect(localizePath("/work/tape", "he")).toBe("/he/work/tape");
  });
  it("maps a page to the same page in the other language", () => {
    expect(alternatePath("/he/work/specv/data", "en")).toBe("/en/work/specv/data");
    expect(alternatePath("/en", "he")).toBe("/he");
  });
});

describe("tr", () => {
  it("falls back to Hebrew when English is empty", () => {
    expect(tr({ he: "שלום", en: "" }, "en")).toBe("שלום");
    expect(isFallback({ he: "שלום", en: " " }, "en")).toBe(true);
    expect(tr({ he: "שלום", en: "Hello" }, "en")).toBe("Hello");
    expect(isFallback({ he: "שלום", en: "Hello" }, "he")).toBe(false);
  });
});

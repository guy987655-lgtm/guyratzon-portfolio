import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("language routing", () => {
  test("/ follows Accept-Language, then the cookie wins", async ({ browser }) => {
    const en = await browser.newContext({ extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" } });
    const page = await en.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await en.addCookies([{ name: "locale", value: "he", url: page.url() }]);
    await page.goto("/");
    await expect(page).toHaveURL(/\/he$/);
    await en.close();
  });

  test("lang and dir follow the locale", async ({ page }) => {
    await page.goto("/he");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "he");
    await page.goto("/en/work/tape");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("the switch keeps the page", async ({ page, isMobile }) => {
    await page.goto("/he/work/specv");
    if (isMobile) await page.getByRole("button", { name: "פתיחת תפריט" }).click();
    await page.locator('a[hreflang="en"]:visible').first().click();
    await expect(page).toHaveURL(/\/en\/work\/specv$/);
  });

  test("unknown pages 404", async ({ request }) => {
    expect((await request.get("/he/work/nope")).status()).toBe(404);
    expect((await request.get("/en/nothing-here")).status()).toBe(404);
  });
});

test.describe("works without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("menu cards and project stories are plain HTML", async ({ page }) => {
    await page.goto("/en");
    const links = page.locator('a[href^="/en/work/"]');
    expect(await links.count()).toBeGreaterThanOrEqual(5);
    await page.goto("/en/work/specv");
    await expect(page.getByText("A change report, not just polished text")).toBeVisible();
    await expect(page.locator("details").first()).toBeAttached();
    await expect(page.getByText("A user finished the whole flow")).toBeVisible();
  });
});

test.describe("interactions", () => {
  test("quick look opens, closes on Esc, and returns focus", async ({ page }) => {
    await page.goto("/en");
    const trigger = page.locator('[data-peek-trigger="tape"]');
    await trigger.click();
    const dialog = page.locator("dialog[data-peek]");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Tape Calculator" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("gallery steps forward in RTL", async ({ page }) => {
    await page.goto("/he/work/specv");
    await page.locator("#gallery").getByRole("button", { name: "הבא" }).click();
    await expect(page.locator("#gallery").getByText("מסך 2 מתוך")).toBeVisible();
  });
});

test.describe("indexing", () => {
  test("every page is noindex before launch", async ({ request }) => {
    const res = await request.get("/he");
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
  });

  test("/_review is noindex and never in the sitemap", async ({ request }) => {
    const review = await request.get("/_review");
    expect(review.headers()["x-robots-tag"]).toContain("noindex");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("_review");
    expect(sitemap).toContain("/en/work/specv/data");
  });
});

for (const theme of ["light", "dark"] as const) {
  for (const path of ["/he", "/en", "/he/work/specv", "/en/work/specv/data", "/he/about"]) {
    test(`a11y ${path} (${theme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
    });
  }
}

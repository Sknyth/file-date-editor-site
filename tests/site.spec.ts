import { expect, test } from "@playwright/test";

test("edits all demo dates, randomizes seconds, and restores the original snapshot", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Your files\.\s*Your timeline\./);
  const fields = page.locator(".demo input[type=datetime-local]");
  const initial = await fields.evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  for (const [index, value] of ["2026-01-01T10:30", "2026-01-02T11:31", "2026-01-03T12:32"].entries()) {
    await fields.nth(index).fill(value);
  }
  await page.evaluate(() => { Math.random = () => 0.5; });
  await page.getByRole("switch", { name: /Random Seconds/ }).check();
  await page.getByRole("button", { name: "Apply changes" }).click();
  await expect(page.getByText("Sample timestamps updated.")).toBeVisible();
  await expect(page.locator("time[data-changed=true]")).toHaveCount(3);
  await expect(fields.first()).toHaveValue("2026-01-01T10:30:30");
  await expect(fields.last()).toHaveValue("2026-01-03T12:32:30");
  await page.getByRole("button", { name: "Restore original timestamps" }).click();
  await expect(page.getByText("Original timestamps restored.")).toBeVisible();
  await expect(fields.first()).toHaveValue(initial[0]);
  await expect(fields.last()).toHaveValue(initial[2]);
  await expect(page.locator("time[data-changed=true]")).toHaveCount(0);
  await expect(page.getByRole("switch")).not.toBeChecked();
});

test("renders verified asset fields, recommends the OS, and filters architectures", async ({ browser }) => {
  const page = await browser.newPage({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/135.0 Safari/537.36" });
  await page.goto("/download");
  const windows = page.locator("#windows");
  const mac = page.locator("#mac");
  await expect(windows.getByText("Detected on this device")).toBeVisible();
  await expect(mac.getByRole("heading", { name: "Universal · DMG installer" })).toBeVisible();
  await expect(mac.getByText("macOS 14", { exact: true })).toBeVisible();
  await expect(mac.getByText("24", { exact: true })).toBeVisible();
  await mac.getByText("SHA-256 checksum").click();
  await expect(mac.locator("code")).toHaveText("a".repeat(64));
  await expect(mac.getByRole("link", { name: "Download File Date Editor.dmg" })).toHaveAttribute("href", /^https:\/\/github\.com\/fde-test\/fixture\/releases\/download\/v99\.2\.0\//);
  await windows.getByLabel("Choose architecture").selectOption("arm64");
  await expect(windows.getByRole("heading", { name: "ARM64 · Portable ZIP" })).toBeVisible();
  await expect(windows.getByRole("heading", { name: "x64 · Setup installer" })).toHaveCount(0);
  await expect(page.getByText("Foreign-linux-x64.exe")).toHaveCount(0);
  await expect(page.getByText("FileDateEditor-darwin-x64.zip")).toHaveCount(0);
  await page.close();
});

test("shows stable release history across pages and safely renders Markdown", async ({ page }) => {
  await page.goto("/changelog");
  await expect(page.getByRole("heading", { name: "v99.2.0" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "v99.1.0" })).toBeVisible();
  await expect(page.getByText("v99.3.0-beta")).toHaveCount(0);
  await expect(page.getByText("v100.0.0-draft")).toHaveCount(0);
  for (const heading of ["New features", "Improvements", "Bug fixes", "Release notes"]) {
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
  await expect(page.getByText("Batch timestamp editing")).toBeVisible();
  await expect(page.getByRole("link", { name: "release information" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Unsafe address" })).toHaveCount(0);
  await expect(page.locator('img[src*="tracking.png"]')).toHaveCount(0);
});

test("mobile navigation, localization, FAQ keyboard interaction, and persistent theme work", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 850 });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  const header = page.locator("header");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await header.getByRole("button", { name: "Switch color theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await header.locator(".mobile-menu summary").click();
  await header.getByRole("link", { name: "FAQ" }).click();
  await expect(page).toHaveURL(/#faq$/);
  const first = page.locator("summary").filter({ hasText: "What is File Date Editor?" });
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/It is a desktop utility/)).toBeVisible();
  await header.locator(".language-menu summary").click();
  await header.getByRole("link", { name: "Русский" }).click();
  await expect(page).toHaveURL(/\/ru#faq$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  await page.goto("/ro/terms");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Condiții de utilizare.");
});

test("all localized URLs and SEO assets respond", async ({ request }) => {
  for (const locale of ["", "/ru", "/ro"]) {
    for (const slug of ["", "/download", "/changelog", "/privacy", "/terms"]) {
      const path = locale + slug || "/";
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const html = await response.text();
      const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
      expect(canonical ? new URL(canonical).href : undefined, path)
        .toBe(new URL(path, "https://file-date-editor.example").href);
      expect(html).toContain('hrefLang="x-default"');
    }
    const response = await request.get(`${locale}/opengraph-image`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
  expect((await request.get("/en/download", { maxRedirects: 0 })).status()).toBe(308);
  expect((await request.get("/not-a-real-page")).status()).toBe(404);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://file-date-editor.example/ro/download");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("https://file-date-editor.example/sitemap.xml");
  expect((await request.get("/favicon.png")).status()).toBe(200);
});

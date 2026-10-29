const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const assert = require("node:assert/strict");
(async () => {
  const { projects, profile } = await import("../content/portfolio.mjs");
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  for (const width of [320, 390, 767, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("http://127.0.0.1:4173/");
    await page.evaluate(() => document.fonts.ready);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}`,
    );
    assert.equal(
      await page.locator(".project-card:visible").count(),
      projects.length,
    );
    if (width === 390) {
      await page.getByRole("button", { name: "Menu" }).click();
      await page
        .locator("#site-nav")
        .getByRole("link", { name: "About", exact: true })
        .click();
      assert.equal(
        await page
          .getByRole("button", { name: "Menu" })
          .getAttribute("aria-expanded"),
        "false",
      );
      await page.getByRole("button", { name: "Menu" }).click();
      await page.keyboard.press("Escape");
      assert.equal(
        await page
          .getByRole("button", { name: "Menu" })
          .getAttribute("aria-expanded"),
        "false",
      );
    }
    for (const category of [
      "All",
      ...new Set(projects.map((project) => project.category)),
      "All",
    ]) {
      await page
        .getByRole("button", {
          name: category === "All" ? /^All/ : category,
          exact: category !== "All",
        })
        .click();
      assert.deepEqual(
        await page
          .locator(".project-card:visible .project-link")
          .evaluateAll((links) =>
            links.map((link) => link.getAttribute("href")),
          ),
        projects
          .filter(
            (project) => category === "All" || project.category === category,
          )
          .map((project) => `/projects/${project.slug}/`),
        `project order for ${category} at ${width}`,
      );
    }
    await page.locator(".older-experience summary").click();
    assert.equal(await page.locator(".experience-item:visible").count(), 7);
    await page.waitForTimeout(950);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      results.violations.map((x) => ({
        id: x.id,
        nodes: x.nodes.map((n) => n.target),
      })),
      [],
      `axe at ${width}`,
    );
    if ([390, 1440].includes(width)) {
      await page.goto("http://127.0.0.1:4173/");
      await page.waitForTimeout(950);
      for (const img of await page
        .locator(".store-previews img, .project-cover")
        .all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate((element) => element.decode());
      }
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: `/tmp/portfolio-${width}.png`,
        fullPage: true,
      });
    }
    console.log(
      `PASS ${width}px: layout, filters, project order, experience, accessibility`,
    );
  }
  for (const slug of projects.map((project) => project.slug)) {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`http://127.0.0.1:4173/projects/${slug}/`);
      await page.reload();
      assert.equal(await page.locator("h1").count(), 1);
      if (slug === "manyoption" && width === 320) {
        assert.ok(
          await page
            .locator("h1")
            .evaluate(
              (element) =>
                element.clientHeight <=
                parseFloat(getComputedStyle(element).lineHeight) + 1,
            ),
          "ManyOption title should fit one line at 320px",
        );
      }
      for (const img of await page.locator(".project-detail img").all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate((element) => element.decode());
        assert.ok(await img.evaluate((element) => element.naturalWidth > 0));
      }
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `detail overflow ${slug} at ${width}`,
      );
      const galleryImage = page.locator("[data-gallery-image]").first();
      if (await galleryImage.count()) {
        const url = await galleryImage.getAttribute("href");
        await galleryImage.click();
        const dialog = page.getByRole("dialog", {
          name: "Project image preview",
        });
        await dialog.waitFor();
        assert.ok(
          await dialog.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            return (
              bounds.left >= 0 &&
              bounds.right <= innerWidth &&
              bounds.top >= 0 &&
              bounds.bottom <= innerHeight
            );
          }),
          `popup fits viewport at ${width}`,
        );
        assert.equal(
          await dialog.locator("img").getAttribute("src"),
          `http://127.0.0.1:4173${url}`,
        );
        await dialog.locator("img").evaluate((element) => element.decode());
        assert.equal(
          await page
            .locator(".gallery-grid")
            .getByText("View full image")
            .count(),
          0,
        );
        if (slug === "tokodistributor") {
          const popupAxe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze();
          assert.deepEqual(
            popupAxe.violations.map((v) => v.id),
            [],
            `popup accessibility at ${width}`,
          );
          await page.screenshot({
            path: `/tmp/portfolio-gallery-popup-${width}.png`,
          });
        }
        await page.keyboard.press("Escape");
        assert.equal(await dialog.isVisible(), false);
        assert.ok(
          await galleryImage.evaluate(
            (element) => element === document.activeElement,
          ),
          "gallery focus restored after Escape",
        );
        await page.keyboard.press("Enter");
        await dialog.getByRole("button", { name: "Close ×" }).click();
        assert.equal(await dialog.isVisible(), false);
        await galleryImage.click();
        await page.mouse.click(2, 2);
        assert.equal(await dialog.isVisible(), false, "backdrop closes popup");
      }
      if (["batian", "manyoption", "tokodistributor"].includes(slug)) {
        await page.evaluate(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
        await page.screenshot({
          path: `/tmp/portfolio-${slug}-${width}.png`,
          fullPage: true,
        });
      }
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        [],
        `detail accessibility ${slug} at ${width}`,
      );
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4173/");
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  const nojs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  });
  const fallback = await nojs.newPage();
  await fallback.goto("http://127.0.0.1:4173/");
  assert.equal(
    await fallback.locator(".project-card:visible").count(),
    projects.length,
  );
  assert.equal(await fallback.locator("#site-nav a:visible").count(), 4);
  await fallback.evaluate(() => document.fonts.ready);
  assert.ok(
    await fallback.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "no-JS overflow",
  );
  await fallback.goto("http://127.0.0.1:4173/projects/tokodistributor/");
  const fallbackImage = fallback.locator("[data-gallery-image]").first();
  const fallbackUrl = await fallbackImage.getAttribute("href");
  await fallbackImage.click();
  assert.equal(
    new URL(fallback.url()).pathname,
    fallbackUrl,
    "image links work without JavaScript",
  );
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => {} },
    });
  });
  await page.getByRole("button", { name: "Copy email" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Email copied. Say hello!" })
    .waitFor();
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw Error("denied");
    };
  });
  await page.getByRole("button", { name: "Copy email" }).click();
  await page
    .getByRole("status")
    .filter({
      hasText: `Couldn’t copy automatically. Email: ${profile.email}`,
    })
    .waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS static detail refresh, reduced motion, no-JS navigation, no runtime/network errors",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { expect, test } from "@playwright/test";

test("default pagination excludes auxiliary regions and follows selection", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
  await page.evaluate(() => {
    window.atlas.update({ groupRegions: false, contain: false });
    const extra = document.createElement("section");
    extra.dataset.atlasRegion = "second";
    window.atlas.track.insertBefore(
      extra,
      window.atlas.track.querySelector("[data-atlas-trailing]"),
    );
    window.atlas.refresh();
  });
  const dots = page.locator("[data-atlas-page-dots] button");
  await expect(dots).toHaveCount(2);
  await dots.nth(1).click();
  await expect(dots.nth(1)).toHaveAttribute("aria-current", "page");
  await dots.nth(1).press("Home");
  await expect(dots.nth(0)).toBeFocused();
  await expect(dots.nth(0)).toHaveAttribute("aria-current", "page");
  await page.evaluate(() => window.atlas.goTo("leading", { instant: true }));
  await expect(
    page.locator("[data-atlas-page-dots] [aria-current]"),
  ).toHaveCount(0);
  await page.evaluate(() => {
    window.atlas.track
      .querySelector("[data-atlas-leading]")!
      .setAttribute("data-atlas-pagination", "true");
  });
  await expect(dots).toHaveCount(3);
  await page.evaluate(() => window.atlas.update({ pagination: false }));
  await expect(page.locator("[data-atlas-footer-navigation]")).toHaveCount(0);
  await page.evaluate(() => window.atlas.destroy());
  await expect(page.locator("[data-atlas-page-dots]")).toHaveCount(0);
});

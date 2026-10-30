import { expect, test } from "@playwright/test";

for (const direction of ["ltr", "rtl"] as const) {
  test(`live overview restores input and navigates ${direction}`, async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
    await page.evaluate(
      (direction) => window.atlas.update({ direction }),
      direction,
    );
    const toggle = page.locator("[data-atlas-overview-toggle]");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-atlas-track]").first()).toHaveAttribute(
      "inert",
      "",
    );
    await expect(
      page.locator("[data-atlas-overview-overlay] button"),
    ).toHaveCount(3);
    await page
      .locator("[data-atlas-overview-overlay] button")
      .filter({ hasText: "leading" })
      .click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(
      page.locator("[data-atlas-track]").first(),
    ).not.toHaveAttribute("inert", "");
    expect(
      await page.evaluate(() => window.atlas.getState().activeRegion),
    ).toBe("leading");
    await toggle.click();
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
    await expect(page.locator("[data-atlas-overview-overlay]")).toHaveCount(0);
    await toggle.click();
    await page.evaluate(() => window.atlas.destroy());
    await expect(page.locator("[data-atlas-overview-overlay]")).toHaveCount(0);
    await expect(page.locator("[data-atlas-footer-navigation]")).toHaveCount(0);
  });
}

test("React overview survives state updates without a render loop", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?framework=react");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "react");
  const toggle = page.locator("[data-atlas-overview-toggle]");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(errors).toEqual([]);
});

test("custom footer and thumbnail decorations use shared state without duplicate UI", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
  await page.evaluate(() => {
    const footer = document.createElement("footer");
    footer.id = "business-footer";
    footer.style.cssText = "position:relative;height:24px";
    footer.textContent = "Git branch";
    document.body.append(footer);
    window.atlas.update({ pagination: { container: footer } });
  });
  await expect(
    page.locator("#business-footer [data-atlas-footer-navigation]"),
  ).toHaveCount(1);
  await expect(
    page.locator("[data-atlas] > [data-atlas-footer-navigation]"),
  ).toHaveCount(0);
  await page.evaluate(() => {
    window.atlas.update({
      pagination: false,
      overview: { renderOverlay: false },
    });
    window.atlas.overview.enter();
  });
  await expect(page.locator("[data-atlas-footer-navigation]")).toHaveCount(0);
  await expect(page.locator("[data-atlas-overview-overlay]")).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      window.atlas.overview.getState()!.regions.map((region) => region.id),
    ),
  ).toEqual(["leading", "navigation", "workspace"]);
  await page.evaluate(() => window.atlas.overview.exit("workspace"));
  expect(await page.evaluate(() => window.atlas.getState().activeRegion)).toBe(
    "workspace",
  );
});

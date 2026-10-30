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
    await page.evaluate(() => {
      const button = document.createElement("button");
      button.id = "separate-overview";
      button.textContent = "Overview";
      button.onclick = () => window.atlas.overview.toggle();
      document.body.append(button);
    });
    await expect(
      page.locator(
        "[data-atlas-footer-navigation] [data-atlas-overview-toggle]",
      ),
    ).toHaveCount(0);
    const toggle = page.locator("#separate-overview");
    await toggle.click();
    expect(
      await page.evaluate(() => window.atlas.overview.getState() !== null),
    ).toBe(true);
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
    expect(
      await page.evaluate(() => window.atlas.overview.getState()),
    ).toBeNull();
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
  await page.evaluate(() => window.atlas.overview.toggle());
  expect(
    await page.evaluate(() => window.atlas.overview.getState() !== null),
  ).toBe(true);
  await page.evaluate(() => window.atlas.overview.toggle());
  expect(
    await page.evaluate(() => window.atlas.overview.getState()),
  ).toBeNull();
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

test("footer double click toggles generic overview without branding", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
  const bounds = (await page.locator("[data-atlas]").first().boundingBox())!;
  await page.mouse.dblclick(bounds.x + 12, bounds.y + bounds.height - 8);
  expect(await page.evaluate(() => window.atlas.overview.getState())).not.toBeNull();
  await expect(page.locator("[data-atlas-overview-overlay]")).toBeVisible();
  await expect(page.getByText("ALwith the best AI agent", { exact: false })).toHaveCount(0);
  await page.mouse.dblclick(bounds.x + 12, bounds.y + bounds.height - 8);
  expect(await page.evaluate(() => window.atlas.overview.getState())).toBeNull();
});

test("external business footer toggles overview only on empty space", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
  await page.evaluate(() => {
    const footer = document.createElement("footer");
    footer.id = "overview-business-footer";
    footer.style.cssText =
      "position:fixed;bottom:0;left:0;width:100%;height:32px;z-index:100";
    footer.innerHTML = '<button type="button">Business action</button>';
    document.body.append(footer);
    window.atlas.update({
      pagination: false,
      overview: { footer: () => footer, renderOverlay: false },
    });
  });
  await page.getByRole("button", { name: "Business action" }).dblclick();
  expect(await page.evaluate(() => window.atlas.overview.getState())).toBeNull();
  await page
    .locator("#overview-business-footer")
    .dblclick({ position: { x: 250, y: 16 } });
  expect(await page.evaluate(() => window.atlas.overview.getState())).not.toBeNull();
  await page.evaluate(() => window.atlas.destroy());
  expect(await page.evaluate(() => window.atlas.overview.getState())).toBeNull();
  await page
    .locator("#overview-business-footer")
    .dblclick({ position: { x: 250, y: 16 } });
  expect(await page.evaluate(() => window.atlas.overview.getState())).toBeNull();
});

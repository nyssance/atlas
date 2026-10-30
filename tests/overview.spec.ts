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

test("footer double click opens shared branded overview with offline font and independent social links", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
  await page.evaluate(() => {
    window.atlas.update({
      overview: {
        openLink: (url) => {
          document.body.dataset.openedLink = url;
        },
      },
    });
  });
  const root = page.locator("[data-atlas]").first();
  const bounds = (await root.boundingBox())!;
  await page.mouse.dblclick(bounds.x + 12, bounds.y + bounds.height - 8);
  const brand = page.locator("[data-atlas-overview-brand]");
  await expect(brand).toHaveText("ALwith the best AI agent !!");
  await expect(brand).toHaveCSS("font-size", "48px");
  await expect(brand.locator("span").first()).toHaveCSS(
    "color",
    "rgb(124, 58, 237)",
  );
  expect(
    await page.evaluate(async () => {
      await document.fonts.load('48px "Atlas Caveat"');
      return document.fonts.check('48px "Atlas Caveat"');
    }),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("overview.png") });
  const social = page.locator("[data-atlas-overview-social]");
  await expect(social.getByRole("link")).toHaveCount(4);
  await social.getByRole("link", { name: "GitHub", exact: true }).click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-opened-link",
    "https://github.com/ALwith-ai",
  );
  await expect(brand).toBeVisible();
  await page.mouse.dblclick(bounds.x + 12, bounds.y + bounds.height - 8);
  await expect(brand).toHaveCount(0);
  await expect(social).toHaveCount(0);
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
  await expect(page.locator("[data-atlas-overview-brand]")).toHaveCount(0);
  await page
    .locator("#overview-business-footer")
    .dblclick({ position: { x: 250, y: 16 } });
  await expect(page.locator("[data-atlas-overview-brand]")).toBeVisible();
  await page.evaluate(() => window.atlas.destroy());
  await expect(page.locator("[data-atlas-overview-brand]")).toHaveCount(0);
  await page
    .locator("#overview-business-footer")
    .dblclick({ position: { x: 250, y: 16 } });
  await expect(page.locator("[data-atlas-overview-brand]")).toHaveCount(0);
});

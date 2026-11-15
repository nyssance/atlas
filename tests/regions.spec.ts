import { expect, test } from "@playwright/test";

for (const direction of ["ltr", "rtl"] as const) {
  test(`region geometry and overview transform ownership ${direction}`, async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
    const result = await page.evaluate(async (direction) => {
      window.atlas.update({ direction });
      window.atlas.goTo("workspace", { instant: true });
      const before = window.atlas.getGeometry();
      const transform = new DOMMatrix(
        getComputedStyle(window.atlas.track).transform,
      ).m41;
      window.atlas.suspend();
      window.atlas.track.style.transform = "translateX(18px) scale(0.4)";
      window.atlas.update({ gutter: 6 });
      window.atlas.refresh();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const overview = window.atlas.track.style.transform;
      window.atlas.resume(before.selected);
      const after = window.atlas.getGeometry();
      return {
        transform,
        target: before.target,
        offset: before.offsets[before.selected],
        overview,
        resumed: new DOMMatrix(getComputedStyle(window.atlas.track).transform)
          .m41,
        resumedOffset: after.offsets[after.selected],
        region: window.atlas.getState().activeRegion,
      };
    }, direction);
    expect(result.transform).toBeCloseTo(result.offset);
    expect(result.target).toBeCloseTo(result.offset);
    expect(result.overview).toBe("translateX(18px) scale(0.4)");
    expect(result.resumed).toBeCloseTo(result.resumedOffset);
    expect(result.region).toBe("workspace");
  });

  test(`navigation without a leading region and portaled menu retention ${direction}`, async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
    await page.evaluate((direction) => {
      document.querySelector("[data-atlas-leading]")!.remove();
      window.atlas.update({ direction, navigationPinned: false });
    }, direction);
    const root = page.locator("[data-atlas]");
    const box = (await root.boundingBox())!;
    await page.mouse.move(
      direction === "ltr" ? box.x + 2 : box.x + box.width - 2,
      box.y + 100,
    );
    await expect(root).toHaveAttribute("data-atlas-navigation-peeking", "");
    const surface = page.locator("[data-atlas-navigation-surface]");
    await expect(surface).not.toHaveAttribute("inert", "");
    await surface.evaluate((node) => node.setAttribute("data-popup-open", ""));
    await page.mouse.move(box.x + box.width / 2, box.y + 100);
    await page.keyboard.press("Escape");
    await expect(root).toHaveAttribute("data-atlas-navigation-peeking", "");
    await surface.evaluate((node) => node.removeAttribute("data-popup-open"));
    await expect(root).not.toHaveAttribute("data-atlas-navigation-peeking", "");
    await expect(root).toHaveAttribute("data-atlas-navigation-pinned", "false");
  });
}

test("animation does not repeatedly invalidate region accessibility attributes", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
  const result = await page.evaluate(async () => {
    window.atlas.goTo("workspace", { instant: true });
    const regions = window.atlas.getGeometry().regions.filter(node => node.dataset.atlasRegion);
    const records: MutationRecord[] = [];
    const observer = new MutationObserver(batch => records.push(...batch));
    for (const node of regions)
      observer.observe(node, { attributes: true, attributeFilter: ["inert", "aria-hidden"] });
    window.atlas.goTo("leading");
    await new Promise<void>(resolve => {
      const poll = () => window.atlas.getState().moving ? requestAnimationFrame(poll) : resolve();
      requestAnimationFrame(poll);
    });
    records.push(...observer.takeRecords());
    observer.disconnect();
    return {
      mutations: records.length,
      regionCount: regions.length,
      active: window.atlas.getState().activeRegion,
      accessibilityMatches: regions.every(node =>
        node.inert === !window.atlas.getState().visibleRegions.includes(node.dataset.atlasRegion!) &&
        node.getAttribute("aria-hidden") === String(node.inert)),
    };
  });
  expect(result.active).toBe("leading");
  expect(result.accessibilityMatches).toBe(true);
  expect(result.mutations).toBeLessThanOrEqual(result.regionCount * 2);
});

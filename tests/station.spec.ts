import { expect, test } from "@playwright/test";
for (const direction of ["ltr", "rtl"] as const) {
  test(`leading rail, station clipping and fixed bottom ${direction}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForFunction(() => window.atlas);
    await page.evaluate(async (direction) => {
      // Served fixture exports built package helpers, never its source files.
      window.atlas.update({
        direction,
        leadingRailWidth: 52,
        reserveLeadingRail: true,
      });
      const leading = document.querySelector("[data-atlas-leading]")!;
      leading.insertAdjacentHTML(
        "afterbegin",
        "<aside data-atlas-leading-rail><button>Rail</button></aside>",
      );
      const track = document.querySelector("[data-atlas-track]")!;
      track.insertAdjacentHTML(
        "beforeend",
        '<section data-atlas-region="station" data-atlas-trailing><div data-atlas-station-host><div data-atlas-station-scroll><div style="height:1500px">Scroll</div></div><div data-atlas-station style="height:140px;background:white">Station</div></div></section>',
      );
      window.atlas.refresh();
      window.atlas.goTo("leading", { instant: true });
    }, direction);
    const padding = await page
      .locator("[data-atlas-leading]")
      .evaluate((node) => getComputedStyle(node).paddingInlineStart);
    expect(padding).toBe("56px");
    const rail = await page.locator("[data-atlas-leading-rail]").boundingBox();
    const leading = await page.locator("[data-atlas-leading]").boundingBox();
    expect(
      direction === "ltr"
        ? rail!.x - leading!.x
        : leading!.x + leading!.width - rail!.x - rail!.width,
    ).toBeCloseTo(4);
    await page.evaluate(() => window.atlas.goTo("station", { instant: true }));
    const station = page.locator("[data-atlas-station]");
    const original = await station.boundingBox();
    await page
      .locator("[data-atlas-station-scroll]")
      .evaluate((node) => (node.scrollTop = 500));
    expect(await station.boundingBox()).toEqual(original);
    expect(
      await page.evaluate(() =>
        window.isStationFullyVisible(
          document.querySelector("[data-atlas-station]")!,
        ),
      ),
    ).toBe(true);
    await page.locator("[data-atlas-track]").evaluate((node) => {
      (node as HTMLElement).style.transform = "translateX(10000px)";
    });
    expect(
      await page.evaluate(() =>
        window.isStationFullyVisible(
          document.querySelector("[data-atlas-station]")!,
        ),
      ),
    ).toBe(false);
    await page.evaluate(() =>
      window.atlas.goTo("workspace", { instant: true }),
    );
    expect(
      await page.evaluate(() =>
        window.isStationFullyVisible(
          document.querySelector("[data-atlas-station]")!,
        ),
      ),
    ).toBe(false);
  });
}
declare global {
  interface Window {
    isStationFullyVisible: typeof import("../src/station").isStationFullyVisible;
  }
}

import { expect, test } from "@playwright/test";
import type {} from "./browser.spec";

for (const direction of ["ltr", "rtl"] as const) {
  test(`shared gutter: default, 6px, zero and restore in ${direction}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForFunction(() => window.atlas);
    await page.evaluate((direction) => {
      window.atlas.update({ direction });
      const workspace = document.querySelector(
        '[data-atlas-region="workspace"]',
      )!;
      const surface = document.createElement("div");
      surface.dataset.testSurface = "";
      surface.style.paddingInline = "17px";
      surface.append(...workspace.childNodes);
      workspace.append(surface);
    }, direction);
    await page
      .getByRole("textbox", { name: "Draft" })
      .fill("keep this content");
    for (const [index, gutter] of [4, 6, 0, 4].entries()) {
      if (index > 0) {
        await page.evaluate(
          (gutter) => window.atlas.update({ gutter }),
          gutter,
        );
      }
      const geometry = await page.evaluate(() => {
        const root = document.querySelector<HTMLElement>("[data-atlas]")!;
        const nav = root.querySelector<HTMLElement>("[data-atlas-navigation]")!;
        const navSurface = nav.querySelector<HTMLElement>(
          "[data-atlas-navigation-surface]",
        )!;
        const content = root.querySelector<HTMLElement>("[data-test-surface]")!;
        const frame = root.getBoundingClientRect();
        const track = root
          .querySelector("[data-atlas-track]")!
          .getBoundingClientRect();
        const n = nav.getBoundingClientRect();
        const ns = navSurface.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        const rtl = root.dir === "rtl";
        const divider = rtl ? n.left : n.right;
        return {
          marginStart: getComputedStyle(root).marginInlineStart,
          marginEnd: getComputedStyle(root).marginInlineEnd,
          navHalf: rtl ? ns.left - divider : divider - ns.right,
          regionHalf: rtl ? divider - c.right : c.left - divider,
          startEdge: rtl ? innerWidth - ns.right : ns.left,
          endEdge: rtl ? c.left : innerWidth - c.right,
          rootStart: frame.left,
          rootEnd: innerWidth - frame.right,
          bottom: frame.bottom - track.bottom,
          contentPadding: getComputedStyle(content).paddingInlineStart,
          active: window.atlas.getState().activeRegion,
        };
      });
      expect(geometry.marginStart).toBe(`${gutter}px`);
      expect(geometry.marginEnd).toBe(`${gutter}px`);
      for (const key of [
        "navHalf",
        "regionHalf",
        "rootStart",
        "rootEnd",
      ] as const) {
        expect(geometry[key]).toBeCloseTo(gutter, 1);
      }
      expect(geometry.startEdge).toBeCloseTo(2 * gutter, 1);
      expect(geometry.endEdge).toBeCloseTo(2 * gutter, 1);
      expect(geometry.bottom).toBeCloseTo(2 * gutter, 1);
      expect(geometry.contentPadding).toBe("17px");
      expect(geometry.active).toBe("workspace");
      await page.evaluate(() =>
        window.atlas.goTo("leading", { instant: true }),
      );
      const atLeading = await page.locator("[data-atlas]").boundingBox();
      expect(atLeading!.x).toBeCloseTo(gutter, 1);
      await page.evaluate(() =>
        window.atlas.goTo("workspace", { instant: true }),
      );
      await expect(page.getByRole("textbox", { name: "Draft" })).toHaveValue(
        "keep this content",
      );
    }
    const bottomSpacing = () =>
      page
        .locator("[data-atlas]")
        .evaluate(
          (root) =>
            root.getBoundingClientRect().bottom -
            root.querySelector("[data-atlas-track]")!.getBoundingClientRect()
              .bottom,
        );
    await page.evaluate(() =>
      window.atlas.update({ insetBottom: 20, gutter: 6 }),
    );
    expect(await bottomSpacing()).toBe(20);
    await page.evaluate(() => window.atlas.update({ gutter: 4 }));
    expect(await bottomSpacing()).toBe(20);
    await page.evaluate(() => window.atlas.update({ insetBottom: 0 }));
    expect(await bottomSpacing()).toBe(0);
    await page.evaluate(() =>
      window.atlas.update({ insetBottom: undefined, gutter: 6 }),
    );
    expect(await bottomSpacing()).toBe(12);
  });
}

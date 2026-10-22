import { expect, test } from "@playwright/test";
import type {} from "./browser.spec";

for (const direction of ["ltr", "rtl"] as const) {
  test(`Desktop mouse pan bindings and content ownership in ${direction}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForFunction(() => window.atlas);
    await page.evaluate((direction) => {
      window.atlas.update({ direction });
      document.querySelector<HTMLElement>("[data-atlas]")!.style.cursor =
        "crosshair";
    }, direction);
    const root = page.locator("[data-atlas]");
    const frame = (await root.boundingBox())!;
    const start = frame.x + frame.width * (direction === "ltr" ? 0.3 : 0.7);
    const end = frame.x + frame.width * (direction === "ltr" ? 0.9 : 0.1);
    const y = frame.y + 200;
    const state = (region: string) =>
      expect
        .poll(() => page.evaluate(() => window.atlas.getState()))
        .toMatchObject({ activeRegion: region, moving: false });
    const reset = () =>
      page.evaluate(() => window.atlas.goTo("workspace", { instant: true }));
    const drag = async (button: "left" | "middle") => {
      await page.mouse.move(start, y);
      await page.mouse.down({ button });
      await page.mouse.move(end, y, { steps: 20 });
      await page.mouse.up({ button });
    };
    const draft = page.getByRole("textbox", { name: "Draft" });
    await draft.fill("mouse selection remains available");
    const field = (await draft.boundingBox())!;
    await page.mouse.move(field.x + 8, field.y + field.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      field.x + field.width - 8,
      field.y + field.height / 2,
      { steps: 10 },
    );
    await page.mouse.up();
    expect(
      await draft.evaluate(
        (node: HTMLInputElement) => node.selectionEnd! - node.selectionStart!,
      ),
    ).toBeGreaterThan(0);
    await drag("left");
    await state("workspace");
    await drag("middle");
    await state("leading");
    await expect(root).toHaveCSS("cursor", "crosshair");
    await reset();

    await page.evaluate(() => window.atlas.update({ panButton: "side" }));
    await drag("middle");
    await state("workspace");
    const cdp = await page.context().newCDPSession(page);
    for (const button of ["back", "forward"] as const) {
      const buttons = button === "back" ? 8 : 16;
      await cdp.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        button,
        buttons,
        x: start,
        y,
        clickCount: 1,
      });
      await expect(root).toHaveCSS("cursor", "grabbing");
      for (let step = 1; step <= 20; step++) {
        await cdp.send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          button,
          buttons,
          x: start + ((end - start) * step) / 20,
          y,
        });
      }
      await cdp.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        button,
        buttons: 0,
        x: end,
        y,
        clickCount: 1,
      });
      await state("leading");
      await expect(root).toHaveCSS("cursor", "crosshair");
      await reset();
    }
    await cdp.detach();
    await expect(draft).toHaveValue("mouse selection remains available");

    await page.evaluate(() => window.atlas.update({ panButton: "middle" }));
    for (const attribute of ["data-no-drag", "role"] as const) {
      await root
        .locator('[data-atlas-region="workspace"]')
        .evaluate(
          (node, attribute) =>
            node.setAttribute(
              attribute,
              attribute === "role" ? "separator" : "",
            ),
          attribute,
        );
      await drag("middle");
      await state("workspace");
      await root
        .locator('[data-atlas-region="workspace"]')
        .evaluate(
          (node, attribute) => node.removeAttribute(attribute),
          attribute,
        );
    }
    await page.mouse.move(start, y);
    await page.mouse.down({ button: "middle" });
    await page.mouse.move(end, y, { steps: 20 });
    await page.evaluate(() => window.atlas.update({ panButton: "side" }));
    await page.mouse.up({ button: "middle" });
    await state("workspace");
    await expect(root).toHaveCSS("cursor", "crosshair");
    // Cleanup cannot leave drag listeners that consume later input.
    await page.evaluate(() => {
      window.atlas.update({ panButton: "middle" });
      window.atlas.destroy();
    });
    await drag("middle");
    // Controller teardown restores the root's original inline style.
    await expect(root).toHaveCSS("cursor", "auto");
  });
}

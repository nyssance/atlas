import { expect, test } from "@playwright/test";
import type { AtlasController, connectTrackpad } from "../src/dom";
declare global {
  interface Window {
    atlas: AtlasController;
    connectTrackpad: typeof connectTrackpad;
  }
}
for (const framework of ["dom", "react", "vue", "angular", "svelte"]) {
  test(`${framework}: state survives navigation, resize, and teardown`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
      console.error(error.message);
    });
    await page.goto(`/?framework=${framework}`);
    await expect(page.locator("html")).toHaveAttribute("data-ready", framework);
    await expect(page.locator("#state")).toContainText(
      '"activeRegion":"workspace"',
    );
    await page.getByRole("textbox", { name: "Draft" }).fill("keep my draft");
    await page.getByRole("textbox", { name: "Filter" }).fill("keep filter");
    await page.getByRole("button", { name: "Leading", exact: true }).click();
    await expect(page.locator("#state")).toContainText(
      '"activeRegion":"leading"',
    );
    await expect(page.locator("#state")).toContainText('"moving":false');
    expect(
      await page
        .locator("[data-atlas-navigation]")
        .evaluate((node) => node.getBoundingClientRect().x),
    ).toBeGreaterThan(600);
    await page.setViewportSize({ width: 900, height: 700 });
    await expect(page.locator("#state")).toContainText(
      '"activeRegion":"leading"',
    );
    await page.getByRole("button", { name: "Workspace", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Draft" })).toHaveValue(
      "keep my draft",
    );
    await expect(page.getByRole("textbox", { name: "Filter" })).toHaveValue(
      "keep filter",
    );
    await expect(page.locator("#state")).toContainText('"moving":false');
    await page.getByRole("button", { name: "Unmount" }).click();
    await expect(page.locator("[data-atlas]")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
test("DOM: mouse, keyboard, RTL, modal and unavailable trackpad", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
  await page.evaluate(() => {
    const atlas = window.atlas;
    atlas.update({ trackpadEnabled: true, trackpadAvailable: false });
    atlas.gesture({ fingers: 3, phase: "began", dx: 0, dy: 0 });
    atlas.gesture({ fingers: 3, phase: "changed", dx: 0.8, dy: 0 });
    atlas.gesture({ fingers: 3, phase: "ended", dx: 0, dy: 0 });
  });
  await expect(page.locator("#state")).toContainText(
    '"activeRegion":"workspace"',
  );
  await page.mouse.move(400, 180);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(1150, 180, { steps: 15 });
  await page.mouse.up({ button: "middle" });
  await expect(page.locator("#state")).toContainText(
    '"activeRegion":"leading"',
  );
  await expect(page.locator("#state")).toContainText('"moving":false');
  // Synthetic dragging must not consume the next real primary click.
  await page.evaluate(() => {
    const button = document.createElement("button");
    button.textContent = "Return to workspace";
    button.onclick = () => window.atlas.goTo("workspace");
    document.querySelector("[data-atlas-navigation-surface]")!.append(button);
  });
  await page
    .getByRole("button", { name: "Return to workspace", exact: true })
    .click();
  await expect(page.locator("#state")).toContainText(
    '"activeRegion":"workspace"',
  );
  await page.getByRole("button", { name: "Leading", exact: true }).click();
  await page.locator("[data-atlas]").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#state")).toContainText(
    '"activeRegion":"workspace"',
  );
  await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>("[data-atlas]")!;
    root.dir = "rtl";
    window.atlas.update({ direction: "rtl" });
  });
  await page.locator("[data-atlas]").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#state")).toContainText(
    '"activeRegion":"leading"',
  );
  await page.evaluate(() => {
    const dialog = document.createElement("dialog");
    dialog.open = true;
    document.body.append(dialog);
  });
  await page.locator("[data-atlas]").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#state")).toContainText(
    '"activeRegion":"leading"',
  );
  await page.evaluate(() => document.querySelector("dialog")!.remove());
  await page.getByRole("button", { name: "Remove workspace" }).click();
  await expect(page.locator("#state")).toContainText(
    '"activeRegion":"leading"',
  );
});
test("native source disconnect, reconnect and delayed cleanup", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
  const result = await page.evaluate(async () => {
    const { connectTrackpad } = window;
    const atlas = window.atlas;
    let available = false;
    const seen: boolean[] = [];
    let cleanupCount = 0;
    let finish: ((stop: () => void) => void) | undefined;
    const stop = connectTrackpad(
      atlas,
      {
        available: async () => available,
        subscribe: () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      },
      (error: unknown) => {
        throw error;
      },
      (value: boolean) => seen.push(value),
    );
    await new Promise((resolve) => setTimeout(resolve, 30));
    available = true;
    window.dispatchEvent(new Event("focus"));
    await new Promise((resolve) => setTimeout(resolve, 30));
    available = false;
    window.dispatchEvent(new Event("focus"));
    await new Promise((resolve) => setTimeout(resolve, 30));
    stop();
    finish!(() => cleanupCount++);
    await new Promise((resolve) => setTimeout(resolve, 30));
    return { seen, cleanupCount };
  });
  expect(result).toEqual({ seen: [false, true, false], cleanupCount: 1 });
});
for (const direction of ["ltr", "rtl"] as const) {
  test(`layout parameters and hover navigation ${direction}`, async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
    await page.evaluate(
      (direction) =>
        window.atlas.update({
          direction,
          insetTop: 18,
          insetBottom: 26,
          navigationWidth: 220,
          navigationPinned: false,
        }),
      direction,
    );
    await expect(page.locator("#state")).toContainText(
      '"activeRegion":"workspace"',
    );
    const dimensions = await page.locator("[data-atlas]").evaluate((node) => {
      const css = getComputedStyle(node);
      return {
        top: css.paddingTop,
        bottom: css.paddingBottom,
        nav: css.getPropertyValue("--atlas-navigation-width"),
      };
    });
    expect(dimensions).toEqual({ top: "18px", bottom: "26px", nav: "220px" });
    const box = await page.locator("[data-atlas]").boundingBox();
    await page.mouse.move(
      direction === "ltr" ? box!.x + 2 : box!.x + box!.width - 2,
      box!.y + 80,
    );
    await expect(page.locator("[data-atlas]")).toHaveAttribute(
      "data-atlas-navigation-peeking",
      "",
    );
    await expect(page.getByRole("textbox", { name: "Filter" })).toBeEditable();
    await expect(
      page.locator("[data-atlas-navigation-surface]"),
    ).not.toHaveAttribute("inert", "");
    await page.getByRole("textbox", { name: "Filter" }).fill("hover kept");
    await expect(page.getByRole("textbox", { name: "Filter" })).toHaveValue(
      "hover kept",
    );
    await page.mouse.move(box!.x + box!.width / 2, box!.y + 100);
    await expect(page.locator("[data-atlas]")).not.toHaveAttribute(
      "data-atlas-navigation-peeking",
      "",
    );
    await page.getByRole("button", { name: "Leading", exact: true }).click();
    await expect(page.locator("#state")).toContainText('"moving":false');
    await expect(page.getByRole("textbox", { name: "Filter" })).toHaveValue(
      "hover kept",
    );
    const nav = await page.locator("[data-atlas-navigation]").boundingBox();
    if (direction === "ltr") expect(nav!.x).toBeGreaterThan(box!.width / 2);
    else expect(nav!.x).toBeLessThan(10);
  });
}

import { expect, test } from "@playwright/test";
import type {} from "./browser.spec";
import type { attachWindowDrag } from "../src/tauri";
declare global {
  interface Window {
    attachWindowDrag: typeof attachWindowDrag;
  }
}

for (const existing of [false, true]) {
  test(`native topbar marking and cleanup (existing=${existing})`, async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
    const result = await page.evaluate((existing) => {
      const root = window.atlas.root;
      if (existing) {
        const header = document.createElement("div");
        header.setAttribute("data-atlas-topbar", "");
        header.setAttribute("data-tauri-drag-region", "true");
        root.append(header);
      }
      const stop = window.attachWindowDrag(root, (error) => {
        throw error;
      });
      const topbar = root.querySelector<HTMLElement>(
        ":scope > [data-atlas-topbar]",
      )!;
      const bounds = topbar.getBoundingClientRect();
      const rootBounds = root.getBoundingClientRect();
      const marker = topbar.getAttribute("data-tauri-drag-region");
      const events: string[] = [];
      const receive = (event: Event) => {
        events.push(event.type);
      };
      for (const type of ["mousedown", "mouseup", "dblclick"])
        document.addEventListener(type, receive);
      const uncanceled = ["mousedown", "mouseup", "dblclick"].map((type) =>
        topbar.dispatchEvent(
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            detail: 2,
            clientX: bounds.x + 10,
            clientY: bounds.y + 10,
          }),
        ),
      );
      for (const type of ["mousedown", "mouseup", "dblclick"])
        document.removeEventListener(type, receive);
      const overview = window.atlas.overview.getState();
      stop();
      return {
        marker,
        events,
        uncanceled,
        overview,
        height: bounds.height,
        top: bounds.top - rootBounds.top,
        rootMarked: root.hasAttribute("data-tauri-drag-region"),
        footerMarked: !!root.querySelector(
          "[data-atlas-footer][data-tauri-drag-region]",
        ),
        remaining:
          root
            .querySelector("[data-atlas-topbar]")
            ?.getAttribute("data-tauri-drag-region") ?? null,
      };
    }, existing);
    expect(result).toEqual({
      marker: "deep",
      events: ["mousedown", "mouseup", "dblclick"],
      uncanceled: [true, true, true],
      overview: null,
      height: 32,
      top: 0,
      rootMarked: false,
      footerMarked: false,
      remaining: existing ? "true" : null,
    });
  });
}

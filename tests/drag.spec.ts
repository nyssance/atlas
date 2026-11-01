import { expect, test } from "@playwright/test";
import type {} from "./browser.spec";
import type { attachWindowDrag } from "../src/tauri";
declare global {
  interface Window {
    attachWindowDrag: typeof attachWindowDrag;
  }
}

test("desktop top inset drags only empty space and disposes its listener", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
  const calls = await page.evaluate(async () => {
    const calls: string[] = [];
    Object.assign(window, {
      __TAURI_INTERNALS__: {
        metadata: {
          currentWindow: { label: "main" },
          currentWebview: { label: "main" },
        },
        invoke: async (command: string) => {
          calls.push(command);
        },
      },
    });
    const { attachWindowDrag } = window;
    const root = window.atlas.root;
    const failures: unknown[] = [];
    const stop = attachWindowDrag(root, (error: unknown) =>
      failures.push(error),
    );
    const bounds = root.getBoundingClientRect();
    const fire = (target: Element, y: number, detail = 1) =>
      target.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: true,
          button: 0,
          detail,
          clientX: bounds.x + 20,
          clientY: bounds.y + y,
        }),
      );
    fire(root, 10);
    await new Promise((resolve) => setTimeout(resolve, 50));
    fire(root, 10, 2);
    const button = document.createElement("button");
    root.append(button);
    fire(button, 10);
    fire(root, 40);
    await new Promise((resolve) => setTimeout(resolve, 50));
    stop();
    fire(root, 10);
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (failures.length) throw failures[0];
    return calls;
  });
  expect(calls).toEqual([
    "plugin:window|start_dragging",
    "plugin:window|toggle_maximize",
  ]);
});

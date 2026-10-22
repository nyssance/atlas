import { _electron as electron, expect, test } from "@playwright/test";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const require = createRequire(import.meta.url);
test("Electron: isolated renderer runs the React adapter and preserves edits", async () => {
  const app = await electron.launch({
    executablePath: require("electron"),
    args: [resolve("examples/electron.cjs")],
  });
  try {
    const page = await app.firstWindow();
    await expect(page.locator("html")).toHaveAttribute("data-ready", "react");
    expect(
      await page.evaluate(
        () => typeof (globalThis as { require?: unknown }).require,
      ),
    ).toBe("undefined");
    await page.getByRole("textbox", { name: "Draft" }).fill("Electron draft");
    await page.getByRole("button", { name: "Leading", exact: true }).click();
    await expect(page.locator("#state")).toContainText(
      '"activeRegion":"leading"',
    );
    await page.getByRole("button", { name: "Workspace", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Draft" })).toHaveValue(
      "Electron draft",
    );
    await page.getByRole("button", { name: "Unmount" }).click();
    await expect(page.locator("[data-atlas]")).toHaveCount(0);
  } finally {
    await app.close();
  }
});

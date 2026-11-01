import { expect, test } from "@playwright/test";
import type {} from "./browser.spec";

for (const framework of ["dom", "react", "svelte"]) {
  test(`${framework}: automatic root and reactive shared footer`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/?framework=${framework}`);
    await expect(page.locator("html")).toHaveAttribute("data-ready", framework);
    const root = page.locator("[data-atlas]");
    await expect(root).toHaveCSS("padding-top", "32px");
    await expect(root).toHaveCSS("padding-bottom", "8px");
    await page.evaluate(() => {
      const footer = document.createElement("footer");
      footer.dataset.atlasFooter = "";
      footer.textContent = "Ready";
      window.atlas.root.append(footer);
    });
    await expect(root).toHaveCSS("padding-bottom", "32px");
    await expect(root.locator("[data-atlas-footer]")).toHaveCSS(
      "height",
      "32px",
    );
    await page.evaluate(() => {
      window.atlas.root.querySelector<HTMLElement>(
        "[data-atlas-footer]",
      )!.hidden = true;
    });
    await expect(root).toHaveCSS("padding-bottom", "8px");
    await page.evaluate(() => {
      window.atlas.root.querySelector<HTMLElement>(
        "[data-atlas-footer]",
      )!.hidden = false;
      const region = document.createElement("section");
      region.dataset.atlasRegion = "second";
      window.atlas.track.append(region);
      window.atlas.refresh();
    });
    await expect(root.locator("[data-atlas-footer-navigation]")).toBeVisible();
    await expect(root).toHaveCSS("padding-bottom", "32px");
    await page.evaluate(() =>
      window.atlas.root.querySelector("[data-atlas-footer]")!.remove(),
    );
    await expect(root).toHaveCSS("padding-bottom", "32px");
    await page.evaluate(() => {
      window.atlas.track
        .querySelector('[data-atlas-region="second"]')!
        .remove();
      window.atlas.refresh();
    });
    await expect(root).toHaveCSS("padding-bottom", "8px");
    await page.evaluate(() => {
      const node = window.atlas.root;
      window.atlas.destroy();
      node.id = "destroyed-root";
    });
    await expect(page.locator("#destroyed-root")).not.toHaveAttribute(
      "data-atlas",
    );
  });
}

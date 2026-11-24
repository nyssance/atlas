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
    await expect(root).toHaveCSS("padding-bottom", "6px");
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
    // Content changes that cannot affect a footer must not read computed style: that read
    // forces a synchronous style recalculation in the page for every such change.
    const reads = await page.evaluate(async () => {
      const original = window.getComputedStyle;
      const frame = () =>
        new Promise((resolve) => requestAnimationFrame(resolve));
      let count = 0;
      window.getComputedStyle = (...args) => {
        count++;
        return original(...args);
      };
      const region = window.atlas.track.firstElementChild!;
      const text = document.createTextNode("typed");
      region.append(text);
      text.replaceWith(document.createTextNode("typed again"));
      const span = document.createElement("span");
      region.append(span);
      span.className = "changed";
      span.remove();
      await frame();
      const unrelated = count;
      const marked = document.createElement("div");
      region.append(marked);
      await frame();
      marked.setAttribute("data-atlas-footer", "");
      await frame();
      const becameFooter = count - unrelated;
      marked.remove();
      await frame();
      window.getComputedStyle = original;
      return { unrelated, becameFooter };
    });
    expect(reads.unrelated).toBe(0);
    expect(reads.becameFooter).toBeGreaterThan(0);
    await page.evaluate(() => {
      window.atlas.root.querySelector<HTMLElement>(
        "[data-atlas-footer]",
      )!.hidden = true;
    });
    await expect(root).toHaveCSS("padding-bottom", "6px");
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
    await expect(root).toHaveCSS("padding-bottom", "6px");
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

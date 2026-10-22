import { test, expect } from "@playwright/test";
test("Yijoy real Svelte route: edits, RTL, hover, dynamic regions and station", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/atlas-test");
  const root = page.locator("[data-atlas-demo]");
  const status = page.locator("[data-atlas-status]");
  const header = page
    .locator("header")
    .filter({ has: page.getByRole("heading", { name: "Atlas", exact: true }) });
  await expect(root).toHaveAttribute("dir", "ltr");
  await expect(status).toHaveText("workspace");
  const viewport = await root.boundingBox();
  const track = await root.locator(":scope > [data-atlas-track]").boundingBox();
  expect(track!.y - viewport!.y).toBe(32);
  expect(viewport!.y + viewport!.height - track!.y - track!.height).toBe(8);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    900,
  );
  expect(
    await root.evaluate((node) => getComputedStyle(node).marginInlineEnd),
  ).toBe("4px");
  await page
    .getByRole("textbox", { name: "工作区草稿" })
    .fill("Svelte keeps this draft");
  await page.getByRole("button", { name: "计数 0", exact: true }).click();
  await page.mouse.move(viewport!.x + viewport!.width * 0.3, viewport!.y + 250);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(
    viewport!.x + viewport!.width * 0.95,
    viewport!.y + 250,
    { steps: 24 },
  );
  await page.mouse.up({ button: "middle" });
  await expect(status).toHaveText("leading");
  await header.getByRole("button", { name: "工作区", exact: true }).click();
  await expect(status).toHaveText("workspace");
  await expect(page.getByRole("textbox", { name: "工作区草稿" })).toHaveValue(
    "Svelte keeps this draft",
  );
  await header.getByRole("button", { name: "负一屏", exact: true }).click();
  await expect(status).toHaveText("leading");
  let nav = await root.locator("[data-atlas-navigation]").boundingBox();
  let bounds = await root.boundingBox();
  expect(nav!.x).toBeGreaterThan(bounds!.x + bounds!.width / 2);
  await header.getByRole("button", { name: "左栏留白", exact: true }).click();
  expect(
    await root
      .locator("[data-atlas-leading]")
      .evaluate((node) => getComputedStyle(node).paddingInlineStart),
  ).toBe("56px");
  await header.getByRole("button", { name: "RTL", exact: true }).click();
  await expect(root).toHaveAttribute("dir", "rtl");
  await expect(status).toHaveText("leading");
  nav = await root.locator("[data-atlas-navigation]").boundingBox();
  bounds = await root.boundingBox();
  expect(nav!.x - bounds!.x).toBeLessThan(5);
  await header.getByRole("button", { name: "工作区", exact: true }).click();
  await expect(status).toHaveText("workspace");
  await expect(page.getByRole("textbox", { name: "工作区草稿" })).toHaveValue(
    "Svelte keeps this draft",
  );
  await expect(
    page.getByRole("button", { name: "计数 1", exact: true }),
  ).toBeVisible();
  await header.getByRole("button", { name: "固定导航", exact: true }).click();
  bounds = await root.boundingBox();
  await page.mouse.move(bounds!.x + bounds!.width - 2, bounds!.y + 100);
  await expect(root).toHaveAttribute("data-atlas-navigation-peeking", "");
  await expect(
    root.locator("[data-atlas-navigation-surface]"),
  ).not.toHaveAttribute("inert", "");
  await page.getByRole("textbox", { name: "筛选面板" }).fill("工作");
  await expect(page.getByRole("textbox", { name: "筛选面板" })).toHaveValue(
    "工作",
  );
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + 100);
  await expect(root).not.toHaveAttribute("data-atlas-navigation-peeking", "");
  await header.getByRole("button", { name: "固定导航", exact: true }).click();
  await header.getByRole("button", { name: "预览", exact: true }).click();
  await expect(status).toHaveText("preview");
  await expect(page.locator("[data-atlas-draft-preview]")).toHaveText(
    "Svelte keeps this draft",
  );
  await header.getByRole("button", { name: "切换预览", exact: true }).click();
  await expect(page.locator('[data-atlas-region="preview"]')).toHaveCount(0);
  await expect(status).toHaveText("station");
  const station = page.locator("[data-atlas-station]");
  const stationBounds = await station.boundingBox();
  await page
    .locator("[data-atlas-station-scroll]")
    .evaluate((node) => (node.scrollTop = 300));
  expect(await station.boundingBox()).toEqual(stationBounds);
  await page.screenshot({ path: "/private/tmp/yijoy-atlas-rtl.png" });
  expect(errors).toEqual([]);
});

test("Yijoy production shell uses Atlas with its existing shadcn navigation", async ({
  page,
}) => {
  await page.goto("/settings");
  const root = page.locator("[data-yijoy-workspace]");
  const toggle = page.getByRole("button", { name: "切换侧栏", exact: true });
  await expect(root).toHaveAttribute("data-atlas-viewport", "");
  const nav = page.locator("#yijoy-navigation");
  const original = await nav.elementHandle();
  if ((await root.getAttribute("data-atlas-navigation-pinned")) === "true")
    await toggle.click();
  await expect(root).toHaveAttribute("data-atlas-navigation-pinned", "false");
  await page.mouse.move(700, 100);
  await toggle.hover();
  await expect(root).toHaveAttribute("data-atlas-navigation-peeking", "");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(
    nav.locator("[data-atlas-navigation-surface]"),
  ).not.toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(root).not.toHaveAttribute("data-atlas-navigation-peeking", "");
  await toggle.click();
  await expect(root).toHaveAttribute("data-atlas-navigation-pinned", "true");
  await expect(
    nav.getByRole("link", { name: "主页", exact: true }),
  ).toBeVisible();
  await expect(nav.locator("[data-atlas-navigation-surface]")).toHaveCSS(
    "opacity",
    "1",
  );
  expect(
    await nav.evaluate((node, original) => node === original, original),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/private/tmp/yijoy-atlas-production.png" });
});

import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "dom");
  await page.evaluate(() => {
    window.atlas.update({ trackpadEnabled: true, trackpadAvailable: true });
    window.atlas.goTo("workspace", { instant: true });
  });
});

test("native displacement is visible immediately, cumulative, reversible and ordered", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>("[data-atlas]")!;
    const track = root.querySelector<HTMLElement>("[data-atlas-track]")!;
    const left = () => track.getBoundingClientRect().left;
    const gesture = (
      phase: "began" | "changed" | "ended",
      totalDx: number,
      ts: number,
    ) =>
      window.atlas.gesture({
        fingers: 3,
        phase,
        dx: 0,
        dy: 0,
        totalDx,
        totalDy: 0,
        ts,
      });
    const initial = left();
    gesture("began", 0.01, 1);
    const began = left() - initial;
    gesture("changed", 0.1, 3);
    const moved = left() - initial;
    gesture("changed", 0.05, 2);
    const stale = left() - initial;
    gesture("changed", 0, 4);
    const reversed = left() - initial;
    gesture("ended", 0, 5);
    return { began, moved, stale, reversed, width: root.clientWidth };
  });
  expect(result.began).toBeCloseTo(result.width * 0.01, 2);
  expect(result.moved).toBeCloseTo(result.width * 0.1, 2);
  expect(result.stale).toBe(result.moved);
  expect(result.reversed).toBeCloseTo(0, 2);
  await expect(page.locator("#state")).toContainText('"moving":false');
});

test("cancel returns to the initial snap instead of completing a swipe", async ({
  page,
}) => {
  await page.evaluate(() => {
    for (const [phase, totalDx, ts] of [
      ["began", 0, 1],
      ["changed", 0.6, 2],
      ["cancelled", 0.6, 3],
    ] as const)
      window.atlas.gesture({
        fingers: 3,
        phase,
        dx: 0,
        dy: 0,
        totalDx,
        totalDy: 0,
        ts,
      });
  });
  await expect(page.locator("#state")).toContainText(
    '"activeRegion":"workspace"',
  );
  await expect(page.locator("#state")).toContainText('"moving":false');
});

test("edge resistance is bounded and does not accumulate on reversal", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const track = document.querySelector<HTMLElement>("[data-atlas-track]")!;
    const initial = track.getBoundingClientRect().left;
    window.atlas.gesture({
      fingers: 3,
      phase: "began",
      dx: 0,
      dy: 0,
      totalDx: 0,
      totalDy: 0,
      ts: 1,
    });
    window.atlas.gesture({
      fingers: 3,
      phase: "changed",
      dx: 0,
      dy: 0,
      totalDx: 20,
      totalDy: 0,
      ts: 2,
    });
    const transform = new DOMMatrix(getComputedStyle(track).transform).m41;
    window.atlas.gesture({
      fingers: 3,
      phase: "changed",
      dx: 0,
      dy: 0,
      totalDx: 0,
      totalDy: 0,
      ts: 3,
    });
    return { transform, reverse: track.getBoundingClientRect().left - initial };
  });
  expect(result.transform).toBeLessThanOrEqual(64);
  expect(result.reverse).toBeCloseTo(0, 2);
});

test("starting a drag during animation preserves the displayed position", async ({
  page,
}) => {
  await page.evaluate(() => window.atlas.goTo("leading", { instant: false }));
  await page.waitForTimeout(50);
  const delta = await page.evaluate(() => {
    const track = document.querySelector<HTMLElement>("[data-atlas-track]")!;
    const before = track.getBoundingClientRect().left;
    window.atlas.gesture({
      fingers: 3,
      phase: "began",
      dx: 0,
      dy: 0,
      totalDx: 0,
      totalDy: 0,
      ts: 1,
    });
    return track.getBoundingClientRect().left - before;
  });
  expect(delta).toBeCloseTo(0, 2);
});

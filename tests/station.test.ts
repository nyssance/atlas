import { describe, expect, test } from "bun:test";
import {
  createStationGeometry,
  readVisibleStation,
  coversHalfOfTarget,
  isWindowCenterInside,
  StationDragGeneration,
  stationDefaults,
} from "../src/station";

// Desktop 494518376bf1f21ad9bde2cde6952ccff46ac5e6:
// src/features/layout/lib/__tests__/vibemon-nest-drop.test.ts
// DOM clipping scenarios are ported to station.spec.ts using real browser bounds.
describe("Desktop station geometry", () => {
  test("以内容区原点和缩放系数计算副栏与宠物窝的物理坐标", () => {
    const geometry = createStationGeometry(
      { left: 900, top: 40, right: 1164, bottom: 740 },
      { x: -1800, y: 48 },
      2,
      { inlineEnd: 71, bottom: 6, size: 100 },
    );
    expect(geometry.pane).toEqual({
      left: 0,
      top: 128,
      right: 528,
      bottom: 1528,
    });
    expect(geometry.nest).toEqual({
      left: 186,
      top: 1316,
      right: 386,
      bottom: 1516,
    });
  });
  test("使用包含页面缩放的非整数 devicePixelRatio", () => {
    expect(
      createStationGeometry(
        { left: 10, top: 20, right: 210, bottom: 320 },
        { x: 100, y: 200 },
        2.5,
        { inlineEnd: 20, bottom: 10, size: 40 },
      ).nest,
    ).toEqual({ left: 475, top: 875, right: 575, bottom: 975 });
  });
  for (const [visible, minimized] of [
    [false, false],
    [true, true],
  ]) {
    test(`可见=${visible}、最小化=${minimized} 时不使用隐藏窗口旧坐标`, async () => {
      const fail = () => {
        throw new Error("Hidden window geometry must not be read");
      };
      expect(
        await readVisibleStation(
          {
            isVisible: async () => visible!,
            isMinimized: async () => minimized!,
            innerPosition: fail,
          },
          { getBoundingClientRect: fail },
          2,
          stationDefaults,
        ),
      ).toBeNull();
    });
  }
  test("可见主窗口仍按真实位置生成投放目标", async () => {
    const rect = { left: 0, top: 0, right: 400, bottom: 600 } as DOMRect;
    expect(
      await readVisibleStation(
        {
          isVisible: async () => true,
          isMinimized: async () => false,
          innerPosition: async () => ({ x: 100, y: 200 }),
        },
        { getBoundingClientRect: () => rect },
        2,
        stationDefaults,
      ),
    ).toEqual(
      createStationGeometry(rect, { x: 100, y: 200 }, 2, stationDefaults),
    );
  });
  const nest = { left: 100, top: 100, right: 200, bottom: 200 };
  test("覆盖宠物窝恰好一半时命中", () =>
    expect(
      coversHalfOfTarget({ x: 50, y: 100, width: 100, height: 100 }, nest),
    ).toBe(true));
  test("覆盖宠物窝不足一半时不命中", () =>
    expect(
      coversHalfOfTarget({ x: 49, y: 100, width: 100, height: 100 }, nest),
    ).toBe(false));
  test("支持负坐标屏幕", () =>
    expect(
      coversHalfOfTarget(
        { x: -250, y: -150, width: 200, height: 200 },
        { left: -200, top: -100, right: -100, bottom: 0 },
      ),
    ).toBe(true));
  test("用宠物窗中心判断是否进入副栏", () =>
    expect(
      isWindowCenterInside(
        { x: 0, y: 0, width: 200, height: 200 },
        { left: 100, top: 100, right: 300, bottom: 300 },
      ),
    ).toBe(true));
  test("drag-end 会让仍在等待窗口 IPC 的 drag-start 失效", () => {
    const generation = new StationDragGeneration();
    const late = generation.begin();
    generation.invalidate();
    expect(generation.isCurrent(late)).toBe(false);
  });
});
describe("Atlas RTL regression", () => {
  test("mirrors the nest inset without changing physical desktop coordinates", () => {
    const pane = { left: 900, top: 40, right: 1164, bottom: 740 };
    const origin = { x: -1800, y: 48 };
    const ltr = createStationGeometry(pane, origin, 2, stationDefaults, "ltr");
    const rtl = createStationGeometry(pane, origin, 2, stationDefaults, "rtl");
    expect(rtl.pane).toEqual(ltr.pane);
    expect(rtl.nest).toEqual({
      left: 142,
      top: 1280,
      right: 342,
      bottom: 1480,
    });
    expect(rtl.nest.left - ltr.pane.left).toBe(ltr.pane.right - ltr.nest.right);
  });
});

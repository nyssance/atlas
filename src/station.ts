// Extracted from Desktop 494518376bf1f21ad9bde2cde6952ccff46ac5e6, vibemon-nest-drop.ts.
export const stationDefaults = Object.freeze({
  inlineEnd: 71,
  bottom: 24,
  size: 100,
});
export interface ScreenRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StationGeometry {
  pane: ScreenRect;
  nest: ScreenRect;
}

/** DOM 仍挂载不代表能投放：整块休息室必须在视口及所有裁剪祖先内可见。 */
export function isStationFullyVisible(element: HTMLElement): boolean {
  if (element.closest("[inert]")) return false;
  const rect = element.getBoundingClientRect();
  if (
    rect.width <= 0 ||
    rect.height <= 0 ||
    rect.left < 0 ||
    rect.top < 0 ||
    rect.right > window.innerWidth ||
    rect.bottom > window.innerHeight
  )
    return false;
  for (
    let ancestor: HTMLElement | null = element;
    ancestor !== null;
    ancestor = ancestor.parentElement
  ) {
    const style = getComputedStyle(ancestor);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0" ||
      style.pointerEvents === "none"
    )
      return false;
    const bounds = ancestor.getBoundingClientRect();
    const clips = (overflow: string) =>
      ["hidden", "clip", "auto", "scroll"].includes(overflow);
    if (
      clips(style.overflowX) &&
      (rect.left < bounds.left || rect.right > bounds.right)
    )
      return false;
    if (
      clips(style.overflowY) &&
      (rect.top < bounds.top || rect.bottom > bounds.bottom)
    )
      return false;
  }
  return true;
}

interface ViewportRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface ScreenPosition {
  x: number;
  y: number;
}

export interface StationInsets {
  inlineEnd: number;
  bottom: number;
  size: number;
}

/** 原生隐藏/最小化不会卸载 DOM；只有真实可见的主窗才提供投放目标。 */
export async function readVisibleStation(
  window: {
    isVisible: () => Promise<boolean>;
    isMinimized: () => Promise<boolean>;
    innerPosition: () => Promise<ScreenPosition>;
  },
  element: Pick<HTMLElement, "getBoundingClientRect">,
  pixelsPerCssPixel: number,
  nestInsets: StationInsets,
  direction: "ltr" | "rtl" = "ltr",
): Promise<StationGeometry | null> {
  if (!(await window.isVisible()) || (await window.isMinimized())) return null;
  const viewportOrigin = await window.innerPosition();
  return createStationGeometry(
    element.getBoundingClientRect(),
    viewportOrigin,
    pixelsPerCssPixel,
    nestInsets,
    direction,
  );
}

/** 把主窗口内容区里的 CSS 像素矩形换算成虚拟桌面的物理像素矩形。 */
function viewportRectToScreen(
  rect: ViewportRect,
  viewportOrigin: ScreenPosition,
  pixelsPerCssPixel: number,
): ScreenRect {
  return {
    left: viewportOrigin.x + rect.left * pixelsPerCssPixel,
    top: viewportOrigin.y + rect.top * pixelsPerCssPixel,
    right: viewportOrigin.x + rect.right * pixelsPerCssPixel,
    bottom: viewportOrigin.y + rect.bottom * pixelsPerCssPixel,
  };
}

/**
 * 副栏和宠物窝的屏幕物理坐标。viewportOrigin 必须是 main.innerPosition()；pixelsPerCssPixel
 * 必须用 window.devicePixelRatio（同时包含系统 DPI 与 WebView 页面缩放）。
 */
export function createStationGeometry(
  paneRect: ViewportRect,
  viewportOrigin: ScreenPosition,
  pixelsPerCssPixel: number,
  nestInsets: StationInsets,
  direction: "ltr" | "rtl" = "ltr",
): StationGeometry {
  const pane = viewportRectToScreen(
    paneRect,
    viewportOrigin,
    pixelsPerCssPixel,
  );
  const nestRight =
    viewportOrigin.x +
    (direction === "rtl"
      ? paneRect.left + nestInsets.inlineEnd + nestInsets.size
      : paneRect.right - nestInsets.inlineEnd) *
      pixelsPerCssPixel;
  const nestBottom =
    viewportOrigin.y +
    (paneRect.bottom - nestInsets.bottom) * pixelsPerCssPixel;
  const nestSize = nestInsets.size * pixelsPerCssPixel;
  return {
    pane,
    nest: {
      left: nestRight - nestSize,
      top: nestBottom - nestSize,
      right: nestRight,
      bottom: nestBottom,
    },
  };
}

export function isWindowCenterInside(
  bounds: WindowBounds,
  target: ScreenRect,
): boolean {
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  return (
    centerX >= target.left &&
    centerX <= target.right &&
    centerY >= target.top &&
    centerY <= target.bottom
  );
}

/** 宠物窗覆盖目标矩形至少一半时命中；分母按较小的宠物窝面积计算。 */
export function coversHalfOfTarget(
  bounds: WindowBounds,
  target: ScreenRect,
): boolean {
  const overlapWidth = Math.max(
    0,
    Math.min(bounds.x + bounds.width, target.right) -
      Math.max(bounds.x, target.left),
  );
  const overlapHeight = Math.max(
    0,
    Math.min(bounds.y + bounds.height, target.bottom) -
      Math.max(bounds.y, target.top),
  );
  const targetArea =
    (target.right - target.left) * (target.bottom - target.top);
  return overlapWidth * overlapHeight >= targetArea / 2;
}

/** 递增代次让迟到的 drag-start / 轮询结果无法覆盖更新的 drag-end。 */
export class StationDragGeneration {
  private current = 0;

  begin(): number {
    this.current += 1;
    return this.current;
  }

  invalidate(): number {
    this.current += 1;
    return this.current;
  }

  isCurrent(generation: number): boolean {
    return generation === this.current;
  }
}

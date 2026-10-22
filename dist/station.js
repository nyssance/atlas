// src/station.ts
var stationDefaults = Object.freeze({
  inlineEnd: 71,
  bottom: 24,
  size: 100
});
function isStationFullyVisible(element) {
  if (element.closest("[inert]"))
    return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0 || rect.left < 0 || rect.top < 0 || rect.right > window.innerWidth || rect.bottom > window.innerHeight)
    return false;
  for (let ancestor = element;ancestor !== null; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0" || style.pointerEvents === "none")
      return false;
    const bounds = ancestor.getBoundingClientRect();
    const clips = (overflow) => ["hidden", "clip", "auto", "scroll"].includes(overflow);
    if (clips(style.overflowX) && (rect.left < bounds.left || rect.right > bounds.right))
      return false;
    if (clips(style.overflowY) && (rect.top < bounds.top || rect.bottom > bounds.bottom))
      return false;
  }
  return true;
}
async function readVisibleStation(window2, element, pixelsPerCssPixel, nestInsets, direction = "ltr") {
  if (!await window2.isVisible() || await window2.isMinimized())
    return null;
  const viewportOrigin = await window2.innerPosition();
  return createStationGeometry(element.getBoundingClientRect(), viewportOrigin, pixelsPerCssPixel, nestInsets, direction);
}
function viewportRectToScreen(rect, viewportOrigin, pixelsPerCssPixel) {
  return {
    left: viewportOrigin.x + rect.left * pixelsPerCssPixel,
    top: viewportOrigin.y + rect.top * pixelsPerCssPixel,
    right: viewportOrigin.x + rect.right * pixelsPerCssPixel,
    bottom: viewportOrigin.y + rect.bottom * pixelsPerCssPixel
  };
}
function createStationGeometry(paneRect, viewportOrigin, pixelsPerCssPixel, nestInsets, direction = "ltr") {
  const pane = viewportRectToScreen(paneRect, viewportOrigin, pixelsPerCssPixel);
  const nestRight = viewportOrigin.x + (direction === "rtl" ? paneRect.left + nestInsets.inlineEnd + nestInsets.size : paneRect.right - nestInsets.inlineEnd) * pixelsPerCssPixel;
  const nestBottom = viewportOrigin.y + (paneRect.bottom - nestInsets.bottom) * pixelsPerCssPixel;
  const nestSize = nestInsets.size * pixelsPerCssPixel;
  return {
    pane,
    nest: {
      left: nestRight - nestSize,
      top: nestBottom - nestSize,
      right: nestRight,
      bottom: nestBottom
    }
  };
}
function isWindowCenterInside(bounds, target) {
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  return centerX >= target.left && centerX <= target.right && centerY >= target.top && centerY <= target.bottom;
}
function coversHalfOfTarget(bounds, target) {
  const overlapWidth = Math.max(0, Math.min(bounds.x + bounds.width, target.right) - Math.max(bounds.x, target.left));
  const overlapHeight = Math.max(0, Math.min(bounds.y + bounds.height, target.bottom) - Math.max(bounds.y, target.top));
  const targetArea = (target.right - target.left) * (target.bottom - target.top);
  return overlapWidth * overlapHeight >= targetArea / 2;
}

class StationDragGeneration {
  current = 0;
  begin() {
    this.current += 1;
    return this.current;
  }
  invalidate() {
    this.current += 1;
    return this.current;
  }
  isCurrent(generation) {
    return generation === this.current;
  }
}
export {
  StationDragGeneration,
  coversHalfOfTarget,
  createStationGeometry,
  isStationFullyVisible,
  isWindowCenterInside,
  readVisibleStation,
  stationDefaults
};

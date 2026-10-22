export declare const stationDefaults: Readonly<{
    inlineEnd: 71;
    bottom: 24;
    size: 100;
}>;
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
export declare function isStationFullyVisible(element: HTMLElement): boolean;
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
export declare function readVisibleStation(window: {
    isVisible: () => Promise<boolean>;
    isMinimized: () => Promise<boolean>;
    innerPosition: () => Promise<ScreenPosition>;
}, element: Pick<HTMLElement, "getBoundingClientRect">, pixelsPerCssPixel: number, nestInsets: StationInsets, direction?: "ltr" | "rtl"): Promise<StationGeometry | null>;
/**
 * 副栏和宠物窝的屏幕物理坐标。viewportOrigin 必须是 main.innerPosition()；pixelsPerCssPixel
 * 必须用 window.devicePixelRatio（同时包含系统 DPI 与 WebView 页面缩放）。
 */
export declare function createStationGeometry(paneRect: ViewportRect, viewportOrigin: ScreenPosition, pixelsPerCssPixel: number, nestInsets: StationInsets, direction?: "ltr" | "rtl"): StationGeometry;
export declare function isWindowCenterInside(bounds: WindowBounds, target: ScreenRect): boolean;
/** 宠物窗覆盖目标矩形至少一半时命中；分母按较小的宠物窝面积计算。 */
export declare function coversHalfOfTarget(bounds: WindowBounds, target: ScreenRect): boolean;
/** 递增代次让迟到的 drag-start / 轮询结果无法覆盖更新的 drag-end。 */
export declare class StationDragGeneration {
    private current;
    begin(): number;
    invalidate(): number;
    isCurrent(generation: number): boolean;
}
export {};

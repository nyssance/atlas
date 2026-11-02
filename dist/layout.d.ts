/** Shared spacing: 32px top, 8px outer edges, 32px when a footer is present. */
export declare const desktopDefaults: Readonly<{
    insetTop: 32;
    insetBottom: 8;
    navigationWidth: 248;
    gutter: 4;
    surfaceRadius: 14;
    navigationPinned: true;
    hoverNavigation: true;
    leadingRailWidth: 176;
    reserveLeadingRail: false;
    trailingWidth: 264;
    stationClearance: 192;
}>;
export interface AtlasLayoutOptions {
    insetTop?: number;
    /** Defaults to 32 with a visible footer, otherwise twice gutter. */
    insetBottom?: number;
    navigationWidth?: number;
    /** Fixed viewport margin and each region’s half-gap, in CSS pixels. */
    gutter?: number;
    /** Radius of surfaces inside regions; gutters remain outside the clipped surface. */
    surfaceRadius?: number;
    navigationPinned?: boolean;
    hoverNavigation?: boolean;
    leadingRailWidth?: number;
    reserveLeadingRail?: boolean;
    trailingWidth?: number;
    stationClearance?: number;
}
export declare function applyLayout(root: HTMLElement, options: AtlasLayoutOptions, hasFooter?: boolean): Required<AtlasLayoutOptions>;
/** 预览(编辑器)最小宽:拖到低于它当场收起(2026-07-30 用户定 400)。 */
export declare const MIN_PREVIEW_WIDTH = 400;
/** 聊天/对照窗格等块最小宽:再窄就没法用了,宁可总宽超出一屏、让画布横滑(2026-07-30 用户定 320)。 */
export declare const MIN_BLOCK_WIDTH = 320;
export interface AtlasWidths {
    /** 一屏 = 视口 − 导航栏。 */
    screen: number;
    /** 预览(编辑器);隐藏时 0。 */
    preview: number;
    /** 主聊天位。 */
    chat: number;
    /** 每个对照窗格各自的宽(按顺序)。 */
    sidePanes: number[];
    /** 终端;隐藏时 0。 */
    terminal: number;
}
export declare function resolveAtlasWidths(input: {
    navigationWidth?: number;
    viewportWidth: number;
    navigationHidden: boolean;
    previewVisible: boolean;
    /** 用户拖出来的预览宽(原始值,未钳制);0 = 没拖过,按与聊天平分第一屏。 */
    previewWidth?: number;
    sidePaneCount: number;
    terminalVisible: boolean;
}): AtlasWidths;
/** A block on the canvas, named by the host: its minimum width and, if the user set one, its requested width. */
export interface AtlasBlock<Name extends string = string> {
    name: Name;
    min: number;
    width?: number;
}
/**
 * Lays out ordered blocks screen by screen. Two neighbours share a screen while both keep their minimums (a
 * requested width on either sets the split, otherwise they halve it); a block that cannot share takes a screen
 * whole and its neighbour moves on to the next screen.
 */
export declare function resolveAtlasBlocks<Name extends string>(input: {
    /** Width of the first screen (viewport minus a pinned navigation). */
    screen: number;
    /** Width of the following screens (the viewport). */
    nextScreen: number;
    blocks: readonly AtlasBlock<Name>[];
}): Record<Name, number>;
export declare function resolveSplitGeometry(input: {
    viewport: number;
    navigation: number;
    pinned: boolean;
    chat: number;
    preview: number;
}): {
    leading: number;
    main: number;
    content: number;
    stops: number[];
};
export declare function resolveSplitWidths(viewportWidth: number, previewVisible: boolean, previewWidth: number, fullViewportWidth?: number, manuallySeparated?: boolean): {
    chat: number;
    preview: number;
};

/** Desktop-derived defaults. Bottom spacing follows twice the gutter unless
 * explicitly overridden; status bars remain the host's responsibility. */
export const desktopDefaults = Object.freeze({
  insetTop: 32,
  insetBottom: 8,
  navigationWidth: 248,
  gutter: 4,
  navigationPinned: true,
  hoverNavigation: true,
  leadingRailWidth: 176,
  reserveLeadingRail: false,
  trailingWidth: 264,
  stationClearance: 192,
});
export interface AtlasLayoutOptions {
  insetTop?: number;
  /** Defaults to gutter * 2; zero explicitly removes bottom spacing. */
  insetBottom?: number;
  navigationWidth?: number;
  /** Fixed viewport margin and each region’s half-gap, in CSS pixels. */
  gutter?: number;
  navigationPinned?: boolean;
  hoverNavigation?: boolean;
  leadingRailWidth?: number;
  reserveLeadingRail?: boolean;
  trailingWidth?: number;
  stationClearance?: number;
}
export function applyLayout(root: HTMLElement, options: AtlasLayoutOptions) {
  const layout: Required<AtlasLayoutOptions> = { ...desktopDefaults };
  for (const key of Object.keys(
    desktopDefaults,
  ) as (keyof AtlasLayoutOptions)[]) {
    if (options[key] !== undefined)
      Object.assign(layout, { [key]: options[key] });
  }
  layout.insetBottom = options.insetBottom ?? layout.gutter * 2;
  const values = {
    "inset-top": layout.insetTop,
    "inset-bottom": layout.insetBottom,
    "navigation-width": layout.navigationWidth,
    gutter: layout.gutter,
    "leading-rail-width": layout.leadingRailWidth,
    "trailing-width": layout.trailingWidth,
    "station-clearance": layout.stationClearance,
  };
  for (const [key, value] of Object.entries(values)) {
    if (!Number.isFinite(value) || value < 0)
      throw new Error(`Invalid Atlas ${key}`);
    root.style.setProperty(`--atlas-${key}`, `${value}px`);
  }
  root.dataset.atlasNavigationPinned = String(layout.navigationPinned);
  root.dataset.atlasReserveLeadingRail = String(layout.reserveLeadingRail);
  return layout;
}

// Width policy extracted from ALwith Desktop.
/** 预览(编辑器)最小宽:拖到低于它当场收起(2026-07-30 用户定 400)。 */
export const MIN_PREVIEW_WIDTH = 400;
/** 聊天/对照窗格等块最小宽:再窄就没法用了,宁可总宽超出一屏、让画布横滑(2026-07-30 用户定 320)。 */
export const MIN_BLOCK_WIDTH = 320;

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

export function resolveAtlasWidths(input: {
  navigationWidth?: number;
  viewportWidth: number;
  navigationHidden: boolean;
  previewVisible: boolean;
  /** 用户拖出来的预览宽(原始值,未钳制);0 = 没拖过,按与聊天平分第一屏。 */
  previewWidth?: number;
  sidePaneCount: number;
  terminalVisible: boolean;
}): AtlasWidths {
  // 第一屏要分给导航一块,所以它能装的内容比后面的屏窄
  const firstScreen = Math.max(
    0,
    input.viewportWidth -
      (input.navigationHidden
        ? 0
        : (input.navigationWidth ?? desktopDefaults.navigationWidth)),
  );
  const laterScreen = Math.max(0, input.viewportWidth);
  const fullOf = (isFirst: boolean) =>
    Math.max(MIN_BLOCK_WIDTH, isFirst ? firstScreen : laterScreen);
  const halfOf = (isFirst: boolean) =>
    Math.max(
      MIN_BLOCK_WIDTH,
      Math.floor((isFirst ? firstScreen : laterScreen) / 2),
    );

  let preview = 0;
  // 剩下要铺的板(预览已在第一屏就位时不含聊天),以及它们从第几屏开始铺
  const rest: Array<"chat" | "pane"> = [
    "chat",
    ...Array.from({ length: input.sidePaneCount }, () => "pane" as const),
  ];
  let restStartScreen = 0;
  let chatSharingWithPreview = 0;

  if (input.previewVisible) {
    // 没拖过就按平分;拖过就用拖出来的值(保底钳一次)
    const requested = Math.max(
      MIN_PREVIEW_WIDTH,
      input.previewWidth || halfOf(true),
    );
    if (firstScreen - requested >= MIN_BLOCK_WIDTH) {
      // 还塞得下聊天:两块共享第一屏,聊天吃掉剩下的
      preview = requested;
      chatSharingWithPreview = firstScreen - preview;
      rest.shift();
    } else {
      // 聊天被挤得不足保底 → 预览占满第一屏,聊天搬去下一屏(与后续板重新配对)
      preview = fullOf(true);
    }
    restStartScreen = 1;
  }

  // 剩余板两两一屏:偶数位与右邻配对 → 各半;末位落单 → 独占一屏
  let chat = chatSharingWithPreview;
  const sidePanes: number[] = [];
  rest.forEach((kind, index) => {
    const isFirst = restStartScreen + Math.floor(index / 2) === 0;
    const paired = index % 2 === 0 ? index + 1 < rest.length : true;
    const width = paired ? halfOf(isFirst) : fullOf(isFirst);
    if (kind === "chat") chat = width;
    else sidePanes.push(width);
  });

  // 终端恒独占一屏,且不在第一屏(导航不跟它同屏)
  return {
    screen: firstScreen,
    preview,
    chat,
    sidePanes,
    terminal: input.terminalVisible ? fullOf(false) : 0,
  };
}

// Adapted from Desktop's Atlas sizing and release policy.
export function resolveSplitGeometry(input: {
  viewport: number;
  navigation: number;
  pinned: boolean;
  chat: number;
  preview: number;
}): { leading: number; main: number; content: number; stops: number[] } {
  const { viewport, navigation, pinned, chat, preview } = input;
  const leading = Math.max(0, viewport - navigation);
  const main = leading + (pinned ? 0 : navigation);
  const budget = Math.max(0, viewport - (pinned ? navigation : 0));
  const content = Math.max(budget, chat + preview);
  const stops = [0, main];
  if (chat > 0 && preview > 0 && chat + preview > budget)
    stops.push(leading + navigation + chat);
  return { leading, main, content, stops };
}

// Reduced from Desktop's atlas-sizing.ts; navigation is already outside this viewport.

export function resolveSplitWidths(
  viewportWidth: number,
  previewVisible: boolean,
  previewWidth: number,
  fullViewportWidth = viewportWidth,
  manuallySeparated = false,
): { chat: number; preview: number } {
  const screen = Math.max(0, viewportWidth);
  const full = Math.max(MIN_BLOCK_WIDTH, screen);
  if (!previewVisible) return { chat: full, preview: 0 };
  const requested = Math.max(400, previewWidth || Math.floor(screen / 2));
  const pushedToNextScreen = previewWidth > 0 && previewWidth < 400;
  if (
    !manuallySeparated &&
    !pushedToNextScreen &&
    screen - requested >= MIN_BLOCK_WIDTH
  )
    return { chat: screen - requested, preview: requested };
  return { chat: full, preview: Math.max(MIN_BLOCK_WIDTH, fullViewportWidth) };
}

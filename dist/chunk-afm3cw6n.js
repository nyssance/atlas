// src/layout.ts
var desktopDefaults2 = Object.freeze({
  insetTop: 32,
  insetBottom: 8,
  navigationWidth: 248,
  gutter: 4,
  navigationPinned: true,
  hoverNavigation: true,
  leadingRailWidth: 176,
  reserveLeadingRail: false,
  trailingWidth: 264,
  stationClearance: 192
});
function applyLayout2(root, options) {
  const layout = { ...desktopDefaults2 };
  for (const key of Object.keys(desktopDefaults2)) {
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
    "station-clearance": layout.stationClearance
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
var MIN_PREVIEW_WIDTH2 = 400;
var MIN_BLOCK_WIDTH2 = 320;
function resolveAtlasWidths2(input) {
  const firstScreen = Math.max(0, input.viewportWidth - (input.navigationHidden ? 0 : input.navigationWidth ?? desktopDefaults2.navigationWidth));
  const laterScreen = Math.max(0, input.viewportWidth);
  const fullOf = (isFirst) => Math.max(MIN_BLOCK_WIDTH2, isFirst ? firstScreen : laterScreen);
  const halfOf = (isFirst) => Math.max(MIN_BLOCK_WIDTH2, Math.floor((isFirst ? firstScreen : laterScreen) / 2));
  let preview = 0;
  const rest = [
    "chat",
    ...Array.from({ length: input.sidePaneCount }, () => "pane")
  ];
  let restStartScreen = 0;
  let chatSharingWithPreview = 0;
  if (input.previewVisible) {
    const requested = Math.max(MIN_PREVIEW_WIDTH2, input.previewWidth || halfOf(true));
    if (firstScreen - requested >= MIN_BLOCK_WIDTH2) {
      preview = requested;
      chatSharingWithPreview = firstScreen - preview;
      rest.shift();
    } else {
      preview = fullOf(true);
    }
    restStartScreen = 1;
  }
  let chat = chatSharingWithPreview;
  const sidePanes = [];
  rest.forEach((kind, index) => {
    const isFirst = restStartScreen + Math.floor(index / 2) === 0;
    const paired = index % 2 === 0 ? index + 1 < rest.length : true;
    const width = paired ? halfOf(isFirst) : fullOf(isFirst);
    if (kind === "chat")
      chat = width;
    else
      sidePanes.push(width);
  });
  return {
    screen: firstScreen,
    preview,
    chat,
    sidePanes,
    terminal: input.terminalVisible ? fullOf(false) : 0
  };
}
function resolveSplitGeometry2(input) {
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
function resolveSplitWidths2(viewportWidth, previewVisible, previewWidth, fullViewportWidth = viewportWidth, manuallySeparated = false) {
  const screen = Math.max(0, viewportWidth);
  const full = Math.max(MIN_BLOCK_WIDTH2, screen);
  if (!previewVisible)
    return { chat: full, preview: 0 };
  const requested = Math.max(400, previewWidth || Math.floor(screen / 2));
  const pushedToNextScreen = previewWidth > 0 && previewWidth < 400;
  if (!manuallySeparated && !pushedToNextScreen && screen - requested >= MIN_BLOCK_WIDTH2)
    return { chat: screen - requested, preview: requested };
  return { chat: full, preview: Math.max(MIN_BLOCK_WIDTH2, fullViewportWidth) };
}

export { desktopDefaults2, applyLayout2, MIN_PREVIEW_WIDTH2, MIN_BLOCK_WIDTH2, resolveAtlasWidths2, resolveSplitGeometry2, resolveSplitWidths2 };

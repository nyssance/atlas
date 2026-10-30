import type { AtlasController } from "./dom";

export interface AtlasOverviewState {
  scale: number;
  padding: number;
  contentHeight: number;
  regions: { id: string; width: number; label: string }[];
}
export interface AtlasOverviewOptions {
  label?: string;
  /** Visual panels when navigation uses separate snap markers. */
  regions?: string;
  regionLabel?: (id: string) => string;
  /** Host decorations may observe geometry without owning transforms. */
  onChange?: (state: AtlasOverviewState | null) => void;
  renderOverlay?: boolean;
  /** A host footer outside the Atlas root, such as a business status bar. */
  footer?: HTMLElement | null | (() => HTMLElement | null);
}
/** Live thumbnails reuse the mounted track, never screenshots or duplicate views. */
export function createOverview(
  controller: AtlasController,
  options: () => boolean | AtlasOverviewOptions,
) {
  const { root, track } = controller;
  let state: AtlasOverviewState | null = null;
  let overlay: HTMLElement | null = null;
  let observer: ResizeObserver | null = null;
  let mutation: MutationObserver | null = null;
  let frame = 0;
  let focus: HTMLElement | null = null;
  let inert = false;
  let transition = "";
  let origin = "";
  const listeners = new Set<(state: AtlasOverviewState | null) => void>();
  const notify = () => {
    const config = options();
    if (typeof config === "object") config.onChange?.(state);
    listeners.forEach((listener) => listener(state));
  };
  const elements = () => {
    const config = options();
    const nodes =
      typeof config === "object" && config.regions
        ? track.querySelectorAll(config.regions)
        : track.children;
    return [...nodes].filter(
      (node): node is HTMLElement =>
        node instanceof HTMLElement && node.offsetWidth > 0,
    );
  };
  const idOf = (node: HTMLElement) =>
    node.dataset.atlasRegion ??
    node.dataset.atlasOverviewRegion ??
    (node.hasAttribute("data-atlas-navigation") ? "navigation" : "");
  const measure = () => {
    if (!state) return;
    const config = options();
    const width = track.scrollWidth;
    const viewport = root.clientWidth;
    const maxScale = Math.min(
      Math.max(0, viewport - 32) / Math.max(1, width),
      Math.max(0, root.clientHeight - 176) / Math.max(1, track.clientHeight),
      1,
    );
    const scale =
      state.scale > 0 &&
      state.scale <= maxScale &&
      state.padding + width * state.scale <= viewport - 16
        ? state.scale
        : maxScale;
    const padding =
      state.scale === scale
        ? state.padding
        : Math.max((viewport - width * scale) / 2, 16);
    track.style.transformOrigin = `${root.dir === "rtl" ? "right" : "left"} center`;
    track.style.transform = `translate3d(${root.dir === "rtl" ? -padding : padding}px, 0, 0) scale(${scale})`;
    const nodes = elements();
    state = {
      scale,
      padding,
      contentHeight: track.clientHeight * scale,
      regions: nodes.map((node) => {
        const id = idOf(node);
        return {
          id,
          width: node.offsetWidth * scale,
          label:
            typeof config === "object"
              ? (config.regionLabel?.(id) ??
                node.getAttribute("aria-label") ??
                id)
              : (node.getAttribute("aria-label") ?? id),
        };
      }),
    };
    if (overlay) {
      const bounds = root.getBoundingClientRect();
      const focused = overlay.contains(document.activeElement)
        ? document.activeElement?.getAttribute("data-atlas-overview-target")
        : null;
      overlay.replaceChildren(
        ...nodes.map((node, index) => {
          const box = node.getBoundingClientRect();
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.atlasOverviewTarget = idOf(node);
          button.setAttribute("aria-label", state!.regions[index]!.label);
          button.style.cssText = `left:${box.left - bounds.left}px;top:${box.top - bounds.top}px;width:${box.width}px;height:${box.height}px`;
          button.textContent = state!.regions[index]!.label;
          button.onclick = () => exit(idOf(node));
          return button;
        }),
      );
      if (focused)
        [...overlay.querySelectorAll<HTMLButtonElement>("button")]
          .find((button) => button.dataset.atlasOverviewTarget === focused)
          ?.focus({ preventScroll: true });
    }
    notify();
  };
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      exit();
    }
  };
  const enter = () => {
    if (state || options() === false) return;
    controller.suspend();
    focus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    inert = track.inert;
    track.inert = true;
    transition = track.style.transition;
    origin = track.style.transformOrigin;
    track.style.transition = "none";
    track.style.transformOrigin = `${root.dir === "rtl" ? "right" : "left"} center`;
    state = { scale: 0, padding: 16, contentHeight: 0, regions: [] };
    root.dataset.atlasOverview = "";
    const config = options();
    if (typeof config !== "object" || config.renderOverlay !== false) {
      overlay = document.createElement("div");
      overlay.dataset.atlasOverviewOverlay = "";
      overlay.setAttribute("role", "group");
      overlay.setAttribute(
        "aria-label",
        typeof config === "object" ? (config.label ?? "Overview") : "Overview",
      );
      root.append(overlay);
    }
    measure();
    observer = new ResizeObserver(schedule);
    observer.observe(root);
    elements().forEach((node) => observer!.observe(node));
    mutation = new MutationObserver(() => {
      elements().forEach((node) => observer?.observe(node));
      schedule();
    });
    mutation.observe(track, { childList: true });
    root.ownerDocument.addEventListener("keydown", keydown, true);
    overlay?.querySelector("button")?.focus({ preventScroll: true });
  };
  const exit = (id?: string) => {
    if (!state) return;
    const geometry = controller.getGeometry();
    const index = id
      ? geometry.regions.findIndex((node) => node.dataset.atlasRegion === id)
      : -1;
    const snap =
      index < 0
        ? geometry.selected
        : geometry.groups.findIndex((group) => group.includes(index));
    cancelAnimationFrame(frame);
    observer?.disconnect();
    mutation?.disconnect();
    root.ownerDocument.removeEventListener("keydown", keydown, true);
    overlay?.remove();
    overlay = null;
    delete root.dataset.atlasOverview;
    track.inert = inert;
    track.style.transition = transition;
    track.style.transformOrigin = origin;
    state = null;
    controller.resume(snap < 0 ? geometry.selected : snap);
    if (
      id &&
      controller
        .getGeometry()
        .regions.some((node) => node.dataset.atlasRegion === id)
    )
      controller.goTo(id, { instant: true });
    notify();
    if (focus?.isConnected && !focus.closest("[inert]"))
      focus.focus({ preventScroll: true });
  };
  const doubleClick = (event: MouseEvent) => {
    if (options() === false || !(event.target instanceof Element)) return;
    if (
      event.target.closest(
        "button,a,input,textarea,select,[contenteditable=true],[role=button]",
      )
    )
      return;
    const config = options();
    const target = typeof config === "object" ? config.footer : undefined;
    const footer = typeof target === "function" ? target() : target;
    const rect = root.getBoundingClientRect();
    const inset =
      Number.parseFloat(root.style.getPropertyValue("--atlas-inset-bottom")) ||
      0;
    const inBottom =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.bottom - inset &&
      event.clientY <= rect.bottom;
    if (!footer?.contains(event.target) && !inBottom) return;
    event.preventDefault();
    state ? exit() : enter();
  };
  root.ownerDocument.addEventListener("dblclick", doubleClick);
  return {
    enabled: () => options() !== false,
    update() {
      if (options() === false) exit();
      else if (state) measure();
    },
    enter,
    exit,
    toggle() {
      state ? exit() : enter();
    },
    getState: () => state,
    subscribe(listener: (state: AtlasOverviewState | null) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      root.ownerDocument.removeEventListener("dblclick", doubleClick);
      exit();
      listeners.clear();
    },
  };
}

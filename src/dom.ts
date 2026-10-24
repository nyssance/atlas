import { applyLayout, type AtlasLayoutOptions } from "./layout";
import { attachHoverNavigation } from "./hover";
import EmblaCarousel from "embla-carousel";
import type { AtlasState, TrackpadGesture } from "./core";
import { attachInput } from "./input";

export interface AtlasOptions extends AtlasLayoutOptions {
  initialRegion?: string;
  /** Transient overlay state; does not change the pinned preference. */
  onNavigationChange?: (peeking: boolean) => void;
  /** Optional snap markers for hosts with independently positioned regions. */
  regions?: string;
  groupRegions?: boolean;
  contain?: boolean;
  manageInert?: boolean;
  watchResize?:
    boolean | ((root: HTMLElement, entries: ResizeObserverEntry[]) => void);
  watchRegions?: boolean;
  direction?: "ltr" | "rtl";
  flickMinIndex?: number;
  /** Desktop mouse pan binding. Left-button selection stays with content. */
  panButton?: "middle" | "side";
  trackpadEnabled?: boolean;
  trackpadAvailable?: boolean;
  blocked?: () => boolean;
}
export type AtlasEvent =
  "select" | "scroll" | "settle" | "reInit" | "pointerDown" | "slidesInView";
export interface AtlasGeometry {
  selected: number;
  groups: number[][];
  snaps: number[];
  offsets: number[];
  regions: HTMLElement[];
  location: number;
  target: number;
  progress: number;
}
export interface AtlasController {
  readonly root: HTMLElement;
  readonly track: HTMLElement;
  getGeometry(): AtlasGeometry;
  goToSnap(index: number, options?: { instant?: boolean }): void;
  on(event: AtlasEvent, listener: () => void): AtlasController;
  off(event: AtlasEvent, listener: () => void): AtlasController;
  cancelInput(): void;
  /** Release transform ownership for host overview animations. */
  suspend(): void;
  /** Re-measure after an overview and reclaim transform ownership. */
  resume(index?: number): void;
  getState(): AtlasState;
  subscribe(listener: (state: AtlasState) => void): () => void;
  goTo(region: string, options?: { instant?: boolean }): void;
  update(options: Partial<AtlasOptions>): void;
  refresh(options?: Pick<AtlasOptions, "direction">): void;
  gesture(event: TrackpadGesture): void;
  destroy(): void;
}
/** Host-managed widths rebuild only for viewport/container resize. */
export function isViewportResize(
  root: HTMLElement,
  entries: ResizeObserverEntry[],
): boolean {
  return entries.some(
    (entry) => entry.target === root.querySelector("[data-atlas-track]"),
  );
}
/** The root contains one track; direct track children are regions or navigation.
 * Supply layout through styles.css or equivalent host styles. Never expose Embla. */
export function createAtlas(
  root: HTMLElement,
  initial: AtlasOptions = {},
): AtlasController {
  const initialDirection = root.getAttribute("dir");
  const initialViewport = root.getAttribute("data-atlas-viewport");
  root.setAttribute("data-atlas-viewport", "");
  let options = {
    ...initial,
    direction:
      initial.direction ??
      (getComputedStyle(root).direction === "rtl"
        ? ("rtl" as const)
        : ("ltr" as const)),
  };
  root.dir = options.direction;
  const initialStyle = root.getAttribute("style");
  const initialPinned = root.getAttribute("data-atlas-navigation-pinned");
  const initialRail = root.getAttribute("data-atlas-reserve-leading-rail");
  let layout = applyLayout(root, options);
  const track = root.querySelector<HTMLElement>("[data-atlas-track]");
  if (!track) throw new Error("Atlas requires a data-atlas-track element");
  const readRegions = () => {
    const nodes = options.regions
      ? [...track.querySelectorAll<HTMLElement>(options.regions)]
      : ([...track.children] as HTMLElement[]);
    const ids = nodes.flatMap((node) =>
      node.dataset.atlasRegion ? [node.dataset.atlasRegion] : [],
    );
    if (!ids.length || new Set(ids).size !== ids.length)
      throw new Error("Atlas region IDs must be nonempty and unique");
    return nodes;
  };
  let nodes = readRegions();
  let disposed = false;
  let suspended = false;
  let moving = false;
  let restoring = false;
  const listeners = new Set<(state: AtlasState) => void>();
  const original = new Map<
    HTMLElement,
    { inert: boolean; hidden: string | null }
  >();
  const api = EmblaCarousel(root, {
    container: track,
    axis: "x",
    direction: options.direction ?? "ltr",
    align: "start",
    slides: options.regions,
    containScroll: options.contain === false ? false : "keepSnaps",
    slidesToScroll: options.groupRegions === false ? 1 : "auto",
    watchResize: (_api, entries) => {
      if (suspended || options.watchResize === false) return false;
      if (typeof options.watchResize === "function") {
        options.watchResize(root, entries);
        return false;
      }
      return true;
    },
    watchSlides: () => !suspended && options.watchRegions !== false,
    // Atlas owns dragging; real primary input remains available to content.
    watchDrag: false,
  });
  const blocked = () =>
    suspended ||
    root.closest("[inert]") !== null ||
    !!options.blocked?.() ||
    !!root.ownerDocument.querySelector(
      '[role="dialog"][data-open], [role="dialog"][data-state="open"], [role="alertdialog"][data-open], [role="alertdialog"][data-state="open"], dialog[open]',
    );
  let input = attachInput(
    api,
    blocked,
    options.flickMinIndex,
    options.panButton,
  );
  const hover = attachHoverNavigation(
    root,
    api,
    () => options,
    blocked,
    (peeking) => options.onNavigationChange?.(peeking),
  );
  const idsAt = (index: number) =>
    (api.internalEngine().slideRegistry[index] ?? []).flatMap((i) =>
      nodes[i]?.dataset.atlasRegion ? [nodes[i].dataset.atlasRegion!] : [],
    );
  let state: AtlasState = {
    activeRegion: null,
    visibleRegions: [],
    moving: false,
  };
  let requested: string | null = options.initialRegion ?? null;
  const publish = () => {
    if (disposed || restoring) return;
    const visibleRegions = idsAt(api.selectedScrollSnap());
    const activeRegion =
      requested && visibleRegions.includes(requested)
        ? requested
        : (visibleRegions[0] ?? null);
    requested = activeRegion;
    for (const node of nodes) {
      if (options.manageInert === false || !node.dataset.atlasRegion) continue;
      if (!original.has(node))
        original.set(node, {
          inert: node.inert,
          hidden: node.getAttribute("aria-hidden"),
        });
      const visible = visibleRegions.includes(node.dataset.atlasRegion);
      node.inert = !visible;
      node.setAttribute("aria-hidden", String(!visible));
    }
    if (
      state.activeRegion === activeRegion &&
      state.moving === moving &&
      state.visibleRegions.join("\0") === visibleRegions.join("\0")
    )
      return;
    state = Object.freeze({
      activeRegion,
      visibleRegions: Object.freeze(visibleRegions),
      moving,
    });
    listeners.forEach((listener) => listener(state));
  };
  const snapFor = (id: string) => {
    const node = nodes.findIndex((node) => node.dataset.atlasRegion === id);
    if (node === -1) return -1;
    return api
      .internalEngine()
      .slideRegistry.findIndex((group) => group.includes(node));
  };
  const goTo = (region: string, settings: { instant?: boolean } = {}) => {
    if (disposed) throw new Error("Atlas is destroyed");
    const snap = snapFor(region);
    if (snap < 0) throw new Error(`Unknown Atlas region: ${region}`);
    if (suspended) return;
    input.cancel();
    requested = region;
    const instant =
      settings.instant ??
      root.ownerDocument.defaultView!.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    moving = !instant && snap !== api.selectedScrollSnap();
    const wasRestoring = restoring;
    if (instant) restoring = true;
    api.scrollTo(snap, instant);
    restoring = wasRestoring;
    if (instant) moving = false;
    publish();
  };
  const select = () => publish();
  const scroll = () => {
    moving = true;
    publish();
  };
  const settle = () => {
    moving = false;
    publish();
  };
  const rebuild = () => {
    if (suspended) return;
    const previous = state.activeRegion;
    const previousIndex = nodes.findIndex(
      (node) => node.dataset.atlasRegion === previous,
    );
    nodes = readRegions();
    const replacement =
      previous && snapFor(previous) >= 0
        ? previous
        : (nodes
            .slice(Math.max(0, previousIndex))
            .find((node) => node.dataset.atlasRegion)?.dataset.atlasRegion ??
          nodes.toReversed().find((node) => node.dataset.atlasRegion)?.dataset
            .atlasRegion);
    if (replacement) {
      requested = replacement;
      api.scrollTo(snapFor(replacement), true);
    }
    moving = false;
    publish();
  };
  api
    .on("select", select)
    .on("scroll", scroll)
    .on("settle", settle)
    .on("reInit", rebuild);
  const keydown = (event: KeyboardEvent) => {
    if (
      event.target !== root ||
      blocked() ||
      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    input.cancel();
    const direction = options.direction === "rtl" ? -1 : 1;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? api.scrollSnapList().length - 1
          : api.selectedScrollSnap() +
            (event.key === "ArrowRight" ? direction : -direction);
    const snap = Math.max(0, Math.min(next, api.scrollSnapList().length - 1));
    const region = idsAt(snap)[0];
    if (region) goTo(region);
  };
  root.addEventListener("keydown", keydown);
  const observer = new MutationObserver(() => {
    if (blocked()) input.cancel();
  });
  observer.observe(root.ownerDocument.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["inert", "data-open", "data-state", "open"],
  });
  if (options.initialRegion) goTo(options.initialRegion, { instant: true });
  else publish();
  const controller: AtlasController = {
    root,
    track,
    getGeometry() {
      const engine = api.internalEngine();
      return {
        selected: api.selectedScrollSnap(),
        groups: engine.slideRegistry.map((group) => [...group]),
        snaps: [...api.scrollSnapList()],
        offsets: engine.scrollSnaps.map(
          (value) => value * (options.direction === "rtl" ? -1 : 1),
        ),
        regions: [...api.slideNodes()],
        location:
          engine.location.get() * (options.direction === "rtl" ? -1 : 1),
        target: engine.target.get() * (options.direction === "rtl" ? -1 : 1),
        progress: api.scrollProgress(),
      };
    },
    goToSnap(index, settings = {}) {
      const ids = idsAt(index);
      const region = requested && ids.includes(requested) ? requested : ids[0];
      if (!region) throw new Error(`Unknown Atlas snap: ${index}`);
      goTo(region, settings);
    },
    on(event, listener) {
      api.on(event, listener);
      return controller;
    },
    off(event, listener) {
      api.off(event, listener);
      return controller;
    },
    cancelInput: () => input.cancel(),
    suspend() {
      if (disposed || suspended) return;
      input.cancel();
      suspended = true;
      const engine = api.internalEngine();
      engine.animation.stop();
      engine.target.set(engine.location.get());
      engine.translate.to(engine.location.get());
      moving = false;
      publish();
    },
    resume(index) {
      if (disposed) return;
      suspended = false;
      api.reInit();
      if (index !== undefined) controller.goToSnap(index, { instant: true });
    },
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    goTo,
    update(next) {
      if (disposed) return;
      const old = options;
      options = {
        ...options,
        ...next,
        direction: next.direction ?? options.direction,
      };
      root.dir = options.direction;
      const nextLayout = applyLayout(root, options);
      const layoutChanged =
        JSON.stringify(layout) !== JSON.stringify(nextLayout);
      layout = nextLayout;
      hover.update();
      if (
        (old.trackpadEnabled && !options.trackpadEnabled) ||
        (old.trackpadAvailable && !options.trackpadAvailable)
      )
        input.cancel();
      if (
        old.flickMinIndex !== options.flickMinIndex ||
        old.panButton !== options.panButton
      ) {
        input.dispose();
        input = attachInput(
          api,
          blocked,
          options.flickMinIndex,
          options.panButton,
        );
      }
      if (
        !suspended &&
        (old.direction !== options.direction || layoutChanged)
      ) {
        restoring = true;
        input.cancel();
        api.reInit({ direction: options.direction ?? "ltr" });
        restoring = false;
        rebuild();
      }
    },
    refresh(next = {}) {
      if (disposed || suspended) return;
      options = { ...options, ...next };
      root.dir = options.direction;
      api.reInit({ direction: options.direction });
    },
    gesture(event) {
      if (!disposed && options.trackpadEnabled && options.trackpadAvailable)
        input.gesture(event);
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      hover.dispose();
      root.removeEventListener("keydown", keydown);
      input.dispose();
      api.destroy();
      listeners.clear();
      if (initialDirection === null) root.removeAttribute("dir");
      else root.setAttribute("dir", initialDirection);
      if (initialStyle === null) root.removeAttribute("style");
      else root.setAttribute("style", initialStyle);
      for (const [key, value] of [
        ["data-atlas-viewport", initialViewport],
        ["data-atlas-navigation-pinned", initialPinned],
        ["data-atlas-reserve-leading-rail", initialRail],
      ]) {
        if (value === null) root.removeAttribute(key!);
        else root.setAttribute(key!, value!);
      }
      for (const [node, attributes] of original) {
        node.inert = attributes.inert;
        if (attributes.hidden === null) node.removeAttribute("aria-hidden");
        else node.setAttribute("aria-hidden", attributes.hidden);
      }
    },
  };
  return controller;
}

/** Shared device lifecycle for desktop hosts. Missing hardware never enables input. */
export function observeTrackpad(
  source: import("./core").TrackpadSource,
  onAvailability: (available: boolean) => void,
  onError: (error: unknown) => void,
  intervalMs = 5000,
): () => void {
  let disposed = false;
  let pending = false;
  const refresh = async () => {
    if (disposed || pending || document.hidden) return;
    pending = true;
    try {
      const available = await source.available();
      if (!disposed) onAvailability(available);
    } catch (error) {
      if (!disposed) {
        onAvailability(false);
        onError(error);
      }
    } finally {
      pending = false;
    }
  };
  const onFocus = () => void refresh();
  onFocus();
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onFocus);
  const interval = window.setInterval(onFocus, intervalMs);
  return () => {
    disposed = true;
    window.clearInterval(interval);
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onFocus);
  };
}
export function connectTrackpad(
  controller: AtlasController,
  source: import("./core").TrackpadSource,
  onError: (error: unknown) => void,
  onAvailability?: (available: boolean) => void,
): () => void {
  let disposed = false;
  let unlisten: (() => void) | undefined;
  controller.update({ trackpadAvailable: false });
  const stop = observeTrackpad(
    source,
    (available) => {
      controller.update({ trackpadAvailable: available });
      onAvailability?.(available);
    },
    onError,
  );
  void Promise.resolve()
    .then(() =>
      source.subscribe((event) => {
        if (!disposed) controller.gesture(event);
      }),
    )
    .then((cleanup) => {
      if (disposed) cleanup();
      else unlisten = cleanup;
    })
    .catch((error) => {
      if (!disposed) {
        stop();
        controller.update({ trackpadAvailable: false });
        onError(error);
      }
    });
  return () => {
    disposed = true;
    stop();
    unlisten?.();
    controller.update({ trackpadAvailable: false });
  };
}

import {
  applyLayout2
} from "./chunk-8mrnnw0c.js";
import {
  resolveReleaseSnap2
} from "./chunk-rpz9r67m.js";

// src/hover.ts
import { animate } from "motion";
function attachHoverNavigation(root, api, options, blocked, onChange) {
  const navigation = root.querySelector("[data-atlas-navigation]");
  const surface = navigation?.querySelector("[data-atlas-navigation-surface]");
  if (!navigation || !surface)
    return { update() {}, dispose() {} };
  const properties = ["translate", "width", "opacity", "transform"];
  let savedStyle = [];
  let savedInert = surface.inert;
  const media = root.ownerDocument.defaultView.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let floating = false;
  let disposed = false;
  let pointerX = null;
  let triggerHovered = false;
  let triggerReady = false;
  let blockedUntilLeave = false;
  let approachFromX = null;
  let timer;
  let animation;
  let animationGeneration = 0;
  const captures = new Set;
  const clearTrigger = () => {
    clearTimeout(timer);
    timer = undefined;
    triggerReady = false;
  };
  const popup = () => {
    const selector = "[data-popup-open], [aria-haspopup][aria-expanded='true']";
    return surface.matches(selector) || surface.querySelector(selector) !== null;
  };
  const eligible = () => options().navigationPinned === false && options().hoverNavigation !== false && !blocked() && !api.internalEngine().slideRegistry[api.selectedScrollSnap()]?.some((index) => {
    const region = api.slideNodes()[index];
    return region?.hasAttribute("data-atlas-leading") && region.offsetWidth > 0;
  });
  const reset = () => {
    animationGeneration += 1;
    animation?.stop();
    visible = false;
    if (!floating)
      return;
    floating = false;
    delete navigation.dataset.atlasFloating;
    delete root.dataset.atlasNavigationPeeking;
    properties.forEach((property, index) => {
      const value = savedStyle[index];
      if (value)
        surface.style.setProperty(property, value);
      else
        surface.style.removeProperty(property);
    });
    surface.inert = savedInert;
    onChange(false);
  };
  const setVisible = (next) => {
    if (next === visible)
      return;
    animation?.stop();
    visible = next;
    if (next && !floating) {
      savedStyle = properties.map((property) => surface.style.getPropertyValue(property));
      savedInert = surface.inert;
      const bounds = root.getBoundingClientRect();
      const parent = navigation.getBoundingClientRect();
      const rootStyle = getComputedStyle(root);
      const rtl = rootStyle.direction === "rtl";
      const offset = rtl ? bounds.right - Number.parseFloat(rootStyle.paddingRight) - parent.right : bounds.left + Number.parseFloat(rootStyle.paddingLeft) - parent.left;
      navigation.dataset.atlasFloating = "";
      root.dataset.atlasNavigationPeeking = "";
      surface.style.translate = `${offset}px 0`;
      surface.style.width = `${(options().navigationWidth ?? 248) + 4 * (options().gutter ?? 4)}px`;
      surface.style.opacity = "0";
      surface.style.transform = `translateX(${rtl ? 8 : -8}px)`;
      floating = true;
      onChange(true);
    }
    surface.inert = true;
    const rtl = getComputedStyle(root).direction === "rtl";
    const generation = ++animationGeneration;
    const opacity = Number.parseFloat(getComputedStyle(surface).opacity) || 0;
    animation = animate(opacity, next ? 1 : 0, {
      type: media.matches ? "tween" : "spring",
      duration: media.matches ? 0 : 0.5,
      bounce: 0.1,
      onUpdate: (value) => {
        if (disposed || generation !== animationGeneration)
          return;
        surface.style.opacity = String(value);
        surface.style.transform = `translateX(${(1 - value) * (rtl ? 8 : -8)}px)`;
      },
      onComplete: () => {
        if (disposed || generation !== animationGeneration)
          return;
        if (!visible)
          reset();
        else
          surface.inert = false;
      }
    });
  };
  const evaluate = () => {
    if (!eligible()) {
      if (options().navigationPinned)
        blockedUntilLeave = true;
      clearTrigger();
      reset();
      return;
    }
    const bounds = root.getBoundingClientRect();
    const rtl = getComputedStyle(root).direction === "rtl";
    const x = pointerX === null ? null : rtl ? bounds.right - pointerX : pointerX - bounds.left;
    const edge = x !== null && x >= 0 && x <= Math.max(4, options().gutter ?? 4);
    if (blockedUntilLeave) {
      blockedUntilLeave = edge || triggerHovered;
      if (blockedUntilLeave)
        return;
    }
    const inside = x !== null && x >= 0 && x <= (options().navigationWidth ?? 248) + 3 * (options().gutter ?? 4);
    if (triggerReady && !inside)
      approachFromX = x;
    else if (inside || x === null || approachFromX === null || x > approachFromX)
      approachFromX = null;
    setVisible(visible ? inside || popup() || captures.size > 0 || triggerReady || approachFromX !== null : edge || triggerReady);
  };
  const move = (event) => {
    if (event.pointerType !== "mouse")
      return;
    pointerX = event.clientX;
    const target = event.target instanceof Element ? event.target.closest("[data-atlas-navigation-trigger]") : null;
    const hovered = !!target && (root.contains(target) || [navigation.id, surface.id].some((id) => !!id && target.getAttribute("aria-controls") === id));
    if (triggerHovered !== hovered) {
      triggerHovered = hovered;
      clearTrigger();
      if (hovered && eligible() && !blockedUntilLeave)
        timer = setTimeout(() => {
          timer = undefined;
          triggerReady = true;
          evaluate();
        }, 100);
    }
    evaluate();
  };
  const leave = () => {
    pointerX = null;
    triggerHovered = false;
    clearTrigger();
    evaluate();
  };
  const out = (event) => {
    if (event.relatedTarget === null)
      leave();
  };
  const capture = (event) => {
    if (event.target instanceof Node && surface.contains(event.target))
      captures.add(event.pointerId);
  };
  const release = (event) => {
    captures.delete(event.pointerId);
    evaluate();
  };
  const key = (event) => {
    if (event.key === "Escape" && !popup()) {
      blockedUntilLeave = true;
      setVisible(false);
    }
  };
  const dismiss = (event) => {
    if (!visible || popup() || !(event.target instanceof Element))
      return;
    if (surface.contains(event.target) || event.target.closest("[data-atlas-navigation-trigger]"))
      return;
    blockedUntilLeave = true;
    setVisible(false);
  };
  const motionChange = () => {
    if (media.matches && floating) {
      if (!visible)
        reset();
      else {
        animationGeneration += 1;
        animation?.stop();
        surface.style.opacity = "1";
        surface.style.transform = "translateX(0px)";
        surface.inert = false;
      }
    }
    evaluate();
  };
  const observer = new MutationObserver(evaluate);
  observer.observe(surface, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-popup-open", "aria-expanded"]
  });
  window.addEventListener("pointermove", move, {
    capture: true,
    passive: true
  });
  window.addEventListener("pointerout", out, true);
  window.addEventListener("blur", leave);
  window.addEventListener("gotpointercapture", capture, true);
  window.addEventListener("lostpointercapture", release, true);
  window.addEventListener("keydown", key);
  window.addEventListener("pointerdown", dismiss);
  media.addEventListener("change", motionChange);
  api.on("scroll", reset).on("reInit", reset).on("pointerDown", reset);
  return {
    update: evaluate,
    dispose() {
      disposed = true;
      clearTrigger();
      reset();
      observer.disconnect();
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerout", out, true);
      window.removeEventListener("blur", leave);
      window.removeEventListener("gotpointercapture", capture, true);
      window.removeEventListener("lostpointercapture", release, true);
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", dismiss);
      media.removeEventListener("change", motionChange);
      api.off("scroll", reset).off("reInit", reset).off("pointerDown", reset);
    }
  };
}

// src/dom.ts
import EmblaCarousel from "embla-carousel";

// src/input.ts
function attachInput(api, blocked, flickMinIndex = 0, panButton = "middle") {
  const root = api.rootNode();
  let owner = null;
  let mouseButton = null;
  let previousCursor = "";
  const isPanButton = (button) => panButton === "side" ? button === 3 || button === 4 : button === 1;
  let x = 0;
  let startIndex = 0;
  let startLocation = 0;
  let width = 0;
  let pointerId = null;
  let lastGestureTime = -Infinity;
  let secondaryUntil = -Infinity;
  let lastEnd = -Infinity;
  let disposed = false;
  const position = (value) => {
    const e = api.internalEngine();
    e.animation.stop();
    e.target.set(value);
    e.location.set(value);
    e.previousLocation.set(value);
    e.offsetLocation.set(value);
    e.scrollBody.useDuration(0).seek();
    e.translate.to(value);
  };
  const drag = (displacement) => {
    const e = api.internalEngine();
    const projected = startLocation + e.axis.direction(displacement);
    const edge = e.limit.constrain(projected);
    const overflow = projected - edge;
    const limit = Math.min(64, width * 0.06);
    position(edge + Math.sign(overflow) * limit * (1 - Math.exp(-Math.abs(overflow) * 0.18 / limit)));
    e.eventHandler.emit("scroll");
  };
  const restore = () => {
    api.scrollTo(Math.min(startIndex, api.scrollSnapList().length - 1));
  };
  const end = (cancelled) => {
    if (!owner)
      return;
    if (owner === "mouse")
      root.style.cursor = previousCursor;
    owner = null;
    mouseButton = null;
    const captured = pointerId;
    pointerId = null;
    if (captured !== null && root.hasPointerCapture(captured))
      root.releasePointerCapture(captured);
    const e = api.internalEngine();
    const location = e.location.get();
    const target = cancelled ? startIndex : resolveReleaseSnap2({
      startIndex,
      location,
      displacement: location - startLocation,
      snapPoints: e.scrollSnaps,
      viewportWidth: width,
      flickMinIndex
    });
    lastEnd = performance.now();
    e.eventHandler.emit("pointerUp");
    api.scrollTo(Math.min(target, api.scrollSnapList().length - 1));
    if (e.target.get() === e.location.get())
      e.eventHandler.emit("settle");
  };
  const cancel = () => {
    if (owner)
      end(true);
  };
  const begin = (kind, initialX) => {
    if (owner || blocked() || performance.now() <= secondaryUntil)
      return;
    width = root.clientWidth;
    if (width <= 0)
      return;
    startIndex = api.selectedScrollSnap();
    startLocation = api.internalEngine().offsetLocation.get();
    position(startLocation);
    x = initialX;
    owner = kind;
    api.internalEngine().eventHandler.emit("pointerDown");
  };
  const secondary = () => {
    secondaryUntil = performance.now() + 300;
    const shouldRestore = owner !== null || performance.now() - lastEnd <= 300;
    end(true);
    if (shouldRestore)
      restore();
  };
  const down = (event) => {
    if (!(event.target instanceof Node) || !root.contains(event.target))
      return;
    if (event.target instanceof Element && event.target.closest("[data-atlas-viewport]") !== root)
      return;
    if (event.button === 2)
      secondary();
    if (!isPanButton(event.button) || event.target instanceof Element && event.target.closest("[data-no-drag], [role=separator]"))
      return;
    if (blocked() || owner)
      return;
    event.preventDefault();
    begin("mouse", event.clientX);
    if (owner === "mouse") {
      mouseButton = event.button;
      pointerId = event.pointerId;
      root.setPointerCapture(event.pointerId);
      previousCursor = root.style.cursor;
      root.style.cursor = "grabbing";
    }
  };
  const move = (event) => {
    if (owner !== "mouse" || event.pointerId !== pointerId)
      return;
    if (blocked()) {
      cancel();
      return;
    }
    const mask = mouseButton === 1 ? 4 : mouseButton === 3 ? 8 : 16;
    if (!(event.buttons & mask)) {
      end(false);
      return;
    }
    drag(event.clientX - x);
  };
  const up = (event) => {
    if (owner === "mouse" && event.pointerId === pointerId && event.button === mouseButton) {
      event.preventDefault();
      end(false);
    }
  };
  const auxclick = (event) => {
    if (isPanButton(event.button) && event.target instanceof Element && !event.target.closest("[data-no-drag], [role=separator]"))
      event.preventDefault();
  };
  const menu = (event) => {
    if (event.target instanceof Node && root.contains(event.target))
      secondary();
  };
  const scroll = () => {
    root.scrollLeft = 0;
    root.scrollTop = 0;
  };
  const reinit = () => cancel();
  const pointerCancel = (event) => {
    if (owner === "mouse" && event.pointerId === pointerId)
      cancel();
  };
  window.addEventListener("pointerdown", down, true);
  window.addEventListener("contextmenu", menu, true);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  root.addEventListener("pointercancel", pointerCancel);
  root.addEventListener("lostpointercapture", pointerCancel);
  window.addEventListener("blur", cancel);
  root.addEventListener("scroll", scroll);
  root.addEventListener("auxclick", auxclick);
  api.on("reInit", reinit);
  return {
    gesture(event) {
      if (disposed)
        return;
      if (![event.totalDx, event.totalDy, event.ts].every(Number.isFinite))
        throw new Error("Invalid trackpad position or timestamp");
      if (event.ts < lastGestureTime)
        return;
      lastGestureTime = event.ts;
      if (event.fingers !== 3) {
        if (owner === "trackpad")
          cancel();
        return;
      }
      if (blocked()) {
        cancel();
        return;
      }
      if (event.phase === "began") {
        if (owner === "trackpad")
          cancel();
        begin("trackpad", 0);
        if (owner === "trackpad")
          drag(event.totalDx * width);
      } else if (owner === "trackpad") {
        if (event.phase === "changed")
          drag(event.totalDx * width);
        else if (event.phase === "ended") {
          drag(event.totalDx * width);
          end(false);
        } else if (event.phase === "cancelled")
          cancel();
        else
          throw new Error("Invalid trackpad phase");
      }
    },
    cancel,
    dispose() {
      if (disposed)
        return;
      cancel();
      disposed = true;
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("contextmenu", menu, true);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", pointerCancel);
      root.removeEventListener("lostpointercapture", pointerCancel);
      window.removeEventListener("blur", cancel);
      root.removeEventListener("scroll", scroll);
      root.removeEventListener("auxclick", auxclick);
      api.off("reInit", reinit);
    }
  };
}

// src/dom.ts
function isViewportResize2(root, entries) {
  return entries.some((entry) => entry.target === root.querySelector("[data-atlas-track]"));
}
function createAtlas2(root, initial = {}) {
  const initialDirection = root.getAttribute("dir");
  const initialViewport = root.getAttribute("data-atlas-viewport");
  root.setAttribute("data-atlas-viewport", "");
  let options = {
    ...initial,
    direction: initial.direction ?? (getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr")
  };
  root.dir = options.direction;
  const initialStyle = root.getAttribute("style");
  const initialPinned = root.getAttribute("data-atlas-navigation-pinned");
  const initialRail = root.getAttribute("data-atlas-reserve-leading-rail");
  let layout = applyLayout2(root, options);
  const track = root.querySelector("[data-atlas-track]");
  if (!track)
    throw new Error("Atlas requires a data-atlas-track element");
  const readRegions = () => {
    const nodes = options.regions ? [...track.querySelectorAll(options.regions)] : [...track.children];
    const ids = nodes.flatMap((node) => node.dataset.atlasRegion ? [node.dataset.atlasRegion] : []);
    if (!ids.length || new Set(ids).size !== ids.length)
      throw new Error("Atlas region IDs must be nonempty and unique");
    return nodes;
  };
  let nodes = readRegions();
  let disposed = false;
  let suspended = false;
  let moving = false;
  let restoring = false;
  const listeners = new Set;
  const original = new Map;
  const api = EmblaCarousel(root, {
    container: track,
    axis: "x",
    direction: options.direction ?? "ltr",
    align: "start",
    slides: options.regions,
    containScroll: options.contain === false ? false : "keepSnaps",
    slidesToScroll: options.groupRegions === false ? 1 : "auto",
    watchResize: (_api, entries) => {
      if (suspended || options.watchResize === false)
        return false;
      if (typeof options.watchResize === "function") {
        options.watchResize(root, entries);
        return false;
      }
      return true;
    },
    watchSlides: () => !suspended && options.watchRegions !== false,
    watchDrag: false
  });
  const blocked = () => suspended || root.closest("[inert]") !== null || !!options.blocked?.() || !!root.ownerDocument.querySelector('[role="dialog"][data-open], [role="dialog"][data-state="open"], [role="alertdialog"][data-open], [role="alertdialog"][data-state="open"], dialog[open]');
  let input = attachInput(api, blocked, options.flickMinIndex, options.panButton);
  const hover = attachHoverNavigation(root, api, () => options, blocked, (peeking) => options.onNavigationChange?.(peeking));
  const idsAt = (index) => (api.internalEngine().slideRegistry[index] ?? []).flatMap((i) => nodes[i]?.dataset.atlasRegion ? [nodes[i].dataset.atlasRegion] : []);
  let state = {
    activeRegion: null,
    visibleRegions: [],
    moving: false
  };
  let requested = options.initialRegion ?? null;
  const publish = () => {
    if (disposed || restoring)
      return;
    const visibleRegions = idsAt(api.selectedScrollSnap());
    const activeRegion = requested && visibleRegions.includes(requested) ? requested : visibleRegions[0] ?? null;
    requested = activeRegion;
    for (const node of nodes) {
      if (options.manageInert === false || !node.dataset.atlasRegion)
        continue;
      if (!original.has(node))
        original.set(node, {
          inert: node.inert,
          hidden: node.getAttribute("aria-hidden")
        });
      const visible = visibleRegions.includes(node.dataset.atlasRegion);
      node.inert = !visible;
      node.setAttribute("aria-hidden", String(!visible));
    }
    if (state.activeRegion === activeRegion && state.moving === moving && state.visibleRegions.join("\x00") === visibleRegions.join("\x00"))
      return;
    state = Object.freeze({
      activeRegion,
      visibleRegions: Object.freeze(visibleRegions),
      moving
    });
    listeners.forEach((listener) => listener(state));
  };
  const snapFor = (id) => {
    const node = nodes.findIndex((node) => node.dataset.atlasRegion === id);
    if (node === -1)
      return -1;
    return api.internalEngine().slideRegistry.findIndex((group) => group.includes(node));
  };
  const goTo = (region, settings = {}) => {
    if (disposed)
      throw new Error("Atlas is destroyed");
    const snap = snapFor(region);
    if (snap < 0)
      throw new Error(`Unknown Atlas region: ${region}`);
    if (suspended)
      return;
    input.cancel();
    requested = region;
    const instant = settings.instant ?? root.ownerDocument.defaultView.matchMedia("(prefers-reduced-motion: reduce)").matches;
    moving = !instant && snap !== api.selectedScrollSnap();
    const wasRestoring = restoring;
    if (instant)
      restoring = true;
    api.scrollTo(snap, instant);
    restoring = wasRestoring;
    if (instant)
      moving = false;
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
    if (suspended)
      return;
    const previous = state.activeRegion;
    const previousIndex = nodes.findIndex((node) => node.dataset.atlasRegion === previous);
    nodes = readRegions();
    const replacement = previous && snapFor(previous) >= 0 ? previous : nodes.slice(Math.max(0, previousIndex)).find((node) => node.dataset.atlasRegion)?.dataset.atlasRegion ?? nodes.toReversed().find((node) => node.dataset.atlasRegion)?.dataset.atlasRegion;
    if (replacement) {
      requested = replacement;
      api.scrollTo(snapFor(replacement), true);
    }
    moving = false;
    publish();
  };
  api.on("select", select).on("scroll", scroll).on("settle", settle).on("reInit", rebuild);
  const keydown = (event) => {
    if (event.target !== root || blocked() || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
      return;
    event.preventDefault();
    input.cancel();
    const direction = options.direction === "rtl" ? -1 : 1;
    const next = event.key === "Home" ? 0 : event.key === "End" ? api.scrollSnapList().length - 1 : api.selectedScrollSnap() + (event.key === "ArrowRight" ? direction : -direction);
    const snap = Math.max(0, Math.min(next, api.scrollSnapList().length - 1));
    const region = idsAt(snap)[0];
    if (region)
      goTo(region);
  };
  root.addEventListener("keydown", keydown);
  const observer = new MutationObserver(() => {
    if (blocked())
      input.cancel();
  });
  observer.observe(root.ownerDocument.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["inert", "data-open", "data-state", "open"]
  });
  if (options.initialRegion)
    goTo(options.initialRegion, { instant: true });
  else
    publish();
  const controller = {
    root,
    track,
    getGeometry() {
      const engine = api.internalEngine();
      return {
        selected: api.selectedScrollSnap(),
        groups: engine.slideRegistry.map((group) => [...group]),
        snaps: [...api.scrollSnapList()],
        offsets: engine.scrollSnaps.map((value) => value * (options.direction === "rtl" ? -1 : 1)),
        regions: [...api.slideNodes()],
        location: engine.location.get() * (options.direction === "rtl" ? -1 : 1),
        target: engine.target.get() * (options.direction === "rtl" ? -1 : 1),
        progress: api.scrollProgress()
      };
    },
    goToSnap(index, settings = {}) {
      const ids = idsAt(index);
      const region = requested && ids.includes(requested) ? requested : ids[0];
      if (!region)
        throw new Error(`Unknown Atlas snap: ${index}`);
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
      if (disposed || suspended)
        return;
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
      if (disposed)
        return;
      suspended = false;
      api.reInit();
      if (index !== undefined)
        controller.goToSnap(index, { instant: true });
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
      if (disposed)
        return;
      const old = options;
      options = {
        ...options,
        ...next,
        direction: next.direction ?? options.direction
      };
      root.dir = options.direction;
      const nextLayout = applyLayout2(root, options);
      const layoutChanged = JSON.stringify(layout) !== JSON.stringify(nextLayout);
      layout = nextLayout;
      hover.update();
      if (old.trackpadEnabled && !options.trackpadEnabled || old.trackpadAvailable && !options.trackpadAvailable)
        input.cancel();
      if (old.flickMinIndex !== options.flickMinIndex || old.panButton !== options.panButton) {
        input.dispose();
        input = attachInput(api, blocked, options.flickMinIndex, options.panButton);
      }
      if (!suspended && (old.direction !== options.direction || layoutChanged)) {
        restoring = true;
        input.cancel();
        api.reInit({ direction: options.direction ?? "ltr" });
        restoring = false;
        rebuild();
      }
    },
    refresh(next = {}) {
      if (disposed || suspended)
        return;
      options = { ...options, ...next };
      root.dir = options.direction;
      api.reInit({ direction: options.direction });
    },
    gesture(event) {
      if (!disposed && options.trackpadEnabled && options.trackpadAvailable)
        input.gesture(event);
    },
    destroy() {
      if (disposed)
        return;
      disposed = true;
      observer.disconnect();
      hover.dispose();
      root.removeEventListener("keydown", keydown);
      input.dispose();
      api.destroy();
      listeners.clear();
      if (initialDirection === null)
        root.removeAttribute("dir");
      else
        root.setAttribute("dir", initialDirection);
      if (initialStyle === null)
        root.removeAttribute("style");
      else
        root.setAttribute("style", initialStyle);
      for (const [key, value] of [
        ["data-atlas-viewport", initialViewport],
        ["data-atlas-navigation-pinned", initialPinned],
        ["data-atlas-reserve-leading-rail", initialRail]
      ]) {
        if (value === null)
          root.removeAttribute(key);
        else
          root.setAttribute(key, value);
      }
      for (const [node, attributes] of original) {
        node.inert = attributes.inert;
        if (attributes.hidden === null)
          node.removeAttribute("aria-hidden");
        else
          node.setAttribute("aria-hidden", attributes.hidden);
      }
    }
  };
  return controller;
}
function observeTrackpad2(source, onAvailability, onError, intervalMs = 5000) {
  let disposed = false;
  let pending = false;
  const refresh = async () => {
    if (disposed || pending || document.hidden)
      return;
    pending = true;
    try {
      const available = await source.available();
      if (!disposed)
        onAvailability(available);
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
function connectTrackpad2(controller, source, onError, onAvailability) {
  let disposed = false;
  let unlisten;
  controller.update({ trackpadAvailable: false });
  const stop = observeTrackpad2(source, (available) => {
    controller.update({ trackpadAvailable: available });
    onAvailability?.(available);
  }, onError);
  Promise.resolve().then(() => source.subscribe((event) => {
    if (!disposed)
      controller.gesture(event);
  })).then((cleanup) => {
    if (disposed)
      cleanup();
    else
      unlisten = cleanup;
  }).catch((error) => {
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

export { isViewportResize2, createAtlas2, observeTrackpad2, connectTrackpad2 };

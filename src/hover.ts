import { animate } from "motion";
import type { EmblaCarouselType } from "embla-carousel";
import type { AtlasLayoutOptions } from "./layout";

/** Adapted from Desktop Atlas navigation hover: same mounted surface, 4px edge,
 * 100ms trigger intent, 8px/0.5s spring, popup and pointer-capture retention. */
export function attachHoverNavigation(
  root: HTMLElement,
  api: EmblaCarouselType,
  options: () => AtlasLayoutOptions,
  blocked: () => boolean,
  onChange: (peeking: boolean) => void,
) {
  const navigation = root.querySelector<HTMLElement>("[data-atlas-navigation]");
  const surface = navigation?.querySelector<HTMLElement>(
    "[data-atlas-navigation-surface]",
  );
  if (!navigation || !surface) return { update() {}, dispose() {} };
  const properties = ["translate", "width", "opacity", "transform"] as const;
  let savedStyle: string[] = [];
  let savedInert = surface.inert;
  const media = root.ownerDocument.defaultView!.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let visible = false;
  let floating = false;
  let disposed = false;
  let pointerX: number | null = null;
  let triggerHovered = false;
  let triggerReady = false;
  let blockedUntilLeave = false;
  let approachFromX: number | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let animation: ReturnType<typeof animate> | undefined;
  let animationGeneration = 0;
  const captures = new Set<number>();
  const clearTrigger = () => {
    clearTimeout(timer);
    timer = undefined;
    triggerReady = false;
  };
  const popup = () => {
    const selector = "[data-popup-open], [aria-haspopup][aria-expanded='true']";
    return (
      surface.matches(selector) || surface.querySelector(selector) !== null
    );
  };
  const eligible = () =>
    options().navigationPinned === false &&
    options().hoverNavigation !== false &&
    !blocked() &&
    !api
      .internalEngine()
      .slideRegistry[api.selectedScrollSnap()]?.some((index) => {
        const region = api.slideNodes()[index];
        return (
          region?.hasAttribute("data-atlas-leading") && region.offsetWidth > 0
        );
      });
  const reset = () => {
    animationGeneration += 1;
    animation?.stop();
    visible = false;
    if (!floating) return;
    floating = false;
    delete navigation.dataset.atlasFloating;
    delete root.dataset.atlasNavigationPeeking;
    properties.forEach((property, index) => {
      const value = savedStyle[index];
      if (value) surface.style.setProperty(property, value);
      else surface.style.removeProperty(property);
    });
    surface.inert = savedInert;
    onChange(false);
  };
  const setVisible = (next: boolean) => {
    if (next === visible) return;
    animation?.stop();
    visible = next;
    if (next && !floating) {
      savedStyle = properties.map((property) =>
        surface.style.getPropertyValue(property),
      );
      savedInert = surface.inert;
      const bounds = root.getBoundingClientRect();
      const parent = navigation.getBoundingClientRect();
      const rootStyle = getComputedStyle(root);
      const rtl = rootStyle.direction === "rtl";
      const offset = rtl
        ? bounds.right -
          Number.parseFloat(rootStyle.paddingRight) -
          parent.right
        : bounds.left + Number.parseFloat(rootStyle.paddingLeft) - parent.left;
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
        if (disposed || generation !== animationGeneration) return;
        surface.style.opacity = String(value);
        surface.style.transform = `translateX(${(1 - value) * (rtl ? 8 : -8)}px)`;
      },
      onComplete: () => {
        if (disposed || generation !== animationGeneration) return;
        if (!visible) reset();
        else surface.inert = false;
      },
    });
  };
  const evaluate = () => {
    if (!eligible()) {
      if (options().navigationPinned) blockedUntilLeave = true;
      clearTrigger();
      reset();
      return;
    }
    const bounds = root.getBoundingClientRect();
    const rtl = getComputedStyle(root).direction === "rtl";
    const x =
      pointerX === null
        ? null
        : rtl
          ? bounds.right - pointerX
          : pointerX - bounds.left;
    const edge =
      x !== null && x >= 0 && x <= Math.max(4, options().gutter ?? 4);
    if (blockedUntilLeave) {
      blockedUntilLeave = edge || triggerHovered;
      if (blockedUntilLeave) return;
    }
    const inside =
      x !== null &&
      x >= 0 &&
      x <= (options().navigationWidth ?? 248) + 3 * (options().gutter ?? 4);
    if (triggerReady && !inside) approachFromX = x;
    else if (
      inside ||
      x === null ||
      approachFromX === null ||
      x > approachFromX
    )
      approachFromX = null;
    setVisible(
      visible
        ? inside ||
            popup() ||
            captures.size > 0 ||
            triggerReady ||
            approachFromX !== null
        : edge || triggerReady,
    );
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    pointerX = event.clientX;
    const target =
      event.target instanceof Element
        ? event.target.closest("[data-atlas-navigation-trigger]")
        : null;
    const hovered =
      !!target &&
      (root.contains(target) ||
        [navigation.id, surface.id].some(
          (id) => !!id && target.getAttribute("aria-controls") === id,
        ));
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
  const out = (event: PointerEvent) => {
    if (event.relatedTarget === null) leave();
  };
  const capture = (event: PointerEvent) => {
    if (event.target instanceof Node && surface.contains(event.target))
      captures.add(event.pointerId);
  };
  const release = (event: PointerEvent) => {
    captures.delete(event.pointerId);
    evaluate();
  };
  const key = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !popup()) {
      blockedUntilLeave = true;
      setVisible(false);
    }
  };
  const dismiss = (event: PointerEvent) => {
    if (!visible || popup() || !(event.target instanceof Element)) return;
    if (
      surface.contains(event.target) ||
      event.target.closest("[data-atlas-navigation-trigger]")
    )
      return;
    blockedUntilLeave = true;
    setVisible(false);
  };
  const motionChange = () => {
    if (media.matches && floating) {
      if (!visible) reset();
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
    attributeFilter: ["data-popup-open", "aria-expanded"],
  });
  window.addEventListener("pointermove", move, {
    capture: true,
    passive: true,
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
    },
  };
}

import type { EmblaCarouselType } from "embla-carousel";
import { resolveReleaseSnap, type TrackpadGesture } from "./core";

/** Native gestures and mouse panning share one direct-position owner. */
export function attachInput(
  api: EmblaCarouselType,
  blocked: () => boolean,
  flickMinIndex = 0,
  panButton: "middle" | "side" = "middle",
): {
  gesture: (event: TrackpadGesture) => void;
  cancel: () => void;
  dispose: () => void;
} {
  const root = api.rootNode();
  let owner: "trackpad" | "mouse" | null = null;
  let mouseButton: number | null = null;
  let previousCursor = "";
  const isPanButton = (button: number) =>
    panButton === "side" ? button === 3 || button === 4 : button === 1;
  let x = 0;
  let startIndex = 0;
  let startLocation = 0;
  let width = 0;
  let pointerId: number | null = null;
  let lastGestureTime = -Infinity;
  let secondaryUntil = -Infinity;
  let lastEnd = -Infinity;
  let disposed = false;
  // Stop Embla while dragging: bounds and interpolation must not apply a second
  // resistance curve or overwrite a newer input position.
  const position = (value: number): void => {
    const e = api.internalEngine();
    e.animation.stop();
    e.target.set(value);
    e.location.set(value);
    e.previousLocation.set(value);
    e.offsetLocation.set(value);
    e.scrollBody.useDuration(0).seek();
    e.translate.to(value);
  };
  const drag = (displacement: number): void => {
    const e = api.internalEngine();
    const projected = startLocation + e.axis.direction(displacement);
    const edge = e.limit.constrain(projected);
    const overflow = projected - edge;
    const limit = Math.min(64, width * 0.06);
    position(
      edge +
        Math.sign(overflow) *
          limit *
          (1 - Math.exp((-Math.abs(overflow) * 0.18) / limit)),
    );
    e.eventHandler.emit("scroll");
  };
  const restore = (): void => {
    api.scrollTo(Math.min(startIndex, api.scrollSnapList().length - 1));
  };
  const end = (cancelled: boolean): void => {
    if (!owner) return;
    if (owner === "mouse") root.style.cursor = previousCursor;
    owner = null;
    mouseButton = null;
    const captured = pointerId;
    pointerId = null;
    if (captured !== null && root.hasPointerCapture(captured))
      root.releasePointerCapture(captured);
    const e = api.internalEngine();
    const location = e.location.get();
    const target = cancelled
      ? startIndex
      : resolveReleaseSnap({
          startIndex,
          location,
          displacement: location - startLocation,
          snapPoints: e.scrollSnaps,
          viewportWidth: width,
          flickMinIndex,
        });
    lastEnd = performance.now();
    e.eventHandler.emit("pointerUp");
    api.scrollTo(Math.min(target, api.scrollSnapList().length - 1));
    // A tap at the existing snap has no animation to emit settle for it.
    if (e.target.get() === e.location.get()) e.eventHandler.emit("settle");
  };
  const cancel = (): void => {
    if (owner) end(true);
  };
  const begin = (kind: "trackpad" | "mouse", initialX: number): void => {
    if (owner || blocked() || performance.now() <= secondaryUntil) return;
    width = root.clientWidth;
    if (width <= 0) return;
    startIndex = api.selectedScrollSnap();
    startLocation = api.internalEngine().offsetLocation.get();
    position(startLocation);
    x = initialX;
    owner = kind;
    api.internalEngine().eventHandler.emit("pointerDown");
  };
  const secondary = (): void => {
    secondaryUntil = performance.now() + 300;
    const shouldRestore = owner !== null || performance.now() - lastEnd <= 300;
    end(true);
    if (shouldRestore) restore();
  };
  const down = (event: PointerEvent): void => {
    if (!(event.target instanceof Node) || !root.contains(event.target)) return;
    if (
      event.target instanceof Element &&
      event.target.closest("[data-atlas-viewport]") !== root
    )
      return;
    if (event.button === 2) secondary();
    if (
      !isPanButton(event.button) ||
      (event.target instanceof Element &&
        event.target.closest("[data-no-drag], [role=separator]"))
    )
      return;
    if (blocked() || owner) return;
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
  const move = (event: PointerEvent): void => {
    if (owner !== "mouse" || event.pointerId !== pointerId) return;
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
  const up = (event: PointerEvent): void => {
    if (
      owner === "mouse" &&
      event.pointerId === pointerId &&
      event.button === mouseButton
    ) {
      event.preventDefault();
      end(false);
    }
  };
  const auxclick = (event: MouseEvent): void => {
    if (
      isPanButton(event.button) &&
      event.target instanceof Element &&
      !event.target.closest("[data-no-drag], [role=separator]")
    )
      event.preventDefault();
  };
  const menu = (event: MouseEvent): void => {
    if (event.target instanceof Node && root.contains(event.target))
      secondary();
  };
  const scroll = (): void => {
    root.scrollLeft = 0;
    root.scrollTop = 0;
  };
  const reinit = (): void => cancel();
  const pointerCancel = (event: PointerEvent): void => {
    if (owner === "mouse" && event.pointerId === pointerId) cancel();
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
    gesture(event): void {
      if (disposed) return;
      if (![event.totalDx, event.totalDy, event.ts].every(Number.isFinite))
        throw new Error("Invalid trackpad position or timestamp");
      if (event.ts < lastGestureTime) return;
      lastGestureTime = event.ts;
      if (event.fingers !== 3) {
        if (owner === "trackpad") cancel();
        return;
      }
      if (blocked()) {
        cancel();
        return;
      }
      if (event.phase === "began") {
        if (owner === "trackpad") cancel();
        begin("trackpad", 0);
        if (owner === "trackpad") drag(event.totalDx * width);
      } else if (owner === "trackpad") {
        if (event.phase === "changed") drag(event.totalDx * width);
        else if (event.phase === "ended") {
          drag(event.totalDx * width);
          end(false);
        } else if (event.phase === "cancelled") cancel();
        else throw new Error("Invalid trackpad phase");
      }
    },
    cancel,
    dispose(): void {
      if (disposed) return;
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
    },
  };
}

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { TrackpadGesture, TrackpadSource } from "./core";
export function tauriTrackpad(
  options: { command?: string; event?: string } = {},
): TrackpadSource {
  return {
    available: () => invoke<boolean>(options.command ?? "has_trackpad"),
    subscribe: (handler) =>
      listen<TrackpadGesture>(options.event ?? "trackpad-gesture", (event) =>
        handler(event.payload),
      ),
  };
}

/** Opt-in native dragging for Atlas's top inset only. */
export function attachWindowDrag(
  root: HTMLElement,
  onError: (error: unknown) => void,
) {
  const onPointerDown = (event: MouseEvent) => {
    if (event.button !== 0) return;
    const target = event.target;
    if (
      !(target instanceof Element) ||
      target.closest(
        'button, a, input, textarea, select, [contenteditable], [role="button"], [data-atlas-no-drag]',
      )
    )
      return;
    const bounds = root.getBoundingClientRect();
    const top = Number.parseFloat(getComputedStyle(root).paddingTop);
    if (event.clientY < bounds.top || event.clientY >= bounds.top + top) return;
    event.preventDefault();
    void import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) =>
        event.detail === 2
          ? getCurrentWindow().toggleMaximize()
          : getCurrentWindow().startDragging(),
      )
      .catch(onError);
  };
  root.addEventListener("mousedown", onPointerDown);
  return () => root.removeEventListener("mousedown", onPointerDown);
}

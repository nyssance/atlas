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

/** Mark the top inset as a native Tauri drag region. No mouse handling. */
export function attachWindowDrag(
  root: HTMLElement,
  _onError: (error: unknown) => void,
) {
  const existing = root.querySelector<HTMLElement>(
    ":scope > [data-atlas-topbar]",
  );
  const topbar = existing ?? root.ownerDocument.createElement("div");
  const previous = topbar.getAttribute("data-tauri-drag-region");
  topbar.setAttribute("data-tauri-drag-region", "deep");
  if (!existing) {
    topbar.setAttribute("data-atlas-topbar", "");
    root.append(topbar);
  }
  return () => {
    if (!existing) topbar.remove();
    else if (previous === null)
      topbar.removeAttribute("data-tauri-drag-region");
    else topbar.setAttribute("data-tauri-drag-region", previous);
  };
}

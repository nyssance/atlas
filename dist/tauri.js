// src/tauri.ts
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
function tauriTrackpad(options = {}) {
  return {
    available: () => invoke(options.command ?? "has_trackpad"),
    subscribe: (handler) => listen(options.event ?? "trackpad-gesture", (event) => handler(event.payload))
  };
}
function attachWindowDrag(root, _onError) {
  const existing = root.querySelector(":scope > [data-atlas-topbar]");
  const topbar = existing ?? root.ownerDocument.createElement("div");
  const previous = topbar.getAttribute("data-tauri-drag-region");
  topbar.setAttribute("data-tauri-drag-region", "deep");
  if (!existing) {
    topbar.setAttribute("data-atlas-topbar", "");
    root.append(topbar);
  }
  return () => {
    if (!existing)
      topbar.remove();
    else if (previous === null)
      topbar.removeAttribute("data-tauri-drag-region");
    else
      topbar.setAttribute("data-tauri-drag-region", previous);
  };
}
export {
  attachWindowDrag,
  tauriTrackpad
};

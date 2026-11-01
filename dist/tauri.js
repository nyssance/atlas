// src/tauri.ts
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
function tauriTrackpad(options = {}) {
  return {
    available: () => invoke(options.command ?? "has_trackpad"),
    subscribe: (handler) => listen(options.event ?? "trackpad-gesture", (event) => handler(event.payload))
  };
}
function attachWindowDrag(root, onError) {
  const onPointerDown = (event) => {
    if (event.button !== 0)
      return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest('button, a, input, textarea, select, [contenteditable], [role="button"], [data-atlas-no-drag]'))
      return;
    const bounds = root.getBoundingClientRect();
    const top = Number.parseFloat(getComputedStyle(root).paddingTop);
    if (event.clientY < bounds.top || event.clientY >= bounds.top + top)
      return;
    event.preventDefault();
    import("@tauri-apps/api/window").then(({ getCurrentWindow }) => event.detail === 2 ? getCurrentWindow().toggleMaximize() : getCurrentWindow().startDragging()).catch(onError);
  };
  root.addEventListener("mousedown", onPointerDown);
  return () => root.removeEventListener("mousedown", onPointerDown);
}
export {
  attachWindowDrag,
  tauriTrackpad
};

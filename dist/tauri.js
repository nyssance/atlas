// src/tauri.ts
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
function tauriTrackpad(options = {}) {
  return {
    available: () => invoke(options.command ?? "has_trackpad"),
    subscribe: (handler) => listen(options.event ?? "trackpad-gesture", (event) => handler(event.payload))
  };
}
export {
  tauriTrackpad
};

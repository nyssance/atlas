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

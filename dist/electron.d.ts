import type { TrackpadSource } from "./core";
/** Pass only a narrowly scoped bridge exposed by contextBridge in preload.
 * Electron's wheel events cannot identify three fingers. A native host source
 * must supply normalized gestures; absence of that source means unavailable. */
export declare function electronTrackpad(bridge: TrackpadSource): TrackpadSource;

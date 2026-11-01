import type { TrackpadSource } from "./core";
export declare function tauriTrackpad(options?: {
    command?: string;
    event?: string;
}): TrackpadSource;
/** Opt-in native dragging for Atlas's top inset only. */
export declare function attachWindowDrag(root: HTMLElement, onError: (error: unknown) => void): () => void;

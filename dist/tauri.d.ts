import type { TrackpadSource } from "./core";
export declare function tauriTrackpad(options?: {
    command?: string;
    event?: string;
}): TrackpadSource;
/** Mark the top inset as a native Tauri drag region. No mouse handling. */
export declare function attachWindowDrag(root: HTMLElement, _onError: (error: unknown) => void): () => void;

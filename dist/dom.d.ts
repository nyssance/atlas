import { type AtlasLayoutOptions } from "./layout";
import type { AtlasState, TrackpadGesture } from "./core";
export interface AtlasOptions extends AtlasLayoutOptions {
    initialRegion?: string;
    /** Transient overlay state; does not change the pinned preference. */
    onNavigationChange?: (peeking: boolean) => void;
    /** Optional snap markers for hosts with independently positioned regions. */
    regions?: string;
    groupRegions?: boolean;
    contain?: boolean;
    manageInert?: boolean;
    watchResize?: boolean | ((root: HTMLElement, entries: ResizeObserverEntry[]) => void);
    watchRegions?: boolean;
    direction?: "ltr" | "rtl";
    flickMinIndex?: number;
    /** Desktop mouse pan binding. Left-button selection stays with content. */
    panButton?: "middle" | "side";
    trackpadEnabled?: boolean;
    trackpadAvailable?: boolean;
    blocked?: () => boolean;
}
export type AtlasEvent = "select" | "scroll" | "settle" | "reInit" | "pointerDown" | "slidesInView";
export interface AtlasGeometry {
    selected: number;
    groups: number[][];
    snaps: number[];
    offsets: number[];
    regions: HTMLElement[];
    location: number;
    target: number;
    progress: number;
}
export interface AtlasController {
    readonly root: HTMLElement;
    readonly track: HTMLElement;
    getGeometry(): AtlasGeometry;
    goToSnap(index: number, options?: {
        instant?: boolean;
    }): void;
    on(event: AtlasEvent, listener: () => void): AtlasController;
    off(event: AtlasEvent, listener: () => void): AtlasController;
    cancelInput(): void;
    /** Release transform ownership for host overview animations. */
    suspend(): void;
    /** Re-measure after an overview and reclaim transform ownership. */
    resume(index?: number): void;
    getState(): AtlasState;
    subscribe(listener: (state: AtlasState) => void): () => void;
    goTo(region: string, options?: {
        instant?: boolean;
    }): void;
    update(options: Partial<AtlasOptions>): void;
    refresh(options?: Pick<AtlasOptions, "direction">): void;
    gesture(event: TrackpadGesture): void;
    destroy(): void;
}
/** Host-managed widths rebuild only for viewport/container resize. */
export declare function isViewportResize(root: HTMLElement, entries: ResizeObserverEntry[]): boolean;
/** The root contains one track; direct track children are regions or navigation.
 * Supply layout through styles.css or equivalent host styles. Never expose Embla. */
export declare function createAtlas(root: HTMLElement, initial?: AtlasOptions): AtlasController;
/** Shared device lifecycle for desktop hosts. Missing hardware never enables input. */
export declare function observeTrackpad(source: import("./core").TrackpadSource, onAvailability: (available: boolean) => void, onError: (error: unknown) => void, intervalMs?: number): () => void;
export declare function connectTrackpad(controller: AtlasController, source: import("./core").TrackpadSource, onError: (error: unknown) => void, onAvailability?: (available: boolean) => void): () => void;

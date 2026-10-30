import type { AtlasController } from "./dom";
export interface AtlasOverviewState {
    scale: number;
    padding: number;
    contentHeight: number;
    regions: {
        id: string;
        width: number;
        label: string;
    }[];
}
export interface AtlasOverviewOptions {
    label?: string;
    /** Visual panels when navigation uses separate snap markers. */
    regions?: string;
    regionLabel?: (id: string) => string;
    /** Host decorations may observe geometry without owning transforms. */
    onChange?: (state: AtlasOverviewState | null) => void;
    renderOverlay?: boolean;
    /** Disable only when replacing the complete overview presentation. */
    renderChrome?: boolean;
    openLink?: (url: string) => void;
    /** A host footer outside the Atlas root, such as a business status bar. */
    footer?: HTMLElement | null | (() => HTMLElement | null);
}
/** Live thumbnails reuse the mounted track, never screenshots or duplicate views. */
export declare function createOverview(controller: AtlasController, options: () => boolean | AtlasOverviewOptions): {
    enabled: () => boolean;
    update(): void;
    enter: () => void;
    exit: (id?: string) => void;
    toggle(): void;
    getState: () => AtlasOverviewState | null;
    subscribe(listener: (state: AtlasOverviewState | null) => void): () => void;
    dispose(): void;
};

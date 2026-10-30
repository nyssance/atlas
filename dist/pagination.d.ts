import type { AtlasController, AtlasGeometry } from "./dom";
export interface AtlasPaginationOptions {
    label?: string;
    container?: HTMLElement | null | (() => HTMLElement | null);
    overviewLabel?: string;
    pageLabel?: (index: number) => string;
}
export declare function paginationPages(geometry: AtlasGeometry): {
    snap: number;
    regions: string[];
}[];
/** Default indicator, outside the moving track. Disable it to render a custom view. */
export declare function attachPagination(controller: AtlasController, options: () => boolean | AtlasPaginationOptions): {
    render: () => void;
    dispose(): void;
};

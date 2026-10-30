import type { AtlasOverviewState } from "./overview";
/** Desktop's overview presentation, shared by every framework adapter. */
export declare function createOverviewChrome(root: HTMLElement, openLink: (url: string) => void): {
    update(state: AtlasOverviewState): void;
    dispose(): void;
};

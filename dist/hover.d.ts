import type { EmblaCarouselType } from "embla-carousel";
import type { AtlasLayoutOptions } from "./layout";
/** Adapted from Desktop Atlas navigation hover: same mounted surface, 4px edge,
 * 100ms trigger intent, 8px/0.5s spring, popup and pointer-capture retention. */
export declare function attachHoverNavigation(root: HTMLElement, api: EmblaCarouselType, options: () => AtlasLayoutOptions, blocked: () => boolean, onChange: (peeking: boolean) => void): {
    update(): void;
    dispose(): void;
};

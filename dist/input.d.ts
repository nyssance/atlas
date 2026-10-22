import type { EmblaCarouselType } from "embla-carousel";
import { type TrackpadGesture } from "./core";
/** Desktop atlas.tsx mouse panning: configurable middle/side buttons feed Embla
 * synthetic mouse events. One owner prevents overlap with native gestures. */
export declare function attachInput(api: EmblaCarouselType, blocked: () => boolean, flickMinIndex?: number, panButton?: "middle" | "side"): {
    gesture: (event: TrackpadGesture) => void;
    cancel: () => void;
    dispose: () => void;
};

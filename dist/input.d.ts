import type { EmblaCarouselType } from "embla-carousel";
import { type TrackpadGesture } from "./core";
/** Native gestures and mouse panning share one direct-position owner. */
export declare function attachInput(api: EmblaCarouselType, blocked: () => boolean, flickMinIndex?: number, panButton?: "middle" | "side"): {
    gesture: (event: TrackpadGesture) => void;
    cancel: () => void;
    dispose: () => void;
};

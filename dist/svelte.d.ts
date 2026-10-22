import type { Action } from "svelte/action";
import { type AtlasController, type AtlasOptions } from "./dom";
import type { AtlasState } from "./core";
export interface AtlasActionOptions extends AtlasOptions {
    onReady?: (atlas: AtlasController) => void;
    onStateChange?: (state: AtlasState) => void;
}
export declare const atlas: Action<HTMLElement, AtlasActionOptions | undefined>;

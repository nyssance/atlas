import { type AtlasController, type AtlasOptions } from "./dom";
import type { AtlasState } from "./core";
export declare function injectAtlas(options?: AtlasOptions): {
    atlas: import("@angular/core").Signal<AtlasController | null>;
    state: import("@angular/core").Signal<AtlasState>;
    update: (next: Partial<AtlasOptions>) => void | undefined;
};

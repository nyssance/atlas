import { type Ref } from "vue";
import { type AtlasController, type AtlasOptions } from "./dom";
import type { AtlasState } from "./core";
export declare function useAtlas(root: Ref<HTMLElement | null>, options?: () => AtlasOptions): {
    atlas: import("vue").ShallowRef<AtlasController | null, AtlasController | null>;
    state: import("vue").ShallowRef<AtlasState, AtlasState>;
};

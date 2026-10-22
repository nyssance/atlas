import type { Action } from "svelte/action";
import { createAtlas, type AtlasController, type AtlasOptions } from "./dom";
import type { AtlasState } from "./core";
export interface AtlasActionOptions extends AtlasOptions {
  onReady?: (atlas: AtlasController) => void;
  onStateChange?: (state: AtlasState) => void;
}
export const atlas: Action<HTMLElement, AtlasActionOptions | undefined> = (
  node,
  initial = {},
) => {
  let options = initial;
  const controller = createAtlas(node, options);
  options.onReady?.(controller);
  options.onStateChange?.(controller.getState());
  const stop = controller.subscribe((state) => options.onStateChange?.(state));
  return {
    update(next = {}) {
      options = next;
      controller.update(next);
    },
    destroy() {
      stop();
      controller.destroy();
    },
  };
};

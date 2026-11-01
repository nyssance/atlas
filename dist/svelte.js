import"./chunk-jw8ne0nx.js";
import {
  createAtlas2
} from "./chunk-4kxdk2qd.js";
import"./chunk-rpz9r67m.js";

// src/svelte.ts
import { untrack } from "svelte";
var atlas = (node, initial = {}) => {
  let options = initial;
  const controller = untrack(() => createAtlas2(node, options));
  options.onReady?.(controller);
  options.onStateChange?.(controller.getState());
  const stop = controller.subscribe((state) => options.onStateChange?.(state));
  return {
    update(next = {}) {
      options = next;
      untrack(() => controller.update(next));
    },
    destroy() {
      stop();
      controller.destroy();
    }
  };
};
export {
  atlas
};

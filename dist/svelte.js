import"./chunk-jyva3dz0.js";
import {
  createAtlas2
} from "./chunk-kmn21cpq.js";
import"./chunk-rpz9r67m.js";

// src/svelte.ts
var atlas = (node, initial = {}) => {
  let options = initial;
  const controller = createAtlas2(node, options);
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
    }
  };
};
export {
  atlas
};

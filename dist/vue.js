import"./chunk-afm3cw6n.js";
import {
  createAtlas2
} from "./chunk-p2v5s9fr.js";
import"./chunk-rpz9r67m.js";

// src/vue.ts
import {
  onMounted,
  onBeforeUnmount,
  shallowRef,
  watch,
  watchEffect
} from "vue";
function useAtlas(root, options = () => ({})) {
  const atlas = shallowRef(null);
  const state = shallowRef({
    activeRegion: null,
    visibleRegions: [],
    moving: false
  });
  let stopRoot;
  let stopOptions;
  onMounted(() => {
    stopRoot = watch(root, (node, _previous, onCleanup) => {
      if (!node)
        return;
      const controller = createAtlas2(node, options());
      atlas.value = controller;
      state.value = controller.getState();
      const stop = controller.subscribe((next) => {
        state.value = next;
      });
      onCleanup(() => {
        stop();
        controller.destroy();
        atlas.value = null;
      });
    }, { immediate: true, flush: "post" });
    stopOptions = watchEffect(() => atlas.value?.update(options()));
  });
  onBeforeUnmount(() => {
    stopOptions?.();
    stopRoot?.();
  });
  return { atlas, state };
}
export {
  useAtlas
};

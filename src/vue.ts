import {
  onMounted,
  onBeforeUnmount,
  shallowRef,
  watch,
  watchEffect,
  type Ref,
} from "vue";
import { createAtlas, type AtlasController, type AtlasOptions } from "./dom";
import type { AtlasState } from "./core";
export function useAtlas(
  root: Ref<HTMLElement | null>,
  options: () => AtlasOptions = () => ({}),
) {
  const atlas = shallowRef<AtlasController | null>(null);
  const state = shallowRef<AtlasState>({
    activeRegion: null,
    visibleRegions: [],
    moving: false,
  });
  let stopRoot: (() => void) | undefined;
  let stopOptions: (() => void) | undefined;
  onMounted(() => {
    stopRoot = watch(
      root,
      (node, _previous, onCleanup) => {
        if (!node) return;
        const controller = createAtlas(node, options());
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
      },
      { immediate: true, flush: "post" },
    );
    stopOptions = watchEffect(() => atlas.value?.update(options()));
  });
  onBeforeUnmount(() => {
    stopOptions?.();
    stopRoot?.();
  });
  return { atlas, state };
}

import"./chunk-afm3cw6n.js";
import {
  createAtlas2
} from "./chunk-p2v5s9fr.js";
import"./chunk-rpz9r67m.js";

// src/angular.ts
import {
  afterNextRender,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  signal
} from "@angular/core";
function injectAtlas(options = {}) {
  const element = inject(ElementRef);
  const destroyRef = inject(DestroyRef);
  const zone = inject(NgZone);
  const atlas = signal(null);
  const state = signal({
    activeRegion: options.initialRegion ?? null,
    visibleRegions: [],
    moving: false
  });
  let cleanup;
  afterNextRender(() => {
    zone.runOutsideAngular(() => {
      const controller = createAtlas2(element.nativeElement, options);
      atlas.set(controller);
      state.set(controller.getState());
      const stop = controller.subscribe((next) => zone.run(() => state.set(next)));
      cleanup = () => {
        stop();
        controller.destroy();
        atlas.set(null);
      };
    });
  });
  destroyRef.onDestroy(() => cleanup?.());
  return {
    atlas: atlas.asReadonly(),
    state: state.asReadonly(),
    update: (next) => atlas()?.update(next)
  };
}
export {
  injectAtlas
};

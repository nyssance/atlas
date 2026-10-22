import {
  afterNextRender,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  signal,
} from "@angular/core";
import { createAtlas, type AtlasController, type AtlasOptions } from "./dom";
import type { AtlasState } from "./core";
export function injectAtlas(options: AtlasOptions = {}) {
  const element = inject<ElementRef<HTMLElement>>(ElementRef);
  const destroyRef = inject(DestroyRef);
  const zone = inject(NgZone);
  const atlas = signal<AtlasController | null>(null);
  const state = signal<AtlasState>({
    activeRegion: options.initialRegion ?? null,
    visibleRegions: [],
    moving: false,
  });
  let cleanup: (() => void) | undefined;
  afterNextRender(() => {
    zone.runOutsideAngular(() => {
      const controller = createAtlas(element.nativeElement, options);
      atlas.set(controller);
      state.set(controller.getState());
      const stop = controller.subscribe((next) =>
        zone.run(() => state.set(next)),
      );
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
    update: (next: Partial<AtlasOptions>) => atlas()?.update(next),
  };
}

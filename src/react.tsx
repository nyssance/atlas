import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { createAtlas, type AtlasController, type AtlasOptions } from "./dom";
import type { AtlasState } from "./core";

export function useAtlas(options: AtlasOptions = {}) {
  const [root, ref] = useState<HTMLElement | null>(null);
  const [atlas, setAtlas] = useState<AtlasController | null>(null);
  const [state, setState] = useState<AtlasState>({
    activeRegion: options.initialRegion ?? null,
    visibleRegions: [],
    moving: false,
  });
  const latest = useRef(options);
  latest.current = options;
  useEffect(() => {
    if (!root) return;
    const controller = createAtlas(root, latest.current);
    setAtlas(controller);
    setState(controller.getState());
    const stop = controller.subscribe(setState);
    return () => {
      stop();
      controller.destroy();
      setAtlas(null);
    };
  }, [root]);
  useEffect(() => {
    atlas?.update(options);
  }, [atlas, options]);
  return {
    ref: useCallback((node: HTMLElement | null) => ref(node), []),
    atlas,
    state,
  };
}
export interface AtlasProps extends HTMLAttributes<HTMLDivElement> {
  options?: AtlasOptions;
  onReady?: (atlas: AtlasController) => void;
  onStateChange?: (state: AtlasState) => void;
}
export function Atlas({
  options,
  onReady,
  onStateChange,
  children,
  ...props
}: AtlasProps) {
  const { ref, atlas, state } = useAtlas(options);
  useEffect(() => {
    if (atlas) onReady?.(atlas);
  }, [atlas, onReady]);
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);
  return createElement(
    "div",
    { ...props, ref, "data-atlas": "", tabIndex: props.tabIndex ?? 0 },
    createElement("div", { "data-atlas-track": "" }, children),
  );
}
export function AtlasRegion({
  id,
  ...props
}: HTMLAttributes<HTMLElement> & { id: string }) {
  return createElement("section", { ...props, "data-atlas-region": id });
}
export function AtlasNavigation(props: HTMLAttributes<HTMLElement>) {
  return createElement(
    "nav",
    { ...props, "data-atlas-navigation": "" },
    createElement(
      "div",
      { "data-atlas-navigation-surface": "" },
      props.children,
    ),
  );
}

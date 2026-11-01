import {
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
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
  useLayoutEffect(() => {
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
  footer?: ReactNode;
  onReady?: (atlas: AtlasController) => void;
  onStateChange?: (state: AtlasState) => void;
}
export function Atlas({
  options,
  onReady,
  onStateChange,
  children,
  footer,
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
    { ...props, ref, tabIndex: props.tabIndex ?? 0 },
    createElement("div", { "data-atlas-track": "" }, children),
    footer != null && createElement(AtlasFooter, null, footer),
  );
}
export function AtlasRegion({
  id,
  regionRole = "content",
  pagination,
  ...props
}: HTMLAttributes<HTMLElement> & {
  id: string;
  regionRole?: "content" | "leading" | "trailing";
  pagination?: boolean;
}): ReactElement {
  return createElement("section", {
    ...props,
    "data-atlas-region": id,
    ...(regionRole === "leading"
      ? { "data-atlas-leading": true }
      : regionRole === "trailing"
        ? { "data-atlas-trailing": true }
        : {}),
    "data-atlas-pagination": pagination,
  });
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

/** Fixed footer outside the moving track. Content and interactions belong to the host. */
export function AtlasFooter(
  props: HTMLAttributes<HTMLDivElement>,
): ReactElement {
  return createElement("div", { ...props, "data-atlas-footer": "" });
}

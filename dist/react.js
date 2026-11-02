import"./chunk-n0zs9bm7.js";
import {
  createAtlas2
} from "./chunk-5s2rxxtf.js";
import"./chunk-rpz9r67m.js";

// src/react.tsx
import {
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";
function useAtlas(options = {}) {
  const [root, ref] = useState(null);
  const [atlas, setAtlas] = useState(null);
  const [state, setState] = useState({
    activeRegion: options.initialRegion ?? null,
    visibleRegions: [],
    moving: false
  });
  const latest = useRef(options);
  latest.current = options;
  useLayoutEffect(() => {
    if (!root)
      return;
    const controller = createAtlas2(root, latest.current);
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
    ref: useCallback((node) => ref(node), []),
    atlas,
    state
  };
}
function Atlas({
  options,
  onReady,
  onStateChange,
  children,
  footer,
  ...props
}) {
  const { ref, atlas, state } = useAtlas(options);
  useEffect(() => {
    if (atlas)
      onReady?.(atlas);
  }, [atlas, onReady]);
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);
  return createElement("div", { ...props, ref, tabIndex: props.tabIndex ?? 0 }, createElement("div", { "data-atlas-track": "" }, children), footer != null && createElement(AtlasFooter, null, footer));
}
function AtlasRegion({
  id,
  regionRole = "content",
  pagination,
  ...props
}) {
  return createElement("section", {
    ...props,
    "data-atlas-region": id,
    ...regionRole === "leading" ? { "data-atlas-leading": true } : regionRole === "trailing" ? { "data-atlas-trailing": true } : {},
    "data-atlas-pagination": pagination
  });
}
function AtlasNavigation(props) {
  return createElement("nav", { ...props, "data-atlas-navigation": "" }, createElement("div", { "data-atlas-navigation-surface": "" }, props.children));
}
function AtlasFooter(props) {
  return createElement("div", { ...props, "data-atlas-footer": "" });
}
export {
  Atlas,
  AtlasFooter,
  AtlasNavigation,
  AtlasRegion,
  useAtlas
};

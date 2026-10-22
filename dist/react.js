import"./chunk-afm3cw6n.js";
import {
  createAtlas2
} from "./chunk-fqnpp7ta.js";
import"./chunk-rpz9r67m.js";

// src/react.tsx
import {
  createElement,
  useCallback,
  useEffect,
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
  useEffect(() => {
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
  return createElement("div", { ...props, ref, "data-atlas": "", tabIndex: props.tabIndex ?? 0 }, createElement("div", { "data-atlas-track": "" }, children));
}
function AtlasRegion({
  id,
  ...props
}) {
  return createElement("section", { ...props, "data-atlas-region": id });
}
function AtlasNavigation(props) {
  return createElement("nav", { ...props, "data-atlas-navigation": "" }, createElement("div", { "data-atlas-navigation-surface": "" }, props.children));
}
export {
  Atlas,
  AtlasNavigation,
  AtlasRegion,
  useAtlas
};

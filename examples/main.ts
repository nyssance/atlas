import "../dist/styles.css";
import { isStationFullyVisible } from "../dist/station";
import { connectTrackpad } from "../dist/dom";
import type { AtlasController } from "../dist/dom";
const mode = new URLSearchParams(location.search).get("framework") ?? "dom";
const host = document.querySelector("#app")!;
const content = `<div data-atlas-track><section data-atlas-region="leading" data-atlas-leading><h2>Leading</h2></section><nav data-atlas-navigation id="atlas-navigation"><div data-atlas-navigation-surface><label>Filter<input aria-label="Filter"></label></div></nav><section data-atlas-region="workspace"><h2>Workspace</h2><label>Draft<input aria-label="Draft"></label></section></div>`;
const props = {
  "data-atlas": "",
  "data-atlas-layout": "navigation",
  tabindex: "0",
  role: "group",
  "aria-label": "Atlas",
};
const options = { initialRegion: "workspace", flickMinIndex: 1 };
let controller: AtlasController;
let unmount: () => void;
function ready(value: AtlasController) {
  controller = value;
  const report = () => {
    document.querySelector("#state")!.textContent = JSON.stringify(
      controller.getState(),
    );
  };
  controller.subscribe(report);
  report();
  Object.assign(window, {
    atlas: controller,
    connectTrackpad,
    isStationFullyVisible,
  });
  document.documentElement.dataset.ready = mode;
}
if (mode === "react") {
  const { createElement, useEffect, useState, StrictMode } =
    await import("react");
  const { createRoot } = await import("react-dom/client");
  const { useAtlas } = await import("../dist/react");
  function Demo() {
    const [overview, setOverview] = useState<unknown>(null);
    const { ref, atlas } = useAtlas({
      ...options,
      overview: { onChange: setOverview },
    });
    useEffect(() => {
      if (atlas) ready(atlas);
    }, [atlas]);
    return createElement("div", {
      ...props,
      tabIndex: 0,
      "data-overview-open": overview !== null,
      ref,
      dangerouslySetInnerHTML: { __html: content },
    });
  }
  const root = createRoot(host);
  root.render(createElement(StrictMode, null, createElement(Demo)));
  unmount = () => root.unmount();
} else if (mode === "vue") {
  const { createApp, h, ref, watch } = await import("vue");
  const { useAtlas: createVueAtlas } = await import("../dist/vue");
  const app = createApp({
    setup() {
      const root = ref<HTMLElement | null>(null);
      const { atlas } = createVueAtlas(root, () => options);
      watch(atlas, (value) => {
        if (value) ready(value);
      });
      return () => h("div", { ...props, ref: root, innerHTML: content });
    },
  });
  app.mount(host);
  unmount = () => app.unmount();
} else if (mode === "angular") {
  await import("@angular/compiler");
  const { Component, effect } = await import("@angular/core");
  const { bootstrapApplication } = await import("@angular/platform-browser");
  const { injectAtlas } = await import("../dist/angular");
  class Demo {
    atlas = injectAtlas(options);
    constructor() {
      effect(() => {
        const value = this.atlas.atlas();
        if (value) ready(value);
      });
    }
  }
  Component({
    selector: "atlas-demo",
    standalone: true,
    template: content,
    host: { ...props, style: "display:block" },
  })(Demo);
  host.innerHTML = "<atlas-demo></atlas-demo>";
  const app = await bootstrapApplication(Demo);
  unmount = () => app.destroy();
} else if (mode === "svelte") {
  const { mount, unmount: destroy } = await import("svelte");
  const { default: Demo } = await import("./Demo.svelte");
  const app = mount(Demo, { target: host, props: { ready } });
  unmount = () => {
    void destroy(app);
  };
} else {
  const { createAtlas } = await import("../dist/dom");
  const root = document.createElement("div");
  for (const [key, value] of Object.entries(props))
    root.setAttribute(key, String(value));
  root.innerHTML = content;
  host.append(root);
  ready(createAtlas(root, options));
  unmount = () => {
    controller.destroy();
    root.remove();
  };
}
for (const id of ["leading", "workspace"])
  document.getElementById(id)!.onclick = () => controller.goTo(id);
document.getElementById("destroy")!.onclick = () => {
  unmount();
  delete document.documentElement.dataset.ready;
};
document.getElementById("remove")!.onclick = () => {
  document.querySelector('[data-atlas-region="workspace"]')!.remove();
  controller.refresh();
};

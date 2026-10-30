import type { AtlasController, AtlasGeometry } from "./dom";

export interface AtlasPaginationOptions {
  label?: string;
  container?: HTMLElement | null | (() => HTMLElement | null);
  overviewLabel?: string;
  pageLabel?: (index: number) => string;
}
export function paginationPages(geometry: AtlasGeometry) {
  return geometry.groups.flatMap((group, snap) => {
    const regions = group
      .map((index) => geometry.regions[index])
      .filter((node) => {
        if (
          !node.hasAttribute("data-atlas-region") ||
          node.hasAttribute("data-atlas-navigation")
        )
          return false;
        const explicit = node.getAttribute("data-atlas-pagination");
        return (
          explicit === "true" ||
          (explicit !== "false" &&
            !node.hasAttribute("data-atlas-leading") &&
            !node.hasAttribute("data-atlas-trailing"))
        );
      });
    return regions.length
      ? [{ snap, regions: regions.map((node) => node.dataset.atlasRegion!) }]
      : [];
  });
}

/** Default indicator, outside the moving track. Disable it to render a custom view. */
export function attachPagination(
  controller: AtlasController,
  options: () => boolean | AtlasPaginationOptions,
) {
  const nav = document.createElement("nav");
  nav.dataset.atlasPageDots = "";
  const wrapper = document.createElement("div");
  wrapper.dataset.atlasFooterNavigation = "";
  const overview = document.createElement("button");
  overview.type = "button";
  overview.dataset.atlasOverviewToggle = "";
  overview.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="7" height="14" rx="1.5"/><rect x="14" y="5" width="7" height="14" rx="1.5"/></svg>';
  overview.onclick = () => controller.overview.toggle();
  wrapper.append(nav, overview);
  controller.root.append(wrapper);
  let signature = "";
  const render = () => {
    const config = options();
    if (config === false) {
      wrapper.remove();
      return;
    }
    const target = typeof config === "object" ? config.container : undefined;
    const container =
      (typeof target === "function" ? target() : target) ?? controller.root;
    if (wrapper.parentElement !== container) container.append(wrapper);

    overview.hidden = !controller.overview.enabled();
    overview.setAttribute(
      "aria-label",
      typeof config === "object"
        ? (config.overviewLabel ?? "Overview")
        : "Overview",
    );
    overview.setAttribute(
      "aria-pressed",
      String(controller.overview.getState() !== null),
    );
    const pages = paginationPages(controller.getGeometry());
    const active = controller.getState().activeRegion;
    nav.hidden = pages.length <= 1;
    nav.setAttribute(
      "aria-label",
      typeof config === "object" ? (config.label ?? "Pages") : "Pages",
    );
    const labels = pages.map((_, index) =>
      typeof config === "object"
        ? (config.pageLabel?.(index) ?? `Page ${index + 1}`)
        : `Page ${index + 1}`,
    );
    const next = JSON.stringify([pages, labels]);
    if (next !== signature) {
      signature = next;
      nav.replaceChildren(
        ...pages.map((page, index) => {
          const button = document.createElement("button");
          button.type = "button";
          button.setAttribute("aria-label", labels[index]!);
          button.append(document.createElement("span"));
          button.firstElementChild!.setAttribute("aria-hidden", "true");
          button.onclick = () => controller.goToSnap(page.snap);
          button.onkeydown = (event) => {
            const rtl = controller.root.dir === "rtl";
            const target =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? pages.length - 1
                  : event.key === (rtl ? "ArrowLeft" : "ArrowRight")
                    ? Math.min(pages.length - 1, index + 1)
                    : event.key === (rtl ? "ArrowRight" : "ArrowLeft")
                      ? Math.max(0, index - 1)
                      : null;
            if (target === null) return;
            event.preventDefault();
            event.stopPropagation();
            controller.goToSnap(pages[target]!.snap);
            (nav.children[target] as HTMLElement).focus({
              preventScroll: true,
            });
          };
          return button;
        }),
      );
    }
    pages.forEach((page, index) => {
      const button = nav.children[index]!;
      if (active && page.regions.includes(active))
        button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  };
  const stop = controller.subscribe(render);
  const stopOverview = controller.overview.subscribe(render);
  controller.on("reInit", render);
  const observer = new MutationObserver(render);
  observer.observe(controller.track, {
    subtree: true,
    attributes: true,
    attributeFilter: [
      "data-atlas-pagination",
      "data-atlas-leading",
      "data-atlas-trailing",
    ],
  });
  render();
  return {
    render,
    dispose() {
      stop();
      stopOverview();
      controller.off("reInit", render);
      observer.disconnect();
      wrapper.remove();
    },
  };
}

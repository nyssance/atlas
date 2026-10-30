import {
  applyLayout2
} from "./chunk-jyva3dz0.js";
import {
  resolveReleaseSnap2
} from "./chunk-rpz9r67m.js";

// src/overview-chrome.ts
var socialLinks = [
  {
    name: "X",
    url: "https://x.com/ALwith_ai",
    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>X</title><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg>',
    color: "#000000",
    dark: "#FFFFFF"
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@ALwithai.official",
    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>YouTube</title><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    color: "#FF0000",
    dark: "#FF0000"
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/alwith.ai/",
    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Instagram</title><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>',
    color: "#FF0069",
    dark: "#FF0069"
  },
  {
    name: "GitHub",
    url: "https://github.com/ALwith-ai",
    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
    color: "#181717",
    dark: "#FFFFFF"
  }
];
function createOverviewChrome(root, openLink) {
  const title = document.createElement("div");
  title.dataset.atlasOverviewBrand = "";
  title.innerHTML = "<span>AL</span>with the best AI agent !<span>!</span>";
  const social = document.createElement("nav");
  social.dataset.atlasOverviewSocial = "";
  social.setAttribute("aria-label", "ALwith social links");
  for (const item of socialLinks) {
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", item.name);
    link.title = item.name;
    link.style.setProperty("--atlas-social-brand", item.color);
    link.style.setProperty("--atlas-social-brand-dark", item.dark);
    link.innerHTML = item.svg;
    link.querySelector("svg")?.setAttribute("aria-hidden", "true");
    link.onclick = (event) => {
      event.preventDefault();
      openLink(item.url);
    };
    social.append(link);
  }
  root.append(title, social);
  return {
    update(state) {
      title.style.top = `calc((100% - ${state.contentHeight}px) / 4)`;
      social.style.top = `calc(100% - (100% - ${state.contentHeight}px) / 4)`;
    },
    dispose() {
      title.remove();
      social.remove();
    }
  };
}

// src/overview.ts
function createOverview(controller, options) {
  const { root, track } = controller;
  let state = null;
  let overlay = null;
  let chrome = null;
  let observer = null;
  let mutation = null;
  let frame = 0;
  let focus = null;
  let inert = false;
  let transition = "";
  let origin = "";
  const listeners = new Set;
  const notify = () => {
    const config = options();
    if (typeof config === "object")
      config.onChange?.(state);
    listeners.forEach((listener) => listener(state));
  };
  const elements = () => {
    const config = options();
    const nodes = typeof config === "object" && config.regions ? track.querySelectorAll(config.regions) : track.children;
    return [...nodes].filter((node) => node instanceof HTMLElement && node.offsetWidth > 0);
  };
  const idOf = (node) => node.dataset.atlasRegion ?? node.dataset.atlasOverviewRegion ?? (node.hasAttribute("data-atlas-navigation") ? "navigation" : "");
  const measure = () => {
    if (!state)
      return;
    const config = options();
    const width = track.scrollWidth;
    const viewport = root.clientWidth;
    const maxScale = Math.min(Math.max(0, viewport - 32) / Math.max(1, width), Math.max(0, root.clientHeight - 176) / Math.max(1, track.clientHeight), 1);
    const scale = state.scale > 0 && state.scale <= maxScale && state.padding + width * state.scale <= viewport - 16 ? state.scale : maxScale;
    const padding = state.scale === scale ? state.padding : Math.max((viewport - width * scale) / 2, 16);
    track.style.transformOrigin = `${root.dir === "rtl" ? "right" : "left"} center`;
    track.style.transform = `translate3d(${root.dir === "rtl" ? -padding : padding}px, 0, 0) scale(${scale})`;
    const nodes = elements();
    state = {
      scale,
      padding,
      contentHeight: track.clientHeight * scale,
      regions: nodes.map((node) => {
        const id = idOf(node);
        return {
          id,
          width: node.offsetWidth * scale,
          label: typeof config === "object" ? config.regionLabel?.(id) ?? node.getAttribute("aria-label") ?? id : node.getAttribute("aria-label") ?? id
        };
      })
    };
    if (overlay) {
      const bounds = root.getBoundingClientRect();
      const focused = overlay.contains(document.activeElement) ? document.activeElement?.getAttribute("data-atlas-overview-target") : null;
      overlay.replaceChildren(...nodes.map((node, index) => {
        const box = node.getBoundingClientRect();
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.atlasOverviewTarget = idOf(node);
        button.setAttribute("aria-label", state.regions[index].label);
        button.style.cssText = `left:${box.left - bounds.left}px;top:${box.top - bounds.top}px;width:${box.width}px;height:${box.height}px`;
        button.textContent = state.regions[index].label;
        button.onclick = () => exit(idOf(node));
        return button;
      }));
      if (focused)
        [...overlay.querySelectorAll("button")].find((button) => button.dataset.atlasOverviewTarget === focused)?.focus({ preventScroll: true });
    }
    chrome?.update(state);
    notify();
  };
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  };
  const keydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      exit();
    }
  };
  const enter = () => {
    if (state || options() === false)
      return;
    controller.suspend();
    focus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inert = track.inert;
    track.inert = true;
    transition = track.style.transition;
    origin = track.style.transformOrigin;
    track.style.transition = "none";
    track.style.transformOrigin = `${root.dir === "rtl" ? "right" : "left"} center`;
    state = { scale: 0, padding: 16, contentHeight: 0, regions: [] };
    root.dataset.atlasOverview = "";
    const config = options();
    if (typeof config !== "object" || config.renderOverlay !== false) {
      overlay = document.createElement("div");
      overlay.dataset.atlasOverviewOverlay = "";
      overlay.setAttribute("role", "group");
      overlay.setAttribute("aria-label", typeof config === "object" ? config.label ?? "Overview" : "Overview");
      root.append(overlay);
    }
    if (typeof config !== "object" || config.renderChrome !== false) {
      chrome = createOverviewChrome(root, (url) => {
        const current = options();
        if (typeof current === "object" && current.openLink)
          current.openLink(url);
        else
          window.open(url, "_blank", "noopener,noreferrer");
      });
    }
    measure();
    observer = new ResizeObserver(schedule);
    observer.observe(root);
    elements().forEach((node) => observer.observe(node));
    mutation = new MutationObserver(() => {
      elements().forEach((node) => observer?.observe(node));
      schedule();
    });
    mutation.observe(track, { childList: true });
    root.ownerDocument.addEventListener("keydown", keydown, true);
    overlay?.querySelector("button")?.focus({ preventScroll: true });
  };
  const exit = (id) => {
    if (!state)
      return;
    const geometry = controller.getGeometry();
    const index = id ? geometry.regions.findIndex((node) => node.dataset.atlasRegion === id) : -1;
    const snap = index < 0 ? geometry.selected : geometry.groups.findIndex((group) => group.includes(index));
    cancelAnimationFrame(frame);
    observer?.disconnect();
    mutation?.disconnect();
    root.ownerDocument.removeEventListener("keydown", keydown, true);
    overlay?.remove();
    overlay = null;
    chrome?.dispose();
    chrome = null;
    delete root.dataset.atlasOverview;
    track.inert = inert;
    track.style.transition = transition;
    track.style.transformOrigin = origin;
    state = null;
    controller.resume(snap < 0 ? geometry.selected : snap);
    if (id && controller.getGeometry().regions.some((node) => node.dataset.atlasRegion === id))
      controller.goTo(id, { instant: true });
    notify();
    if (focus?.isConnected && !focus.closest("[inert]"))
      focus.focus({ preventScroll: true });
  };
  const doubleClick = (event) => {
    if (options() === false || !(event.target instanceof Element))
      return;
    if (event.target.closest("button,a,input,textarea,select,[contenteditable=true],[role=button]"))
      return;
    const config = options();
    const target = typeof config === "object" ? config.footer : undefined;
    const footer = typeof target === "function" ? target() : target;
    const rect = root.getBoundingClientRect();
    const inset = Number.parseFloat(root.style.getPropertyValue("--atlas-inset-bottom")) || 0;
    const inBottom = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.bottom - inset && event.clientY <= rect.bottom;
    if (!footer?.contains(event.target) && !inBottom)
      return;
    event.preventDefault();
    state ? exit() : enter();
  };
  root.ownerDocument.addEventListener("dblclick", doubleClick);
  return {
    enabled: () => options() !== false,
    update() {
      if (options() === false)
        exit();
      else if (state)
        measure();
    },
    enter,
    exit,
    toggle() {
      state ? exit() : enter();
    },
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      root.ownerDocument.removeEventListener("dblclick", doubleClick);
      exit();
      listeners.clear();
    }
  };
}

// src/pagination.ts
function paginationPages(geometry) {
  return geometry.groups.flatMap((group, snap) => {
    const regions = group.map((index) => geometry.regions[index]).filter((node) => {
      if (!node.hasAttribute("data-atlas-region") || node.hasAttribute("data-atlas-navigation"))
        return false;
      const explicit = node.getAttribute("data-atlas-pagination");
      return explicit === "true" || explicit !== "false" && !node.hasAttribute("data-atlas-leading") && !node.hasAttribute("data-atlas-trailing");
    });
    return regions.length ? [{ snap, regions: regions.map((node) => node.dataset.atlasRegion) }] : [];
  });
}
function attachPagination(controller, options) {
  const nav = document.createElement("nav");
  nav.dataset.atlasPageDots = "";
  const wrapper = document.createElement("div");
  wrapper.dataset.atlasFooterNavigation = "";
  wrapper.append(nav);
  controller.root.append(wrapper);
  let signature = "";
  const render = () => {
    const config = options();
    if (config === false) {
      wrapper.remove();
      return;
    }
    const target = typeof config === "object" ? config.container : undefined;
    const container = (typeof target === "function" ? target() : target) ?? controller.root;
    if (wrapper.parentElement !== container)
      container.append(wrapper);
    const pages = paginationPages(controller.getGeometry());
    const active = controller.getState().activeRegion;
    nav.hidden = pages.length <= 1;
    nav.setAttribute("aria-label", typeof config === "object" ? config.label ?? "Pages" : "Pages");
    const labels = pages.map((_, index) => typeof config === "object" ? config.pageLabel?.(index) ?? `Page ${index + 1}` : `Page ${index + 1}`);
    const next = JSON.stringify([pages, labels]);
    if (next !== signature) {
      signature = next;
      nav.replaceChildren(...pages.map((page, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", labels[index]);
        button.append(document.createElement("span"));
        button.firstElementChild.setAttribute("aria-hidden", "true");
        button.onclick = () => controller.goToSnap(page.snap);
        button.onkeydown = (event) => {
          const rtl = controller.root.dir === "rtl";
          const target = event.key === "Home" ? 0 : event.key === "End" ? pages.length - 1 : event.key === (rtl ? "ArrowLeft" : "ArrowRight") ? Math.min(pages.length - 1, index + 1) : event.key === (rtl ? "ArrowRight" : "ArrowLeft") ? Math.max(0, index - 1) : null;
          if (target === null)
            return;
          event.preventDefault();
          event.stopPropagation();
          controller.goToSnap(pages[target].snap);
          nav.children[target].focus({
            preventScroll: true
          });
        };
        return button;
      }));
    }
    pages.forEach((page, index) => {
      const button = nav.children[index];
      if (active && page.regions.includes(active))
        button.setAttribute("aria-current", "page");
      else
        button.removeAttribute("aria-current");
    });
  };
  const stop = controller.subscribe(render);
  controller.on("reInit", render);
  const observer = new MutationObserver(render);
  observer.observe(controller.track, {
    subtree: true,
    attributes: true,
    attributeFilter: [
      "data-atlas-pagination",
      "data-atlas-leading",
      "data-atlas-trailing"
    ]
  });
  render();
  return {
    render,
    dispose() {
      stop();
      controller.off("reInit", render);
      observer.disconnect();
      wrapper.remove();
    }
  };
}

// src/hover.ts
import { animate } from "motion";
function attachHoverNavigation(root, api, options, blocked, onChange) {
  const navigation = root.querySelector("[data-atlas-navigation]");
  const surface = navigation?.querySelector("[data-atlas-navigation-surface]");
  if (!navigation || !surface)
    return { update() {}, dispose() {} };
  const properties = ["translate", "width", "opacity", "transform"];
  let savedStyle = [];
  let savedInert = surface.inert;
  const media = root.ownerDocument.defaultView.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let floating = false;
  let disposed = false;
  let pointerX = null;
  let triggerHovered = false;
  let triggerReady = false;
  let blockedUntilLeave = false;
  let approachFromX = null;
  let timer;
  let animation;
  let animationGeneration = 0;
  const captures = new Set;
  const clearTrigger = () => {
    clearTimeout(timer);
    timer = undefined;
    triggerReady = false;
  };
  const popup = () => {
    const selector = "[data-popup-open], [aria-haspopup][aria-expanded='true']";
    return surface.matches(selector) || surface.querySelector(selector) !== null;
  };
  const eligible = () => options().navigationPinned === false && options().hoverNavigation !== false && !blocked() && !api.internalEngine().slideRegistry[api.selectedScrollSnap()]?.some((index) => {
    const region = api.slideNodes()[index];
    return region?.hasAttribute("data-atlas-leading") && region.offsetWidth > 0;
  });
  const reset = () => {
    animationGeneration += 1;
    animation?.stop();
    visible = false;
    if (!floating)
      return;
    floating = false;
    delete navigation.dataset.atlasFloating;
    delete root.dataset.atlasNavigationPeeking;
    properties.forEach((property, index) => {
      const value = savedStyle[index];
      if (value)
        surface.style.setProperty(property, value);
      else
        surface.style.removeProperty(property);
    });
    surface.inert = savedInert;
    onChange(false);
  };
  const setVisible = (next) => {
    if (next === visible)
      return;
    animation?.stop();
    visible = next;
    if (next && !floating) {
      savedStyle = properties.map((property) => surface.style.getPropertyValue(property));
      savedInert = surface.inert;
      const bounds = root.getBoundingClientRect();
      const parent = navigation.getBoundingClientRect();
      const rootStyle = getComputedStyle(root);
      const rtl = rootStyle.direction === "rtl";
      const offset = rtl ? bounds.right - Number.parseFloat(rootStyle.paddingRight) - parent.right : bounds.left + Number.parseFloat(rootStyle.paddingLeft) - parent.left;
      navigation.dataset.atlasFloating = "";
      root.dataset.atlasNavigationPeeking = "";
      surface.style.translate = `${offset}px 0`;
      surface.style.width = `${(options().navigationWidth ?? 248) + 4 * (options().gutter ?? 4)}px`;
      surface.style.opacity = "0";
      surface.style.transform = `translateX(${rtl ? 8 : -8}px)`;
      floating = true;
      onChange(true);
    }
    surface.inert = true;
    const rtl = getComputedStyle(root).direction === "rtl";
    const generation = ++animationGeneration;
    const opacity = Number.parseFloat(getComputedStyle(surface).opacity) || 0;
    animation = animate(opacity, next ? 1 : 0, {
      type: media.matches ? "tween" : "spring",
      duration: media.matches ? 0 : 0.5,
      bounce: 0.1,
      onUpdate: (value) => {
        if (disposed || generation !== animationGeneration)
          return;
        surface.style.opacity = String(value);
        surface.style.transform = `translateX(${(1 - value) * (rtl ? 8 : -8)}px)`;
      },
      onComplete: () => {
        if (disposed || generation !== animationGeneration)
          return;
        if (!visible)
          reset();
        else
          surface.inert = false;
      }
    });
  };
  const evaluate = () => {
    if (!eligible()) {
      if (options().navigationPinned)
        blockedUntilLeave = true;
      clearTrigger();
      reset();
      return;
    }
    const bounds = root.getBoundingClientRect();
    const rtl = getComputedStyle(root).direction === "rtl";
    const x = pointerX === null ? null : rtl ? bounds.right - pointerX : pointerX - bounds.left;
    const edge = x !== null && x >= 0 && x <= Math.max(4, options().gutter ?? 4);
    if (blockedUntilLeave) {
      blockedUntilLeave = edge || triggerHovered;
      if (blockedUntilLeave)
        return;
    }
    const inside = x !== null && x >= 0 && x <= (options().navigationWidth ?? 248) + 3 * (options().gutter ?? 4);
    if (triggerReady && !inside)
      approachFromX = x;
    else if (inside || x === null || approachFromX === null || x > approachFromX)
      approachFromX = null;
    setVisible(visible ? inside || popup() || captures.size > 0 || triggerReady || approachFromX !== null : edge || triggerReady);
  };
  const move = (event) => {
    if (event.pointerType !== "mouse")
      return;
    pointerX = event.clientX;
    const target = event.target instanceof Element ? event.target.closest("[data-atlas-navigation-trigger]") : null;
    const hovered = !!target && (root.contains(target) || [navigation.id, surface.id].some((id) => !!id && target.getAttribute("aria-controls") === id));
    if (triggerHovered !== hovered) {
      triggerHovered = hovered;
      clearTrigger();
      if (hovered && eligible() && !blockedUntilLeave)
        timer = setTimeout(() => {
          timer = undefined;
          triggerReady = true;
          evaluate();
        }, 100);
    }
    evaluate();
  };
  const leave = () => {
    pointerX = null;
    triggerHovered = false;
    clearTrigger();
    evaluate();
  };
  const out = (event) => {
    if (event.relatedTarget === null)
      leave();
  };
  const capture = (event) => {
    if (event.target instanceof Node && surface.contains(event.target))
      captures.add(event.pointerId);
  };
  const release = (event) => {
    captures.delete(event.pointerId);
    evaluate();
  };
  const key = (event) => {
    if (event.key === "Escape" && !popup()) {
      blockedUntilLeave = true;
      setVisible(false);
    }
  };
  const dismiss = (event) => {
    if (!visible || popup() || !(event.target instanceof Element))
      return;
    if (surface.contains(event.target) || event.target.closest("[data-atlas-navigation-trigger]"))
      return;
    blockedUntilLeave = true;
    setVisible(false);
  };
  const motionChange = () => {
    if (media.matches && floating) {
      if (!visible)
        reset();
      else {
        animationGeneration += 1;
        animation?.stop();
        surface.style.opacity = "1";
        surface.style.transform = "translateX(0px)";
        surface.inert = false;
      }
    }
    evaluate();
  };
  const observer = new MutationObserver(evaluate);
  observer.observe(surface, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-popup-open", "aria-expanded"]
  });
  window.addEventListener("pointermove", move, {
    capture: true,
    passive: true
  });
  window.addEventListener("pointerout", out, true);
  window.addEventListener("blur", leave);
  window.addEventListener("gotpointercapture", capture, true);
  window.addEventListener("lostpointercapture", release, true);
  window.addEventListener("keydown", key);
  window.addEventListener("pointerdown", dismiss);
  media.addEventListener("change", motionChange);
  api.on("scroll", reset).on("reInit", reset).on("pointerDown", reset);
  return {
    update: evaluate,
    dispose() {
      disposed = true;
      clearTrigger();
      reset();
      observer.disconnect();
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerout", out, true);
      window.removeEventListener("blur", leave);
      window.removeEventListener("gotpointercapture", capture, true);
      window.removeEventListener("lostpointercapture", release, true);
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", dismiss);
      media.removeEventListener("change", motionChange);
      api.off("scroll", reset).off("reInit", reset).off("pointerDown", reset);
    }
  };
}

// src/dom.ts
import EmblaCarousel from "embla-carousel";

// src/input.ts
function attachInput(api, blocked, flickMinIndex = 0, panButton = "middle") {
  const root = api.rootNode();
  let owner = null;
  let mouseButton = null;
  let previousCursor = "";
  const isPanButton = (button) => panButton === "side" ? button === 3 || button === 4 : button === 1;
  let x = 0;
  let startIndex = 0;
  let startLocation = 0;
  let width = 0;
  let pointerId = null;
  let lastGestureTime = -Infinity;
  let secondaryUntil = -Infinity;
  let lastEnd = -Infinity;
  let disposed = false;
  const position = (value) => {
    const e = api.internalEngine();
    e.animation.stop();
    e.target.set(value);
    e.location.set(value);
    e.previousLocation.set(value);
    e.offsetLocation.set(value);
    e.scrollBody.useDuration(0).seek();
    e.translate.to(value);
  };
  const drag = (displacement) => {
    const e = api.internalEngine();
    const projected = startLocation + e.axis.direction(displacement);
    const edge = e.limit.constrain(projected);
    const overflow = projected - edge;
    const limit = Math.min(64, width * 0.06);
    position(edge + Math.sign(overflow) * limit * (1 - Math.exp(-Math.abs(overflow) * 0.18 / limit)));
    e.eventHandler.emit("scroll");
  };
  const restore = () => {
    api.scrollTo(Math.min(startIndex, api.scrollSnapList().length - 1));
  };
  const end = (cancelled) => {
    if (!owner)
      return;
    if (owner === "mouse")
      root.style.cursor = previousCursor;
    owner = null;
    mouseButton = null;
    const captured = pointerId;
    pointerId = null;
    if (captured !== null && root.hasPointerCapture(captured))
      root.releasePointerCapture(captured);
    const e = api.internalEngine();
    const location = e.location.get();
    const target = cancelled ? startIndex : resolveReleaseSnap2({
      startIndex,
      location,
      displacement: location - startLocation,
      snapPoints: e.scrollSnaps,
      viewportWidth: width,
      flickMinIndex
    });
    lastEnd = performance.now();
    e.eventHandler.emit("pointerUp");
    api.scrollTo(Math.min(target, api.scrollSnapList().length - 1));
    if (e.target.get() === e.location.get())
      e.eventHandler.emit("settle");
  };
  const cancel = () => {
    if (owner)
      end(true);
  };
  const begin = (kind, initialX) => {
    if (owner || blocked() || performance.now() <= secondaryUntil)
      return;
    width = root.clientWidth;
    if (width <= 0)
      return;
    startIndex = api.selectedScrollSnap();
    startLocation = api.internalEngine().offsetLocation.get();
    position(startLocation);
    x = initialX;
    owner = kind;
    api.internalEngine().eventHandler.emit("pointerDown");
  };
  const secondary = () => {
    secondaryUntil = performance.now() + 300;
    const shouldRestore = owner !== null || performance.now() - lastEnd <= 300;
    end(true);
    if (shouldRestore)
      restore();
  };
  const down = (event) => {
    if (!(event.target instanceof Node) || !root.contains(event.target))
      return;
    if (event.target instanceof Element && event.target.closest("[data-atlas-viewport]") !== root)
      return;
    if (event.button === 2)
      secondary();
    if (!isPanButton(event.button) || event.target instanceof Element && event.target.closest("[data-no-drag], [role=separator]"))
      return;
    if (blocked() || owner)
      return;
    event.preventDefault();
    begin("mouse", event.clientX);
    if (owner === "mouse") {
      mouseButton = event.button;
      pointerId = event.pointerId;
      root.setPointerCapture(event.pointerId);
      previousCursor = root.style.cursor;
      root.style.cursor = "grabbing";
    }
  };
  const move = (event) => {
    if (owner !== "mouse" || event.pointerId !== pointerId)
      return;
    if (blocked()) {
      cancel();
      return;
    }
    const mask = mouseButton === 1 ? 4 : mouseButton === 3 ? 8 : 16;
    if (!(event.buttons & mask)) {
      end(false);
      return;
    }
    drag(event.clientX - x);
  };
  const up = (event) => {
    if (owner === "mouse" && event.pointerId === pointerId && event.button === mouseButton) {
      event.preventDefault();
      end(false);
    }
  };
  const auxclick = (event) => {
    if (isPanButton(event.button) && event.target instanceof Element && !event.target.closest("[data-no-drag], [role=separator]"))
      event.preventDefault();
  };
  const menu = (event) => {
    if (event.target instanceof Node && root.contains(event.target))
      secondary();
  };
  const scroll = () => {
    root.scrollLeft = 0;
    root.scrollTop = 0;
  };
  const reinit = () => cancel();
  const pointerCancel = (event) => {
    if (owner === "mouse" && event.pointerId === pointerId)
      cancel();
  };
  window.addEventListener("pointerdown", down, true);
  window.addEventListener("contextmenu", menu, true);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  root.addEventListener("pointercancel", pointerCancel);
  root.addEventListener("lostpointercapture", pointerCancel);
  window.addEventListener("blur", cancel);
  root.addEventListener("scroll", scroll);
  root.addEventListener("auxclick", auxclick);
  api.on("reInit", reinit);
  return {
    gesture(event) {
      if (disposed)
        return;
      if (![event.totalDx, event.totalDy, event.ts].every(Number.isFinite))
        throw new Error("Invalid trackpad position or timestamp");
      if (event.ts < lastGestureTime)
        return;
      lastGestureTime = event.ts;
      if (event.fingers !== 3) {
        if (owner === "trackpad")
          cancel();
        return;
      }
      if (blocked()) {
        cancel();
        return;
      }
      if (event.phase === "began") {
        if (owner === "trackpad")
          cancel();
        begin("trackpad", 0);
        if (owner === "trackpad")
          drag(event.totalDx * width);
      } else if (owner === "trackpad") {
        if (event.phase === "changed")
          drag(event.totalDx * width);
        else if (event.phase === "ended") {
          drag(event.totalDx * width);
          end(false);
        } else if (event.phase === "cancelled")
          cancel();
        else
          throw new Error("Invalid trackpad phase");
      }
    },
    cancel,
    dispose() {
      if (disposed)
        return;
      cancel();
      disposed = true;
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("contextmenu", menu, true);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", pointerCancel);
      root.removeEventListener("lostpointercapture", pointerCancel);
      window.removeEventListener("blur", cancel);
      root.removeEventListener("scroll", scroll);
      root.removeEventListener("auxclick", auxclick);
      api.off("reInit", reinit);
    }
  };
}

// src/dom.ts
function isViewportResize2(root, entries) {
  return entries.some((entry) => entry.target === root.querySelector("[data-atlas-track]"));
}
function createAtlas2(root, initial = {}) {
  const initialDirection = root.getAttribute("dir");
  const initialViewport = root.getAttribute("data-atlas-viewport");
  root.setAttribute("data-atlas-viewport", "");
  let options = {
    ...initial,
    direction: initial.direction ?? (getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr")
  };
  root.dir = options.direction;
  const initialStyle = root.getAttribute("style");
  const initialPinned = root.getAttribute("data-atlas-navigation-pinned");
  const initialRail = root.getAttribute("data-atlas-reserve-leading-rail");
  let layout = applyLayout2(root, options);
  const track = root.querySelector("[data-atlas-track]");
  if (!track)
    throw new Error("Atlas requires a data-atlas-track element");
  const readRegions = () => {
    const nodes = options.regions ? [...track.querySelectorAll(options.regions)] : [...track.children];
    const ids = nodes.flatMap((node) => node.dataset.atlasRegion ? [node.dataset.atlasRegion] : []);
    if (!ids.length || new Set(ids).size !== ids.length)
      throw new Error("Atlas region IDs must be nonempty and unique");
    return nodes;
  };
  let nodes = readRegions();
  let disposed = false;
  let suspended = false;
  let moving = false;
  let restoring = false;
  const listeners = new Set;
  const original = new Map;
  const api = EmblaCarousel(root, {
    container: track,
    axis: "x",
    direction: options.direction ?? "ltr",
    align: "start",
    slides: options.regions,
    containScroll: options.contain === false ? false : "keepSnaps",
    slidesToScroll: options.groupRegions === false ? 1 : "auto",
    watchResize: (_api, entries) => {
      if (suspended || options.watchResize === false)
        return false;
      if (typeof options.watchResize === "function") {
        options.watchResize(root, entries);
        return false;
      }
      return true;
    },
    watchSlides: () => !suspended && options.watchRegions !== false,
    watchDrag: false
  });
  const blocked = () => suspended || root.closest("[inert]") !== null || !!options.blocked?.() || !!root.ownerDocument.querySelector('[role="dialog"][data-open], [role="dialog"][data-state="open"], [role="alertdialog"][data-open], [role="alertdialog"][data-state="open"], dialog[open]');
  let input = attachInput(api, blocked, options.flickMinIndex, options.panButton);
  const hover = attachHoverNavigation(root, api, () => options, blocked, (peeking) => options.onNavigationChange?.(peeking));
  const idsAt = (index) => (api.internalEngine().slideRegistry[index] ?? []).flatMap((i) => nodes[i]?.dataset.atlasRegion ? [nodes[i].dataset.atlasRegion] : []);
  let state = {
    activeRegion: null,
    visibleRegions: [],
    moving: false
  };
  let requested = options.initialRegion ?? null;
  const publish = () => {
    if (disposed || restoring)
      return;
    const visibleRegions = idsAt(api.selectedScrollSnap());
    const activeRegion = requested && visibleRegions.includes(requested) ? requested : visibleRegions[0] ?? null;
    requested = activeRegion;
    for (const node of nodes) {
      if (options.manageInert === false || !node.dataset.atlasRegion)
        continue;
      if (!original.has(node))
        original.set(node, {
          inert: node.inert,
          hidden: node.getAttribute("aria-hidden")
        });
      const visible = visibleRegions.includes(node.dataset.atlasRegion);
      node.inert = !visible;
      node.setAttribute("aria-hidden", String(!visible));
    }
    if (state.activeRegion === activeRegion && state.moving === moving && state.visibleRegions.join("\x00") === visibleRegions.join("\x00"))
      return;
    state = Object.freeze({
      activeRegion,
      visibleRegions: Object.freeze(visibleRegions),
      moving
    });
    listeners.forEach((listener) => listener(state));
  };
  const snapFor = (id) => {
    const node = nodes.findIndex((node) => node.dataset.atlasRegion === id);
    if (node === -1)
      return -1;
    return api.internalEngine().slideRegistry.findIndex((group) => group.includes(node));
  };
  const goTo = (region, settings = {}) => {
    if (disposed)
      throw new Error("Atlas is destroyed");
    const snap = snapFor(region);
    if (snap < 0)
      throw new Error(`Unknown Atlas region: ${region}`);
    if (suspended)
      return;
    input.cancel();
    requested = region;
    const instant = settings.instant ?? root.ownerDocument.defaultView.matchMedia("(prefers-reduced-motion: reduce)").matches;
    moving = !instant && snap !== api.selectedScrollSnap();
    const wasRestoring = restoring;
    if (instant)
      restoring = true;
    api.scrollTo(snap, instant);
    restoring = wasRestoring;
    if (instant)
      moving = false;
    publish();
  };
  const select = () => publish();
  const scroll = () => {
    moving = true;
    publish();
  };
  const settle = () => {
    moving = false;
    publish();
  };
  const rebuild = () => {
    if (suspended)
      return;
    const previous = state.activeRegion;
    const previousIndex = nodes.findIndex((node) => node.dataset.atlasRegion === previous);
    nodes = readRegions();
    const replacement = previous && snapFor(previous) >= 0 ? previous : nodes.slice(Math.max(0, previousIndex)).find((node) => node.dataset.atlasRegion)?.dataset.atlasRegion ?? nodes.toReversed().find((node) => node.dataset.atlasRegion)?.dataset.atlasRegion;
    if (replacement) {
      requested = replacement;
      api.scrollTo(snapFor(replacement), true);
    }
    moving = false;
    publish();
  };
  api.on("select", select).on("scroll", scroll).on("settle", settle).on("reInit", rebuild);
  const keydown = (event) => {
    if (event.target !== root || blocked() || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
      return;
    event.preventDefault();
    input.cancel();
    const direction = options.direction === "rtl" ? -1 : 1;
    const next = event.key === "Home" ? 0 : event.key === "End" ? api.scrollSnapList().length - 1 : api.selectedScrollSnap() + (event.key === "ArrowRight" ? direction : -direction);
    const snap = Math.max(0, Math.min(next, api.scrollSnapList().length - 1));
    const region = idsAt(snap)[0];
    if (region)
      goTo(region);
  };
  root.addEventListener("keydown", keydown);
  const observer = new MutationObserver(() => {
    if (blocked())
      input.cancel();
  });
  observer.observe(root.ownerDocument.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["inert", "data-open", "data-state", "open"]
  });
  if (options.initialRegion)
    goTo(options.initialRegion, { instant: true });
  else
    publish();
  const controller = {
    get overview() {
      return overview;
    },
    getPagination() {
      return paginationPages(controller.getGeometry());
    },
    root,
    track,
    getGeometry() {
      const engine = api.internalEngine();
      return {
        selected: api.selectedScrollSnap(),
        groups: engine.slideRegistry.map((group) => [...group]),
        snaps: [...api.scrollSnapList()],
        offsets: engine.scrollSnaps.map((value) => value * (options.direction === "rtl" ? -1 : 1)),
        regions: [...api.slideNodes()],
        location: engine.location.get() * (options.direction === "rtl" ? -1 : 1),
        target: engine.target.get() * (options.direction === "rtl" ? -1 : 1),
        progress: api.scrollProgress()
      };
    },
    goToSnap(index, settings = {}) {
      const ids = idsAt(index);
      const region = requested && ids.includes(requested) ? requested : ids[0];
      if (!region)
        throw new Error(`Unknown Atlas snap: ${index}`);
      if (overview.getState())
        overview.exit(region);
      else
        goTo(region, settings);
    },
    on(event, listener) {
      api.on(event, listener);
      return controller;
    },
    off(event, listener) {
      api.off(event, listener);
      return controller;
    },
    cancelInput: () => input.cancel(),
    suspend() {
      if (disposed || suspended)
        return;
      input.cancel();
      suspended = true;
      const engine = api.internalEngine();
      engine.animation.stop();
      engine.target.set(engine.location.get());
      engine.translate.to(engine.location.get());
      moving = false;
      publish();
    },
    resume(index) {
      if (disposed)
        return;
      suspended = false;
      api.reInit();
      if (index !== undefined)
        controller.goToSnap(index, { instant: true });
    },
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    goTo(region, settings) {
      if (overview.getState())
        overview.exit(region);
      else
        goTo(region, settings);
    },
    update(next) {
      if (disposed)
        return;
      const old = options;
      options = {
        ...options,
        ...next,
        direction: next.direction ?? options.direction
      };
      root.dir = options.direction;
      const nextLayout = applyLayout2(root, options);
      const layoutChanged = JSON.stringify(layout) !== JSON.stringify(nextLayout);
      layout = nextLayout;
      hover.update();
      pagination?.render();
      if (old.direction !== options.direction || layoutChanged || options.overview === false)
        overview.update();
      if (old.trackpadEnabled && !options.trackpadEnabled || old.trackpadAvailable && !options.trackpadAvailable)
        input.cancel();
      if (old.flickMinIndex !== options.flickMinIndex || old.panButton !== options.panButton) {
        input.dispose();
        input = attachInput(api, blocked, options.flickMinIndex, options.panButton);
      }
      if (!suspended && (old.direction !== options.direction || layoutChanged)) {
        restoring = true;
        input.cancel();
        api.reInit({ direction: options.direction ?? "ltr" });
        restoring = false;
        rebuild();
      }
    },
    refresh(next = {}) {
      if (disposed || suspended)
        return;
      options = { ...options, ...next };
      root.dir = options.direction;
      api.reInit({ direction: options.direction });
    },
    gesture(event) {
      if (!disposed && options.trackpadEnabled && options.trackpadAvailable)
        input.gesture(event);
    },
    destroy() {
      if (disposed)
        return;
      overview.dispose();
      pagination?.dispose();
      disposed = true;
      observer.disconnect();
      hover.dispose();
      root.removeEventListener("keydown", keydown);
      input.dispose();
      api.destroy();
      listeners.clear();
      if (initialDirection === null)
        root.removeAttribute("dir");
      else
        root.setAttribute("dir", initialDirection);
      if (initialStyle === null)
        root.removeAttribute("style");
      else
        root.setAttribute("style", initialStyle);
      for (const [key, value] of [
        ["data-atlas-viewport", initialViewport],
        ["data-atlas-navigation-pinned", initialPinned],
        ["data-atlas-reserve-leading-rail", initialRail]
      ]) {
        if (value === null)
          root.removeAttribute(key);
        else
          root.setAttribute(key, value);
      }
      for (const [node, attributes] of original) {
        node.inert = attributes.inert;
        if (attributes.hidden === null)
          node.removeAttribute("aria-hidden");
        else
          node.setAttribute("aria-hidden", attributes.hidden);
      }
    }
  };
  const overview = createOverview(controller, () => options.overview ?? true);
  const pagination = attachPagination(controller, () => options.pagination ?? true);
  return controller;
}
function observeTrackpad2(source, onAvailability, onError, intervalMs = 5000) {
  let disposed = false;
  let pending = false;
  const refresh = async () => {
    if (disposed || pending || document.hidden)
      return;
    pending = true;
    try {
      const available = await source.available();
      if (!disposed)
        onAvailability(available);
    } catch (error) {
      if (!disposed) {
        onAvailability(false);
        onError(error);
      }
    } finally {
      pending = false;
    }
  };
  const onFocus = () => void refresh();
  onFocus();
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onFocus);
  const interval = window.setInterval(onFocus, intervalMs);
  return () => {
    disposed = true;
    window.clearInterval(interval);
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onFocus);
  };
}
function connectTrackpad2(controller, source, onError, onAvailability) {
  let disposed = false;
  let unlisten;
  controller.update({ trackpadAvailable: false });
  const stop = observeTrackpad2(source, (available) => {
    controller.update({ trackpadAvailable: available });
    onAvailability?.(available);
  }, onError);
  Promise.resolve().then(() => source.subscribe((event) => {
    if (!disposed)
      controller.gesture(event);
  })).then((cleanup) => {
    if (disposed)
      cleanup();
    else
      unlisten = cleanup;
  }).catch((error) => {
    if (!disposed) {
      stop();
      controller.update({ trackpadAvailable: false });
      onError(error);
    }
  });
  return () => {
    disposed = true;
    stop();
    unlisten?.();
    controller.update({ trackpadAvailable: false });
  };
}

export { isViewportResize2, createAtlas2, observeTrackpad2, connectTrackpad2 };

# Atlas

Framework-independent sliding region layouts. Version 0.1.1 is distributed through GitHub Releases; npm publication is separate. Embla powers motion internally; applications depend only on `@nyssance/atlas` and never receive an Embla instance.

Development uses TypeScript 7 with `ESNext` target/library types. Formatting and base lint use Bun Canary’s native commands; `bun lint` also runs the shared `@nyssance/ts7-lint` modern-syntax rules. CI uses the same checks. Shared rules stay in that package rather than being copied into Atlas.

## Install

Install the versioned Git release. Built JavaScript, type declarations, CSS and the native Rust crate are included; no sibling checkout or consumer-side Atlas build is required. Embla is an internal dependency and does not need to be added by applications using Atlas alone.

```sh
bun add @nyssance/atlas@github:nyssance/atlas#v0.1.1
```

Import `@nyssance/atlas/styles.css` once. Give the viewport a bounded height (for example a flex child inside a viewport-height shell); content must scroll inside regions rather than enlarge the application window. It contains layout only; typography, colors, borders and floating surfaces belong to the host. Frameworks and desktop runtimes are optional peers, not transitive requirements for plain DOM applications.

## DOM

```html
<div
  data-atlas
  data-atlas-layout="navigation"
  tabindex="0"
  role="group"
  aria-label="Workspace"
>
  <div data-atlas-track>
    <section data-atlas-region="leading" data-atlas-leading>
      Leading screen
    </section>
    <nav data-atlas-navigation>
      <div data-atlas-navigation-surface>Persistent navigation</div>
    </nav>
    <section data-atlas-region="workspace">Workspace</section>
  </div>
</div>
```

```ts
import { createAtlas } from "@nyssance/atlas/dom";
const atlas = createAtlas(element, {
  initialRegion: "workspace",
  flickMinIndex: 1,
});
const unsubscribe = atlas.subscribe((state) =>
  console.log(state.activeRegion, state.moving),
);
atlas.goTo("leading");
// Cleanup on unmount:
unsubscribe();
atlas.destroy();
```

Every region needs a unique stable ID. The navigation node remains mounted and moves from the left of the workspace to the right of the leading screen. Multiple work regions are allowed. Set `--atlas-region-width` per region and pass `navigationWidth` for the shared navigation. `flickMinIndex: 1` requires dragging more than halfway into the leading screen; `0` allows a 15% flick into it. Two-finger wheel scrolling remains owned by content. Middle-button dragging and root-focused arrow/Home/End navigation are available without a trackpad. Inactive regions become inert; navigation stays interactive. Honor `state.moving` when positioning native child webviews.

## Layout defaults and RTL

Mouse panning is configured through `panButton: "middle" | "side"`, defaulting to `"middle"` as in Desktop. `"side"` accepts either back/forward mouse button. Use `atlas.update({ panButton: "side" })` to change it at runtime; an in-progress drag is cancelled when the binding changes. Hosts own any settings UI and persistence. Left-button selection and two-finger scrolling stay with content. Mark excluded drag areas with `data-no-drag`; separators are also excluded. Mouse panning does not require a trackpad.

Defaults derive from ALwith Desktop’s shell geometry, in CSS pixels. Desktop panes contribute 4px on each inline side: adjacent panes give 4+4=8px, and the outer shell adds 4px to a 4px edge pane. Atlas uses that same shared gutter and reserves a 32px footer matching the top inset for page navigation. Pass options through any adapter; changes preserve the active region and mounted content.

| Option               | Default          | Behavior                                                                                              |
| -------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| `insetTop`           | 32               | Top inset; pass 0 if the host already reserves the title row                                          |
| `insetBottom`        | insetTop | Matches top spacing by default; 0 explicitly removes it                              |
| `gutter`             | 4                | Shared fixed viewport margin and each region’s half-gap; 6 produces 12px visible gaps; 0 removes both |
| `surfaceRadius`      | 14               | Radius of `[data-atlas-surface]` inside a region; 0 removes rounding without changing gutters |
| `navigationWidth`    | 248              | Shared navigation, including gutters                                                                  |
| `navigationPinned`   | true             | Reserve navigation beside the workspace                                                               |
| `hoverNavigation`    | true             | When unpinned, reveal the same navigation at the start edge                                           |
| `leadingRailWidth`   | 176              | Optional leading-screen directory rail                                                                |
| `reserveLeadingRail` | false            | Reserve inline-start space for that rail; ALwith U uses true with width 52                            |
| `trailingWidth`      | 264              | Width of a `data-atlas-trailing` region                                                               |
| `stationClearance`   | 192              | Scroll clearance above the fixed station slot                                                         |

`gutter` is one shared layout value, not two independently configured margins. The viewport margin stays fixed while region half-gaps move with the track. For example, `atlas.update({ gutter: 6 })` sets both to 6px, creating 12px between adjacent surfaces with their shared boundary at the center. Setting `gutter: 0` removes those gaps. An explicit `insetBottom` stays unchanged when gutter changes; set it to `undefined` to follow the top inset. Navigation width still includes its gutters. Content padding belongs to the region's inner content and is never changed by `gutter`.

Hover needs `data-atlas-navigation-surface` inside navigation. It keeps the original DOM, uses the 4px edge and 100ms trigger intent, and retains open popups/pointer capture. A header trigger may use `data-atlas-navigation-trigger` and `aria-controls` targeting the navigation's ID. `Escape`, scrolling and teardown close the surface. Reduced-motion preferences are respected.

`direction: "ltr" | "rtl"` sets the entire layout's direction. If omitted initially, it inherits computed direction. Bind it to the host locale for later language changes. Region IDs and order stay logical: in RTL the leading screen is to the right, navigation on that screen is on the left, the unpinned navigation peeks from the right, and arrow keys follow physical direction. Leading rail offsets, reserved space and floating corners mirror automatically. Mouse/trackpad deltas remain physical; do not negate them in a host adapter.

### Host-owned geometry and overview

Use `regions` to select existing snap markers, `groupRegions: false` for one marker per snap, and `manageInert: false` when the host already owns visibility. `watchResize` accepts a callback for host-computed widths; call `refresh()` after reflow. `getGeometry()` returns measured regions, groups, offsets and physical coordinates without exposing Embla. `goToSnap()` is for hosts whose snap markers differ from their semantic regions.

Call `suspend()` before an overview animation takes ownership of the track transform, then `resume()` after it restores the normal geometry. Input is blocked while suspended. `onNavigationChange` reports transient floating visibility without changing the persisted `navigationPinned` preference. The navigation surface can contain the host’s shadcn menu, custom buttons or any other components; Atlas neither clones it nor replaces its styles.

`@nyssance/atlas/layout` also exports the extracted Desktop `resolveAtlasWidths` and U `resolveSplitGeometry`/`resolveSplitWidths` policies for applications sharing those layouts.

### Pet rest station

Use a trailing region containing `data-atlas-station-host`, a scroll area `data-atlas-station-scroll`, and a fixed-bottom slot `data-atlas-station`. Atlas supplies layout and geometry, while the host owns pet assets, animation and native pet windows.

`@nyssance/atlas/station` exports `isStationFullyVisible`, `readVisibleStation`, `createStationGeometry`, hit-testing helpers and `StationDragGeneration`. Check full visibility before using a drop target; clipping, hidden ancestors and inert regions invalidate it. Pass native content origin and the effective `devicePixelRatio` for physical screen coordinates. Station insets use logical `inlineEnd` (Desktop default 71), `bottom` (24), and `size` (100); pass the current direction so drop geometry matches RTL visuals.

## Framework adapters

All adapters own the same controller lifecycle and preserve child nodes across navigation.

### React

```tsx
import { Atlas, AtlasRegion, AtlasNavigation } from "@nyssance/atlas/react";
<Atlas options={{ initialRegion: "workspace" }} data-atlas-layout="navigation">
  <AtlasRegion id="leading" data-atlas-leading>
    Leading
  </AtlasRegion>
  <AtlasNavigation>Navigation</AtlasNavigation>
  <AtlasRegion id="workspace">Workspace</AtlasRegion>
</Atlas>;
```

`useAtlas(options)` returns `{ ref, atlas, state }` for applications that render their own containers. Attach `ref` to the viewport containing `data-atlas-track`. Options update without remounting. `initialRegion` applies only on mount; use `goTo` for later navigation.

### Vue

```ts
import { ref } from "vue";
import { useAtlas } from "@nyssance/atlas/vue";
const root = ref<HTMLElement | null>(null);
const { atlas, state } = useAtlas(root, () => ({ initialRegion: "workspace" }));
```

Bind `ref="root"` to the same DOM structure shown above. The second argument is a reactive options getter. Mount/unmount and changing roots clean up their controller.

### Svelte 5

```svelte
<script>
  import { atlas } from "@nyssance/atlas/svelte";
</script>

<div
  use:atlas={{
    initialRegion: "workspace",
    onReady: (controller) => console.log(controller),
  }}
  data-atlas
>
  <div data-atlas-track><!-- regions --></div>
</div>
```

The action supports reactive option updates and `onStateChange`, and destroys the controller on unmount. SSR does not instantiate a controller.

### Angular

```ts
import { injectAtlas } from '@nyssance/atlas/angular'
// In a component or directive field initializer (Angular injection context):
readonly atlas = injectAtlas({ initialRegion: 'workspace' })
```

The component host is the viewport; its template contains `data-atlas-track`. This adapter uses `afterNextRender`, `DestroyRef`, signals and `NgZone`; it ships no Angular templates or compiler. Use the returned read-only `state`/`atlas` signals and `update(options)`. Browser work starts after render and is omitted during SSR.

## Tauri

```ts
import { connectTrackpad } from "@nyssance/atlas/dom";
import { tauriTrackpad } from "@nyssance/atlas/tauri";
const stop = connectTrackpad(atlas, tauriTrackpad(), reportError);
atlas.update({ trackpadEnabled: savedPreference });
```

The native bridge is distributed independently on crates.io as `atlas-tauri`. Cargo resolves it without Bun, npm or a `node_modules` directory:

```toml
atlas-tauri = "0.1"
```

Call `atlas_tauri::install(app.handle())?` on the main thread after creation of the `main` window. Register `atlas_tauri::availability::has_trackpad` in `tauri::generate_handler!`. The native collector supports macOS AppKit/Wry and Windows Precision Touchpad HID under Tauri 3 alpha. Other operating systems return unavailable. Native trackpad gestures are currently supported only in Wry hosts. CEF native trackpad gestures are deferred and unsupported; do not install the Wry view hook or connect the native gesture bridge in a CEF window. CEF hosts can still use Atlas layout, mouse panning and keyboard navigation. Private APIs and libraries requiring App Sandbox to be disabled are excluded. Focus loss resets the shared collector. Enable the crate’s optional `specta` feature to register its `TrackpadGesture` type with tauri-specta. The JS bridge accepts alternate command/event names for existing hosts. No worker or service process is introduced.

`observeTrackpad` can drive a settings control: disabled until a device is detected. Gestures are off by default even with hardware present. `connectTrackpad` checks again on focus and every five seconds while visible; disconnects cancel input, and late subscription cleanup is handled. Persist preferences in the host.

## Development

```sh
bun install # Bun Canary with native fmt/lint
bun run build
bun run typecheck
bun run test
bun run test:browser
```

Browser fixtures mount React, Vue, Angular, Svelte and plain DOM against the built exports. They cover retained state, navigation, resize, disposal, keyboard/mouse input and native-source lifecycle. Native and application integration results are recorded in `VALIDATION.md`; synthetic gestures do not establish physical hardware support.

## License

AGPL-3.0-only. See LICENSE and THIRD_PARTY_NOTICES.md.

## Git distribution

The repository includes built `dist/` exports so applications can pin a Git commit without depending on a sibling checkout or running package install scripts. Run `bun run build` whenever source exports change and commit the generated output together with the source.

## Direct input

Atlas reads native three-finger gestures without consuming macOS system events.
Configure the system desktop-switch gesture to use four fingers. Four or more
contacts cancel Atlas's active gesture; Atlas waits for all contacts to lift before
recognizing another one. Partial three-finger release uses the last valid position,
not the changed centroid of the remaining fingers.

Native sources must supply `totalDx`, `totalDy`, and `ts` alongside the existing
phase and delta fields. Totals include movement during recognition; `ts` is the
source's monotonic timestamp. Intermediate updates may be coalesced, but lifecycle
events must remain ordered. The bundled Rust source provides these fields.

Three-finger and configured mouse-button dragging update the displayed position
directly. Embla resumes animation only for release or cancellation. Two-finger
scrolling and primary-button selection remain with the content. CEF native touch
attachment is not provided by this package; the Tauri collector supports its Wry
host and must not be presented as a verified CEF integration.

Place `data-atlas-surface` on a region’s inner content container to clip its background and children to `surfaceRadius`. Keep backgrounds on that surface, not on the padded region, so gutters remain visible. Atlas owns surface geometry; the host supplies colors.

### Default page navigation

Atlas reserves a bottom inset matching the top (32px by default) and renders U-style page dots outside the
moving track. Content snap groups participate by default. Regions marked
`data-atlas-leading` or `data-atlas-trailing` do not; navigation never participates.
An auxiliary region can explicitly opt in with `data-atlas-pagination="true"`,
and a content region can opt out with `data-atlas-pagination="false"`.
Dots follow actual snap groups, so content sharing one page has one dot.
On an excluded region no content dot is highlighted; zero or one content page
hides the dots while preserving the footer height.

React uses `regionRole` (not the accessibility `role` attribute):

```tsx
<Atlas options={{ initialRegion: "chat" }}>
  <AtlasRegion id="lounge" regionRole="leading" />
  <AtlasNavigation />
  <AtlasRegion id="chat" />
  <AtlasRegion id="editor" />
  <AtlasRegion id="station" regionRole="trailing" />
</Atlas>
```

Set `options.pagination` to `{ label, pageLabel: index => ... }` for translated
accessible labels, or `false` to replace the indicator entirely. Replacements
use `controller.getPagination()`, `getState()`, `subscribe()` and `goToSnap()`.
`insetBottom` remains independently configurable. Use
`--atlas-page-indicator` to inherit the application's indicator color.


### Live thumbnail overview and custom footers

Overview is independent of pagination. Applications provide a separate button;
the default footer contains only page dots. `controller.overview.enter()`,
`exit(regionId?)`, and `toggle()` use the existing mounted track, suspend panning,
fit the visible panels, then restore normal input and focus. Escape exits.
`subscribe()` reports overview geometry for host decorations. Set
`overview: { renderOverlay: false }` to keep a host's own thumbnail overlay while
Atlas owns scaling, resize observation and restoration. `overview: false` disables
this feature. Labels and visual-panel selectors can be supplied through
`overview.regionLabel` and `overview.regions`; the latter supports layouts with
separate snap markers and nested content panels. Such visual panels use
`data-atlas-overview-region` when they are not navigation regions themselves.

Applications with business status bars can supply `pagination.container` (an
element or a function returning one) to mount the default navigation in that bar.
A completely custom renderer uses `pagination: false` and the controller's
geometry/navigation APIs; no second hidden navigation is created. Desktop's
proportional segment strip and business status items remain host-owned.

The default overview includes Desktop’s Caveat title and four social links. The font is bundled for offline use. Double-click empty footer space to toggle overview; interactive footer controls retain their own gestures. Hosts with an external business footer pass `overview.footer` as an element or getter. Desktop hosts pass `overview.openLink` to open social URLs in the system browser. `renderOverlay: false` replaces thumbnail targets only; `renderChrome: false` replaces the title and social presentation. These are independent of page dots.

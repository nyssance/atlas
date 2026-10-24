# Validation — 2026-10-22

Commands were run on macOS arm64. Behavioral results below refer to the development tree used for the initial Git release; npm publication has not occurred.

| Layer            | Evidence                                                                      | Result                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Core/station     | `bun run test`                                                                | 19 passing tests; Desktop release policy and geometry cases, plus Atlas RTL extensions                                            |
| DOM/frameworks   | `bun run test:browser`                                                        | 20 passing tests across DOM, React, Vue, Angular, Svelte and Electron                                                             |
| SSR imports      | Node imports all ten built JS exports without window/document                 | Passed; not a full framework SSR/hydration suite                                                                                  |
| Native collector | `cargo test --manifest-path rust/Cargo.toml --features specta`                | 14 passing state-machine tests                                                                                                    |
| Quality          | TS7 ESNext, Bun native lint, shared ts7-lint, Cargo Clippy                    | Passed                                                                                                                            |
| GitCub           | TS7, lint, Cargo check; earlier Clippy and packaged macOS debug build         | Passed                                                                                                                            |
| GitCub discovery | Four focused Storybook layout/behavior tests                                  | Passed; visible top 32px, bottom 8px and right edge 8px                                                                           |
| GitCub settings  | Targeted import/trackpad stories across both themes, locales and sizes        | 48 passed                                                                                                                         |
| GitCub native    | Seven responsiveness, coalescing and native Trending tests                    | Passed on the earlier 32px-bottom native build; not rerun for 8px bottom                                                          |
| Yijoy            | Production Svelte layout and `/atlas-test`; check and static production build | Two browser tests passed, including persistent navigation, hover/Escape/repinning, retained DOM, RTL, station and dynamic regions |
| Desktop          | TS7, native Bun lint, shared TS7 lint, production build, Cargo check          | Passed; 82 targeted navigation/geometry/station tests passed; eight additional station host tests passed earlier                  |
| U                | TS7, production build, knip, Cargo check and Clippy                           | Passed; full test and lint limitations below                                                                                      |

The broad GitCub Storybook run recorded 735 passed, 47 failed, 3 interrupted and 770 unrun cases. It was interrupted for spacing changes and is not a full-suite pass. Settings failures were caused by stale import-result expectations and using a native disabled matcher on Base UI’s ARIA switch. Those expectations were corrected and all 48 settings scenarios now pass. Unified-diff failures remain outside this layout change and were not diagnosed as regressions or baseline failures. Focused affected layout scenarios were rebuilt and rerun successfully.

The shared-gutter cases measure default 4px, 6px, zero and restoration in LTR/RTL: fixed margins and region half-gaps match, bottom spacing follows twice the gutter, explicit bottom overrides persist, inner content padding and edits remain unchanged. Mouse tests cover the default middle button, both side buttons via trusted Chromium input, left-button text selection, excluded regions, runtime binding changes and teardown. Preventing default on pointer release also stops side-button history navigation.

## Final affected-layout checks

- U: all 29 existing Canvas browser stories passed (LTR/RTL, preview transitions, hover, fixed gutters, retained editor state and divider reflow); 71 targeted layout/workspace tests passed. The migration fixed stale moving state after remeasurement by subscribing to the shared controller state. Targeted native Bun lint reports no errors; three async-test warnings remain.
- Desktop: 82 targeted tests across navigation, width policy, release policy, resize and station geometry passed. Native Bun lint and shared TS7 lint both passed. Eight station host tests had also passed earlier.
- Atlas: 19 unit tests, 20 browser tests and 14 native tests passed. Native Clippy with the Specta feature passed.
- GitCub: four discovery browser regressions passed after rebuilding Storybook with the shared package.
- Yijoy: two real-route/production-shell browser tests passed; Svelte check and static production build passed.

## Source mapping

Desktop reference: `494518376bf1f21ad9bde2cde6952ccff46ac5e6`.
U reference: `16d19174804a62207f2d0b9aebb1e6a83e9e4622`.

- `src/features/layout/lib/atlas-swipe.ts` → core release policy; original case titles retained in `tests/core.test.ts`.
- U `src/features/layout/lib/canvas-input.ts` → shared input arbitration. Atlas adds cancellation, modal/lifecycle tests and avoids swallowing the first real click after synthetic dragging.
- Desktop mouse binding source additionally checked at `435860a13be8bbb6f33bfa0b4dfa2e3043c2620c`: `src/features/layout/components/atlas.tsx:429–466`, backed by `src/types/settings.ts:204`. Atlas exposes `panButton` as a host parameter; it does not add a settings UI.
- Desktop `components/atlas.tsx`, `components/slab.tsx`, theme metrics → layout spacing and hover behavior. These are extracted portions, not the complete Desktop component.
- Desktop `lib/vibemon-nest-drop.ts` and its test file → station geometry and generation helpers. Original geometry test titles retained in `tests/station.test.ts`; real-browser clipping/fixed-bottom tests live in `tests/station.spec.ts`. Logical RTL nest mirroring is an Atlas extension.
- U macOS observer/Windows HID collector and tests → `rust/src/trackpad`; Desktop availability detection → `rust/src/availability.rs`. The native main-window focus reset now belongs to Atlas, and Specta registration is optional.

## Boundaries

- Desktop, U, GitCub and Yijoy production layouts now consume Atlas through a pinned GitHub package dependency. Desktop and U no longer maintain their own input/release/hover engines or native collectors. Host business stores, overview rendering, menus, pet windows and content remain in each application.
- Desktop browser Storybook could not collect the main-layout stories: its ACP spy mock throws `ReferenceError: PermissionRequestPayload is not defined`. The current module only uses that symbol as a type. This is not a browser-suite pass and the mock transformation problem was not repaired as part of Atlas.
- U full frontend/engine run: 1,314 passed, two client tests failed and two unhandled client errors. Its native lib run: 177 passed, 25 failed in native bundle/workspace/legacy-extension setup (including missing native bundle configuration). These runs are not full-suite passes. Native Clippy passed. U global lint still reports errors in unrelated chat/history/other Storybook files; changed Atlas files were checked separately.
- Yijoy’s production root uses the Svelte adapter and its existing shadcn navigation. Its CEF native runtime does not use the AppKit/Wry hook; physical native three-finger collection is not claimed for Yijoy. Pet art, animation and native pet-window lifecycle remain host responsibilities.
- Shared native collection includes macOS AppKit/Wry and Windows Precision Touchpad HID, Tauri 3 alpha and the main window. Only macOS was compiled/tested here; Windows is source-migrated without a Windows runtime validation. Electron renderer support is tested; an Electron native three-finger collector is not supplied.
- The test machine reports no trackpad. Hardware absence, reconnect logic and synthetic event paths are covered; no physical three-finger swipe is claimed.
- The AGPL source and built exports are published at https://github.com/nyssance/atlas. All four consumers pin commit e58a89af72ef9e45ac958abc31d933edb97abfa2. npm publication and a separately executed ALwith license grant have not occurred.

## CEF native container experiment — 2026-10-22

An isolated Tauri 3.0.0-alpha.5 app used Yijoy's tauri-runtime-cef 3.0.0-alpha.6 and CEF 154.5.0 dependencies. The app had a separate identifier, cache and temporary loopback DevTools port. Production app sources were unchanged. The temporary app was closed after testing.

The proposed Atlas-owned outer NSView container was **rejected as a touch collection solution**. In the actual CEF view hierarchy, hit-testing reached RenderWidgetHostViewCocoa, which implements the four touch callbacks. Dispatching synthetic three-finger NSEvent/NSTouch test doubles through those callbacks reached the outer container zero times for began/moved/ended/cancelled. Directly invoking the container with the same doubles produced [1, 1, 1, 1], validating the counter and test input. This is a callback-routing experiment, not physical input injection or a physical trackpad pass.

Baseline, container-installed and container-removed states all passed native-window click/keyboard input, document scrolling, native double-click text selection and resize checks. Replacing contentView also changed the native first responder; any future container design would need to preserve it. The HID availability check returned false, so physical three-finger, two-finger trackpad behavior, IME composition and system gesture arbitration remain untested. An earlier nested-scroll coordinate probe did not target the intended element; it is not recorded as an inner-scroll pass.

This result rejects the outer-container proposal, not CEF trackpad support generally. CEF needs a verified input integration that preserves Chromium's existing handling before Atlas can claim native three-finger support there.

Experiment source and evidence: `/private/tmp/atlas-cef-probe/src/probe.m`, `src/main.rs`, `test.mjs`, `results.json`, `route-results.json`, and the baseline/container/restored screenshots in that directory.

User scope decision — 2026-10-22: native trackpad gestures are limited to Wry for now. CEF gesture support is deferred; no further custom CEF collector is required for this delivery. Private API solutions and libraries requiring App Sandbox to be disabled are excluded. Yijoy’s production Svelte layout does not connect a native trackpad source or enable trackpad gestures; Atlas layout, mouse and keyboard support remain separate from native gesture support. This decision does not upgrade synthetic Wry coverage to physical hardware validation.

## Push verification — 2026-10-22

All four consumers successfully installed the pinned GitHub dependency. Desktop, U and GitCub passed TypeScript checks and locked Cargo checks using the installed package; Yijoy passed Svelte checks with zero errors and warnings. Atlas passed TypeScript, 19 unit tests and its distribution build immediately before its initial commit. Earlier browser/full-suite limitations above still apply.

Pushed consumer commits: Desktop `atlas` 39b4356d8; U `main` 835ef96; GitCub `main` e9f7c23; Yijoy `main` 24f8bd2.

Post-release CI follow-up: generated distribution files are excluded from source lint. A CI mouse scenario observed its RTL and cursor state reset while served by the development server. Browser verification now builds the fixture and serves the static preview, removing development dependency reoptimization and hot reload from the test path. All 20 unchanged browser scenarios passed locally against the v0.1.0 distribution after this harness change; no library runtime change was required.

## Independent Cargo publication — 2026-10-22

`atlas-tauri` 0.1.0 was published to crates.io after a successful package verification build, 14 native tests and Clippy with the Specta feature. Desktop, U and GitCub now consume the registry dependency (`version = "0.1"`), with Specta retained in Desktop/U. All three compiled successfully using the downloaded crate. The native bridge no longer depends on a frontend package installation or a sibling source checkout. CEF support remains excluded.

## Direct-input regression (2026-10-25)

- Type checking, production build, and 19 core/station unit tests passed.
- 23 Chromium interaction tests passed, including immediate cumulative-position
  tracking, stale sample rejection, bounded/reversible edge resistance, native
  cancellation, animation takeover, primary selection, middle/side mouse buttons,
  RTL, and all five framework adapters.
- Native state-machine tests cover staggered four-finger contact, three-to-four
  cancellation, four-to-three release, partial three-finger lift, focus reset,
  arming displacement preservation, and system cancellation.
- Cargo clippy passed. Native event acquisition and end-to-end physical latency
  require manual Wry testing. CEF native attachment has not been implemented or
  measured. Browser-injected gestures are not evidence of OS gesture coexistence.
- The installed Bun 1.4.4 binaries do not expose a built-in `lint` command; the
  existing `lint` script recursively invokes itself, including through ts7-lint.
  Those runs were stopped and are not recorded as successful lint checks.
- Electron's binary download failed during test setup; the Chromium run explicitly
  excluded the Electron test. No Electron or CEF validation is claimed here.

## Release 0.1.1 verification — 2026-10-25

The earlier lint and Electron setup limitations were resolved before release.
Bun canary 1.4.4-canary.1+a8fcd319b was run with its directory first in PATH,
so subprocesses used the same lint-capable binary. Native Bun lint and TS7 lint
both passed. Electron's runtime installed successfully on retry.

The release passed type checking, production build, 19 core/station tests,
all 24 browser tests including Electron, 18 native tests with Specta, strict
Clippy (`--all-targets --features specta -- -D warnings`), and Cargo publication
dry-run package verification. An additional regression ensures an idle focus
change does not discard the next gesture. Physical trackpad and CEF native
limitations above remain unchanged. Frontend and native bridge versions are
0.1.1, distributed through the existing GitHub and crates.io channels.

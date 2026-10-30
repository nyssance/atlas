# Notices and provenance

Atlas incorporates Embla Carousel (MIT), copyright David Jerleke. The complete MIT license is included in LICENSES/Embla-MIT.txt.

Layout and input behavior originate from the author's ALwith Desktop and ALwith U implementations and GitCub. Desktop reference: 494518376bf1f21ad9bde2cde6952ccff46ac5e6, `src/features/layout/lib/atlas-swipe.ts` and `src-tauri/src/platform/trackpad/`. Input arbitration is adapted from ALwith U `src/features/layout/lib/canvas-input.ts`. Atlas-specific cancellation, lifecycle and adapter tests are recorded separately.

ALwith U's existing Apache-2.0 notices remain applicable to adapted portions; Apache-2.0 license is supplied in LICENSES/Apache-2.0.txt.

Hover animations incorporate Motion, motion-dom, motion-utils and Framer Motion (MIT). Their copyright and license notices are retained in LICENSES/Motion-MIT.txt and LICENSES/Framer-Motion-MIT.txt.

ALwith U reference commit: 16d19174804a62207f2d0b9aebb1e6a83e9e4622. Desktop hover, layout metrics and station geometry also originate from `src/features/layout/components/atlas.tsx`, `trailing-board.tsx` and `lib/vibemon-nest-drop.ts`. Framework adapters and RTL station mirroring are Atlas additions.

The shared macOS observer and Windows Precision Touchpad collector derive from ALwith U `src-tauri/src/trackpad/`, including its state-machine tests; device availability detection derives from Desktop `src-tauri/src/commands/trackpad.rs`. The collector preserves the native view superclass chain and resets on main-window focus loss.

Caveat is copyright 2014 The Caveat Project Authors and distributed under SIL OFL 1.1 (LICENSES/Caveat-OFL.txt). Social icons come from Simple Icons under CC0 (LICENSES/Simple-Icons-CC0.txt).

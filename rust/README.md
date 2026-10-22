# Atlas Tauri

Native trackpad input for [Nyssance Atlas](https://github.com/nyssance/atlas).

```toml
[dependencies]
atlas-tauri = "0.1"
```

Call `atlas_tauri::install(app.handle())?` on the main thread after the `main` window is created. Register `atlas_tauri::availability::has_trackpad` with `tauri::generate_handler!`. The collector emits `trackpad-gesture` events to the main window and resets on focus loss. The optional `specta` feature exposes event types for tauri-specta registration.

This release targets Tauri 3 alpha Wry hosts. CEF native gestures are unsupported. macOS uses AppKit; Windows Precision Touchpad HID code is included but has not been runtime-validated on Windows. Other operating systems report no trackpad. Gestures should remain off until the user enables them and hardware availability is confirmed. Physical trackpad behavior was not validated on the development machine.

The crate is independent of Bun, npm, Node.js and `node_modules`. The optional front-end bridge is distributed separately as `@nyssance/atlas/tauri`.

Licensed under AGPL-3.0-only. See LICENSE and THIRD_PARTY_NOTICES.md.

import { mkdir, copyFile, rm } from "node:fs/promises";
// Generated output only: avoid stale entry points when Bun changes a shared root.
await rm(new URL("../dist", import.meta.url), { recursive: true, force: true });
await mkdir("dist", { recursive: true });
const result = await Bun.build({
  entrypoints: [
    "core",
    "layout",
    "station",
    "dom",
    "react",
    "vue",
    "angular",
    "svelte",
    "tauri",
  ].map((name) => `src/${name}.${name === "react" ? "tsx" : "ts"}`),
  outdir: "dist",
  root: "src",
  target: "browser",
  format: "esm",
  splitting: true,
  external: ["embla-carousel", "motion", "react", "vue", "@angular/core", "svelte", "@tauri-apps/api/*"],
});
if (!result.success)
  throw new AggregateError(result.logs, "Atlas build failed");
const types = Bun.spawn(
  ["bun", "x", "--bun", "--no-install", "tsc", "--emitDeclarationOnly"],
  { stdout: "inherit", stderr: "inherit" },
);
if ((await types.exited) !== 0)
  throw new Error("Declaration generation failed");
await copyFile("src/styles.css", "dist/styles.css");

import { defineConfig } from "vite";
import { compile } from "svelte/compiler";
export default defineConfig({
  root: "examples",
  publicDir: false,
  build: { target: "esnext", outDir: "../.browser-fixture", emptyOutDir: true },
  plugins: [
    {
      name: "atlas-svelte-fixture",
      transform(code, id) {
        if (!id.endsWith(".svelte")) return;
        const result = compile(code, { filename: id, generate: "client" });
        return { code: result.js.code, map: result.js.map };
      },
    },
  ],
  server: { host: "127.0.0.1", port: 6198, strictPort: true },
  resolve: { conditions: ["browser"] },
});

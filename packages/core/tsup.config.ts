import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    node: "src/node.ts",
    browser: "src/browser.ts",
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "node20",
  splitting: false,
  treeshake: true,
  minify: false,
  external: ["node:zlib"],
});

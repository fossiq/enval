import { $ } from "bun";

// Clean dist folder
await $`rm -rf dist`;
await $`mkdir -p dist`;

// Build ESM (unminified)
await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  naming: "[dir]/index.js",
  minify: false,
  sourcemap: "external",
});

// Build ESM (minified)
await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  naming: "[dir]/index.min.js",
  minify: true,
  sourcemap: "external",
});

// Build CJS (unminified)
await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "./dist",
  target: "node",
  format: "cjs",
  naming: "[dir]/index.cjs",
  minify: false,
  sourcemap: "external",
});

// Build CJS (minified)
await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "./dist",
  target: "node",
  format: "cjs",
  naming: "[dir]/index.min.cjs",
  minify: true,
  sourcemap: "external",
});

// Generate TypeScript declarations
await $`bunx tsc -p tsconfig.json --emitDeclarationOnly --declaration --outDir dist`;

console.log("✅ Build complete!");
console.log("📦 Generated files:");
console.log("  - dist/index.js (ESM, unminified)");
console.log("  - dist/index.min.js (ESM, minified)");
console.log("  - dist/index.cjs (CJS, unminified)");
console.log("  - dist/index.min.cjs (CJS, minified)");
console.log("  - dist/index.d.ts (TypeScript declarations)");

import { $ } from "bun";

type BuildVariant = {
  target: "browser" | "node";
  format: "esm" | "cjs";
  naming: string;
  minify: boolean;
};

// Clean dist folder
await $`rm -rf dist`;
await $`mkdir -p dist`;

const buildVariants: BuildVariant[] = [
  { target: "browser", format: "esm", naming: "[dir]/index.js", minify: false },
  {
    target: "browser",
    format: "esm",
    naming: "[dir]/index.min.js",
    minify: true,
  },
  { target: "node", format: "cjs", naming: "[dir]/index.cjs", minify: false },
  {
    target: "node",
    format: "cjs",
    naming: "[dir]/index.min.cjs",
    minify: true,
  },
];

await Promise.all([
  ...buildVariants.map((variant) =>
    Bun.build({
      entrypoints: ["./index.ts"],
      outdir: "./dist",
      sourcemap: "external",
      ...variant,
    }),
  ),
  $`bunx @typescript/native-preview -p tsconfig.json --emitDeclarationOnly --declaration --outDir dist`,
]);

console.log("✅ Build complete!");
console.log("📦 Generated files:");
console.log("  - dist/index.js (ESM, unminified)");
console.log("  - dist/index.min.js (ESM, minified)");
console.log("  - dist/index.cjs (CJS, unminified)");
console.log("  - dist/index.min.cjs (CJS, minified)");
console.log("  - dist/index.d.ts (TypeScript declarations)");

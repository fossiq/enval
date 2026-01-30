#!/usr/bin/env bun
import { $ } from "bun";
import { getErrorOutput, readVersionFrom } from "./utils.ts";

console.log("Publishing to npm...");

// Read local version from package.json
const localVersion = await readVersionFrom("package.json");
console.log(`Local version: ${localVersion}`);

// Check remote version
try {
  const remoteVersion = await $`bunx npm@latest view @fossiq/enval version`.text();
  const cleanVersion = remoteVersion.trim();
  console.log(`Remote npm version: ${cleanVersion}`);

  if (localVersion === cleanVersion) {
    console.log(`Version ${localVersion} already published to npm. Skipping publish.`);
    process.exit(0);
  }
} catch {
  console.log("Package not found on npm or unable to fetch info. Will attempt to publish.");
}

// Attempt to publish
try {
  const output = await $`bunx npm@latest publish --access public`.text();
  console.log(output);
  console.log("Successfully published to npm!");
} catch (error: unknown) {
  const output = getErrorOutput(error);

  if (output.includes("You cannot publish over the previously published versions")) {
    console.log("Version already published. Exiting successfully.");
    process.exit(0);
  }

  console.error(output);
  process.exit(1);
}

#!/usr/bin/env bun
import { $ } from "bun";

console.log("Publishing to JSR...");

// Read local version from jsr.json
const jsrJson = await Bun.file("jsr.json").json();
const localVersion = jsrJson.version;
console.log(`Local version: ${localVersion}`);

// Check remote version
try {
  const result = await $`bunx jsr info @fossiq/enval`.text();
  const match = result.match(/Latest:\s*(\S+)/);
  
  if (match) {
    const remoteVersion = match[1];
    console.log(`Remote JSR version: ${remoteVersion}`);
    
    if (localVersion === remoteVersion) {
      console.log(`Version ${localVersion} already published to JSR. Skipping publish.`);
      process.exit(0);
    }
  }
} catch (error) {
  console.log("Package not found on JSR or unable to fetch info. Will attempt to publish.");
}

// Attempt to publish
try {
  const output = await $`bunx jsr publish`.text();
  console.log(output);
  console.log("Successfully published to JSR!");
} catch (error: any) {
  const output = error.stderr?.toString() || error.stdout?.toString() || error.message;
  
  if (
    output.includes("already exists") ||
    output.includes("already published") ||
    output.includes("version already exists")
  ) {
    console.log("Version already published. Exiting successfully.");
    process.exit(0);
  }
  
  console.error(output);
  process.exit(1);
}

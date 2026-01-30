#!/usr/bin/env bun
import { $ } from "bun";
import { getErrorOutput, readVersionFrom } from "./utils.ts";

const version = await readVersionFrom("package.json");
const tag = `v${version}`;

console.log(`Checking if release ${tag} exists...`);

// Check if release already exists
try {
  await $`gh release view ${tag}`.quiet();
  console.log(`Release ${tag} already exists. Skipping.`);
  process.exit(0);
} catch {
  // Release doesn't exist, continue
}

// Get the previous release tag to generate notes from
let notesFlag: string[];
try {
  const previousTag = await $`gh release list --limit 1 --json tagName -q '.[0].tagName'`.text();
  if (previousTag.trim()) {
    notesFlag = ["--notes-start-tag", previousTag.trim()];
    console.log(`Generating notes from ${previousTag.trim()} to ${tag}`);
  } else {
    notesFlag = [];
  }
} catch {
  notesFlag = [];
}

console.log(`Creating release ${tag}...`);

try {
  await $`gh release create ${tag} --title ${tag} --generate-notes ${notesFlag}`;
  console.log(`Successfully created release ${tag}!`);
} catch (error: unknown) {
  const message = getErrorOutput(error);
  console.error(`Failed to create release: ${message}`);
  process.exit(1);
}

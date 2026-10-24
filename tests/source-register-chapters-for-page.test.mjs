// The recipe `chapters-for-page` of MOD-source-register's sourceStrategies (ITM-500): the book's chapters for the menu entry of the page a conversation is held on, which
// the job's parameter `entry` names — the key of MOD-site-frame's `Route.entry`.
// Run: node --test tests/source-register-chapters-for-page.test.mjs
//
// Module: MOD-source-register
// Guards: A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING; A TEST JOB RECEIVES THE CHAPTER ON TESTING
// Guards: AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION
// Guards: AN IMPLEMENTATION JOB RECEIVES THE CHAPTERS ON MODELING, DESIGN, IMPLEMENTATION AND TESTING
// Level: unit
//
// Every expected value is stated in this file: the chapter numbers of each key (requirements and use-cases 8; architecture 9, 10, 11, 12; implementation 9, 11, 12, 13;
// tests and releases 13) and the keys that give no part. The only thing read from the disk is the text of a chapter's file in this instance's register version
// 2026-10-05 — the content a part must hold, never a number of chapters. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { sourceStrategies } from "../src/source-register/index.mjs";

const ROOT = new URL("../", import.meta.url);
const FOLDER = "docs/sources/SRC-vibe-coding/2026-10-05/";
const onDisk = (path) => { try { return readFileSync(new URL(path, ROOT), "utf8"); } catch { return null; } };
const fileOf = (chapter) => readdirSync(new URL(FOLDER, ROOT)).find((name) => name.startsWith(`${String(chapter).padStart(2, "0")}_`));

const snapshot = {
  repository: { server: "github", origin: "https://github.com", path: "akmaier/agent-m", web: "https://github.com/akmaier/agent-m" },
  ref: "main", commit: null, paths: [], read: async (path) => onDisk(path), blob: () => null,
};
const context = { instance: { snapshot, host: null }, params: {}, places: { sources: {}, mailbox: null } };
const page = (params) => sourceStrategies.recipes["chapters-for-page"](context, params);
const textsOf = (parts) => parts.map((part) => part.text);

// TST-500001 · level: unit · module: MOD-source-register
// guards: A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING; A TEST JOB RECEIVES THE CHAPTER ON TESTING; AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION; AN IMPLEMENTATION JOB RECEIVES THE CHAPTERS ON MODELING, DESIGN, IMPLEMENTATION AND TESTING
// given: this instance, whose register entry SRC-vibe-coding has the version 2026-10-05 with the book's chapters
// input: chapters-for-page with the parameter entry set to each of requirements, use-cases, architecture, implementation, tests, releases
// expect: requirements and use-cases chapter 8; architecture chapters 9, 10, 11, 12; implementation chapters 9, 11, 12, 13; tests and releases chapter 13 — one part per chapter in the order of their numbers, each the whole file as the disk holds it, required, naming SRC-vibe-coding as its only source and the file and version 2026-10-05 in its name
test("chapters-for-page — each of the six keys gives the chapters of its row", async () => {
  const rows = { requirements: [8], "use-cases": [8], architecture: [9, 10, 11, 12], implementation: [9, 11, 12, 13], tests: [13], releases: [13] };
  for (const [entry, chapters] of Object.entries(rows)) {
    const parts = await page({ entry });
    assert.deepEqual(parts.map((part) => [part.text, part.sources, part.required]),
      chapters.map((chapter) => [onDisk(FOLDER + fileOf(chapter)), ["SRC-vibe-coding"], true]), entry);
    for (const [at, part] of parts.entries()) {
      assert.ok(part.name.includes(fileOf(chapters[at])) && part.name.includes("2026-10-05"), `${entry}: ${part.name}`);
    }
  }
});

// TST-500002 · level: unit · module: MOD-source-register
// guards: A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING
// given: the recipes chapters-for-requirements, chapters-for-architecture, chapters-for-implementation and chapters-for-tests on this instance
// input: chapters-for-page with entry requirements, architecture, implementation and tests, and each of the four recipes
// expect: for each pair the parts are equal in every field — the same name with its file, version and hash, the same text, size, sources and required
test("chapters-for-page — its parts equal those of the four recipes for the same row", async () => {
  const pairs = { requirements: "chapters-for-requirements", architecture: "chapters-for-architecture", implementation: "chapters-for-implementation", tests: "chapters-for-tests" };
  for (const [entry, recipe] of Object.entries(pairs)) {
    const expected = await sourceStrategies.recipes[recipe](context, {});
    assert.equal(expected.length > 0, true, `known positive: ${recipe} gives parts`);
    assert.deepEqual(await page({ entry }), expected, entry);
  }
});

// TST-500003 · level: unit · module: MOD-source-register
// guards: A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING
// given: known positive first — entry tests, which gives one part; then entries that name no row
// input: chapters-for-page with entry maintenance, settings, null, a parameters object without entry, no parameters at all, an empty text, an unknown key (home), and a key in capitals (Requirements)
// expect: the known positive gives chapter 13; every other call gives no part, the empty list, and is not refused
test("chapters-for-page — maintenance, settings, null, a missing entry and any other value give no part", async () => {
  assert.deepEqual(textsOf(await page({ entry: "tests" })), [onDisk(FOLDER + fileOf(13))]);
  for (const params of [{ entry: "maintenance" }, { entry: "settings" }, { entry: null }, {}, undefined, { entry: "" }, { entry: "home" }, { entry: "Requirements" }]) {
    assert.deepEqual(await page(params), [], JSON.stringify(params));
  }
});

// The book's chapters for a job's kind of work — MOD-source-register's four recipes and readContent, through which they
// read, as docs/architecture/MOD-source-register.md states them; and MOD-text-tools' sha256, with which a file read is
// checked against its recorded hash.
// Run: node --test tests/source-register-chapters.test.mjs
//
// Module: MOD-source-register
// Guards: A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING; A TEST JOB RECEIVES THE CHAPTER ON TESTING
// Guards: AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION
// Guards: AN IMPLEMENTATION JOB RECEIVES THE CHAPTERS ON MODELING, DESIGN, IMPLEMENTATION AND TESTING
// Guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// Level: component
//
// Every expected value is read from the module file and from this instance's own register entry: the recipes' table of
// chapters (8; 13; 9, 10, 11, 12; 9, 11, 12, 13), a chapter as the file whose name begins with its number in two digits
// and `_`, the newest version as the last row of `## Versions`, its files and their SHA-256 under `### Files of <version>`,
// and the version's hash as the SHA-256 of the lines `<SHA-256 of the file>  <file name>`, sorted by name. The instance is
// this repository: a snapshot of it reads its files from the disk, never changing them. Where a test needs an entry or a
// file the instance does not hold, the snapshot gives that text for one path and the disk's for every other. Each test
// states its input and its expected result before it runs (given / input / expect); where a test asserts a refusal, the
// same call is first shown to succeed. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { readContent, sourceStrategies } from "../src/source-register/index.mjs";
import { sha256 } from "../src/text-tools/index.mjs";

const ROOT = new URL("../", import.meta.url);
const ENTRY_PATH = "docs/sources/SRC-vibe-coding.md";
const VERSION = "2026-10-05";
const FOLDER = `docs/sources/SRC-vibe-coding/${VERSION}/`;
const CHAPTERS = { "chapters-for-requirements": [8], "chapters-for-tests": [13],
  "chapters-for-architecture": [9, 10, 11, 12], "chapters-for-implementation": [9, 11, 12, 13] };

const onDisk = (path) => { try { return readFileSync(new URL(path, ROOT), "utf8"); } catch { return null; } };
const fileOf = (chapter) => readdirSync(new URL(FOLDER, ROOT)).find((name) => name.startsWith(`${String(chapter).padStart(2, "0")}_`));
const hex = (text) => createHash("sha256").update(text, "utf8").digest("hex");

// A snapshot of this instance, as MOD-repository-hosts' Snapshot states it, reading from the disk — except the texts
// `changed` gives, by path, where a test needs another text (null for a file the instance does not hold).
const snapshotOf = (changed = {}) => ({
  repository: { server: "github", origin: "https://github.com", path: "akmaier/agent-m", web: "https://github.com/akmaier/agent-m" },
  ref: "main", commit: null, paths: [],
  read: async (path) => (path in changed ? changed[path] : onDisk(path)),
  blob: () => null,
});
const contextOf = (snapshot) => ({ instance: { snapshot, host: null }, params: {}, places: { sources: {}, mailbox: null } });

// The version of the instance's entry, as readContent takes it: its files and their hashes, as `### Files of` lists them.
const entryText = onDisk(ENTRY_PATH);
const recorded = [...entryText.matchAll(/^\| `([^`]+)` \| `([0-9a-f]{64})` \|$/gm)].map((m) => ({ name: m[1], sha256: m[2] }));
const versionOf = (files) => ({ source: "SRC-vibe-coding", version: VERSION, date: VERSION, retrieved: null,
  repositoryVersion: null, commit: null, files: files.map((file) => ({ ...file, stored: true })), hash: "" });
const openThe = (snapshot) => async () => ({ repositoryInfo: async () => ({ defaultBranch: "main" }),
  readSnapshot: async () => snapshot });

// ---------------------------------------------------------------- sha256

// TST-472883 · level: component · module: MOD-source-register
// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: known positive first — the empty text, whose SHA-256 is e3b0c442…b855; then the text of chapter 8 as the disk holds it, and the same as its UTF-8 bytes; the register entry's recorded SHA-256 of that file
// input: sha256 of each
// expect: the known value for the empty text; for chapter 8, as text and as bytes, the hash the entry records
test("sha256 — the SHA-256 of a text's UTF-8 bytes or of bytes, as 64 lowercase hexadecimal digits", async () => {
  assert.equal(await sha256(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  const text = onDisk(FOLDER + fileOf(8));
  const expected = recorded.find((file) => file.name === fileOf(8)).sha256;
  assert.equal(await sha256(text), expected);
  assert.equal(await sha256(new TextEncoder().encode(text)), expected);
});

// ---------------------------------------------------------------- readContent

// TST-472884 · level: component · module: MOD-source-register
// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: known positive first — the version 2026-10-05 with two of its files and their recorded hashes, held by this instance; then the same with chapter 8 changed by one character, and with chapter 8 missing
// input: readContent(version, open), open giving the host of this instance
// expect: both files, by name, with their bytes as the disk holds them; for the changed file HashMismatch naming the file, the recorded and the actual hash; for the missing one ContentUnreadable naming the file
test("readContent — reads every stored file of a version and checks each against its recorded SHA-256", async () => {
  const two = recorded.filter((file) => [fileOf(8), fileOf(13)].includes(file.name));
  const files = await readContent(versionOf(two), openThe(snapshotOf()));
  assert.deepEqual(files.map((file) => [file.name, new TextDecoder().decode(file.bytes)]),
    two.map((file) => [file.name, onDisk(FOLDER + file.name)]));

  const path = FOLDER + fileOf(8);
  const changed = `${onDisk(path)}x`;
  await assert.rejects(readContent(versionOf(two), openThe(snapshotOf({ [path]: changed }))), (error) =>
    error.name === "HashMismatch" && error.file === fileOf(8)
      && error.expected === two.find((file) => file.name === fileOf(8)).sha256 && error.actual === hex(changed));
  await assert.rejects(readContent(versionOf(two), openThe(snapshotOf({ [path]: null }))), (error) =>
    error.name === "ContentUnreadable" && error.reason.includes(fileOf(8)));
});

// ---------------------------------------------------------------- the four recipes

// TST-472885 · level: component · module: MOD-source-register
// guards: A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING; A TEST JOB RECEIVES THE CHAPTER ON TESTING; AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION; AN IMPLEMENTATION JOB RECEIVES THE CHAPTERS ON MODELING, DESIGN, IMPLEMENTATION AND TESTING
// given: this instance, whose register entry SRC-vibe-coding has the version 2026-10-05 with the book's chapters
// input: each of the four recipes of sourceStrategies, with a job's context on this instance
// expect: one part per chapter of the recipe's row, in the order of their numbers; each the whole file as the disk holds it, required, naming SRC-vibe-coding as its only source, and naming in its name the file, the version and the version's hash — the SHA-256 of the files' hash lines, sorted by name
test("sourceStrategies — each chapter recipe gives the chapters of its kind of work, whole, in order, pinned to the version and its hash", async () => {
  const lines = [...recorded].sort((a, b) => (a.name < b.name ? -1 : 1)).map((file) => `${file.sha256}  ${file.name}\n`);
  const versionHash = hex(lines.join(""));
  assert.ok(entryText.includes(versionHash), "known positive: the hash computed is the one the entry records");
  for (const [recipe, chapters] of Object.entries(CHAPTERS)) {
    const parts = await sourceStrategies.recipes[recipe](contextOf(snapshotOf()), {});
    assert.deepEqual(parts.map((part) => [part.text, part.sources, part.required]),
      chapters.map((chapter) => [onDisk(FOLDER + fileOf(chapter)), ["SRC-vibe-coding"], true]), recipe);
    for (const [at, part] of parts.entries()) {
      for (const word of [fileOf(chapters[at]), VERSION, versionHash]) assert.ok(part.name.includes(word), `${recipe}: ${word}`);
    }
  }
});

// TST-472886 · level: component · module: MOD-source-register
// guards: A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING
// given: this instance's entry with a second, newer version appended — the last row of ## Versions — whose files list only chapter 13, under its own `### Files of`
// input: chapters-for-tests and chapters-for-requirements on that instance
// expect: chapters-for-tests reads chapter 13 from the newer version's folder; chapters-for-requirements is refused with ChapterMissing naming chapter 8 and the newer version
test("sourceStrategies — a chapter recipe reads the newest version, and names a chapter that version lacks", async () => {
  const newer = "2026-11-01";
  const thirteen = fileOf(13);
  const text = onDisk(FOLDER + thirteen);
  const row = `| \`${newer}\` | ${newer} | a later manuscript | the same | one chapter below |`;
  const appended = entryText.replace(/(\n\| `2026-10-05` \|[^\n]*\n)/, `$1${row}\n`)
    .replace("\n## Parts", `\n### Files of ${newer}\n\n| File | SHA-256 |\n|---|---|\n| \`${thirteen}\` | \`${hex(text)}\` |\n\n## Parts`);
  assert.ok(appended.includes(row) && appended.includes(`### Files of ${newer}`), "known positive: the newer version is appended");
  const snapshot = snapshotOf({ [ENTRY_PATH]: appended, [`docs/sources/SRC-vibe-coding/${newer}/${thirteen}`]: text });

  const parts = await sourceStrategies.recipes["chapters-for-tests"](contextOf(snapshot), {});
  assert.deepEqual(parts.map((part) => [part.text, part.name.includes(newer)]), [[text, true]]);
  await assert.rejects(sourceStrategies.recipes["chapters-for-requirements"](contextOf(snapshot), {}),
    (error) => error.name === "ChapterMissing" && error.chapter === 8 && error.version === newer);
});

// TST-472887 · level: component · module: MOD-source-register
// guards: A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING
// given: known positive first — this instance; then an instance without the register entry SRC-vibe-coding
// input: chapters-for-requirements on each
// expect: chapter 8 on this instance; NotRegistered naming SRC-vibe-coding on the other
test("sourceStrategies — a chapter recipe on an instance without SRC-vibe-coding is refused as NotRegistered", async () => {
  assert.equal((await sourceStrategies.recipes["chapters-for-requirements"](contextOf(snapshotOf()), {})).length, 1);
  await assert.rejects(sourceStrategies.recipes["chapters-for-requirements"](contextOf(snapshotOf({ [ENTRY_PATH]: null })), {}),
    (error) => error.name === "NotRegistered" && error.source === "SRC-vibe-coding");
});

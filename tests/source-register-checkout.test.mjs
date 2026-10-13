// The book's chapters read in a checkout of the instance (ITM-392) — the four chapter recipes of MOD-source-register's `sourceStrategies`, as the accepted text of
// docs/architecture/MOD-source-register.md states them (Interfaces: "For a job whose participant works in a checkout of the instance — the context's `instance.checkout` —, each part holds
// instead the path of the chapter's file in that checkout and none of its text, once the file read there has the SHA-256 the version records ... None of these parts may be left out ...
// Throws as `readContent` throws, `NotRegistered { source }` ... and `ChapterMissing { chapter, version }`"), and the SPEC requirement A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS
// THERE ("each chapter ... as the path of the chapter's file in that checkout, whose SHA-256 is the one the source register records"). For UC-010 step 3 and UC-011 step 3.
// Run: node --test tests/source-register-checkout.test.mjs
//
// Module: MOD-source-register
// Guards: A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE; A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING; A TEST JOB RECEIVES THE CHAPTER ON TESTING; AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION; AN IMPLEMENTATION JOB RECEIVES THE CHAPTERS ON MODELING, DESIGN, IMPLEMENTATION AND TESTING
// Level: unit
//
// The checkout is a folder this file makes in the system's temporary folder, laid out as the instance is (`docs/sources/SRC-vibe-coding/<version>/<file>`), with six chapter files;
// the instance's snapshot, from which the register entry and the newest version are read (ITM-391), holds the entry and every chapter file too, and records each path it is
// asked for, so that a test can show that a chapter's text is not read through it. The module file gives no form for "the path": these tests take the checkout's folder joined with the file's
// path in the instance, absolute, and compare after resolving symlinks (/var and /private/var are one on macOS). The part's name is as it was: the file, the version and the version's hash.
// The last test runs the recipes over this repository itself, as a checkout of the instance. Each test states its input and its expected result before it runs (given / input / expect);
// where a test asserts a refusal, the same call is first shown to succeed. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sourceStrategies } from "../src/source-register/index.mjs";

const hex = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const BOOK = "SRC-vibe-coding", VERSION = "2026-10-05";
const CHAPTERS = { "chapters-for-requirements": [8], "chapters-for-tests": [13], "chapters-for-architecture": [9, 10, 11, 12], "chapters-for-implementation": [9, 11, 12, 13] };
const FILES = Object.fromEntries([8, 9, 10, 11, 12, 13].map((n) => [`${String(n).padStart(2, "0")}_chapter-${n}.md`, `Chapter ${n} of the book, in full.\n`]));
const fileOf = (chapter) => Object.keys(FILES).find((name) => name.startsWith(`${String(chapter).padStart(2, "0")}_`));
const versionHash = (files) => hex(Object.entries(files).sort(([a], [b]) => (a < b ? -1 : 1)).map(([name, text]) => `${hex(text)}  ${name}\n`).join(""));
const entryOf = (files) => ["---", `id: ${BOOK}`, "title: Vibe Coding", "kind: document", "authority: advisory", "licence: may be republished — CC BY 4.0", "---",
  `# ${BOOK} Vibe Coding`, "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`${VERSION}\` | 2026-10-05 | fixture | fixture | listed below |`, "", `### Files of ${VERSION}`, "", "| File | SHA-256 |", "|---|---|",
  ...Object.entries(files).map(([name, text]) => `| \`${name}\` | \`${hex(text)}\` |`), ""].join("\n");

// The checkout on disk: the instance's layout with the files given, in a folder of its own.
function checkoutWith(files) {
  const folder = mkdtempSync(join(tmpdir(), "agent-m-392-"));
  mkdirSync(join(folder, "docs", "sources", BOOK, VERSION), { recursive: true });
  for (const [name, text] of Object.entries(files)) writeFileSync(join(folder, "docs", "sources", BOOK, VERSION, name), text);
  return folder;
}
// The instance's snapshot: the entry and every chapter file, recording each path read.
function contextOf(checkout, { entry = entryOf(FILES), held = FILES } = {}) {
  const reads = [];
  const texts = { [`docs/sources/${BOOK}.md`]: entry, ...Object.fromEntries(Object.entries(held).map(([name, text]) => [`docs/sources/${BOOK}/${VERSION}/${name}`, text])) };
  const snapshot = { repository: { server: "github", origin: "https://github.com", path: "alice/agent-m", web: "https://github.com/alice/agent-m" }, ref: "main", commit: null,
    paths: Object.keys(texts), read: async (path) => { reads.push(path); return path in texts ? texts[path] : null; }, blob: () => null };
  return { reads, context: { params: {}, places: { sources: {}, mailbox: null }, product: { address: "https://github.com/alice/product", snapshot: null, host: null },
    instance: { snapshot, host: null, ...(checkout === undefined ? {} : { checkout }) } } };
}
const recipe = (name, context) => sourceStrategies.recipes[name](context, {});
const folders = [];
const checkout = (files = FILES) => { const folder = checkoutWith(files); folders.push(folder); return folder; };
test.after(() => { for (const folder of folders) rmSync(folder, { recursive: true, force: true }); });
const pathOf = (folder, name) => join(realpathSync(folder), "docs", "sources", BOOK, VERSION, name);

// TST-472888 · level: unit · module: MOD-source-register
// guards: A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE; A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING; A TEST JOB RECEIVES THE CHAPTER ON TESTING
// given: a checkout of the instance holding six chapter files, and a context naming it; each recipe's chapters (8; 13; 9, 10, 11, 12; 9, 11, 12, 13)
// input: each of the four recipes
// expect: one part per chapter, in the recipe's order, whose text is the path of that chapter's file in the checkout — and holds none of the chapter's text —, naming SRC-vibe-coding as its only source, required, and its name the file, the version and the version's hash; no chapter file read through the instance's snapshot
test("chapter recipes — in a checkout, each part holds the path of its chapter's file and none of its text", async () => {
  const folder = checkout();
  for (const [name, chapters] of Object.entries(CHAPTERS)) {
    const { context, reads } = contextOf(folder);
    const parts = await recipe(name, context);
    assert.equal(parts.length, chapters.length, name);
    for (const [at, part] of parts.entries()) {
      assert.equal(realpathSync(part.text), pathOf(folder, fileOf(chapters[at])), `${name}: path`);
      assert.ok(!part.text.includes("of the book, in full"), "none of the text");
      assert.deepEqual([part.sources, part.required], [[BOOK], true]);
      for (const word of [fileOf(chapters[at]), VERSION, versionHash(FILES)]) assert.ok(part.name.includes(word), `${name}: ${word}`);
    }
    assert.deepEqual(reads, [`docs/sources/${BOOK}.md`], `${name}: only the register entry is read through the snapshot`);
  }
});

// TST-472889 · level: unit · module: MOD-source-register
// guards: A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: known positive first — the checkout as it is; then the checkout whose chapter 8 file has other bytes than the version records; then one that lacks chapter 8's file
// input: chapters-for-requirements on each
// expect: the path for the first; HashMismatch naming the file, the hash the version records and the hash found, for the second; ContentUnreadable naming the missing file for the third; no part of either
test("chapter recipes — a chapter file in the checkout whose bytes differ fails by name, and so does a missing one", async () => {
  assert.equal((await recipe("chapters-for-requirements", contextOf(checkout()).context)).length, 1, "known positive");
  const changed = checkout({ ...FILES, [fileOf(8)]: `${FILES[fileOf(8)]}x` });
  await assert.rejects(recipe("chapters-for-requirements", contextOf(changed).context), (error) => error.name === "HashMismatch" && error.file === fileOf(8)
    && error.expected === hex(FILES[fileOf(8)]) && error.actual === hex(`${FILES[fileOf(8)]}x`));
  const { [fileOf(8)]: _, ...without } = FILES;
  await assert.rejects(recipe("chapters-for-requirements", contextOf(checkout(without)).context), (error) => error.name === "ContentUnreadable" && error.reason.includes(fileOf(8)));
});

// TST-472890 · level: unit · module: MOD-source-register
// guards: A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE; A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING
// given: the checkout; a changed chapter file that no part of the recipe names (chapter 10, for chapters-for-requirements)
// input: chapters-for-requirements
// expect: the path of chapter 8 — only the files of the recipe's chapters are checked
test("chapter recipes — only the files of the recipe's own chapters are checked in the checkout", async () => {
  const folder = checkout({ ...FILES, [fileOf(10)]: "another text\n" });
  const [part] = await recipe("chapters-for-requirements", contextOf(folder).context);
  assert.equal(realpathSync(part.text), pathOf(folder, fileOf(8)));
});

// TST-472891 · level: unit · module: MOD-source-register
// guards: A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE
// given: a context with a checkout, and an instance whose newest version holds no file for chapter 13
// input: chapters-for-tests; chapters-for-requirements on the same, as a known positive
// expect: ChapterMissing naming chapter 13 and the version; chapter 8's path for the other
test("chapter recipes — a chapter the version lacks is refused as ChapterMissing in a checkout too", async () => {
  const { [fileOf(13)]: _, ...shorter } = FILES;
  const folder = checkout(FILES);
  const entry = entryOf(shorter);
  assert.equal((await recipe("chapters-for-requirements", contextOf(folder, { entry }).context)).length, 1, "known positive");
  await assert.rejects(recipe("chapters-for-tests", contextOf(folder, { entry }).context), (error) => error.name === "ChapterMissing" && error.chapter === 13 && error.version === VERSION);
});

// TST-472892 · level: unit · module: MOD-source-register
// guards: A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE; RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE
// given: an entry whose note says chapter 8's file was only hashed (`not stored:`, ITM-455), and a checkout that holds a file of that name all the same
// input: chapters-for-requirements; chapters-for-tests as a known positive
// expect: ChapterMissing naming chapter 8 — a file that was only hashed is no file of the version, so the checkout's copy is not given —; the path of chapter 13 for the other
test("chapter recipes — a chapter file that was only hashed is not given from the checkout", async () => {
  const entry = entryOf(FILES).replace("| fixture | listed below |", `| fixture | 6 files, listed below; not stored: ${fileOf(8)} |`);
  assert.notEqual(entry, entryOf(FILES), "the note is in the entry");
  const folder = checkout();
  assert.equal((await recipe("chapters-for-tests", contextOf(folder, { entry }).context)).length, 1, "known positive");
  await assert.rejects(recipe("chapters-for-requirements", contextOf(folder, { entry }).context), (error) => error.name === "ChapterMissing" && error.chapter === 8);
});

// TST-472893 · level: unit · module: MOD-source-register
// guards: A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE; A RUNTIME IS INTERCHANGEABLE
// given: a context without a checkout — `null`, as in a browser, and with no such key —, the chapter files in the instance's snapshot
// input: each recipe
// expect: the whole texts of the chapters, as without this item: the part's text is the file's text, not a path
test("chapter recipes — without a checkout, the whole texts", async () => {
  for (const checkoutValue of [null, undefined]) {
    for (const [name, chapters] of Object.entries(CHAPTERS)) {
      const parts = await recipe(name, contextOf(checkoutValue).context);
      assert.deepEqual(parts.map((part) => part.text), chapters.map((chapter) => FILES[fileOf(chapter)]), `${name} ${checkoutValue}`);
    }
  }
});

// TST-472894 · level: unit · module: MOD-source-register
// guards: A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE
// given: this repository itself as the checkout of the instance, its snapshot read from the disk; its register entry docs/sources/SRC-vibe-coding.md
// input: each of the four recipes, with the repository's root as the checkout
// expect: each chapter given as the path of a file that exists in this repository, whose SHA-256 is the one the register records, and none by its text
test("chapter recipes — over this repository, every chapter is a path of a file here with the hash the register records", async () => {
  const root = new URL("../", import.meta.url).pathname;
  const folder = join(root, "docs", "sources", BOOK, VERSION);
  const entryText = readFileSync(join(root, "docs", "sources", `${BOOK}.md`), "utf8");
  const snapshot = { repository: { server: "github", origin: "https://github.com", path: "akmaier/agent-m", web: "https://github.com/akmaier/agent-m" }, ref: "main", commit: null,
    paths: [], read: async (path) => (path === `docs/sources/${BOOK}.md` ? entryText : null), blob: () => null };
  const context = { params: {}, places: { sources: {}, mailbox: null }, product: { address: "https://github.com/akmaier/agent-m", snapshot: null, host: null },
    instance: { snapshot, host: null, checkout: root } };
  const recorded = Object.fromEntries([...entryText.matchAll(/^\| `([^`]+)` \| `([0-9a-f]{64})` \|$/gm)].map((m) => [m[1], m[2]]));
  const onDisk = readdirSync(folder);
  for (const [name, chapters] of Object.entries(CHAPTERS)) {
    const parts = await recipe(name, context);
    assert.equal(parts.length, chapters.length, name);
    for (const part of parts) {
      assert.ok(onDisk.includes(part.text.split("/").at(-1)) && part.text.startsWith(folder), `${name}: ${part.text}`);
      assert.equal(hex(readFileSync(part.text, "utf8")), recorded[part.text.split("/").at(-1)], "the hash the register records");
      assert.ok(part.text.length < 400, "a path, not a text");
    }
  }
});

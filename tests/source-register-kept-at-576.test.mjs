// The note where a copy that was only hashed is kept (ITM-576) — MOD-source-register's registrationCommits and versionCommits, as the accepted text of
// docs/architecture/MOD-source-register.md states them (Interfaces: a file not kept is recorded "with its `note`, where its copy is kept", and a file not kept
// that has no note is refused with `NoteMissing`; Data: each file "with its SHA-256 ... or a note where a copy that was only hashed is kept"), for UC-004 step 4a
// and UC-016. Where the texts leave a reading open, the test states the reading it takes:
//   - The note stands in the version's file table under `### Files of <version>`, whose third column is `Kept at`: the note for a file not stored, and `—` for a
//     stored one; a `|` in a note is written `\|`. The cell Files of the version's row is unchanged (`not stored: <names>`).
//   - The text writes `NoteMissing { name }`; an error's own `name` is its identifier, as in every other failure of the module, so the file's name is carried in
//     the property `file`, as HashMismatch { file, ... } carries its file's.
//   - A file has no note when `note` is absent, empty or only blanks.
// A version is read as a caller reads it, through linkedVersion with a product's links file. Run: node --test tests/source-register-kept-at-576.test.mjs
//
// Module: MOD-source-register
// Guards: UC-004; UC-016; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; A SOURCE VERSION IS NEVER OVERWRITTEN
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect); the expected texts are written out here, not read from a document.
// Where a test asserts a refusal, the same call is first shown to succeed. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readDocument, writeDocument } from "../src/documents/index.mjs";
import * as sourceRegister from "../src/source-register/index.mjs";

const { sourceSchemas, linkedVersion, registrationCommits, versionCommits } = sourceRegister;
const INSTANCE = "alice/requirements";

const encode = (text) => new TextEncoder().encode(text);
const hex = (bytes) => createHash("sha256").update(bytes).digest("hex");
// The version's hash of Data: the SHA-256 of the lines `<SHA-256>  <name>`, one per file sorted by name, each ended by a line feed.
const versionHashOf = (files) => hex(files.map((file) => ({ name: file.name, sha: hex(file.bytes) }))
  .sort((a, b) => (a.name < b.name ? -1 : 1)).map((file) => `${file.sha}  ${file.name}\n`).join(""));

const FRONT = ["---", "id: SRC-open-handbook", "title: A source", "kind: document", "authority: advisory", "licence: may be republished — CC BY 4.0", "---",
  "# SRC-open-handbook A source", "", "## Versions", ""];
const COLUMNS = ["| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|"];
const readEntry = (lines) => readDocument(sourceSchemas().entry, "docs/sources/SRC-open-handbook.md", lines.join("\n"));
// The entry of a registration as the form hands it over: the first version's row, its Files cell not yet filled.
const NEW_ENTRY = () => readEntry([...FRONT, ...COLUMNS, "| `2026-10-12` | 2026-10-12 | the first edition | the author's disk | — |", ""]);

const CHAPTER = { name: "chapter-1.md", bytes: encode("# Chapter 1\n\nThe first chapter.\n"), keep: true };
const NOTE = "cabinet 3, shelf B";
const HASHED = { name: "paid.pdf", bytes: encode("the publisher's bytes"), keep: false, note: NOTE };

const written = (plan, path = "docs/sources/SRC-open-handbook.md") => {
  const file = plan.find((commit) => commit.repository === INSTANCE).files.find((each) => each.path === path);
  return { text: file.content, entry: readDocument(sourceSchemas().entry, path, file.content) };
};
const linksOf = (version) => readDocument(sourceSchemas().links, "docs/sources.md",
  ["# Requirement sources of the test", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-open-handbook | ${version} | ${"0".repeat(64)} | |`, ""].join("\n"));
const storedOf = (entry, version) => Object.fromEntries(linkedVersion(linksOf(version), [entry], "SRC-open-handbook").version.files.map((file) => [file.name, file.stored]));
const isNoteMissing = (name) => (error) => error.name === "NoteMissing" && error.file === name;

// TST-576001 · level: unit · module: MOD-source-register
// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; UC-004 step 4a
// given: the entry of a source that may be republished, with its first version `2026-10-12`; one file kept, chapter-1.md, and one only hashed, paid.pdf, with the note `cabinet 3, shelf B`
// input: registrationCommits(entry, [CHAPTER, HASHED], "alice/requirements"), and the register entry of the plan read back
// expect: under `### Files of 2026-10-12` the table `| File | SHA-256 | Kept at |` with the separator `|---|---|---|`, the row of chapter-1.md ending `| — |` and the row of paid.pdf ending `| cabinet 3, shelf B |`, each with the SHA-256 of its bytes, in the order of the files given; the cell Files of the version's row unchanged: `2 files, listed below; version hash `<hash>`; not stored: paid.pdf`
test("registrationCommits — the file table has the column Kept at: the note for a file only hashed, a dash for a file kept", async () => {
  assert.equal(typeof registrationCommits, "function", "the module provides registrationCommits");
  const files = [CHAPTER, HASHED];
  const { text, entry } = written(await registrationCommits(NEW_ENTRY(), files, INSTANCE));
  const table = ["### Files of 2026-10-12", "", "| File | SHA-256 | Kept at |", "|---|---|---|",
    `| \`chapter-1.md\` | \`${hex(CHAPTER.bytes)}\` | — |`, `| \`paid.pdf\` | \`${hex(HASHED.bytes)}\` | cabinet 3, shelf B |`].join("\n");
  assert.equal(text.includes(table), true, "the file table as written");
  const versions = entry.sections.find((section) => section.heading === "## Versions");
  assert.equal(versions.rows[0].cells.Files, `2 files, listed below; version hash \`${versionHashOf(files)}\`; not stored: paid.pdf`);
});

// TST-576002 · level: unit · module: MOD-source-register
// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; UC-004 step 4a
// given: the same entry, and a note with a bar in it: `drawer A | box 2`
// input: registrationCommits(entry, [CHAPTER, { ...HASHED, note }], instance), the register entry of the plan read back, and its version read through linkedVersion
// expect: the row of paid.pdf ends `| drawer A \| box 2 |`, the bar escaped; the file table still has its three columns in every row; chapter-1.md is read as stored and paid.pdf as not stored
test("registrationCommits — a bar in a note is written escaped, and the version is read as before", async () => {
  const note = "drawer A | box 2";
  const { text, entry } = written(await registrationCommits(NEW_ENTRY(), [CHAPTER, { ...HASHED, note }], INSTANCE));
  assert.equal(text.includes(`| \`paid.pdf\` | \`${hex(HASHED.bytes)}\` | drawer A \\| box 2 |\n`), true, "the bar is escaped");
  assert.equal(text.includes("| drawer A | box 2 |"), false, "the bar is not left bare");
  assert.deepEqual(storedOf(entry, "2026-10-12"), { "chapter-1.md": true, "paid.pdf": false });
});

// TST-576003 · level: unit · module: MOD-source-register
// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; UC-004 step 4a
// given: the same entry, and a note that names a file that is kept and holds a comma and a space: `next to chapter-1.md, shelf B`
// input: registrationCommits(entry, [CHAPTER, { ...HASHED, note }], instance), and the version read through linkedVersion
// expect: the cell Files names only paid.pdf after `not stored:`, not the note; chapter-1.md is read as stored and paid.pdf as not stored
test("registrationCommits — a note is no part of the cell Files, so a name or a comma in it changes no file's state", async () => {
  const note = "next to chapter-1.md, shelf B";
  const { text, entry } = written(await registrationCommits(NEW_ENTRY(), [CHAPTER, { ...HASHED, note }], INSTANCE));
  const versions = entry.sections.find((section) => section.heading === "## Versions");
  assert.equal(versions.rows[0].cells.Files.endsWith("; not stored: paid.pdf"), true);
  assert.equal(text.includes(`| \`paid.pdf\` | \`${hex(HASHED.bytes)}\` | next to chapter-1.md, shelf B |`), true, "the note is written whole");
  assert.deepEqual(storedOf(entry, "2026-10-12"), { "chapter-1.md": true, "paid.pdf": false });
});

// TST-576004 · level: unit · module: MOD-source-register
// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; UC-004 step 4a
// given: the same entry; a file only hashed with a note (the known positive); the same file with no note, with an empty note and with a note of blanks; two files only hashed, the first with a note and the second with none
// input: registrationCommits for each
// expect: the known positive gives a plan; each of the three refusals rejects with NoteMissing naming paid.pdf; the last rejects with NoteMissing naming the second file, second.pdf; a file kept needs no note, and its call gives a plan
test("registrationCommits — a file only hashed that has no note is refused by name: NoteMissing", async () => {
  assert.equal((await registrationCommits(NEW_ENTRY(), [CHAPTER, HASHED], INSTANCE)).length, 1, "known positive: with its note the call succeeds");
  const { note, ...bare } = HASHED;
  assert.equal(note, NOTE);
  await assert.rejects(registrationCommits(NEW_ENTRY(), [CHAPTER, bare], INSTANCE), isNoteMissing("paid.pdf"));
  await assert.rejects(registrationCommits(NEW_ENTRY(), [CHAPTER, { ...HASHED, note: "" }], INSTANCE), isNoteMissing("paid.pdf"));
  await assert.rejects(registrationCommits(NEW_ENTRY(), [CHAPTER, { ...HASHED, note: "   " }], INSTANCE), isNoteMissing("paid.pdf"));
  const second = { ...HASHED, name: "second.pdf", bytes: encode("second"), note: undefined };
  await assert.rejects(registrationCommits(NEW_ENTRY(), [HASHED, second], INSTANCE), isNoteMissing("second.pdf"));
  assert.equal((await registrationCommits(NEW_ENTRY(), [CHAPTER], INSTANCE)).length, 1, "a file kept needs no note");
});

// An entry with one earlier version, written with the two columns of the file table.
const OLD_FILE = { name: "chapter-1.md", bytes: encode("# Chapter 1\n\nThe old chapter.\n"), keep: true };
const OLD_BLOCK = ["### Files of 2026-09-01", "", "| File | SHA-256 |", "|---|---|", `| \`chapter-1.md\` | \`${hex(OLD_FILE.bytes)}\` |`].join("\n");
const OLD_ENTRY = () => readEntry([...FRONT, ...COLUMNS,
  `| \`2026-09-01\` | 2026-09-01 | first | the author's disk | 1 file, listed below; version hash \`${versionHashOf([OLD_FILE])}\` |`, "", ...OLD_BLOCK.split("\n"), ""]);
const REVISED = { name: "chapter-1.md", bytes: encode("# Chapter 1\n\nThe revised chapter.\n"), keep: true };
const NEW_VERSION = { version: "2026-10-12", date: "2026-10-12", repository: INSTANCE };

// TST-576005 · level: unit · module: MOD-source-register
// guards: A SOURCE VERSION IS NEVER OVERWRITTEN; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; UC-016
// given: an entry whose one earlier version, 2026-09-01, has its file table of two columns; a new version with chapter-1.md revised and kept, and paid.pdf only hashed with the note `cabinet 3, shelf B`
// input: versionCommits(entry, [REVISED, HASHED], { version: "2026-10-12", date: "2026-10-12", repository: "alice/requirements" }), the register entry of the plan read back
// expect: the file table of 2026-09-01 is there byte for byte, with its two columns; the new version's table has the columns `File`, `SHA-256` and `Kept at`, with `—` for chapter-1.md and the note for paid.pdf; the new row's cell Files is `2 files, listed below; version hash `<hash>`; not stored: paid.pdf`; the old version reads chapter-1.md as stored, the new one chapter-1.md as stored and paid.pdf as not
test("versionCommits — the new version's file table has the column Kept at, and the earlier version's two columns stand", async () => {
  assert.equal(typeof versionCommits, "function", "the module provides versionCommits");
  const files = [REVISED, HASHED];
  const { text, entry } = written(await versionCommits(OLD_ENTRY(), files, NEW_VERSION));
  assert.equal(text.includes(OLD_BLOCK), true, "the earlier version's table is byte for byte still present");
  const table = ["### Files of 2026-10-12", "", "| File | SHA-256 | Kept at |", "|---|---|---|",
    `| \`chapter-1.md\` | \`${hex(REVISED.bytes)}\` | — |`, `| \`paid.pdf\` | \`${hex(HASHED.bytes)}\` | cabinet 3, shelf B |`].join("\n");
  assert.equal(text.includes(table), true, "the new version's table");
  const versions = entry.sections.find((section) => section.heading === "## Versions");
  assert.equal(versions.rows.at(-1).cells.Files, `2 files, listed below; version hash \`${versionHashOf(files)}\`; not stored: paid.pdf`);
  assert.deepEqual(storedOf(entry, "2026-09-01"), { "chapter-1.md": true });
  assert.deepEqual(storedOf(entry, "2026-10-12"), { "chapter-1.md": true, "paid.pdf": false });
  assert.equal(writeDocument(sourceSchemas().entry, entry), text, "the appended entry remains canonical");
});

// TST-576006 · level: unit · module: MOD-source-register
// guards: A SOURCE VERSION IS NEVER OVERWRITTEN; UC-016
// given: the entry of TST-576005; a new version whose file only hashed has a note (the known positive), then none, then a note of blanks
// input: versionCommits for each
// expect: the known positive gives a plan; the others reject with NoteMissing naming paid.pdf, so that no plan is returned; a bar in a note is written `\|` as registrationCommits writes it
test("versionCommits — a file only hashed that has no note is refused by name: NoteMissing; a bar in a note is escaped", async () => {
  assert.equal((await versionCommits(OLD_ENTRY(), [REVISED, HASHED], NEW_VERSION)).length, 1, "known positive: with its note the call succeeds");
  const { note, ...bare } = HASHED;
  assert.equal(note, NOTE);
  await assert.rejects(versionCommits(OLD_ENTRY(), [REVISED, bare], NEW_VERSION), isNoteMissing("paid.pdf"));
  await assert.rejects(versionCommits(OLD_ENTRY(), [REVISED, { ...HASHED, note: "   " }], NEW_VERSION), isNoteMissing("paid.pdf"));
  const { text } = written(await versionCommits(OLD_ENTRY(), [REVISED, { ...HASHED, note: "drawer A | box 2" }], NEW_VERSION));
  assert.equal(text.includes(`| \`paid.pdf\` | \`${hex(HASHED.bytes)}\` | drawer A \\| box 2 |`), true);
});

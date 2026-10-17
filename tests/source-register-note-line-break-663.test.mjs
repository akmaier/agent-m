// A note with a line break keeps its row whole — MOD-source-register's registrationCommits and versionCommits write the note of a file that was only
// hashed into the cell `Kept at` of the version's file table (docs/architecture/MOD-source-register.md, Interfaces: a file not kept is recorded "with its
// `note`, where its copy is kept"; Data: each file is listed with its SHA-256 "or a note where a copy that was only hashed is kept"; and A SOURCE VERSION IS
// NEVER OVERWRITTEN, so a row is whole when it is first written). Where the texts leave a reading open, the test states the reading it takes:
//   - A line break is a line feed, a carriage return, or a carriage return followed by a line feed; each is written as one space, so a note of two
//     line feeds in a row is written with two spaces. A bar in the same note is still written `\|`.
//   - The row stays one line: every line of the file table is a row of three cells, the table has one line for its header, one for its separator and one
//     for each file, and `filesOf` (read through linkedVersion) reads the files as stored or not stored as before.
// Run: node --test tests/source-register-note-line-break-663.test.mjs
//
// Module: MOD-source-register
// Guards: UC-004; UC-016; A SOURCE VERSION IS NEVER OVERWRITTEN
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect); the expected texts are written out here, not read from a
// document. Where a test asserts a refusal, the same call is first shown to succeed. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readDocument, writeDocument } from "../src/documents/index.mjs";
import { linkedVersion, registrationCommits, sourceSchemas, versionCommits } from "../src/source-register/index.mjs";

const INSTANCE = "alice/requirements";

const encode = (text) => new TextEncoder().encode(text);
const hex = (bytes) => createHash("sha256").update(bytes).digest("hex");

const FRONT = ["---", "id: SRC-open-handbook", "title: A source", "kind: document", "authority: advisory", "licence: may be republished — CC BY 4.0", "---",
  "# SRC-open-handbook A source", "", "## Versions", ""];
const COLUMNS = ["| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|"];
const readEntry = (lines) => readDocument(sourceSchemas().entry, "docs/sources/SRC-open-handbook.md", lines.join("\n"));
const NEW_ENTRY = () => readEntry([...FRONT, ...COLUMNS, "| `2026-10-12` | 2026-10-12 | the first edition | the author's disk | — |", ""]);

const CHAPTER = { name: "chapter-1.md", bytes: encode("# Chapter 1\n\nThe first chapter.\n"), keep: true };
const HASHED = { name: "paid.pdf", bytes: encode("the publisher's bytes"), keep: false };
const withNote = (note) => ({ ...HASHED, note });

const written = (plan, path = "docs/sources/SRC-open-handbook.md") => {
  const file = plan.find((commit) => commit.repository === INSTANCE).files.find((each) => each.path === path);
  return { text: file.content, entry: readDocument(sourceSchemas().entry, path, file.content) };
};
const linksOf = (version) => readDocument(sourceSchemas().links, "docs/sources.md",
  ["# Requirement sources of the test", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-open-handbook | ${version} | ${"0".repeat(64)} | |`, ""].join("\n"));
const storedOf = (entry, version) => Object.fromEntries(linkedVersion(linksOf(version), [entry], "SRC-open-handbook").version.files.map((file) => [file.name, file.stored]));
// The lines of the file table of a version in the written text: from `### Files of <version>` to the next blank line after its header.
const tableOf = (text, version) => {
  const lines = text.split("\n");
  const at = lines.indexOf(`### Files of ${version}`);
  const rest = lines.slice(at + 2);
  const end = rest.findIndex((line) => line === "");
  return rest.slice(0, end < 0 ? rest.length : end);
};

// TST-663001 · level: unit · module: MOD-source-register
// given: the entry of a source that may be republished, with its first version `2026-10-12`; chapter-1.md kept, and paid.pdf only hashed with the note `cabinet 3,` + a line feed + `shelf B` (the known positive first: the same file with the note `cabinet 3, shelf B` on one line)
// input: registrationCommits(entry, [CHAPTER, paid.pdf with the note], "alice/requirements"), and the register entry of the plan read back
// expect: the file table under `### Files of 2026-10-12` is exactly four lines — the header `| File | SHA-256 | Kept at |`, the separator `|---|---|---|`, the row of chapter-1.md ending `| — |`, and the row of paid.pdf ending `| cabinet 3, shelf B |` (the line feed written as one space); chapter-1.md is read as stored and paid.pdf as not stored
test("registrationCommits — a line break in a note is written as one space, so the file table keeps one line per file", async () => {
  const oneLine = written(await registrationCommits(NEW_ENTRY(), [CHAPTER, withNote("cabinet 3, shelf B")], INSTANCE));
  assert.equal(tableOf(oneLine.text, "2026-10-12").length, 4, "known positive: a note on one line gives the table of four lines");
  const { text, entry } = written(await registrationCommits(NEW_ENTRY(), [CHAPTER, withNote("cabinet 3,\nshelf B")], INSTANCE));
  assert.deepEqual(tableOf(text, "2026-10-12"), ["| File | SHA-256 | Kept at |", "|---|---|---|",
    `| \`chapter-1.md\` | \`${hex(CHAPTER.bytes)}\` | — |`, `| \`paid.pdf\` | \`${hex(HASHED.bytes)}\` | cabinet 3, shelf B |`]);
  assert.deepEqual(storedOf(entry, "2026-10-12"), { "chapter-1.md": true, "paid.pdf": false });
});

// TST-663002 · level: unit · module: MOD-source-register
// given: the same entry, and the notes below, each with paid.pdf only hashed and chapter-1.md kept
// input: registrationCommits for each note
// expect: the Kept at cell of paid.pdf is, for `a` + CR LF + `b`: `a b`; for `a` + CR + `b`: `a b`; for `a` + LF + LF + `b`: `a  b` (two spaces); for `a` + LF + `b` + CR LF + `c`: `a b c`; for `x | y` + LF + `z`: `x \| y z` (the bar escaped as before); for `shelf B` + LF: `shelf B ` (one trailing space); for LF + `shelf B`: ` shelf B` (one leading space); the table has four lines each time
test("registrationCommits — each kind of line break is one space, and a bar in the same note is still escaped", async () => {
  const cases = [["a\r\nb", "a b"], ["a\rb", "a b"], ["a\n\nb", "a  b"], ["a\nb\r\nc", "a b c"], ["x | y\nz", "x \\| y z"],
    ["shelf B\n", "shelf B "], ["\nshelf B", " shelf B"]];
  for (const [note, cell] of cases) {
    const { text } = written(await registrationCommits(NEW_ENTRY(), [CHAPTER, withNote(note)], INSTANCE));
    const table = tableOf(text, "2026-10-12");
    assert.equal(table.length, 4, `the table of ${JSON.stringify(note)} has four lines`);
    assert.equal(table[3], `| \`paid.pdf\` | \`${hex(HASHED.bytes)}\` | ${cell} |`, `the row of ${JSON.stringify(note)}`);
  }
});

// An entry with one earlier version, written with the two columns of the file table.
const OLD_FILE = { name: "chapter-1.md", bytes: encode("# Chapter 1\n\nThe old chapter.\n"), keep: true };
const OLD_BLOCK = ["### Files of 2026-09-01", "", "| File | SHA-256 |", "|---|---|", `| \`chapter-1.md\` | \`${hex(OLD_FILE.bytes)}\` |`].join("\n");
const OLD_HASH = hex(`${hex(OLD_FILE.bytes)}  chapter-1.md\n`);
const OLD_ENTRY = () => readEntry([...FRONT, ...COLUMNS,
  `| \`2026-09-01\` | 2026-09-01 | first | the author's disk | 1 file, listed below; version hash \`${OLD_HASH}\` |`, "", ...OLD_BLOCK.split("\n"), ""]);
const REVISED = { name: "chapter-1.md", bytes: encode("# Chapter 1\n\nThe revised chapter.\n"), keep: true };
const NEW_VERSION = { version: "2026-10-12", date: "2026-10-12", repository: INSTANCE };

// TST-663003 · level: unit · module: MOD-source-register
// given: an entry whose one earlier version, 2026-09-01, has its file table of two columns; a new version with chapter-1.md revised and kept, and paid.pdf only hashed with the note `drawer A,` + CR LF + `box 2`
// input: versionCommits(entry, [REVISED, paid.pdf with the note], { version: "2026-10-12", date: "2026-10-12", repository: "alice/requirements" }), the register entry of the plan read back
// expect: the earlier version's table is there byte for byte; the new version's file table is exactly four lines, the row of paid.pdf ending `| drawer A, box 2 |`; the old version reads chapter-1.md as stored, the new one chapter-1.md as stored and paid.pdf as not stored; the written entry is canonical: writeDocument of it gives the same text
test("versionCommits — a line break in a note is written as one space, and the earlier version's table stands", async () => {
  const oneLine = written(await versionCommits(OLD_ENTRY(), [REVISED, withNote("drawer A, box 2")], NEW_VERSION));
  assert.equal(tableOf(oneLine.text, "2026-10-12").length, 4, "known positive: a note on one line gives the table of four lines");
  const { text, entry } = written(await versionCommits(OLD_ENTRY(), [REVISED, withNote("drawer A,\r\nbox 2")], NEW_VERSION));
  assert.equal(text.includes(OLD_BLOCK), true, "the earlier version's table is byte for byte still present");
  assert.deepEqual(tableOf(text, "2026-10-12"), ["| File | SHA-256 | Kept at |", "|---|---|---|",
    `| \`chapter-1.md\` | \`${hex(REVISED.bytes)}\` | — |`, `| \`paid.pdf\` | \`${hex(HASHED.bytes)}\` | drawer A, box 2 |`]);
  assert.deepEqual(storedOf(entry, "2026-09-01"), { "chapter-1.md": true });
  assert.deepEqual(storedOf(entry, "2026-10-12"), { "chapter-1.md": true, "paid.pdf": false });
  assert.equal(writeDocument(sourceSchemas().entry, entry), text, "the appended entry remains canonical");
});

// TST-663004 · level: unit · module: MOD-source-register
// given: the entry of TST-663003; two files only hashed, one.pdf with the note `one` + LF + `two` and two.pdf with the note `three` + CR + `four`
// input: versionCommits(entry, [one.pdf, two.pdf], the new version), the register entry of the plan read back
// expect: the file table is exactly four lines — header, separator and one row for each file —, the row of one.pdf ending `| one two |` and the row of two.pdf ending `| three four |`; both files are read as not stored
test("versionCommits — every file only hashed keeps its own row whole when each note holds a line break", async () => {
  const one = { name: "one.pdf", bytes: encode("one"), keep: false, note: "one\ntwo" };
  const two = { name: "two.pdf", bytes: encode("two"), keep: false, note: "three\rfour" };
  const { text, entry } = written(await versionCommits(OLD_ENTRY(), [one, two], NEW_VERSION));
  assert.deepEqual(tableOf(text, "2026-10-12"), ["| File | SHA-256 | Kept at |", "|---|---|---|",
    `| \`one.pdf\` | \`${hex(one.bytes)}\` | one two |`, `| \`two.pdf\` | \`${hex(two.bytes)}\` | three four |`]);
  assert.deepEqual(storedOf(entry, "2026-10-12"), { "one.pdf": false, "two.pdf": false });
});

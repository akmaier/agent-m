// A file only hashed is read as not stored (ITM-455) — MOD-source-register's reading of a version, as the accepted text of
// docs/architecture/MOD-source-register.md states it (Data: a version's files each with its SHA-256, "or a note where a copy that was only
// hashed is kept"; SourceVersion: each file "with its SHA-256 and whether it is stored"; readContent: "reads every stored file of the version"),
// for UC-004 and UC-005. The note is the one registrationCommits writes in the cell Files of the version's row (ITM-314): after `not stored:`
// the names of the files only hashed, in the order of the files, separated by a comma and a space. A version is read as a caller reads it, through
// linkedVersion with a product's links file. Run: node --test tests/source-register-hashed-only.test.mjs
//
// Module: MOD-source-register
// Guards: UC-004; UC-005; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect); where a test asserts that something is not done,
// the same call is first shown to do it on a known positive. A host of the tests' own gives the snapshot readContent reads, and records the paths
// asked for. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readDocument } from "../src/documents/index.mjs";
import * as sourceRegister from "../src/source-register/index.mjs";

const { sourceSchemas, linkedVersion, readContent, registrationCommits } = sourceRegister;

const encode = (text) => new TextEncoder().encode(text);
const hex = (bytes) => createHash("sha256").update(bytes).digest("hex");
const hashOfFiles = (files) => hex([...files].sort((a, b) => (a.name < b.name ? -1 : 1)).map((file) => `${file.sha256}  ${file.name}\n`).join(""));
const VIBE = new URL("../docs/sources/SRC-vibe-coding.md", import.meta.url);

const linksOf = (id, version, hash) => readDocument(sourceSchemas().links, "docs/sources.md",
  ["# Requirement sources of the test", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| ${id} | ${version} | ${hash} | |`, ""].join("\n"));
const entryOf = (text) => readDocument(sourceSchemas().entry, "docs/sources/SRC-x.md", text);
const versionOf = (entry, version, hash = "0".repeat(64)) => linkedVersion(linksOf(entry.id, version, hash), [entry], entry.id).version;
const storedOf = (version) => Object.fromEntries(version.files.map((file) => [file.name, file.stored]));

const CHAPTER = { name: "chapter-1.md", bytes: encode("# Chapter 1\n"), keep: true };
const APPENDIX = { name: "appendix.md", bytes: encode("# Appendix\n"), keep: true };
const HASHED = { name: "paid.pdf", bytes: encode("the publisher's bytes"), keep: false };

// The entry of a registration as registrationCommits plans it, read back from the text of its plan.
async function registered(files, licence = "may be republished — CC BY 4.0") {
  const text = ["---", "id: SRC-x", "title: A source", "kind: document", "authority: advisory", `licence: ${licence}`, "---", "# SRC-x A source", "",
    "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
    "| `2026-10-12` | 2026-10-12 | the first edition | the author's disk | — |", ""].join("\n");
  const plan = await registrationCommits(entryOf(text), files, "alice/requirements");
  return entryOf(plan[0].files.find((file) => file.path === "docs/sources/SRC-x.md").content);
}

// A snapshot of a repository that holds the given texts by path, recording each path asked for.
const hostOf = (held) => {
  const asked = [];
  const snapshot = { repository: { path: "alice/requirements" }, read: async (path) => { asked.push(path); return path in held ? held[path] : null; } };
  return { asked, open: async () => ({ repositoryInfo: async () => ({ defaultBranch: "main" }), readSnapshot: async () => snapshot }) };
};

// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; UC-004 step 6
// given: the entry of a registration with two files kept and one only hashed, as registrationCommits plans it, and a product's links file that
//        names its version with the version's hash over all three files
// input: linkedVersion(links, [entry], "SRC-x"), its version's files
// expect: three files by name, chapter-1.md and appendix.md stored, paid.pdf not; each with the SHA-256 of its bytes; and the hash the link records
//        is the hash of the lines `<SHA-256>  <name>` of all three files, the one hashed only included
test("linkedVersion — a registration's file only hashed is read with stored false, the two kept ones with true, all three in the version's hash", async () => {
  assert.equal(typeof registrationCommits, "function", "the module provides registrationCommits");
  const files = [CHAPTER, APPENDIX, HASHED];
  const entry = await registered(files);
  const all = files.map((file) => ({ name: file.name, sha256: hex(file.bytes) }));
  const version = versionOf(entry, "2026-10-12", hashOfFiles(all));
  assert.deepEqual(storedOf(version), { "chapter-1.md": true, "appendix.md": true, "paid.pdf": false });
  assert.deepEqual(version.files.map((file) => [file.name, file.sha256]).sort(), all.map((file) => [file.name, file.sha256]).sort());
  assert.equal(version.hash, hashOfFiles(version.files), "the hash is over all three files as read");
});

// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; UC-005
// given: that version, whose holder has the two kept files and none of the one only hashed; known positive first — a holder that has the third
//        too, and the version read with it stored
// input: readContent(version, open) with a host of the tests' own
// expect: the two files kept, by name, with their bytes; the path of the file only hashed is never asked for, and no error; with the third file
//         marked stored, the same read asks for it and is refused with ContentUnreadable
test("readContent — reads the files kept of a registration and never asks for the one only hashed", async () => {
  const entry = await registered([CHAPTER, APPENDIX, HASHED]);
  const version = versionOf(entry, "2026-10-12");
  const held = { "docs/sources/SRC-x/2026-10-12/chapter-1.md": "# Chapter 1\n", "docs/sources/SRC-x/2026-10-12/appendix.md": "# Appendix\n" };
  const host = hostOf(held);
  const read = await readContent(version, host.open);
  assert.deepEqual(read.map((file) => file.name).sort(), ["appendix.md", "chapter-1.md"]);
  assert.equal(new TextDecoder().decode(read.find((file) => file.name === "appendix.md").bytes), "# Appendix\n");
  assert.ok(host.asked.every((path) => !path.endsWith("paid.pdf")), "paid.pdf is not asked for");
  const wrongly = { ...version, files: version.files.map((file) => ({ ...file, stored: true })) };
  await assert.rejects(readContent(wrongly, hostOf(held).open), (error) => error.name === "ContentUnreadable");
});

// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: this instance's own entry SRC-vibe-coding, written before any file could be only hashed, and a registration of three files all kept
// input: linkedVersion for each
// expect: every file of the book's version 2026-10-05 stored true, as many as the entry lists; and every file of the registration true
test("linkedVersion — a version with no note reads every file as stored", async () => {
  const text = readFileSync(VIBE, "utf8");
  const entry = readDocument(sourceSchemas().entry, "docs/sources/SRC-vibe-coding.md", text);
  const listed = [...text.matchAll(/^\| `([^`]+)` \| `([0-9a-f]{64})` \|$/gm)].length;
  const book = versionOf(entry, "2026-10-05");
  assert.equal(book.files.length, listed);
  assert.ok(listed > 1 && book.files.every((file) => file.stored === true));
  const kept = versionOf(await registered([CHAPTER, APPENDIX, { ...HASHED, keep: true }]), "2026-10-12");
  assert.deepEqual(Object.values(storedOf(kept)), [true, true, true]);
});

// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: an entry of two versions. The first lists unpaid.pdf, paid.pdf and scan.pdf, its note naming `paid.pdf, scan.pdf`; the second lists paid.pdf
//        again with no note. A third entry whose note names a file that its table does not list
// input: linkedVersion for each of the two versions; and for the third
// expect: the first: paid.pdf and scan.pdf not stored, unpaid.pdf stored — a name is a whole name, not a part of one; the second: paid.pdf stored,
//         the note of the first version is not the second's; the third: every listed file stored
test("linkedVersion — a note names whole files of its own version, in a list of several", () => {
  const entry = entryOf(["---", "id: SRC-x", "title: A source", "kind: document", "authority: advisory", "licence: restricted — terms", "---",
    "# SRC-x A source", "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
    "| `v1` | 2026-10-01 | — | — | 3 files, listed below; version hash `" + "1".repeat(64) + "`; not stored: paid.pdf, scan.pdf |",
    "| `v2` | 2026-10-02 | — | — | 1 file, listed below; version hash `" + "2".repeat(64) + "` |", "",
    "### Files of `v1`", "", "| File | SHA-256 |", "|---|---|",
    "| `unpaid.pdf` | `" + "a".repeat(64) + "` |", "| `paid.pdf` | `" + "b".repeat(64) + "` |", "| `scan.pdf` | `" + "c".repeat(64) + "` |", "",
    "### Files of `v2`", "", "| File | SHA-256 |", "|---|---|", "| `paid.pdf` | `" + "d".repeat(64) + "` |", ""].join("\n"));
  assert.deepEqual(storedOf(versionOf(entry, "v1")), { "unpaid.pdf": true, "paid.pdf": false, "scan.pdf": false });
  assert.deepEqual(storedOf(versionOf(entry, "v2")), { "paid.pdf": true });
  const odd = entryOf(["---", "id: SRC-x", "title: A source", "kind: document", "authority: advisory", "licence: restricted — terms", "---",
    "# SRC-x A source", "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
    "| `v1` | 2026-10-01 | — | — | 1 file, listed below; not stored: ghost.pdf |", "",
    "### Files of `v1`", "", "| File | SHA-256 |", "|---|---|", "| `real.pdf` | `" + "a".repeat(64) + "` |", ""].join("\n"));
  assert.deepEqual(storedOf(versionOf(odd, "v1")), { "real.pdf": true });
});

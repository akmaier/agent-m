// The commit plan of a registration (ITM-314) — MOD-source-register's registrationCommits(entry, files, instance), as the accepted text of
// docs/architecture/MOD-source-register.md states it (Interfaces: "the register entry with its first version, and the files: to the instance when
// the licence permits republishing, to the named repository otherwise, and nowhere when the person only hashed them. Hashes every file. Throws
// `ContentRepositoryMissing` for restricted files without a named repository"; CommitPlan is `{ repository, files: { path, content }[] }[]`), for
// UC-004 steps 4, 6 and 4a. A new version of an existing entry (versionCommits) and the library page that commits the plan are not part of this item.
// Run: node --test tests/source-register-registration.test.mjs
//
// Module: MOD-source-register
// Guards: UC-004; THE INSTANCE KEEPS THE SOURCE REGISTER; A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY; RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// Level: unit
//
// The module file gives the entry's path (`docs/sources/SRC-<slug>.md`), a version's content folder (`docs/sources/SRC-<slug>/<version>/`), the
// columns of ## Versions as this instance's own entry writes them (Version, Date, Edition, Read from, Files), a version's files with their
// SHA-256 under `### Files of <version>`, and the version's hash: the SHA-256 of the lines `<SHA-256 of the file>  <file name>`, sorted by name.
// It does not say where the version's identifier and date come from when registering: these tests read them from the first row of the entry's
// ## Versions, which the caller fills in from the form before it asks for the plan — and the cell Files, which the function fills. The cell is
// read as the instance's entry writes it: the number of files, `listed below`, and `version hash` with the hash in backticks; a file only hashed
// is named after `not stored:`. `instance` is the repository that holds the instance, as the caller names it. The files of the plan hold the
// register entry as text and a version's files as the bytes given. Each test states its input and its expected result before it runs (given /
// input / expect); where a test asserts a refusal, the same call is first shown to succeed. A name the module does not provide yet is undefined
// here, so that each test fails by itself. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readDocument, writeDocument } from "../src/documents/index.mjs";
import * as sourceRegister from "../src/source-register/index.mjs";

const { sourceSchemas } = sourceRegister;
const INSTANCE = "alice/requirements";
const NAMED = "https://gitlab.example.org/alice/standards";

const encode = (text) => new TextEncoder().encode(text);
const hex = (bytes) => createHash("sha256").update(bytes).digest("hex");
// The version's hash of Data: the SHA-256 of the lines `<SHA-256>  <name>`, one per file sorted by name, each ended by a line feed.
const versionHashOf = (files) => hex(files.map((file) => ({ name: file.name, sha: hex(file.bytes) }))
  .sort((a, b) => (a.name < b.name ? -1 : 1)).map((file) => `${file.sha}  ${file.name}\n`).join(""));

// A register entry as the form hands it over: its front matter, and ## Versions with the first version's row, its Files cell not yet filled;
// ## Parts after it.
function entryOf(id, front) {
  const text = [
    "---", `id: ${id}`, "title: A source", ...front, "---", `# ${id} A source`, "",
    "A source for the tests.", "",
    "## Versions", "",
    "| Version | Date | Edition | Read from | Files |",
    "|---|---|---|---|---|",
    "| `2026-10-12` | 2026-10-12 | the first edition | the author's disk | — |",
    "",
    "## Parts", "",
    "| Part | Applies to |",
    "|---|---|",
    "| chapter 1 | the whole |",
    "",
  ].join("\n");
  return readDocument(sourceSchemas().entry, `docs/sources/${id}.md`, text);
}
const OPEN = () => entryOf("SRC-open-handbook", ["kind: document", "authority: advisory", "licence: may be republished — CC BY 4.0"]);
const RESTRICTED = () => entryOf("SRC-paid-standard", ["kind: document", "authority: normative", "licence: restricted — the publisher's terms of use",
  `content_repository: ${NAMED}`, "places:", "  - this machine"]);
const NO_REPOSITORY = () => entryOf("SRC-paid-standard", ["kind: document", "authority: normative", "licence: restricted — the publisher's terms of use",
  "places:", "  - this machine"]);
const UNKNOWN = () => entryOf("SRC-old-manual", ["kind: document", "authority: informational", "licence: unknown"]);

const CHAPTER = { name: "chapter-1.md", bytes: encode("# Chapter 1\n\nThe first chapter.\n"), keep: true };
const APPENDIX = { name: "appendix.md", bytes: encode("# Appendix\n\nÄ and ü.\n"), keep: true };
// Bytes that are no UTF-8 text: a PDF's header and a lone continuation byte.
const SCAN = { name: "scan.pdf", bytes: Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x80, 0xff, 0x00, 0x01]), keep: true };
const HASHED = { name: "paid.pdf", bytes: encode("the publisher's bytes"), keep: false };

const plan = (entry, files, instance = INSTANCE) => sourceRegister.registrationCommits(entry, files, instance);
const groupOf = (commits, repository) => commits.find((commit) => commit.repository === repository);
const pathsOf = (commit) => (commit ? commit.files.map((file) => file.path).sort() : []);
const textOf = (content) => (typeof content === "string" ? content : new TextDecoder().decode(content));
const readBack = (commits, id) => {
  const file = groupOf(commits, INSTANCE).files.find((each) => each.path === `docs/sources/${id}.md`);
  return { text: file.content, entry: readDocument(sourceSchemas().entry, file.path, file.content) };
};

// guards: THE INSTANCE KEEPS THE SOURCE REGISTER; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; UC-004 step 6
// given: the entry of a source whose licence may be republished, with its first version `2026-10-12`, and three files the person kept, one of
//        them a PDF of bytes that are no UTF-8 text
// input: registrationCommits(entry, [CHAPTER, APPENDIX, SCAN], "alice/requirements")
// expect: one repository, the instance, and in it four files: the register entry at docs/sources/SRC-open-handbook.md and the three files at
//         docs/sources/SRC-open-handbook/2026-10-12/<name>, the PDF holding exactly the bytes given
test("registrationCommits — a source that may be republished: the entry and the files all go to the instance", async () => {
  assert.equal(typeof sourceRegister.registrationCommits, "function", "the module provides registrationCommits");
  const commits = await plan(OPEN(), [CHAPTER, APPENDIX, SCAN]);
  assert.deepEqual(commits.map((commit) => commit.repository), [INSTANCE]);
  assert.deepEqual(pathsOf(commits[0]), [
    "docs/sources/SRC-open-handbook.md",
    "docs/sources/SRC-open-handbook/2026-10-12/appendix.md",
    "docs/sources/SRC-open-handbook/2026-10-12/chapter-1.md",
    "docs/sources/SRC-open-handbook/2026-10-12/scan.pdf",
  ]);
  const scan = commits[0].files.find((file) => file.path.endsWith("/scan.pdf"));
  assert.ok(scan.content instanceof Uint8Array, "a file's content is its bytes");
  assert.deepEqual(Array.from(scan.content), Array.from(SCAN.bytes));
  const chapter = commits[0].files.find((file) => file.path.endsWith("/chapter-1.md"));
  assert.deepEqual(Uint8Array.from(typeof chapter.content === "string" ? encode(chapter.content) : chapter.content), CHAPTER.bytes);
});

// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; THE INSTANCE KEEPS THE SOURCE REGISTER; UC-004 step 6
// given: the same entry and files, one of them a PDF of bytes that are no UTF-8 text
// input: registrationCommits(entry, [CHAPTER, APPENDIX, SCAN], instance), and the register entry of the plan read back through MOD-documents
// expect: the entry has its first version's row as the form gave it, its Files cell `3 files, listed below; version hash `<hash>``, the hash
//         that Data defines over the files' SHA-256 of their bytes; under `### Files of 2026-10-12` a row for each file with the SHA-256
//         of its bytes; the front matter, the text before ## Versions and ## Parts as they were
test("registrationCommits — the entry holds the first version with every file's SHA-256 and the version's hash", async () => {
  const files = [CHAPTER, APPENDIX, SCAN];
  const { entry, text } = await plan(OPEN(), files).then((commits) => ({ ...readBack(commits, "SRC-open-handbook") }));
  const versions = entry.sections.find((section) => section.heading === "## Versions");
  assert.equal(versions.rows.length, 1);
  assert.deepEqual(versions.rows[0].cells, {
    Version: "`2026-10-12`", Date: "2026-10-12", Edition: "the first edition", "Read from": "the author's disk",
    Files: `3 files, listed below; version hash \`${versionHashOf(files)}\``,
  });
  const listed = versions.text.slice(versions.text.indexOf("### Files of 2026-10-12"));
  assert.ok(/^### Files of (`2026-10-12`|2026-10-12)\n/.test(listed), "the files' heading is inside ## Versions");
  for (const file of files) assert.ok(listed.includes(`| \`${file.name}\` | \`${hex(file.bytes)}\` |`), `${file.name} with its SHA-256`);
  assert.deepEqual([entry.id, entry.fields.kind, entry.fields.licence], ["SRC-open-handbook", "document", "may be republished — CC BY 4.0"]);
  assert.deepEqual(entry.sections.map((section) => section.heading), ["## Versions", "## Parts"]);
  assert.ok(entry.sections[1].text.includes("| chapter 1 | the whole |"));
  assert.ok(text.includes("# SRC-open-handbook A source\n\nA source for the tests.\n\n## Versions\n"), "the title and the prose stand as they were");
  assert.equal(writeDocument(sourceSchemas().entry, entry), text, "the text is canonical: read and written again, it is the same");
});

// guards: RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; UC-004 steps 4 and 6
// given: the entry of a restricted source that names a content repository, and two files the person kept
// input: registrationCommits(entry, [CHAPTER, APPENDIX], instance)
// expect: two repositories, the instance first, then the named one; the instance gets only the register entry; the named repository gets the two
//         files at docs/sources/SRC-paid-standard/2026-10-12/<name> and nothing else; no file of the version is in the instance
test("registrationCommits — restricted content goes to the repository the person named, and none of it to the instance", async () => {
  const commits = await plan(RESTRICTED(), [CHAPTER, APPENDIX]);
  assert.deepEqual(commits.map((commit) => commit.repository), [INSTANCE, NAMED]);
  assert.deepEqual(pathsOf(commits[0]), ["docs/sources/SRC-paid-standard.md"]);
  assert.deepEqual(pathsOf(commits[1]), [
    "docs/sources/SRC-paid-standard/2026-10-12/appendix.md",
    "docs/sources/SRC-paid-standard/2026-10-12/chapter-1.md",
  ]);
  assert.equal(textOf(commits[1].files.find((file) => file.path.endsWith("/appendix.md")).content), "# Appendix\n\nÄ and ü.\n");
  assert.ok(!readBack(commits, "SRC-paid-standard").text.includes("# Chapter 1"), "the entry holds the hashes, not the text");
});

// guards: RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; UC-004 step 4a
// given: a restricted entry that names a content repository, one file kept and one only hashed; and an entry that may be republished with the
//        same two files
// input: registrationCommits for each
// expect: the file only hashed is in no repository's plan, for either entry, while its SHA-256 is in the entry's table; the kept file goes where its
//         licence sends it; the cell Files names the file after `not stored:`; the version's hash counts both files
test("registrationCommits — a file the person only hashed is planned nowhere, and its hash stands in the entry", async () => {
  const files = [CHAPTER, HASHED];
  for (const [entry, kept] of [[RESTRICTED(), NAMED], [OPEN(), INSTANCE]]) {
    const commits = await plan(entry, files);
    const everyPath = commits.flatMap((commit) => commit.files.map((file) => file.path));
    assert.ok(!everyPath.some((path) => path.endsWith("paid.pdf")), `${entry.id}: paid.pdf is planned nowhere`);
    assert.ok(everyPath.some((path) => path.endsWith("/chapter-1.md") && groupOf(commits, kept).files.some((file) => file.path === path)),
      `${entry.id}: chapter-1.md goes to ${kept}`);
    const { entry: written } = readBack(commits, entry.id);
    const versions = written.sections.find((section) => section.heading === "## Versions");
    assert.ok(versions.text.includes(`| \`paid.pdf\` | \`${hex(HASHED.bytes)}\` |`), "its SHA-256 stands in the table");
    assert.ok(versions.text.includes(`| \`chapter-1.md\` | \`${hex(CHAPTER.bytes)}\` |`));
    assert.equal(versions.rows[0].cells.Files, `2 files, listed below; version hash \`${versionHashOf(files)}\`; not stored: paid.pdf`);
  }
});

// guards: RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; UC-004 step 4
// given: a restricted entry that names no content repository; the same entry with a content repository; an entry whose licence is `unknown`
// input: registrationCommits(entry, [CHAPTER]) for the first and the last; registrationCommits(entry, [HASHED]) for the first
// expect: the first call, with a file to keep, rejects with ContentRepositoryMissing, and so does the call for the `unknown` licence, which counts
//         as restricted; the call with the one file only hashed succeeds, with the register entry alone in the instance, since nothing is to be stored
test("registrationCommits — restricted files without a named repository are refused: ContentRepositoryMissing", async () => {
  const known = await plan(RESTRICTED(), [CHAPTER]);
  assert.equal(known.length, 2, "known positive: with the repository named, the call succeeds");
  await assert.rejects(plan(NO_REPOSITORY(), [CHAPTER]), (error) => error.name === "ContentRepositoryMissing");
  await assert.rejects(plan(UNKNOWN(), [CHAPTER]), (error) => error.name === "ContentRepositoryMissing");
  const hashedOnly = await plan(NO_REPOSITORY(), [HASHED]);
  assert.deepEqual(hashedOnly.map((commit) => commit.repository), [INSTANCE]);
  assert.deepEqual(pathsOf(hashedOnly[0]), ["docs/sources/SRC-paid-standard.md"]);
});

// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; THE INSTANCE KEEPS THE SOURCE REGISTER
// given: an entry whose ## Versions holds no row yet, so that no version's identifier is known
// input: registrationCommits(entry, [CHAPTER])
// expect: a TypeError that names the missing first row, and no plan; the same entry with its row gives a plan
test("registrationCommits — an entry without its first version's row is refused, since the version is not known", async () => {
  const bare = readDocument(sourceSchemas().entry, "docs/sources/SRC-open-handbook.md", [
    "---", "id: SRC-open-handbook", "title: A source", "kind: document", "authority: advisory", "licence: may be republished — CC BY 4.0", "---",
    "# SRC-open-handbook A source", "", "## Versions", "",
  ].join("\n"));
  assert.equal((await plan(OPEN(), [CHAPTER])).length, 1, "known positive: with its row the call succeeds");
  await assert.rejects(plan(bare, [CHAPTER]), (error) => error instanceof TypeError && /first/.test(error.message));
});

// guards: A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; UC-004 step 6
// given: the entry of a source that may be republished, once with a single file kept and one only hashed, once with two only hashed
// input: registrationCommits(entry, [CHAPTER]) and registrationCommits(entry, [HASHED, { ...HASHED, name: "second.pdf" }]); the Files cell of each
// expect: `1 file, listed below; version hash `<hash>`` for the first; for the second `2 files, listed below; version hash `<hash>`; not stored:
//         paid.pdf, second.pdf` — the names in the order given, separated by a comma and a space
test("registrationCommits — the cell Files counts one file in the singular and names several files only hashed in order", async () => {
  const one = readBack(await plan(OPEN(), [CHAPTER]), "SRC-open-handbook").entry;
  assert.equal(one.sections[0].rows[0].cells.Files, `1 file, listed below; version hash \`${versionHashOf([CHAPTER])}\``);
  const second = { ...HASHED, name: "second.pdf" };
  const two = readBack(await plan(OPEN(), [HASHED, second]), "SRC-open-handbook").entry;
  assert.equal(two.sections[0].rows[0].cells.Files,
    `2 files, listed below; version hash \`${versionHashOf([HASHED, second])}\`; not stored: paid.pdf, second.pdf`);
});

// guards: RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; THE INSTANCE KEEPS THE SOURCE REGISTER
// given: a restricted entry whose content repository is the instance's own repository, as the person named it
// input: registrationCommits(entry, [CHAPTER], "https://gitlab.example.org/alice/standards")
// expect: one repository in the plan, not two, holding the register entry and the file
test("registrationCommits — a content repository that is the instance itself gives one repository in the plan", async () => {
  const commits = await plan(RESTRICTED(), [CHAPTER], NAMED);
  assert.deepEqual(commits.map((commit) => commit.repository), [NAMED]);
  assert.deepEqual(pathsOf(commits[0]), ["docs/sources/SRC-paid-standard.md", "docs/sources/SRC-paid-standard/2026-10-12/chapter-1.md"]);
});

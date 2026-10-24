// The version a product links, and its text for a job — MOD-source-register's linkedVersion and the recipe source-excerpt
// of sourceStrategies, as docs/architecture/MOD-source-register.md states them.
// Run: node --test tests/source-register-excerpt.test.mjs
//
// Module: MOD-source-register
// Guards: A PRODUCT LINKS THE SOURCES THAT APPLY; A LINK NAMES THE PART THAT APPLIES; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// Guards: RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// Level: component
//
// Every expected value is read from the module file: a requirement's source item names the register entry whose
// identifier, title or — for a standard — designation it begins with, the longest such match, followed by the item's end or
// by `, ` and the part; a product's links file `docs/sources.md` has a row per linked source — Source, Version, Hash,
// Part —; a version's content lies in `docs/sources/SRC-<slug>/<version>/` of the instance when its licence permits
// republishing, of the repository its entry names otherwise. The fixtures are an instance with two register entries — the
// book, which may be republished, and a standard, restricted, kept in a content repository — and a product that links both;
// each is a snapshot of fixture texts. Each test states its input and its expected result before it runs; where a test
// asserts a refusal, the same call is first shown to succeed. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readDocument } from "../src/documents/index.mjs";
import { linkedVersion, sourceSchemas, sourceStrategies } from "../src/source-register/index.mjs";

const hex = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const versionHash = (files) => hex([...files].sort(([a], [b]) => (a < b ? -1 : 1))
  .map(([name, text]) => `${hex(text)}  ${name}\n`).join(""));

// ---------------------------------------------------------------- the fixtures

const BOOK_FILES = [["08_requirements-engineering.md", "Chapter 8 of the book.\n"]];
const IEC_FILES = [["iec-62304.txt", "5.5.5 Software unit verification.\n"]];
const entry = ({ id, title, kind, licence, extra = [], version, files }) => [
  "---", `id: ${id}`, `title: ${title}`, `kind: ${kind}`, "authority: normative", `licence: ${licence}`, ...extra, "---",
  `# ${id} ${title}`, "", "A fixture source.", "", "## Versions", "",
  "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`${version}\` | 2026-10-01 | fixture | fixture only | listed below |`, "",
  `### Files of ${version}`, "", "| File | SHA-256 |", "|---|---|",
  ...files.map(([name, text]) => `| \`${name}\` | \`${hex(text)}\` |`), "",
].join("\n");
const BOOK = entry({ id: "SRC-vibe-coding", title: "Vibe Coding", kind: "document", licence: "may be republished — CC BY 4.0",
  version: "2026-10-05", files: BOOK_FILES });
const IEC = entry({ id: "SRC-iec-62304", title: "Medical device software", kind: "standard",
  licence: "restricted — IEC licence", extra: ["designation: IEC 62304:2006+AMD1:2015",
    "content_repository: https://github.com/alice/sources", "places:", "  - this machine"], version: "2015", files: IEC_FILES });
const LINKS = (rows) => ["# The sources this product meets", "", "| Source | Version | Hash | Part |", "|---|---|---|---|",
  ...rows, ""].join("\n");
const BOTH = LINKS([`| SRC-vibe-coding | 2026-10-05 | ${versionHash(BOOK_FILES)} | |`,
  `| SRC-iec-62304 | 2015 | ${versionHash(IEC_FILES)} | class B |`]);

const snapshotOf = (texts, path = "alice/repository") => ({
  repository: { server: "github", origin: "https://github.com", path, web: `https://github.com/${path}` },
  ref: "main", commit: null, paths: Object.keys(texts),
  read: async (file) => (file in texts ? texts[file] : null), blob: () => null,
});
const INSTANCE = {
  "docs/sources/SRC-vibe-coding.md": BOOK, "docs/sources/SRC-iec-62304.md": IEC,
  ...Object.fromEntries(BOOK_FILES.map(([name, text]) => [`docs/sources/SRC-vibe-coding/2026-10-05/${name}`, text])),
};
const CONTENT = Object.fromEntries(IEC_FILES.map(([name, text]) => [`docs/sources/SRC-iec-62304/2015/${name}`, text]));

const { entry: ENTRY, links: LINKS_SCHEMA } = sourceSchemas();
const register = Object.entries(INSTANCE).filter(([path]) => /^docs\/sources\/SRC-[^/]+\.md$/.test(path))
  .map(([path, text]) => readDocument(ENTRY, path, text));
const linksOf = (text) => readDocument(LINKS_SCHEMA, "docs/sources.md", text);

// A job's context: the product with its links, the instance with its register, and the content repository it can open.
function contextOf({ links = BOTH, content = CONTENT, opened = [] } = {}) {
  return {
    params: {}, places: { sources: {}, mailbox: null },
    product: { address: "https://github.com/alice/product", snapshot: snapshotOf({ "docs/sources.md": links }), host: null },
    instance: { snapshot: snapshotOf(INSTANCE, "alice/agent-m"), host: null },
    connect: async (address) => {
      opened.push(address);
      return { repositoryInfo: async () => ({ defaultBranch: "main" }), readSnapshot: async () => snapshotOf(content, "alice/sources") };
    },
  };
}
const excerpt = (context, params) => sourceStrategies.recipes["source-excerpt"](context, params);

// ---------------------------------------------------------------- linkedVersion

// TST-472895 · level: component · module: MOD-source-register
// guards: A PRODUCT LINKS THE SOURCES THAT APPLY; A LINK NAMES THE PART THAT APPLIES
// given: the product's links to both sources; the instance's two register entries
// input: linkedVersion with each of: SRC-iec-62304; an item of a requirement's source by the standard's designation, "IEC 62304:2006+AMD1:2015, 5.5.5"; one by the book's title, "Vibe Coding, ch. 9"; "IEC 62304:2006+AMD1:20150" — no entry's name followed by its end or `, ` —; "SRC-unknown"
// expect: the standard's linked version 2015, with its files and their hashes and the part class B; the same for the designation; the book's version 2026-10-05 and no part; null for the last two
test("linkedVersion — the version a product links of the source an identifier or a requirement's source item names", () => {
  const links = linksOf(BOTH);
  const iec = linkedVersion(links, register, "SRC-iec-62304");
  assert.equal(iec.source.id, "SRC-iec-62304");
  assert.deepEqual([iec.version.source, iec.version.version, iec.version.files, iec.part],
    ["SRC-iec-62304", "2015", [{ name: "iec-62304.txt", sha256: hex(IEC_FILES[0][1]), stored: true }], "class B"]);
  assert.deepEqual(linkedVersion(links, register, "IEC 62304:2006+AMD1:2015, 5.5.5").version.version, "2015");
  const book = linkedVersion(links, register, "Vibe Coding, ch. 9");
  assert.deepEqual([book.source.id, book.version.version, book.part], ["SRC-vibe-coding", "2026-10-05", null]);
  assert.equal(linkedVersion(links, register, "IEC 62304:2006+AMD1:20150"), null);
  assert.equal(linkedVersion(links, register, "SRC-unknown"), null);
});

// TST-472896 · level: component · module: MOD-source-register
// guards: A PRODUCT LINKS THE SOURCES THAT APPLY
// given: known positive first — the product's links to both; then links to the book alone
// input: linkedVersion(links, register, "SRC-iec-62304") for each
// expect: the standard's version for the first; null for the second — the product links none of it
test("linkedVersion — null for a source the product does not link", () => {
  assert.notEqual(linkedVersion(linksOf(BOTH), register, "SRC-iec-62304"), null);
  const bookOnly = LINKS([`| SRC-vibe-coding | 2026-10-05 | ${versionHash(BOOK_FILES)} | |`]);
  assert.equal(linkedVersion(linksOf(bookOnly), register, "SRC-iec-62304"), null);
});

// ---------------------------------------------------------------- source-excerpt

// TST-472897 · level: component · module: MOD-source-register
// guards: RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: the product linking both; the book's content in the instance, the standard's in its content repository
// input: source-excerpt with { source: "SRC-vibe-coding" }, then with { source: "SRC-iec-62304" }
// expect: the book's text as one part naming SRC-vibe-coding as its source, read from the instance, no repository opened; the standard's text as one part naming SRC-iec-62304 and, in its name, its version and the part class B, read from its content repository, the one repository opened
test("source-excerpt — the linked version's text as one part naming its source, read where its content lies", async () => {
  const opened = [];
  const context = contextOf({ opened });
  const [book] = await excerpt(context, { source: "SRC-vibe-coding" });
  assert.deepEqual([book.text, book.sources, book.required, opened], [BOOK_FILES[0][1], ["SRC-vibe-coding"], true, []]);
  const [iec] = await excerpt(context, { source: "SRC-iec-62304" });
  assert.deepEqual([iec.text, iec.sources, opened], [IEC_FILES[0][1], ["SRC-iec-62304"], ["https://github.com/alice/sources"]]);
  for (const word of ["SRC-iec-62304", "2015", "class B"]) assert.ok(iec.name.includes(word), word);
});

// TST-472898 · level: component · module: MOD-source-register
// guards: A PRODUCT LINKS THE SOURCES THAT APPLY; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: known positive first — the product linking both; then links to the book alone; then the standard's content repository holding its file changed by one character
// input: source-excerpt with { source: "SRC-iec-62304" } for each
// expect: the part for the first; NotLinked naming the source for the second; HashMismatch naming the file for the third
test("source-excerpt — a source the product does not link is NotLinked; a changed file is a HashMismatch", async () => {
  assert.equal((await excerpt(contextOf(), { source: "SRC-iec-62304" })).length, 1);
  const bookOnly = LINKS([`| SRC-vibe-coding | 2026-10-05 | ${versionHash(BOOK_FILES)} | |`]);
  await assert.rejects(excerpt(contextOf({ links: bookOnly }), { source: "SRC-iec-62304" }),
    (error) => error.name === "NotLinked" && error.source === "SRC-iec-62304");
  const changed = { [`docs/sources/SRC-iec-62304/2015/${IEC_FILES[0][0]}`]: `${IEC_FILES[0][1]}x` };
  await assert.rejects(excerpt(contextOf({ content: changed }), { source: "SRC-iec-62304" }),
    (error) => error.name === "HashMismatch" && error.file === IEC_FILES[0][0]);
});

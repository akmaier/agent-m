// A smaller part of a source is a set of its files (ITM-384) — the recipe `source-excerpt` of MOD-source-register's `sourceStrategies`, as the accepted text of
// docs/architecture/MOD-source-register.md states it (Interfaces: "returns the texts of the files its parameter `part` names — every file of the version when it
// names none —, in the version's order, a blank line between them, as one part that names the source ...; the part's name names the version, the files sent and the
// part the product's link names. A smaller part is fewer files, and a version of one file has none (UC-005 2a) ... and `NotInVersion { files }` for a part that names a
// file the version does not hold"; Data: "A part of a version, which a job's parameter `part` names, is a set of the version's files by their names ... A version of a single
// file has no smaller part"). For UC-005 2a. The page that offers the files (ITM-361) is not part of it.
// Run: node --test tests/source-register-part.test.mjs
//
// Module: MOD-source-register
// Guards: UC-005; A LINK NAMES THE PART THAT APPLIES; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// Level: unit
//
// The module file gives the parameter's meaning, not its form. These tests take `part` as the file names, a list of texts or one text for one file, as the page that offers
// the files would pass them in a job's parameters; the product's link has its own `Part`, free text, which names no file and selects none (the existing cases).
// A part names fewer files than the version holds; the files sent are named in the part's name only for such a smaller part — the name of the whole version names its
// version and the link's part, as before. A version of one file is sent whole when `part` names it or nothing, and refuses a name it lacks like any version. NotInVersion names every file of the part the version does not hold,
// in the order the part gives them, and is thrown before any content is read. A file the part does not name is not read, so that a changed file outside the part
// is not a HashMismatch of this part and restricted content outside it is not fetched. The fixtures are an instance with a register entry of three files and one of a single file,
// both republishable, and a restricted one of three files in a content repository; the product links all three. Each test states its input and its expected result
// before it runs (given / input / expect); where a test asserts a refusal or an absence, the same call is first shown to succeed. Nothing reaches the network. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { sourceStrategies } from "../src/source-register/index.mjs";

const hex = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const versionHash = (files) => hex([...files].sort(([a], [b]) => (a < b ? -1 : 1)).map(([name, text]) => `${hex(text)}  ${name}\n`).join(""));

// ---------------------------------------------------------------- the fixtures

const THREE = [["01_first.md", "First file.\n"], ["02_second.md", "Second file.\n"], ["03_third.md", "Third file.\n"]];
const ONE = [["only.md", "The only file.\n"]];
const SECRET = [["a.txt", "Secret A.\n"], ["b.txt", "Secret B.\n"], ["c.txt", "Secret C.\n"]];
const entry = ({ id, licence, extra = [], version, files }) => [
  "---", `id: ${id}`, "title: A fixture", "kind: document", "authority: normative", `licence: ${licence}`, ...extra, "---",
  `# ${id} A fixture`, "", "A fixture source.", "", "## Versions", "",
  "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`${version}\` | 2026-10-01 | fixture | fixture only | listed below |`, "",
  `### Files of ${version}`, "", "| File | SHA-256 |", "|---|---|",
  ...files.map(([name, text]) => `| \`${name}\` | \`${hex(text)}\` |`), "",
].join("\n");
const LINKS = ["# The sources", "", "| Source | Version | Hash | Part |", "|---|---|---|---|",
  `| SRC-handbook | v1 | ${versionHash(THREE)} | chapter group |`, `| SRC-note | v1 | ${versionHash(ONE)} | |`,
  `| SRC-secret | v1 | ${versionHash(SECRET)} | |`, ""].join("\n");
const INSTANCE = {
  "docs/sources/SRC-handbook.md": entry({ id: "SRC-handbook", licence: "may be republished — CC BY 4.0", version: "v1", files: THREE }),
  "docs/sources/SRC-note.md": entry({ id: "SRC-note", licence: "may be republished — CC BY 4.0", version: "v1", files: ONE }),
  "docs/sources/SRC-secret.md": entry({ id: "SRC-secret", licence: "restricted — terms", version: "v1", files: SECRET,
    extra: ["content_repository: https://github.com/alice/sources", "places:", "  - this machine"] }),
  ...Object.fromEntries(THREE.map(([name, text]) => [`docs/sources/SRC-handbook/v1/${name}`, text])),
  ...Object.fromEntries(ONE.map(([name, text]) => [`docs/sources/SRC-note/v1/${name}`, text])),
};
const CONTENT = Object.fromEntries(SECRET.map(([name, text]) => [`docs/sources/SRC-secret/v1/${name}`, text]));

const snapshotOf = (texts, path, reads) => ({
  repository: { server: "github", origin: "https://github.com", path, web: `https://github.com/${path}` },
  ref: "main", commit: null, paths: Object.keys(texts),
  read: async (file) => { reads.push(`${path}:${file}`); return file in texts ? texts[file] : null; }, blob: () => null,
});
// A job's context; `reads` keeps every file read of the instance and of the content repository, by repository and path.
function contextOf({ instance = INSTANCE, content = CONTENT } = {}) {
  const reads = [];
  return { reads, params: {}, places: { sources: {}, mailbox: null },
    product: { address: "https://github.com/alice/product", snapshot: snapshotOf({ "docs/sources.md": LINKS }, "alice/product", []), host: null },
    instance: { snapshot: snapshotOf(instance, "alice/agent-m", reads), host: null },
    connect: async () => ({ repositoryInfo: async () => ({ defaultBranch: "main" }), readSnapshot: async () => snapshotOf(content, "alice/sources", reads) }) };
}
const excerpt = (context, params) => sourceStrategies.recipes["source-excerpt"](context, params);
const contentReads = (context) => context.reads.filter((each) => /\/(?:01|02|03)_|a\.txt|b\.txt|c\.txt|only\.md/.test(each));

// TST-472914 · level: unit · module: MOD-source-register
// guards: A LINK NAMES THE PART THAT APPLIES; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
// given: a version of three files; the product's link to it names the part `chapter group`
// input: source-excerpt with { source: "SRC-handbook" } and no `part`
// expect: one part naming SRC-handbook, whose text is the three files in the version's order with a blank line between them; its name names the version and the link's part, and no file
test("source-excerpt — without a part, every file of the version, in its order, a blank line between them", async () => {
  const [part, ...rest] = await excerpt(contextOf(), { source: "SRC-handbook" });
  assert.equal(rest.length, 0);
  assert.equal(part.text, THREE.map(([, text]) => text).join("\n\n"));
  assert.deepEqual([part.sources, part.required], [["SRC-handbook"], true]);
  assert.ok(part.name.includes("v1") && part.name.includes("chapter group"));
  assert.ok(!THREE.some(([name]) => part.name.includes(name)), "a whole version names no file");
});

// TST-472915 · level: unit · module: MOD-source-register
// guards: A LINK NAMES THE PART THAT APPLIES; UC-005 2a
// given: the same version; a part naming two of its files, given in another order than the version's
// input: source-excerpt with { source: "SRC-handbook", part: ["03_third.md", "01_first.md"] }
// expect: one part whose text is those two files in the version's order — first, then third —, a blank line between them, and not the second; its name names the version, the two files and the link's part
test("source-excerpt — a part of two named files sends those two, in the version's order", async () => {
  const [part] = await excerpt(contextOf(), { source: "SRC-handbook", part: ["03_third.md", "01_first.md"] });
  assert.equal(part.text, `${THREE[0][1]}\n\n${THREE[2][1]}`);
  assert.deepEqual(part.sources, ["SRC-handbook"]);
  for (const word of ["v1", "01_first.md", "03_third.md", "chapter group"]) assert.ok(part.name.includes(word), word);
  assert.ok(!part.name.includes("02_second.md"));
  const [single] = await excerpt(contextOf(), { source: "SRC-handbook", part: "02_second.md" });
  assert.equal(single.text, THREE[1][1], "one file, given as a text");
});

// TST-472916 · level: unit · module: MOD-source-register
// guards: NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
// given: the same version; a part naming one of its files and two it does not hold; known positive first — a part naming files it holds
// input: source-excerpt with each
// expect: the known positive gives its part; the other is refused as NotInVersion naming exactly the two files the version lacks, in the order the part gives them; no file of the version was read, since the refusal comes before any content is read; a file named twice that the version lacks is named once
test("source-excerpt — a part that names a file the version does not hold is refused as NotInVersion, before anything is read", async () => {
  assert.equal((await excerpt(contextOf(), { source: "SRC-handbook", part: ["01_first.md"] })).length, 1, "known positive");
  const context = contextOf();
  await assert.rejects(excerpt(context, { source: "SRC-handbook", part: ["09_ninth.md", "01_first.md", "08_eighth.md"] }),
    (error) => error.name === "NotInVersion" && JSON.stringify(error.files) === JSON.stringify(["09_ninth.md", "08_eighth.md"]));
  assert.deepEqual(contentReads(context), [], "no content read");
  await assert.rejects(excerpt(contextOf(), { source: "SRC-handbook", part: ["09_ninth.md", "09_ninth.md"] }),
    (error) => error.name === "NotInVersion" && JSON.stringify(error.files) === JSON.stringify(["09_ninth.md"]), "a file is named once");
});

// TST-472917 · level: unit · module: MOD-source-register
// guards: UC-005 2a; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
// given: a version of one file
// input: source-excerpt with no part; with a part naming its file; with a part naming a file it does not hold
// expect: the file, whole, for the first two — a version of one file has no smaller part, and naming its one file sends it whole —; for the third NotInVersion naming the file it lacks, as for any version, and nothing read
test("source-excerpt — a version of one file is sent whole, and a part naming a file it lacks is refused", async () => {
  for (const part of [undefined, ["only.md"]]) {
    const [sent] = await excerpt(contextOf(), { source: "SRC-note", ...(part ? { part } : {}) });
    assert.equal(sent.text, ONE[0][1], JSON.stringify(part));
    assert.ok(!sent.name.includes("only.md"), "a whole version names no file");
  }
  const context = contextOf();
  await assert.rejects(excerpt(context, { source: "SRC-note", part: ["other.md"] }),
    (error) => error.name === "NotInVersion" && JSON.stringify(error.files) === JSON.stringify(["other.md"]));
  assert.deepEqual(contentReads(context), [], "no content read");
});

// TST-472918 · level: unit · module: MOD-source-register
// guards: RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
// given: a restricted version of three files in a content repository; a part naming two; the third file there changed by one character
// input: source-excerpt with { source: "SRC-secret", part: ["a.txt", "c.txt"] }; known positive first — the whole version of the unchanged content
// expect: the two files' text, read from the content repository; the file outside the part never asked for — so its change is no HashMismatch of this part —; and the part's source is SRC-secret, so that the runner gives it only to the places the source permits
test("source-excerpt — a restricted source's part reads only its named files from the content repository", async () => {
  assert.equal((await excerpt(contextOf(), { source: "SRC-secret" }))[0].text, SECRET.map(([, text]) => text).join("\n\n"), "known positive");
  const changed = { ...CONTENT, "docs/sources/SRC-secret/v1/b.txt": "Secret B, changed.\n" };
  const context = contextOf({ content: changed });
  const [part] = await excerpt(context, { source: "SRC-secret", part: ["a.txt", "c.txt"] });
  assert.equal(part.text, `${SECRET[0][1]}\n\n${SECRET[2][1]}`);
  assert.deepEqual(part.sources, ["SRC-secret"]);
  assert.ok(!context.reads.some((each) => each.endsWith("b.txt")), "b.txt is not read");
});

// TST-472919 · level: unit · module: MOD-source-register
// guards: NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY; UC-005 2a
// given: the three-file version; a part that names no file — an empty list
// input: source-excerpt with { source: "SRC-handbook", part: [] }
// expect: the whole version, as without a part
test("source-excerpt — a part that names no file is the whole version", async () => {
  const [part] = await excerpt(contextOf(), { source: "SRC-handbook", part: [] });
  assert.equal(part.text, THREE.map(([, text]) => text).join("\n\n"));
});

// TST-472920 · level: unit · module: MOD-source-register
// guards: RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
// given: the three-file version whose second file the person only hashed (the entry's note `not stored: 02_second.md`, ITM-455), so that the instance holds the other two
// input: source-excerpt with a part naming the first file; with a part naming the second
// expect: the first gives its file; the second is refused as NotInVersion naming it — the version does not hold a file that was only hashed
test("source-excerpt — a file that was only hashed is not a file of the version a part can name", async () => {
  const text = INSTANCE["docs/sources/SRC-handbook.md"].replace("| fixture only | listed below |", "| fixture only | 3 files, listed below; not stored: 02_second.md |");
  assert.notEqual(text, INSTANCE["docs/sources/SRC-handbook.md"], "the note is in the entry");
  const instance = { ...INSTANCE, "docs/sources/SRC-handbook.md": text };
  assert.equal((await excerpt(contextOf({ instance }), { source: "SRC-handbook", part: ["01_first.md"] }))[0].text, THREE[0][1]);
  await assert.rejects(excerpt(contextOf({ instance }), { source: "SRC-handbook", part: ["02_second.md"] }),
    (error) => error.name === "NotInVersion" && JSON.stringify(error.files) === JSON.stringify(["02_second.md"]));
});

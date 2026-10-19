// MOD-prompt-bar gives the job of a message the places of the restricted sources (ITM-1123), as docs/architecture/MOD-job-runner.md states `JobContext.places` (:204-214): "`places` gives, for
// every restricted source and for the mailbox, the places they allow, and the paths of the product that hold a restricted source's content", and the tool `read-file` (:102) refuses "a path the context's
// `places.contents` names for a restricted source ... unless" the drafter's place is one it allows. MOD-source-register.md:90-98, 193 gives the entry (`licence`, `places`), where its content lies
// (`docs/sources/SRC-<slug>/<version>/`) and `permittedPlaces` (any for content that may be republished, its declared places otherwise, none when it declares none).
// Run: node --test tests/prompt-bar-places.test.mjs
//
// Module: MOD-prompt-bar
// Guards: UC-049; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// Level: unit
//
// Readings the texts leave open, which the tests state (the pull request names them): the restricted sources are those of the instance's register (docs/sources/SRC-*.md of the instance), whether or not
// the product links them, since the job's tools read any path of the product; the paths that hold a restricted source's content are the folder docs/sources/<its id>/ of the product. The sources of
// the register are fixtures in memory; the real MOD-job-runner (prepareJob and its tool read-file) and MOD-runtimes' tabContext run. Each test states its expected result in its own text.

import test from "node:test";
import assert from "node:assert/strict";
import { restrictedPlaces } from "../src/prompt-bar/places.mjs";
import { prepareMessage } from "../src/prompt-bar/send.mjs";
import { tools } from "../src/job-runner/tools.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { freshStore } from "./settings-pages-setup.d/dom.mjs";

// The strategy of another module that the kind `converse` names.
registerStrategies("tests/prompt-bar-places.test.mjs", { recipes: { "chapters-for-page": async () => [] } });

const entry = (id, licence, places = []) => ["---", `id: ${id}`, `title: ${id} title`, "kind: document", "authority: informational", `licence: ${licence}`, ...(places.length ? ["places:", ...places.map((each) => `  - ${each}`)] : []),
  "---", `# ${id} ${id} title`, "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", "| `1` | 2026-10-13 | fixture | here | one file, hashed only |", ""].join("\n");
const REGISTER = {
  "docs/sources/SRC-open.md": entry("SRC-open", "may be republished - EU law"),
  "docs/sources/SRC-restricted.md": entry("SRC-restricted", "restricted - internal", ["this machine"]),
  "docs/sources/SRC-unknown.md": entry("SRC-unknown", "unknown"),
};
const snapshotOf = (files) => ({ repository: { server: "github", path: "acme/instance", web: "https://github.com/acme/instance" }, ref: "main", commit: "c".repeat(40), paths: Object.keys(files),
  blob: () => null, read: async (path) => files[path] ?? null });

// TST-1123001 · level: unit · module: MOD-prompt-bar
// guards: UC-049 4e; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: the instance's register holds SRC-open (may be republished), SRC-restricted (restricted, its content may go to "this machine" only) and SRC-unknown (licence unknown, no places), and a file docs/sources/notes.txt that is no entry
// input: restrictedPlaces over the instance's snapshot
// expect: the sources are SRC-restricted -> ["this machine"] and SRC-unknown -> [] (unknown counts as restricted and declares no place); SRC-open is not among them; the contents are the folders docs/sources/SRC-restricted and docs/sources/SRC-unknown, one entry per source
test("restrictedPlaces — the restricted sources of the register with the places they allow, and the folders that hold their content", async () => {
  const found = await restrictedPlaces(snapshotOf({ ...REGISTER, "docs/sources/notes.txt": "x", "docs/sources/SRC-restricted/handbook.md": "text" }));
  assert.deepEqual(found.sources, { "SRC-restricted": ["this machine"], "SRC-unknown": [] });
  assert.deepEqual(found.contents, [{ source: "SRC-restricted", paths: ["docs/sources/SRC-restricted"] }, { source: "SRC-unknown", paths: ["docs/sources/SRC-unknown"] }]);
});

// TST-1123002 · level: unit · module: MOD-prompt-bar
// guards: UC-049 4e; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: an instance without a register of sources
// input: restrictedPlaces
// expect: no source and no content
test("restrictedPlaces — an instance without sources gives none", async () => {
  assert.deepEqual(await restrictedPlaces(snapshotOf({ "README.md": "x" })), { sources: {}, contents: [] });
});

// The context a message is prepared with, for a drafter at `place`.
async function prepared(place) {
  const participant = { name: "tooler", type: "model endpoint", model: "m", context: 100000, capabilities: ["draft text", "read the repository"], place, route: "endpoint e1" };
  const files = { ...REGISTER, "docs/participants.md": "# Participants\n", "docs/sources/SRC-restricted/handbook.md": "RESTRICTED-HANDBOOK-TEXT", "docs/sources/SRC-open/law.md": "OPEN-LAW-TEXT" };
  const snapshot = snapshotOf(files);
  const host = { repositoryInfo: async () => ({ defaultBranch: "main" }), readSnapshot: async () => snapshot };
  const subject = { kind: "converse", entry: "settings", refuses: [], paramsFor: () => ({ page: "a page" }) };
  const ready = await prepareMessage({ subject, participant, instruction: "Summarise.", conversation: "", store: freshStore("acme/instance"), instance: { host }, product: null });
  return { ready, context: { ...ready.context, exchange: { drafter: participant } } };
}

// TST-1123003 · level: unit · module: MOD-prompt-bar
// guards: UC-049 4e; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: the register of TST-1123001; the product holds the content of SRC-restricted and of SRC-open; a drafter at "Anthropic, USA"
// input: prepareMessage; the job's tool read-file on docs/sources/SRC-restricted/handbook.md and on docs/sources/SRC-open/law.md
// expect: the context names the restricted sources in places.sources and places.contents as restrictedPlaces gives them; the read of the restricted file is refused, names SRC-restricted and "Anthropic, USA", and does not hold its text; the read of the open file gives its text
test("prepareMessage — the job's context carries the restricted sources, so read-file refuses the content of one whose licence does not allow the drafter's place", async () => {
  const { ready, context } = await prepared("Anthropic, USA");
  assert.deepEqual(context.places.sources, { "SRC-restricted": ["this machine"], "SRC-unknown": [] });
  assert.deepEqual(context.places.contents.map((each) => each.source), ["SRC-restricted", "SRC-unknown"]);
  const refused = await tools["read-file"]({ path: "docs/sources/SRC-restricted/handbook.md" }, context);
  assert.match(String(refused.text ?? refused), /SRC-restricted/);
  assert.match(String(refused.text ?? refused), /Anthropic, USA/);
  assert.equal(String(refused.text ?? refused).includes("RESTRICTED-HANDBOOK-TEXT"), false);
  const open = await tools["read-file"]({ path: "docs/sources/SRC-open/law.md" }, context);
  assert.equal(String(open.text ?? open).includes("OPEN-LAW-TEXT"), true, "known positive: a file of an open source is read");
  assert.ok(ready.prepared);
});

// TST-1123004 · level: unit · module: MOD-prompt-bar
// guards: UC-049 4e; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: the same, but the drafter is at "this machine", the place the source allows
// input: the read of the restricted file
// expect: the text of the file is given (the counter-proof: a source whose licence allows the place is read)
test("prepareMessage — the content of a restricted source is read by a drafter at a place its licence allows", async () => {
  const { context } = await prepared("this machine");
  const read = await tools["read-file"]({ path: "docs/sources/SRC-restricted/handbook.md" }, context);
  assert.equal(String(read.text ?? read).includes("RESTRICTED-HANDBOOK-TEXT"), true);
});

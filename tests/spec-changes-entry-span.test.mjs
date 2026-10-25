// An entry replaces the sections up to its `until` (ITM-675) — MOD-spec-changes, as docs/architecture/MOD-spec-changes.md states it: an entry's `until` is the heading before which its proposal ends (`Queue`: "`anchor`, `until`"); the
// section that holds now beside a proposal (`entryView`), its impact list, the blob the person was shown and the section `acceptEntries` replaces are those of the entry's span, every section from its anchor up to `until`
// (`NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT`, `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`, `THE APPROVED TEXT IS TAKEN VERBATIM`, `A STALE APPROVAL IS NOT APPLIED`).
// Run: node --test tests/spec-changes-entry-span.test.mjs
//
// Module: MOD-spec-changes
// Guards: A QUEUE IS ACCEPTED IN ITS ORDER; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; THE APPROVED TEXT IS TAKEN VERBATIM; A STALE APPROVAL IS NOT APPLIED
// Level: unit
//
// The fixture product is small and ours, never Agent M's own SPEC.md: a SPEC of three sections, one queue whose entry 01 starts at section 1 and ends before section 3, and a use case that names the requirement of section 2. The host is a fake
// that keeps to MOD-repository-hosts' interface (repositoryInfo, readSnapshot, commitFiles on an expected head); nothing reaches the network. Each test states its input and its expected result before it runs. The counter-proofs are
// run as mutations and recorded in the pull request.
//
// Where the texts leave a reading open, the tests state the one they take, and the pull request names it:
//   - An entry's `until` is the heading line of a later section of its target, in the queue's index as `bis (exklusiv)`; the span is every section from the anchor up to, not including, that section. An `until` that is not a later heading of the
//     target gives the span of the anchor's section alone.
//   - The blob a person is shown for the section, and the blob a record names as `section`, are those of the whole span's bytes.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readDocument } from "../src/documents/index.mjs";
import { sourceSchemas } from "../src/source-register/index.mjs";
import * as specChanges from "../src/spec-changes/index.mjs";
import { withStoredGraph } from "./stored-graph-fake.mjs";

const { entryView, acceptEntries, queues } = specChanges;

const text = (...lines) => `${lines.join("\n")}\n`;
const gitBlob = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const NOW = new Date("2026-03-01T10:00:00Z");
const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };

const FIRST = "A FIRST RULE", SECOND = "A SECOND RULE", THIRD = "A THIRD RULE";
const SECTION_1 = text("## 1. First", "", `**${FIRST}** *(Fixture PO)*`, "A reader reads a file.", "*Check:* `tests/sample.test.mjs`", "");
const SECTION_2 = text("## 2. Second", "", `**${SECOND}** *(Fixture PO)*`, "A reader sees a file's name.", "*Check:* no automatic check; at review", "");
const SECTION_3 = text("## 3. Third", "", `**${THIRD}** *(Fixture PO)*`, "A writer writes a file.", "*Check:* no automatic check; at review");
const HEAD = text("# Fixture product — Specification", "");
const SPEC = HEAD + SECTION_1 + SECTION_2 + SECTION_3;
// The span of the entry: sections 1 and 2. The proposal replaces both by one section that states the first rule anew and the second no more.
const SPAN = SECTION_1 + SECTION_2;
const PROPOSAL = text("## 1. First and second", "", `**${FIRST}** *(Fixture PO)*`, "A reader reads a file whole.", "*Check:* `tests/sample.test.mjs`", "");

const QUEUE = "docs/spec-freigaben/2026-03-01_span";
const USE_CASE = text("---", "id: UC-001", "title: See a name", "area: reading", "actors:", "  - Reader", "realises:", `  - ${SECOND}`, "---", "# UC-001 See a name", "", "**Goal.** The reader sees a name.");
const ENTRY_PO = text("---", "id: SRC-fixture-po", "title: Fixture PO", "kind: document", "authority: normative", "licence: may be republished — fixture", "---", "# SRC-fixture-po Fixture PO", "", "A fixture source.");
const LINKS = text("# The sources this product meets", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-fixture-po | 2026-10-05 | ${"0".repeat(64)} | |`);
const sources = () => ({ links: readDocument(sourceSchemas().links, "docs/sources.md", LINKS), register: [readDocument(sourceSchemas().entry, "docs/sources/SRC-fixture-po.md", ENTRY_PO)] });

/** The product's files: the SPEC, the queue whose entry 01 has the anchor `## 1. First` and the `until` given (— for none), its proposal and rationale, the sources and the use case. */
function files({ spec = SPEC, until = "## 3. Third" } = {}) {
  return {
    "README.md": "# Fixture product\n", "SPEC.md": spec, "docs/sources.md": LINKS, "docs/sources/SRC-fixture-po.md": ENTRY_PO, "docs/use-cases/UC-001-see-a-name.md": USE_CASE,
    [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · span", "", "**Zieldatei aller Einträge:** `SPEC.md`", "", "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|",
      `| 01 | \`SPEC.md\` | ## 1. First | ${until} | — |`),
    [`${QUEUE}/entscheidungen.md`]: text("# Decisions — queue 2026-03-01 span", "", "Append-only."),
    [`${QUEUE}/01-first.md`]: PROPOSAL, [`${QUEUE}/01-first.begruendung.md`]: text("# First: a change", "", "**The change.** A sample."),
  };
}
// A snapshot of the tree, whose graph is stored on trace-cache as the workflow "main changed" stores it (tests/stored-graph-fake.mjs), for the commit it names.
const snapshotOf = (tree) => withStoredGraph({ repository: ON_GITHUB, ref: "trunk", commit: "c".repeat(40), paths: Object.keys(tree).sort(), read: async (path) => (Object.hasOwn(tree, path) ? tree[path] : null), blob: (path) => (Object.hasOwn(tree, path) ? gitBlob(tree[path]) : null) });

function fakeHost(initial) {
  let tree = { ...initial }, head = "a".repeat(40);
  const commits = [];
  return { commits, tree: () => tree, host: {
    async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return { ...snapshotOf(tree), commit: head }; },
    async commitFiles(change) {
      if (change.branch !== "trunk" || change.expectedHead !== head) throw Object.assign(new Error("Moved"), { name: "Moved", head });
      commits.push(structuredClone(change));
      tree = { ...tree, ...Object.fromEntries(change.files.map((file) => [file.path, file.text])) };
      head = "b".repeat(40);
      return { commit: head, url: `${ON_GITHUB.web}/commit/${head}` };
    },
  } };
}

// TST-675001 · level: unit · module: MOD-spec-changes
// guards: NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: the queue's entry 01, anchor "## 1. First", until "## 3. Third"; the SPEC of three sections; a use case that names the requirement of section 2; the proposal states the requirement of section 1 only
// input: queues(snapshot) and entryView(QUEUE, 1, snapshot)
// expect: the entry's `until` is "## 3. Third"; the section that holds now is sections 1 and 2 together, with their blob; the impact names the requirement of section 2 as withdrawn, referenced by UC-001, and the requirement of section 1 as changed
test("TST-675001 an entry with an until is read as spanning every section from its anchor up to it, and its impact names their requirements", async () => {
  const snapshot = snapshotOf(files());
  assert.equal((await queues(snapshot))[0].entries[0].until, "## 3. Third");
  const view = await entryView(QUEUE, 1, snapshot);
  assert.equal(view.current.text, SPAN);
  assert.equal(view.current.blob, gitBlob(SPAN));
  assert.deepEqual(view.impact.map(({ name, change }) => [name, change]).sort(), [[FIRST, "changed"], [SECOND, "withdrawn"]]);
  assert.deepEqual(view.impact.find(({ name }) => name === SECOND).referencedBy, ["UC-001"]);
});

// TST-675002 · level: unit · module: MOD-spec-changes
// guards: NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
// given: the same entry with no until (—), and with an until that is no heading of the SPEC
// input: entryView for each
// expect: the section that holds now is section 1 alone, for both (known positive of TST-675001: the span is wider only with a heading to end before)
test("TST-675002 an entry with no until, or with an until that is no later heading, spans its anchor's section alone", async () => {
  for (const until of ["—", "## 9. Nowhere"]) {
    const view = await entryView(QUEUE, 1, snapshotOf(files({ until })));
    assert.equal(view.current.text, SECTION_1, `until ${until}`);
    assert.deepEqual(view.impact.map(({ name }) => name), [FIRST]);
  }
});

// TST-675003 · level: unit · module: MOD-spec-changes
// guards: THE APPROVED TEXT IS TAKEN VERBATIM; A QUEUE IS ACCEPTED IN ITS ORDER; A STALE APPROVAL IS NOT APPLIED
// given: the entry shown with the blob of its span; the fake host holding the product; and the product after another section-2 change has landed
// input: acceptEntries(host, [shown], "alice", now, sources) for each
// expect: the first writes one commit whose SPEC is the head, the proposal byte for byte in place of sections 1 and 2, and section 3 and every other byte as they were, and whose record names the blob of the span as `section`; the second, with section 2 changed after it was shown, writes nothing and refuses the entry as stale
test("TST-675003 accepting an entry replaces its whole span, and an entry is stale when a section of its span changed after it was shown", async () => {
  const shown = { queue: QUEUE, entry: 1, proposalBlob: gitBlob(PROPOSAL), sectionBlob: gitBlob(SPAN) };
  const fake = fakeHost(files());
  const result = await acceptEntries(fake.host, [shown], "alice", NOW, sources());
  assert.equal(result.commit !== undefined, true, JSON.stringify(result));
  assert.equal(fake.commits.length, 1);
  const written = Object.fromEntries(fake.commits[0].files.map((file) => [file.path, file.text]));
  assert.equal(written["SPEC.md"], HEAD + PROPOSAL + SECTION_3);
  const record = Object.entries(written).find(([path]) => path.startsWith("docs/approvals/"));
  assert.equal(record[1].includes(`section: ${gitBlob(SPAN)}`), true, record[1]);

  const changed = fakeHost(files({ spec: HEAD + SECTION_1 + SECTION_2.replace("a file's name", "a file's name and size") + SECTION_3 }));
  const refused = await acceptEntries(changed.host, [shown], "alice", NOW, sources());
  assert.equal(changed.commits.length, 0);
  assert.deepEqual(refused.refused.map(({ entry }) => entry), [1]);
});

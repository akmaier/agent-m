// An entry whose anchor is missing names no requirement the target already holds as added (ITM-676) — MOD-spec-changes, as docs/architecture/MOD-spec-changes.md states it: `entryView` gives the impact list of every name the proposal
// changes, withdraws or adds (`A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`), against the section that holds now; where the target lacks the entry's anchor — a new section, or an entry that waits for its anchor
// (`waiting for its anchor`) — there is no such section, and `proposeSection` writes the same list with the rationale of a new entry.
// Run: node --test tests/spec-changes-impact-elsewhere.test.mjs
//
// Module: MOD-spec-changes
// Guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// Level: unit
//
// The fixture product is small and ours, never Agent M's own SPEC.md: a SPEC of two sections and a queue whose entry 01 has an anchor that the SPEC lacks. The host is a fake that keeps to MOD-repository-hosts' interface; nothing reaches
// the network. Each test states its input and its expected result before it runs. The counter-proofs are run as mutations and recorded in the pull request.
//
// Where the texts leave a reading open, the tests state the one they take, and the pull request names it:
//   - A requirement is "added" only when the target holds no requirement of that name anywhere. Where the entry's anchor is missing, a requirement of the proposal that the target already holds under its name, in another section,
//     is "changed" when its source, rule or check differs from the target's and is not named at all when it does not. No requirement is "withdrawn" for want of a section that holds now: the target's other sections are not this entry's.
//   - The same list is written into the rationale of a new entry by proposeSection (the rationale's lines "- <name>: <change>; …").

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as specChanges from "../src/spec-changes/index.mjs";
import { withStoredGraph } from "./stored-graph-fake.mjs";

const { entryView, proposeSection } = specChanges;

const text = (...lines) => `${lines.join("\n")}\n`;
const gitBlob = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };

const SAME = "A SAME RULE", CHANGED = "A CHANGED RULE", NEW = "A NEW RULE";
const SECTION_1 = text("## 1. First", "", `**${SAME}** *(Fixture PO)*`, "A reader reads a file.", "*Check:* `tests/sample.test.mjs`", "",
  `**${CHANGED}** *(Fixture PO)*`, "A reader sees a file's name.", "*Check:* no automatic check; at review", "");
const SECTION_2 = text("## 2. Second", "", "**A WRITE RULE** *(Fixture PO)*", "A writer writes a file.", "*Check:* no automatic check; at review");
const HEAD = text("# Fixture product — Specification", "");
const SPEC = HEAD + SECTION_1 + SECTION_2;
// A section "1a" that the SPEC lacks and that states SAME word for word as section 1 does, CHANGED with another rule, and a requirement the SPEC does not hold.
const PROPOSAL = text("## 1a. Moved", "", `**${SAME}** *(Fixture PO)*`, "A reader reads a file.", "*Check:* `tests/sample.test.mjs`", "",
  `**${CHANGED}** *(Fixture PO)*`, "A reader sees a file's name and its size.", "*Check:* no automatic check; at review", "",
  `**${NEW}** *(Fixture PO)*`, "A reader sees what is new.", "*Check:* no automatic check; at review");

const QUEUE = "docs/spec-freigaben/2026-03-01_moved";
const USE_CASE = text("---", "id: UC-001", "title: Change a name", "area: reading", "actors:", "  - Reader", "realises:", `  - ${CHANGED}`, "---", "# UC-001 Change a name", "", "**Goal.** The reader sees a name.");

function files() {
  return {
    "README.md": "# Fixture product\n", "SPEC.md": SPEC, "docs/use-cases/UC-001-change-a-name.md": USE_CASE,
    [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · moved", "", "**Zieldatei aller Einträge:** `SPEC.md`", "", "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|",
      "| 01 | `SPEC.md` | ## 1a. Moved | — | — |"),
    [`${QUEUE}/entscheidungen.md`]: text("# Decisions — queue 2026-03-01 moved", "", "Append-only."),
    [`${QUEUE}/01-moved.md`]: PROPOSAL, [`${QUEUE}/01-moved.begruendung.md`]: text("# Moved: a change", "", "**The change.** A sample."),
  };
}
// A snapshot of the tree at `head`, whose graph is stored on trace-cache as the workflow "main changed" stores it (tests/stored-graph-fake.mjs).
const snapshotOf = (tree, head = "c".repeat(40)) => withStoredGraph({ repository: ON_GITHUB, ref: "trunk", commit: head, paths: Object.keys(tree).sort(), read: async (path) => (Object.hasOwn(tree, path) ? tree[path] : null), blob: (path) => (Object.hasOwn(tree, path) ? gitBlob(tree[path]) : null) });

function fakeHost(initial) {
  let tree = { ...initial };
  const head = "a".repeat(40), commits = [];
  return { commits, host: {
    async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return snapshotOf(tree, head); },
    async listPullRequests() { return []; },
    async commitFiles(change) {
      if (change.branch !== "trunk" || change.expectedHead !== head) throw Object.assign(new Error("Moved"), { name: "Moved", head });
      commits.push(structuredClone(change));
      tree = { ...tree, ...Object.fromEntries(change.files.map((file) => [file.path, file.text])) };
      return { commit: "b".repeat(40), url: `${ON_GITHUB.web}/commit/${"b".repeat(40)}` };
    },
  } };
}

// TST-676001 · level: unit · module: MOD-spec-changes
// guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
// given: entry 01 with the anchor "## 1a. Moved", which the SPEC lacks; its proposal states SAME exactly as the SPEC holds it in section 1, CHANGED with another rule than the SPEC's, and NEW, which the SPEC does not hold; a use case names CHANGED
// input: entryView(QUEUE, 1, snapshot)
// expect: there is no section that holds now (current null); the impact names CHANGED as changed, referenced by UC-001, and NEW as added, and names SAME not at all and nothing as withdrawn
test("TST-676001 an entry whose anchor is missing names a requirement the target holds as changed or not at all, never as added", async () => {
  const view = await entryView(QUEUE, 1, snapshotOf(files()));
  assert.equal(view.current, null);
  assert.deepEqual(view.impact.map(({ name, change }) => [name, change]).sort(), [[CHANGED, "changed"], [NEW, "added"]]);
  assert.deepEqual(view.impact.find(({ name }) => name === CHANGED).referencedBy, ["UC-001"]);
});

// TST-676002 · level: unit · module: MOD-spec-changes
// guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; A SPEC EDIT IS SAVED AS A PROPOSAL
// given: the SPEC and no queue; the same proposal offered as a new section "## 1a. Moved" by alice, who opened it on no section (openedBlob null)
// input: proposeSection(host, { target: "SPEC.md", anchor: "## 1a. Moved", until: null, text: PROPOSAL, … })
// expect: one commit with a rationale whose impact list says "A CHANGED RULE: changed" and "A NEW RULE: added" and does not say "A SAME RULE", and no line "A CHANGED RULE: added"
test("TST-676002 the impact list written with a new section's rationale names a requirement the target holds as changed, never as added", async () => {
  const fake = fakeHost({ "README.md": "# Fixture product\n", "SPEC.md": SPEC, "docs/use-cases/UC-001-change-a-name.md": USE_CASE });
  const result = await proposeSection(fake.host, { target: "SPEC.md", anchor: "## 1a. Moved", until: null, text: PROPOSAL, why: "To move the rules.", origin: "a sample", person: "alice", openedBlob: null, openedHead: "a".repeat(40) });
  assert.equal(result.commit !== undefined, true, JSON.stringify(result));
  const rationale = fake.commits[0].files.find((file) => file.path.endsWith(".begruendung.md")).text;
  assert.equal(rationale.includes(`- ${CHANGED}: changed;`), true, rationale);
  assert.equal(rationale.includes(`- ${NEW}: added;`), true, rationale);
  assert.equal(rationale.includes(SAME), false, rationale);
  assert.equal(rationale.includes(`- ${CHANGED}: added`), false, rationale);
});

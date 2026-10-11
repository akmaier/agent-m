// The accepted use cases, and whether a first architecture can be drafted (ITM-437) — MOD-approvals' approvalStrategies as the
// accepted text of docs/architecture/MOD-approvals.md states them, for UC-022 steps 1 and 3 and its flows 1a, 1b and 1c: the
// recipe `accepted-use-cases` — every use case whose current text a record names, one part per file —, and the precondition
// `architecture-ready` — an error naming each use case that is open or changed, an error that points to UC-023 when the product
// has an architecture already, and a warning naming every open SPEC change. The recipe `whole-architecture` and the architecture's
// part of `rests-on-accepted` (UC-023) are not part of this item.
// Run: node --test tests/approvals-architecture.test.mjs
//
// Module: MOD-approvals
// Guards: UC-022; ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES; THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE
// Level: unit
//
// The product is a small repository this file holds, in memory, behind a snapshot of its own (paths, blob and read, as MOD-repository-
// hosts' Snapshot gives them): a SPEC; use cases of three statuses, UC-001 and UC-003 accepted, UC-002 open and UC-004 changed; and,
// where a test needs them, an architecture decision and a change queue of three entries: the first accepted by an approval record that
// names its proposal, the second named only by a decision row, the third by a record that names an earlier text of its proposal. A strategy is called as the job runner calls it: a recipe with the job's context and its parameters, a
// precondition with the context. The module file words neither the findings nor the name of an open SPEC change, and a precondition
// returns one finding: this file asks of each finding its kind, its rule, that it is one line and what it names, and reads the
// precondition as returning, of the three, the first that holds — the architecture that exists, the use cases not accepted, the open
// SPEC changes —, since UC-022 1c opens UC-023 instead, and 1a blocks before 1b only warns. An open SPEC change is named by its
// proposal's path, and is open when no approval record names its proposal (MOD-spec-changes, Data), whatever a decision row says.
// A name the module does not provide yet is undefined here, so that each test fails by itself. Each test states its
// input and its expected result before it runs (given / input / expect). Nothing reaches the network. The counter-proofs are recorded
// in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as approvalsModule from "../src/approvals/index.mjs";

const { approvalStrategies } = approvalsModule;

// ---------------------------------------------------------------- the product

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");

const SPEC = text("# Fixture product — Specification", "", "## Section", "", "**A SAMPLE RULE** *(Product Owner)*",
  "A sample rule that a use case realises.", "*Check:* `tests/sample.test.mjs`");
const useCase = (id, title) => text("---", `id: ${id}`, `title: ${title}`, "area: files", "actors:", "  - Reader", "realises:",
  "  - A SAMPLE RULE", "---", `# ${id} ${title}`, "", `**Goal.** ${title}.`);
const UC1_PATH = "docs/use-cases/UC-001-read-a-file.md", UC1 = useCase("UC-001", "Read a file");
const UC2_PATH = "docs/use-cases/UC-002-write-a-file.md", UC2 = useCase("UC-002", "Write a file");
const UC3_PATH = "docs/use-cases/UC-003-copy-a-file.md", UC3 = useCase("UC-003", "Copy a file");
const UC4_PATH = "docs/use-cases/UC-004-delete-a-file.md", UC4 = useCase("UC-004", "Delete a file");
const UC4_EARLIER = useCase("UC-004", "Remove a file");
const ARC_PATH = "docs/architecture/ARC-001-the-system.md";
const MOD_PATH = "docs/architecture/MOD-sample.md";
const MODULE = text("---", "id: MOD-sample", "title: Sample", "folder: src/sample/", "---", "# MOD-sample Sample");
const ARC = text("---", "id: ARC-001", "title: The system", "forced_by:", "  - UC-001", "---", "# ARC-001 The system");

// A queue of three entries. 01 is accepted: an approval record names its proposal. 02 has a decision row and no record. 03 has a
// record that names an earlier text of its proposal. A record is docs/approvals/spec-<queue>-<NN>-<first twelve digits of the blob>.md.
const QUEUE = "docs/spec-freigaben/2026-10-01_fixture";
const ENTRY1 = `${QUEUE}/01-an-accepted-rule.md`, ENTRY2 = `${QUEUE}/02-a-rule-with-a-row.md`, ENTRY3 = `${QUEUE}/03-a-changed-rule.md`;
const PROPOSAL1 = text("**AN ACCEPTED RULE** *(Product Owner)*", "A rule."), PROPOSAL2 = text("**A RULE WITH A ROW** *(Product Owner)*", "A rule."),
  PROPOSAL3 = text("**A CHANGED RULE** *(Product Owner)*", "A rule, changed since it was accepted."),
  PROPOSAL3_EARLIER = text("**A CHANGED RULE** *(Product Owner)*", "A rule.");
const specRecord = (number, proposal) => ({ [`docs/approvals/spec-2026-10-01_fixture-${number}-${blobOf(proposal).slice(0, 12)}.md`]:
  text("kind: spec", "queue: docs/spec-freigaben/2026-10-01_fixture", `entry: ${number}`, `blob: ${blobOf(proposal)}`) });
const QUEUE_FILES = {
  [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-10-01 · fixture", "", "| Nr | Datei |", "|---|---|", "| 01 | `SPEC.md` |",
    "| 02 | `SPEC.md` |", "| 03 | `SPEC.md` |"),
  [ENTRY1]: PROPOSAL1, [`${QUEUE}/01-an-accepted-rule.begruendung.md`]: text("Why."),
  [ENTRY2]: PROPOSAL2, [`${QUEUE}/02-a-rule-with-a-row.begruendung.md`]: text("Why."),
  [ENTRY3]: PROPOSAL3, [`${QUEUE}/03-a-changed-rule.begruendung.md`]: text("Why."),
  [`${QUEUE}/entscheidungen.md`]: text("# Decisions — queue 2026-10-01 fixture", "", "Append-only.",
    "| 2026-10-01 10:10 UTC | 2 | uebernommen | 8fc690f44a4570f45777abc9a7142728bce2737d |"),
};
const QUEUE_RECORDS = { ...specRecord("01", PROPOSAL1), ...specRecord("03", PROPOSAL3_EARLIER) };

// A second queue, only begun: its index and a proposal, and no entscheidungen.md yet.
const FRESH = "docs/spec-freigaben/2026-10-02_fresh";
const FRESH_ENTRY = `${FRESH}/01-a-fresh-rule.md`;
const FRESH_FILES = { [`${FRESH}/index.md`]: text("# SPEC approvals — queue 2026-10-02 · fresh", "", "| Nr | Datei |", "|---|---|", "| 01 | `SPEC.md` |"),
  [FRESH_ENTRY]: text("**A FRESH RULE** *(Product Owner)*", "A rule.") };

const record = (id, file, body) => [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`,
  text("kind: use-case", `file: ${file}`, `blob: ${blobOf(body)}`)];
const RECORDS = Object.fromEntries([record("UC-001", UC1_PATH, UC1), record("UC-003", UC3_PATH, UC3), record("UC-004", UC4_PATH, UC4_EARLIER)]);
const BASE = { "SPEC.md": SPEC, "README.md": "# Fixture product\n", [UC1_PATH]: UC1, [UC2_PATH]: UC2, [UC3_PATH]: UC3, [UC4_PATH]: UC4, ...RECORDS };
// A ready product: every use case accepted, no architecture, and every entry of the queue named by a record of its current proposal.
const READY = { ...BASE, ...Object.fromEntries([record("UC-002", UC2_PATH, UC2), record("UC-004", UC4_PATH, UC4)]), ...QUEUE_FILES,
  ...specRecord("01", PROPOSAL1), ...specRecord("02", PROPOSAL2), ...specRecord("03", PROPOSAL3) };

const contextOf = (files, params = {}) => ({ params, product: { address: "https://github.com/alice/product", host: null,
  snapshot: { repository: { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" },
    ref: "main", commit: null, paths: Object.keys(files), read: async (path) => (path in files ? files[path] : null),
    blob: (path) => (path in files ? blobOf(files[path]) : null) } } });

const ONLY = "ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES";
const WHOLE = "THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE";
const words = (found) => `${found.what} ${found.fix}`;

// ---------------------------------------------------------------- the recipe

// guards: ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES; UC-022
// given: the product above with UC-001 and UC-003 accepted, UC-002 open and UC-004 changed, and an architecture decision
// input: the recipe accepted-use-cases, with the job's context and no parameter
// expect: two parts, one for each accepted use case in the order the files stand, none for UC-002, UC-004 or the decision: each
//         part's name holds its file's path and its text is the whole file
test("accepted-use-cases — one part for each use case a record names the current text of, none for an open or a changed one", async () => {
  const parts = await approvalStrategies.recipes["accepted-use-cases"](contextOf({ ...BASE, [ARC_PATH]: ARC }), {});

  assert.equal(parts.length, 2);
  [[UC1_PATH, UC1], [UC3_PATH, UC3]].forEach(([path, body], at) => {
    assert.ok(parts[at].name.includes(path), `${parts[at].name} holds ${path}`);
    assert.equal(parts[at].text, body);
  });
  for (const left of [UC2_PATH, UC4_PATH, ARC_PATH]) assert.ok(!parts.some((part) => part.name.includes(left)), `${left} has no part`);
});

// ---------------------------------------------------------------- the precondition

// guards: ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES; UC-022
// given: the product above with UC-001 and UC-003 accepted, UC-002 open and UC-004 changed, no architecture
// input: the precondition architecture-ready, with the job's context
// expect: one finding, an error under ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES, of one line, that names UC-002 and
//         UC-004 and neither UC-001 nor UC-003
test("architecture-ready — an error names each use case that is open or changed", async () => {
  const found = await approvalStrategies.preconditions["architecture-ready"](contextOf(BASE));

  assert.equal(found.kind, "error");
  assert.equal(found.rule, ONLY);
  assert.ok(Number.isInteger(found.line) && found.line >= 1);
  for (const [id, named] of [["UC-002", true], ["UC-004", true], ["UC-001", false], ["UC-003", false]]) {
    assert.equal(words(found).includes(id), named, `${id} is ${named ? "" : "not "}named in: ${words(found)}`);
  }
  for (const own of [found.what, found.fix]) assert.match(own, /^[^\n]+$/);
});

// guards: THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE; UC-022
// given: a product whose use cases are all accepted and that holds an architecture decision; the same with UC-002 open; and one
//        that holds a module file and no decision
// input: the precondition architecture-ready, for each
// expect: one error under THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE, of one line, that points to UC-023 — also with a use case
//         open, whose error does not come instead, and with a module file alone
test("architecture-ready — a product that has an architecture already is pointed to UC-023", async () => {
  const accepted = { ...READY, [ARC_PATH]: ARC };
  for (const files of [accepted, { ...BASE, [ARC_PATH]: ARC }, { ...READY, [MOD_PATH]: MODULE }]) {
    const found = await approvalStrategies.preconditions["architecture-ready"](contextOf(files));

    assert.equal(found.kind, "error");
    assert.equal(found.rule, WHOLE);
    assert.ok(words(found).includes("UC-023"), words(found));
    for (const own of [found.what, found.fix]) assert.match(own, /^[^\n]+$/);
  }
});

// guards: THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE; UC-022
// given: a product whose use cases are all accepted, no architecture, a change queue whose entry 01 a record of its proposal names,
//        whose entry 02 only a decision row names, and whose entry 03 a record of an earlier text of its proposal names; and a
//        second queue with an entry and no decisions file yet
// input: the precondition architecture-ready
// expect: one finding, a warning under THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE, of one line, that names the proposals of
//         entries 02 and 03 and of the second queue's, not entry 01's, and nothing else of the queues
test("architecture-ready — a warning names each SPEC change whose proposal no approval record names", async () => {
  const files = { ...READY, ...QUEUE_FILES, ...QUEUE_RECORDS, ...FRESH_FILES };
  for (const path of Object.keys(files)) if (/spec-2026-10-01_fixture-0[23]-/.test(path) && !(path in QUEUE_RECORDS)) delete files[path];

  const found = await approvalStrategies.preconditions["architecture-ready"](contextOf(files));

  assert.equal(found.kind, "warning");
  assert.equal(found.rule, WHOLE);
  for (const open of [ENTRY2, ENTRY3, FRESH_ENTRY]) assert.ok(words(found).includes(open), `${open} is named in: ${words(found)}`);
  assert.ok(!words(found).includes(ENTRY1), words(found));
  assert.equal(words(found).match(/docs\/spec-freigaben\//g).length, 3, `only the three proposals are named, no rationale or file of a queue: ${words(found)}`);
  for (const own of [found.what, found.fix]) assert.match(own, /^[^\n]+$/);
});

// guards: ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES; THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE; UC-022
// given: a product that is ready: every use case accepted, no architecture, every SPEC change decided; and, as the known
//        positive, the same with UC-002 open
// input: the precondition architecture-ready, for each
// expect: a finding for the one with the open use case; none (null) for the ready product
test("architecture-ready — a product that is ready gives no finding", async () => {
  const ready = approvalStrategies.preconditions["architecture-ready"];
  assert.notEqual(await ready(contextOf({ ...READY, [UC2_PATH]: useCase("UC-002", "Write a file, edited") })), null,
    "known positive: an open use case is found");

  assert.equal(await ready(contextOf(READY)), null);
});

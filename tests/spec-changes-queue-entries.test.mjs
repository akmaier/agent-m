// Classified candidates written as change queues (ITM-338) — MOD-spec-changes' writer `queue-entries` of specStrategies, as docs/architecture/MOD-spec-changes.md states it:
// the candidates written by the result's classes, as the person left them, as a new queue of the SPEC each belongs in — a candidate that constrains the development process to a queue
// of the instance's SPEC, its class decided with classifyCandidates against that SPEC and its open queues, every other to one of the product's —, one commit for each queue; one entry
// for each section the candidates touch, as entrySections composes it with the job's `source`; a candidate that points to a source the product does not link not written, the
// outcome's notes naming it with that source; each rationale with its origin, its impact list, the version, participant, model, date and rounds, in the schema
// `queue-rationale.schema.md`; the commit with the job's provenance lines; nothing committed when every section already stands as written; SPEC.md untouched.
// Run: node --test tests/spec-changes-queue-entries.test.mjs
//
// Module: MOD-spec-changes
// Guards: UC-005; UC-019
// Guards: A CHANGE IS PROPOSED UNDER THE EXISTING NAME; A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT; A CONFLICT IS DECIDED BY A PERSON; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// Guards: A REQUIREMENT NAMES WHAT IT CONSTRAINS; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// Level: unit
//
// The product and the instance are fixtures this file builds, never Agent M's own: each a snapshot (paths, blob SHAs, a read of the texts) and a host that records every commit
// it is asked for. The product's SPEC has two sections; a use case realises one of its requirements, so that an impact list has something to name; the instance's register holds the
// source the product links, and its SPEC holds a process requirement and an open queue. The writer is called as the job runner calls a writer, with a result and a context. Where
// the module file leaves a reading open, the test states the reading it takes, and the pull request names it:
//   - A candidate's class is the one in `result.classes` for its name, as the person left it; one without a class is not written. A conflict is written as the class the person gave it.
//   - A process candidate's class is decided anew with classifyCandidates over the instance's SPEC and the requirements of its open queues, keys name and rule; a candidate that restates a
//     requirement only an open entry holds is not written, and noted.
//   - A queue's folder is `docs/spec-freigaben/<date><letter>_<slug>/` with the day of the job and the first letter, none, b, c …, no queue of that day in the repository has; the slug is the
//     kind and the job. Its entries are named by their section; `SPEC.md` is the target of every entry. `entscheidungen.md` is written with no decision.
//   - A candidate's `source` is a source it points to; one that `linkedVersion` gives no version for is not written, and the note names the candidate and the source.
//   - The impact list of an entry is, for each requirement it changes, the artifacts that name it — MOD-trace-graph's requirementImpact — or that nothing does; a new requirement has none.
// A name the module does not provide yet fails each test by itself. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as specChanges from "../src/spec-changes/index.mjs";
import { readDocument, documentFindings, loadSchema } from "../src/documents/index.mjs";
import { provenanceLines } from "../src/job-runner/index.mjs";
import { sourceSchemas } from "../src/source-register/index.mjs";
import { readFileSync } from "node:fs";

const { specStrategies, entrySections } = specChanges;
const writer = specStrategies?.writers?.["queue-entries"];

const text = (...lines) => `${lines.join("\n")}\n`;
const gitBlob = (body) => { const bytes = Buffer.from(body, "utf8"); return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"); };

// ---------------------------------------------------------------- the product and the instance
const PRODUCT_SPEC = text("# Fixture product — Specification", "",
  "## 1. Reading", "",
  "**A SAMPLE RULE** *(Product Owner)*", "A reader reads a file whole.", "*Check:* `tests/sample.test.mjs`", "",
  "**ANOTHER SAMPLE RULE** *(Product Owner)*", "A reader sees the name of a file.", "*Check:* no automatic check; at review", "",
  "## 2. Writing", "",
  "**A WRITE RULE** *(Product Owner)*", "A writer writes a file whole.", "*Check:* no automatic check; at review");
const INSTANCE_SPEC = text("# Fixture instance — Specification", "",
  "## 1. Process", "",
  "**GATES ARE NAMED** *(Product Owner)*", "A job names its gates.", "*Check:* no automatic check; at review");
const useCase = text("---", "id: UC-001", "title: Read a file", "area: reading", "actors:", "  - Reader", "realises:", "  - A SAMPLE RULE", "---", "# UC-001 Read a file", "", "**Goal.** Read a file.");
const BOOK_ENTRY = text("---", "id: SRC-fixture-book", "title: Fixture Book", "kind: document", "authority: normative", "licence: may be republished — CC BY 4.0", "---", "# SRC-fixture-book Fixture Book", "",
  "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`2026-10-01\` | 2026-10-01 | — | the fixture | 1 file, listed below; version hash \`${"1".repeat(64)}\` |`, "", "### Files of 2026-10-01", "", "| File | SHA-256 |", "|---|---|", `| \`08_chapter.md\` | \`${"a".repeat(64)}\` |`);
const LINKS = text("# Requirement sources of the fixture", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-fixture-book | 2026-10-01 | ${"1".repeat(64)} | |`);
const OPEN_QUEUE = "docs/spec-freigaben/2026-10-10_open-idea";
const OPEN_ENTRY = text("## 2. Open process", "", "**A PROCESS IDEA** *(Product Owner)*", "A job lists the gates it passed.", "*Check:* no automatic check; at review");

const snapshotOf = (files, extraPaths = []) => ({
  paths: [...Object.keys(files), ...extraPaths],
  blob: (path) => (Object.hasOwn(files, path) ? gitBlob(files[path]) : null),
  read: async (path) => (Object.hasOwn(files, path) ? files[path] : null),
  commit: "h".repeat(40),
});
const hostOf = (name) => {
  const commits = [];
  return { name, commits,
    repositoryInfo: async () => ({ defaultBranch: "main", canWrite: true }),
    readSnapshot: async () => { throw new Error("the writer reads the snapshots the context carries"); },
    commitFiles: async (change) => { commits.push(change); return { commit: `${name}-commit-${commits.length}`.padEnd(40, "0"), url: "https://example.test/commit" }; } };
};

function fixture({ spec = PRODUCT_SPEC, productPaths = [], instancePaths = [] } = {}) {
  const productFiles = { "SPEC.md": spec, "docs/sources.md": LINKS, "docs/use-cases/UC-001-read-a-file.md": useCase };
  const instanceFiles = { "SPEC.md": INSTANCE_SPEC, "docs/sources/SRC-fixture-book.md": BOOK_ENTRY,
    [`${OPEN_QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-10-10 · an idea", "", "**Zieldatei aller Einträge:** `SPEC.md`", "", "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", "| 01 | `SPEC.md` | ## 2. Open process | — | — |"),
    [`${OPEN_QUEUE}/01-open-process.md`]: OPEN_ENTRY,
    [`${OPEN_QUEUE}/entscheidungen.md`]: text("# Decisions — queue 2026-10-10_open-idea an idea", "", "Append-only.") };
  const product = { address: "https://github.com/alice/product", snapshot: snapshotOf(productFiles, productPaths), host: hostOf("product") };
  const instance = { snapshot: snapshotOf(instanceFiles, instancePaths), host: hostOf("instance"), checkout: null };
  const context = { kind: { name: "derive-requirements" }, params: { source: "SRC-fixture-book" }, product, instance, now: new Date("2026-10-12T09:00:00Z"),
    agentM: { version: "unreleased", commit: "c".repeat(40) }, jobId: "JOB-20261012-0900-ab12", person: "alice", participants: [], connect: async () => { throw new Error("no repository is opened here"); } };
  return { context, product, instance, productFiles, instanceFiles };
}
const candidate = (name, { rule = `${name} states a rule.`, check = "no automatic check; at review", passage = "ch. 8", class: kind = "new", of = null, constrains = "product", source } = {}) =>
  ({ name, rule, check, constrains, passage, class: kind, of, ...(source ? { source } : {}) });
const classOf = (item, kind = item.class, of = item.of, from = [item.passage]) => ({ refs: [item.name], from, class: kind, of, decidedBy: "participant" });
const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };
const resultOf = (candidates, classes = candidates.map((item) => classOf(item))) => ({ draft: { candidates }, raw: null, drafter: DRAFTER, rounds: [{ number: 1, findings: [] }, { number: 2, findings: [] }],
  remaining: [], forPerson: [], stepFindings: [], classes, stoppedBecause: "passed", gate: null, usage: [], written: null });
const filesOf = (commit) => Object.fromEntries(commit.files.map((file) => [file.path, file.text ?? new TextDecoder().decode(file.bytes)]));
const folderOf = (commit) => [...new Set(commit.files.map((file) => file.path.split("/").slice(0, 3).join("/")))];

const CHANGE = candidate("A BETTER NAME", { rule: "A reader reads a file whole, or says why not.", check: "`tests/better.test.mjs`", class: "change", of: "A SAMPLE RULE" });
const NEW = candidate("A WRITER NAMES ITS FILE", { rule: "A writer names the file it wrote.", class: "new" });
const DUPLICATE = candidate("RESTATES THE WRITE RULE", { class: "duplicate", of: "A WRITE RULE", passage: "ch. 9" });
const CONFLICT = candidate("CONTRADICTS ANOTHER", { rule: "A reader sees nothing.", class: "conflict", of: "ANOTHER SAMPLE RULE" });

// guards: A CHANGE IS PROPOSED UNDER THE EXISTING NAME; A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT; A CONFLICT IS DECIDED BY A PERSON; UC-005 8
// given: a result with a change of A SAMPLE RULE, a new requirement, a duplicate of A WRITE RULE and an undecided conflict with ANOTHER SAMPLE RULE, all constraining the product
// input: the writer
// expect: one commit to the product's repository holding one queue; its entries the sections the candidates touch — Reading with the change, Writing with the new requirement and the added source —,
//         each the whole section as entrySections composes it with the job's source; the conflict in none; nothing committed to the instance
test("queue-entries — each class is written as the classes say, an undecided conflict not at all", async () => {
  assert.ok(writer, "the writer is offered");
  const f = fixture();
  const result = resultOf([CHANGE, NEW, DUPLICATE, CONFLICT]);
  const outcome = await writer(result, f.context);
  assert.equal(f.product.host.commits.length, 1);
  assert.deepEqual(f.instance.host.commits, []);
  const commit = f.product.host.commits[0];
  const written = filesOf(commit);
  const expected = entrySections(PRODUCT_SPEC, result.draft, result.classes, "SRC-fixture-book");
  assert.deepEqual(expected.map((section) => section.anchor), ["## 1. Reading", "## 2. Writing"]);
  const [folder] = folderOf(commit);
  assert.match(folder, /^docs\/spec-freigaben\/2026-10-12_derive-requirements-job-20261012-0900-ab12$/);
  assert.equal(written[`${folder}/01-reading.md`], expected[0].text);
  assert.equal(written[`${folder}/02-writing.md`], expected[1].text);
  assert.ok(written[`${folder}/01-reading.md`].includes("**A SAMPLE RULE** *(Product Owner; SRC-fixture-book, ch. 8)*\nA reader reads a file whole, or says why not."));
  assert.ok(written[`${folder}/02-writing.md`].includes("**A WRITER NAMES ITS FILE**"));
  assert.ok(written[`${folder}/02-writing.md`].includes("*(Product Owner; SRC-fixture-book, ch. 9)*"));
  assert.ok(!Object.values(written).some((body) => body.includes("CONTRADICTS ANOTHER") || body.includes("A reader sees nothing.")));
  const index = written[`${folder}/index.md`];
  assert.match(index, /^# SPEC approvals — queue 2026-10-12 · /);
  assert.match(index, /\*\*Zieldatei aller Einträge:\*\* `SPEC\.md`/);
  assert.match(index, /\| 01 \| `SPEC\.md` \| ## 1\. Reading \| — \| — \|/);
  assert.match(index, /\| 02 \| `SPEC\.md` \| ## 2\. Writing \| — \| — \|/);
  assert.deepEqual([commit.branch, commit.expectedHead], ["main", "h".repeat(40)]);
  assert.deepEqual(outcome.commits.length, 1);
  assert.deepEqual([outcome.pullRequest, outcome.shown], [null, null]);
  assert.deepEqual(outcome.files.slice().sort(), commit.files.map((file) => file.path).sort());
  assert.ok(Array.isArray(outcome.notes));
});

// guards: A CONFLICT IS DECIDED BY A PERSON; UC-005 7
// given: the same conflict, which the person resolved as a change of ANOTHER SAMPLE RULE in the classes
// input: the writer
// expect: the conflict is written as the person decided: the section Reading holds it as a change under the existing name
test("queue-entries — a conflict the person resolved is written as decided", async () => {
  const f = fixture();
  const undecided = await writer(resultOf([CONFLICT]), f.context);
  assert.deepEqual(undecided.commits, [], "known positive: the undecided conflict commits nothing");
  const result = resultOf([CONFLICT], [classOf(CONFLICT, "change", "ANOTHER SAMPLE RULE")]);
  await writer(result, f.context);
  assert.equal(f.product.host.commits.length, 1);
  const body = Object.values(filesOf(f.product.host.commits[0])).find((each) => each.includes("ANOTHER SAMPLE RULE") && each.startsWith("## 1. Reading"));
  assert.ok(body.includes("**ANOTHER SAMPLE RULE** *(Product Owner; SRC-fixture-book, ch. 8)*\nA reader sees nothing."));
});

// guards: A REQUIREMENT NAMES WHAT IT CONSTRAINS; UC-005 5b
// given: two candidates that constrain the process, which the classes say are new, among those of the product: one with a new rule, one that restates GATES ARE NAMED word for word, and
//        one that restates A PROCESS IDEA, which only an open entry of the instance holds
// input: the writer
// expect: the instance's repository gets a queue of its own in its own commit: the section Process with the new requirement and the added source of GATES ARE NAMED — the class decided anew by
//         rule, not as the classes say —; the one that only an open entry holds is not written and noted by name; the product's repository gets only its own candidates; two commits
test("queue-entries — a candidate that constrains the process goes to the instance's queue, its class decided against its SPEC and its open queues", async () => {
  const f = fixture();
  const gate = candidate("A JOB NAMES A GATE", { rule: "A job names the gate it stops at.", constrains: "process" });
  const restated = candidate("GATES ARE LISTED", { rule: "A job names its gates.", constrains: "process" });
  const idea = candidate("A PROCESS IDEA RESTATED", { rule: "A job lists the gates it passed.", constrains: "process" });
  const outcome = await writer(resultOf([NEW, gate, restated, idea]), f.context);
  assert.equal(f.product.host.commits.length, 1);
  assert.equal(f.instance.host.commits.length, 1);
  assert.equal(outcome.commits.length, 2);
  const productBodies = Object.values(filesOf(f.product.host.commits[0])).join("\n");
  assert.ok(productBodies.includes("A WRITER NAMES ITS FILE"));
  assert.ok(!productBodies.includes("A JOB NAMES A GATE") && !productBodies.includes("GATES ARE LISTED"), "a process candidate is not the product's");
  const written = filesOf(f.instance.host.commits[0]);
  const [folder] = folderOf(f.instance.host.commits[0]);
  assert.match(folder, /^docs\/spec-freigaben\/2026-10-12_/);
  const section = written[`${folder}/01-process.md`];
  assert.ok(section.includes("**A JOB NAMES A GATE** *(SRC-fixture-book, ch. 8)*"));
  assert.ok(section.includes("**GATES ARE NAMED** *(Product Owner; SRC-fixture-book, ch. 8)*"), "restated by rule: a source added, not a requirement");
  assert.ok(!section.includes("**GATES ARE LISTED**"));
  assert.ok(!Object.values(written).some((body) => body.includes("A PROCESS IDEA RESTATED")));
  assert.ok(outcome.notes.some((note) => note.includes("A PROCESS IDEA RESTATED") && note.includes("A PROCESS IDEA") && /open queue/.test(note) && note.includes("2026-10-10_open-idea")), "the restated open entry is noted by name, with its open queue");
});

// guards: A REQUIREMENT HAS A REGISTERED SOURCE; UC-005 5a
// given: a candidate that points to SRC-unlinked, which the product does not link, one that points to SRC-fixture-book, which it links, and one that points to no source
// input: the writer
// expect: the unlinked one is in no file and the outcome's notes name it with SRC-unlinked and the hint to link it first; the other two are written
test("queue-entries — a candidate of a source the product does not link is left out and noted", async () => {
  const f = fixture();
  const unlinked = candidate("FROM AN UNLINKED SOURCE", { source: "SRC-unlinked" });
  const linked = candidate("FROM A LINKED SOURCE", { source: "SRC-fixture-book" });
  const plain = candidate("FROM THE JOB'S SOURCE");
  const outcome = await writer(resultOf([unlinked, linked, plain]), f.context);
  const bodies = Object.values(filesOf(f.product.host.commits[0])).join("\n");
  assert.ok(bodies.includes("FROM A LINKED SOURCE") && bodies.includes("FROM THE JOB'S SOURCE"));
  assert.ok(!bodies.includes("FROM AN UNLINKED SOURCE"));
  const note = outcome.notes.find((each) => each.includes("FROM AN UNLINKED SOURCE"));
  assert.ok(note && note.includes("SRC-unlinked") && /link the source first/i.test(note), "named with its source and the hint to link it first");
  assert.equal(outcome.notes.filter((each) => each.includes("SRC-fixture-book")).length, 0);
});

// guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; UC-005 8
// given: the change of A SAMPLE RULE, which UC-001 realises, and the new requirement, in two sections
// input: the writer, and its commit's message
// expect: each entry has a rationale in the schema queue-rationale, which reads it without a finding: its title naming the section and what changes, the paragraphs The change and Why, the
//         impact list naming UC-001 for the changed requirement and nothing for the new one, the origin — the source with its passage —, and the Agent M version, the participant, the model,
//         the date and the two rounds; the commit's message ends with the provenance lines of the job; no entry has a decision, no record: they enter open
test("queue-entries — each entry has its rationale with the impact list and the version that produced it, and the commit carries the provenance lines", async () => {
  const f = fixture();
  await writer(resultOf([CHANGE, NEW]), f.context);
  const commit = f.product.host.commits[0];
  const written = filesOf(commit);
  const [folder] = folderOf(commit);
  const schema = loadSchema(readFileSync(new URL("../src/spec-changes/queue-rationale.schema.md", import.meta.url), "utf8"), "MOD-spec-changes");
  const reading = written[`${folder}/01-reading.begruendung.md`], writing = written[`${folder}/02-writing.begruendung.md`];
  for (const [name, body] of [["01-reading", reading], ["02-writing", writing]]) {
    assert.deepEqual(documentFindings(schema, readDocument(schema, `${folder}/${name}.begruendung.md`, body)), [], `${name}: no finding`);
    for (const label of ["**The change.**", "**Why.**", "**Impact list.**", "**Origin.**", "**Provenance.**"]) assert.ok(body.includes(label), `${name}: ${label}`);
    assert.ok(body.includes("SRC-fixture-book") && body.includes("ch. 8"));
    assert.match(body, /unreleased/);
    assert.ok(body.includes("drafter-a") && body.includes("example-model") && body.includes("2026-10-12"));
    assert.match(body, /rounds?:? 2|2 rounds?/i);
  }
  assert.match(reading, /^# 1\. Reading: .*A SAMPLE RULE/);
  assert.match(reading, /\*\*Impact list\.\*\*[\s\S]*A SAMPLE RULE[\s\S]*UC-001/);
  assert.match(writing, /^# 2\. Writing: .*A WRITER NAMES ITS FILE/);
  assert.match(writing, /\*\*Impact list\.\*\*[\s\S]*A WRITER NAMES ITS FILE[\s\S]*new/i);
  assert.ok(!/UC-001/.test(writing.split("**Impact list.**")[1].split("**Origin.**")[0]), "nothing names a new requirement");
  const trailers = provenanceLines({ agentM: { version: "unreleased", commit: "c".repeat(40) }, jobId: "JOB-20261012-0900-ab12", kind: "derive-requirements", participant: DRAFTER, rounds: 2, instruction: null });
  assert.ok(commit.message.endsWith(trailers.join("\n")), "the provenance lines end the message");
  assert.ok(!Object.keys(written).some((path) => path.includes("docs/approvals/")));
  const decisions = written[`${folder}/entscheidungen.md`];
  assert.match(decisions, /^# Decisions — queue /);
  assert.ok(!/uebernommen/.test(decisions));
  const indexed = { ...sourceSchemas() };
  assert.ok(indexed.entry, "the register's schema is untouched");
});

// guards: A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN; A SPEC EDIT IS SAVED AS A PROPOSAL; UC-005 8
// given: the candidates of the first test
// input: the writer
// expect: no commit holds SPEC.md or any file outside docs/spec-freigaben/<queue>/; the product's SPEC as the snapshot holds it is as it was, byte for byte
test("queue-entries — SPEC.md is left byte for byte as it was", async () => {
  const f = fixture();
  const before = gitBlob(PRODUCT_SPEC);
  await writer(resultOf([CHANGE, NEW, DUPLICATE, candidate("A GATE", { constrains: "process" })]), f.context);
  for (const host of [f.product.host, f.instance.host]) {
    for (const commit of host.commits) assert.ok(commit.files.every((file) => /^docs\/spec-freigaben\/[^/]+\/[^/]+$/.test(file.path)), "only files of the queue");
  }
  assert.equal(f.product.snapshot.blob("SPEC.md"), before);
  assert.equal(await f.product.snapshot.read("SPEC.md"), PRODUCT_SPEC);
});

// guards: A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT; UC-005 7b
// given: a SPEC whose A WRITE RULE already names the source SRC-fixture-book, ch. 9, and a result whose only candidate restates it from that passage
// input: the writer
// expect: no commit and no file: every section already stands as written; the outcome names none; and a result with no candidate writes nothing either
test("queue-entries — nothing is committed when every section already stands as written", async () => {
  const spec = PRODUCT_SPEC.replace("**A WRITE RULE** *(Product Owner)*", "**A WRITE RULE** *(Product Owner; SRC-fixture-book, ch. 9)*");
  const f = fixture({ spec });
  const outcome = await writer(resultOf([DUPLICATE]), f.context);
  assert.deepEqual([f.product.host.commits, f.instance.host.commits, outcome.commits, outcome.files], [[], [], [], []]);
  const fresh = fixture();
  assert.equal((await writer(resultOf([DUPLICATE]), fresh.context)).commits.length, 1, "known positive: with the SPEC as it was, it is written");
  assert.deepEqual((await writer(resultOf([]), fixture().context)).commits, []);
});

// guards: A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; UC-005 8
// given: a repository that holds a queue of the day, and one more of the day with the letter b
// input: the writer
// expect: the new queue's folder has the letter c; with none of the day the letter is absent
test("queue-entries — the queue of the day takes the next letter", async () => {
  const f = fixture({ productPaths: ["docs/spec-freigaben/2026-10-12_first/index.md", "docs/spec-freigaben/2026-10-12b_second/index.md", "docs/spec-freigaben/2026-10-11_other/index.md"] });
  await writer(resultOf([NEW]), f.context);
  assert.match(folderOf(f.product.host.commits[0])[0], /^docs\/spec-freigaben\/2026-10-12c_/);
  const g = fixture();
  await writer(resultOf([NEW]), g.context);
  assert.match(folderOf(g.product.host.commits[0])[0], /^docs\/spec-freigaben\/2026-10-12_/);
});

// guards: THE PERSON WHO PROMPTS IS A SOURCE; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; UC-019 6b
// given: a job of change-requirements whose parameters carry the person's own source and their instruction
// input: the writer
// expect: the requirement names that source with the passage; the rationale's origin names the instruction; the commit's message ends with the provenance lines, the instruction among them
test("queue-entries — a change by prompt names the person's source and records the instruction", async () => {
  const f = fixture();
  f.context.kind = { name: "change-requirements" };
  f.context.params = { source: "SRC-fixture-book", instruction: "Make the reader say why a file cannot be read.\nKeep the rest." };
  await writer(resultOf([CHANGE]), f.context);
  const commit = f.product.host.commits[0];
  const written = filesOf(commit);
  const [folder] = folderOf(commit);
  assert.match(folder, /_change-requirements-job-20261012-0900-ab12$/);
  assert.ok(written[`${folder}/01-reading.md`].includes("*(Product Owner; SRC-fixture-book, ch. 8)*"));
  assert.ok(written[`${folder}/01-reading.begruendung.md`].includes("Instruction: Make the reader say why a file cannot be read. Keep the rest."));
  const trailers = provenanceLines({ agentM: { version: "unreleased", commit: "c".repeat(40) }, jobId: "JOB-20261012-0900-ab12", kind: "change-requirements", participant: DRAFTER, rounds: 2,
    instruction: "Make the reader say why a file cannot be read.\nKeep the rest." });
  assert.ok(trailers.some((line) => line.startsWith("Agent-M-Instruction: ")));
  assert.ok(commit.message.endsWith(trailers.join("\n")));
});

// guards: A CHANGE IS PROPOSED UNDER THE EXISTING NAME; UC-005 6
// given: a change of a requirement the SPEC does not hold, beside a change of one it holds
// input: the writer
// expect: the first is not written and the outcome's notes name it with the requirement it says it changes; the second is written; nothing throws
test("queue-entries — a change of a requirement the SPEC does not hold is left out and noted", async () => {
  const f = fixture();
  const missing = candidate("CHANGES A GHOST", { class: "change", of: "A GHOST REQUIREMENT" });
  const outcome = await writer(resultOf([missing, CHANGE]), f.context);
  const bodies = Object.values(filesOf(f.product.host.commits[0])).join("\n");
  assert.ok(bodies.includes("A BETTER NAME") === false && bodies.includes("A reader reads a file whole, or says why not."), "the change that can be written is");
  assert.ok(!bodies.includes("CHANGES A GHOST"));
  assert.ok(outcome.notes.some((note) => note.includes("CHANGES A GHOST") && note.includes("A GHOST REQUIREMENT")));
});

// guards: A CHANGE IS PROPOSED UNDER THE EXISTING NAME; UC-005 8
// given: two new requirements of one section, in the order the draft gives them
// input: the writer
// expect: the section holds them in that order, after the section's own requirements
test("queue-entries — the candidates of a section are written in the order of the draft", async () => {
  const f = fixture();
  await writer(resultOf([candidate("FIRST NEW RULE"), candidate("SECOND NEW RULE")]), f.context);
  const [folder] = folderOf(f.product.host.commits[0]);
  const body = filesOf(f.product.host.commits[0])[`${folder}/01-writing.md`];
  assert.ok(body.indexOf("**A WRITE RULE**") < body.indexOf("**FIRST NEW RULE**") && body.indexOf("**FIRST NEW RULE**") < body.indexOf("**SECOND NEW RULE**"));
});

// guards: A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; UC-005 5b
// given: a product that is its own instance — one repository, one host, one SPEC — and a result with a candidate for the product and one that constrains the process; and, apart, a product and an
//        instance that are two repositories
// input: the writer
// expect: in one repository two commits whose queues are of one day: the first the day, the second the day with the letter b, no file written twice; in two repositories each queue the day alone
test("queue-entries — two queues of one day in one repository get the day and then the day with b", async () => {
  const f = fixture();
  f.context.instance = { snapshot: f.product.snapshot, host: f.product.host, checkout: null };
  await writer(resultOf([NEW, candidate("A PROCESS RULE", { constrains: "process" })]), f.context);
  assert.equal(f.product.host.commits.length, 2);
  const [first, second] = f.product.host.commits.map((commit) => folderOf(commit)[0]);
  assert.match(first, /^docs\/spec-freigaben\/2026-10-12_derive-requirements/);
  assert.match(second, /^docs\/spec-freigaben\/2026-10-12b_derive-requirements/);
  assert.equal(first.replace("2026-10-12_", "").length > 0, true);
  assert.equal(second.replace("2026-10-12b_", ""), first.replace("2026-10-12_", ""), "the slug is the same: the letter tells them apart");
  const paths = f.product.host.commits.flatMap((commit) => commit.files.map((file) => file.path));
  assert.equal(new Set(paths).size, paths.length, "no file is written twice");

  const g = fixture();
  await writer(resultOf([NEW, candidate("A PROCESS RULE", { constrains: "process" })]), g.context);
  assert.match(folderOf(g.product.host.commits[0])[0], /^docs\/spec-freigaben\/2026-10-12_/);
  assert.match(folderOf(g.instance.host.commits[0])[0], /^docs\/spec-freigaben\/2026-10-12_/, "another repository: no letter");
});

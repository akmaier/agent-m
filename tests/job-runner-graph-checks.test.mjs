// The built-in check graph-checks — MOD-job-runner's correction loop with a kind that names it, as
// docs/architecture/MOD-job-runner.md states it under Data (Built-in strategies): MOD-trace-graph's graphFindings on the
// product's snapshot with the drafted files put in place of their paths, and its selfSufficiencyFindings there against the
// instance's repository, the owner/name of the context's instance. What goes back to the drafter is the draft's own findings:
// the product's repository holds findings of its own, which the draft did not make and cannot mend, and they are left out
// (A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT).
// Run: node --test tests/job-runner-graph-checks.test.mjs
//
// Module: MOD-job-runner
// Guards: UC-007; UC-019; A USE CASE REALISES NAMED REQUIREMENTS; THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
// Guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// Level: unit
//
// The kind is this file's own, so that the check runs alone, in the loop of one drafter; its answer is a list of files. The
// product is a small repository this file holds, never Agent M's own: a SPEC.md of one requirement, a use case that breaks no
// rule, and a use case, UC-009, that breaks three — it realises a name the SPEC lacks, it links the dashboard of the instance
// and it points at a section by its number — so the repository holds two errors and a warning before any draft is made. The
// instance is another repository, fixture-owner/agent-m, whose dashboard address MOD-identifiers gives. What a test pins of a
// finding is what the module files of MOD-trace-graph and MOD-identifiers state of it — the artifact, the kind and the rule —,
// and that its `what` names the thing at fault; the words are theirs. The driver is a fixture that answers from a list and
// keeps every input it was sent. Each test states its input and its expected result before it runs (given / input / expect).
// Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { formatFinding } from "../src/text-tools/index.mjs";
import { pagesAddress } from "../src/identifiers/index.mjs";
import { graphFindings, selfSufficiencyFindings, traceGraph } from "../src/trace-graph/index.mjs";
import { runJob } from "../src/job-runner/index.mjs";

// ---------------------------------------------------------------- the kind, the repositories, the driver, the context

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };

// The answer of a kind that drafts documents: files, each with its path, its text and its class.
const FILES = { type: "object", required: ["files"], properties: { files: { type: "array", items: { type: "object",
  required: ["path", "text", "class"], properties: { path: { type: "string" }, text: { type: "string" },
    class: { type: "string", enum: ["new", "change", "duplicate", "conflict"] }, of: { type: "string" } } } } } };

// A kind that names the one check: a person reviews its result, so runJob returns it and writes nothing.
const KIND = { name: "fixture-use-cases", serves: [], participant: "one", needs: ["draft text"], resources: "none",
  preconditions: [], recipes: [], checks: ["graph-checks"], personDecides: [], reviewer: null, reviewers: 0, steps: [],
  gatePoints: [], review: "person", writer: "return-draft", limit: 5, purpose: "Drafts use cases, for a test.",
  prompt: "Draft the use cases.", answer: FILES };
const JOB = { kind: KIND, params: {}, drafter: DRAFTER, reviewers: [], parts: [], destinations: [], fits: true,
  notFitting: [], leftOut: [], blocking: [], limit: 5 };

const address = (path) => ({ server: "github", origin: "https://github.com", path, web: `https://github.com/${path}` });
const INSTANCE = "fixture-owner/agent-m";
const DASHBOARD = pagesAddress(INSTANCE);
// A repository at its default branch, from the files it holds.
const snapshotOf = (path, files) => ({ repository: address(path), ref: "main", commit: null, paths: Object.keys(files),
  read: async (file) => (file in files ? files[file] : null), blob: (file) => (file in files ? files[file] : null) });
const text = (...lines) => `${lines.join("\n")}\n`;

// ---------------------------------------------------------------- the product's files

const SPEC = text("# Fixture product — Specification", "", "## Section", "", "**A SAMPLE RULE** *(Product Owner)*",
  "A sample rule that a use case realises.", "*Check:* `tests/sample.test.mjs`");
const UC1_PATH = "docs/use-cases/UC-001-read-a-file.md";
const UC1 = text("---", "id: UC-001", "title: Read a file", "area: reading", "actors:", "  - Reader", "realises:",
  "  - A SAMPLE RULE", "---", "# UC-001 Read a file", "", "**Goal.** The reader reads a file whole.");
// The use case that breaks three rules: line 8 realises a name no requirement has, line 12 holds a link to the dashboard and a
// section by its number.
const UC9_PATH = "docs/use-cases/UC-009-read-a-legacy-file.md";
const UC9 = text("---", "id: UC-009", "title: Read a legacy file", "area: reading", "actors:", "  - Reader", "realises:",
  "  - A LEGACY RULE", "---", "# UC-009 Read a legacy file", "",
  `**Goal.** The reader reads a legacy file; see section 3 and [the dashboard](${DASHBOARD}).`);
const PRODUCT = { "SPEC.md": SPEC, "README.md": "# Fixture product\n", [UC1_PATH]: UC1, [UC9_PATH]: UC9 };

const contextOf = () => ({ kind: KIND, params: {},
  product: { address: "https://github.com/alice/product", snapshot: snapshotOf("alice/product", PRODUCT), host: null },
  instance: { snapshot: snapshotOf(INSTANCE, {}), host: null }, connect: async () => null, participants: [DRAFTER],
  places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date("2026-10-11T08:00:00Z"),
  agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });
const run = (drafter) => runJob(JOB, { drafter, reviewers: [] }, { attended: true, context: contextOf() });

// A driver that answers from `answers` in turn — a value is sent as its JSON, a function is called with the input the driver
// was sent and its value sent — and keeps every input it was sent.
function driver(answers) {
  const inputs = [];
  return { participant: DRAFTER, inputs, async send(input) {
    inputs.push(input);
    if (answers.length === 0) throw new Error("the drafter was asked more often than the test expects");
    const next = answers.shift();
    return { text: JSON.stringify(typeof next === "function" ? next(input) : next), usage: null };
  } };
}
// What a drafter that corrects answers: `draft`, and each finding it was sent fixed.
const correcting = (draft) => (input) => ({ draft,
  answers: input.findings.map((found) => ({ finding: formatFinding(found), how: "fixed" })) });

// The findings the repository holds before any draft: MOD-trace-graph's functions on the product as it stands.
async function held() {
  const graph = await traceGraph({ paths: Object.keys(PRODUCT), read: async (file) => PRODUCT[file] ?? null });
  return [...graphFindings(graph), ...selfSufficiencyFindings(graph, INSTANCE)];
}

const REALISES = "A USE CASE REALISES NAMED REQUIREMENTS";
const SELF = "THE PRODUCT REPOSITORY IS SELF-SUFFICIENT";
const POSITION = "A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION";
const placed = (findings) => findings.map((found) => [found.artifact, found.kind, found.rule]).sort((a, b) => (a < b ? -1 : 1));
// A finding says what is wrong and what correction is expected, each in one line, and names a line.
function sayItInOneLine(found) {
  assert.ok(Number.isInteger(found.line) && found.line >= 1, `${found.artifact} names a line`);
  for (const words of [found.what, found.fix]) assert.match(words, /^[^\n]+$/, `${found.artifact}: ${words}`);
}

// A drafted use case: UC-002, writing a file, realising `realises`, whose goal is `goal`.
const UC2_PATH = "docs/use-cases/UC-002-write-a-file.md";
const useCase = (realises, goal) => ({ path: UC2_PATH, class: "new", text: text("---", "id: UC-002", "title: Write a file",
  "area: writing", "actors:", "  - Writer", "realises:", `  - ${realises}`, "---", "# UC-002 Write a file", "",
  `**Goal.** ${goal}`) });

// ---------------------------------------------------------------- the check

// TST-472325 · level: unit · module: MOD-job-runner
// guards: A USE CASE REALISES NAMED REQUIREMENTS; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; UC-007
// given: a kind that names graph-checks alone; a product that holds a SPEC with the one requirement A SAMPLE RULE, UC-001, and UC-009, which holds two errors and a warning of its own; a drafter that drafts a new use case UC-002 realising A RULE THE SPEC LACKS and, told of the finding, drafts it again
// input: runJob of it, a person attending
// expect: before the draft the repository holds three findings (the known positive), all of UC-009; the drafter asked twice, the second time with one finding: an error under A USE CASE REALISES NAMED REQUIREMENTS on UC-002, naming A RULE THE SPEC LACKS, in one line — and none of UC-009's three; the loop stops unchanged with that finding remaining
test("graph-checks — a drafted use case that realises a name the SPEC lacks goes back, and the repository's own findings do not", async () => {
  assert.deepEqual(placed(await held()), placed([
    { artifact: "UC-009", kind: "error", rule: REALISES }, { artifact: "UC-009", kind: "error", rule: SELF },
    { artifact: UC9_PATH, kind: "warning", rule: POSITION }]), "known positive: the repository holds findings of its own");
  const draft = { files: [useCase("A RULE THE SPEC LACKS", "The writer writes a file whole.")] };
  const drafter = driver([{ draft }, { draft }]);

  const result = await run(drafter);

  const own = [["UC-002", "error", REALISES]];
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(placed(drafter.inputs[1].findings), own);
  assert.ok(drafter.inputs[1].findings[0].what.includes("A RULE THE SPEC LACKS"), drafter.inputs[1].findings[0].what);
  assert.deepEqual(result.rounds.map((round) => [round.number, placed(round.findings)]), [[1, own], [2, own]]);
  assert.deepEqual([result.stoppedBecause, placed(result.remaining)], ["unchanged", own]);
  drafter.inputs[1].findings.forEach(sayItInOneLine);
});

// TST-472326 · level: unit · module: MOD-job-runner
// guards: THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; UC-007
// given: the same job and product; a drafter that drafts a new use case UC-002 realising A SAMPLE RULE, whose goal links a page of the instance's dashboard, and — told of the finding — drafts it again
// input: runJob of it, a person attending
// expect: the drafter asked twice, the second time with one finding: an error under THE PRODUCT REPOSITORY IS SELF-SUFFICIENT on UC-002, naming the link, in one line — and none of UC-009's, which links the dashboard too; the loop stops unchanged with that finding remaining
test("graph-checks — a drafted use case that links the instance's dashboard goes back, and the repository's own findings do not", async () => {
  const link = `${DASHBOARD}docs/`;
  const draft = { files: [useCase("A SAMPLE RULE", `The writer writes a file; see [the dashboard](${link}).`)] };
  const drafter = driver([{ draft }, { draft }]);

  const result = await run(drafter);

  const own = [["UC-002", "error", SELF]];
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(placed(drafter.inputs[1].findings), own);
  assert.ok(drafter.inputs[1].findings[0].what.includes(link), drafter.inputs[1].findings[0].what);
  assert.deepEqual(result.rounds.map((round) => [round.number, placed(round.findings)]), [[1, own], [2, own]]);
  assert.deepEqual([result.stoppedBecause, placed(result.remaining)], ["unchanged", own]);
  drafter.inputs[1].findings.forEach(sayItInOneLine);
});

// TST-472327 · level: unit · module: MOD-job-runner
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; UC-019; UC-007
// given: the same job and product; a drafter that first drafts three things — UC-002 realising A RULE THE SPEC LACKS and linking the dashboard, and UC-009 changed: an actor added, which moves every line of its front matter down, a paragraph added before its goal, and a second "section 3" in the goal — and then, told of the findings, drafts UC-002 whole and UC-009 as changed but with one "section 3", answering each finding fixed
// input: runJob of it, a person attending
// expect: three findings in the first round, each the draft's own: the two errors on UC-002 and one warning under A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION on UC-009's file — the second "section 3", since the first is the repository's, and neither UC-009's two errors nor its first "section 3" come back, though the draft moved every one of them to another line; none in the second round; the loop ends because passed, nothing remaining, and the corrected draft is the result's
test("graph-checks — a corrected draft ends the loop, and what a changed file already held stays the repository's", async () => {
  const goal = (twice) => `**Goal.** The reader reads a legacy file; see section 3${twice ? " and again section 3" : ""}, and `
    + `[the dashboard](${DASHBOARD}).`;
  const uc9 = (twice) => ({ path: UC9_PATH, class: "change", of: "UC-009", text: text("---", "id: UC-009",
    "title: Read a legacy file", "area: reading", "actors:", "  - Reader", "  - Archivist", "realises:", "  - A LEGACY RULE",
    "---", "# UC-009 Read a legacy file", "", "A paragraph added, which moves what follows down.", "", goal(twice)) });
  const faulty = useCase("A RULE THE SPEC LACKS", `The writer writes a file; see [the dashboard](${DASHBOARD}docs/).`);
  const first = { files: [faulty, uc9(true)] };
  const corrected = { files: [useCase("A SAMPLE RULE", "The writer writes a file whole."), uc9(false)] };
  const drafter = driver([{ draft: first }, correcting(corrected)]);

  const result = await run(drafter);

  const own = placed([{ artifact: "UC-002", kind: "error", rule: REALISES }, { artifact: "UC-002", kind: "error", rule: SELF },
    { artifact: UC9_PATH, kind: "warning", rule: POSITION }]);
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(placed(drafter.inputs[1].findings), own);
  assert.deepEqual(result.rounds.map((round) => [round.number, placed(round.findings), round.answers.map((a) => a.how)]),
    [[1, own, ["fixed", "fixed", "fixed"]], [2, [], []]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [corrected, "passed", []]);
  drafter.inputs[1].findings.forEach(sayItInOneLine);
});

// TST-1209001 · level: unit · module: MOD-job-runner
// guards: UC-049
// given: the fixture product, whose snapshot counts every file read and every batch; a draft that holds no files — as a conversation's answer holds none — and, as the known positive, a draft that holds UC-009's file unchanged
// input: the check graph-checks on each
// expect: the draft without files has no finding and reads nothing; the draft with a file reads the repository, in batches
test("graph-checks reads nothing for a draft that changes no file, and reads in batches for one that does", async () => {
  const { builtins } = await import("../src/job-runner/builtins.mjs");
  const reads = [], batches = [];
  const counting = { ...snapshotOf("alice/product", PRODUCT), read: async (file) => { reads.push(file); return PRODUCT[file] ?? null; },
    readMany: async (paths) => { batches.push(paths.length); } };
  const context = { ...contextOf(), product: { address: "https://github.com/alice/product", snapshot: counting, host: null } };
  const check = builtins.checks["graph-checks"];
  assert.deepEqual(await check({ answer: "no files" }, context), []);
  assert.deepEqual([reads.length, batches.length], [0, 0]);
  await check({ files: [{ path: UC9_PATH, text: UC9 }] }, context);
  assert.ok(reads.length > 0, "known positive: a draft with files reads the repository");
  assert.ok(batches.length > 0, "it reads in batches");
});

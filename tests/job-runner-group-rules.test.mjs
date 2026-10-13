// The built-in check group-rules — MOD-job-runner's correction loop with a kind that names it, as
// docs/architecture/MOD-job-runner.md states it under Data (Built-in strategies): the drafted GroupMoves applied with
// MOD-group-document's applyMoves to the group file of the kind the job's parameters name, read from the product's snapshot,
// and what goes back to the drafter: each refused move with its reason, and the findings hierarchy reports for the result — a
// member placed twice, a group titled by an identifier.
// Run: node --test tests/job-runner-group-rules.test.mjs
//
// Module: MOD-job-runner
// Guards: UC-021; AN ITEM HAS ONE PLACE IN ITS HIERARCHY; A GROUP CARRIES NO IDENTIFIER
// Guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// Level: unit
//
// The kind is this file's own, so that the check runs alone, in the loop of one drafter; its answer is a list of moves. The
// product's snapshot is a fixture that holds the files a test sets: the items of one kind, and its group file. The first two
// tests arrange the use cases, the last two the modules, so that the group file read is the one the job's parameter `kind`
// names. The moves are applied by MOD-group-document, whose reasons and findings a test takes from its interface — applyMoves
// and hierarchy — rather than words them again; the module file of MOD-job-runner words neither the artifact and line a refused
// move is reported on nor its text, of which a test asks only that it is an error under the requirement a draft that fails a
// check goes back under, that it holds the reason, and that `what` and `fix` each say something in one line. The driver is a
// fixture that answers from a list and keeps every input it was sent. Each test states its input and its expected result
// before it runs (given / input / expect). Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { formatFinding } from "../src/text-tools/index.mjs";
import { applyMoves, hierarchy, parseGroupFile } from "../src/group-document/index.mjs";
import { runJob } from "../src/job-runner/index.mjs";

// ---------------------------------------------------------------- the kind, the snapshot, the driver, the context

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };

// The answer of a kind that proposes groups: a list of moves, each of the six forms of GroupMove.
const names = { type: "array", items: { type: "string" } };
const MOVES = { type: "object", required: ["moves"], properties: { moves: { type: "array", items: { type: "object",
  required: ["op"], properties: { op: { type: "string", enum: ["create", "rename", "move", "move-group", "delete", "lift"] },
    title: { type: "string" }, in: names, group: names, item: { type: "string" }, to: names } } } } };

// A kind that names the one check: a person reviews its result, so runJob returns it and writes nothing.
const KIND = { name: "fixture-groups", serves: [], participant: "one", needs: ["draft text"], resources: "none",
  preconditions: [], recipes: [], checks: ["group-rules"], personDecides: [], reviewer: null, reviewers: 0, steps: [],
  gatePoints: [], review: "person", writer: "return-draft", limit: 5, purpose: "Proposes groups, for a test.",
  prompt: "Propose the groups.", answer: MOVES };

const REPOSITORY = { server: "github", origin: "https://github.com", path: "alice/product",
  web: "https://github.com/alice/product" };
// A repository at its default branch, from the files it holds.
const snapshotOf = (files) => ({ repository: REPOSITORY, ref: "main", commit: null, paths: Object.keys(files).sort(),
  read: async (path) => (path in files ? files[path] : null), blob: (path) => (path in files ? files[path] : null) });
const contextOf = (kind, files) => ({ kind: KIND, params: { kind },
  product: { address: REPOSITORY.web, snapshot: snapshotOf(files), host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER],
  places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date("2026-10-11T08:00:00Z"),
  agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });
const JOB = { kind: KIND, params: {}, drafter: DRAFTER, reviewers: [], parts: [], destinations: [], fits: true,
  notFitting: [], leftOut: [], blocking: [], limit: 5 };

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

const run = (drafter, kind, files) => runJob(JOB, { drafter, reviewers: [] },
  { attended: true, context: contextOf(kind, files) });

const kindsOf = (findings) => findings.map((found) => [found.kind, found.rule]);
const bySecond = (a, b) => a[1].localeCompare(b[1]);
// A finding says what is wrong and what correction is expected, each in one line, and names a line.
function sayItInOneLine(found) {
  assert.ok(Number.isInteger(found.line) && found.line >= 1, `${found.artifact} names a line`);
  for (const text of [found.what, found.fix]) assert.match(text, /^[^\n]+$/, `${found.artifact}: ${text}`);
}

const GOES_BACK = "A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT";
const ONE_PLACE = "AN ITEM HAS ONE PLACE IN ITS HIERARCHY";
const NO_IDENTIFIER = "A GROUP CARRIES NO IDENTIFIER";

// ---------------------------------------------------------------- the items and the group files

// A use case and a module, each as a file of the product holds it.
const useCaseFile = (id, slug, title) => [`docs/use-cases/${id}-${slug}.md`,
  `---\nid: ${id}\ntitle: ${title}\n---\n# ${id} ${title}\n`];
const moduleFile = (id, title) => [`docs/architecture/${id}.md`, `---\nid: ${id}\ntitle: ${title}\n---\n# ${id} ${title}\n`];
const USE_CASES = Object.fromEntries([useCaseFile("UC-005", "derive-requirements", "Derive requirements"),
  useCaseFile("UC-006", "review-and-accept", "Review and accept"),
  useCaseFile("UC-007", "derive-use-cases", "Derive use cases"), useCaseFile("UC-008", "accept-a-use-case", "Accept a use case")]);
const MODULES = Object.fromEntries([moduleFile("MOD-job-runner", "The one runner"),
  moduleFile("MOD-job-catalogue", "The kinds"), moduleFile("MOD-documents", "Documents"),
  moduleFile("MOD-group-document", "Group files")]);
const MODULE_IDS = ["MOD-job-runner", "MOD-job-catalogue", "MOD-documents", "MOD-group-document"];

// The use cases arranged in two groups, as the module file of MOD-group-document writes its example.
const USE_CASE_GROUPS = "docs/groups/use-cases.md";
const ARRANGED = `# Use cases — groups

The hierarchy of the use cases, each member by its identifier.

- Review
  - UC-006
  - UC-008
- Derivation
  - UC-005
  - UC-007
`;
// The modules arranged badly: MOD-job-runner stands in two groups (lines 6 and 11), and the group on line 8 is titled by a
// module's identifier.
const MODULE_GROUPS = "docs/groups/modules.md";
const BADLY_ARRANGED = `# Modules — groups

The hierarchy of the modules, each member by its identifier.

- Runner
  - MOD-job-runner
  - MOD-job-catalogue
- MOD-documents
  - MOD-group-document
- Archive
  - MOD-job-runner
`;

// ---------------------------------------------------------------- the check

// TST-472328 · level: unit · module: MOD-job-runner
// guards: UC-021
// given: a kind that names group-rules alone, for a job whose parameter kind is use-cases; a product whose snapshot holds four use cases and their group file, Review (UC-006, UC-008) and Derivation (UC-005, UC-007); a drafter that drafts six moves, each valid on the file and on the moves before it — create the group Approval, move UC-008 into it, rename Derivation to Deriving, create Early inside it, move UC-005 into Early, and move the group Review into Approval
// input: runJob of it, a person attending
// expect: nothing found; the drafter asked once; the loop stopped because passed, nothing remaining; the draft the result's
test("group-rules — valid moves on the group file of the kind pass", async () => {
  const moves = [{ op: "create", title: "Approval", in: [] }, { op: "move", item: "UC-008", to: ["Approval"] },
    { op: "rename", group: ["Derivation"], title: "Deriving" }, { op: "create", title: "Early", in: ["Deriving"] },
    { op: "move", item: "UC-005", to: ["Deriving", "Early"] }, { op: "move-group", group: ["Review"], to: ["Approval"] }];
  const files = { ...USE_CASES, [USE_CASE_GROUPS]: ARRANGED };
  assert.deepEqual(applyMoves(parseGroupFile(USE_CASE_GROUPS, ARRANGED), moves).refused, [], "the moves are valid on the file");
  const drafter = driver([{ draft: { moves } }]);

  const result = await run(drafter, "use-cases", files);

  assert.equal(drafter.inputs.length, 1);
  assert.deepEqual(result.rounds.map((round) => [round.number, round.findings]), [[1, []]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [{ moves }, "passed", []]);
});

// TST-472329 · level: unit · module: MOD-job-runner
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; UC-021
// given: the same job and snapshot; a drafter that drafts five moves — create the group Approval, move ARC-048 into Review, move UC-005 into Nowhere, delete Review, move UC-008 into Approval — of which the second is an item of another kind, the third names a group that does not exist, the fourth deletes a group that is not empty, and the first and the last are valid; told of the findings, it drafts the same five again
// input: runJob of it, a person attending
// expect: the drafter asked twice, the second time with three findings, one for each refused move, in the order of the moves: each an error under A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT, in one line, holding the reason applyMoves gives for that move — and none for the two valid moves —; the loop stops unchanged with those three remaining
test("group-rules — a refused move goes back to the drafter with its reason", async () => {
  const moves = [{ op: "create", title: "Approval", in: [] }, { op: "move", item: "ARC-048", to: ["Review"] },
    { op: "move", item: "UC-005", to: ["Nowhere"] }, { op: "delete", group: ["Review"] },
    { op: "move", item: "UC-008", to: ["Approval"] }];
  const files = { ...USE_CASES, [USE_CASE_GROUPS]: ARRANGED };
  const reasons = applyMoves(parseGroupFile(USE_CASE_GROUPS, ARRANGED), moves).refused.map((refusal) => refusal.reason);
  assert.equal(reasons.length, 3, "the second, third and fourth moves are refused");
  const drafter = driver([{ draft: { moves } }, { draft: { moves } }]);

  const result = await run(drafter, "use-cases", files);

  const refused = [["error", GOES_BACK], ["error", GOES_BACK], ["error", GOES_BACK]];
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(kindsOf(drafter.inputs[1].findings), refused);
  drafter.inputs[1].findings.forEach((found, at) => {
    assert.ok(formatFinding(found).includes(reasons[at]), `${reasons[at]} is in ${formatFinding(found)}`);
  });
  assert.deepEqual(result.rounds.map((round) => [round.number, kindsOf(round.findings)]), [[1, refused], [2, refused]]);
  assert.deepEqual([result.stoppedBecause, kindsOf(result.remaining)], ["unchanged", refused]);
  drafter.inputs[1].findings.forEach(sayItInOneLine);
});

// TST-472330 · level: unit · module: MOD-job-runner
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; A GROUP CARRIES NO IDENTIFIER; UC-021
// given: a job whose parameter kind is modules; a product whose snapshot holds four modules and their group file, in which MOD-job-runner stands in two groups, Runner on line 6 and Archive on line 11, and the group on line 8 is titled MOD- documents, a module's identifier; a drafter that drafts one valid move, create the group Spare, which touches neither, and — told of the findings — drafts it again
// input: runJob of it, a person attending
// expect: the drafter asked twice, the second time with two findings, both errors, in one line: one under AN ITEM HAS ONE PLACE IN ITS HIERARCHY that names MOD-job-runner, and one under A GROUP CARRIES NO IDENTIFIER that names MOD-documents; the loop stops unchanged with those two remaining
test("group-rules — a member placed twice and a group titled by an identifier go back to the drafter", async () => {
  const moves = [{ op: "create", title: "Spare", in: [] }];
  const files = { ...MODULES, [MODULE_GROUPS]: BADLY_ARRANGED };
  const found = hierarchy(applyMoves(parseGroupFile(MODULE_GROUPS, BADLY_ARRANGED), moves).tree, MODULE_IDS).findings;
  assert.deepEqual(kindsOf(found).sort(bySecond), [["error", ONE_PLACE], ["error", NO_IDENTIFIER]].sort(bySecond),
    "the file holds both faults, and the move touches neither");
  const drafter = driver([{ draft: { moves } }, { draft: { moves } }]);

  const result = await run(drafter, "modules", files);

  const wrong = [["error", ONE_PLACE], ["error", NO_IDENTIFIER]].sort(bySecond);
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(kindsOf(drafter.inputs[1].findings).sort(bySecond), wrong);
  const lines = drafter.inputs[1].findings.map(formatFinding);
  const named = (rule) => lines.filter((line) => line.includes(`[${rule}]`));
  assert.ok(named(ONE_PLACE).length === 1 && named(ONE_PLACE)[0].includes("MOD-job-runner"), lines.join("\n"));
  assert.ok(named(NO_IDENTIFIER).length === 1 && named(NO_IDENTIFIER)[0].includes("MOD-documents"), lines.join("\n"));
  assert.deepEqual(result.rounds.map((round) => [round.number, kindsOf(round.findings).sort(bySecond)]),
    [[1, wrong], [2, wrong]]);
  assert.deepEqual([result.stoppedBecause, kindsOf(result.remaining).sort(bySecond)], ["unchanged", wrong]);
  drafter.inputs[1].findings.forEach(sayItInOneLine);
});

// TST-472331 · level: unit · module: MOD-job-runner
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; A GROUP CARRIES NO IDENTIFIER; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; UC-021
// given: the same job and snapshot; a drafter that first drafts the move that touches neither fault and then, told of the two findings, drafts three moves that fix them — create the group Spare, move MOD-job-runner into Runner, which takes it out of every other place, and rename the group MOD-documents to Documents — answering each finding fixed
// input: runJob of it, a person attending
// expect: the drafter asked twice; two findings in the first round, each answered fixed, and none in the second; stopped because passed with nothing remaining and the corrected draft the result's
test("group-rules — a draft fixed as the findings say passes", async () => {
  const first = { moves: [{ op: "create", title: "Spare", in: [] }] };
  const fixed = { moves: [{ op: "create", title: "Spare", in: [] }, { op: "move", item: "MOD-job-runner", to: ["Runner"] },
    { op: "rename", group: ["MOD-documents"], title: "Documents" }] };
  const files = { ...MODULES, [MODULE_GROUPS]: BADLY_ARRANGED };
  const mended = applyMoves(parseGroupFile(MODULE_GROUPS, BADLY_ARRANGED), fixed.moves);
  assert.deepEqual([mended.refused, hierarchy(mended.tree, MODULE_IDS).findings], [[], []],
    "the moves are valid and leave the file with neither fault");
  const drafter = driver([{ draft: first }, correcting(fixed)]);

  const result = await run(drafter, "modules", files);

  const wrong = [["error", ONE_PLACE], ["error", NO_IDENTIFIER]].sort(bySecond);
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(result.rounds.map((round) => [round.number, kindsOf(round.findings).sort(bySecond),
    round.answers.map((answer) => answer.how)]), [[1, wrong, ["fixed", "fixed"]], [2, [], []]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [fixed, "passed", []]);
});

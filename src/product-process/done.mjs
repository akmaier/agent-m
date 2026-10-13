// The Definition-of-Done check of a pull request (MOD-product-process, Interfaces: doneCheck). index.mjs offers it; the product's CI runs it through the job `agent-m done`
// (that entry, onDoneCheck, is another item's).
//
// Module: MOD-product-process
//
// The job rules are the workflow's `done`: CI is green; the first commit holds only tests and CI was red on it — for a refactoring job, CI was green on every commit and no test's expected result
// changed; every changed code file lies in the folder of one of the job's modules; every new test names a requirement and a module; every gate the workflow places before the merge is recorded; and the
// conditions the declaration adds. Where the module file leaves a reading open, this file takes the one it names:
//   - doneCheck reads the texts of changed files with `facts.read`, which is asynchronous: it returns a Promise of the findings, in the order of the job rules.
//   - A finding is on the artifact `pull request #<n>`, or on a file's path where one file is at fault, at line 1, kind error, under the requirement its rule guards.
//   - CI is green when the head commit's ci is `success` and no check of the head is failing, cancelled, timed out, queued or running.
//   - A job of kind `implement` or `fix-bug` begins with a failing test: its first commit changes only test files and its ci is `failure`. A `refactor` job: every commit's ci is `success`, and no test's
//     expected result changed: of each test file the pull request modifies, no assertion line of the base text is missing from the head text and no declared `expect` of a test case differs; assertions
//     added are no change of a result.
//   - A code file is a changed file that is no test file and has the extension .mjs, .js, .py, .ts, .css or .html; it lies in a module's folder when its path starts with the `folder` of one of the
//     job's modules (`modules` are the module files; the job names them by `id`).
//   - A new test is a declaration of a test file the pull request adds, or one of a modified file that the base text lacks; it names a requirement and a module when it has `guards` and `module`. An
//     added test file without any declaration is one finding.
//   - The gates before the merge are those that leave a phase at or before the phase that produces MOD (the job's phase), reached along the transitions that are not `back`; without such a phase, every
//     gate. Each must be `passed` by gateStates, over the blobs of the head texts of the artifacts its record names.
//   - A declared `check: <name>` holds when the head has that check with state success; `gate: <gate>` when gateStates says that gate `passed`; `review: <n> …` when n distinct reviewers have an
//     `approved` review. That the reviewers are other than the implementer is not in the facts and is not checked.

import { blobSha, finding } from "../text-tools/index.mjs";
import { isTestFile, testDeclarations } from "../test-document/index.mjs";
import { gateStates } from "./gates.mjs";

const MERGED_ONLY = "A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS";
const GREEN_CI = "CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI";
const FAILING_TEST = "AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST";
const NO_FAILING_TEST = "A REFACTORING JOB BEGINS WITHOUT A FAILING TEST";
const NO_RESULT_CHANGED = "A REFACTORING JOB CHANGES NO EXPECTED RESULT";
const ONLY_ITS_MODULES = "AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES";
const ORIGIN = "EVERY ARTIFACT NAMES ITS ORIGIN";
const RECORDED = "THE GATE IS RECORDED";

const CODE_FILE = /\.(?:mjs|js|py|ts|css|html)$/;
const ASSERTION = /\bassert(?:\.\w+)?\(|\bexpect\(|\bself\.assert\w*\(/;
const NOT_GREEN = new Set(["failure", "cancelled", "timed out", "queued", "running"]);
const ADDED = /^(?:review|check|gate):/;

// The gates a pull request of the job's phase must have behind it: those leaving a phase at or before the one that produces MOD, along the transitions that are not `back`.
function gatesBeforeMerge(workflow) {
  const work = workflow.phases.find((phase) => phase.produces.includes("MOD"));
  if (!work || !workflow.phases.length) return workflow.gates;
  const distance = new Map([[workflow.phases[0].name, 0]]);
  for (let grew = true; grew;) {
    grew = false;
    for (const { from, to, kind } of workflow.transitions) {
      if (kind !== "back" && distance.has(from) && !distance.has(to)) { distance.set(to, distance.get(from) + 1); grew = true; }
    }
  }
  if (!distance.has(work.name)) return workflow.gates;
  return workflow.gates.filter((gate) => distance.has(gate.from) && distance.get(gate.from) <= distance.get(work.name));
}

const assertionLines = (text) => (text ?? "").split(/\r?\n/).map((line) => line.trim()).filter((line) => ASSERTION.test(line));

/**
 * doneCheck(facts: PullRequestFacts, workflow: Workflow, modules: Document[], gates: Document[], job: { kind: "implement" | "refactor" | "fix-bug", modules: string[] }) -> Promise<Finding[]> — every
 * condition of the product's Definition of Done the pull request does not meet, as findings, in the order of the job rules; empty when it holds. `facts` are MOD-repository-hosts'
 * pullRequestFacts; `modules` the module files, as readDocument gives them; `gates` the product's gate records, as readDocument gives them with gateSchema.
 */
export async function doneCheck(facts, workflow, modules, gates, job) {
  const pull = `pull request #${facts.pullRequest.number}`;
  const found = [];
  const add = (rule, what, fix, artifact = pull) => found.push(finding({ artifact, line: 1, kind: "error", rule, what, fix }));
  const commits = facts.commits;
  const refactoring = job.kind === "refactor";

  // CI is green.
  const head = commits.at(-1);
  if (!head || head.ci !== "success") add(GREEN_CI, `CI is not green on the head commit${head ? `: its result is ${head.ci}` : ": the pull request has no commit"}`, "repair the failure and push");
  for (const check of facts.checks.filter((each) => NOT_GREEN.has(each.state))) add(GREEN_CI, `the check ${check.name} is ${check.state}`, "wait for it or repair the failure");

  // The first commit, or for a refactoring job every commit.
  if (refactoring) {
    for (const commit of commits.filter((each) => each.ci !== "success")) add(NO_FAILING_TEST, `CI was not green on commit ${commit.sha.slice(0, 7)}: its result is ${commit.ci}`, "keep every commit green in a refactoring job");
  } else if (!commits.length) {
    add(FAILING_TEST, "the pull request has no commit, so no first commit holds failing tests", "commit the failing tests first");
  } else {
    const first = commits[0];
    const code = first.files.filter((path) => !isTestFile(path));
    if (code.length) add(FAILING_TEST, `the first commit ${first.sha.slice(0, 7)} changes files that are no tests: ${code.join(", ")}`, "commit only the tests first", code[0]);
    if (first.ci !== "failure") add(FAILING_TEST, `CI was not red on the first commit ${first.sha.slice(0, 7)}: its result is ${first.ci}`, "the tests must fail before the code exists");
  }

  // No test's expected result changed (refactoring).
  if (refactoring) {
    for (const { path, change } of facts.files.filter((each) => each.change === "modified" && isTestFile(each.path))) {
      const base = await facts.read(path, "base"), now = await facts.read(path, "head");
      const kept = new Map();
      for (const line of assertionLines(now)) kept.set(line, (kept.get(line) ?? 0) + 1);
      for (const line of assertionLines(base)) {
        if (kept.get(line)) kept.set(line, kept.get(line) - 1);
        else add(NO_RESULT_CHANGED, `the assertion ${line} of ${path} is changed or gone`, "a refactoring changes no expected result: restore the assertion", path);
      }
      const expects = new Map(testDeclarations(path, now ?? "").map((each) => [each.id, each.expect]));
      for (const each of testDeclarations(path, base ?? "")) {
        if (expects.has(each.id) && expects.get(each.id) !== each.expect) add(NO_RESULT_CHANGED, `the expected result of ${each.id} in ${path} is changed`, "restore the declared expectation", path);
      }
    }
  }

  // Every changed code file lies in the folder of one of the job's modules.
  const folders = modules.filter((each) => job.modules.includes(each.fields?.id)).map((each) => String(each.fields.folder ?? "")).filter(Boolean);
  for (const { path } of facts.files) {
    if (!isTestFile(path) && CODE_FILE.test(path) && !folders.some((folder) => path.startsWith(folder))) {
      add(ONLY_ITS_MODULES, `${path} lies in the folder of none of the job's modules (${job.modules.join(", ") || "none"})`, "change only the files of the modules the item names, or add the module to the item", path);
    }
  }

  // Every new test names a requirement and a module.
  for (const { path, change } of facts.files.filter((each) => each.change === "added" || each.change === "modified")) {
    if (!isTestFile(path)) continue;
    const now = testDeclarations(path, (await facts.read(path, "head")) ?? "");
    const old = change === "modified" ? new Set(testDeclarations(path, (await facts.read(path, "base")) ?? "").map((each) => each.id)) : new Set();
    if (change === "added" && !now.length) add(ORIGIN, `the new test file ${path} has no test declaration`, "declare each test with its identifier, the requirements it guards and its module", path);
    for (const each of now.filter((declaration) => !old.has(declaration.id))) {
      if (!each.guards?.length) add(ORIGIN, `the new test ${each.id} names no requirement it guards`, "name what it guards in a line guards:", path);
      if (!each.module) add(ORIGIN, `the new test ${each.id} names no module`, "name the module it exercises in module:", path);
    }
  }

  // Every gate before the merge is recorded, on the texts that hold now; and the conditions the declaration adds.
  const texts = {};
  for (const record of gates) {
    for (const entry of Array.isArray(record.fields?.on) ? record.fields.on : []) {
      const named = /^([^\s@]+)@[0-9a-f]{7,64}$/.exec(String(entry));
      if (named && !(named[1] in texts)) {
        const text = await facts.read(named[1], "head");
        if (typeof text === "string") texts[named[1]] = await blobSha(text);
      }
    }
  }
  const states = gateStates(workflow, gates, texts);
  const stateOf = (name) => states.find((each) => each.gate === name);
  for (const gate of gatesBeforeMerge(workflow)) {
    const state = stateOf(gate.name);
    if (state?.state !== "passed") {
      add(RECORDED, `the gate ${gate.name} is not recorded as passed: ${state?.state ?? "unknown"}${state?.difference ? ` (${state.difference})` : ""}`, "record the decision of the gate's decider on the texts that hold now");
    }
  }
  for (const condition of workflow.done.slice(5).filter((each) => ADDED.test(each))) {
    const [kind, ...rest] = condition.split(":");
    const value = rest.join(":").trim();
    if (kind === "check") {
      if (!facts.checks.some((each) => each.name === value && each.state === "success")) add(MERGED_ONLY, `the condition ${condition} does not hold: the check ${value} has not succeeded`, "make the check succeed");
    } else if (kind === "gate") {
      if (stateOf(value)?.state !== "passed") add(MERGED_ONLY, `the condition ${condition} does not hold: the gate ${value} is ${stateOf(value)?.state ?? "unknown"}`, "record the gate's decision");
    } else {
      const wanted = Number(/^(\d+)/.exec(value)?.[1] ?? 1);
      const approvers = new Set(facts.reviews.filter((each) => each.verdict === "approved").map((each) => each.reviewer));
      if (approvers.size < wanted) add(MERGED_ONLY, `the condition ${condition} does not hold: ${approvers.size} reviewer${approvers.size === 1 ? " has" : "s have"} approved`, "ask for the reviews");
    }
  }
  return found;
}

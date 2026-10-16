// A conversation's work handed over to CI or a Bridge (ITM-495), the refusals and the template — MOD-runtimes' handOverJob(prepared, route, start, host, head, task, target)
// and the GitHub job workflow's template inputs `task` and `endpoint`, as the accepted text of docs/architecture/MOD-runtimes.md states them (Interfaces: handOverJob;
// Data: Agent M's job workflow in a product), for UC-049 4a, 4c: a job that is blocking, does not fit, or has the gate point `before-write` is refused before anything
// is written; so is the CI route of a product without the job workflow; the template declares `task` and `endpoint` beside `job`. The routes themselves, and a start the server
// refuses after the commit, are tests/runtimes-hand-over-routes.test.mjs.
// Run: node --test tests/runtimes-hand-over.test.mjs
//
// Module: MOD-runtimes
// Guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// Guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; UC-049
// Level: unit
//
// Each test states its expected values in its own text; none reads them from a document. The values the module file leaves unstated are those of ITM-495's Outcome and
// sprint 42's selection: the refusal is `RuntimeError("NotStartable", { findings })`, the findings those of `prepared.blocking`, one for each entry of `prepared.notFitting`
// and one for the gate point `before-write`, in that order; each finding made by a rule's name in capitals and a line of at least 1 (MOD-text-tools' `finding` accepts it);
// the CI route is refused with `WorkflowMissing` as `queueJob` refuses it. Readings of this file: a hand-over to the tab's route, one with an empty task, and one to a Bridge
// route without the Bridge's handle are refused with TypeError before anything is written, since the task could not travel. The repository server is the fake host of
// tests/runtimes-hand-over-fixture.mjs, the Bridge a fixture behind the global `fetch`, so that a stray request is seen. Nothing reaches the network. A name the module does
// not provide yet is undefined here, so that each test fails by itself. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { startRecord } from "../src/job-ledger/index.mjs";
import { finding, formatFinding, parseFinding } from "../src/text-tools/index.mjs";
import { BRIDGE_ROUTE, CI_HOSTED, GITHUB_WORKFLOW, GITLAB_WORKFLOW, START, TASK, bridgeNamed, fakeHost, holdsTask, installBridge, preparedOf, restoreFetch } from "./runtimes-hand-over-fixture.mjs";

test.afterEach(restoreFetch);

const NO_ENDPOINT = { endpoint: null, bridge: null };
const BLOCKING = finding({ artifact: "UC-049", line: 3, kind: "error", rule: "NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED", what: "UC-049 is open", fix: "accept UC-049 first" });
const NOT_FITTING = [{ participant: { name: "drafter-a", context: 1000 }, size: 52000, context: 1000 }];

// TST-495001 · level: unit · module: MOD-runtimes
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: the check these tests use to find the task in a record, and a record in which the task is planted — once in its Parameters, once in a destination's part
// input: the check on a record startRecord writes with the task planted in `params`, on one with it planted in a destination's part, and on the record handOverJob commits
// expect: the check finds the planted task in both planted records (true), and in the committed record finds none (false)
test("the check for the task in a record finds a planted task, and finds none in the record a hand-over commits", async () => {
  const inParameters = startRecord({ ...START, task: "with the hand-over", params: { instruction: TASK } }).text;
  const inDestination = startRecord({ ...START, task: "with the hand-over", destinations: [{ participant: "drafter-a", place: "CI", parts: [TASK] }] }).text;
  assert.equal(holdsTask(inParameters), true, "planted in the parameters");
  assert.equal(holdsTask(inDestination), true, "planted in a destination");

  const run = fakeHost({});
  await runtimes.handOverJob(preparedOf(), CI_HOSTED, START, run.host, run.head(), TASK, NO_ENDPOINT);
  assert.equal(holdsTask(run.writes[0].files[0].text), false, "the committed record");
});

// TST-495002 · level: unit · module: MOD-runtimes
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-049 4a
// given: a prepared job with one blocking finding (the precondition of a use case that is open); known positive first — the same job without it, which is handed over
// input: handOverJob on the CI route and on the Bridge route with the blocking job
// expect: rejects with name NotStartable and `findings` holding exactly that finding (deep-equal, one entry); nothing committed, no workflow started, no request to the Bridge
test("handOverJob — a blocking job is refused as NotStartable with its finding, before anything is written", async () => {
  const positive = fakeHost({});
  await runtimes.handOverJob(preparedOf(), CI_HOSTED, START, positive.host, positive.head(), TASK, NO_ENDPOINT);
  assert.equal(positive.writes.length, 1, "known positive: without the finding the job is handed over");

  for (const [route, target] of [[CI_HOSTED, NO_ENDPOINT], [BRIDGE_ROUTE, { endpoint: null, bridge: bridgeNamed("lab-pc") }]]) {
    const run = fakeHost({});
    const lab = installBridge(() => run.writes.length);
    await assert.rejects(runtimes.handOverJob(preparedOf({ blocking: [BLOCKING] }), route, START, run.host, run.head(), TASK, target), (error) => {
      assert.equal(error.name, "NotStartable", route.kind);
      assert.deepEqual(error.findings, [BLOCKING], route.kind);
      return true;
    });
    assert.deepEqual([run.writes.length, run.starts.length, lab.requests.length], [0, 0, 0], `${route.kind}: nothing written, started or handed over`);
  }
});

// TST-495003 · level: unit · module: MOD-runtimes
// guards: NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY; UC-049 3a, 4a
// given: a prepared job that does not fit its participant drafter-a, whose context holds 1000 tokens against a job of 52000
// input: handOverJob on the CI route with it
// expect: rejects with name NotStartable and exactly one finding: kind "error", artifact "write-tests", whose `what` names drafter-a, 1000 and 52000 and which is a valid finding as MOD-text-tools makes one and reads back from its text form; nothing committed, no workflow started
test("handOverJob — a job that does not fit is refused as NotStartable with a finding naming the participant and the sizes, before anything is written", async () => {
  const run = fakeHost({});
  const prepared = preparedOf({ fits: false, notFitting: NOT_FITTING });

  await assert.rejects(runtimes.handOverJob(prepared, CI_HOSTED, START, run.host, run.head(), TASK, NO_ENDPOINT), (error) => {
    assert.equal(error.name, "NotStartable");
    assert.equal(error.findings.length, 1);
    const [found] = error.findings;
    assert.deepEqual([found.kind, found.artifact], ["error", "write-tests"]);
    for (const word of ["drafter-a", "1000", "52000"]) assert.ok(found.what.includes(word), `what names ${word}: ${found.what}`);
    assert.deepEqual(finding(found), found, "a finding as MOD-text-tools makes one");
    assert.deepEqual(parseFinding(formatFinding(found)), found, "it reads back from its text form");
    return true;
  });
  assert.deepEqual([run.writes.length, run.starts.length], [0, 0]);
});

// TST-495004 · level: unit · module: MOD-runtimes
// guards: A JOB STOPS AT EVERY GATE; UC-049 4a
// given: a kind whose gate points are before-write and question; known positive first — a kind whose gate points are before-merge and question, and one with none
// input: handOverJob on the CI route and on the Bridge route with the before-write kind
// expect: the positive kinds are handed over (one commit each); the before-write kind rejects with name NotStartable and exactly one finding: kind "error", artifact "write-tests", whose `what` names "before-write" and which is valid as MOD-text-tools makes a finding; nothing committed, no workflow started, no request to the Bridge
test("handOverJob — a kind with the gate point before-write is refused as NotStartable, one with before-merge is not", async () => {
  for (const gatePoints of [["before-merge", "question"], []]) {
    const positive = fakeHost({});
    await runtimes.handOverJob(preparedOf({}, gatePoints), CI_HOSTED, START, positive.host, positive.head(), TASK, NO_ENDPOINT);
    assert.equal(positive.writes.length, 1, `known positive: gate points ${JSON.stringify(gatePoints)}`);
  }
  for (const [route, target] of [[CI_HOSTED, NO_ENDPOINT], [BRIDGE_ROUTE, { endpoint: null, bridge: bridgeNamed("lab-pc") }]]) {
    const run = fakeHost({});
    const lab = installBridge(() => run.writes.length);
    await assert.rejects(runtimes.handOverJob(preparedOf({}, ["before-write", "question"]), route, START, run.host, run.head(), TASK, target), (error) => {
      assert.equal(error.name, "NotStartable", route.kind);
      assert.equal(error.findings.length, 1, route.kind);
      const [found] = error.findings;
      assert.deepEqual([found.kind, found.artifact], ["error", "write-tests"]);
      assert.ok(found.what.includes("before-write"), `what names the gate point: ${found.what}`);
      assert.deepEqual(finding(found), found);
      return true;
    });
    assert.deepEqual([run.writes.length, run.starts.length, lab.requests.length], [0, 0, 0], `${route.kind}: nothing written, started or handed over`);
  }
});

// TST-495005 · level: unit · module: MOD-runtimes
// guards: A JOB STOPS AT EVERY GATE; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
// given: a prepared job with one blocking finding, one participant it does not fit, and the gate point before-write
// input: handOverJob on the CI route
// expect: NotStartable with three findings in this order: the blocking finding itself, the finding naming the participant (drafter-a), the finding naming before-write; nothing written
test("handOverJob — the findings of a blocking, a not fitting and a before-write job are all given, in that order", async () => {
  const run = fakeHost({});
  const prepared = preparedOf({ blocking: [BLOCKING], fits: false, notFitting: NOT_FITTING }, ["before-write"]);

  await assert.rejects(runtimes.handOverJob(prepared, CI_HOSTED, START, run.host, run.head(), TASK, NO_ENDPOINT), (error) => {
    assert.equal(error.name, "NotStartable");
    assert.equal(error.findings.length, 3);
    assert.deepEqual(error.findings[0], BLOCKING);
    assert.ok(error.findings[1].what.includes("drafter-a"), error.findings[1].what);
    assert.ok(error.findings[2].what.includes("before-write"), error.findings[2].what);
    return true;
  });
  assert.equal(run.writes.length, 0);
});

// TST-495006 · level: unit · module: MOD-runtimes
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-049 4c
// given: a product on GitHub (1) and on GitLab (2) whose default branch holds no Agent M job workflow; known positive first — the same product with its workflow
// input: handOverJob on the CI route with the head read
// expect: with the workflow, one commit and one start; without it, rejects with name WorkflowMissing and `files` [".github/workflows/agent-m-jobs.yml"] (1) or [".gitlab/agent-m-jobs.yml"] (2); nothing committed and no workflow started
test("handOverJob — the CI route of a product without the job workflow is refused as WorkflowMissing, naming its file, before anything is written", async () => {
  for (const [server, file] of [["github", GITHUB_WORKFLOW], ["gitlab", GITLAB_WORKFLOW]]) {
    const positive = fakeHost({ server });
    await runtimes.handOverJob(preparedOf(), CI_HOSTED, START, positive.host, positive.head(), TASK, NO_ENDPOINT);
    assert.deepEqual([positive.writes.length, positive.starts.length], [1, 1], `${server}: known positive`);

    const run = fakeHost({ server, workflow: false });
    await assert.rejects(runtimes.handOverJob(preparedOf(), CI_HOSTED, START, run.host, run.head(), TASK, NO_ENDPOINT), (error) => {
      assert.equal(error.name, "WorkflowMissing", server);
      assert.deepEqual(error.files, [file], server);
      return true;
    });
    assert.deepEqual([run.writes.length, run.starts.length], [0, 0], `${server}: nothing written or started`);
  }
});

// TST-495007 · level: unit · module: MOD-runtimes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a product whose default branch moved on since the head was read; the Bridge
// input: handOverJob on the CI route and on the Bridge route with the stale head
// expect: rejects with the host's Moved, naming the new head; nothing committed, no workflow started, no request to the Bridge
test("handOverJob — a moved head is refused as the host names it, with nothing written, started or handed over", async () => {
  for (const [route, target] of [[CI_HOSTED, NO_ENDPOINT], [BRIDGE_ROUTE, { endpoint: null, bridge: bridgeNamed("lab-pc") }]]) {
    const run = fakeHost({});
    const lab = installBridge(() => run.writes.length);
    const stale = run.head();
    run.moveOn();
    await assert.rejects(runtimes.handOverJob(preparedOf(), route, START, run.host, stale, TASK, target), (error) => error.name === "Moved" && error.head === run.head(), route.kind);
    assert.deepEqual([run.writes.length, run.starts.length, lab.requests.length], [0, 0, 0], `${route.kind}: nothing written, started or handed over`);
  }
});

// TST-495008 · level: unit · module: MOD-runtimes
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; UC-049 4a
// given: a hand-over that could not carry its task: to the tab's route; with an empty task; to a Bridge route without the Bridge's handle; known positive first — the same call to the CI route with a task
// input: handOverJob with each
// expect: the positive is handed over; each of the three rejects with a TypeError; nothing committed, no workflow started, no request to the Bridge
test("handOverJob — a hand-over that cannot carry its task is refused with a TypeError before anything is written", async () => {
  const positive = fakeHost({});
  await runtimes.handOverJob(preparedOf(), CI_HOSTED, START, positive.host, positive.head(), TASK, NO_ENDPOINT);
  assert.equal(positive.writes.length, 1, "known positive");

  for (const [what, route, task] of [["the tab's route", { kind: "tab" }, TASK], ["an empty task", CI_HOSTED, "  "], ["a Bridge route without the Bridge", BRIDGE_ROUTE, TASK]]) {
    const run = fakeHost({});
    const lab = installBridge(() => run.writes.length);
    await assert.rejects(runtimes.handOverJob(preparedOf(), route, START, run.host, run.head(), task, NO_ENDPOINT), TypeError, what);
    assert.deepEqual([run.writes.length, run.starts.length, lab.requests.length], [0, 0, 0], `${what}: nothing written, started or handed over`);
  }
});

// ---------------------------------------------------------------- the GitHub template

// The inputs of the GitHub file's workflow_dispatch, in the order they stand: { name, required }.
function dispatchInputs(text) {
  const block = /\n  workflow_dispatch:\n    inputs:\n((?:      .*\n|\n)*)/.exec(text)?.[1] ?? "";
  return block.split(/\n(?=      [A-Za-z_]+:\n)/).filter((each) => /\S/.test(each)).map((each) => ({
    name: /^\s*([A-Za-z_]+):/.exec(each)[1], required: /required: (true|false)/.exec(each)?.[1] }));
}

// TST-495009 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; UC-049 4a
// given: jobWorkflowFiles for GitHub, for an instance alice/agent-m at a commit, with a token secret and a key secret
// input: the inputs the file declares under workflow_dispatch
// expect: three inputs in this order: job (required true), task (required false), endpoint (required false)
test("jobWorkflowFiles — the GitHub template's start by hand takes the job first, then the task and the endpoint, both not required", () => {
  const [file] = runtimes.jobWorkflowFiles("github", { repository: "alice/agent-m", commit: "0123456789abcdef0123456789abcdef01234567" },
    { token: "AGENT_M_TOKEN", keys: ["CLAUDE_KEY"] }, []);
  assert.equal(file.path, GITHUB_WORKFLOW);
  assert.deepEqual(dispatchInputs(file.text), [{ name: "job", required: "true" }, { name: "task", required: "false" }, { name: "endpoint", required: "false" }]);
});

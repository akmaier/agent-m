// The endpoint's test a followed job's run left in its log — MOD-prompt-bar's followJob({ id, address, host, store, show }), as the accepted text of
// docs/architecture/MOD-prompt-bar.md states it (Interfaces, followJob): "`show` given … for a run on CI, the answer the run left in its log between `--- answer of <id> ---`
// and `--- end of the answer of <id> ---` (MOD-workflow-entries), and the endpoint's test it left between `--- test of <id> ---` and `--- end of the test of <id> ---`, as the
// JSON that block holds, `null` where the log holds none or its line is not JSON, both read from its run's log, read once with `listCiRuns` and `ciRunLog` when its end is
// read." For UC-003 step 4, 5, 5a.
// Run: node --test tests/prompt-bar-follow-test.test.mjs
//
// Module: MOD-prompt-bar
// Guards: UC-003; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// Level: unit
//
// Each test states its expected values in its own text; none reads them from a document. The repository server is a fake host in memory that holds one job record, already
// ended on CI with its run's address as its log, and the log of that run; it counts every listCiRuns and ciRunLog. The log's lines carry the time stamp GitHub puts before each
// line. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { appendToRecord, startRecord } from "../src/job-ledger/index.mjs";
import { followJob } from "../src/prompt-bar/index.mjs";

const ID = "JOB-20261109-1000-abcd";
const RUN = "https://github.com/alice/product/actions/runs/77";
const REPOSITORY = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };
const stamp = (line) => `2026-11-09T10:01:00.0000000Z ${line}`;

// A record of a hand-over to GitHub Actions that has ended done, its log the run RUN.
function recordText() {
  const { path, text } = startRecord({ id: ID, kind: "converse", worksOn: [REPOSITORY.web], participant: "nvidia", model: "example-model", route: "ci hosted", run: null, retries: null,
    startedBy: "alice", start: new Date("2026-11-09T10:00:00Z"), agentM: { version: "x", commit: "a".repeat(40) }, inputs: [], limit: 2, task: "with the hand-over", conversation: null,
    destinations: [{ participant: "nvidia", place: "NVIDIA, USA", parts: [] }], params: {} });
  return { path, text: appendToRecord(text, { part: "end", at: new Date("2026-11-09T10:02:00Z"), state: "done", results: [], draft: null, rounds: [], usage: null, cost: null, reason: null, log: RUN }) };
}

function hostWithLog(log) {
  const { path, text } = recordText();
  const calls = { runs: 0, logs: 0 };
  return { calls, host: {
    async repositoryInfo() { return { defaultBranch: "main" }; },
    async readSnapshot() { return { repository: REPOSITORY, commit: "c".repeat(40), paths: [path], blob: () => "b".repeat(40), async read(at) { return at === path ? text : null; } }; },
    async listCiRuns() { calls.runs += 1; return [{ id: 77, url: RUN, state: "succeeded", started: null }]; },
    async ciRunLog() { calls.logs += 1; return log; },
  } };
}

// The view followJob shows once the record's end and its run's log are read.
async function followed(log) {
  const { host, calls } = hostWithLog(log);
  const views = [];
  const follower = followJob({ id: ID, address: REPOSITORY.web, host, store: null, show: (view) => views.push(view) });
  for (let at = 0; at < 400 && !views.some((view) => view.end); at += 1) await new Promise((resolve) => setImmediate(resolve));
  follower.stop();
  return { view: views.find((view) => view.end), calls };
}

const ANSWER = [stamp(`--- answer of ${ID} ---`), stamp("ok"), stamp(`--- end of the answer of ${ID} ---`)];
const TESTED = { works: true, model: "example-model", tools: true, toolMessage: null };

// TST-2026313201 · level: unit · module: MOD-prompt-bar
// guards: UC-003
// given: a job ended done on CI whose run's log holds the answer "ok" and, between `--- test of <id> ---` and `--- end of the test of <id> ---`, the line {"works":true,"model":"example-model","tools":true,"toolMessage":null}, each line with GitHub's time stamp
// input: followJob for that job
// expect: the view at the end holds the answer "ok" (the known positive of the log read) and the test { works: true, model: "example-model", tools: true, toolMessage: null }; the run's log was listed and read once each
test("followJob gives the endpoint's test the run left in its log, as its JSON, from the same read as the answer", async () => {
  const { view, calls } = await followed(["Agent M's agent", ...ANSWER, stamp(`--- test of ${ID} ---`), stamp(JSON.stringify(TESTED)), stamp(`--- end of the test of ${ID} ---`), ""].join("\n"));
  assert.equal(view.answer, "ok", "known positive: the answer is read from the log");
  assert.deepEqual(view.test, TESTED);
  assert.deepEqual(calls, { runs: 1, logs: 1 });
});

// TST-2026313202 · level: unit · module: MOD-prompt-bar
// guards: UC-003
// given: the job of TST-2026313201; its run's log holds the answer and no test block; and the same log with a test block whose line is `not json {`
// input: followJob for each
// expect: the answer is "ok" each time; the test is null each time
test("followJob gives null for the test where the log holds none or its line is not JSON", async () => {
  for (const block of [[], [stamp(`--- test of ${ID} ---`), stamp("not json {"), stamp(`--- end of the test of ${ID} ---`)]]) {
    const { view } = await followed([...ANSWER, ...block, ""].join("\n"));
    assert.equal(view.answer, "ok");
    assert.equal(view.test, null, JSON.stringify(block));
  }
});

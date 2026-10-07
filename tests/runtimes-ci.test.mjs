// Queueing a job on the CI route (ITM-253) — MOD-runtimes' queueJob(host, start, route, head, bridge?), as
// docs/architecture/MOD-runtimes.md states it, for the CI route alone: the job's start record (MOD-job-ledger's
// startRecord) committed at its path, on the head that was read, in one commit — the host's commitFiles, on the
// branch its repositoryInfo names, with expectedHead the head given —, as the person's commit, whose push starts the
// product's job workflow; refused with WorkflowMissing, naming the job workflow's file, while the head read does not
// hold it; and the host's failures — Moved, TokenRefused, RateLimited, and the rest it names — propagated unchanged.
// Nothing is written when either refusal happens.
// Run: node --test tests/runtimes-ci.test.mjs
//
// Module: MOD-runtimes
// Guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-013
// Level: unit
//
// Not tested here, since ITM-253 leaves them out (MOD-runtimes.md, Outcome): the tab's and the Bridge's routes of
// queueJob, a job of a run (start.run, MOD-job-ledger's appendToRecord), and Route, RouteOffer, ResourceNeed,
// routesFor, runOnTab, bridgeAgentDriver, resumeJob, liveState, jobLog, cancelJob, retryJob, jobWorkflowFiles and
// routeStrategies (UC-010, UC-011, UC-036).
//
// The repository server is replaced by a fixture: a fake host that keeps to MOD-repository-hosts' interface as
// docs/architecture/MOD-repository-hosts.md states it — one repository in memory, whose default branch is `trunk`
// (deliberately not `main`, so a test fails if the code assumed that name) —; repositoryInfo, readSnapshot and
// commitFiles as the interface describes them, a commit made only if the branch still stands at the expected head,
// else `Moved { head }`, and nothing written on any failure (MOD-repository-hosts.md, Interfaces: commitFiles —
// "Nothing is written on any failure"). Nothing reaches the network. Each test states its input and its expected
// result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { queueJob } from "../src/runtimes/index.mjs";
import { startRecord } from "../src/job-ledger/index.mjs";

const GITHUB_WORKFLOW = ".github/workflows/agent-m-jobs.yml";
const GITLAB_WORKFLOW = ".gitlab/agent-m-jobs.yml";

const REPO = {
  github: { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" },
  gitlab: { server: "gitlab", origin: "https://gitlab.example", path: "alice/product", web: "https://gitlab.example/alice/product" },
};

// A job's start (MOD-job-ledger's JobStart), queued on the CI route, hosted.
const START = {
  id: "JOB-20261007-0930-abcd", kind: "write-tests", worksOn: ["ITM-253"], participant: "drafter-a",
  model: "example-model", route: "ci hosted", run: null, retries: null, startedBy: "alice",
  start: new Date("2026-10-07T09:30:00Z"), agentM: { version: "2026.10.0", commit: "abc1234" },
  inputs: ["SPEC.md@deadbeef"], limit: 5,
  destinations: [{ participant: "drafter-a", place: "CI", parts: ["the tests"] }], params: { requirements: ["ITM-253"] },
};
const CI_HOSTED = { kind: "ci", runner: "hosted" };

// A failure as MOD-repository-hosts names it: an error with the failure's name and its fields.
const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name, ...fields });

// The fake host (MOD-repository-hosts' interface): one repository in memory, default branch `trunk`, head `c0`.
// files: { path: text } beside the job workflow, which is present unless `workflow: false`.
function fakeHost({ server = "github", files = {}, workflow = true } = {}) {
  const workflowPath = server === "github" ? GITHUB_WORKFLOW : GITLAB_WORKFLOW;
  const tree = new Map(Object.entries(files));
  if (workflow) tree.set(workflowPath, "name: agent-m-jobs\n");
  const reads = [], writes = [];
  let head = "c0", made = 0;
  return {
    reads, writes, head: () => head,
    // Another writer's commit, elsewhere, before this job is queued: only the head moves on.
    moveOn: () => { head = `moved${++made}`; },
    host: {
      async repositoryInfo() {
        return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" };
      },
      async readSnapshot(ref) {
        reads.push(ref);
        return { repository: REPO[server], ref, commit: head, paths: [...tree.keys()],
          read: async (p) => tree.get(p) ?? null, blob: (p) => (tree.has(p) ? `blob-${p}` : null) };
      },
      async commitFiles(change) {
        // MOD-repository-hosts.md, Interfaces (commitFiles): "Nothing is written on any failure" — checked, and
        // refused, before anything is recorded.
        if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", { head });
        writes.push(structuredClone(change));
        head = `c${++made}`;
        for (const f of change.files) tree.set(f.path, f.text);
        return { commit: head, url: `${REPO[server].web}/commit/${head}` };
      },
    },
  };
}

// given: a product on GitHub whose default branch `trunk` holds its job workflow; a job's start
// input: queueJob(host, START, { kind: "ci", runner: "hosted" }, the head read)
// expect: the snapshot read at that head; one commit on `trunk`, on the head read, holding exactly startRecord(START)'s
//         file, with a message naming the job; the result { path: startRecord(START).path, commit: the commit
//         commitFiles returned }
test("queueJob — the CI route commits the job's start record at its path, on the head read, in one commit", async () => {
  const fake = fakeHost({});
  const head = fake.head();
  const { path, text } = startRecord(START);

  const result = await queueJob(fake.host, START, CI_HOSTED, head);

  assert.deepEqual(fake.reads, [head], "reads the snapshot at the head given");
  assert.equal(fake.writes.length, 1, "one commit");
  const [change] = fake.writes;
  assert.equal(change.branch, "trunk", "on the default branch the host's repositoryInfo names");
  assert.equal(change.expectedHead, head, "on the head that was read");
  assert.deepEqual(change.files, [{ path, text }], "the start record alone, at its path, as startRecord gives it");
  assert.equal(change.message, "Queue job JOB-20261007-0930-abcd: write-tests", "a message naming the job");
  assert.deepEqual(result, { path, commit: fake.head() }, "the path and the commit commitFiles returned");
});

// given: a product whose default branch moved on since the head given was read
// input: queueJob(host, START, { kind: "ci", runner: "hosted" }, the stale head)
// expect: rejects with the host's Moved, naming the new head; nothing committed
test("queueJob — the CI route refuses a moved head, with nothing written", async () => {
  const fake = fakeHost({});
  const staleHead = fake.head();
  fake.moveOn();

  await assert.rejects(queueJob(fake.host, START, CI_HOSTED, staleHead), (error) => {
    assert.equal(error.name, "Moved", "the host's own failure, by name");
    assert.equal(error.head, fake.head(), "Moved names the head the branch stands at now");
    return true;
  });
  assert.equal(fake.writes.length, 0, "nothing written");
});

// given: a product on GitHub (1), and on GitLab (2), whose default branch holds no Agent M job workflow
// input: queueJob(host, START, { kind: "ci", runner: "hosted" }, the head read)
// expect: rejects with WorkflowMissing, naming the file of that server; nothing committed
test("queueJob — the CI route refuses WorkflowMissing, naming the job workflow's file, for a product without it", async () => {
  for (const [server, workflowPath] of [["github", GITHUB_WORKFLOW], ["gitlab", GITLAB_WORKFLOW]]) {
    const fake = fakeHost({ server, workflow: false });
    const head = fake.head();

    await assert.rejects(queueJob(fake.host, START, CI_HOSTED, head), (error) => {
      assert.equal(error.name, "WorkflowMissing", `${server}: named WorkflowMissing`);
      assert.deepEqual(error.files, [workflowPath], `${server}: names ${workflowPath}`);
      return true;
    });
    assert.equal(fake.writes.length, 0, `${server}: nothing written`);
  }
});

// given: a product whose host refuses the commit — a token refused (1), a rate limit used up (2)
// input: queueJob(host, START, { kind: "ci", runner: "hosted" }, the head read)
// expect: rejects with the same failure the host named, unchanged; nothing committed
test("queueJob — the CI route's failures are the host's, by name", async () => {
  const cases = [
    ["TokenRefused", { tokenName: "AGENT_M_TOKEN", renewal: "https://github.com/settings/tokens" }],
    ["RateLimited", { limit: "account", resetsAt: null }],
  ];
  for (const [name, fields] of cases) {
    const fake = fakeHost({});
    const head = fake.head();
    fake.host.commitFiles = async () => { throw failure(name, fields); };

    await assert.rejects(queueJob(fake.host, START, CI_HOSTED, head), (error) => {
      assert.equal(error.name, name, `named ${name}`);
      for (const [key, value] of Object.entries(fields)) assert.equal(error[key], value, `${name}.${key}`);
      return true;
    });
    assert.equal(fake.writes.length, 0, `${name}: nothing written`);
  }
});

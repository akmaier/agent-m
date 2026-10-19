// MOD-runtimes' jobTrail (ITM-1022), as docs/architecture/MOD-runtimes.md states it: "`jobTrail(record: JobRecord, product: { host: Host }) -> Promise<{ branch: string, commits: HistoryEntry[], pullRequest: PullRequest | null,
// runs: CiRun[] }>` — what a job left in its product: the commits of the branch named after the job (`readHistory`, `changes: false`), the pull request of that branch (`listPullRequests`), and the CI runs of its commits
// (`listCiRuns`). A branch that does not exist gives no commits. Crosses the network; fails as the host fails (UC-036)."
// Run: node --test tests/runtimes-job-trail.test.mjs
//
// Module: MOD-runtimes
// Guards: UC-036; ONE DASHBOARD SHOWS EVERY JOB
// Level: unit
//
// The host is a fake of MOD-repository-hosts' Host (repositoryInfo, readHistory, listPullRequests, listCiRuns) that keeps to its interface: a history newest first that honours `limit`, `NotFound` for a ref the repository lacks. Nothing
// reaches the network. Where the texts leave a reading open, the tests state the one they take, and the pull request names it:
//   - The branch named after the job is named by the job's identifier.
//   - The commits of the job are those of the branch's history dated at or after the job's start (the record's `start`), as liveState dates what a job wrote after its cancel; the history is asked with `changes: false`.
//   - The pull request is the newest one of the branch (any state); the CI runs are those of the branch whose commit is among the job's commits, so that a run of another commit of the branch is not the job's.
//   - A branch the host does not hold (NotFound) gives no commits and no runs; its pull request, if the host lists one, stays. Every other failure of the host is passed on.
// Each test states its input and its expected result before it runs. The counter-proofs are run as mutations and recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { jobTrail } from "../src/runtimes/index.mjs";

const ID = "JOB-20261016-1000-ffff";
const SHA = (n) => String(n).repeat(40);
const record = { id: ID, start: new Date("2026-10-16T10:00:00Z") };
const entry = (n, date) => ({ commit: SHA(n), parents: [], author: { account: "dev", name: "Dev" }, date, message: `commit ${n}`, changes: [] });
const BRANCH_HISTORY = [entry(3, "2026-10-16T12:00:00Z"), entry(2, "2026-10-16T11:00:00Z"), entry(1, "2026-10-16T10:30:00Z"), entry(9, "2026-10-15T09:00:00Z"), entry(8, "2026-10-14T09:00:00Z")];
const run = (id, commit, state = "success") => ({ id, workflow: "tests.yml", commit, event: "push", state, url: `https://github.com/alice/product/actions/runs/${id}`, started: null, ended: null });
const pull = (number, state) => ({ number, title: `Job ${number}`, branch: ID, base: "main", head: SHA(3), state, draft: false, url: `https://github.com/alice/product/pull/${number}`, opened: "2026-10-16T12:05:00Z", merged: null, closed: null, body: "" });
const named = (name) => Object.assign(new Error(name), { name });

function fakeHost({ histories = { [ID]: BRANCH_HISTORY }, pulls = [], runs = [], failing = null } = {}) {
  const calls = [];
  return { calls, host: {
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readHistory(path, options = {}) {
      calls.push(["readHistory", path, options]);
      if (failing === "history") throw named("Unreachable");
      const held = histories[options.ref];
      if (!held) throw named("NotFound");
      return held.slice(0, options.limit ?? held.length);
    },
    async listPullRequests(filter = {}) { calls.push(["listPullRequests", filter]); return pulls.filter((each) => !filter.branch || each.branch === filter.branch); },
    async listCiRuns(filter = {}) { calls.push(["listCiRuns", filter]); return runs; },
  } };
}

// TST-1022001 · level: unit · module: MOD-runtimes
// guards: UC-036; ONE DASHBOARD SHOWS EVERY JOB
// given: a branch named after the job with three commits dated after the job's start and two older ones; an open pull request #4 and a merged #3 of the branch; CI runs of the branch for two of the job's commits and one for a commit that is not the job's
// input: jobTrail(record, { host })
// expect: { branch: ID, commits: the three commits, newest first, pullRequest: #4 (the newest), runs: the two runs of the job's commits }; the history was asked of the branch with changes: false
test("TST-1022001 jobTrail gives the commits of the job's branch since its start, the branch's pull request and the CI runs of those commits", async () => {
  const { host, calls } = fakeHost({ pulls: [pull(3, "merged"), pull(4, "open")], runs: [run("r1", SHA(3)), run("r2", SHA(1), "failure"), run("r3", SHA(9))] });
  const trail = await jobTrail(record, { host });
  assert.equal(trail.branch, ID);
  assert.deepEqual(trail.commits.map((each) => each.commit), [SHA(3), SHA(2), SHA(1)]);
  assert.equal(trail.pullRequest.number, 4);
  assert.deepEqual(trail.runs.map((each) => each.id), ["r1", "r2"]);
  assert.equal(calls.some(([name, , options]) => name === "readHistory" && options.ref === ID && options.changes === false), true);
});

// TST-1022002 · level: unit · module: MOD-runtimes
// guards: UC-036
// given: a repository that holds no branch named after the job and lists no pull request for it
// input: jobTrail(record, { host })
// expect: { branch: ID, commits: [], pullRequest: null, runs: [] }, and no CI run was asked for (a branch that does not exist gives no commits)
test("TST-1022002 a branch that does not exist gives no commits, no pull request and no runs", async () => {
  const { host, calls } = fakeHost({ histories: {} });
  assert.deepEqual(await jobTrail(record, { host }), { branch: ID, commits: [], pullRequest: null, runs: [] });
  assert.equal(calls.some(([name]) => name === "listCiRuns"), false);
});

// TST-1022003 · level: unit · module: MOD-runtimes
// guards: UC-036; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a host whose history cannot be read (Unreachable)
// input: jobTrail(record, { host })
// expect: rejects with the host's failure, Unreachable, and not an empty trail
test("TST-1022003 a failure of the host is passed on, never an empty trail", async () => {
  const { host } = fakeHost({ failing: "history" });
  await assert.rejects(jobTrail(record, { host }), (error) => error.name === "Unreachable");
});

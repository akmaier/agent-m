// The writer `branch-and-pull-request` of MOD-runtimes' `routeStrategies` (ITM-567), as the accepted text of docs/architecture/MOD-runtimes.md states it: "`routeStrategies` —
// `Partial<Strategies>` with the writer `branch-and-pull-request`. reads the branch named after the job and its commits. With a host of a server's API, it opens the pull request
// if the coding participant has not — into the default branch the host's `repositoryInfo` names —, gives it a description that names the job, the plan step or backlog item, its
// modules, the requirements its new tests guard — read with MOD-test-document's `testDeclarations` — and the provenance lines, and returns its address. With a local host — a
// Bridge's clone, which makes no server requests and throws `NotSupported` for them — it opens nothing and returns the branch and the pull request the agent reports. [...] It
// never merges [...]. Fails with `NoBranch`, `NoCommits`, and what the host names." With UC-024 steps 7 and 11 and UC-049 4a.
// Run: node --test tests/runtimes-pull-request.test.mjs
//
// Module: MOD-runtimes
// Guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-024; UC-049
// Level: unit
//
// The readings of this file, each with the sentence it reads (ITM-567, sprint team1/54):
//   - The branch is the `branch` of the participant's answer (`result.draft.branch`), read through `context.product.host`'s `readSnapshot`. A branch the host does not hold
//     (`NotFound`) is `NoBranch`; one whose head commit is the job's snapshot commit has no commit beyond it: `NoCommits`. Any other failure of the host is thrown as it is.
//   - New tests are the declarations, read with `testDeclarations`, in the files whose blob on the branch differs from that of the job's snapshot, whose identifier that snapshot's
//     version of the file does not declare ("whose identifier that snapshot's version of the file does not declare").
//   - The host is a server's where `listPullRequests` answers, a local one where it throws `NotSupported`. A pull request of the branch that stands open or merged is the one
//     returned; the writer opens none beside it. `openPullRequest` failing with what the host names (`NotSupported` included) is thrown, not taken for a local host.
//   - The description is lines: `Job:`, `Kind:`, `Plan step:` and `Backlog item:` (those the job's parameters `steps` and `items` name), `Modules:` (the distinct `MOD-` modules the new tests
//     declare), `Requirements guarded by the new tests:` (their `guards`, once each), both in the order the new tests are found: the changed files by path, the declarations of a file in order, then a blank line and the provenance lines of MOD-job-runner's `provenanceLines`.
//     It holds none of the job's instruction.
// Each test states its expected values in its own text; none reads them from a document. The repository server is the fake host of this file, which records every call; nothing
// reaches the network (a fetch that fails the test replaces the real one). A name the module does not provide yet is undefined here, so that each test fails by itself. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";

const realFetch = globalThis.fetch;
test.beforeEach(() => { globalThis.fetch = async () => { throw new Error("the writer must reach the server only through the host"); }; });
test.afterEach(() => { globalThis.fetch = realFetch; });

const failure = (name, fields = {}) => Object.assign(new Error(name), { name, ...fields });
const JOB = "JOB-20261017-1000-abcd";
const SNAPSHOT_COMMIT = "c0";
const INSTRUCTION = "PLANTED-INSTRUCTION-91C2 add the export";

const declared = (id, module, guards) => [`// ${id} · level: unit · module: ${module}`, `// guards: ${guards}`, "// given: g", "// input: i", "// expect: e", "test(\"x\", () => {});", ""].join("\n");

// A tree is a map of path to text; its blob of a path is the text itself behind a prefix, `null` for a path it lacks.
function treeOf(commit, files) {
  return { commit, paths: Object.keys(files).sort(), read: async (path) => files[path] ?? null, blob: (path) => (path in files ? `blob:${files[path]}` : null) };
}

const BASE_FILES = {
  "tests/old.test.mjs": declared("TST-001", "MOD-alpha", "OLD RULE"),
  "tests/same.test.mjs": declared("TST-004", "MOD-alpha", "UNTOUCHED RULE"),
  "src/alpha/index.mjs": "export const a = 1;\n",
};
const BRANCH_FILES = {
  ...BASE_FILES,
  "tests/old.test.mjs": `${declared("TST-001", "MOD-alpha", "OLD RULE")}\n${declared("TST-002", "MOD-alpha", "NEW RULE ONE")}`,
  "tests/new.test.mjs": `${declared("TST-003", "MOD-beta", "NEW RULE TWO; NEW RULE ONE")}\n${declared("TST-005", "system", "NEW RULE THREE")}`,
  "src/alpha/index.mjs": "export const a = 2;\n",
};

// The fake server: `branches` by name; `pulls` the pull requests of the repository; `local` makes every server request throw NotSupported, as a Bridge's clone does.
function fakeHost({ branches = { [JOB]: treeOf("c1", BRANCH_FILES) }, pulls = [], local = false, openFails = null } = {}) {
  const calls = [];
  const server = (name, answer) => async (...args) => {
    calls.push([name, ...args]);
    if (local) throw failure("NotSupported", { what: name });
    return answer(...args);
  };
  return {
    calls,
    host: {
      async readSnapshot(ref) {
        calls.push(["readSnapshot", ref]);
        if (!(ref in branches)) throw failure("NotFound", { what: ref });
        return branches[ref];
      },
      listPullRequests: server("listPullRequests", ({ branch }) => pulls.filter((pull) => pull.branch === branch)),
      repositoryInfo: server("repositoryInfo", () => ({ defaultBranch: "develop", visibility: "private", canWrite: true, archived: false, description: "" })),
      openPullRequest: server("openPullRequest", (request) => {
        if (openFails) throw openFails;
        return { number: 7, url: "https://github.com/acme/product/pull/7", branch: request.branch, base: request.base, state: "open" };
      }),
      async mergePullRequest(...args) { calls.push(["mergePullRequest", ...args]); return { commit: "merged" }; },
      async commitFiles(...args) { calls.push(["commitFiles", ...args]); return { commit: "made" }; },
    },
  };
}

const contextOf = (host, params = { items: ["ITM-9"], steps: ["ITM-10"], instruction: INSTRUCTION }) => ({
  kind: { name: "implement" }, params, product: { address: "https://github.com/acme/product", snapshot: treeOf(SNAPSHOT_COMMIT, BASE_FILES), host },
  instance: { snapshot: treeOf("i0", {}), host: null }, connect: async () => host, participants: [], places: { sources: {}, mailbox: null }, gates: [], person: "alice",
  now: new Date("2026-10-17T10:00:00Z"), agentM: { version: "2026.10.0", commit: "a".repeat(40) }, jobId: JOB,
});
const resultOf = (draft = { branch: JOB, commits: ["c1"], pullRequest: "" }) => ({ draft, raw: null, drafter: { name: "coder-a", model: "model-m" }, rounds: [{}, {}], remaining: [],
  forPerson: [], stepFindings: [], classes: null, stoppedBecause: "passed", gate: null, usage: [], written: null });
const writer = () => runtimes.routeStrategies?.writers?.["branch-and-pull-request"];
const write = (host, draft, params) => writer()(resultOf(draft), contextOf(host, params));

// TST-567001 · level: unit · module: MOD-runtimes
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; UC-024 step 11
// given: a server host whose default branch is `develop`, no pull request of the branch; the job's snapshot at c0 declares TST-001 (OLD RULE) in tests/old.test.mjs and TST-004 (UNTOUCHED RULE) in tests/same.test.mjs; the branch is at c1 and, besides src/alpha/index.mjs, changes tests/old.test.mjs to declare TST-001 and TST-002 (NEW RULE ONE, module MOD-alpha), adds tests/new.test.mjs declaring TST-003 (NEW RULE TWO and NEW RULE ONE, module MOD-beta) and TST-005 (NEW RULE THREE, module system); the job JOB-20261017-1000-abcd of kind implement names the backlog item ITM-9 and the plan step ITM-10, and its instruction holds PLANTED-INSTRUCTION-91C2
// input: the writer `branch-and-pull-request` of routeStrategies with the answer { branch: the job's id, commits: ["c1"], pullRequest: "" }, the drafter coder-a with model model-m, after two rounds
// expect: one openPullRequest, with branch = the job's id, base "develop" and a title that names the job; its body holds the lines "Job: JOB-20261017-1000-abcd", "Kind: implement", "Plan step: ITM-10", "Backlog item: ITM-9", "Modules: MOD-beta, MOD-alpha", "Requirements guarded by the new tests: NEW RULE TWO; NEW RULE ONE; NEW RULE THREE", and, after a blank line, exactly the six provenance lines ("Agent-M-Version: 2026.10.0, commit aaaa…", "Agent-M-Job: JOB-20261017-1000-abcd", "Agent-M-Kind: implement", "Agent-M-Participant: coder-a", "Agent-M-Model: model-m", "Agent-M-Rounds: 2"), and none of OLD RULE, UNTOUCHED RULE, MOD-system or PLANTED-INSTRUCTION-91C2; the outcome's pullRequest is "https://github.com/acme/product/pull/7", its commits ["c1"] and its files the three paths the branch changes, sorted
test("the writer opens the pull request into the default branch with the job, the work, the modules, the new tests' requirements and the provenance lines", async () => {
  assert.equal(typeof writer(), "function", "failure node: routeStrategies offers the writer branch-and-pull-request");
  const server = fakeHost();
  const outcome = await write(server.host);
  const opened = server.calls.filter(([name]) => name === "openPullRequest");
  assert.equal(opened.length, 1, "one pull request opened");
  const request = opened[0][1];
  assert.equal(request.branch, JOB);
  assert.equal(request.base, "develop");
  assert.ok(request.title.includes(JOB), `the title names the job: ${request.title}`);
  const lines = request.body.split("\n");
  for (const line of [`Job: ${JOB}`, "Kind: implement", "Plan step: ITM-10", "Backlog item: ITM-9", "Modules: MOD-beta, MOD-alpha",
    "Requirements guarded by the new tests: NEW RULE TWO; NEW RULE ONE; NEW RULE THREE"]) assert.ok(lines.includes(line), `the description holds the line ${line}`);
  const trailers = [`Agent-M-Version: 2026.10.0, commit ${"a".repeat(40)}`, `Agent-M-Job: ${JOB}`, "Agent-M-Kind: implement", "Agent-M-Participant: coder-a", "Agent-M-Model: model-m", "Agent-M-Rounds: 2"];
  assert.deepEqual(lines.slice(-trailers.length), trailers, "the provenance lines close the description");
  assert.equal(lines[lines.length - trailers.length - 1], "", "a blank line stands before them");
  for (const word of ["OLD RULE", "UNTOUCHED RULE", "MOD-system", "PLANTED-INSTRUCTION-91C2"]) assert.ok(!request.body.includes(word), `the description holds no ${word}`);
  assert.equal(outcome.pullRequest, "https://github.com/acme/product/pull/7");
  assert.deepEqual(outcome.commits, ["c1"]);
  assert.deepEqual(outcome.files, ["src/alpha/index.mjs", "tests/new.test.mjs", "tests/old.test.mjs"]);
});

// TST-567002 · level: unit · module: MOD-runtimes
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; UC-024 step 11
// given: the server host of TST-567001, known positive first; then the same host with an open pull request #5 of the branch (url https://github.com/acme/product/pull/5), and one with a merged pull request #4 of it
// input: the writer with the same answer on each host
// expect: with no pull request the writer opens one (positive); with the open one, and again with the merged one, it opens none and returns the existing pull request's url as `pullRequest`
test("the writer opens no pull request where the branch has one", async () => {
  const positive = fakeHost();
  await write(positive.host);
  assert.equal(positive.calls.filter(([name]) => name === "openPullRequest").length, 1, "known positive: with none it opens one");

  for (const [state, number] of [["open", 5], ["merged", 4]]) {
    const server = fakeHost({ pulls: [{ number, url: `https://github.com/acme/product/pull/${number}`, branch: JOB, base: "develop", state }] });
    const outcome = await write(server.host);
    assert.equal(server.calls.filter(([name]) => name === "openPullRequest").length, 0, `${state}: none opened`);
    assert.equal(outcome.pullRequest, `https://github.com/acme/product/pull/${number}`, `${state}: the existing one is returned`);
  }
});

// TST-567003 · level: unit · module: MOD-runtimes
// guards: UC-049 4a; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a local host, a Bridge's clone: it holds the branch at c1, and every server request (listPullRequests, repositoryInfo, openPullRequest) throws NotSupported
// input: the writer with the answer { branch: the job's id, commits: ["c1"], pullRequest: "https://github.com/acme/product/pull/3" }
// expect: no openPullRequest call; the outcome's pullRequest is "https://github.com/acme/product/pull/3", its commits ["c1"]; and the same host with an answer that reports no pull request ("") gives pullRequest null
test("the writer on a local host opens nothing and returns the branch and the pull request the agent reports", async () => {
  const server = fakeHost({ local: true });
  const outcome = await write(server.host, { branch: JOB, commits: ["c1"], pullRequest: "https://github.com/acme/product/pull/3" });
  assert.equal(server.calls.filter(([name]) => name === "openPullRequest").length, 0, "nothing opened");
  assert.equal(outcome.pullRequest, "https://github.com/acme/product/pull/3");
  assert.deepEqual(outcome.commits, ["c1"]);
  const silent = await write(fakeHost({ local: true }).host, { branch: JOB, commits: ["c1"], pullRequest: "" });
  assert.equal(silent.pullRequest, null, "no pull request reported");
});

// TST-567004 · level: unit · module: MOD-runtimes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-024 step 11
// given: known positive first — the server host holding the branch; then a host that holds no branch of that name (readSnapshot throws NotFound), a server one and a local one; and a host whose readSnapshot throws RateLimited
// input: the writer with the answer naming the branch, and with an answer naming no branch (branch "")
// expect: the positive resolves; a branch the host does not hold rejects with name NoBranch whose message names the branch, on the server host and on the local one, with no pull request opened; an answer without a branch rejects NoBranch; RateLimited rejects as RateLimited, unchanged
test("the writer fails with NoBranch for a branch the host does not hold, and with the host's own failure otherwise", async () => {
  await write(fakeHost().host);

  for (const local of [false, true]) {
    const server = fakeHost({ branches: {}, local });
    await assert.rejects(write(server.host), (error) => error.name === "NoBranch" && error.message.includes(JOB), `local: ${local}`);
    assert.equal(server.calls.filter(([name]) => name === "openPullRequest").length, 0, "nothing opened");
  }
  await assert.rejects(write(fakeHost().host, { branch: "", commits: [], pullRequest: "" }), (error) => error.name === "NoBranch");

  const limited = fakeHost();
  limited.host.readSnapshot = async () => { throw failure("RateLimited", { limit: "account" }); };
  await assert.rejects(write(limited.host), (error) => error.name === "RateLimited");
});

// TST-567005 · level: unit · module: MOD-runtimes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-024 step 11
// given: known positive first — the branch at c1; then the branch at c0, the commit of the job's snapshot, which has no commit beyond it
// input: the writer with the answer naming the branch, on a server host and on a local one
// expect: the positive resolves; the branch at c0 rejects with name NoCommits, naming the branch, on both hosts, with no pull request opened
test("the writer fails with NoCommits for a branch with no commit beyond the job's snapshot", async () => {
  await write(fakeHost().host);

  for (const local of [false, true]) {
    const server = fakeHost({ branches: { [JOB]: treeOf(SNAPSHOT_COMMIT, BASE_FILES) }, local });
    await assert.rejects(write(server.host), (error) => error.name === "NoCommits" && error.message.includes(JOB), `local: ${local}`);
    assert.equal(server.calls.filter(([name]) => name === "openPullRequest").length, 0, "nothing opened");
  }
});

// TST-567006 · level: unit · module: MOD-runtimes
// guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
// given: the server host with a merge spy, in three states: no pull request, an open one, and a local host
// input: the writer on each
// expect: on each host, mergePullRequest and commitFiles are called zero times; and a pull request the server refuses to open (openPullRequest throws NotSupported, as a server's adapter that is not built does) rejects with name NotSupported, not as a local host that returns the agent's report
test("the writer never merges and never commits, and a pull request the server cannot open is a failure", async () => {
  const hosts = [fakeHost(), fakeHost({ pulls: [{ number: 5, url: "https://github.com/acme/product/pull/5", branch: JOB, base: "develop", state: "open" }] }), fakeHost({ local: true })];
  for (const server of hosts) {
    await write(server.host);
    assert.deepEqual(server.calls.filter(([name]) => name === "mergePullRequest" || name === "commitFiles"), []);
  }
  const refusing = fakeHost({ openFails: failure("NotSupported", { what: "a pull request" }) });
  await assert.rejects(write(refusing.host), (error) => error.name === "NotSupported");
});

// MOD-bridge-jobs — the relay of a running job, as docs/architecture/MOD-bridge-jobs.md (Data: The relay; The merge; What the agent is told of the relay; Each push is
// forwarded at once) states it: "Before the agent starts, the Bridge makes two empty folders beside the working clone: `jobs/<id>.requests/`, which the agent may
// write, and `jobs/<id>.answers/`, which it may read and only the Bridge writes [...] The agent asks by writing one request as a file `<name>.json` into the
// requests, `<name>` of letters, digits, `-` and `_`. Every two seconds, while its process runs, the Bridge takes each request it has not answered whose file is a
// regular file with one link and whose text stayed the same since the look before [...], reads it without following a link, carries it out, and writes the
// answer as `<name>.json` into the answers, written beside and renamed into place"; the calls `fetch`, `read`, `open`, `log` and `merge`; "`branch` names a branch
// the agent has made or moved in the outbox in this job; any other is refused. The answer is one JSON object, `{ "call", "done": boolean, "reason": string | null,
// "state", "log", "branches" }` [...] no answer holds anything of a request's file but the fields above [...] every token the repository tokens' file holds is
// replaced in it by `***` [...] For a product the Bridge holds no token for, `fetch` is carried out with the computer's own login, and every other call is
// answered with its forwarding state alone and `NotSupported`'s words [...] Once the job is cancelled or the Bridge quit, no request is carried out [...] a server
// that cannot be reached is an answer not done, never a failure of the job"; and "The Bridge merges only where all of these hold, and otherwise answers which of
// them does not" — the four conditions — "It then merges with `mergePullRequest` on that head".
// Run: node --test tests/bridge-jobs-relay.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: NO MODEL READS A CREDENTIAL; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; A JOB STOPS AT EVERY GATE; AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; A CANCELLED JOB WRITES NOTHING MORE; UC-024; UC-034
// Level: component
//
// Deterministic, no network: the origin is a bare repository in a temporary folder, reached through git's own `url.<path>.insteadOf` as the computer's login would
// reach github.com; the Bridge's clone, the job's working clone, its outbox and its relay's folders are made by workfolders.mjs; the agent is the test, whose git
// runs with an environment of its own. The server's API is a fixture host of MOD-repository-hosts' signatures that records its calls, except in TST-2026111609,
// which reaches the product through hostOf, without a token. Each test states its input and its expected result before it runs (given / input / expect). Readings
// the text leaves open, which the tests state:
//   - The relay is `relayOf({ job, address, clone, outbox, folders, host, open, merges, gates, signal, every })`: `look()` is one look — the outbox forwarded,
//     then the requests —, `during(work)` looks every `every` milliseconds (two seconds by default) while `work` runs, and `last()` is the forward after the
//     agent's answer. `open(branch)` is the writer's call; `merges` the job's parameter, `gates` its context's.
//   - A refusal of a request names no text of its file; a refused branch's answer has no state. A request whose call needs the server is answered after one
//     `listPullRequests` of the branch, so that a host without a token answers NotSupported before the writer is called.
//   - `refused` in a state is the forward the origin refused, `{ commit, said }`, `said` git's words.
//   - The runs a `log` may name are those of the `read` answers of this job.

import assert from "node:assert/strict";
import { linkSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { keepRepositoryTokens, useRepositoryTokens } from "../src/bridge-jobs/index.mjs";
import { relayOf, relayText } from "../src/bridge-jobs/relay.mjs";
import { cloneOrFetch, forwarding, hostOf, makeOutbox, relayFolders, workingClone } from "../src/bridge-jobs/workfolders.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";
Object.assign(process.env, { GIT_AUTHOR_NAME: "Seed", GIT_AUTHOR_EMAIL: "seed@example.org", GIT_COMMITTER_NAME: "Seed", GIT_COMMITTER_EMAIL: "seed@example.org" });

const JOB = "JOB-20261116-0900-abcd";
const TOKEN = "github_pat_RELAYFIXTURE0123456789";

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function agentGit(root, cwd, ...args) {
  const env = { PATH: process.env.PATH, HOME: root, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_TERMINAL_PROMPT: "0",
    GIT_AUTHOR_NAME: "Agent", GIT_AUTHOR_EMAIL: "agent@example.org", GIT_COMMITTER_NAME: "Agent", GIT_COMMITTER_EMAIL: "agent@example.org" };
  const r = spawnSync("git", args, { cwd, env, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`the agent's git ${args.join(" ")} failed: ${r.stderr}`);
  return r.stdout.trim();
}

// The environment entries a test adds — the address mapping, the include of the tokens — taken away after it.
function restoredEnvironment(t) {
  const before = Object.fromEntries(Object.entries(process.env).filter(([key]) => /^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+)$/.test(key)));
  t.after(() => {
    for (const key of Object.keys(process.env)) if (/^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+)$/.test(key)) delete process.env[key];
    Object.assign(process.env, before);
  });
}

// The fixture server's API: what each call answers, changed by the test as it goes; every call recorded.
function fixtureHost() {
  const answers = { pulls: [], facts: {}, runs: [], logs: {}, fails: {} };
  const calls = [];
  const call = (name, ...args) => { calls.push([name, ...args]); if (answers.fails[name]) throw answers.fails[name]; };
  const host = {
    listPullRequests: async (filter) => { call("listPullRequests", filter); return answers.pulls.filter((pull) => pull.branch === filter.branch); },
    pullRequestFacts: async (number) => { call("pullRequestFacts", number); return answers.facts[number]; },
    listCiRuns: async (filter) => { call("listCiRuns", filter); return answers.runs; },
    ciRunLog: async (id) => { call("ciRunLog", id); return answers.logs[id] ?? null; },
    mergePullRequest: async (number, head) => { call("mergePullRequest", number, head); return { commit: "f".repeat(40) }; },
  };
  return { answers, calls, host, named: (name) => calls.filter(([each]) => each === name) };
}
const hostError = (name, message, fields = {}) => Object.assign(new Error(message), { name, ...fields });

// The Bridge's computer: an origin reached as `address`, whose pre-receive hook refuses every push while the file `refuse` exists; the Bridge's clone of it; the job's
// working clone, outbox and relay folders; a relay over the fixture host, unless `host` is given.
async function world(t, { address = "https://github.com/acme/product", host = null, merges = null, gates = [] } = {}) {
  restoredEnvironment(t);
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-relay-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const origin = join(root, "product.git"), seed = join(root, "seed"), refuse = join(root, "refuse");
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  writeFileSync(join(origin, "hooks", "pre-receive"), `#!/bin/sh\n[ -e '${refuse}' ] && { echo 'the origin refuses this push' >&2; exit 1; }\nexit 0\n`, { mode: 0o755 });
  git(root, "clone", "-q", origin, seed);
  writeFileSync(join(seed, "README.md"), "product\n");
  git(seed, "add", "README.md");
  git(seed, "commit", "-q", "-m", "first");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  const count = Number(process.env.GIT_CONFIG_COUNT ?? "0");
  Object.assign(process.env, { [`GIT_CONFIG_KEY_${count}`]: `url.${origin}.insteadOf`, [`GIT_CONFIG_VALUE_${count}`]: address, GIT_CONFIG_COUNT: String(count + 1) });
  const clone = await cloneOrFetch(address, join(root, "work", "products", "product"));
  const working = await workingClone(clone, join(root, "work", "jobs", JOB));
  const outbox = await makeOutbox(working);
  const folders = await relayFolders(working);
  const fixture = fixtureHost();
  const opened = [];
  const controller = new AbortController();
  const relay = relayOf({ job: JOB, address, clone, outbox, folders, host: host ?? fixture.host, merges, gates, signal: controller.signal, every: 50,
    open: async (branch) => { opened.push(branch); fixture.answers.pulls.push(pullRequest({ number: 3, branch, head: git(clone, "rev-parse", `refs/heads/${branch}`) })); } });
  const push = (path, branch = JOB) => {
    if (agentGit(root, working, "branch", "--list", branch) === "") agentGit(root, working, "checkout", "-q", "-b", branch);
    writeFileSync(join(working, path), `${path}\n`);
    agentGit(root, working, "add", path);
    agentGit(root, working, "commit", "-q", "-m", path);
    agentGit(root, working, "push", "-q", "origin", branch);
    return git(working, "rev-parse", "HEAD");
  };
  const ask = (name, request) => writeFileSync(join(folders.requests, name), typeof request === "string" ? request : JSON.stringify(request));
  const answerText = (name) => (existsSync(join(folders.answers, name)) ? readFileSync(join(folders.answers, name), "utf8") : null);
  const answer = (name) => { const text = answerText(name); return text === null ? null : JSON.parse(text); };
  // A request is taken at the look after the one that first saw its text.
  const twice = async () => { await relay.look(); await relay.look(); };
  const seedCommit = (path) => { writeFileSync(join(seed, path), `${path}\n`); git(seed, "add", path); git(seed, "commit", "-q", "-m", path); git(seed, "push", "-q", "origin", "HEAD:refs/heads/main"); return git(seed, "rev-parse", "HEAD"); };
  return { root, origin, seed, clone, working, outbox, folders, relay, fixture, opened, controller, push, ask, answer, answerText, twice, seedCommit, refuse,
    originRef: (ref) => spawnSync("git", ["--git-dir", origin, "rev-parse", "--verify", "--quiet", ref], { encoding: "utf8" }).stdout.trim() || null };
}
const pullRequest = ({ number, branch, head, state = "open", draft = false }) => ({ number, title: `${JOB}: implement`, branch, base: "main", head, mergeCommit: null, state, draft,
  url: `https://github.com/acme/product/pull/${number}`, opened: "2026-11-16T09:00:00Z", merged: null, closed: null, body: "" });
const factsOf = (pull, checks) => ({ pullRequest: pull, commits: [{ sha: pull.head, message: "tests only", files: ["test.txt"], ci: "failure" }], files: [], reviews: [], checks, read: async () => null });

// TST-2026111606 · level: component · module: MOD-bridge-jobs
// guards: NO MODEL READS A CREDENTIAL; A CANCELLED JOB WRITES NOTHING MORE
// given: a job whose agent pushed its branch into the outbox; its relay's folders
// input: a read request r1.json, then looks; r1.json rewritten after its answer; r2.json whose text changes between two looks; r3.json a link to a request outside the folders; r4.json a request with a second link; a request named `bad name.json`; after the job is cancelled, r5.json
// expect: r1 is answered at the second look and not at the first, and its rewrite gets no second answer; r2 is answered only after its text stood still for a look; r3, r4 and `bad name.json` are never answered; the answers folder holds nothing but r1.json and r2.json — no file written beside; after the cancel r5 is not answered and the host is asked nothing more
test("TST-2026111606: a request is taken when it is a regular file with one link whose text stood still since the look before, and answered once, whole", async (t) => {
  const w = await world(t);
  w.push("test.txt");
  w.ask("r1.json", { call: "read", branch: JOB });
  await w.relay.look();
  assert.equal(w.answer("r1.json"), null, "not at the look that first saw it");
  await w.relay.look();
  assert.equal(w.answer("r1.json")?.done, true, "known positive: answered at the next look");
  const first = w.answerText("r1.json");
  w.ask("r1.json", { call: "read", branch: JOB, again: true });
  await w.twice();
  assert.equal(w.answerText("r1.json"), first, "a request is answered once");

  w.ask("r2.json", '{"call": "re');
  await w.relay.look();
  w.ask("r2.json", { call: "read", branch: JOB });
  await w.relay.look();
  assert.equal(w.answer("r2.json"), null, "a text that changed since the look before is taken at a later look");
  await w.relay.look();
  assert.equal(w.answer("r2.json")?.call, "read");

  const outside = join(w.root, "outside.json"), linked = join(w.root, "linked.json");
  writeFileSync(outside, JSON.stringify({ call: "read", branch: JOB }));
  symlinkSync(outside, join(w.folders.requests, "r3.json"));
  writeFileSync(linked, JSON.stringify({ call: "read", branch: JOB }));
  linkSync(linked, join(w.folders.requests, "r4.json"));
  w.ask("bad name.json", { call: "read", branch: JOB });
  await w.twice();
  await w.twice();
  assert.deepEqual(readdirSync(w.folders.answers).sort(), ["r1.json", "r2.json"], "no link, no second link, no other name is answered; nothing is left beside");

  const asked = w.fixture.calls.length;
  w.controller.abort();
  w.ask("r5.json", { call: "read", branch: JOB });
  await w.twice();
  assert.equal(w.answer("r5.json"), null, "after the cancel no request is carried out");
  assert.equal(w.fixture.calls.length, asked, "and the host is asked nothing more");
});

// TST-2026111607 · level: component · module: MOD-bridge-jobs
// guards: NO MODEL READS A CREDENTIAL; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; UC-024
// given: the Bridge's tokens' file holding a token for the product, included by useRepositoryTokens; the agent pushed its tests-only commit c1 on its branch; the fixture host lists one CI run of the branch, whose log holds the token
// input: read, log of that run, log of a run no read named, open, read, then a read of main (not moved), of a branch the agent did not make, a request that is not JSON, one whose call is none of the five, one that carries a planted field; then read while the server cannot be reached; then fetch after the origin gained a commit
// expect: the first read is done with the state { branch, outbox c1, origin c1, refused null, pullRequest null, commits null, checks null, runs [the run] } and log and branches null; the log answer holds the log with the token replaced by *** and not the token; the unnamed run is refused without the host being asked; open calls the writer with the branch and answers the pull request #3 with its commits without their files and its head's checks; every refused request has done false, a reason, and no state, the host not asked, and no answer holds the planted text; the unreachable server is an answer not done naming Unreachable, with the forwarding state; fetch is done, its branches the origin's main at the new commit and the job's branch, and the agent's git fetch then reads that commit
test("TST-2026111607: the relay answers read, log, open and fetch with the answer's fields alone, and no answer carries a token", async (t) => {
  const w = await world(t);
  const data = join(w.root, "data");
  await keepRepositoryTokens(data, [{ repository: "https://github.com/acme/product", token: TOKEN }]);
  useRepositoryTokens(data);
  const c1 = w.push("test.txt");
  const run = { id: "41", workflow: "agent-m tests", commit: c1, event: "push", state: "failure", url: "https://github.com/acme/product/actions/runs/41", started: null, ended: null };
  w.fixture.answers.runs = [run];
  w.fixture.answers.logs["41"] = `FAIL test.txt\nAuthorization: Bearer ${TOKEN}\n`;

  w.ask("read.json", { call: "read", branch: JOB });
  await w.twice();
  assert.deepEqual(w.answer("read.json"), { call: "read", done: true, reason: null, log: null, branches: null,
    state: { branch: JOB, outbox: c1, origin: c1, refused: null, pullRequest: null, commits: null, checks: null, runs: [run] } });
  assert.equal(w.originRef(`refs/heads/${JOB}`), c1, "the push reached the origin before any answer of the agent");

  w.ask("log.json", { call: "log", run: "41" });
  w.ask("unnamed.json", { call: "log", run: "42" });
  await w.twice();
  const log = w.answer("log.json");
  assert.equal(log.done, true);
  assert.equal(log.log, "FAIL test.txt\nAuthorization: Bearer ***\n", "the token is replaced by ***");
  assert.equal(w.answerText("log.json").includes(TOKEN), false, "no answer carries the token");
  assert.deepEqual([w.answer("unnamed.json").done, w.answer("unnamed.json").state], [false, null]);
  assert.deepEqual(w.fixture.named("ciRunLog").map(([, id]) => id), ["41"], "the run no read named is not asked for");

  w.fixture.answers.facts[3] = factsOf(pullRequest({ number: 3, branch: JOB, head: c1 }), [{ name: "agent-m done", state: "failure", url: "https://github.com/acme/product/runs/9" }]);
  w.ask("open.json", { call: "open", branch: JOB });
  await w.twice();
  assert.deepEqual(w.opened, [JOB], "open goes through the writer, with the branch");
  const opened = w.answer("open.json");
  assert.equal(opened.done, true);
  assert.equal(opened.state.pullRequest.number, 3);
  assert.deepEqual(opened.state.commits, [{ sha: c1, message: "tests only", ci: "failure" }], "the commits without their files");
  assert.deepEqual(opened.state.checks, [{ name: "agent-m done", state: "failure", url: "https://github.com/acme/product/runs/9" }]);
  assert.equal(opened.state.runs, null);

  const asked = w.fixture.calls.length;
  w.ask("main.json", { call: "read", branch: "main" });
  w.ask("other.json", { call: "merge", branch: "someone-else" });
  w.ask("notjson.json", "read the branch, please");
  w.ask("nocall.json", { call: "delete", branch: JOB });
  w.ask("planted.json", { call: "read", branch: 7, note: "PLANTED-TEXT-77" });
  await w.twice();
  for (const name of ["main.json", "other.json", "notjson.json", "nocall.json", "planted.json"]) {
    const refused = w.answer(name);
    assert.equal(refused.done, false, name);
    assert.equal(typeof refused.reason, "string", name);
    assert.equal(refused.state, null, `${name}: a refused request has no state`);
    assert.equal(w.answerText(name).includes("PLANTED-TEXT-77") || w.answerText(name).includes("someone-else") || w.answerText(name).includes("please"), false, `${name}: nothing of the request's file`);
  }
  assert.deepEqual([w.answer("notjson.json").call, w.answer("nocall.json").call], [null, null], "a call that is none of the five is not echoed");
  assert.equal(w.fixture.calls.length, asked, "the host is not asked for a refused request");

  w.fixture.answers.fails.listPullRequests = hostError("Unreachable", "github.com could not be reached");
  w.ask("down.json", { call: "read", branch: JOB });
  await w.twice();
  const down = w.answer("down.json");
  assert.equal(down.done, false);
  assert.match(down.reason, /Unreachable/);
  assert.deepEqual([down.state.outbox, down.state.origin, down.state.pullRequest], [c1, c1, null], "the forwarding state, which the Bridge keeps");
  delete w.fixture.answers.fails.listPullRequests;

  const moved = w.seedCommit("NEWS.md");
  w.ask("fetch.json", { call: "fetch" });
  await w.twice();
  assert.deepEqual(w.answer("fetch.json"), { call: "fetch", done: true, reason: null, state: null, log: null, branches: { main: moved, [JOB]: c1 } });
  agentGit(w.root, w.working, "fetch", "-q");
  assert.equal(git(w.working, "rev-parse", "refs/remotes/origin/main"), moved, "after the fetch the agent's own git fetch reads the origin's new commit");
});

// TST-2026111608 · level: component · module: MOD-bridge-jobs
// guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; A JOB STOPS AT EVERY GATE; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; UC-024; UC-034
// given: the agent's branch at c2 on the origin, its pull request #3 open and no draft at head c2, the check agent-m done succeeded on that head
// input: merge requests, each with one condition not holding — the job's parameters say merges: person; the pull request a draft; no pull request; agent-m done failed; agent-m done missing; a gate at before-merge not passed (and one at before-write not passed beside it); a push of the agent the origin refused, so that the outbox holds c3 and the origin c2 —; then with every condition holding
// expect: each of the first is answered not done, its reason naming the condition that does not hold, and mergePullRequest is never called; with every condition holding, mergePullRequest is called once, with #3 and the head c2, and the answer is done
test("TST-2026111608: the relay merges only where the job leaves the merge to the agent, the pull request is open, nothing waits to be forwarded, the gates before the merge are passed and agent-m done succeeded on the head", async (t) => {
  const cases = [
    { name: "person", setup: { merges: "person" }, reason: /merges: person/ },
    { name: "draft", draft: true, reason: /draft/ },
    { name: "none", none: true, reason: /no pull request|not open/ },
    { name: "failed", check: "failure", reason: /agent-m done/ },
    { name: "missing", check: null, reason: /agent-m done/ },
    { name: "gate", setup: { gates: [{ name: "Implementation → Integration", point: "before-merge", passed: false }, { name: "Design → Implementation", point: "before-write", passed: false }] },
      reason: /Implementation → Integration/, not: /Design → Implementation/ },
    { name: "waiting", waiting: true, reason: /forward/ },
  ];
  for (const each of cases) {
    await t.test(each.name, async (t) => {
      const w = await world(t, each.setup ?? {});
      w.push("test.txt");
      const c2 = w.push("code.txt");
      await w.relay.look();
      const pull = pullRequest({ number: 3, branch: JOB, head: c2, draft: Boolean(each.draft) });
      if (!each.none) w.fixture.answers.pulls.push(pull);
      const checks = each.check === null ? [] : [{ name: "agent-m done", state: each.check ?? "success", url: "https://github.com/acme/product/runs/10" }];
      w.fixture.answers.facts[3] = factsOf(pull, checks);
      if (each.waiting) { writeFileSync(w.refuse, ""); w.push("more.txt"); }
      w.ask("merge.json", { call: "merge", branch: JOB });
      await w.twice();
      const answer = w.answer("merge.json");
      assert.equal(answer.done, false, `${each.name}: not merged`);
      assert.match(answer.reason, each.reason, `${each.name}: names the condition`);
      if (each.not) assert.doesNotMatch(answer.reason, each.not, "a gate at another point does not hold the merge");
      assert.deepEqual(w.fixture.named("mergePullRequest"), [], `${each.name}: mergePullRequest is never called`);
    });
  }
  await t.test("every condition holds", async (t) => {
    const w = await world(t);
    w.push("test.txt");
    const c2 = w.push("code.txt");
    await w.relay.look();
    const pull = pullRequest({ number: 3, branch: JOB, head: c2 });
    w.fixture.answers.pulls.push(pull);
    w.fixture.answers.facts[3] = factsOf(pull, [{ name: "agent-m done", state: "success", url: "https://github.com/acme/product/runs/10" }]);
    w.ask("merge.json", { call: "merge", branch: JOB });
    await w.twice();
    assert.equal(w.answer("merge.json").done, true);
    assert.deepEqual(w.fixture.named("mergePullRequest"), [["mergePullRequest", 3, c2]], "merged once, on the head the check succeeded on");
  });
});

// TST-2026111609 · level: component · module: MOD-bridge-jobs
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; NO MODEL READS A CREDENTIAL
// given: a product the Bridge holds no token for, its host hostOf(address, clone); the agent pushed c1 on its branch
// input: read, open and merge requests; then fetch after the origin gained a commit
// expect: read, open and merge are answered not done with NotSupported's words and the forwarding state alone — outbox c1, origin c1, pullRequest null —, and the writer is not called; fetch is done with the computer's own login, its branches naming the origin's new commit; counter-proof: the branch reached the origin with that same login
test("TST-2026111609: for a product the Bridge holds no token for, the relay fetches with the computer's own login and answers every other call with its forwarding state and NotSupported", async (t) => {
  const address = "https://github.com/acme/tokenless";
  const w = await world(t, { address });
  const host = await hostOf(address, w.clone);
  const relay = relayOf({ job: JOB, address, clone: w.clone, outbox: w.outbox, folders: w.folders, host, merges: null, gates: [], signal: new AbortController().signal,
    open: async (branch) => { w.opened.push(branch); } });
  const c1 = w.push("test.txt");
  for (const call of ["read", "open", "merge"]) w.ask(`${call}.json`, { call, branch: JOB });
  await relay.look();
  await relay.look();
  assert.equal(w.originRef(`refs/heads/${JOB}`), c1, "counter-proof: the branch reached the origin with the computer's own login");
  for (const call of ["read", "open", "merge"]) {
    const answer = w.answer(`${call}.json`);
    assert.equal(answer.done, false, call);
    assert.match(answer.reason, /NotSupported/, `${call}: NotSupported's words`);
    assert.deepEqual([answer.state.outbox, answer.state.origin, answer.state.refused, answer.state.pullRequest], [c1, c1, null, null], `${call}: the forwarding state alone`);
  }
  assert.deepEqual(w.opened, [], "the writer is not called");
  const moved = w.seedCommit("NEWS.md");
  w.ask("fetch.json", { call: "fetch" });
  await relay.look();
  await relay.look();
  assert.equal(w.answer("fetch.json").done, true);
  assert.equal(w.answer("fetch.json").branches.main, moved);
});

// TST-2026111610 · level: component · module: MOD-bridge-jobs
// guards: AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; A CANCELLED JOB WRITES NOTHING MORE
// given: the relay looking every 50 ms while a fixture agent's work runs
// input: during(work), where the work pushes its tests-only commit into the outbox and waits until the origin holds it; then last(); then, with the origin refusing, a push and last(); then, after the cancel, a push, during and last
// expect: the work ends — the push reached the origin before the agent's answer —; last() forwards nothing new and succeeds; with the origin refusing, last() fails naming the branch and what git said; after the cancel nothing is forwarded and last() does nothing
test("TST-2026111610: while the agent works its pushes reach the origin, the forward after its answer fails the job only for a branch still refused, and nothing is forwarded after a cancel", async (t) => {
  const w = await world(t);
  const c1 = await w.relay.during(async () => {
    const commit = w.push("test.txt");
    for (const end = Date.now() + 10000; Date.now() < end && w.originRef(`refs/heads/${JOB}`) !== commit;) await new Promise((resolve) => setTimeout(resolve, 20));
    return commit;
  });
  assert.equal(w.originRef(`refs/heads/${JOB}`), c1, "the push reached the origin while the agent worked");
  await w.relay.last();

  writeFileSync(w.refuse, "");
  w.push("code.txt");
  await assert.rejects(w.relay.last(), (error) => error.message.includes(`the Bridge could not push the agent's branch ${JOB}`) && error.message.includes("the origin refuses this push"));
  rmSync(w.refuse);

  w.controller.abort();
  w.push("after.txt");
  await w.relay.during(() => new Promise((resolve) => setTimeout(resolve, 200)));
  await w.relay.last();
  assert.equal(w.originRef(`refs/heads/${JOB}`), c1, "after the cancel nothing more is forwarded");
});

// TST-2026111611 · level: unit · module: MOD-bridge-jobs
// guards: ONE DEFINITION, THREE DRIVERS; NO MODEL READS A CREDENTIAL; A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
// given: relay.md, the one text of what the agent is told of the relay
// input: relayText({ folders, branch, merges }) for a job the agent merges and for one whose parameters say merges: person
// expect: each names the requests and answers folders and the branch, says that pushes go to the outbox, which the Bridge forwards, that the agent holds no token, that git fetch and git pull read the origin as the Bridge last fetched it and to ask fetch before them, how each of the five calls is written, and that a branch whose pull request read shows is the job's work so far; the first says the agent merges, the second that a person does; no named place is left unfilled; counter-proof: the two texts differ only where they say who merges
test("TST-2026111611: relay.md tells the agent where its pushes go, how it asks, and who merges", async () => {
  const folders = { requests: "/work/claude/jobs/JOB-1.requests", answers: "/work/claude/jobs/JOB-1.answers" };
  const agent = await relayText({ folders, branch: JOB, merges: null });
  const person = await relayText({ folders, branch: JOB, merges: "person" });
  for (const text of [agent, person]) {
    const folded = text.replace(/\s+/g, " ");
    for (const part of [folders.requests, folders.answers, `\`${JOB}\``, "outbox", "no token", "as the Bridge last fetched them", "`fetch`", "`read`", "`open`", "`log`", "`merge`",
      "is the job's work so far"]) assert.ok(folded.includes(part), `the text says ${part}`);
    assert.equal(/\{\{[a-z-]+\}\}/.test(text), false, "every named place is filled");
  }
  assert.match(agent.replace(/\s+/g, " "), /Who merges the pull request: you\./);
  assert.match(person.replace(/\s+/g, " "), /Who merges the pull request: a person\./);
  assert.equal(agent.replace(/(Who merges the pull request:\s+)you\./, "$1a person."), person, "counter-proof: they differ only in who merges");
});

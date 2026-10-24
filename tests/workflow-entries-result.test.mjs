// The run's result between the agent's machine and the writing machine of a product's job workflow on GitHub — MOD-workflow-entries' result.mjs, as
// docs/architecture/MOD-workflow-entries.md states it (Parts: result.mjs; Interfaces: leaveResult, writeResult): the checkout's pushes land in a bare repository
// on the agent's machine, the result travels as a git bundle, and the writing machine refuses a result that changes a workflow file or holds a key of the run,
// and otherwise pushes it, picking the default branch's commits onto a branch that moved meanwhile.
// Run: node --test tests/workflow-entries-result.test.mjs
//
// Module: MOD-workflow-entries
// Guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// Level: unit
//
// Deterministic, no network: the product is a temporary bare origin, the agent's checkout and the writing machine's checkout are clones of it. Each test states its
// expected values in its own text.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const loaded = await import("../src/workflow-entries/result.mjs").catch((error) => ({ error }));
const { prepareResult, packResult, readResult, checkResult, writeBranches, pendingPullRequest } = loaded;

const KEY = "nvapi-FIXTURE-KEY-0123456789abcdef";
const TASK = "Fix the loan due date for Ana";

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
const quiet = (dir) => { for (const [key, value] of [["gc.auto", "0"], ["maintenance.auto", "false"], ["receive.autogc", "false"], ["user.name", "Alice"], ["user.email", "alice@example.org"]]) git(dir, "config", key, value); };
function write(root, files) {
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), body);
  }
}
function commit(dir, files, message) {
  write(dir, files);
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", message);
  return git(dir, "rev-parse", "HEAD");
}

// A product: a bare origin whose main holds a record and a README; the agent's checkout and the writing machine's checkout, each a clone at that commit.
function product(t) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-result-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const origin = join(root, "product.git"), seed = join(root, "seed");
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  quiet(seed);
  commit(seed, { "README.md": "# Thesis tool\n", "docs/jobs/JOB-1.md": "# JOB-1\n" }, "first");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  const agent = join(root, "agent"), writer = join(root, "writer");
  for (const dir of [agent, writer]) { git(root, "clone", "-q", origin, dir); quiet(dir); }
  return { root, origin, seed, agent, writer, resultDir: join(root, "result") };
}
// The agent's machine at work: what it commits on main and on a branch of its own, pushed as the checkout pushes.
function agentWork(p, { main = { "docs/jobs/JOB-1.md": "# JOB-1\n\n## Taken\n" }, branch = { "src/loan.mjs": "export const due = 14;\n" }, message = "work" } = {}) {
  const kept = prepareResult(p.agent, p.resultDir, "main");
  const taken = commit(p.agent, main, "take JOB-1 (run)");
  git(p.agent, "push", "-q", "origin", "HEAD:refs/heads/main");
  git(p.agent, "checkout", "-q", "-b", "job-1");
  const work = commit(p.agent, branch, message);
  git(p.agent, "push", "-q", "origin", "job-1");
  return { kept, taken, work };
}

// TST-0124001 · level: unit · module: MOD-workflow-entries
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: a result whose commits change a file under .github/workflows/, another whose commit changes .gitlab-ci.yml, and — the known positive — one that changes src/ only
// input: checkResult(each, [the key], null)
// expect: the first two are refused, the reason naming the commit and the workflow file; the third is not refused (null)
test("checkResult — a result that changes a workflow file is refused, one that does not is not", () => {
  assert.ok(checkResult, `result.mjs: ${loaded.error?.message}`);
  const result = { refs: [{ ref: "refs/heads/job-1", commit: "c".repeat(40) }], pullRequests: [], ends: [] };
  const of = (paths) => ({ result, commits: [{ commit: "c".repeat(40), message: "work", paths, texts: paths.map(() => Buffer.from("text")) }] });
  assert.match(checkResult(of(["src/a.mjs", ".github/workflows/agent-m-jobs.yml"]), [KEY], null), /cccccccccccc changes the workflow file \.github\/workflows\/agent-m-jobs\.yml/);
  assert.match(checkResult(of([".gitlab-ci.yml"]), [KEY], null), /\.gitlab-ci\.yml/);
  assert.equal(checkResult(of(["src/a.mjs", ".github/ISSUE_TEMPLATE.md"]), [KEY], null), null);
});

// TST-0124002 · level: unit · module: MOD-workflow-entries
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: results that hold the key's value in a file a commit changes, in a commit's message, in the name of a branch, and in a job's end kept for later; and — the known positive — the same results with another value
// input: checkResult(each, [the key], null)
// expect: each is refused, and no reason holds the key's value; with the other value none is refused
test("checkResult — a result that holds a key of the run anywhere is refused, without naming the key", () => {
  assert.ok(checkResult, `result.mjs: ${loaded.error?.message}`);
  const commit = (message, text) => ({ commit: "d".repeat(40), message, paths: ["notes.md"], texts: [Buffer.from(text)] });
  const base = { refs: [{ ref: "refs/heads/job-1", commit: "d".repeat(40) }], pullRequests: [], ends: [] };
  const cases = {
    file: { result: base, commits: [commit("work", `the key is ${KEY}\n`)] },
    message: { result: base, commits: [commit(`work with ${KEY}`, "text")] },
    branch: { result: { ...base, refs: [{ ref: `refs/heads/${KEY}`, commit: "d".repeat(40) }] }, commits: [commit("work", "text")] },
    end: { result: { ...base, ends: [{ path: "docs/jobs/JOB-1.md", part: { part: { reason: `failed with ${KEY}` } }, trailers: [] }] }, commits: [commit("work", "text")] },
  };
  for (const [name, read] of Object.entries(cases)) {
    const reason = checkResult(read, [KEY], null);
    assert.ok(reason, `${name} is refused`);
    assert.ok(!reason.includes(KEY), `${name}: the reason does not name the key`);
    assert.equal(checkResult(read, ["another-value-0123456789"], null), null, `${name}: known positive`);
  }
});

// TST-0124003 · level: unit · module: MOD-workflow-entries
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: a hand-over's result whose kept pull request's description holds the task, one whose commit message holds it, and the same results checked without a task
// input: checkResult(each, [], the task) and checkResult(each, [], null)
// expect: refused with the task, the reason not holding the task's words; not refused without it
test("checkResult — a hand-over's result that holds the task in a pull request or a commit message is refused", () => {
  assert.ok(checkResult, `result.mjs: ${loaded.error?.message}`);
  const commits = (message) => [{ commit: "e".repeat(40), message, paths: ["src/a.mjs"], texts: [Buffer.from("x")] }];
  const inRequest = { result: { refs: [], pullRequests: [{ branch: "job-1", base: "main", title: "JOB-1", body: `Asked: ${TASK}` }], ends: [] }, commits: commits("work") };
  const inMessage = { result: { refs: [], pullRequests: [], ends: [] }, commits: commits(`${TASK}\n`) };
  for (const read of [inRequest, inMessage]) {
    const reason = checkResult(read, [], TASK);
    assert.ok(reason && !reason.includes(TASK), reason);
    assert.equal(checkResult(read, [], null), null);
  }
});

// TST-0124004 · level: unit · module: MOD-workflow-entries
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the agent's checkout prepared for a result, which takes a job on main and works on a branch job-1, each pushed as the checkout pushes; a pull request and an end kept for later
// input: packResult; then, on the writing machine's checkout, readResult and checkResult; and the product's origin read before writeBranches
// expect: the origin holds neither commit — the pushes landed in the result's own repository —; the result names main and job-1 with the commits made, the kept pull request and end; the writing machine reads both commits with the paths they change; nothing is refused
test("prepareResult and packResult — the agent's pushes land in the result, and the writing machine reads them from its bundle", (t) => {
  assert.ok(prepareResult, `result.mjs: ${loaded.error?.message}`);
  const p = product(t);
  const before = git(p.origin, "rev-parse", "refs/heads/main");
  const { kept, taken, work } = agentWork(p);
  assert.equal(kept.pullRequest({ branch: "job-1", base: "main", title: "JOB-1: implement", body: "Job: JOB-1" }), pendingPullRequest("job-1"));
  kept.end("docs/jobs/JOB-1.md", { part: { part: "end", at: new Date("2026-10-24T10:00:00Z"), state: "done", results: [work, pendingPullRequest("job-1")] }, branch: "main" }, ["Agent-M-Job: JOB-1"]);

  assert.equal(git(p.origin, "rev-parse", "refs/heads/main"), before, "the origin's main is where it was");
  assert.equal(spawnSync("git", ["rev-parse", "--verify", "--quiet", "refs/heads/job-1"], { cwd: p.origin }).status, 1, "the origin has no job-1");

  const packed = packResult(p.resultDir);
  assert.deepEqual(packed.refs.map((each) => [each.ref, each.commit]).sort(), [["refs/heads/job-1", work], ["refs/heads/main", taken]]);
  const read = readResult(p.writer, join(p.resultDir, "out"));
  assert.equal(read.result.branch, "main");
  assert.equal(read.result.ends[0].part.part.at, "2026-10-24T10:00:00.000Z");
  assert.deepEqual(read.result.pullRequests, [{ branch: "job-1", base: "main", title: "JOB-1: implement", body: "Job: JOB-1" }]);
  assert.deepEqual(read.commits.map((each) => [each.commit, each.paths]).sort(), [[taken, ["docs/jobs/JOB-1.md"]], [work, ["src/loan.mjs"]]].sort());
  assert.equal(checkResult(read, [KEY], null), null);
});

// TST-0124005 · level: unit · module: MOD-workflow-entries
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the agent's result of TST-0124004 and the writing machine's check of a result that changes .github/workflows/ (the commit made through git, read back from the bundle)
// input: readResult and checkResult over each
// expect: the result as made is not refused; the one with the workflow file is, naming .github/workflows/evil.yml
test("readResult — a workflow file changed on the agent's machine is found in the bundle and refused", (t) => {
  assert.ok(readResult, `result.mjs: ${loaded.error?.message}`);
  const p = product(t);
  agentWork(p, { branch: { ".github/workflows/evil.yml": "on: push\n" } });
  packResult(p.resultDir);
  assert.match(checkResult(readResult(p.writer, join(p.resultDir, "out")), [KEY], null), /\.github\/workflows\/evil\.yml/);
});

// TST-0124006 · level: unit · module: MOD-workflow-entries
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the agent's result of TST-0124004; meanwhile someone pushed another commit to the origin's main, changing README.md
// input: writeBranches on the writing machine's checkout
// expect: the origin's main holds the other commit and, on it, the taking picked anew — its message and its change kept, its identifier a new one, which the returned map gives for the old —; the origin's job-1 is the agent's commit unchanged; the checkout stands at the origin's main
test("writeBranches — the default branch's commits are picked onto a main that moved, and a branch is pushed as it is", (t) => {
  assert.ok(writeBranches, `result.mjs: ${loaded.error?.message}`);
  const p = product(t);
  const { taken, work } = agentWork(p);
  packResult(p.resultDir);
  const other = commit(p.seed, { "README.md": "# Thesis tool, renamed\n" }, "other");
  git(p.seed, "push", "-q", "origin", "HEAD:refs/heads/main");

  const read = readResult(p.writer, join(p.resultDir, "out"));
  const renamed = writeBranches(p.writer, read.result);
  const main = git(p.origin, "rev-parse", "refs/heads/main");
  assert.notEqual(main, taken);
  assert.equal(renamed.get(taken), main);
  assert.equal(git(p.origin, "rev-parse", "refs/heads/main^"), other);
  assert.equal(git(p.origin, "log", "-1", "--format=%s", "refs/heads/main"), "take JOB-1 (run)");
  assert.equal(git(p.origin, "show", "refs/heads/main:docs/jobs/JOB-1.md"), "# JOB-1\n\n## Taken");
  assert.equal(git(p.origin, "rev-parse", "refs/heads/job-1"), work);
  assert.equal(git(p.writer, "rev-parse", "HEAD"), main);
});

// TST-0124007 · level: unit · module: MOD-workflow-entries
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the agent's result, unmoved main (known positive), and a second product where someone changed the same record on the origin's main meanwhile
// input: writeBranches on each
// expect: unmoved, the origin's main is the agent's commit itself and the map is empty; with the conflicting change, ResultNotApplied, and the origin's main and branches are as they were
test("writeBranches — an unmoved main takes the commits as they are; a commit that does not apply writes nothing", (t) => {
  assert.ok(writeBranches, `result.mjs: ${loaded.error?.message}`);
  const p = product(t);
  const { taken } = agentWork(p);
  packResult(p.resultDir);
  assert.equal(writeBranches(p.writer, readResult(p.writer, join(p.resultDir, "out")).result).size, 0);
  assert.equal(git(p.origin, "rev-parse", "refs/heads/main"), taken);

  const q = product(t);
  agentWork(q);
  packResult(q.resultDir);
  commit(q.seed, { "docs/jobs/JOB-1.md": "# JOB-1\n\n## Taken\nby: another run\n" }, "take JOB-1 (another run)");
  git(q.seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  const before = git(q.origin, "rev-parse", "refs/heads/main");
  assert.throws(() => writeBranches(q.writer, readResult(q.writer, join(q.resultDir, "out")).result), { name: "ResultNotApplied" });
  assert.equal(git(q.origin, "rev-parse", "refs/heads/main"), before);
  assert.equal(spawnSync("git", ["rev-parse", "--verify", "--quiet", "refs/heads/job-1"], { cwd: q.origin }).status, 1, "no branch was pushed");
});

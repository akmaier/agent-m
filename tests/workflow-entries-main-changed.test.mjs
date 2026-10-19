// MOD-workflow-entries' entry onMainChanged and the workflow file that runs it (ITM-908), as the accepted text of
// docs/architecture/MOD-workflow-entries.md states it: "onMainChanged(env) — in the instance, on every push to the default branch: what a page would
// otherwise derive from that commit at the moment it is opened, computed once and stored as records the page reads. It reads the commit's snapshot
// once. It adds the commit's graph … (MOD-trace-graph's `publishGraph`) … A file the branches already hold for that commit is left as it is:
// `nothing to do`. A failure … ends the entry `failed`, naming it"; "one file under `.github/workflows/` runs each of its entries … and does nothing
// but run it". The impact lists and the overview are ITM-941's and are not tested here.
// Run: node --test tests/workflow-entries-main-changed.test.mjs
//
// Module: MOD-workflow-entries
// Guards: THE TRACEABILITY MATRIX IS DERIVED; A PAGE LOAD READS THE REPOSITORY IN BATCHES; WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS
// Level: unit
//
// Deterministic, no network: the instance is a temporary git repository — a bare origin whose `main` holds a small instance and whose branch
// `trace-cache` holds a first commit, and the clone the workflow's checkout stands for, which has fetched `trace-cache` as the workflow's step does.
// git is given no global configuration and no prompt. Each test makes its own folder and removes it, and states its expected results in its own text.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runEntry } from "../src/workflow-entries/main.mjs";
import { graphFromText } from "../src/trace-graph/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILES = {
  "README.md": "# Fixture instance\n",
  "SPEC.md": "# Spec\n\n**A THING IS DONE** *(Product Owner)*\n\nIt is done.\n*Check:* no automatic check; at review.\n",
  "docs/use-cases/UC-001-do-it.md": "---\nid: UC-001\ntitle: Do it\narea: 1\nactors:\n  - Reader\nrealises:\n  - A THING IS DONE\n---\n# UC-001 Do it\n",
};

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function write(root, files) {
  for (const [path, body] of Object.entries(files)) { mkdirSync(join(root, path, ".."), { recursive: true }); writeFileSync(join(root, path), body); }
}
// A bare origin: `main` with FILES and, unless `withBranch` is false, the orphan branch trace-cache with one README commit, as the workflow's first step
// makes it; and the checkout, which has fetched trace-cache into a local branch. -> { root, origin, clone, head }.
function fixture({ withBranch = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-main-changed-"));
  const origin = join(root, "origin.git"), seed = join(root, "seed"), clone = join(root, "clone");
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  for (const [key, value] of [["user.name", "Alice"], ["user.email", "alice@example.org"]]) git(seed, "config", key, value);
  write(seed, FILES);
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "the instance");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  if (withBranch) {
    git(seed, "checkout", "-q", "--orphan", "trace-cache");
    git(seed, "rm", "-rq", "--cached", ".");
    write(seed, { "README.md": "The graphs of the commits of main, one file each.\n" });
    git(seed, "add", "README.md");
    git(seed, "commit", "-q", "-m", "trace-cache: the branch of the stored graphs");
    git(seed, "push", "-q", "origin", "HEAD:refs/heads/trace-cache");
  }
  git(root, "clone", "-q", origin, clone);
  for (const [key, value] of [["user.name", "agent-m main-changed"], ["user.email", "41898282+github-actions[bot]@users.noreply.github.com"]]) git(clone, "config", key, value);
  if (withBranch) git(clone, "fetch", "-q", "origin", "trace-cache:trace-cache");
  return { root, origin, clone, seed, head: git(clone, "rev-parse", "HEAD") };
}
async function withInstance(options, run) {
  const f = fixture(options);
  try { return await run(f); } finally { rmSync(f.root, { recursive: true, force: true }); }
}
const environment = (f, extra = {}) => ({ GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "push", GITHUB_WORKSPACE: f.clone, GITHUB_SERVER_URL: "https://github.com",
  GITHUB_REPOSITORY: "alice/agent-m", GITHUB_REF_NAME: "main", GITHUB_SHA: f.head, GITHUB_TOKEN: "ghp_ALICEworkflowTOKEN0123456789abcdef", ...extra });
const run = (f, extra) => runEntry("onMainChanged", environment(f, extra), { now: new Date("2026-10-19T10:00:00Z") });
const cacheHead = (f) => git(f.origin, "rev-parse", "trace-cache");

// TST-908101 · level: unit · module: MOD-workflow-entries
// guards: THE TRACEABILITY MATRIX IS DERIVED
// given: an instance whose main has just been pushed, and whose branch trace-cache holds only its first commit
// input: onMainChanged with the workflow's token
// expect: outcome `done`; one new commit on the origin's trace-cache, on the head the entry read, that adds exactly "<commit of main>.json"; that file is the graph of main's commit, which graphFromText restores for it and which holds the requirement and the use case; main is untouched
test("onMainChanged adds the graph of the pushed commit to trace-cache in one commit", async () => {
  await withInstance({}, async (f) => {
    const before = cacheHead(f);
    const status = await run(f);
    assert.equal(status.outcome, "done", status.summary);
    const after = cacheHead(f);
    assert.equal(git(f.origin, "rev-parse", `${after}^`), before);
    assert.deepEqual(git(f.origin, "diff", "--name-only", before, after).split("\n"), [`${f.head}.json`]);
    const graph = graphFromText(git(f.origin, "show", `${after}:${f.head}.json`), f.head);
    assert.deepEqual([graph?.nodes.has("A THING IS DONE"), graph?.nodes.has("UC-001")], [true, true]);
    assert.equal(git(f.origin, "rev-parse", "main"), f.head);
  });
});

// TST-908102 · level: unit · module: MOD-workflow-entries
// guards: THE TRACEABILITY MATRIX IS DERIVED
// given: the instance after the run above, and the same commit pushed again (the workflow run again)
// input: onMainChanged a second time, after the clone has fetched trace-cache again
// expect: outcome `nothing to do`, and the origin's trace-cache as it was
test("onMainChanged leaves a graph the branch holds already: nothing to do", async () => {
  await withInstance({}, async (f) => {
    assert.equal((await run(f)).outcome, "done");
    const once = cacheHead(f);
    git(f.clone, "fetch", "-q", "origin", "+trace-cache:trace-cache");
    const status = await run(f);
    assert.equal(status.outcome, "nothing to do", status.summary);
    assert.equal(cacheHead(f), once);
  });
});

// TST-908103 · level: unit · module: MOD-workflow-entries
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: (a) no GITHUB_TOKEN; (b) a repository without the branch trace-cache; (c) a branch that moved on at the origin after the checkout fetched it
// input: onMainChanged in each
// expect: (a) `not run`, nothing written; (b) `failed` with a summary that names "trace-cache", nothing written; (c) `failed` with a summary that names that the branch moved, nothing written — and, once the checkout has fetched the branch again, the run made again is `done`
test("onMainChanged: no token is not run, a missing branch and a moved one are failed and write nothing, and the run can be made again", async () => {
  await withInstance({}, async (f) => {
    const status = await run(f, { GITHUB_TOKEN: "" });
    assert.equal(status.outcome, "not run");
    assert.equal(cacheHead(f), git(f.clone, "rev-parse", "trace-cache"));
  });
  await withInstance({ withBranch: false }, async (f) => {
    const status = await run(f);
    assert.equal(status.outcome, "failed");
    assert.match(status.summary, /trace-cache/);
    assert.equal(git(f.origin, "branch", "--list", "trace-cache"), "");
  });
  await withInstance({}, async (f) => {
    git(f.seed, "checkout", "-q", "trace-cache");
    write(f.seed, { "NOTE.md": "someone else wrote\n" });
    git(f.seed, "add", "NOTE.md");
    git(f.seed, "commit", "-q", "-m", "another run");
    git(f.seed, "push", "-q", "origin", "HEAD:refs/heads/trace-cache");
    const moved = cacheHead(f);
    const status = await run(f);
    assert.equal(status.outcome, "failed");
    assert.match(status.summary, /moved/i);
    assert.equal(cacheHead(f), moved);
    git(f.clone, "fetch", "-q", "origin", "+trace-cache:trace-cache");
    assert.equal((await run(f)).outcome, "done");
  });
});

// TST-908104 · level: unit · module: MOD-workflow-entries
// guards: WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS
// given: the workflow file .github/workflows/main-changed.yml
// input: reading its text
// expect: it runs on a push to main; it gives the step the workflow's token as GITHUB_TOKEN and may write contents; it makes the branch trace-cache with an orphan first commit when the origin has none and fetches it into the checkout; and the only entry it runs is `node src/workflow-entries/main.mjs onMainChanged`
test("the workflow file runs onMainChanged on a push to main, makes the branch once, and runs nothing else", () => {
  const text = readFileSync(join(ROOT, ".github", "workflows", "main-changed.yml"), "utf8");
  assert.match(text, /^on:\n\s+push:\n\s+branches: \[main\]/m);
  assert.match(text, /contents: write/);
  assert.match(text, /GITHUB_TOKEN: \$\{\{ secrets\.GITHUB_TOKEN \}\}/);
  assert.match(text, /checkout --orphan/);
  assert.match(text, /fetch origin .*trace-cache:trace-cache/);
  assert.deepEqual([...text.matchAll(/node src\/workflow-entries\/main\.mjs (\w+)/g)].map((m) => m[1]), ["onMainChanged"]);
  assert.match(text, /timeout-minutes: 2\b/);
});

// MOD-bridge-jobs — the job's working clone made from the Bridge's clone of its product, and each push of the agent forwarded from the outbox, as
// docs/architecture/MOD-bridge-jobs.md (Data) states them: "The working clone fetches from the Bridge's clone of the job's product (`products/<name>/`), never
// from the product's server [...]: an empty repository with the Bridge's clone as its `origin`, the fetch refspec `+refs/remotes/origin/*:refs/remotes/origin/*`
// together with `^refs/remotes/origin/HEAD`, fetched once, `origin/HEAD` set to the branch the Bridge's clone names as the origin's default, and that branch
// checked out, tracking it. So the agent's `git fetch` and `git pull` read the origin's branches and tags as the Bridge last fetched them — never the Bridge's
// own branches or the `refs/agent-m/` it forwards through —, over a local path and with no credential [...] A branch the Bridge forwarded is among them, since
// the forward's push updates the clone's `refs/remotes/origin/` of that branch." and "A branch that is new or moved against what the Bridge last forwarded of it
// — at first, against the base — is fetched into the Bridge's clone of the product, under `refs/agent-m/<job id>/`, pushed to the origin under its name, never
// forced, and the clone's own branch of that name pointed at it [...] A forward the origin refuses is kept, with what git said, for the relay's answers, and tried
// again once the branch moves in the outbox; it fails nothing yet. After the agent has answered, the Bridge forwards once more what the outbox holds".
// Run: node --test tests/bridge-jobs-forward.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: NO MODEL READS A CREDENTIAL; AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-011
// Level: unit
//
// Deterministic, no network: the origin is a bare repository in a temporary folder reached by its path; the Bridge's clone is cloneOrFetch's; the agent is
// the test, whose git runs with an environment of its own that includes no file of the Bridge. The origin refuses what its pre-receive hook refuses, and
// counts every push it was offered. Readings the text leaves open, which the tests state:
//   - What a forward keeps is one state per job, made from the outbox (`forwarding`): the outbox's branches at the last look, what was forwarded of each, and
//     the forwards refused, each `{ commit, said }`. `forward(state, { clone, job, again })` makes one look; `again` is the forward after the agent's answer,
//     which tries a refused branch once more even where it has not moved.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { cloneOrFetch, forward, forwarding, makeOutbox, workingClone } from "../src/bridge-jobs/workfolders.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";
Object.assign(process.env, { GIT_AUTHOR_NAME: "Seed", GIT_AUTHOR_EMAIL: "seed@example.org", GIT_COMMITTER_NAME: "Seed", GIT_COMMITTER_EMAIL: "seed@example.org" });

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
// The agent's own git, as its enclosure starts it: an environment chosen for it, with no include of the Bridge's tokens.
function agentGit(root, cwd, ...args) {
  const env = { PATH: process.env.PATH, HOME: root, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_TERMINAL_PROMPT: "0",
    GIT_AUTHOR_NAME: "Agent", GIT_AUTHOR_EMAIL: "agent@example.org", GIT_COMMITTER_NAME: "Agent", GIT_COMMITTER_EMAIL: "agent@example.org" };
  const r = spawnSync("git", args, { cwd, env, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`the agent's git ${args.join(" ")} failed: ${r.stderr}`);
  return r.stdout.trim();
}
const refs = (cwd, prefix) => git(cwd, "for-each-ref", "--format=%(refname)", prefix).split("\n").filter(Boolean);

// An origin with main, a branch `feature` and a tag v1, its seed, and the Bridge's clone of it; the clone also holds a branch of its own and a ref below
// refs/agent-m/ of an earlier job, which the agent's fetch must not see. `refusing`, a pattern of branch names the origin's pre-receive hook refuses.
async function world(t, { refusing = "^refs/heads/refused/" } = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-forward-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const origin = join(root, "product.git"), seed = join(root, "seed"), offered = join(root, "offered");
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  writeFileSync(offered, "");
  writeFileSync(join(origin, "hooks", "pre-receive"), `#!/bin/sh\nwhile read old new ref; do echo "$ref" >> '${offered}'; case "$ref" in *) echo "$ref" | grep -Eq '${refusing}' && { echo "the origin refuses $ref" >&2; exit 1; };; esac; done\nexit 0\n`, { mode: 0o755 });
  git(root, "clone", "-q", origin, seed);
  writeFileSync(join(seed, "README.md"), "product\n");
  git(seed, "add", "README.md");
  git(seed, "commit", "-q", "-m", "first");
  git(seed, "tag", "v1");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main", "HEAD:refs/heads/feature", "v1");
  writeFileSync(offered, "");
  const clone = await cloneOrFetch(origin, join(root, "work", "products", "product"));
  git(clone, "branch", "bridge-own");
  git(clone, "update-ref", "refs/agent-m/JOB-0/left", git(clone, "rev-parse", "HEAD"));
  const commit = (path, text, message) => { writeFileSync(join(seed, path), text); git(seed, "add", path); git(seed, "commit", "-q", "-m", message); git(seed, "push", "-q", "origin", "HEAD:refs/heads/main"); return git(seed, "rev-parse", "HEAD"); };
  const offeredRefs = () => readFileSync(offered, "utf8").split("\n").filter(Boolean);
  return { root, origin, seed, clone, commit, offeredRefs, originRef: (ref) => spawnSync("git", ["--git-dir", origin, "rev-parse", "--verify", "--quiet", ref], { encoding: "utf8" }).stdout.trim() || null };
}

// TST-2026111603 · level: unit · module: MOD-bridge-jobs
// guards: NO MODEL READS A CREDENTIAL; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-011
// given: an origin with main, feature and the tag v1; the Bridge's clone of it, which also holds its own branch bridge-own and refs/agent-m/JOB-0/left
// input: workingClone(clone, jobs/JOB-1); then the origin gains a commit on main; the agent's git fetch, before and after the Bridge's cloneOrFetch of its clone; then the agent's git pull
// expect: the working clone's origin is the Bridge's clone's path, its fetch refspecs are exactly +refs/remotes/origin/*:refs/remotes/origin/* and ^refs/remotes/origin/HEAD; it holds
//   refs/remotes/origin/main and feature and the tag v1, origin/HEAD names origin/main, and main is checked out tracking it; it holds no bridge-own and nothing below refs/agent-m/; the agent's fetch
//   before the Bridge's fetch leaves origin/main where it was (counter-proof: the origin moved), after it origin/main is the new commit, and the agent's pull brings main there
test("TST-2026111603: the job's working clone fetches the origin's branches and tags from the Bridge's clone, as the Bridge last fetched them, over a local path", async (t) => {
  const w = await world(t);
  const working = await workingClone(w.clone, join(w.root, "work", "jobs", "JOB-1"));
  assert.equal(git(working, "remote", "get-url", "origin"), w.clone, "the fetch address is the Bridge's clone");
  assert.deepEqual(git(working, "config", "--get-all", "remote.origin.fetch").split("\n"), ["+refs/remotes/origin/*:refs/remotes/origin/*", "^refs/remotes/origin/HEAD"]);
  assert.deepEqual(refs(working, "refs/remotes/origin/").sort(), ["refs/remotes/origin/HEAD", "refs/remotes/origin/feature", "refs/remotes/origin/main"]);
  assert.equal(git(working, "symbolic-ref", "refs/remotes/origin/HEAD"), "refs/remotes/origin/main");
  assert.deepEqual(refs(working, "refs/tags/"), ["refs/tags/v1"]);
  assert.equal(git(working, "symbolic-ref", "--short", "HEAD"), "main");
  assert.equal(git(working, "rev-parse", "--abbrev-ref", "main@{upstream}"), "origin/main", "main tracks origin/main");
  assert.deepEqual([...refs(working, "refs/heads/"), ...refs(working, "refs/agent-m/")], ["refs/heads/main"], "no branch of the Bridge's own, nothing below refs/agent-m/");

  const before = git(working, "rev-parse", "origin/main");
  const moved = w.commit("NEWS.md", "news\n", "news");
  agentGit(w.root, working, "fetch", "-q");
  assert.equal(git(working, "rev-parse", "origin/main"), before, "before the Bridge's fetch, the agent reads the origin as the Bridge last fetched it");
  assert.notEqual(moved, before, "counter-proof: the origin moved");
  await cloneOrFetch(w.origin, w.clone);
  agentGit(w.root, working, "fetch", "-q");
  assert.equal(git(working, "rev-parse", "origin/main"), moved, "after the Bridge's fetch, the agent's fetch reads the new commit");
  agentGit(w.root, working, "pull", "-q", "--ff-only");
  assert.equal(git(working, "rev-parse", "HEAD"), moved, "the agent's pull brings its branch there");
  assert.deepEqual(refs(working, "refs/agent-m/"), [], "still nothing below refs/agent-m/");
});

// TST-2026111604 · level: unit · module: MOD-bridge-jobs
// guards: AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; NO MODEL READS A CREDENTIAL
// given: the working clone of TST-2026111603 with its outbox; the agent pushes a commit on JOB-1 into the outbox
// input: forward(state, { clone, job: "JOB-1" }) — once after the push, once more with nothing new, once after a second commit, and once after the agent rewrote the branch
// expect: after the first look the origin holds JOB-1 at the agent's commit, the Bridge's clone's JOB-1 and refs/remotes/origin/JOB-1 point there, and the working clone's fetch reads it as
//   origin/JOB-1; the look with nothing new offers the origin nothing; the second commit is forwarded; the rewritten branch is refused by the origin as a forward that is not forced, kept with
//   what git said, and the origin keeps the second commit; main is never pushed; nothing is left below refs/agent-m/ in the clone
test("TST-2026111604: each branch the agent pushes into the outbox is forwarded to the origin at the next look, never forced", async (t) => {
  const w = await world(t);
  const working = await workingClone(w.clone, join(w.root, "work", "jobs", "JOB-1"));
  const outbox = await makeOutbox(working);
  const state = forwarding(outbox);
  const look = (again = false) => forward(state, { clone: w.clone, job: "JOB-1", again });
  const agentCommit = (path, message) => { writeFileSync(join(working, path), `${message}\n`); agentGit(w.root, working, "add", path); agentGit(w.root, working, "commit", "-q", "-m", message); return git(working, "rev-parse", "HEAD"); };

  agentGit(w.root, working, "checkout", "-q", "-b", "JOB-1");
  const tests = agentCommit("test.txt", "tests only");
  agentGit(w.root, working, "push", "-q", "origin", "JOB-1");
  await look();
  assert.equal(w.originRef("refs/heads/JOB-1"), tests, "the tests-only commit is on the origin");
  assert.equal(git(w.clone, "rev-parse", "refs/heads/JOB-1"), tests, "the clone's branch points at it");
  assert.equal(git(w.clone, "rev-parse", "refs/remotes/origin/JOB-1"), tests, "the forward's push updated the clone's remote-tracking branch");
  agentGit(w.root, working, "fetch", "-q");
  assert.equal(git(working, "rev-parse", "refs/remotes/origin/JOB-1"), tests, "the agent's fetch reads the branch the Bridge forwarded");
  assert.deepEqual(state.forwarded["JOB-1"], tests);

  const offered = w.offeredRefs().length;
  await look();
  assert.equal(w.offeredRefs().length, offered, "nothing new: the origin is offered nothing");

  const code = agentCommit("code.txt", "code");
  agentGit(w.root, working, "push", "-q", "origin", "JOB-1");
  await look();
  assert.equal(w.originRef("refs/heads/JOB-1"), code, "the second commit is forwarded");

  agentGit(w.root, working, "reset", "-q", "--hard", tests);
  const rewritten = agentCommit("other.txt", "rewritten");
  agentGit(w.root, working, "push", "-q", "--force", "origin", "JOB-1");
  await look();
  assert.equal(w.originRef("refs/heads/JOB-1"), code, "never forced: the origin keeps the second commit");
  assert.equal(state.refused["JOB-1"]?.commit, rewritten, "the refused forward is kept");
  assert.match(state.refused["JOB-1"].said, /rejected|non-fast-forward|fetch first/i, "with what git said");
  assert.equal(w.offeredRefs().includes("refs/heads/main"), false, "main is never pushed");
  assert.deepEqual(refs(w.clone, "refs/agent-m/JOB-1/"), [], "nothing is left below refs/agent-m/JOB-1/");
});

// TST-2026111605 · level: unit · module: MOD-bridge-jobs
// guards: AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST
// given: an origin whose pre-receive hook refuses every branch below refused/; the working clone with its outbox; the agent pushes refused/one into the outbox
// input: forward three times while the branch stands still, then once after it moved, then with `again`, the forward after the agent's answer
// expect: the first look offers the origin refused/one and keeps the refusal with the hook's words, failing nothing; the next two looks offer the origin nothing; the look after the move offers it
//   once more and keeps the new commit as refused; `again` offers it once more although it has not moved, and it stays refused; counter-proof: a branch outside refused/ is forwarded at the same look
test("TST-2026111605: a forward the origin refuses is kept with what git said, and tried again once the branch moves, or after the answer", async (t) => {
  const w = await world(t);
  const working = await workingClone(w.clone, join(w.root, "work", "jobs", "JOB-2"));
  const outbox = await makeOutbox(working);
  const state = forwarding(outbox);
  const look = (again = false) => forward(state, { clone: w.clone, job: "JOB-2", again });
  const offeredOf = (ref) => w.offeredRefs().filter((each) => each === ref).length;
  const agentCommit = (path, message) => { writeFileSync(join(working, path), `${message}\n`); agentGit(w.root, working, "add", path); agentGit(w.root, working, "commit", "-q", "-m", message); return git(working, "rev-parse", "HEAD"); };

  agentGit(w.root, working, "checkout", "-q", "-b", "refused/one");
  const first = agentCommit("a.txt", "one");
  agentGit(w.root, working, "push", "-q", "origin", "refused/one", "refused/one:refs/heads/accepted");
  await look();
  assert.equal(offeredOf("refs/heads/refused/one"), 1);
  assert.deepEqual(Object.keys(state.refused), ["refused/one"]);
  assert.equal(state.refused["refused/one"].commit, first);
  assert.match(state.refused["refused/one"].said, /the origin refuses refs\/heads\/refused\/one/, "what git said, the hook's words among it");
  assert.equal(w.originRef("refs/heads/accepted"), first, "counter-proof: a branch the origin accepts is forwarded at the same look");

  await look();
  await look();
  assert.equal(offeredOf("refs/heads/refused/one"), 1, "a refused branch that has not moved is not offered again");

  const second = agentCommit("b.txt", "two");
  agentGit(w.root, working, "push", "-q", "origin", "refused/one");
  await look();
  assert.equal(offeredOf("refs/heads/refused/one"), 2, "tried again once it moved");
  assert.equal(state.refused["refused/one"].commit, second);

  await look(true);
  assert.equal(offeredOf("refs/heads/refused/one"), 3, "the forward after the answer tries it once more");
  assert.equal(state.refused["refused/one"].commit, second, "and it stays refused");
  assert.equal(w.originRef("refs/heads/refused/one"), null);
});

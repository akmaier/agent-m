// MOD-bridge-jobs — a job of a kind that delivers a branch, run by a CLI session on a Bridge, as docs/architecture/MOD-bridge-jobs.md (Data) states it: "Then the
// checkout's `origin` is set to the product's address with git's usual fetch refspec, so that the session's `git fetch`, `git pull` and `git push` reach the
// product's repository itself"; "For a job whose kind's writer is `branch-and-pull-request` (MOD-runtimes), the kinds that deliver a branch, `branch.md`, filled in
// with the job's branch — named by the job's identifier — and who merges, follows"; "Where the Bridge holds no token for the product, no file is left and no
// helper is named"; "After the session has answered, the job's writer takes the pull request open or merged of the branch the session reports ... a branch the
// Bridge's clone does not hold is read, after a fetch of the clone, as the origin holds it"; and docs/architecture/MOD-agent-enclosure.md's "what may be
// written": "the writable folders the Bridge names — the session's checkout —" and, on Windows, "the readable folders it names — the clone of the instance and
// the clone of the job's product, from which the session's checkout is made —". For UC-011 steps 3 and 4, and 4a.
// Run: node --test tests/bridge-jobs-branch-job.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: UC-011; AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-034
// Level: component
//
// Deterministic, no network, no real agent: the instance and the product are bare repositories in a temporary folder that git reaches through its own
// `url.<path>.insteadOf`, as the computer's login would reach github.com; the Bridge holds no token for the product (UC-011 4a), so that no token file is left,
// and the writer, which reaches no server's API without a token, opens no pull request. The agent is a fixture executable named opencode, first on PATH: it
// commits its tests on the branch named by the job's identifier and pushes it to its origin, keeps its origin's address, waits for the test's signal, runs its
// own git fetch, and answers its branch and commit. The kind is fix-bug, whose recipes the test registers as fixtures and whose writer is the real
// branch-and-pull-request of MOD-runtimes. The enclosure is the fixture of tests/enclosure-fixture.mjs, which records what it was asked to prepare.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { startRecord } from "../src/job-ledger/index.mjs";
import { routeStrategies } from "../src/runtimes/index.mjs";
import { startWatching, stopWatching } from "../src/bridge-jobs/index.mjs";
import { openEnclosures } from "./enclosure-fixture.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";
Object.assign(process.env, { GIT_AUTHOR_NAME: "Seed", GIT_AUTHOR_EMAIL: "seed@example.org", GIT_COMMITTER_NAME: "Seed", GIT_COMMITTER_EMAIL: "seed@example.org" });
const REAL_GIT = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).stdout.trim();
const INSTANCE = "https://github.com/acme/agent-m", PRODUCT = "https://github.com/acme/widget";
const ID = "JOB-20261116-1000-aaaa";

registerStrategies("tests/bridge-jobs-branch-job.test.mjs", {
  recipes: { "fix-inputs": async () => [{ name: "the issue", text: "The export is cut off after the second page.", sources: [], required: true, artifacts: [] }],
    "chapters-for-implementation": async () => [], "resource-pins": async () => [] },
});
registerStrategies("tests/bridge-jobs-branch-job.test.mjs (MOD-runtimes)", routeStrategies);

function git(cwd, ...args) {
  const r = spawnSync(REAL_GIT, args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function repository(root, name, files) {
  const origin = join(root, `${name}.git`), seed = join(root, `${name}-seed`);
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  push(seed, files, "first");
  return { origin, seed };
}
function push(seed, files, message) {
  spawnSync(REAL_GIT, ["fetch", "-q", "origin"], { cwd: seed });
  spawnSync(REAL_GIT, ["reset", "-q", "--hard", "origin/main"], { cwd: seed });
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(seed, path, ".."), { recursive: true });
    writeFileSync(join(seed, path), text);
  }
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", message);
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  return git(seed, "rev-parse", "HEAD");
}
const PARTICIPANTS = "# Participants of this instance\n\n**REGISTER**\n\nThe participants of the test instance.\n\n| Name | Type | Model |\n|---|---|---|\n| fixer | agent | example-model |\n";

// TST-1112004 · level: component · module: MOD-bridge-jobs
// guards: UC-011; AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-034
// given: a queued fix-bug job of the participant fixer on the route `bridge lab-pc agent opencode`; a product the Bridge holds no token for, which the computer's own git reaches; the fixture agent
// input: startWatching; the test waits until the agent has pushed, checks the origin, then gives the origin's main a new commit and signals the agent
// expect: while the agent still works, the origin holds the job's branch at the agent's commit, pushed by the agent to its origin, which is the product's address; the agent's own git fetch reads the origin's new commit; the prompt the agent was sent ends with branch.md filled in — its branch and who merges, `you` — and names no token file; the enclosure was prepared with the checkout alone writable and the instance's clone and the product's clone readable; the record ends done with the agent's commit among its results and no pull request; the checkout is removed; counter-proof: no outbox, no relay folder and no token file was made
test("TST-1112004: a job that delivers a branch is pushed, fetched and followed by its CLI session itself, from a checkout whose origin is the product", async (t) => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-branch-job-")));
  const bin = join(root, "bin"), kept = join(root, "kept"), go = join(root, "go");
  mkdirSync(bin);
  mkdirSync(kept);
  const event = (text) => JSON.stringify({ type: "text", part: { text } });
  // The answer: the draft names the branch and its commit, which the shell puts between the two halves of the event.
  const [before, after] = event(JSON.stringify({ draft: { branch: ID, commits: ["@COMMIT@"] }, answers: [] })).split("@COMMIT@");
  writeFileSync(join(bin, "opencode"), `#!/bin/sh
case "$1" in --version) echo 1.4.0;; auth) echo '1 credentials';; models) echo opencode/big-pickle;;
run) cat > '${kept}/prompt'
  job="\${PWD##*/}"
  ls -a "$PWD" "$PWD/.." > '${kept}/listed'
  git checkout -q -b "$job" && printf 'the regression test\\n' > regression.test && git add regression.test && git commit -q -m 'the regression test' && git push -q origin "$job" || exit 4
  git config --get remote.origin.url > '${kept}/origin'
  commit="$(git rev-parse HEAD)"
  : > '${kept}/pushed'
  while [ ! -e '${go}' ]; do sleep 0.05; done
  git fetch -q && git rev-parse origin/main > '${kept}/fetched'
  printf '%s%s%s\\n' '${before}' "$commit" '${after}'
  printf '%s\\n' '{"type":"step_finish","part":{"tokens":{"input":5,"output":3}}}';;
esac
`, { mode: 0o755 });

  const instance = repository(root, "instance", { "docs/participants.md": PARTICIPANTS });
  const agentM = git(instance.seed, "rev-parse", "HEAD");
  const product = repository(root, "widget", { "README.md": "widget\n", "src/export.mjs": "export const pages = 2;\n" });
  const { path, text } = startRecord({ id: ID, kind: "fix-bug", worksOn: ["THE EXPORT IS A PDF"], participant: "fixer", model: "example-model", route: "bridge lab-pc agent opencode",
    run: null, retries: null, declares: { context: 200000, capabilities: ["draft text", "read the repository", "write to the repository", "run code and tests"] },
    startedBy: "alice", start: new Date("2026-11-16T10:00:00Z"), agentM: { version: "2026.11.0", commit: agentM }, inputs: [], limit: 1,
    destinations: [{ participant: "fixer", place: "this machine", parts: ["the issue"] }], params: { issue: 5 } });
  push(product.seed, { [path]: text }, `queue ${ID}`);
  const pairs = [[INSTANCE, instance.origin], [PRODUCT, product.origin]];
  process.env.GIT_CONFIG_COUNT = String(pairs.length);
  pairs.forEach(([address, at], index) => { process.env[`GIT_CONFIG_KEY_${index}`] = `url.${at}.insteadOf`; process.env[`GIT_CONFIG_VALUE_${index}`] = address; });
  const prior = process.env.PATH;
  process.env.PATH = `${bin}:/usr/bin:/bin`;
  t.after(async () => {
    await stopWatching("quit");
    process.env.PATH = prior;
    for (const key of Object.keys(process.env)) if (/^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+)$/.test(key)) delete process.env[key];
    rmSync(root, { recursive: true, force: true });
  });
  const until = async (condition, what, ms = 60000) => {
    for (const end = Date.now() + ms; Date.now() < end;) {
      if (await condition()) return;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    assert.fail(`waited for ${what}`);
  };
  const originRef = (ref) => spawnSync(REAL_GIT, ["--git-dir", product.origin, "rev-parse", "--verify", "--quiet", ref], { encoding: "utf8" }).stdout.trim() || null;
  const record = () => spawnSync(REAL_GIT, ["--git-dir", product.origin, "show", `main:${path}`], { encoding: "utf8" }).stdout;

  const folder = join(root, "agent-work");
  mkdirSync(folder);
  const asked = [];
  startWatching({ bridgeName: "lab-pc", agents: [{ name: "opencode", folder }], products: [{ address: PRODUCT }], every: 100, instance: INSTANCE, enclosures: openEnclosures({ asked }) });

  await until(() => existsSync(join(kept, "pushed")), "the agent's push");
  const working = join(folder, "jobs", ID);
  const commit = git(working, "rev-parse", "HEAD");
  assert.equal(originRef(`refs/heads/${ID}`), commit, "the push reached the origin while the agent still works");
  assert.equal(readFileSync(join(kept, "origin"), "utf8").trim(), PRODUCT, "the agent's origin is the product's address");
  assert.equal(/^## End$/m.test(record()), false, "known positive: the job has not ended yet");

  const moved = push(product.seed, { "NEWS.md": "news\n" }, "news");
  writeFileSync(go, "");
  await until(() => /^## End$/m.test(record()), "the job's end");

  assert.equal(readFileSync(join(kept, "fetched"), "utf8").trim(), moved, "the agent's own git fetch reads the origin's new commit");
  const prompt = readFileSync(join(kept, "prompt"), "utf8").replace(/\s+/g, " ");
  for (const part of [`\`${ID}\``, "Who merges it: you."]) assert.ok(prompt.includes(part), `the prompt holds branch.md filled in: ${part}`);
  assert.equal(prompt.includes(".agent-m-token"), false, "no token file is named where the Bridge holds no token");
  const prepared = asked.find((each) => each.call === "prepare" && each.at.writable.includes(working));
  assert.deepEqual(prepared.at, { writable: [working], readable: [folder, join(folder, "products", "widget")] });
  const listed = readFileSync(join(kept, "listed"), "utf8");
  for (const absent of [".agent-m-token", `${ID}.out.git`, `${ID}.requests`, `${ID}.answers`]) assert.equal(listed.includes(absent), false, `counter-proof: no ${absent} was made`);
  assert.ok(listed.includes(ID), "known positive: the listing holds the checkout");
  const ended = record();
  assert.match(ended, /^state: done$/m, ended);
  assert.ok(ended.includes(commit), "the agent's commit is among the results");
  assert.doesNotMatch(ended, /\/pull\//, "no pull request");
  assert.equal(existsSync(working), false, "the checkout is removed");
});

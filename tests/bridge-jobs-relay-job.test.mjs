// MOD-bridge-jobs — a job of a kind that delivers a branch, run on a Bridge with its relay, as docs/architecture/MOD-bridge-jobs.md (Data) states it: "A job has a
// relay when its kind's writer is `branch-and-pull-request` (MOD-runtimes), the kinds that deliver a branch. Before the agent starts, the Bridge makes two empty
// folders beside the working clone"; "Each push is forwarded at once. While the agent's process runs, the Bridge looks at the outbox's branches every two
// seconds"; "For a job with a relay, the Bridge's driver adds it, filled in, after the prompt it sends, as the description of where the agent works"; "The Bridge
// names that clone to the agent's enclosure among the folders it may read, beside the instance's"; and docs/architecture/MOD-agent-enclosure.md's "what may be
// written": "the writable folders the Bridge names — the job's checkout, its outbox and its relay's requests —" and, on Windows, "the readable folders it names —
// the clone of the instance, the clone of the job's product, from which the job's checkout fetches, and the relay's answers —"; with ARC-054's consequence "a push
// reaches the server before the agent has answered, a commit the server gained reaches the agent's `git fetch` after a `fetch` call".
// Run: node --test tests/bridge-jobs-relay-job.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: NO MODEL READS A CREDENTIAL; AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-011; UC-034
// Level: component
//
// Deterministic, no network, no real agent: the instance and the product are bare repositories in a temporary folder that git reaches through its own
// `url.<path>.insteadOf`, as the computer's login would reach github.com; the Bridge holds no token for the product, so that the relay answers its pull-request
// calls NotSupported and the writer opens none. The agent is a fixture executable named opencode, first on PATH: it commits its tests on the branch named by the
// job's identifier and pushes it, asks `read` and keeps the answer, waits for the test's signal, asks `fetch`, runs its own git fetch, and answers its branch and
// commit. The kind is fix-bug, whose recipes the test registers as fixtures and whose writer is the real branch-and-pull-request of MOD-runtimes. The enclosure is
// the fixture of tests/enclosure-fixture.mjs, which records what it was asked to prepare.

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

registerStrategies("tests/bridge-jobs-relay-job.test.mjs", {
  recipes: { "fix-inputs": async () => [{ name: "the issue", text: "The export is cut off after the second page.", sources: [], required: true, artifacts: [] }],
    "chapters-for-implementation": async () => [], "resource-pins": async () => [] },
});
registerStrategies("tests/bridge-jobs-relay-job.test.mjs (MOD-runtimes)", routeStrategies);

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

// TST-2026111612 · level: component · module: MOD-bridge-jobs
// guards: NO MODEL READS A CREDENTIAL; AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-011; UC-034
// given: a queued fix-bug job of the participant fixer on the route `bridge lab-pc agent opencode`; a product the Bridge holds no token for; the fixture agent
// input: startWatching; the test waits until the agent has kept its read answer, checks the origin, then gives the origin's main a new commit and signals the agent
// expect: while the agent still works, the origin holds the job's branch at the agent's commit, and the read answer the agent kept shows that commit as both outbox and origin, not done with
//   NotSupported's words; after the fetch the agent's own git fetch reads the origin's new commit; the prompt the agent was sent ends with relay.md filled in — the requests and answers folders
//   beside its working clone, its branch, who merges; the enclosure was prepared with the working clone, its outbox and the requests writable and the instance's clone, the product's clone and
//   the answers readable; the record ends done with the agent's commit among its results and no pull request; the relay's folders are removed
test("TST-2026111612: a job that delivers a branch forwards the agent's push while it works, answers its requests, and fetches for it from the Bridge's clone", async (t) => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-relay-job-")));
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
  git checkout -q -b "$job" && printf 'the regression test\\n' > regression.test && git add regression.test && git commit -q -m 'the regression test' && git push -q origin "$job" || exit 4
  commit="$(git rev-parse HEAD)"
  printf '{"call":"read","branch":"%s"}' "$job" > "$PWD.requests/read.json"
  while [ ! -e "$PWD.answers/read.json" ]; do sleep 0.05; done
  cat "$PWD.answers/read.json" > '${kept}/read.json'
  while [ ! -e '${go}' ]; do sleep 0.05; done
  printf '{"call":"fetch"}' > "$PWD.requests/fetch.json"
  while [ ! -e "$PWD.answers/fetch.json" ]; do sleep 0.05; done
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

  await until(() => existsSync(join(kept, "read.json")), "the agent's read answer");
  const working = join(folder, "jobs", ID);
  const commit = git(working, "rev-parse", "HEAD");
  assert.equal(originRef(`refs/heads/${ID}`), commit, "the push reached the origin while the agent still works");
  assert.equal(/^## End$/m.test(record()), false, "known positive: the job has not ended yet");
  const read = JSON.parse(readFileSync(join(kept, "read.json"), "utf8"));
  assert.equal(read.done, false);
  assert.match(read.reason, /NotSupported/);
  assert.deepEqual([read.state.outbox, read.state.origin, read.state.pullRequest], [commit, commit, null]);

  const moved = push(product.seed, { "NEWS.md": "news\n" }, "news");
  writeFileSync(go, "");
  await until(() => /^## End$/m.test(record()), "the job's end");

  assert.equal(readFileSync(join(kept, "fetched"), "utf8").trim(), moved, "after the fetch, the agent's own git fetch reads the origin's new commit");
  const prompt = readFileSync(join(kept, "prompt"), "utf8");
  for (const part of [`${working}.requests`, `${working}.answers`, `\`${ID}\``, "Who merges the pull request: you."]) {
    assert.ok(prompt.replace(/\s+/g, " ").includes(part), `the prompt holds relay.md filled in: ${part}`);
  }
  const prepared = asked.find((each) => each.call === "prepare" && each.at.writable.includes(working));
  assert.deepEqual(prepared.at, { writable: [working, `${working}.out.git`, `${working}.requests`], readable: [folder, join(folder, "products", "widget"), `${working}.answers`] });
  const ended = record();
  assert.match(ended, /^state: done$/m, ended);
  assert.ok(ended.includes(commit), "the agent's commit is among the results");
  assert.doesNotMatch(ended, /\/pull\//, "no pull request");
  for (const left of [working, `${working}.out.git`, `${working}.requests`, `${working}.answers`]) assert.equal(existsSync(left), false, `${left} is removed`);
});

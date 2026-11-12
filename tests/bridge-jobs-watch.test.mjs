// MOD-bridge-jobs' POST /v1/jobs, startWatching and stopWatching (ITM-327), as the accepted text of docs/architecture/MOD-bridge-jobs.md states
// them: "startWatching(config) -> void — with the agents the Bridge offers and their working folders, starts reading every served product ...
// at the given interval and after every hand-over: queued jobs whose record's route names this Bridge and an agent it offers are taken — a
// commit only on the head that was read, so that no other route takes them too — and run ... A product that cannot be read is skipped with its
// reason, and read again at the next interval."; "stopWatching(reason) — stops taking jobs; on quit every job still running is stopped and its
// record ends as cancelled, naming that the Bridge was quit"; "POST /v1/jobs — a job the page handed over: its start record is already committed
// ...; the Bridge takes it and runs it ..., from its record; the hand-over only spares it the wait for its next reading. Errors: invalid-request for
// an agent this Bridge does not offer, or whose working folder is not set"; and "Every job it runs, the Bridge runs from its start record alone".
// For UC-011 steps 2 to 5. Resuming after a gate, an agent's sprint close and the job list, log and cancel routes are other items'.
// Run: node --test tests/bridge-jobs-watch.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: UC-011; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; A CANCELLED JOB WRITES NOTHING MORE
// Level: unit
//
// Deterministic, no network, no real agent: the instance and the products are bare repositories in a temporary folder that git reaches through its own
// `url.<path>.insteadOf`, as the computer's login would reach github.com; the agent is a fixture executable named opencode, which with two wrappers
// for git and sleep is the whole PATH of a test, so that no real agent is found or started. The kind is decide-gate, whose recipe and writer the
// test registers: the recipe gives one part, the writer commits a file that shows what the job saw — the agent's working folder and the instance's file
// as the checkout held it. Each test makes its own folder and removes it. Where the module file leaves a reading open, the test states the one it
// takes, and the pull request names it:
//   - startWatching takes, beside the four things the file names, `instance`, the address of the instance repository whose docs/participants.md
//     names the participants, and optionally `onSkipped({ product, reason })`, told of each product that could not be read.
//   - Nothing is read at the start: the first reading is after one interval.
//   - A job of this Bridge is one whose record's route reads `bridge <bridge name> agent <agent>`; the agent it names must be offered with a folder.
//   - A job ends `done` with its results the commits and the files its writer reports, and `draft:` what its writer shows; a failure ends it `failed`
//     with the failure's message, and a quit `cancelled` with the reason "the Bridge was quit".
// Each test states its input and its expected result before it runs (given / input / expect); where a test expects a job to be left alone, a job of the
// same Bridge is first shown to run. The counter-proofs are recorded in the pull request.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { startRecord } from "../src/job-ledger/index.mjs";
import * as bridgeJobs from "../src/bridge-jobs/index.mjs";
import { openEnclosures } from "./enclosure-fixture.mjs";

const { jobHandlers, startWatching, stopWatching } = bridgeJobs;
process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";
Object.assign(process.env, { GIT_AUTHOR_NAME: "Seed", GIT_AUTHOR_EMAIL: "seed@example.org", GIT_COMMITTER_NAME: "Seed", GIT_COMMITTER_EMAIL: "seed@example.org" });
const REAL_GIT = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).stdout.trim();
const REAL_SLEEP = spawnSync("sh", ["-c", "command -v sleep"], { encoding: "utf8" }).stdout.trim();

const INSTANCE = "https://github.com/acme/agent-m", PRODUCT_A = "https://github.com/acme/product-a", PRODUCT_B = "https://github.com/acme/product-b";

// ---------------------------------------------------------------- the strategies of decide-gate, as fixtures

registerStrategies("tests/bridge-jobs-watch.test.mjs", {
  recipes: { "gate-inputs": async () => [{ name: "the gate", text: "Decide the gate.", sources: [], required: true, artifacts: [] }] },
  writers: { "gate-record": async (result, context) => {
    const marker = readFileSync(join(context.instance.checkout, "marker.md"), "utf8").trim();
    const path = `docs/gates/${context.jobId}.md`;
    const { defaultBranch } = await context.product.host.repositoryInfo();
    const { commit } = await context.product.host.commitFiles({ branch: defaultBranch, expectedHead: context.product.snapshot.commit,
      files: [{ path, text: `working folder: ${result.draft.reason}\ninstance marker: ${marker}\ninstance at: ${context.instance.snapshot.commit}\n` }],
      message: `gate ${context.jobId}` });
    return { commits: [commit], files: [path], pullRequest: null, shown: null, notes: [] };
  } },
});

// ---------------------------------------------------------------- the world of a test

function git(cwd, ...args) {
  const r = spawnSync(REAL_GIT, args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
const script = (bin, name, body) => writeFileSync(join(bin, name), `#!/bin/sh\n${body}\n`, { mode: 0o755 });
// The register names each agent with its model (MOD-participant-list); how an agent is reached is its job record's route, the connection it runs on.
const PARTICIPANTS = `# Participants of this instance

**REGISTER**

The participants of the test instance.

| Name | Type | Model |
|---|---|---|
${["drafter", "other-drafter", "codex-drafter", "claude-drafter", "ci-drafter"].map((name) => `| ${name} | agent | example-model |`).join("\n")}
`;
// The connection each agent's jobs run on: the route its records name (MOD-job-ledger).
const ROUTES = { "drafter": "bridge lab-pc agent opencode", "other-drafter": "bridge other-pc agent opencode", "codex-drafter": "bridge lab-pc agent codex",
  "claude-drafter": "bridge lab-pc agent claude", "ci-drafter": "ci hosted endpoint ci secret CI_KEY" };

// A bare repository whose main holds the files given, and a seed clone of it that writes. -> { origin, seed }
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

const JOB = (id, participant, route = ROUTES[participant]) => ({ id, kind: "decide-gate", worksOn: ["A JOB IS RECORDED IN ITS PRODUCT REPOSITORY"], participant, model: "example-model", route, run: null, retries: null,
  declares: { context: 200000, capabilities: ["draft text", "read the repository"] },
  startedBy: "alice", start: new Date("2026-10-11T09:00:00Z"), agentM: { version: "2026.10.0", commit: null }, inputs: [], limit: 3,
  destinations: [{ participant, place: "this machine", parts: ["the gate"] }], params: {} });
const ID = (n) => `JOB-20261011-090${n}-aaa${n}`;

// The Bridge's computer: a PATH of the fixture agent and the wrappers, the instance (two commits; the record names the first) and the products. The
// agent answers with its working folder and, once started, waits for the gate file when `gated`; it writes a mark when it ends.
async function world(run, { gated = false, fails = false, branch = null, undrafted = false, probe = false } = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-327-")));
  const bin = join(root, "bin"), calls = join(root, "calls"), gate = join(root, "gate"), finished = join(root, "finished");
  mkdirSync(bin);
  writeFileSync(calls, "");
  script(bin, "git", `exec ${REAL_GIT} "$@"`);
  script(bin, "sleep", `exec ${REAL_SLEEP} "$@"`);
  // With `undrafted`, the agent answers JSON whose envelope has no draft.
  const event = JSON.stringify({ type: "text", part: { text: JSON.stringify(undrafted ? { answers: [] } : { draft: { decision: "passed", reason: "@PWD@" }, answers: [] }) } })
    .replace("@PWD@", `'"$PWD"'`);
  // With `branch`, the agent commits a file on that branch of its checkout and pushes it to its origin, whose address, as its configuration names it, it records.
  const commits = branch ? `git checkout -q -b ${branch} && printf 'change\\n' > change.txt && git add change.txt && git commit -q -m change && git push -q origin ${branch} && printf 'pushed to %s\\n' "$(git config --get remote.origin.url)" >> ${calls}; ` : "";
  // With `probe`, the agent records what it finds when it starts: its checkout's commit, the commit of the instance's clone in its working folder, whether the
  // leftover draft_response.json of an earlier session lies there, whether its home's file is kept, and whether its checkout holds NEW.md.
  const probes = probe ? `printf 'probe %s %s %s %s %s\\n' "$(git rev-parse HEAD)" "$(git -C ../.. rev-parse HEAD)" "$([ -e ../../draft_response.json ] && echo left || echo gone)" "$([ -e ../../home/tmp/opencode/final_answer.json ] && echo home || echo no-home)" "$([ -e NEW.md ] && echo new || echo old)" >> ${calls}; ` : "";
  script(bin, "opencode", `case "$1" in --version) echo 1.4.0;; auth) echo '1 credentials';; models) echo opencode/big-pickle;;
run) printf '%s\\n' "$PWD $*" >> ${calls}; ${probes}${commits}${gated ? `while [ ! -e ${gate} ]; do sleep 0.02; done; ` : ""}${fails ? "echo boom >&2; exit 3; " : ""}printf '%s\\n' ok >> ${finished}
printf '%s\\n' '${event}' '{"type":"step_finish","part":{"tokens":{"input":11,"output":7}}}';; esac`);
  const instance = repository(root, "instance", { "docs/participants.md": PARTICIPANTS, "marker.md": "v1\n" });
  const first = git(instance.seed, "rev-parse", "HEAD");
  push(instance.seed, { "marker.md": "v2\n", }, "second");
  const products = { [PRODUCT_A]: repository(root, "product-a", { "README.md": "A\n" }) };
  const queue = (product, job, commit = first) => {
    const { path, text } = startRecord({ ...job, agentM: { version: "2026.10.0", commit } });
    return { path, text, id: job.id, product, commit: push(products[product].seed, { [path]: text }, `queue ${job.id}`) };
  };
  const mapping = () => {
    const pairs = [[INSTANCE, instance.origin], ...Object.entries(products).map(([address, { origin }]) => [address, origin])];
    if (!products[PRODUCT_B]) pairs.push([PRODUCT_B, join(root, "product-b.git")]);
    process.env.GIT_CONFIG_COUNT = String(pairs.length);
    pairs.forEach(([address, path], at) => { process.env[`GIT_CONFIG_KEY_${at}`] = `url.${path}.insteadOf`; process.env[`GIT_CONFIG_VALUE_${at}`] = address; });
  };
  mapping();
  const folder = (name) => { const path = join(root, name); mkdirSync(path); return path; };
  const originText = (product, path) => spawnSync(REAL_GIT, ["--git-dir", products[product].origin, "show", `main:${path}`], { encoding: "utf8" }).stdout;
  const originHead = (product) => git(root, "--git-dir", products[product].origin, "rev-parse", "main");
  const until = async (condition, what, ms = 30000) => {
    for (const end = Date.now() + ms; Date.now() < end;) {
      const found = await condition();
      if (found) return found;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    assert.fail(`waited for ${what}`);
  };
  const ended = (job) => until(() => /^## End$/m.test(originText(job.product, job.path)), `${job.id} to end`);
  const prior = process.env.PATH;
  process.env.PATH = bin;
  try {
    return await run({ root, instance, products, first, queue, push, mapping, folder, originText, originHead, until, ended, calls: () => readFileSync(calls, "utf8").trim().split("\n").filter(Boolean),
      release: () => writeFileSync(gate, ""), finished: () => existsSync(finished), repository: (name, files) => repository(root, name, files) });
  } finally {
    await stopWatching("quit");
    process.env.PATH = prior;
    for (const key of Object.keys(process.env)) if (key.startsWith("GIT_CONFIG_") && key !== "GIT_CONFIG_GLOBAL" && key !== "GIT_CONFIG_SYSTEM") delete process.env[key];
    rmSync(root, { recursive: true, force: true });
  }
}
const watch = (w, agents, extra = {}) => startWatching({ bridgeName: "lab-pc", agents, products: [{ address: PRODUCT_A }], every: 100, instance: INSTANCE, enclosures: openEnclosures(), ...extra });
const runs = (w) => w.calls().filter((line) => / run /.test(line));

// ---------------------------------------------------------------- a queued job of this Bridge

// TST-472096 · level: unit · module: MOD-bridge-jobs
// guards: UC-011; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A LOCAL AGENT USES THE PERSON'S OWN LOGIN
// given: a product with one queued job of the participant `drafter`, whose record's route names this Bridge and opencode; the instance, whose marker file reads v2 at its head and v1 at the commit the record names; opencode offered with a working folder
// input: startWatching with an interval of 100 ms; wait for the record's end
// expect: the record is taken by `lab-pc` once and ends `done`, its results the writer's commit and file and its usage the agent's 11 and 7 tokens; the writer's commit is on the origin's main and its file shows the agent worked in <folder>/jobs/<id> and the instance's checkout held the marker v1 at the record's commit; the agent was started once, in that folder; the working clone is removed
test("a queued job of this Bridge is taken, run in the agent's working folder with the instance at the record's commit, and ended with its results", async () => {
  await world(async (w) => {
    const job = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    const folder = w.folder("agent-work");
    watch(w, [{ name: "opencode", folder }]);
    await w.ended(job);

    const record = w.originText(PRODUCT_A, job.path);
    assert.equal((record.match(/^## Taken$/gm) ?? []).length, 1);
    assert.match(record, /^by: lab-pc$/m);
    assert.match(record, /^state: done$/m);
    const written = w.originText(PRODUCT_A, `docs/gates/${job.id}.md`);
    assert.equal(written, `working folder: ${join(folder, "jobs", job.id)}\ninstance marker: v1\ninstance at: ${w.first}\n`);
    const commit = git(w.root, "--git-dir", w.products[PRODUCT_A].origin, "log", "--format=%H", "-1", "--", `docs/gates/${job.id}.md`);
    assert.match(record, new RegExp(`^results: ${commit}, docs/gates/${job.id}\\.md$`, "m"));
    assert.match(record, /^usage: \{"inputTokens":11,"outputTokens":7,"minutes":null,"cost":null\}$/m);
    assert.deepEqual(runs(w).map((line) => line.split(" ")[0]), [join(folder, "jobs", job.id)]);
    assert.equal(existsSync(join(folder, "jobs", job.id)), false, "the working clone is removed");
  });
});

// TST-472097 · level: unit · module: MOD-bridge-jobs
// guards: UC-011; A LOCAL AGENT USES THE PERSON'S OWN LOGIN
// given: queued jobs whose records' routes name another Bridge (other-drafter, bridge other-pc agent opencode), CI (ci-drafter, ci hosted endpoint ci secret CI_KEY), this Bridge with an agent it does not offer (codex-drafter, bridge lab-pc agent codex) and, to show the watcher reads, this Bridge and opencode (drafter); opencode alone is offered
// input: startWatching; wait for drafter's job to end, then three more intervals
// expect: drafter's job ended; the other three records are exactly as they were committed; the agent was started once
test("a job of another Bridge, another route or an agent not offered is left alone", async () => {
  await world(async (w) => {
    const left = [w.queue(PRODUCT_A, JOB(ID(1), "other-drafter")), w.queue(PRODUCT_A, JOB(ID(2), "ci-drafter")),
      w.queue(PRODUCT_A, JOB(ID(3), "codex-drafter"))];
    const mine = w.queue(PRODUCT_A, JOB(ID(4), "drafter"));
    watch(w, [{ name: "opencode", folder: w.folder("agent-work") }]);
    await w.ended(mine);
    await new Promise((resolve) => setTimeout(resolve, 400));

    for (const job of left) assert.equal(w.originText(PRODUCT_A, job.path), job.text, job.id);
    assert.equal(runs(w).length, 1);
  });
});

// ---------------------------------------------------------------- the hand-over

// TST-472098 · level: unit · module: MOD-bridge-jobs
// guards: UC-011
// given: opencode offered with a working folder and claude named without one; queued jobs of claude-drafter (this Bridge, claude) and of drafter, and a Bridge that is not reading for a long time, an interval of an hour
// input: POST /v1/jobs for drafter's job; then for claude-drafter's job; then a request without a commit
// expect: the first is accepted with the job's identifier; the second is invalid-request naming no agent started, its record unchanged; the third is invalid-request
test("a hand-over for an agent without a working folder is refused", async () => {
  await world(async (w) => {
    const mine = w.queue(PRODUCT_A, JOB(ID(1), "drafter")), nofolder = w.queue(PRODUCT_A, JOB(ID(2), "claude-drafter"));
    const agents = [{ name: "opencode", folder: w.folder("agent-work") }, { name: "claude", folder: "" }];
    watch(w, agents, { every: 3_600_000 });
    const handlers = jobHandlers({ agents });
    const hand = (job, body = { product: job.product, record: job.path, commit: job.commit }) => handlers["POST /v1/jobs"]({ params: {}, query: {}, body });

    assert.deepEqual(await hand(mine), { accepted: mine.id }, "known positive");
    await w.ended(mine);
    const before = runs(w).length;
    await assert.rejects(hand(nofolder), (error) => error?.code === "invalid-request");
    await assert.rejects(hand(nofolder, { product: PRODUCT_A, record: nofolder.path }), (error) => error?.code === "invalid-request");
    assert.equal(w.originText(PRODUCT_A, nofolder.path), nofolder.text);
    assert.equal(runs(w).length, before);
  });
});

// TST-472099 · level: unit · module: MOD-bridge-jobs
// guards: UC-011
// given: a queued job of drafter; a watcher whose interval is an hour
// input: wait 400 ms; then POST /v1/jobs for the job
// expect: the record is unchanged after the wait; the hand-over is accepted and the job ends well before the interval is over
test("a handed-over job is run before the interval ends", async () => {
  await world(async (w) => {
    const job = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    const agents = [{ name: "opencode", folder: w.folder("agent-work") }];
    watch(w, agents, { every: 3_600_000 });
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(w.originText(PRODUCT_A, job.path), job.text, "nothing is read before the interval");

    await jobHandlers({ agents })["POST /v1/jobs"]({ params: {}, query: {}, body: { product: job.product, record: job.path, commit: job.commit } });
    await w.ended(job);
    assert.match(w.originText(PRODUCT_A, job.path), /^state: done$/m);
  });
});

// ---------------------------------------------------------------- taken once

// TST-472100 · level: unit · module: MOD-bridge-jobs
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: two watchers of this Bridge's name, each with a working folder of its own for opencode, and one queued job
// input: both startWatching with an interval of 20 ms; wait for the end and 400 ms more
// expect: the record holds one `## Taken` and one `## End`, which says `done`; the agent was started once
test("a job two watchers see is taken once", async () => {
  await world(async (w) => {
    const job = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    for (const name of ["one", "two"]) watch(w, [{ name: "opencode", folder: w.folder(name) }], { every: 20 });
    await w.ended(job);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const record = w.originText(PRODUCT_A, job.path);
    assert.equal((record.match(/^## Taken$/gm) ?? []).length, 1);
    assert.equal((record.match(/^## End$/gm) ?? []).length, 1);
    assert.match(record, /^state: done$/m);
    assert.equal(runs(w).length, 1);
  });
});

// ---------------------------------------------------------------- an unreadable product

// TST-472101 · level: unit · module: MOD-bridge-jobs
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-011
// given: two served products, product-a with a queued job and product-b whose repository does not exist yet; onSkipped given
// input: startWatching with an interval of 100 ms; wait for product-a's job to end; then the repository of product-b is made, with a queued job
// expect: product-b was skipped with a reason — git's own words — while it was missing, and product-a's job ran; once it exists, its job is taken and ended at a later interval
test("an unreadable product is skipped with its reason and read at the next interval", async () => {
  await world(async (w) => {
    const job = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    const skipped = [];
    watch(w, [{ name: "opencode", folder: w.folder("agent-work") }], { products: [{ address: PRODUCT_B }, { address: PRODUCT_A }], onSkipped: (skip) => skipped.push(skip) });
    await w.ended(job);
    const first = skipped.filter((skip) => skip.product === PRODUCT_B);
    assert.ok(first.length >= 1);
    assert.match(first[0].reason, /does not appear to be a git repository/);
    assert.equal(skipped.some((skip) => skip.product === PRODUCT_A), false);

    w.products[PRODUCT_B] = w.repository("product-b", { "README.md": "B\n" });
    w.mapping();
    const later = w.queue(PRODUCT_B, JOB(ID(2), "drafter"));
    await w.ended(later);
    assert.match(w.originText(PRODUCT_B, later.path), /^state: done$/m);
  });
});

// ---------------------------------------------------------------- a job queued while the Bridge watches, and one that fails

// TST-472102 · level: unit · module: MOD-bridge-jobs
// guards: UC-011
// given: a watcher with an interval of 100 ms and an empty queue, which has read the product at least once
// input: wait 400 ms; then commit a queued job of drafter to the product, from another clone
// expect: nothing was started during the wait; the job is taken at a later interval and ends done
test("a job queued while the Bridge is watching is taken at the next interval", async () => {
  await world(async (w) => {
    watch(w, [{ name: "opencode", folder: w.folder("agent-work") }]);
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(runs(w).length, 0);
    const job = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    await w.ended(job);

    assert.match(w.originText(PRODUCT_A, job.path), /^state: done$/m);
    assert.equal(runs(w).length, 1);
  });
});

// TST-472103 · level: unit · module: MOD-bridge-jobs
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-011
// given: an agent that writes `boom` to its error output and exits with 3
// input: startWatching; wait for the record's end
// expect: the job ends `failed`, its reason naming the failure and the agent's last output; no file of the writer is on the origin; the working clone is removed
test("a job whose agent fails ends failed with the failure's words", async () => {
  await world(async (w) => {
    const job = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    const folder = w.folder("agent-work");
    watch(w, [{ name: "opencode", folder }]);
    await w.ended(job);

    const record = w.originText(PRODUCT_A, job.path);
    assert.match(record, /^state: failed$/m);
    assert.match(record, /^reason: the agent process failed: boom$/m);
    assert.equal(w.originText(PRODUCT_A, `docs/gates/${job.id}.md`), "");
    assert.equal(existsSync(join(folder, "jobs", job.id)), false);
  }, { fails: true });
});

// TST-2026271043 · level: unit · module: MOD-bridge-jobs
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-011
// given: an agent that answers, in every round, JSON whose envelope has no `draft` — `{ "answers": [] }` —; known positive: the same job whose agent answers a draft ends `done` (TST-472096)
// input: startWatching; wait for the record's end
// expect: the job ends `failed` with no results, its reason "the participant's answer could not be read: the answer has no draft" — MOD-job-runner's failedBecause —, its round record saying `stopped because: unusable`; no file of the writer is on the origin
test("TST-2026271043: a job whose agent answers without a draft ends failed, its reason naming why", async () => {
  await world(async (w) => {
    const job = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    watch(w, [{ name: "opencode", folder: w.folder("agent-work") }]);
    await w.ended(job);

    const record = w.originText(PRODUCT_A, job.path);
    assert.match(record, /^state: failed$/m);
    assert.match(record, /^results:$/m);
    assert.match(record, /^reason: the participant's answer could not be read: the answer has no draft$/m);
    assert.match(record, /stopped because: unusable/);
    assert.equal(w.originText(PRODUCT_A, `docs/gates/${job.id}.md`), "");
  }, { undrafted: true });
});

// ---------------------------------------------------------------- pause and quit

// TST-472104 · level: unit · module: MOD-bridge-jobs
// guards: UC-011
// given: a watcher with an interval of 50 ms that has run one job, and a second job queued after stopWatching("pause")
// input: wait for the first to end; stopWatching("pause"); queue the second; wait 600 ms
// expect: the second record is exactly as committed and the agent was started once
test("after pause nothing new is taken", async () => {
  await world(async (w) => {
    const first = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    watch(w, [{ name: "opencode", folder: w.folder("agent-work") }], { every: 50 });
    await w.ended(first);
    await stopWatching("pause");
    const second = w.queue(PRODUCT_A, JOB(ID(2), "drafter"));
    await new Promise((resolve) => setTimeout(resolve, 600));

    assert.equal(w.originText(PRODUCT_A, second.path), second.text);
    assert.equal(runs(w).length, 1);
  });
});

// TST-472105 · level: unit · module: MOD-bridge-jobs
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-011
// given: an agent that waits for a gate before it answers, and a watcher that has taken the job and started it
// input: stopWatching("quit"); then the gate opens
// expect: the record ends `cancelled`, naming that the Bridge was quit; the origin holds no file of the writer, and the end commit is its head, nothing after; the agent's process was stopped: it never finished after the gate opened
test("quit ends a running job as cancelled, with nothing written after", async () => {
  await world(async (w) => {
    const job = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    watch(w, [{ name: "opencode", folder: w.folder("agent-work") }]);
    await w.until(() => runs(w).length === 1, "the agent to start");
    await stopWatching("quit");

    const record = w.originText(PRODUCT_A, job.path);
    assert.match(record, /^state: cancelled$/m);
    assert.match(record, /^reason: the Bridge was quit$/m);
    const head = w.originHead(PRODUCT_A);
    w.release();
    await new Promise((resolve) => setTimeout(resolve, 600));
    assert.equal(w.originText(PRODUCT_A, `docs/gates/${job.id}.md`), "");
    assert.equal(w.originHead(PRODUCT_A), head);
    assert.equal(w.finished(), false);
    assert.equal((record.match(/^## End$/gm) ?? []).length, 1);
  }, { gated: true });
});

// ---------------------------------------------------------------- the enclosure and the session's checkout (ARC-054)

// TST-1381001 · level: unit · module: MOD-bridge-jobs
// guards: UC-011; A LOCAL AGENT USES THE PERSON'S OWN LOGIN
// given: a queued job of drafter, whose agent commits change.txt on the branch agent/work in its checkout and pushes it to its origin; the Bridge holds no token for the product, whose repository the computer's own git reaches (UC-011 4a); opencode offered with a working folder and an enclosure that records what it is asked
// input: startWatching; wait for the record's end
// expect: the agent's checkout's origin is the product's address, to which it pushed itself; the origin then holds agent/work at a commit whose change.txt reads "change", and its main holds no change.txt; the agent was started through the enclosure, with its checkout as working folder and exactly the checkout writable, after the enclosure was asked whether it works and prepared with it; no token file was left; the record ends done; the checkout is removed; counter-proof: the branch is not on the origin before the job
test("TST-1381001: the CLI session pushes its branch to the product itself, from a checkout whose origin is the product", async () => {
  await world(async (w) => {
    const job = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    const folder = w.folder("agent-work"), asked = [];
    const branchOnOrigin = () => spawnSync(REAL_GIT, ["--git-dir", w.products[PRODUCT_A].origin, "rev-parse", "--verify", "--quiet", "refs/heads/agent/work"], { encoding: "utf8" }).stdout.trim();
    assert.equal(branchOnOrigin(), "", "counter-proof: the branch is not on the origin before the job");
    watch(w, [{ name: "opencode", folder }], { enclosures: openEnclosures({ asked }) });
    await w.ended(job);

    const working = join(folder, "jobs", job.id);
    assert.ok(w.calls().includes(`pushed to ${PRODUCT_A}`), `the agent's origin is the product: ${w.calls().join(" | ")}`);
    assert.notEqual(branchOnOrigin(), "", "the agent's branch is on the origin");
    assert.equal(spawnSync(REAL_GIT, ["--git-dir", w.products[PRODUCT_A].origin, "show", "agent/work:change.txt"], { encoding: "utf8" }).stdout, "change\n");
    assert.equal(w.originText(PRODUCT_A, "change.txt"), "", "main is not changed");
    const wraps = asked.filter((entry) => entry.call === "wrap" && entry.args[0] === "run");
    assert.equal(wraps.length, 1, JSON.stringify(asked));
    assert.deepEqual(wraps[0].at, { workdir: working, writable: [working] });
    assert.equal(wraps[0].folder, folder);
    const order = asked.map((entry) => entry.call);
    assert.ok(order.indexOf("works") < order.indexOf("prepare") && order.indexOf("prepare") < order.lastIndexOf("wrap"), order.join(", "));
    assert.deepEqual(asked.find((entry) => entry.call === "prepare").at.writable, [working]);
    assert.match(w.originText(PRODUCT_A, job.path), /^state: done$/m);
    assert.equal(existsSync(working), false);
    assert.equal(existsSync(`${working}.out.git`), false, "no outbox is made");
  }, { branch: "agent/work" });
});

// TST-1112003 · level: component · module: MOD-bridge-jobs
// guards: UC-011; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: opencode offered with a working folder, which has run one job of drafter, so that the Bridge's clones of the product and of the instance are made; then, in the instance's clone, the leftover draft_response.json of that session, and in the agent's home home/tmp/opencode/final_answer.json; then the product's origin gains NEW.md and the instance's origin a third commit, which neither clone has fetched
// input: a second job of drafter, whose record names the instance's third commit; wait for its end
// expect: the agent of the second job starts in a checkout whose commit descends from the product's new commit — it holds NEW.md —, beside the instance's clone at the third commit; draft_response.json is gone and the home's file is kept; the record ends done; counter-proof: before the second job, the Bridge's clone of the product holds the origin's main before NEW.md and the instance's clone the first commit, which a session started without fetching would have read
test("TST-1112003: every CLI session starts on freshly fetched clones at its job's commits, with nothing an earlier session left there", async () => {
  await world(async (w) => {
    const folder = w.folder("agent-work");
    const first = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    watch(w, [{ name: "opencode", folder }]);
    await w.ended(first);
    writeFileSync(join(folder, "draft_response.json"), "{\"draft\":{\"answer\":\"old\"}}\n");
    mkdirSync(join(folder, "home", "tmp", "opencode"), { recursive: true });
    writeFileSync(join(folder, "home", "tmp", "opencode", "final_answer.json"), "{}\n");
    const productNow = w.push(w.products[PRODUCT_A].seed, { "NEW.md": "new\n" }, "the product moves");
    const third = w.push(w.instance.seed, { "marker.md": "v3\n" }, "third");
    const clone = join(folder, "products", "product-a");
    assert.notEqual(git(clone, "rev-parse", "refs/remotes/origin/main"), productNow, "counter-proof: the Bridge's clone of the product is behind its origin");
    assert.notEqual(git(folder, "rev-parse", "HEAD"), third, "counter-proof: the instance's clone is behind its origin");

    const second = w.queue(PRODUCT_A, JOB(ID(2), "drafter"), third);
    await w.ended(second);
    const probes = w.calls().filter((line) => line.startsWith("probe ")).map((line) => line.split(" ").slice(1));
    assert.equal(probes.length, 2, w.calls().join(" | "));
    const [checkoutAt, instanceAt, leftover, home, holds] = probes[1];
    assert.equal(git(w.root, "--git-dir", w.products[PRODUCT_A].origin, "merge-base", "--is-ancestor", productNow, checkoutAt), "", "the checkout's commit holds the product's new commit");
    assert.equal(holds, "new", "the checkout holds what the product's origin gained");
    assert.equal(instanceAt, third, "the instance's clone is at the commit the record names");
    assert.equal(leftover, "gone", "what an earlier session left in the instance's clone is gone");
    assert.equal(home, "home", "the agent's home is kept");
    assert.match(w.originText(PRODUCT_A, second.path), /^state: done$/m);
  }, { probe: true });
});

// TST-1381002 · level: unit · module: MOD-bridge-jobs
// guards: NO MODEL READS A CREDENTIAL
// given: two queued jobs of drafter; first a Bridge whose composition gives no enclosures, then one whose enclosure answers that it does not work, with the reason "bwrap: not found" and the step "an administrator installs the package bubblewrap"
// input: startWatching for each in turn; wait for each record's end
// expect: the first ends failed, its reason saying that no agent is started outside an enclosure; the second ends failed, its reason holding the enclosure's reason and its step; the agent was started by neither; counter-proof: TST-1381001, where the enclosure works, starts it
test("TST-1381002: without a working enclosure no agent is started, and the job ends failed naming why", async () => {
  await world(async (w) => {
    const first = w.queue(PRODUCT_A, JOB(ID(1), "drafter"));
    startWatching({ bridgeName: "lab-pc", agents: [{ name: "opencode", folder: w.folder("agent-work") }], products: [{ address: PRODUCT_A }], every: 100, instance: INSTANCE });
    await w.ended(first);
    const record = w.originText(PRODUCT_A, first.path);
    assert.match(record, /^state: failed$/m);
    assert.match(record, /^reason: .*no agent is started outside an enclosure/m);
    await stopWatching("quit");

    const second = w.queue(PRODUCT_A, JOB(ID(2), "drafter"));
    watch(w, [{ name: "opencode", folder: w.folder("agent-work-2") }], { enclosures: openEnclosures({ works: { works: false, reason: "bwrap: not found", setup: "an administrator installs the package bubblewrap" } }) });
    await w.ended(second);
    const refused = w.originText(PRODUCT_A, second.path);
    assert.match(refused, /^state: failed$/m);
    assert.match(refused, /^reason: .*bwrap: not found.*an administrator installs the package bubblewrap/m);
    assert.equal(runs(w).length, 0, "no agent was started");
  });
});

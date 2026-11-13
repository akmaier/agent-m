// The CLI sessions of the prompt bar's conversations on a Bridge — MOD-bridge-jobs as docs/architecture/MOD-bridge-jobs.md states them (ARC-055): "A request
// that names a `product` … and an `instance` commit is a message of the prompt bar to a CLI session. Without a `session`, the Bridge starts one as it starts a
// job's …, with MOD-agent-processes' `startSession` in the agent's enclosure, lists it as a job of the kind `converse` under a new identifier, and types into it
// the request's `input` followed by `token.md` where a file is left; with a `session` it holds running, it types the request's `input` into that one. The
// ask's `session` is the session's identifier; its answer is the session's `answer` to that input, with no usage, or `failed` with the agent's exit code where
// the agent exits first. A request that names a session the Bridge holds no running session under is `not-found` … A session ends when it is cancelled, when
// its agent exits, or when the Bridge quits; its checkout and its token file are then removed, and its log is kept"; listJobs: "of the kind `converse`,
// `running` while it lives, then `cancelled` when it was cancelled or the Bridge quit, `done` when its agent exited with 0, and `failed` when its agent exited
// otherwise; its `usage` is always null"; jobLog: "`partial` … for a CLI session of the prompt bar, the lines its screen shows"; the jobs' logs: "the lines
// `startSession`'s `onLine` hands as they scroll off its screen, and, when it ends, the lines its screen still shows"; Data: "a session's checkout that a quit
// the Bridge did not see through … left there is removed at the Bridge's next start"; and `{ name, folder, chrome }`, "`chrome` … handed to every start of
// that agent".
// Run: node --test tests/bridge-jobs-conversations.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: A CANCELLED JOB WRITES NOTHING MORE; NO COST IS GUESSED; THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX WEEKS; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-049; UC-044
// Level: component
//
// The world: bare repositories that git reaches through insteadOf, the fixture agent claude of tests/agent-processes.d/terminal-agent.mjs in a real
// pseudo-terminal, the fixture enclosures of tests/enclosure-fixture.mjs, and the Bridge's data folder with keepJobLogs. Where the module file leaves a reading
// open, the test states the one it takes:
//   - The checkout `jobs/<id>/` is removed at the Bridge's next start: by checkOut, which the Bridge runs at every start, for the sessions its kept listings
//     name that run no longer.
// Each test states its input and its expected result before it runs (given / input / expect).

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkOut, jobHandlers, keepJobLogs, listJobs, stopWatching } from "../src/bridge-jobs/index.mjs";
import { openEnclosures } from "./enclosure-fixture.mjs";
import { terminalAgent, WAITING } from "./agent-processes.d/terminal-agent.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";
Object.assign(process.env, { GIT_AUTHOR_NAME: "Seed", GIT_AUTHOR_EMAIL: "seed@example.org", GIT_COMMITTER_NAME: "Seed", GIT_COMMITTER_EMAIL: "seed@example.org" });
const REAL_GIT = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).stdout.trim();
const INSTANCE = "https://github.com/acme/agent-m", PRODUCT = "https://github.com/acme/widget";

function git(cwd, ...args) {
  const r = spawnSync(REAL_GIT, args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function repository(root, name, files) {
  const origin = join(root, `${name}.git`), seed = join(root, `${name}-seed`);
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  for (const [path, text] of Object.entries(files)) writeFileSync(join(seed, path), text);
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "first");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  return { origin, seed, head: git(seed, "rev-parse", "HEAD") };
}
const until = async (check, what, limit = 30000) => {
  for (const end = Date.now() + limit; Date.now() < end;) {
    const value = await check();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`timed out waiting for ${what}`);
};

// The Bridge's computer: the instance and the product behind insteadOf, the fixture claude and git on its PATH, its data folder keeping the jobs' logs, and
// the handlers of a Bridge offering claude with its working folder and its Chrome setting.
async function world(t, { chrome = true } = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-conversations-")));
  const bin = join(root, "bin"), folder = join(root, "work"), data = join(root, "data");
  mkdirSync(bin);
  mkdirSync(folder);
  writeFileSync(join(bin, "git"), `#!/bin/sh\nexec '${REAL_GIT}' "$@"\n`, { mode: 0o755 });
  terminalAgent(bin, "claude");
  const instance = repository(root, "instance", { "AGENTS.md": "# The rules\n" });
  const product = repository(root, "widget", { "README.md": "widget\n" });
  const files = { FIXTURE_ARGV: join(root, "argv.json"), FIXTURE_TOLD: join(root, "told.txt") };
  const prior = { PATH: process.env.PATH, HOME: process.env.HOME };
  Object.assign(process.env, { PATH: `${bin}:/bin:/usr/bin`, HOME: root, ...files, GIT_CONFIG_COUNT: "2",
    GIT_CONFIG_KEY_0: `url.${instance.origin}.insteadOf`, GIT_CONFIG_VALUE_0: INSTANCE, GIT_CONFIG_KEY_1: `url.${product.origin}.insteadOf`, GIT_CONFIG_VALUE_1: PRODUCT });
  keepJobLogs(data);
  const asked = [];
  const handlers = jobHandlers({ agents: [{ name: "claude", folder, chrome }], enclosures: openEnclosures({ asked }), instance: INSTANCE, products: [{ address: PRODUCT }] });
  t.after(async () => {
    await stopWatching("quit");
    for (const [key, value] of Object.entries(prior)) process.env[key] = value;
    for (const key of [...Object.keys(files), "GIT_CONFIG_COUNT", "GIT_CONFIG_KEY_0", "GIT_CONFIG_VALUE_0", "GIT_CONFIG_KEY_1", "GIT_CONFIG_VALUE_1"]) delete process.env[key];
    rmSync(root, { recursive: true, force: true });
  });
  const call = (route, request) => handlers[route]({ params: {}, query: {}, body: null, ...request });
  const message = (input, session) => call("POST /v1/ask", { body: { agent: "claude", model: "claude-opus-5-5", input, product: PRODUCT, instance: instance.head, ...(session ? { session } : {}) } });
  const answered = (ask) => until(async () => {
    const answer = await call("GET /v1/ask/{ask}", { params: { ask } });
    return answer.state === "running" ? null : answer;
  }, `the ask ${ask}`);
  const listed = (id) => listJobs().find((job) => job.id === id);
  const read = (file) => (existsSync(files[file]) ? readFileSync(files[file], "utf8") : null);
  return { root, folder, data, asked, call, message, answered, listed, read, checkout: (id) => join(folder, "jobs", id) };
}
const errorOf = async (promise) => { try { await promise; return null; } catch (error) { return error.code ?? error.name; } };

// TST-20261112571 · level: component · module: MOD-bridge-jobs
// guards: UC-049; UC-044; NO COST IS GUESSED; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a Bridge offering the fixture claude with its Chrome setting on, serving widget; no token kept for widget, so that no token file is left
// input: POST /v1/ask { agent: claude, model: claude-opus-5-5, input: "the page\nsplit the requirement", product: widget, instance: the instance's head } without a session; GET /v1/ask/{ask} until it is no longer running; GET /v1/jobs; GET /v1/jobs/{session}/log from 0; then POST /v1/ask with "and the next one" naming the session, and its answer
// expect: the first POST answers { ask, session } at once, the session an identifier JOB-…; GET /v1/jobs lists it { id: session, product: widget, kind: converse, agent: claude, state: running, usage: null }; the agent was started once, in its enclosure, in the checkout jobs/<session>/, with ["--permission-mode", "auto", "--settings", "{\"tui\":\"default\"}", "--model", "claude-opus-5-5", "--chrome"]; the first answer is done with "answer to split the requirement." and usage null; the log's partial holds the lines the screen shows, the waiting line among them; the second message is typed into the same agent — FIXTURE_TOLD holds both messages, the second without the first, and the agent was not started again — and answers "answer to and the next one."; the checkout is still there while the session runs; nothing was committed to widget
test("TST-20261112571: a conversation's first message starts its CLI session, listed as converse, and its next message is typed into that one", async (t) => {
  const it = await world(t);
  const first = await it.message("the page\nsplit the requirement");
  assert.match(first.session, /^JOB-[A-Za-z0-9-]+$/, JSON.stringify(first));
  assert.ok(first.ask);
  assert.deepEqual(it.listed(first.session) && { ...it.listed(first.session), started: null },
    { id: first.session, product: PRODUCT, kind: "converse", agent: "claude", state: "running", started: null, usage: null });
  const answer = await it.answered(first.ask);
  assert.deepEqual({ state: answer.state, text: answer.text, usage: answer.usage }, { state: "done", text: "answer to split the requirement.", usage: null });
  assert.deepEqual(JSON.parse(it.read("FIXTURE_ARGV")), ["--permission-mode", "auto", "--settings", "{\"tui\":\"default\"}", "--model", "claude-opus-5-5", "--chrome"]);
  const wraps = it.asked.filter((each) => each.call === "wrap" && each.command === "claude" && each.args.includes("--permission-mode"));
  assert.equal(wraps.length, 1, "started once, in its enclosure");
  assert.equal(wraps[0].at.workdir, it.checkout(first.session));
  const log = await it.call("GET /v1/jobs/{id}/log", { params: { id: first.session }, query: { from: "0" } });
  assert.ok(log.partial.split("\n").includes(WAITING.claude), log.partial);
  assert.equal(log.ended, false);
  const second = await it.message("and the next one", first.session);
  assert.equal(second.session, first.session);
  assert.equal((await it.answered(second.ask)).text, "answer to and the next one.");
  assert.equal(it.read("FIXTURE_TOLD"), "the page\nsplit the requirement\n--- end of message ---\nand the next one\n--- end of message ---\n");
  assert.equal(it.asked.filter((each) => each.call === "wrap" && each.command === "claude" && each.args.includes("--permission-mode")).length, 1, "not started again");
  assert.ok(existsSync(it.checkout(first.session)), "the checkout lives as long as the session");
});

// TST-20261112572 · level: component · module: MOD-bridge-jobs
// guards: A CANCELLED JOB WRITES NOTHING MORE; THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX WEEKS; UC-049
// given: a session of the fixture claude started by a first message and answered
// input: POST /v1/jobs/{session}/cancel; then GET /v1/jobs, the log from 0, and POST /v1/ask naming the session
// expect: the cancel is confirmed; the session is listed cancelled with usage null; its checkout jobs/<session>/ is removed; its log has ended and holds the lines its screen showed, the banner and the waiting line among them, and so does its file job-logs/<session>.log; the message naming it is refused not-found
test("TST-20261112572: a cancelled session ends with its agent, its checkout is removed and its log kept, and a message to it is not-found", async (t) => {
  const it = await world(t);
  const { ask, session } = await it.message("split the requirement");
  await it.answered(ask);
  assert.deepEqual(await it.call("POST /v1/jobs/{id}/cancel", { params: { id: session } }), { confirmed: true });
  assert.equal(it.listed(session).state, "cancelled");
  assert.equal(it.listed(session).usage, null);
  assert.equal(existsSync(it.checkout(session)), false, "the checkout is removed");
  const log = await it.call("GET /v1/jobs/{id}/log", { params: { id: session }, query: { from: "0" } });
  assert.equal(log.ended, true);
  assert.ok(log.lines.includes("fixture claude ready") && log.lines.includes(WAITING.claude), log.lines.join(" | "));
  const kept = readFileSync(join(it.data, "job-logs", `${session}.log`), "utf8");
  assert.ok(kept.includes("fixture claude ready") && kept.includes(WAITING.claude), kept);
  assert.equal(await errorOf(it.message("hello again", session)), "not-found");
});

// TST-20261112573 · level: component · module: MOD-bridge-jobs
// guards: UC-049; NO COST IS GUESSED
// given: sessions of the fixture claude
// input: a first message "/exit 3", which ends the agent with 3 before it answers; and a second session, answered, then typed "/exit 0"
// expect: the first ask fails, its error naming the exit code 3; that session is listed failed and its checkout removed; the second is listed done once its agent has exited with 0, its checkout removed; a later message naming either is not-found
test("TST-20261112573: an agent that exits by itself ends its session — failed or done by its exit — and the ask it had not answered fails with the exit code", async (t) => {
  const it = await world(t);
  const failed = await it.message("/exit 3");
  const answer = await it.answered(failed.ask);
  assert.equal(answer.state, "failed");
  assert.match(answer.error, /\b3\b/, answer.error);
  await until(() => it.listed(failed.session).state === "failed", "the failed listing");
  assert.equal(existsSync(it.checkout(failed.session)), false);
  const done = await it.message("split the requirement");
  await it.answered(done.ask);
  const exit = await it.message("/exit 0", done.session);
  assert.equal((await it.answered(exit.ask)).state, "failed", "the agent exited before it answered");
  await until(() => it.listed(done.session).state === "done", "the done listing");
  assert.equal(existsSync(it.checkout(done.session)), false);
  assert.equal(await errorOf(it.message("hello", failed.session)), "not-found");
  assert.equal(await errorOf(it.message("hello", done.session)), "not-found");
});

// TST-20261112574 · level: component · module: MOD-bridge-jobs
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-049
// given: a session of the fixture claude, running and answered
// input: stopWatching("quit") — the Bridge quits —
// expect: the session is listed cancelled, its checkout removed, its log ended
test("TST-20261112574: a Bridge that quits ends every running session as a cancel ends it", async (t) => {
  const it = await world(t);
  const { ask, session } = await it.message("split the requirement");
  await it.answered(ask);
  await stopWatching("quit");
  assert.equal(it.listed(session).state, "cancelled");
  assert.equal(existsSync(it.checkout(session)), false);
  assert.equal((await it.call("GET /v1/jobs/{id}/log", { params: { id: session }, query: { from: "0" } })).ended, true);
});

// TST-20261112575 · level: component · module: MOD-bridge-jobs
// guards: UC-049
// given: in the data folder's job-logs/, the listing of a session JOB-20261101-1000-aaaa of the kind converse, which an earlier start left running, and of a job JOB-20261101-1000-bbbb of the kind decide-gate; in the agent's working folder a checkout jobs/<id>/ of each; and a session of this start, running
// input: checkOut({ instance, products: [], agents: [{ name: claude, folder }] }), as the Bridge's start runs it
// expect: the earlier session's checkout is removed; the job's checkout and the running session's are left
test("TST-20261112575: a checkout an earlier start's session left is removed at the next start", async (t) => {
  const it = await world(t);
  const running = await it.message("split the requirement");
  await it.answered(running.ask);
  const left = "JOB-20261101-1000-aaaa", job = "JOB-20261101-1000-bbbb";
  for (const [id, kind] of [[left, "converse"], [job, "decide-gate"]]) {
    writeFileSync(join(it.data, "job-logs", `${id}.json`), JSON.stringify({ id, product: PRODUCT, kind, agent: "claude", state: "running", started: "2026-11-01T10:00:00.000Z", usage: null }));
    mkdirSync(it.checkout(id), { recursive: true });
    writeFileSync(join(it.checkout(id), ".agent-m-token"), "glpat-LEFT");
  }
  await checkOut({ instance: INSTANCE, products: [], agents: [{ name: "claude", folder: it.folder }] });
  assert.equal(existsSync(it.checkout(left)), false, "the earlier session's checkout is removed");
  assert.equal(existsSync(it.checkout(job)), true, "a job's checkout is left");
  assert.equal(existsSync(it.checkout(running.session)), true, "the running session's checkout is left");
});

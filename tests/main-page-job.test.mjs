// MOD-main-page's route `job` — one job's page (ITM-971), as the accepted text of docs/architecture/MOD-main-page.md (Interfaces: `jobs`, `job`) and UC-036 (step 4, 5, 4a, 4b) state it: "`job` (`params.id`) — one job: its inputs, …
// its log while it runs, its cost — or *unknown* (`NO COST IS GUESSED`); … for a job waiting at a gate, the gate — what it checks, what to examine, who decides". This item builds the inputs, the log, the cost and the gate; the
// commits, the pull request and the CI runs, *Pass gate* and *Reject*, *Cancel* and *Retry* are other items'.
// Run: node --test tests/main-page-job.test.mjs
//
// Module: MOD-main-page
// Guards: ONE DASHBOARD SHOWS EVERY JOB; NO COST IS GUESSED; A RECORD IS EVIDENCE, NOT A PROPOSAL; UC-036
// Level: unit
//
// The real MOD-job-ledger, MOD-runtimes, MOD-bridge-client, MOD-repository-hosts, MOD-browser-store and MOD-site-frame run as they are; only `fetch` is faked, by the helper tests/main-page-home-harness.mjs: the counting fake of GitHub,
// the Bridge lab-pc-4 (which lists the job `net.bridgeLists` with the usage `net.bridgeUsage` and answers its log through `net.bridgeLog`) and the workflow runs `net.ciRuns`. No request leaves the fixtures; nothing sleeps.
//
// Readings the module file leaves open, which the tests state (the pull request names them):
//   - The page is <section class="job-page"> of <h2> "Job <id>" and these parts, each with the class named: .job-facts (the product's address, what the job works on, kind, participant, where it runs, state, elapsed time), <ul class="job-inputs">
//     (one <li> for each input of the record), <ul class="job-destinations"> (one <li> "<participant>, at <place>: <part>, <part>."), <pre class="job-params"> (the record's parameters as JSON), .job-log, .job-cost and, for a job waiting at a
//     gate, .job-gate.
//   - The log: a Bridge job's lines are the text of <pre class="job-log-lines">, one line after another as the stream yields them; a CI job's is <a class="log-link"> to the run's address; where the runtime keeps no log, <p class="log-gone">
//     "The runtime keeps no log for this job any more." and, where the record's end names a log, <a class="record-link"> to it.
//   - The cost: <p class="job-cost"> reading "<amount> <currency> (<basis>)" where known, else the usage — "<n> input tokens, <n> output tokens, <n> minutes", each part only where the runtime reported it — followed by " · price unknown",
//     else "unknown". No amount is written where none is known.
//   - The gate: <p class="job-gate"> with <span class="gate-name"> (what the gate checks, as the record names it) and <span class="gate-decider"> (the role, agent or check that decides it); where the decider is a CI check
//     (`check: <name>`), also <span class="gate-self"> "decides by itself".
//   - A job no source holds: <p class="job-missing"> "No job <id> in the instance or in the products this browser keeps.".
//   - On the route `jobs`, the identifier of each row is a <button type="button" class="job-link"> that calls the ViewContext's go("job", { id }).

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/main-page/index.mjs";
import { startRecord, appendToRecord } from "../src/job-ledger/index.mjs";
import { INSTANCE, PRODUCT, PRODUCT_URL, browser, byClass, click, draw, instanceFiles, network, smallProduct, timers } from "./main-page-home-harness.mjs";

const job = view.routes.find((candidate) => candidate.name === "job");
const jobs = view.routes.find((candidate) => candidate.name === "jobs");
let net;
afterEach(() => {
  net?.restore();
  timers.restore();
});

const at = (text) => new Date(`${text}:00Z`);
const RUN = "https://github.com/alice/product/actions/runs/101";
const ID = "JOB-20261016-1000-ffff";

/** A job record of dev-cli for ITM-0900, started 10:00 UTC, with the parts given. */
function record({ id = ID, route = "bridge lab-pc-4", inputs = [], destinations = [], params = {}, taken = "lab-pc-4", gate = null, end = null } = {}) {
  let { path, text } = startRecord({ id, kind: "implement-item", worksOn: ["ITM-0900"], participant: "dev-cli", model: "model-x", route, run: null, retries: null, startedBy: "alice", start: at("2026-10-16T10:00"),
    agentM: { version: "2026.1.0", commit: "abc1234" }, inputs, limit: 5, task: "in parameters", conversation: null, destinations, params });
  if (taken) text = appendToRecord(text, { part: "taken", at: at("2026-10-16T10:00"), by: taken });
  if (gate) text = appendToRecord(text, { part: "gate reached", at: at("2026-10-16T10:30"), gate: gate.name, decider: gate.decider });
  if (end) text = appendToRecord(text, { part: "end", at: at("2026-10-16T11:00"), state: end.state ?? "done", results: [], draft: null, rounds: [], usage: end.usage ?? null, cost: end.cost ?? { known: false, usage: null }, reason: null, log: end.log ?? null });
  return { path, text };
}
const open = async (records) => {
  net = network({ [PRODUCT]: smallProduct({ jobs: records }), [INSTANCE]: instanceFiles() }, { bridgeLists: records.length === 1 ? records[0].path.match(/(JOB-[^.]+)/)[1] : null });
  return net;
};
const drawJob = async (params) => {
  const context = browser();
  const target = await draw(job, context, params);
  return { target, context };
};
const flush = async () => { for (let n = 0; n < 60; n += 1) await new Promise((resolve) => setImmediate(resolve)); };
const one = (target, name) => byClass(target, name)[0];
const textsOf = (target, name) => byClass(target, name).map((node) => node.textContent);

// TST-971001 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; A RECORD IS EVIDENCE, NOT A PROPOSAL; UC-036 (step 4)
// given: the product alice/product holding the record of JOB-20261016-1000-ffff (implement-item for ITM-0900, dev-cli, taken by the Bridge lab-pc-4, which lists it as running), whose inputs are docs/use-cases/UC-001-first.md and SPEC.md, whose destination is dev-cli at lab-pc-4 with the parts "the chosen item" and "SPEC.md", and whose parameters are { "item": "ITM-0900" }
// input: the route job drawn with params { id: "JOB-20261016-1000-ffff" }
// expect: the heading "Job JOB-20261016-1000-ffff"; the facts name the product's address, ITM-0900, implement-item, dev-cli, lab-pc-4 and the state running; the inputs are the two paths in the order of the record; the destination reads "dev-cli, at lab-pc-4: the chosen item, SPEC.md."; the parameters read as the JSON of { "item": "ITM-0900" }
test("TST-971001 a job's page shows its inputs, destinations and parameters from the record, and its facts", async () => {
  const given = record({ inputs: ["docs/use-cases/UC-001-first.md", "SPEC.md"], destinations: [{ participant: "dev-cli", place: "lab-pc-4", parts: ["the chosen item", "SPEC.md"] }], params: { item: "ITM-0900" } });
  await open([given]);
  net.install();
  const { target } = await drawJob({ id: ID });
  assert.equal(byClass(target, "job-facts").length, 1, "known positive: the page is drawn");
  assert.equal(target.textContent.includes(`Job ${ID}`), true);
  const facts = one(target, "job-facts").textContent;
  for (const part of [PRODUCT_URL, "ITM-0900", "implement-item", "dev-cli", "lab-pc-4", "running"]) assert.equal(facts.includes(part), true, `the facts name ${part}`);
  assert.deepEqual(textsOf(target, "job-input"), ["docs/use-cases/UC-001-first.md", "SPEC.md"]);
  assert.deepEqual(textsOf(target, "job-destination"), ["dev-cli, at lab-pc-4: the chosen item, SPEC.md."]);
  assert.equal(one(target, "job-params").textContent, JSON.stringify({ item: "ITM-0900" }, null, 2));
});

// TST-971002 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-036 (step 4)
// given: the job of TST-971001, running on lab-pc-4, whose log the Bridge gives in two answers: from line 0 "compiling" and "testing" (not ended), and, once the test releases it, from line 2 "all green" (ended)
// input: the route job drawn; then the second answer released
// expect: once drawn, the log lines read "compiling" and "testing", the Bridge having been asked from line 0 and, its first answer not ended, from line 2, which it holds back; after the release they read "compiling", "testing" and "all green" — the log grows as the Bridge streams it, and the page was drawn before the stream ended
test("TST-971002 a Bridge job's log grows as the Bridge streams it", async () => {
  await open([record()]);
  let release;
  const second = new Promise((resolve) => { release = resolve; });
  net.bridgeLog = async (id, from) => (from === 0 ? { lines: ["compiling", "testing"], next: 2, ended: false } : (await second, { lines: ["all green"], next: 3, ended: true }));
  net.install();
  const { target } = await drawJob({ id: ID });
  await flush();
  assert.equal(one(target, "job-log-lines").textContent, "compiling\ntesting");
  const asked = () => net.requests.filter((request) => request.host === "127.0.0.1:4711" && request.url.includes("/log")).map((request) => new URL(request.url).searchParams.get("from"));
  assert.deepEqual(asked(), ["0", "2"], "the second ask is held by the Bridge");
  release();
  await flush();
  assert.equal(one(target, "job-log-lines").textContent, "compiling\ntesting\nall green");
  assert.deepEqual(asked(), ["0", "2"]);
});

// TST-971003 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-036 (step 4)
// given: a job taken by the CI run https://github.com/alice/product/actions/runs/101, which the job workflow's run list holds in progress
// input: the route job drawn
// expect: the log is a link to https://github.com/alice/product/actions/runs/101 (class log-link) and no line of a log; the Bridge was not asked for any log
test("TST-971003 a CI job's log is a link to the run", async () => {
  await open([record({ id: "JOB-20261016-1000-aaaa", route: "ci hosted", taken: RUN })]);
  net.ciRuns = [{ id: 101, status: "in_progress", conclusion: null, html_url: RUN, path: ".github/workflows/agent-m-jobs.yml", head_sha: "a".repeat(40), event: "push" }];
  net.install();
  const { target } = await drawJob({ id: "JOB-20261016-1000-aaaa" });
  await flush();
  assert.equal(one(target, "log-link").getAttribute("href"), RUN);
  assert.deepEqual(byClass(target, "job-log-lines"), []);
  assert.deepEqual(net.requests.filter((request) => request.url.includes("/log")), []);
});

// TST-971004 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; A RECORD IS EVIDENCE, NOT A PROPOSAL; UC-036 (4a)
// given: a job taken by this tab and done, whose end names the log https://github.com/alice/product/actions/runs/7 — the runtime keeps no log of a tab's job — and, for the counter-proof, a job that no runtime has taken
// input: the route job drawn for each
// expect: the page says "The runtime keeps no log for this job any more." (class log-gone) and links the log its end names (class record-link); the job no runtime has taken says the same and links nothing; neither shows a log line or a log link
test("TST-971004 a log the runtime no longer keeps is said so, with the links the record holds", async () => {
  const done = record({ id: "JOB-20261016-0900-bbbb", route: "tab", taken: "tab", end: { state: "done", log: "https://github.com/alice/product/actions/runs/7" } });
  const queued = record({ id: "JOB-20261016-0800-cccc", route: "tab", taken: null });
  await open([done, queued]);
  net.install();
  const first = (await drawJob({ id: "JOB-20261016-0900-bbbb" })).target;
  assert.equal(one(first, "log-gone").textContent, "The runtime keeps no log for this job any more.");
  assert.equal(one(first, "record-link").getAttribute("href"), "https://github.com/alice/product/actions/runs/7");
  assert.deepEqual([byClass(first, "job-log-lines").length, byClass(first, "log-link").length], [0, 0]);
  const second = (await drawJob({ id: "JOB-20261016-0800-cccc" })).target;
  assert.equal(one(second, "log-gone").textContent, "The runtime keeps no log for this job any more.");
  assert.deepEqual([byClass(second, "record-link").length, byClass(second, "job-log-lines").length], [0, 0]);
});

// TST-971005 · level: unit · module: MOD-main-page
// guards: NO COST IS GUESSED; UC-036 (4b)
// given: three jobs — JOB-20261016-0900-dddd done with a cost its runtime reported (0.41 EUR); JOB-20261016-1000-eeee running on lab-pc-4 whose Bridge reports 1,200 input and 300 output tokens and no cost, the participant declaring no price; JOB-20261016-0800-ffff failed with an unknown cost and no usage
// input: the route job drawn for each
// expect: the costs read "0.41 EUR (reported)"; "1200 input tokens, 300 output tokens · price unknown", which writes no amount and no currency; and exactly "unknown" — never a 0 for a cost nobody knows; counter-proof: a page that wrote 0 for an unknown cost, or an amount for the usage, fails this test
test("TST-971005 the cost is the reported amount, the usage with price unknown, or unknown — never a figure nobody reported", async () => {
  const known = record({ id: "JOB-20261016-0900-dddd", route: "tab", taken: "tab", end: { state: "done", cost: { known: true, amount: 0.41, currency: "EUR", basis: "reported" } } });
  const usage = record({ id: "JOB-20261016-1000-eeee" });
  const unknown = record({ id: "JOB-20261016-0800-ffff", route: "tab", taken: "tab", end: { state: "failed" } });
  net = network({ [PRODUCT]: smallProduct({ jobs: [known, usage, unknown] }), [INSTANCE]: instanceFiles() }, { bridgeLists: "JOB-20261016-1000-eeee" });
  net.bridgeUsage = { inputTokens: 1200, outputTokens: 300, minutes: null, cost: null };
  net.install();
  const cost = async (id) => one((await drawJob({ id })).target, "job-cost").textContent;
  assert.equal(await cost("JOB-20261016-0900-dddd"), "0.41 EUR (reported)");
  const priced = await cost("JOB-20261016-1000-eeee");
  assert.equal(priced, "1200 input tokens, 300 output tokens · price unknown");
  assert.equal(/EUR|USD|€|\$/.test(priced), false);
  assert.equal(await cost("JOB-20261016-0800-ffff"), "unknown");
});

// TST-971006 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-036 (step 5)
// given: JOB-20261016-0900-1111, which reached the gate "pull request" decided by "Product Owner" and waits there, and JOB-20261016-0900-2222, which reached the gate "unit tests" decided by "check: unit-tests"
// input: the route job drawn for each
// expect: the first names the gate "pull request" and the decider "Product Owner" and does not say it decides by itself; the second names "unit tests" and "check: unit-tests" and says "decides by itself"; a job that waits at no gate (TST-971001's) shows no gate part
test("TST-971006 a job waiting at a gate names the gate and its decider, and says when a check decides by itself", async () => {
  const person = record({ id: "JOB-20261016-0900-1111", route: "tab", taken: null, gate: { name: "pull request", decider: "Product Owner" } });
  const check = record({ id: "JOB-20261016-0900-2222", route: "tab", taken: null, gate: { name: "unit tests", decider: "check: unit-tests" } });
  const plain = record({ id: "JOB-20261016-0900-3333", route: "tab", taken: null });
  await open([person, check, plain]);
  net.install();
  const first = (await drawJob({ id: "JOB-20261016-0900-1111" })).target;
  assert.deepEqual([one(first, "gate-name").textContent, one(first, "gate-decider").textContent, byClass(first, "gate-self").length], ["pull request", "Product Owner", 0]);
  const second = (await drawJob({ id: "JOB-20261016-0900-2222" })).target;
  assert.deepEqual([one(second, "gate-name").textContent, one(second, "gate-decider").textContent, one(second, "gate-self").textContent], ["unit tests", "check: unit-tests", "decides by itself"]);
  assert.deepEqual(byClass((await drawJob({ id: "JOB-20261016-0900-3333" })).target, "job-gate"), []);
});

// TST-971007 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-036 (step 4)
// given: the product with one job; and an id none of the sources holds
// input: the route jobs drawn and the button of the job's row pressed; the route job drawn for the id nobody holds
// expect: pressing the button calls go("job", { id: "JOB-20261016-1000-ffff" }) once; the missing id gives "No job JOB-20261016-9999-zzzz in the instance or in the products this browser keeps." (class job-missing) and no facts
test("TST-971007 a row of the list links its job's page, and a job no source holds is said missing", async () => {
  await open([record()]);
  net.install();
  const { target, context } = await drawJob({ id: "JOB-20261016-9999-zzzz" });
  assert.equal(one(target, "job-missing").textContent, "No job JOB-20261016-9999-zzzz in the instance or in the products this browser keeps.");
  assert.deepEqual(byClass(target, "job-facts"), []);
  const list = browser();
  const listed = await draw(jobs, list);
  click(byClass(listed, "job-link")[0]);
  assert.deepEqual(list.went, [["job", { id: ID, product: PRODUCT_URL }]]);
  assert.deepEqual(context.went, []);
});

// TST-971008 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB
// given: the module's view
// input: the route `job` read
// expect: named "job", titled "Job", under no entry of the menu (entry null), with the frame's default subject (no `subject`) and a render function
test("TST-971008 the view hands the frame the route job", () => {
  assert.equal(job.name, "job");
  assert.equal(job.title, "Job");
  assert.equal(job.entry, null);
  assert.equal("subject" in job, false);
  assert.equal(typeof job.render, "function");
});

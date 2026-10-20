// MOD-main-page's route `job` — *Cancel*, and the job shown as cancelling until its runtime confirms (ITM-972), as the accepted text of docs/architecture/MOD-main-page.md (Interfaces: `job`, `jobs`) and UC-036 (step 6, 6a) state
// it: "*Cancel* for a queued, running or waiting job, whose end, cancelled, MOD-runtimes' `cancelJob` appends once its runtime confirms"; one click through MOD-site-frame's `confirmDecision`; on `"cancelling"` the job is shown
// *cancelling* inside *running* and read again; every state carries its folded explanation.
// Run: node --test tests/main-page-job-cancel.test.mjs
//
// Module: MOD-main-page
// Guards: A CANCELLED JOB WRITES NOTHING MORE; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; UC-036
// Level: unit
//
// The real MOD-job-ledger, MOD-runtimes, MOD-bridge-client, MOD-repository-hosts, MOD-browser-store and MOD-site-frame run as they are; only `fetch` is faked: by tests/main-page-home-harness.mjs (the fake GitHub, the Bridge lab-pc-4 listing the
// job as running) and, over it, by this file, which answers the Bridge's cancel (`POST /v1/jobs/<id>/cancel`, { confirmed }) and the writes of one commit to alice/product (the ref, the tree, the commit and the move of the ref), keeping what it was
// given. No request leaves the fixtures; nothing sleeps.
//
// Readings the module file leaves open, which the tests state (the pull request names them):
//   - The job's page has <button class="job-cancel"> "Cancel" for a job whose state is queued, running or waiting at a gate, and for no other; a click of the person (an event the browser made) opens MOD-site-frame's confirmDecision
//     (<section class="decision">, its confirm button "Cancel the job"); a click a script makes, and a declined dialog, call nothing. <p class="job-cancel-result"> says what came of it.
//   - The answer "cancelled" draws the page again from the record read again, which now holds the end; the answer "cancelling" shows the state *cancelling* in the facts, appends nothing, and sets a timer that reads the job again.
//   - A job shown as cancelling stays so, on the route `jobs` too, while its runtime still lists it; in the list it stands in the group *running* (the group's header says running, the row's state says cancelling), and the list draws the
//     folded explanation of the state cancelling (topic job-state-cancelling) among those of the states.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { view } from "../src/main-page/index.mjs";
import { startRecord, appendToRecord } from "../src/job-ledger/index.mjs";
import { INSTANCE, PRODUCT, browser, byClass, draw, headOf, instanceFiles, network, runningJob, smallProduct, timers, withEnd } from "./main-page-home-harness.mjs";

const job = view.routes.find((candidate) => candidate.name === "job");
const jobs = view.routes.find((candidate) => candidate.name === "jobs");
// A job of its own for each test: the page keeps the jobs it asked to cancel in memory (the module is loaded once).
let ID = "JOB-20261016-1000-ffff";
const use = (n) => { ID = `JOB-20261016-1000-f00${n}`; };
let net;
afterEach(() => { net?.restore(); timers.restore(); document.body.replaceChildren(); });

const flush = async () => { for (let n = 0; n < 60; n += 1) await new Promise((resolve) => setImmediate(resolve)); };
const trusted = async (node) => { const event = new Event("click"); Object.defineProperty(event, "isTrusted", { value: true }); node.dispatchEvent(event); await flush(); };
const untrusted = async (node) => { node.dispatchEvent(new Event("click")); await flush(); };
const buttons = (root) => { const found = []; (function walk(node) { for (const child of node.children ?? []) { if (typeof child === "string") continue; if (child.localName === "button") found.push(child); walk(child); } })(root); return found; };
const labelled = (root, text) => buttons(root).find((button) => button.textContent === text);
const one = (target, name) => byClass(target, name)[0];

/** The record of the job with the state given: running (taken, lab-pc-4), queued (not taken), waiting (taken and at a gate) or done. */
function jobIn(state) {
  const { path, text } = startRecord({ id: ID, kind: "implement-item", worksOn: ["ITM-0900"], participant: "dev-cli", model: "model-x", route: "bridge lab-pc-4", run: null, retries: null, startedBy: "alice",
    start: new Date("2026-10-16T10:00:00Z"), agentM: { version: "2026.1.0", commit: "abc1234" }, inputs: [], limit: 5, task: "in parameters", conversation: null, destinations: [], params: {} });
  if (state === "queued") return { path, text };
  const taken = appendToRecord(text, { part: "taken", at: new Date("2026-10-16T10:00:00Z"), by: "lab-pc-4" });
  if (state === "waiting") return { path, text: appendToRecord(taken, { part: "gate reached", at: new Date("2026-10-16T10:30:00Z"), gate: "Development → Sprint Review", decider: "reviewer" }) };
  return { path, text: state === "done" ? withEnd(taken, "done") : taken };
}

/** The fake world: the product holding `given`, the Bridge lab-pc-4 listing the job as running, and the Bridge's cancel and the product's writes answered over it. */
function world(given, { bridgeConfirms }) {
  net = network({ [PRODUCT]: smallProduct({ jobs: [given] }), [INSTANCE]: instanceFiles() }, { bridgeLists: ID });
  net.install();
  const seen = { cancels: [], writes: [] };
  const inner = globalThis.fetch;
  const ended = () => smallProduct({ jobs: [{ path: given.path, text: withEnd(given.text, "cancelled") }] });
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const method = String(init.method ?? "GET").toUpperCase();
    const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
    if (url.host === "127.0.0.1:4711" && method === "POST" && url.pathname === `/v1/jobs/${ID}/cancel`) { seen.cancels.push(url.pathname); return json({ confirmed: bridgeConfirms }); }
    if (url.host === "api.github.com" && url.pathname.startsWith(`/repos/${PRODUCT}/git/`)) {
      if (method === "GET" && url.pathname.endsWith("/git/ref/heads/main")) return json({ object: { sha: headOf(PRODUCT) } });
      if (method === "GET" && url.pathname.includes("/git/commits/")) return json({ tree: { sha: "tree-1" } });
      if (method === "POST" && url.pathname.endsWith("/git/trees")) { seen.writes.push(JSON.parse(init.body)); return json({ sha: "tree-2" }); }
      if (method === "POST" && url.pathname.endsWith("/git/commits")) return json({ sha: "commit-2" });
      if (method === "PATCH") { net.change(PRODUCT, ended()); globalThis.fetch = inner === globalThis.fetch ? inner : globalThis.fetch; return json({}); }
    }
    return inner(input, init);
  };
  return seen;
}

const drawJob = async () => { const context = browser(); return { target: await draw(job, context, { id: ID }), context }; };

// TST-972001 · level: unit · module: MOD-main-page
// guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-036
// given: the job JOB-20261016-1000-ffff in each of the states queued, running (the Bridge lists it), waiting at a gate and done
// input: the route job drawn for it, in each state
// expect: a button Cancel for queued, running and waiting at a gate, and none for done (counter-proof: a Cancel on a done job fails); in every case no request goes to the Bridge's cancel and no dialog is open before a click
test("TST-972001 Cancel is offered for a queued, running or waiting job, and not for a done one, and nothing is asked before the click", async () => {
  use(1);
  const offered = {};
  for (const state of ["queued", "running", "waiting", "done"]) {
    const seen = world(jobIn(state), { bridgeConfirms: true });
    const { target } = await drawJob();
    offered[state] = labelled(target, "Cancel") !== undefined;
    assert.deepEqual(seen.cancels, [], `${state}: no cancel before the click`);
    assert.deepEqual(byClass(document.body, "decision"), [], `${state}: no dialog before the click`);
    assert.equal(one(target, "job-facts") !== undefined, true, `${state}: known positive, the page is drawn`);
    net.restore();
    document.body.replaceChildren();
  }
  assert.deepEqual(offered, { queued: true, running: true, waiting: true, done: false });
});

// TST-972002 · level: unit · module: MOD-main-page
// guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION
// given: the running job; the Bridge would confirm a cancel
// input: a click a script makes on Cancel; the person's click on Cancel with the dialog declined (its button Cancel); then the person's click on Cancel and the dialog's Cancel the job
// expect: the script's click opens no dialog; the declined dialog calls nothing; the confirmed one calls the Bridge's cancel exactly once
test("TST-972002 one confirmed click calls cancelJob once, and a click a script makes or a declined dialog calls nothing", async () => {
  use(2);
  const seen = world(jobIn("running"), { bridgeConfirms: true });
  const { target } = await drawJob();
  await untrusted(labelled(target, "Cancel"));
  assert.deepEqual(byClass(document.body, "decision"), []);
  assert.deepEqual(seen.cancels, []);
  await trusted(labelled(target, "Cancel"));
  assert.equal(byClass(document.body, "decision").length, 1, "the person's click opens the dialog");
  await trusted(labelled(byClass(document.body, "decision")[0], "Cancel"));
  assert.deepEqual(seen.cancels, [], "declined: nothing was called");
  await trusted(labelled(target, "Cancel"));
  await trusted(labelled(byClass(document.body, "decision")[0], "Cancel the job"));
  assert.equal(seen.cancels.length, 1);
});

// TST-972003 · level: unit · module: MOD-main-page
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-036
// given: the running job, whose Bridge confirms the cancel; the product's repository takes the commit that appends the end
// input: Cancel, confirmed
// expect: one commit's tree holds the record at its path with the end cancelled, and the page shows the state cancelled
test("TST-972003 a confirmed cancel appends the end cancelled and the job is shown cancelled", async () => {
  use(3);
  const seen = world(jobIn("running"), { bridgeConfirms: true });
  const { target } = await drawJob();
  await trusted(labelled(target, "Cancel"));
  await trusted(labelled(byClass(document.body, "decision")[0], "Cancel the job"));
  assert.equal(seen.writes.length, 1);
  assert.equal(seen.writes[0].tree.length, 1);
  assert.equal(seen.writes[0].tree[0].path, jobIn("running").path);
  assert.equal(/## End[\s\S]*cancelled/.test(seen.writes[0].tree[0].content), true);
  assert.equal(one(target, "job-facts").textContent.includes("cancelled"), true);
  assert.equal(one(target, "job-facts").textContent.includes("cancelling"), false);
});

// TST-972004 · level: unit · module: MOD-main-page
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-036
// given: the running job, whose Bridge does not confirm the cancel
// input: Cancel, confirmed; then the timer the page set fires
// expect: nothing is written; the facts show the state cancelling (not cancelled); a timer was set, and when it fires the Bridge's list is asked again and the job stays cancelling while the Bridge lists it
test("TST-972004 an unconfirmed cancel shows the job cancelling, appends nothing and reads the job again", async () => {
  use(4);
  const seen = world(jobIn("running"), { bridgeConfirms: false });
  const { target } = await drawJob();
  await trusted(labelled(target, "Cancel"));
  await trusted(labelled(byClass(document.body, "decision")[0], "Cancel the job"));
  assert.equal(seen.cancels.length, 1);
  assert.deepEqual(seen.writes, []);
  const facts = () => one(target, "job-facts").textContent;
  assert.equal(facts().includes("cancelling"), true);
  assert.equal(facts().includes("cancelled"), false);
  assert.equal(timers.waiting.length >= 1, true, "the page reads the job again later");
  const asked = net.bridgeAsked();
  await timers.fire();
  await flush();
  assert.equal(net.bridgeAsked() > asked, true);
  assert.equal(one(target, "job-facts").textContent.includes("cancelling"), true);
});

// TST-972005 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; EVERY STEP EXPLAINS ITSELF; UC-036
// given: the job of TST-972004 shown as cancelling; the explanations file
// input: the route jobs drawn
// expect: the job's row says cancelling, and its group header says running (no group header says cancelling); a folded explanation of the state cancelling is drawn (data-state cancelling), and the file holds the section job-state-cancelling
test("TST-972005 a cancelling job stands in the group running of the list, with the explanation of its state", async () => {
  use(5);
  world(jobIn("running"), { bridgeConfirms: false });
  const { target } = await drawJob();
  await trusted(labelled(target, "Cancel"));
  await trusted(labelled(byClass(document.body, "decision")[0], "Cancel the job"));
  const list = await draw(jobs, browser());
  const row = byClass(list, "job").find((node) => node.getAttribute("data-id") === ID);
  assert.equal(byClass(row, "state")[0].textContent, "cancelling");
  assert.deepEqual(byClass(list, "group").map((node) => node.getAttribute("data-state")), ["running"]);
  assert.equal(byClass(list, "job-state-explain").some((node) => node.getAttribute("data-state") === "cancelling"), true);
  assert.equal(readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8").includes("## job-state-cancelling"), true);
});

// MOD-main-page's route `job` — *Retry* and *Pass gate* judge the job's items from the backlog's view of the product's head (ITM-1264), as the accepted text of
// docs/architecture/MOD-main-page.md (Interfaces: `job`) states it: "*Retry* and *Pass gate* take the states, holds and running sprints of the job's items from the backlog's view of
// the product's head (MOD-progress-measures' `storedView`, `asOf` null), and read besides only the declaration, the declared model's file and the role assignments; while the head's view
// is not stored yet, they say so and offer nothing, and where the product stores no view, they read the facts of the scope `work`."
// Run: node --test tests/main-page-job-stored-view.test.mjs
//
// Module: MOD-main-page
// Guards: UC-036; A PAGE LOAD READS THE REPOSITORY IN BATCHES; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; A JOB GOES ONLY TO A HOLDER OF ITS ROLE; A JOB STOPS AT EVERY GATE
// Level: component
//
// The worlds are those of tests/main-page-job-retry.test.mjs (scrum: team1's sprint 01 selects ITM-0900, Developers dev-cli and dev-two; the failed job of dev-cli on ITM-0900) and of
// tests/main-page-job-gate.test.mjs (kanban: the job of dev-cli waiting at the gate Review → Done, decided by Reviewer; the person carol), over the fake GitHub of
// tests/main-page-home-harness.mjs; each product holds besides one gate record under docs/gates/ of another job. This file's fetch, over the harness's, serves the instance's commit the
// declaration names as the instance's `main`, and the branch overview-cache of the product: `<commit>.backlog.json.gz` and `latest.json` as `overview` holds them, else 404 — each such
// request counted in `cache`. The backlog view stored for the product's head is backlogView of the product's facts of the scope `work`, read before the page is drawn; the requests the page
// makes are those the harness's fake records from then on. No request leaves the fixtures; nothing sleeps.
// Readings the texts leave open, which the tests state (the pull request names them):
//   - A file is read when its path stands in a request the fake records: by itself or in a batch.
//   - The page of one job reads the job records of every source as the list does (ITM-1269 changes that); so each product holds the one record of its job, and "no file under docs/jobs/
//     other than the job's own record" is what Retry and Pass gate add to it.
//   - While the head's view is not stored, the part of Retry, <div class="job-retry">, and that of the gate, <div class="gate-decision">, say that the view of the newest commit is being
//     stored, and offer no button.
// Each test states its input and its expected result before it runs (given / input / expect).

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { view } from "../src/main-page/index.mjs";
import { startRecord, appendToRecord } from "../src/job-ledger/index.mjs";
import { writeSetting } from "../src/browser-store/index.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { backlogView, productFacts } from "../src/progress-measures/index.mjs";
import { INSTANCE, INSTANCE_TOKEN, PRODUCT, PRODUCT_TOKEN, browser, byClass, draw, headOf, instanceFiles, network, smallProduct, timers, withEnd } from "./main-page-home-harness.mjs";

const job = view.routes.find((candidate) => candidate.name === "job");
let net;
afterEach(() => { net?.restore(); timers.restore(); document.body.replaceChildren(); });

const walk = (root, match) => { const found = []; (function visit(node) { for (const child of node.children ?? []) { if (typeof child === "string") continue; if (match(child)) found.push(child); visit(child); } })(root); return found; };
const one = (root, name) => byClass(root, name)[0];
const optionsOf = (select) => walk(select, (node) => node.localName === "option").map((node) => node.value);
const buttons = (target, ...labels) => walk(target, (node) => node.localName === "button" && labels.includes(node.textContent));

const MODEL = headOf(INSTANCE), HEAD = headOf(PRODUCT), C0 = "0c".repeat(20);
const GATE_RECORD = "docs/gates/20261016-0900-development-review-aaaa.md";
const GATE_TEXT = ["---", "gate: Development → Review", "job: JOB-20261016-0900-0001", "decider: carol", "role: Reviewer", "decision: passed", "on:", `  - ${HEAD}`, "date: 2026-10-16 09:00 UTC", "---", "# Development → Review", ""].join("\n");

// ---------------------------------------------------------------- the world of Retry (tests/main-page-job-retry.test.mjs)
const RETRIED = "JOB-20261016-1000-7e01";
const SCRUM = ["---", "model: scrum", "model_file: src/model-catalogue/models/scrum.md", `model_version: ${MODEL}`, "---", "# Process", "", "## Practices", "", "- none", "", "## Branches", "",
  "| Phase or time box | Branch |", "|---|---|", "| Sprint | sprint/<team>/<nn> |", "", "## Definition of Done", "", "The job rules hold; no condition is added.", ""].join("\n");
const TEAM1 = ["# Role assignment of the product", "", "## Roles", "", "| Role | Participants |", "|---|---|", "| Product Owner | alice |", "| Scrum Master | alice |", "| Developers | dev-cli, dev-two |", ""].join("\n");
const SPRINT = ["---", "sprint: 1", "goal: The fixture sprint", "start: 2026-10-12", "end: ", "closer: alice", "branch: ", "selection:", "  - ITM-0900", "---", "# team1 Sprint 01", ""].join("\n");
const REGISTER = ["# Participants of this instance", "", "**REGISTER**", "", "The people and agents of the fixture instance.", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| alice | person | — | — | — | read the repository, write to the repository | — | account github.com/alice |",
  "| dev-cli | CLI agent | model-x | 200000 | — | read the repository, write to the repository, run code and tests | lab-pc-4 | bridge lab-pc-4 agent claude |",
  "| dev-two | CLI agent | model-y | 200000 | — | read the repository, write to the repository, run code and tests | lab-pc-4 | bridge lab-pc-4 agent codex |", ""].join("\n");
function failedJob() {
  const { path, text } = startRecord({ id: RETRIED, kind: "implement-item", worksOn: ["ITM-0900"], participant: "dev-cli", model: "model-x", route: "bridge lab-pc-4", run: null, retries: null, startedBy: "alice",
    start: new Date("2026-10-16T10:00:00Z"), agentM: { version: "2026.1.0", commit: "abc1234" }, inputs: [`docs/backlog/ITM-0900-work.md@${"b".repeat(40)}`], limit: 5, task: "in parameters", conversation: null, destinations: [], params: { item: "ITM-0900" } });
  return { path, text: withEnd(appendToRecord(text, { part: "taken", at: new Date("2026-10-16T10:00:00Z"), by: "lab-pc-4" }), "failed") };
}
const retryWorld = () => ({ id: RETRIED, files: { ...smallProduct({ jobs: [failedJob()] }), "docs/process.md": SCRUM, "docs/role-assignments/team1.md": TEAM1, "docs/backlog/sprints/team1/01.md": SPRINT, [GATE_RECORD]: GATE_TEXT },
  instance: { "SPEC.md": "# Instance — Specification\n", "docs/participants.md": REGISTER }, person: null });

// ---------------------------------------------------------------- the world of a gate (tests/main-page-job-gate.test.mjs)
const WAITING = "JOB-20261016-1000-9a01";
const KANBAN = ["---", "model: kanban", "model_file: src/model-catalogue/models/kanban.md", `model_version: ${MODEL}`, "---", "# Process", "", "## Practices", "", "- none", "", "## Branches", "",
  "| Phase or time box | Branch |", "|---|---|", "| Development | work/<item> |", "", "## Definition of Done", "", "The job rules hold; no condition is added.", ""].join("\n");
const REVIEWERS = ["# Role assignment of the product", "", "## Roles", "", "| Role | Participants |", "|---|---|", "| Product owner | alice |", "| Developer | dev-cli |", "| Reviewer | carol, dev-cli |", ""].join("\n");
function waitingJob() {
  const { path, text } = startRecord({ id: WAITING, kind: "implement-item", worksOn: ["ITM-0900"], participant: "dev-cli", model: "model-x", route: "bridge lab-pc-4", run: null, retries: null, startedBy: "alice",
    start: new Date("2026-10-16T10:00:00Z"), agentM: { version: "2026.1.0", commit: "abc1234" }, inputs: [`docs/backlog/ITM-0900-work.md@${"b".repeat(40)}`], limit: 5, task: "in parameters", conversation: null, destinations: [], params: {} });
  const taken = appendToRecord(text, { part: "taken", at: new Date("2026-10-16T10:00:00Z"), by: "lab-pc-4" });
  return { path, text: appendToRecord(taken, { part: "gate reached", at: new Date("2026-10-16T10:30:00Z"), gate: "Review → Done", decider: "Reviewer" }) };
}
const gateWorld = () => ({ id: WAITING, files: { ...smallProduct({ jobs: [waitingJob()] }), "docs/process.md": KANBAN, "docs/role-assignments/product.md": REVIEWERS, [GATE_RECORD]: GATE_TEXT },
  instance: instanceFiles(), person: "carol", lists: WAITING });

// The backlog view of the product's files as the workflow stores it for `commit`: backlogView of the product's facts of the scope `work`, gzipped.
async function storedView(commit) {
  const host = connect(parseAddress(`https://github.com/${PRODUCT}`), { token: PRODUCT_TOKEN });
  const instanceHost = connect(parseAddress(`https://github.com/${INSTANCE}`), { token: INSTANCE_TOKEN });
  const facts = await productFacts(host, await instanceHost.readSnapshot("main"), (at) => instanceHost.readSnapshot(at), new Date(), { scope: "work" });
  return gzipSync(JSON.stringify({ ...backlogView({ ...facts, requirements: [] }, new Date()), commit }));
}

// The world drawn: its network, the overview-cache of the product (`stored`: "head" — the view of the head; "c0" — latest.json naming 0c…0c and its view), the job's page, and what the page read.
async function drawn(world, stored) {
  net = network({ [PRODUCT]: world.files, [INSTANCE]: world.instance }, { bridgeLists: world.lists ?? null });
  net.install();
  const overview = {}, cache = [];
  const inner = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    if (url.host === "api.github.com" && url.pathname === `/repos/${INSTANCE}/commits/${MODEL}`) return inner(new URL(`https://api.github.com/repos/${INSTANCE}/commits/main`), init);
    if (url.host === "api.github.com" && url.searchParams.get("ref") === "overview-cache" && url.pathname.startsWith(`/repos/${PRODUCT}/contents/`)) {
      const path = decodeURIComponent(url.pathname.slice(`/repos/${PRODUCT}/contents/`.length));
      cache.push(path);
      return Object.hasOwn(overview, path) ? new Response(overview[path], { status: 200 }) : new Response('{"message":"Not Found"}', { status: 404 });
    }
    return inner(input, init);
  };
  if (stored === "head") overview[`${HEAD}.backlog.json.gz`] = await storedView(HEAD);
  if (stored === "c0") Object.assign(overview, { "latest.json": `${JSON.stringify({ commit: C0 })}\n`, [`${C0}.backlog.json.gz`]: await storedView(C0) });
  const context = browser();
  if (world.person) writeSetting(context.store, `github-token:${PRODUCT}`, { value: PRODUCT_TOKEN, name: world.person, expires: "2027-01-01" });
  const from = net.server.log.length;
  const target = await draw(job, context, { id: world.id });
  return { target, cache, read: net.server.log.slice(from).flatMap((entry) => entry.files) };
}
const jobRecords = (read) => [...new Set(read.filter((path) => path.startsWith("docs/jobs/")))];

// TST-1264101 · level: component · module: MOD-main-page
// guards: UC-036; A JOB GOES ONLY TO A HOLDER OF ITS ROLE; A PAGE LOAD READS THE REPOSITORY IN BATCHES; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: the failed job of dev-cli on ITM-0900 (scrum, team1's sprint 01 selects ITM-0900, Developers dev-cli and dev-two); overview-cache holding the backlog view of the product's head
// input: the route job drawn
// expect: Retry is offered with the participants dev-cli (first) and dev-two, as TST-974002 expects; the page reads one file of overview-cache, no file under docs/gates/, and under docs/jobs/
//         only the job's own record
test("TST-1264101 Retry takes the job's item from the head's stored view: the holders offered, one read of overview-cache, no gate record, no other job's record", async () => {
  const { target, cache, read } = await drawn(retryWorld(), "head");
  assert.equal(buttons(target, "Retry").length, 1, target.textContent.slice(0, 2000));
  assert.deepEqual(optionsOf(one(target, "retry-participant")), ["dev-cli", "dev-two"]);
  assert.deepEqual(cache, [`${HEAD}.backlog.json.gz`]);
  assert.deepEqual(read.filter((path) => path.startsWith("docs/gates/")), [], "no gate record is read");
  assert.deepEqual(jobRecords(read), [`docs/jobs/${RETRIED}.md`]);
});

// TST-1264102 · level: component · module: MOD-main-page
// guards: A JOB STOPS AT EVERY GATE; A PAGE LOAD READS THE REPOSITORY IN BATCHES; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-036
// given: the job of dev-cli waiting at the gate Review → Done of the kanban model, decided by Reviewer; the person carol, a holder of Reviewer; overview-cache holding the backlog view of the product's head
// input: the route job drawn
// expect: the gate part shows what the gate checks and Pass gate and Reject enabled, as TST-801001 expects; the page reads one file of overview-cache, no file under docs/gates/, and under
//         docs/jobs/ only the job's own record
test("TST-1264102 Pass gate takes the job's item from the head's stored view: offered to the role's holder, one read of overview-cache, no gate record", async () => {
  const { target, cache, read } = await drawn(gateWorld(), "head");
  assert.equal((one(target, "gate-checks")?.textContent ?? "").includes("the review has checked the item"), true, target.textContent.slice(0, 2000));
  assert.equal(Boolean(one(target, "gate-pass").disabled), false);
  assert.equal(Boolean(one(target, "gate-reject").disabled), false);
  assert.deepEqual(cache, [`${HEAD}.backlog.json.gz`]);
  assert.deepEqual(read.filter((path) => path.startsWith("docs/gates/")), [], "no gate record is read");
  assert.deepEqual(jobRecords(read), [`docs/jobs/${WAITING}.md`]);
});

// TST-1264103 · level: component · module: MOD-main-page
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-036
// given: the worlds of TST-1264101 and TST-1264102, with overview-cache holding no view of the head, latest.json naming 0c0c…0c and its backlog view
// input: the route job drawn for each
// expect: neither Retry nor Pass gate nor Reject is offered; the part of each says that the view of the newest commit is being stored
test("TST-1264103 while the head's view is being stored, neither Retry nor Pass gate is offered, and the page says why", async () => {
  const retried = await drawn(retryWorld(), "c0");
  assert.equal(buttons(retried.target, "Retry", "Open the prompt bar").length, 0, "no Retry");
  assert.match(one(retried.target, "job-retry")?.textContent ?? "", /being stored/);
  net.restore();
  document.body.replaceChildren();
  const waiting = await drawn(gateWorld(), "c0");
  assert.equal(buttons(waiting.target, "Pass gate", "Reject").length, 0, "no Pass gate");
  assert.match(one(waiting.target, "gate-decision")?.textContent ?? "", /being stored/);
});

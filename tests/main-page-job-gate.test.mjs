// MOD-main-page's route `job` — a person passes or rejects a gate the job waits at (ITM-801), as the accepted text of docs/architecture/MOD-main-page.md (Interfaces: `job`) and UC-034 (step 7, 7a) state it: "for a job waiting
// at a gate, the gate — what it checks, what to examine, who decides — and, for a person who may decide it, *Pass gate* and *Reject* with a reason. *Pass gate* stays unavailable, with the role and its holders named, for a person
// who does not hold the deciding role or did the work the gate checks (`A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`). The decision is recorded with `recordGateDecision` under the person's account".
// Run: node --test tests/main-page-job-gate.test.mjs
//
// Module: MOD-main-page
// Guards: A JOB STOPS AT EVERY GATE; A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS; A GATE IS DECIDED WITHIN THE JOB'S ROLE ASSIGNMENT; THE GATE IS RECORDED; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-034
// Level: unit
//
// The real MOD-job-ledger, MOD-progress-measures, MOD-product-process, MOD-work-plans, MOD-repository-hosts, MOD-browser-store and MOD-site-frame run as they are; only `fetch` is faked: by tests/main-page-home-harness.mjs (the fake GitHub),
// and, over it, by this file, which serves the instance's commit that the product's declaration names as the commit of the instance's `main`, and answers the writes of one commit to alice/product (the ref, the tree, the commit and the
// move of the ref), keeping what it was given. The product follows the kanban model (a gate `Review → Done` decided by the role Reviewer, no sprints, one role assignment). No request leaves the fixtures; nothing sleeps.
//
// Readings the module file leaves open, which the tests state (the pull request names them):
//   - The person is named as the product's stored token names them (its `name`), as the prompt bar names the person who starts a job; that name is the decider of the record, and its kind is `person`.
//   - The job's role assignment is the one role assignment of a product without sprints (MOD-work-plans' Data), else the team's whose sprint holds the job's item; the participants whose work the gate checks are the job's participant.
//   - `on` of the record is the job's inputs (`<path>@<blob>`), else the product's head commit.
//   - The page: <div class="gate-decision"> holds <p class="gate-checks"> (the gate's condition), <p class="gate-examine"> (its artifacts), <button class="gate-pass"> "Pass gate", <button class="gate-reject"> "Reject" and
//     <p class="gate-unavailable"> where the person may not decide, which names the role, its holders and the reason, with both buttons disabled; <p class="gate-result"> says what came of a click. A click a script makes calls nothing.
//     The dialogs are MOD-site-frame's confirmDecision (<section class="decision">; confirm buttons "Pass the gate" and "Reject the gate", the second with a reason field).

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/main-page/index.mjs";
import { startRecord, appendToRecord } from "../src/job-ledger/index.mjs";
import { writeSetting } from "../src/browser-store/index.mjs";
import { INSTANCE, PRODUCT, PRODUCT_TOKEN, browser, byClass, draw, headOf, instanceFiles, network, smallProduct, timers } from "./main-page-home-harness.mjs";

const job = view.routes.find((candidate) => candidate.name === "job");
const ID = "JOB-20261016-1000-9a01";
const BLOB = "b".repeat(40);
let net;
afterEach(() => { net?.restore(); timers.restore(); document.body.replaceChildren(); });

const flush = async () => { for (let n = 0; n < 80; n += 1) await new Promise((resolve) => setImmediate(resolve)); };
const trusted = async (node) => { const event = new Event("click"); Object.defineProperty(event, "isTrusted", { value: true }); node.dispatchEvent(event); await flush(); };
const untrusted = async (node) => { node.dispatchEvent(new Event("click")); await flush(); };
const walk = (root, match) => { const found = []; (function visit(node) { for (const child of node.children ?? []) { if (typeof child === "string") continue; if (match(child)) found.push(child); visit(child); } })(root); return found; };
const one = (root, name) => byClass(root, name)[0];
const dialog = () => byClass(document.body, "decision")[0];
const inDialog = (text) => walk(dialog(), (node) => node.localName === "button" && node.textContent === text)[0];

const DECLARATION = ["---", "model: kanban", "model_file: src/model-catalogue/models/kanban.md", `model_version: ${headOf(INSTANCE)}`, "---", "# Process", "", "## Practices", "", "- none", "", "## Branches", "",
  "| Phase or time box | Branch |", "|---|---|", "| Development | work/<item> |", "", "## Definition of Done", "", "The job rules hold; no condition is added.", ""].join("\n");
const ASSIGNMENT = ["# Role assignment of the product", "", "## Roles", "", "| Role | Participants |", "|---|---|", "| Product owner | alice |", "| Developer | dev-cli |", "| Reviewer | carol, dev-cli |", ""].join("\n");

/** The job (taken, dev-cli, working on ITM-0900) waiting at the gate `Review → Done`, decided by the role Reviewer. */
function waitingJob() {
  const { path, text } = startRecord({ id: ID, kind: "implement-item", worksOn: ["ITM-0900"], participant: "dev-cli", model: "model-x", route: "bridge lab-pc-4", run: null, retries: null, startedBy: "alice",
    start: new Date("2026-10-16T10:00:00Z"), agentM: { version: "2026.1.0", commit: "abc1234" }, inputs: [`docs/backlog/ITM-0900-work.md@${BLOB}`], limit: 5, task: "in parameters", conversation: null, destinations: [], params: {} });
  const taken = appendToRecord(text, { part: "taken", at: new Date("2026-10-16T10:00:00Z"), by: "lab-pc-4" });
  return { path, text: appendToRecord(taken, { part: "gate reached", at: new Date("2026-10-16T10:30:00Z"), gate: "Review → Done", decider: "Reviewer" }) };
}

/** The world: the product with the job, the declaration and the role assignment; the Bridge lab-pc-4 listing the job; the writes of one commit answered, and kept. `person` is the name of the product's stored token. */
function world(person) {
  const files = { ...smallProduct({ jobs: [waitingJob()] }), "docs/process.md": DECLARATION, "docs/role-assignments/product.md": ASSIGNMENT };
  net = network({ [PRODUCT]: files, [INSTANCE]: instanceFiles() }, { bridgeLists: ID });
  net.install();
  const seen = { trees: [], commits: [], moves: 0 };
  const inner = globalThis.fetch;
  const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const method = String(init.method ?? "GET").toUpperCase();
    if (url.host === "api.github.com" && url.pathname === `/repos/${INSTANCE}/commits/${headOf(INSTANCE)}`) return inner(new URL(`https://api.github.com/repos/${INSTANCE}/commits/main`), init);
    if (url.host === "api.github.com" && url.pathname.startsWith(`/repos/${PRODUCT}/git/`) && !url.pathname.includes("/git/trees/")) {
      if (method === "GET" && url.pathname.endsWith("/git/ref/heads/main")) return json({ object: { sha: headOf(PRODUCT) } });
      if (method === "GET" && url.pathname.includes("/git/commits/")) return json({ tree: { sha: "tree-1" } });
      if (method === "POST" && url.pathname.endsWith("/git/commits")) { seen.commits.push(JSON.parse(init.body)); return json({ sha: "commit-2" }); }
      if (method === "PATCH") { seen.moves += 1; return json({}); }
    }
    if (url.host === "api.github.com" && method === "POST" && url.pathname === `/repos/${PRODUCT}/git/trees`) { seen.trees.push(JSON.parse(init.body)); return json({ sha: "tree-2" }); }
    return inner(input, init);
  };
  const context = browser();
  writeSetting(context.store, `github-token:${PRODUCT}`, { value: PRODUCT_TOKEN, name: person, expires: "2027-01-01" });
  return { seen, context };
}
const drawJob = async (context) => draw(job, context, { id: ID });

// TST-801001 · level: unit · module: MOD-main-page
// guards: A JOB STOPS AT EVERY GATE; UC-034 (step 7)
// given: the job waiting at the gate Review → Done of the kanban model (condition: the review has checked the item; artifacts: the item's MOD and TST; decider: Reviewer); the person carol, a holder of Reviewer, whom the product's token names
// input: the route job drawn
// expect: the gate part names the gate and the decider; the page shows what the gate checks and what to examine, from the workflow; Pass gate and Reject are offered and enabled; nothing is written before a click
test("TST-801001 a holder of the deciding role is shown the gate — what it checks, what to examine, who decides — and Pass gate and Reject", async () => {
  const { seen, context } = world("carol");
  const target = await drawJob(context);
  assert.deepEqual([one(target, "gate-name").textContent, one(target, "gate-decider").textContent], ["Review → Done", "Reviewer"]);
  assert.equal(one(target, "gate-checks").textContent.includes("the review has checked the item"), true);
  assert.equal(one(target, "gate-examine").textContent.includes("the item's MOD and TST"), true);
  const pass = one(target, "gate-pass"), reject = one(target, "gate-reject");
  assert.equal(pass.textContent, "Pass gate");
  assert.equal(reject.textContent, "Reject");
  assert.equal(Boolean(pass.disabled), false);
  assert.equal(Boolean(reject.disabled), false);
  assert.deepEqual(byClass(target, "gate-unavailable"), []);
  assert.deepEqual(seen.trees, []);
});

// TST-801002 · level: unit · module: MOD-main-page
// guards: THE GATE IS RECORDED; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-034 (step 7)
// given: the world of TST-801001
// input: a click a script makes on Pass gate; the person's click on Pass gate with the dialog declined; then the person's click and the dialog's Pass the gate
// expect: the first two write nothing; the third writes one commit whose message is "gates: Review → Done passed by carol" and whose tree holds one new file under docs/gates/ naming the gate, the job, the decider carol, the role Reviewer, the decision passed and the job's input `docs/backlog/ITM-0900-work.md@<blob>` among its `on`; the page says the gate was passed by carol
test("TST-801002 a holder passes the gate with one click, and the record names them", async () => {
  const { seen, context } = world("carol");
  const target = await drawJob(context);
  await untrusted(one(target, "gate-pass"));
  assert.equal(dialog(), undefined);
  await trusted(one(target, "gate-pass"));
  assert.equal(byClass(document.body, "decision").length, 1);
  await trusted(inDialog("Cancel"));
  assert.deepEqual(seen.trees, []);
  await trusted(one(target, "gate-pass"));
  await trusted(inDialog("Pass the gate"));
  assert.equal(seen.trees.length, 1);
  assert.equal(seen.trees[0].tree.length, 1);
  const { path, content } = seen.trees[0].tree[0];
  assert.equal(path.startsWith("docs/gates/"), true, path);
  for (const line of ["gate: Review → Done", `job: ${ID}`, "decider: carol", "role: Reviewer", "decision: passed", `docs/backlog/ITM-0900-work.md@${BLOB}`]) assert.equal(content.includes(line), true, `the record holds ${line}`);
  assert.equal(seen.commits.length, 1);
  assert.equal(seen.commits[0].message, "gates: Review → Done passed by carol");
  assert.equal(seen.moves, 1);
  assert.equal(one(target, "gate-result").textContent.includes("carol"), true);
});

// TST-801003 · level: unit · module: MOD-main-page
// guards: A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS; A GATE IS DECIDED WITHIN THE JOB'S ROLE ASSIGNMENT; UC-034 (7a)
// given: the world of TST-801001, but the token names dev-cli, who did the job's work and holds Developer; and then dave, who holds no role
// input: the route job drawn for each; the person's click on the disabled Pass gate
// expect: Pass gate and Reject are disabled, and the page names the role Reviewer and its holders (carol) and the reason — for dev-cli "did the work this gate checks", for dave "not a holder of the deciding role"; a click writes nothing (counter-proof: the implementer's own Pass gate fails when enabled)
test("TST-801003 the implementer's own Pass gate, and a non-holder's, are unavailable with the role and its holders named", async () => {
  for (const [person, reason] of [["dev-cli", "did the work this gate checks"], ["dave", "not a holder of the deciding role"]]) {
    const { seen, context } = world(person);
    const target = await drawJob(context);
    assert.equal(Boolean(one(target, "gate-pass").disabled), true, `${person}: Pass gate is disabled`);
    assert.equal(Boolean(one(target, "gate-reject").disabled), true, `${person}: Reject is disabled`);
    const said = one(target, "gate-unavailable").textContent;
    for (const part of ["Reviewer", "carol", reason]) assert.equal(said.includes(part), true, `${person}: the page says ${part}: ${said}`);
    await trusted(one(target, "gate-pass"));
    assert.equal(dialog(), undefined);
    assert.deepEqual(seen.trees, []);
    net.restore();
    document.body.replaceChildren();
  }
});

// TST-801004 · level: unit · module: MOD-main-page
// guards: THE GATE IS RECORDED; ONE CLICK PER DECISION; UC-034 (step 7)
// given: the world of TST-801001
// input: the person's click on Reject, confirmed with the reason left empty; then the same with the reason "the review found no test"
// expect: the first writes nothing and the page says the rejection needs its reason; the second writes one record with the decision rejected, whose text holds the reason
test("TST-801004 a rejection needs its reason, and is recorded with it", async () => {
  const { seen, context } = world("carol");
  const target = await drawJob(context);
  await trusted(one(target, "gate-reject"));
  await trusted(inDialog("Reject the gate"));
  assert.deepEqual(seen.trees, []);
  assert.equal(/needs its reason/.test(one(target, "gate-result").textContent), true);
  await trusted(one(target, "gate-reject"));
  const field = walk(dialog(), (node) => node.localName === "textarea")[0];
  field.value = "the review found no test";
  await trusted(inDialog("Reject the gate"));
  assert.equal(seen.trees.length, 1);
  const { content } = seen.trees[0].tree[0];
  assert.equal(content.includes("decision: rejected"), true);
  assert.equal(content.includes("the review found no test"), true);
});

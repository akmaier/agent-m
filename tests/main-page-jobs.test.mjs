// MOD-main-page's route `jobs` — the list of every job of the instance and of its products (ITM-509), as the accepted text of docs/architecture/MOD-main-page.md (Interfaces: `view`, `jobs`)
// and UC-046, UC-036 and UC-049 state it: "every job of every product and of the instance in one list — the job of this tab's conversation in the prompt bar among them, which has no
// record and is shown as this tab's (`currentJob`) —, waiting at a gate first, filtered by product, state, participant or runtime; each row with identifier, product, what it works on, kind,
// participant, where it runs, state, elapsed time and cost where known; a source that cannot be reached is named with its reason."
// Run: node --test tests/main-page-jobs.test.mjs
//
// Module: MOD-main-page
// Guards: ONE DASHBOARD SHOWS EVERY JOB; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; NO COST IS GUESSED; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-036; UC-046; UC-049
// Level: unit
//
// This imports the shared small DOM of tests/site-frame.test.mjs unchanged, as the other tests of the views do. The real MOD-job-ledger, MOD-runtimes, MOD-bridge-client, MOD-repository-hosts,
// MOD-browser-store and MOD-prompt-bar run as they are; the only thing that is faked is the global `fetch`, which is a spy: it keeps every request, answers the fixtures' three GitHub
// repositories and two Bridges, and refuses any other address with a TypeError (the request is then kept as `unrouted`). No request leaves the fixtures.
//
// Readings the module file leaves open, which the tests state (the pull request names them):
//   - The rows are <tr class="job"> with a <td> each of the classes id, product, works-on, kind, participant, runs, state, elapsed and cost, in a <table class="jobs">; the job of this tab's
//     conversation is <tr class="job this-tab">, with "this tab's" in the cell where a row holds its identifier, and no identifier.
//   - The elapsed time is written "1h 2m 3s". A record's times are kept to the minute (MOD-job-ledger), so an ended job's seconds are 0.
//   - A live state that is not reachable is written after the state, as "not reachable: <reason>", in a <span class="reason"> of the state cell.
//   - The four filters are <select class="filter"> with data-filter product, state, participant and runs; each offers "all" first and then the values the rows hold, sorted; choosing a value is
//     the select's value and a `change` event.
//   - A source that cannot be read is an <li class="source"> of a <ul class="unreadable"> above the list, "<address>: <the reason its host gives>".
//   - The instance is connected as the product is, with the token `github-token`, from the address https://github.com/<its repository>.

import "./site-frame.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { startRecord, appendToRecord } from "../src/job-ledger/index.mjs";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";
import { startPromptBar } from "../src/prompt-bar/index.mjs";
import { sourceStrategies } from "../src/source-register/index.mjs";

const { view } = await import("../src/main-page/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "jobs");

// ---------------------------------------------------------------- the clock: one moment for every `new Date()` and Date.now() while a page is drawn

const NOW = Date.parse("2026-10-16T12:00:00Z");
const RealDate = globalThis.Date;
const clock = { now: NOW };
class FixedDate extends RealDate {
  constructor(...given) { if (given.length === 0) super(clock.now); else super(...given); }
  static now() { return clock.now; }
}
async function atClock(moment, run) {
  clock.now = moment;
  globalThis.Date = FixedDate;
  try { return await run(); } finally { globalThis.Date = RealDate; }
}

// ---------------------------------------------------------------- the job records of the fixtures

const at = (text) => new RealDate(`${text}:00Z`);
function recordText({ id, kind, worksOn, participant, route: where, start, taken = null, gate = null, end = null }) {
  let { text } = startRecord({ id, kind, worksOn, participant, model: "model-x", route: where, run: null, retries: null, startedBy: "alice", start: at(start),
    agentM: { version: "2026.1.0", commit: "abc1234" }, inputs: [], limit: 5, task: "in parameters", conversation: null, destinations: [], params: {} });
  if (taken) text = appendToRecord(text, { part: "taken", at: at(start), by: taken });
  if (gate) text = appendToRecord(text, { part: "gate reached", at: at(gate), gate: "pull request", decider: "Product Owner" });
  if (end) {
    text = appendToRecord(text, { part: "end", at: at(end.at), state: end.state, results: [], draft: null, rounds: [], usage: null, cost: end.cost ?? { known: false, usage: null },
      reason: end.reason ?? null, log: null });
  }
  return text;
}

// The instance acme/agent-m: a job done on this tab with a cost of 0.41 EUR as its runtime reported it, and a job waiting at a gate that no route has taken.
const DONE = recordText({ id: "JOB-20261015-0900-aaaa", kind: "derive-use-cases", worksOn: ["EXPORT IS A PDF"], participant: "drafter-a", route: "tab", start: "2026-10-15T09:00",
  taken: "tab", end: { at: "2026-10-15T09:12", state: "done", cost: { known: true, amount: 0.41, currency: "EUR", basis: "reported" } } });
const WAITING = recordText({ id: "JOB-20261016-0800-bbbb", kind: "implement-item", worksOn: ["ITM-014"], participant: "dev-cli", route: "bridge lab-pc-3", start: "2026-10-16T08:00",
  gate: "2026-10-16T08:30" });
// The product acme/library (private): a failed job on the Bridge lab-pc-3 that has ended, and a running one on lab-pc-3 that this browser does not keep.
const FAILED = recordText({ id: "JOB-20261014-1000-cccc", kind: "write-tests", worksOn: ["ITM-014"], participant: "claude-cli", route: "bridge lab-pc-3", start: "2026-10-14T10:00",
  taken: "lab-pc-3", end: { at: "2026-10-14T11:05", state: "failed", reason: "tests red" } });
const UNKEPT = recordText({ id: "JOB-20261016-0900-dddd", kind: "derive-requirements", worksOn: ["SRC-007"], participant: "claude-cli", route: "bridge lab-pc-3", start: "2026-10-16T09:00",
  taken: "lab-pc-3" });
// The product acme/atlas (public): a cancelled job on this tab, a running one on lab-pc-4 (kept, answering), and a running one on lab-pc-5 (kept, not running).
const CANCELLED = recordText({ id: "JOB-20261013-0700-eeee", kind: "propose-tests", worksOn: ["MOD-atlas-reader"], participant: "drafter-a", route: "tab", start: "2026-10-13T07:00",
  taken: "tab", end: { at: "2026-10-13T07:03", state: "cancelled", reason: "cancelled by a person" } });
const ON_FOUR = recordText({ id: "JOB-20261016-1000-ffff", kind: "write-code", worksOn: ["MOD-atlas-reader"], participant: "dev-cli", route: "bridge lab-pc-4", start: "2026-10-16T10:00",
  taken: "lab-pc-4" });
const ON_FIVE = recordText({ id: "JOB-20261016-0930-gggg", kind: "write-code", worksOn: ["ITM-021"], participant: "dev-cli", route: "bridge lab-pc-5", start: "2026-10-16T09:30",
  taken: "lab-pc-5" });

const COLUMNS = "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|";
const REGISTER = `# Participants of this instance\n\n${COLUMNS}\n| drafter-a | model endpoint | model-drafter-a | 200000 | — | draft text | Anthropic, USA | endpoint ep1 |\n`;

const INSTANCE = "https://github.com/acme/agent-m", LIBRARY = "https://github.com/acme/library", ATLAS = "https://github.com/acme/atlas", MISSING = "https://github.com/acme/missing";
const TOKENS = { "acme/agent-m": "github_pat_INSTANCEfixture0123456789", "acme/library": "github_pat_LIBRARYfixture0123456789" };
const REPOSITORIES = {
  "acme/agent-m": { private: true, files: { "docs/jobs/JOB-20261015-0900-aaaa.md": DONE, "docs/jobs/JOB-20261016-0800-bbbb.md": WAITING, "docs/participants.md": REGISTER, "README.md": "# Agent M\n" } },
  "acme/library": { private: true, files: { "docs/jobs/JOB-20261014-1000-cccc.md": FAILED, "docs/jobs/JOB-20261016-0900-dddd.md": UNKEPT } },
  "acme/atlas": { private: false, files: { "docs/jobs/JOB-20261013-0700-eeee.md": CANCELLED, "docs/jobs/JOB-20261016-1000-ffff.md": ON_FOUR, "docs/jobs/JOB-20261016-0930-gggg.md": ON_FIVE } },
};
const sha = (text) => createHash("sha1").update(text).digest("hex");

// ---------------------------------------------------------------- the spy: the global fetch

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}

const realFetch = globalThis.fetch;
const spy = { requests: [], unrouted: [], hangs: 0 };
const text = (body) => new Response(body, { status: 200, headers: { "content-type": "text/plain" } });
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
function headerOf(init, name) {
  const given = init?.headers ?? {};
  const found = Object.entries(given instanceof Headers ? Object.fromEntries(given.entries()) : given).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return found ? String(found[1]) : null;
}
// GitHub's API as the host reads it: the repository, its default branch's commit, the commit's tree, and a file by its commit — through the API for a private repository (with the token),
// from the raw host for a public one. A private repository answers 404 to a request without its own token.
function github(request) {
  const { url, authorization } = request;
  const path = decodeURIComponent(url.pathname);
  const api = /^\/repos\/([^/]+\/[^/]+)(\/.*)?$/.exec(path);
  if (url.host === "api.github.com" && api) {
    const [, name, rest = ""] = api;
    const repository = REPOSITORIES[name];
    if (!repository || (repository.private && authorization !== `Bearer ${TOKENS[name]}`)) return json(404, { message: "Not Found" });
    if (rest === "") return json(200, { default_branch: "main", visibility: repository.private ? "private" : "public", private: repository.private });
    if (rest === "/commits/main") return json(200, { sha: sha(`${name}@main`) });
    if (rest.startsWith("/git/trees/")) return json(200, { tree: Object.entries(repository.files).map(([file, body]) => ({ type: "blob", path: file, sha: sha(body) })) });
    const file = /^\/contents\/(.+)$/.exec(rest);
    if (file && repository.files[file[1]] !== undefined) return text(repository.files[file[1]]);
    return json(404, { message: "Not Found" });
  }
  const raw = /^\/([^/]+\/[^/]+)\/[0-9a-f]{40}\/(.+)$/.exec(path);
  if (url.host === "raw.githubusercontent.com" && raw && REPOSITORIES[raw[1]] && !REPOSITORIES[raw[1]].private && REPOSITORIES[raw[1]].files[raw[2]] !== undefined) return text(REPOSITORIES[raw[1]].files[raw[2]]);
  return null;
}
// The Bridge lab-pc-4 answers its list of jobs with the job that runs on it; lab-pc-5's address refuses the connection; the model endpoint ep1 never answers until the request is aborted.
function install() {
  spy.requests = [];
  spy.unrouted = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const request = { url, href: url.href, authorization: headerOf(init, "authorization"), pairing: headerOf(init, "x-agent-m-token") };
    spy.requests.push(request);
    if (url.host === "127.0.0.1:4711" && url.pathname === "/v1/jobs") return json(200, { jobs: [{ id: "JOB-20261016-1000-ffff", state: "running", usage: null }] });
    if (url.host === "127.0.0.1:4712") throw new TypeError("connect ECONNREFUSED 127.0.0.1:4712");
    if (url.host === "models.example") {
      return new Promise((resolve, reject) => init?.signal?.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }))));
    }
    const served = github(request);
    if (served) return served;
    spy.unrouted.push(request.href);
    throw new TypeError(`no request leaves the fixtures: ${request.href}`);
  };
}
test.afterEach(() => { globalThis.fetch = realFetch; globalThis.Date = RealDate; });

// ---------------------------------------------------------------- the page

// The browser: the store of acme/agent-m with the two tokens, the products, and the Bridges lab-pc-4 and lab-pc-5 (lab-pc-3 is not kept).
function browser({ products = [LIBRARY, ATLAS, MISSING], tokens = TOKENS, libraryToken = true, bridges = true } = {}) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: new Storage() });
  const store = openStore("acme/agent-m");
  writeSetting(store, "products", products);
  writeSetting(store, "github-token", { value: tokens["acme/agent-m"], name: "instance token", expires: "2027-01-01" });
  if (libraryToken) writeSetting(store, "github-token:acme/library", { value: tokens["acme/library"], name: "library token", expires: "2027-01-01" });
  if (bridges) {
    writeSetting(store, "bridge:lab-pc-4", { address: "http://127.0.0.1:4711", token: "pairing-token-four" });
    writeSetting(store, "bridge:lab-pc-5", { address: "http://127.0.0.1:4712", token: "pairing-token-five" });
  }
  const context = { page: "main", instance: { repository: "acme/agent-m", host: connect(parseAddress(INSTANCE), { token: tokens["acme/agent-m"] }) }, product: null, store, go() {} };
  return { store, context };
}
async function draw(it, moment = NOW) {
  const target = document.createElement("div");
  document.body.append(target);
  await atClock(moment, () => route.render(target, it.context, {}));
  return target;
}

const find = (root, match) => {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root);
  return found;
};
const byClass = (root, name) => find(root, (node) => node.className.split(/\s+/).includes(name));
const rowsOf = (target) => byClass(target, "job");
const CELLS = ["id", "product", "works-on", "kind", "participant", "runs", "state", "elapsed", "cost"];
const cellsOf = (row) => CELLS.map((name) => byClass(row, name)[0].textContent);
const idsOf = (target) => rowsOf(target).map((row) => byClass(row, "id")[0].textContent);
const selectOf = (target, key) => find(target, (node) => node.localName === "select" && node.getAttribute("data-filter") === key)[0];
const optionsOf = (select) => find(select, (node) => node.localName === "option").map((option) => option.textContent);
function choose(select, value) { select.value = value; select.dispatchEvent(new Event("change")); }

const ALL_IDS = ["JOB-20261016-0800-bbbb", "JOB-20261016-1000-ffff", "JOB-20261016-0930-gggg", "JOB-20261016-0900-dddd", "JOB-20261015-0900-aaaa", "JOB-20261014-1000-cccc", "JOB-20261013-0700-eeee"];
const NO_BRIDGE = "no Bridge named lab-pc-3 is among the Bridges";

// TST-509001 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; NO COST IS GUESSED; UC-036 (steps 1, 2); UC-046
// given: the instance acme/agent-m (a job done on this tab at 0.41 EUR, a job waiting at a gate that no route took) and the products acme/library (private; a failed job and a running one on the Bridge lab-pc-3, which this browser does not keep) and acme/atlas (public; a cancelled job, and a running one on each of the Bridges lab-pc-4 and lab-pc-5), the clock at 2026-10-16 12:00 UTC
// input: the route `jobs` drawn
// expect: seven rows: the job waiting at a gate first, then by the start of the record, newest first — lab-pc-4's (10:00), lab-pc-5's (09:30), lab-pc-3's (09:00) running job, the done one of 15 October, the failed one of 14 October, the cancelled one of 13 October; each with its identifier, its product's address, what it works on, kind, participant, where it runs, state, elapsed time and cost: "0.41 EUR" where the record's end reports it, "unknown" in every other row
test("TST-509001 the list holds every job of the instance and of its products, waiting at a gate first, each row with its fields", async () => {
  install();
  const target = await draw(browser());
  assert.deepEqual(rowsOf(target).map(cellsOf), [
    ["JOB-20261016-0800-bbbb", INSTANCE, "ITM-014", "implement-item", "dev-cli", "not taken", "waiting at a gate", "0h 0m 0s", "unknown"],
    ["JOB-20261016-1000-ffff", ATLAS, "MOD-atlas-reader", "write-code", "dev-cli", "lab-pc-4", "running", "2h 0m 0s", "unknown"],
    ["JOB-20261016-0930-gggg", ATLAS, "ITM-021", "write-code", "dev-cli", "lab-pc-5", "running not reachable: The Bridge gave no answer: connect ECONNREFUSED 127.0.0.1:4712 Use the HTTPS route through the jump host.", "0h 0m 0s", "unknown"],
    ["JOB-20261016-0900-dddd", LIBRARY, "SRC-007", "derive-requirements", "claude-cli", "lab-pc-3", `running not reachable: ${NO_BRIDGE}`, "0h 0m 0s", "unknown"],
    ["JOB-20261015-0900-aaaa", INSTANCE, "EXPORT IS A PDF", "derive-use-cases", "drafter-a", "tab", "done", "0h 12m 0s", "0.41 EUR"],
    ["JOB-20261014-1000-cccc", LIBRARY, "ITM-014", "write-tests", "claude-cli", "lab-pc-3", "failed", "1h 5m 0s", "unknown"],
    ["JOB-20261013-0700-eeee", ATLAS, "MOD-atlas-reader", "propose-tests", "drafter-a", "tab", "cancelled", "0h 3m 0s", "unknown"],
  ]);
  assert.deepEqual(spy.unrouted, []);
});

// TST-509002 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: the same browser; the private repositories acme/agent-m and acme/library answer 404 to a request without their own token, acme/atlas is public and has no token stored
// input: the route `jobs` drawn, and then drawn with no token stored for acme/library
// expect: with the tokens, the jobs of the private repositories are listed (known positive: the rows of acme/agent-m and acme/library are among the seven), every request to a repository of acme/agent-m carries the instance's token, every one to acme/library its own, none to acme/atlas and none to a Bridge or a raw host carries a token of GitHub; without acme/library's token, its two jobs are gone and the source is named as unreadable while the other five rows stay
test("TST-509002 each repository is read with the token this browser keeps for it, and a token reaches no other address", async () => {
  install();
  const target = await draw(browser());
  assert.equal(idsOf(target).length, 7, "known positive: all seven jobs");
  const repo = (name) => spy.requests.filter((request) => request.url.host === "api.github.com" && request.url.pathname.startsWith(`/repos/${name}`));
  assert.ok(repo("acme/agent-m").length > 0 && repo("acme/library").length > 0 && repo("acme/atlas").length > 0, "each repository was read");
  assert.deepEqual([...new Set(repo("acme/agent-m").map((request) => request.authorization))], [`Bearer ${TOKENS["acme/agent-m"]}`]);
  assert.deepEqual([...new Set(repo("acme/library").map((request) => request.authorization))], [`Bearer ${TOKENS["acme/library"]}`]);
  assert.deepEqual([...new Set(repo("acme/atlas").map((request) => request.authorization))], [null]);
  const elsewhere = spy.requests.filter((request) => request.url.host !== "api.github.com");
  assert.ok(elsewhere.length > 0, "known positive: the Bridges and the raw host were asked");
  assert.deepEqual(elsewhere.filter((request) => request.authorization !== null), []);
  assert.deepEqual(spy.unrouted, []);

  install();
  const without = await draw(browser({ libraryToken: false }));
  assert.deepEqual(idsOf(without), ["JOB-20261016-0800-bbbb", "JOB-20261016-1000-ffff", "JOB-20261016-0930-gggg", "JOB-20261015-0900-aaaa", "JOB-20261013-0700-eeee"]);
  assert.deepEqual(byClass(without, "source").map((node) => node.textContent).filter((line) => line.startsWith(LIBRARY)),
    [`${LIBRARY}: ${LIBRARY} was not found — a private repository is found only with a token that reaches it.`]);
});

// TST-509003 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-036 (1a)
// given: the same browser
// input: the route `jobs` drawn; the Bridges' requests counted
// expect: each job whose record has no end is asked once — lab-pc-4's list of jobs and lab-pc-5's address once each, and none for a Bridge this browser does not keep (lab-pc-3) and none for a job that has ended; lab-pc-4's job is running with no reason, lab-pc-5's is running with the client's reason, lab-pc-3's with "no Bridge named lab-pc-3 is among the Bridges"; no state cell is an error and every row is still listed
test("TST-509003 the live state of a job that has not ended is asked once, and one that cannot be reached shows its reason", async () => {
  install();
  const target = await draw(browser());
  const bridge = (port) => spy.requests.filter((request) => request.url.host === `127.0.0.1:${port}`).map((request) => `${request.url.pathname}`);
  assert.deepEqual(bridge(4711), ["/v1/jobs"]);
  assert.deepEqual(bridge(4712), ["/v1/jobs"]);
  assert.equal(spy.requests.filter((request) => /lab-pc-3/.test(request.href)).length, 0);
  const reason = (id) => byClass(rowsOf(target).find((row) => byClass(row, "id")[0].textContent === id), "reason").map((node) => node.textContent);
  assert.deepEqual(reason("JOB-20261016-1000-ffff"), []);
  assert.deepEqual(reason("JOB-20261016-0930-gggg"), ["not reachable: The Bridge gave no answer: connect ECONNREFUSED 127.0.0.1:4712 Use the HTTPS route through the jump host."]);
  assert.deepEqual(reason("JOB-20261016-0900-dddd"), [`not reachable: ${NO_BRIDGE}`]);
  assert.deepEqual(reason("JOB-20261014-1000-cccc"), []);
  assert.equal(rowsOf(target).length, 7);
  assert.deepEqual(spy.unrouted, []);
});

// TST-509004 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-036 (1a); UC-046 (3b)
// given: the same browser, whose products also hold https://github.com/acme/missing, a repository the server does not find
// input: the route `jobs` drawn
// expect: above the list one source is named, "https://github.com/acme/missing: https://github.com/acme/missing was not found — a private repository is found only with a token that reaches it.", with its address and the reason its host gives; the seven jobs of the other three sources are still listed; counter-proof: with the product left out, no source is named
test("TST-509004 a source that cannot be read is named above the list with its reason, and the others are still listed", async () => {
  install();
  const target = await draw(browser());
  const named = byClass(target, "source").map((node) => node.textContent);
  assert.deepEqual(named, [`${MISSING}: ${MISSING} was not found — a private repository is found only with a token that reaches it.`]);
  const kids = target.childNodes.filter((node) => node.nodeType === 1);
  assert.ok(kids.indexOf(byClass(target, "unreadable")[0]) < kids.indexOf(byClass(target, "jobs")[0]), "the unreadable sources stand above the list");
  assert.equal(rowsOf(target).length, 7);
  install();
  const clean = await draw(browser({ products: [LIBRARY, ATLAS] }));
  assert.deepEqual(byClass(clean, "source"), []);
  assert.equal(rowsOf(clean).length, 7);
  assert.deepEqual(spy.unrouted, []);
});

// TST-509005 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-036 (2, 3)
// given: the same browser, the seven rows
// input: the four filters read, then each chosen in turn, and two together
// expect: product offers all, acme/agent-m, acme/atlas, acme/library; state all, cancelled, done, failed, running, waiting at a gate; participant all, claude-cli, dev-cli, drafter-a; where it runs all, lab-pc-3, lab-pc-4, lab-pc-5, not taken, tab —; the product acme/atlas leaves ffff, gggg and eeee; the state running leaves ffff, gggg and dddd; the participant claude-cli leaves dddd and cccc; where it runs "tab" leaves aaaa and eeee; product acme/atlas and state running together leave ffff and gggg; choosing all again brings back the seven
test("TST-509005 the four filters offer all and the values the rows hold, and each narrows the rows", async () => {
  install();
  const target = await draw(browser());
  const offered = (key) => optionsOf(selectOf(target, key));
  assert.deepEqual(offered("product"), ["all", INSTANCE, ATLAS, LIBRARY]);
  assert.deepEqual(offered("state"), ["all", "cancelled", "done", "failed", "running", "waiting at a gate"]);
  assert.deepEqual(offered("participant"), ["all", "claude-cli", "dev-cli", "drafter-a"]);
  assert.deepEqual(offered("runs"), ["all", "lab-pc-3", "lab-pc-4", "lab-pc-5", "not taken", "tab"]);
  assert.deepEqual(idsOf(target), ALL_IDS, "known positive: all seven before any filter");
  choose(selectOf(target, "product"), ATLAS);
  assert.deepEqual(idsOf(target), ["JOB-20261016-1000-ffff", "JOB-20261016-0930-gggg", "JOB-20261013-0700-eeee"]);
  choose(selectOf(target, "product"), "");
  choose(selectOf(target, "state"), "running");
  assert.deepEqual(idsOf(target), ["JOB-20261016-1000-ffff", "JOB-20261016-0930-gggg", "JOB-20261016-0900-dddd"]);
  choose(selectOf(target, "product"), ATLAS);
  assert.deepEqual(idsOf(target), ["JOB-20261016-1000-ffff", "JOB-20261016-0930-gggg"]);
  choose(selectOf(target, "product"), "");
  choose(selectOf(target, "state"), "");
  choose(selectOf(target, "participant"), "claude-cli");
  assert.deepEqual(idsOf(target), ["JOB-20261016-0900-dddd", "JOB-20261014-1000-cccc"]);
  choose(selectOf(target, "participant"), "");
  choose(selectOf(target, "runs"), "tab");
  assert.deepEqual(idsOf(target), ["JOB-20261015-0900-aaaa", "JOB-20261013-0700-eeee"]);
  choose(selectOf(target, "runs"), "");
  assert.deepEqual(idsOf(target), ALL_IDS);
  assert.deepEqual(spy.unrouted, []);
});

// TST-509006 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-049 (6c, step 7)
// given: the same browser and the prompt bar on the page, with one participant drafter-a (the endpoint ep1, which never answers); the clock at 10:57:57 UTC when a message is sent
// input: the route `jobs` drawn at 12:00:00 while the message runs; then Stop pressed and the route drawn again
// expect: while the message runs the job of this tab is the second row, after the job waiting at a gate and before every other, its cells "this tab's" in place of an identifier, "—" for the product, "" for what it works on, "converse", "drafter-a", "this tab", "running", "1h 2m 3s", "unknown", with no data-id; the seven jobs of the records follow it; once it has ended the list holds the seven rows and no row of this tab
test("TST-509006 the job of this tab's conversation is listed first among the rows that do not wait at a gate, and is gone once it has ended", async () => {
  install();
  registerStrategies("tests/main-page-jobs.test.mjs", { recipes: { "chapters-for-page": async () => [] } });
  const it = browser();
  writeSetting(it.store, "endpoint:ep1", { kind: "openai-compatible", url: "https://models.example/v1", model: "model-drafter-a", key: "sk-fixture" });
  const foot = document.createElement("div");
  document.body.append(foot);
  const subject = { key: "page:jobs", title: "Every job", kind: "converse", entry: null, paramsFor: () => ({ page: "Every job", target: "jobs" }), draftRoute: null, withhold: null, refuses: [] };
  startPromptBar(foot, { page: "main", store: it.store, instance: { repository: "acme/agent-m", host: it.context.instance.host }, product: () => null, subject: () => subject,
    explain: () => document.createElement("details"), go() {} });
  const until = async (condition, what) => { for (let n = 0; n < 400; n += 1) { if (condition()) return; await new Promise((resolve) => setImmediate(resolve)); } assert.fail(`never: ${what}`); };
  await until(() => byClass(foot, "instruction").length > 0, "the bar is drawn");
  byClass(foot, "instruction")[0].value = "what runs?";
  clock.now = NOW - 3723000;
  globalThis.Date = FixedDate;
  byClass(foot, "send")[0].dispatchEvent(new Event("click"));
  await until(() => spy.requests.some((request) => request.url.host === "models.example"), "the message is sent");
  globalThis.Date = RealDate;

  const during = await draw(it);
  const rows = rowsOf(during);
  assert.equal(rows.length, 8);
  assert.deepEqual(cellsOf(rows[1]), ["this tab's", "—", "", "converse", "drafter-a", "this tab", "running", "1h 2m 3s", "unknown"]);
  assert.equal(rows[1].getAttribute("data-id"), null);
  assert.deepEqual(idsOf(during).filter((id) => id !== "this tab's"), ALL_IDS);
  assert.equal(idsOf(during)[0], "JOB-20261016-0800-bbbb");

  byClass(foot, "stop")[0].dispatchEvent(new Event("click"));
  await until(() => byClass(foot, "stop")[0].disabled, "the message has stopped");
  const after = await draw(it);
  assert.deepEqual(idsOf(after), ALL_IDS);
  assert.deepEqual(byClass(after, "this-tab"), []);
  assert.deepEqual(spy.unrouted, []);
});

// TST-509007 · level: unit · module: MOD-main-page
// guards: THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK; ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: the module's view
// input: its routes, its strategies and the route `jobs` read
// expect: the routes are exactly [jobs]; the route is named "jobs", has the title "Every job", sits under no entry of the menu (entry null) and keeps the frame's default subject (no `subject`); the strategies are exactly [sourceStrategies] of MOD-source-register
test("TST-509007 the view hands the frame the route jobs and the strategies of the source register", () => {
  assert.deepEqual(view.routes.map((candidate) => candidate.name), ["jobs"]);
  assert.equal(route.title, "Every job");
  assert.equal(route.entry, null);
  assert.equal("subject" in route, false);
  assert.equal(typeof route.render, "function");
  assert.equal(view.strategies.length, 1);
  assert.equal(view.strategies[0], sourceStrategies);
});

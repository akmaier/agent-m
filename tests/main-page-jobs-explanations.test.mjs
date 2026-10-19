// MOD-main-page's route `jobs` — the folded explanations of every job state and every kind of runtime (ITM-975; UC-036: "Every state, and every kind of runtime, carries a
// folded What is this?"). The route draws, once each, the explanation of the eight states and of the runtimes tab, CI and Bridge, whether or not a job is in them; the topics
// stand in src/site-frame/explanations.md (MOD-site-frame), and the frame's own check (tests/site-frame-topics.mjs) finds a topic the route names and the file lacks.
// Run: node --test tests/main-page-jobs-explanations.test.mjs
//
// Module: MOD-main-page
// Guards: EVERY STEP EXPLAINS ITSELF; ONE DASHBOARD SHOWS EVERY JOB; UC-036
// Level: unit
//
// The page is drawn over an instance whose repository holds no job, with the small DOM of tests/site-frame-dom.mjs; the real MOD-site-frame explain runs. The only requests are
// the reads of that repository, which a spy answers; no other address is reached. Every expected name is written in this file's own text.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { openStore } from "../src/browser-store/index.mjs";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";
import { topicFindings } from "./site-frame-topics.mjs";

const { view } = await import("../src/main-page/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "jobs");
const ROOT = new URL("..", import.meta.url).pathname;
const EXPLANATIONS = readFileSync(`${ROOT}src/site-frame/explanations.md`, "utf8");

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}
const realFetch = globalThis.fetch;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
test.afterEach(() => { globalThis.fetch = realFetch; });

// An empty public repository acme/agent-m: no job in it.
function install() {
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    if (url.host === "api.github.com" && url.pathname === "/repos/acme/agent-m") return json(200, { default_branch: "main", visibility: "public", private: false });
    if (url.pathname === "/repos/acme/agent-m/commits/main") return json(200, { sha: "a".repeat(40) });
    if (url.pathname.startsWith("/repos/acme/agent-m/git/trees/")) return json(200, { tree: [] });
    throw new TypeError(`no request leaves the fixtures: ${url.href}`);
  };
}
async function draw() {
  install();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: new Storage() });
  const context = { page: "main", instance: { repository: "acme/agent-m", host: connect(parseAddress("https://github.com/acme/agent-m"), {}) }, product: null, store: openStore("acme/agent-m"), go() {} };
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, context, {});
  return target;
}
const find = (root, match) => {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root);
  return found;
};
const byClass = (root, name) => find(root, (node) => node.className.split(/\s+/).includes(name));

const STATES = ["waiting at a gate", "running", "cancelling", "queued", "done", "failed", "cancelled", "ended without record"];
const RUNTIMES = ["tab", "ci", "bridge"];

// TST-975001 · level: unit · module: MOD-main-page
// guards: EVERY STEP EXPLAINS ITSELF; UC-036
// given: an instance with no job; known positive: the route draws a heading "Every job"
// input: the route `jobs` drawn
// expect: eight elements with the class job-state-explain, one for each of the states waiting at a gate, running, cancelling (within running in the list, ITM-972), queued, done, failed, cancelled and ended without record (attribute data-state), and three with the class job-runtime-explain for tab, ci and bridge (attribute data-runtime), each holding exactly one folded explanation (details with the class explain) whose text beyond its summary is not empty
test("the route jobs draws the folded explanation of each of the eight states and of the tab, CI and Bridge runtimes, once each", async () => {
  const target = await draw();
  assert.equal(find(target, (node) => node.localName === "h2")[0].textContent, "Every job", "known positive: the page is drawn");
  const states = byClass(target, "job-state-explain");
  assert.deepEqual(states.map((node) => node.getAttribute("data-state")), STATES);
  const runtimes = byClass(target, "job-runtime-explain");
  assert.deepEqual(runtimes.map((node) => node.getAttribute("data-runtime")), RUNTIMES);
  for (const node of [...states, ...runtimes]) {
    const folded = byClass(node, "explain");
    assert.equal(folded.length, 1, `one folded explanation in ${node.getAttribute("data-state") ?? node.getAttribute("data-runtime")}`);
    assert.ok(folded[0].textContent.replace("What is this?", "").trim().length > 20, "the explanation has text");
  }
});

// TST-975002 · level: unit · module: MOD-main-page
// guards: EVERY STEP EXPLAINS ITSELF
// given: the source of the route (src/main-page/jobs.mjs) and the explanations file; known positive: the file holds every topic the route names
// input: topicFindings of the route's source against the file, and against the file with the section job-state-failed removed
// expect: no finding for the file; exactly one finding, the topic job-state-failed, for the file without it, so that a state without its explanation is reported
test("the frame's check finds every topic the route jobs names, and reports a state whose explanation is missing", () => {
  const page = { path: "src/main-page/jobs.mjs", text: readFileSync(`${ROOT}src/main-page/jobs.mjs`, "utf8") };
  assert.deepEqual(topicFindings([page], EXPLANATIONS), []);
  const without = EXPLANATIONS.replace(/^## job-state-failed\n[^]*?(?=^## )/m, "");
  assert.notEqual(without, EXPLANATIONS, "known positive: the section job-state-failed is in the file");
  assert.deepEqual(topicFindings([page], without).map((finding) => finding.topic), ["job-state-failed"]);
});

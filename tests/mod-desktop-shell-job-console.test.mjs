// The Bridge's window shows each job's console live, holding only its last lines — THE BRIDGE'S WINDOW SHOWS EACH JOB'S CONSOLE LIVE (SPEC.md, runtimes 03): "The Bridge's window
// shows, for the job chosen among those whose logs the Bridge keeps, the last 1000 lines its agent has written to its output, as the agent writes them", with UC-044 step 6 and the
// view *Jobs* of MOD-desktop-shell; and the Bridge keeps the whole log meanwhile (THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX WEEKS). This file starts the app's real entry, src/desktop-shell/main.mjs, over a constructed Electron (tests/desktop-shell.d/entry.mjs) with the real composition, and
// draws the production window entry, src/desktop-shell/window.mjs, in a small EventTarget DOM whose preload hands each of the window's requests to the entry's own ipc handler — so
// that what the window shows is what the Bridge's watching of the served product holds, through the main process, with nothing in between.
// Run: node --test tests/mod-desktop-shell-job-console.test.mjs
//
// Module: MOD-desktop-shell
// Guards: THE BRIDGE'S WINDOW SHOWS EACH JOB'S CONSOLE LIVE; THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX WEEKS; UC-044
// Level: unit
//
// Deterministic, no network, no real agent: the instance and the product are bare repositories in a temporary folder that git reaches through its own `url.<path>.insteadOf`; the
// agent is a fixture executable named opencode, which with two wrappers for git and sleep is the whole PATH of the test. It writes its first event line, 1500 lines `line 1` …
// `line 1500`, waits for the file `more`, writes `line 1501` … `line 1600` and `working` without a line break, and then waits for a gate that is never opened; the test ends by
// quitting the Bridge. Readings taken where the texts leave one open:
//   - "Shown" is the text of the window's console pane, the <pre> of the look's class `console`; its lines are that text split at its line breaks, the line being written the last.
//   - "Without being reloaded" is that nothing draws the view anew between the two readings: no change of the address's fragment, no import of the window, no click.
// Each test states its input and its expected result before it runs (given / input / expect).

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { startRecord } from "../src/job-ledger/index.mjs";
import { unusedPorts } from "./desktop-shell.d/ports.mjs";
import { startEntry, stopEntry, temporary } from "./desktop-shell.d/entry.mjs";
import { saveSettings } from "../src/desktop-shell/settings.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";
Object.assign(process.env, { GIT_AUTHOR_NAME: "Seed", GIT_AUTHOR_EMAIL: "seed@example.org", GIT_COMMITTER_NAME: "Seed", GIT_COMMITTER_EMAIL: "seed@example.org" });
const REAL_GIT = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).stdout.trim();
const REAL_SLEEP = spawnSync("sh", ["-c", "command -v sleep"], { encoding: "utf8" }).stdout.trim();
const INSTANCE_NAME = "carol/instance-x", PRODUCT = "https://github.com/acme/product-a";

registerStrategies("tests/mod-desktop-shell-job-console.test.mjs", {
  recipes: { "gate-inputs": async () => [{ name: "the gate", text: "Decide the gate.", sources: [], required: true, artifacts: [] }] },
  writers: { "gate-record": async () => ({ commits: [], files: [], pullRequest: null, shown: null, notes: [] }) },
});

function git(cwd, ...args) {
  const r = spawnSync(REAL_GIT, args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
const script = (bin, name, body) => writeFileSync(join(bin, name), `#!/bin/sh\n${body}\n`, { mode: 0o755 });
const PARTICIPANTS = `# Participants of this instance\n\n**REGISTER**\n\nThe participants of the test instance.\n\n| Name | Type | Model |\n|---|---|---|\n| drafter | agent | example-model |\n`;
function push(seed, files, message) {
  spawnSync(REAL_GIT, ["fetch", "-q", "origin"], { cwd: seed });
  spawnSync(REAL_GIT, ["reset", "-q", "--hard", "origin/main"], { cwd: seed });
  for (const [path, text] of Object.entries(files)) { mkdirSync(join(seed, path, ".."), { recursive: true }); writeFileSync(join(seed, path), text); }
  git(seed, "add", "-A"); git(seed, "commit", "-q", "-m", message); git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  return git(seed, "rev-parse", "HEAD");
}
function repository(root, name, files) {
  const origin = join(root, `${name}.git`), seed = join(root, `${name}-seed`);
  git(root, "init", "-q", "--bare", "-b", "main", origin); git(root, "clone", "-q", origin, seed); push(seed, files, "first");
  return { origin, seed };
}
const JOB = { id: "JOB-20261110-1500-c0n5", kind: "decide-gate", worksOn: ["A JOB IS RECORDED IN ITS PRODUCT REPOSITORY"], participant: "drafter", model: "example-model",
  route: "bridge lab-pc agent opencode", run: null, retries: null, declares: { context: 200000, capabilities: ["draft text", "read the repository"] },
  startedBy: "alice", start: new Date("2026-11-10T15:00:00Z"), agentM: { version: "2026.11.0", commit: null }, inputs: [], limit: 3,
  destinations: [{ participant: "drafter", place: "this machine", parts: ["the gate"] }], params: {} };

// The Bridge's computer and its served product, with the job queued. -> the world given to `run`.
async function world(run) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-console-")));
  const bin = join(root, "bin"), gits = join(root, "git-calls"), more = join(root, "more"), gate = join(root, "gate");
  mkdirSync(bin); writeFileSync(gits, "");
  script(bin, "git", `printf '.' >> ${gits}; exec ${REAL_GIT} "$@"`); script(bin, "sleep", `exec ${REAL_SLEEP} "$@"`);
  script(bin, "opencode", `case "$1" in --version) echo 1.4.0;; auth) echo '1 credentials';; models) echo opencode/big-pickle;;
run) printf '%s\\n' '{"type":"step_start"}'; i=1; while [ $i -le 1500 ]; do echo "line $i"; i=$((i+1)); done
while [ ! -e ${more} ]; do sleep 0.02; done; while [ $i -le 1600 ]; do echo "line $i"; i=$((i+1)); done; printf working
while [ ! -e ${gate} ]; do sleep 0.02; done;; esac`);
  const instance = repository(root, "instance", { "docs/participants.md": PARTICIPANTS });
  const first = git(instance.seed, "rev-parse", "HEAD");
  const product = repository(root, "product-a", { "README.md": "A\n" });
  const { path, text } = startRecord({ ...JOB, agentM: { version: "2026.11.0", commit: first } });
  push(product.seed, { [path]: text }, `queue ${JOB.id}`);
  const pairs = [[`https://github.com/${INSTANCE_NAME}`, instance.origin], [PRODUCT, product.origin]];
  process.env.GIT_CONFIG_COUNT = String(pairs.length);
  pairs.forEach(([address, origin], at) => { process.env[`GIT_CONFIG_KEY_${at}`] = `url.${origin}.insteadOf`; process.env[`GIT_CONFIG_VALUE_${at}`] = address; });
  // The wait is for the state the test asserts; it ends when the state holds, when the Bridge has made no call of git for `stall` ms, or after `total` ms.
  const until = async (condition, what, { stall = 30000, total = 60000 } = {}) => {
    const begun = Date.now();
    let seen = statSync(gits).size, since = begun;
    for (;;) {
      const found = await condition(); if (found) return found;
      if (statSync(gits).size !== seen) { seen = statSync(gits).size; since = Date.now(); }
      else if (Date.now() - since > stall) assert.fail(`waited for ${what}: nothing happened for ${stall} ms`);
      if (Date.now() - begun > total) assert.fail(`waited for ${what}: still not there after ${total} ms`);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  };
  const prior = process.env.PATH;
  process.env.PATH = bin;
  try {
    return await run({ root, until, more: () => writeFileSync(more, ""), folder: (name) => { const at = join(root, name); mkdirSync(at); return at; } });
  } finally {
    process.env.PATH = prior;
    for (const key of Object.keys(process.env)) if (key.startsWith("GIT_CONFIG_") && key !== "GIT_CONFIG_GLOBAL" && key !== "GIT_CONFIG_SYSTEM") delete process.env[key];
    rmSync(root, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- a small DOM, as tests/mod-desktop-shell-window.test.mjs draws the window in

class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.attributes = new Map(); this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.innerHTML = ""; this.parentNode = null; }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  remove() { if (this.parentNode) this.parentNode.childNodes.splice(this.parentNode.childNodes.indexOf(this), 1); }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  getElementsByTagName(name) { return descendants(this, (node) => node.localName === name); }
}
class Storage { constructor() { this.values = new Map(); } getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } removeItem(key) { this.values.delete(key); } get length() { return this.values.size; } key(index) { return [...this.values.keys()][index] ?? null; } }
const descendants = (root, predicate) => { const found = []; const visit = (node) => { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } }; visit(root); return found; };
const numbered = (from, to) => Array.from({ length: to - from + 1 }, (_, at) => `line ${from + at}`);

// TST-2026111402 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE'S WINDOW SHOWS EACH JOB'S CONSOLE LIVE; THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX WEEKS; UC-044
// given: the app started over a Bridge that watches a product with one queued job of the fixture opencode, and the window drawn on #jobs, its requests answered by the entry's own ipc handler; the agent writes its first event line and 1500 lines, waits, then writes 100 more and `working` without a line break
// input: wait until the console pane shows `line 1500`; then let the agent write on, and wait — the view not drawn anew — until the pane shows `working`
// expect: the jobs table names the job and running; first the pane's lines are `line 501` … `line 1500`, exactly 1000; then `line 601` … `line 1600` and `working` as the last, 1000 lines and the one being written; the Bridge's log of the job, asked from line 0, still holds every line, `line 1` among them. Counter-proof: `line 1` and `line 600`, and the event line the agent wrote first, are not shown
// Planted fault: a view drawn once, that asks nothing after it was drawn, never shows `working`; a console that holds every line shows `line 1` and 1601 lines.
test("the window's Jobs view shows the console of the running job as its agent writes, holding its last 1000 lines", async () => {
  await world(async (w) => {
    const appData = temporary(), data = temporary(), resources = temporary();
    const [port] = await unusedPorts(1);
    saveSettings(data, { "agent-m-bridge-settings": 1, name: "lab-pc", port, folder: w.folder("work"), agents: [{ name: "opencode" }],
      products: [PRODUCT], every: 1, paused: false, jumpHost: null, tunnels: [] });
    const entry = await startEntry({ resources, appData, argv: [`--instance=${INSTANCE_NAME}`, "--origin=https://carol.github.io", `--port=${port}`, `--data-folder=${data}`] });
    try {
      assert.equal(entry.outcome.kind, "loaded", `the entry started (errors: ${entry.errors.join(" | ")})`);
      const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
      document.head = document.createElement("head"); document.body = document.createElement("body");
      globalThis.document = document;
      Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
      const browser = new EventTarget();
      const location = { hash: "#jobs" };
      Object.defineProperty(globalThis, "location", { configurable: true, value: location });
      Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
      const ask = entry.fake.handlers["bridge-state"];
      browser.bridge = { state: (action, value) => ask({}, action, value), async copy() {}, async quit() {}, async chooseFolder() { return null; },
        async pairAnew() {}, async pause() {}, async resume() {}, async retryPort() {} };
      await import(`../src/desktop-shell/window.mjs?job-console=${Date.now()}`);
      const pane = () => descendants(document.body, (node) => node.localName === "pre" && String(node.className).split(/\s+/).includes("console"))[0];
      const shown = () => (pane()?.textContent ?? "").split("\n");
      await w.until(() => shown().at(-1) === "line 1500", "the console to show line 1500");
      const table = descendants(document.body, (node) => node.localName === "table")[0];
      assert.ok(table, "the jobs are listed in a table");
      assert.match(table.textContent, new RegExp(`${JOB.id}.*running`, "s"), "the table names the job, running");
      assert.deepEqual(shown(), numbered(501, 1500), "the last 1000 lines");

      w.more();
      await w.until(() => shown().at(-1) === "working", "the console to show the line being written");
      assert.equal(location.hash, "#jobs", "the view was not drawn anew");
      assert.deepEqual(shown(), [...numbered(601, 1600), "working"], "the last 1000 lines and the one being written");
      for (const gone of ["line 1", "line 600", '{"type":"step_start"}']) assert.ok(!shown().includes(gone), `counter-proof: ${gone} is not shown`);
      const whole = await ask({}, "job-log", { id: JOB.id, from: 0 });
      assert.deepEqual(whole.lines.slice(0, 3), ['{"type":"step_start"}', "line 1", "line 2"], "the Bridge keeps the job's whole log");
      assert.equal(whole.lines.length, 1601);
      location.hash = "#pairing";
      browser.dispatchEvent(new Event("hashchange"));
    } finally { await stopEntry(entry); for (const folder of [appData, data, resources]) rmSync(folder, { recursive: true, force: true }); }
  });
});

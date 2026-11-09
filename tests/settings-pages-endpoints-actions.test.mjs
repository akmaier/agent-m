// The settings pages for an endpoint that runs through GitHub Actions — MOD-settings-pages' `endpoints` route and the Settings page's endpoint line and job
// workflow line, as UC-003 (step 2, 4a) and docs/architecture/MOD-settings-pages.md state them: the form asks the place, the context and the name of the CI
// secret of the key; a test the browser refuses says plainly that the host does not accept calls from a web page; for such an endpoint whose key this browser keeps,
// one click stores the key as a GitHub Actions secret of the repository, keeps the secret's name with the endpoint beside the key, which stays in this browser, and spawns a
// test job there; and the job workflow's line (Set up GitHub Actions) names the CI secret each of this browser's endpoints names.
// Run: node --test tests/settings-pages-endpoints-actions.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-003; UC-010; AN UNSUPPORTED ENDPOINT SAYS SO; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE
// Level: unit
//
// The repository servers are fixtures in memory; the model endpoint is a fake `fetch` that refuses as a browser refuses a call without a cross-origin permission
// ("TypeError: Failed to fetch"), with `window` defined so that the call counts as the browser's. Nothing reaches the network; the key is a fixture.

import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";
import { appendToRecord } from "../src/job-ledger/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { loadHandOverStrategies } from "../src/prompt-bar/index.mjs";
import { sourceStrategies } from "../src/source-register/index.mjs";

// The hand-over's strategy sets, as the page registers them (site-frame/register.mjs), so that a test job of an endpoint can be prepared; the recipes of the book's chapters give no part.
const chaptersGiveNothing = Object.fromEntries(["chapters-for-requirements", "chapters-for-tests", "chapters-for-architecture", "chapters-for-implementation", "chapters-for-page"]
  .map((name) => [name, async () => []]));
for (const set of await loadHandOverStrategies()) {
  registerStrategies("tests/settings-pages-endpoints-actions.test.mjs", set === sourceStrategies
    ? { recipes: { "source-excerpt": sourceStrategies.recipes["source-excerpt"], ...chaptersGiveNothing } } : set);
}

class Element {
  constructor(name) { this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.disabled = false; this.hidden = false; this.attributes = new Map(); this.listeners = []; }
  append(...nodes) { for (const node of nodes.flat()) this.childNodes.push(typeof node === "string" ? new Text(node) : node); }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  addEventListener(type, listener) { this.listeners.push([type, listener]); }
  fire(type, event = {}) { return Promise.all(this.listeners.filter(([kind]) => kind === type).map(([, listener]) => listener({ type, target: this, currentTarget: this, ...event }))); }
  focus() {}
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
}
class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}
globalThis.document = { createElement: (name) => new Element(name) };

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const one = (root, name) => byClass(root, name)[0];
const click = (node, isTrusted = false) => node.fire("click", { isTrusted });
const route = (name) => view.routes.find((candidate) => candidate.name === name);
const until = async (condition, what) => { for (let at = 0; at < 400; at += 1) { if (condition()) return; await new Promise((resolve) => setImmediate(resolve)); } throw new Error(`timed out: ${what}`); };

const KEY = "nvapi-FIXTURE-0123456789";
const NVIDIA = { url: "https://integrate.api.nvidia.com/v1", kind: "openai-compatible", model: "nvidia/nemotron-3-ultra-550b-a55b" };
const INSTANCE_COMMIT = "0123456789abcdef0123456789abcdef01234567";
const PARTICIPANTS = ["# Participants of this instance", "", "**REGISTER**", "", "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |",
  "|---|---|---|---|---|---|---|---|", "| alice | person | — | — | — | read the repository | — | account github.com/alice |", ""].join("\n");

// The instance's repository on GitHub, in memory: `secrets` keeps every setCiSecret, `commits` every commit; it holds no job workflow.
function instanceRepository() {
  const secrets = [], commits = [];
  const repository = { server: "github", origin: "https://github.com", path: "fixture/instance", web: "https://github.com/fixture/instance" };
  const files = new Map([["docs/participants.md", PARTICIPANTS], ["SPEC.md", "# Spec\n"]]);
  return { secrets, commits, host: {
    async repositoryInfo() { return { defaultBranch: "main", canWrite: true, visibility: "private", archived: false, description: "" }; },
    async readSnapshot(ref) { return { repository, ref, commit: INSTANCE_COMMIT, paths: [...files.keys()], blob: (path) => (files.has(path) ? "b".repeat(40) : null), async read(path) { return files.get(path) ?? null; } }; },
    async listPullRequests() { return []; },
    async containsCommit() { return false; },
    async setCiSecret(name, value) { secrets.push({ name, value }); },
    async commitFiles(change) { commits.push(change); throw new Error("no commit is expected"); },
    async startWorkflow() { throw new Error("no workflow is expected"); },
  } };
}

function freshStore() {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: new Storage() });
  return openStore("fixture/instance");
}

// The browser refuses the call, as Chrome does for an endpoint that sends no Access-Control-Allow-Origin; `window` makes the call the browser's.
async function asTheBrowser(run) {
  const real = globalThis.fetch, hadWindow = "window" in globalThis, requests = [];
  globalThis.window = globalThis.window ?? {};
  globalThis.fetch = async (url) => { requests.push(String(url)); throw new TypeError("Failed to fetch"); };
  try { return await run(requests); } finally { globalThis.fetch = real; if (!hadWindow) delete globalThis.window; }
}

// TST-1200201 · level: unit · module: MOD-settings-pages
// guards: UC-003; THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE
// given: an empty store; the endpoint form filled with nvidia's address, kind and model, no key, the place "NVIDIA, USA", the context 128000 and the CI secret NVIDIA_API_KEY
// input: Save and test
// expect: endpoint:nvidia holds the place, the context as a number and the secret's name, and no key; no request is made to the endpoint — it runs through GitHub Actions — and the page says so, naming the secret; and Save and test spawns its test job there, which this repository, holding no job workflow, refuses, saying why and committing nothing
test("the endpoint form keeps the place, the context and the CI secret's name; an endpoint with a secret and no key runs through GitHub Actions and is not called", async () => {
  const store = freshStore(), repo = instanceRepository();
  const target = document.createElement("div");
  await route("endpoints").render(target, { instance: { repository: "fixture/instance", host: repo.host }, product: null, store, go() {} }, {});
  one(target, "endpoint-name").value = "nvidia";
  one(target, "endpoint-url").value = NVIDIA.url;
  one(target, "endpoint-model").value = NVIDIA.model;
  one(target, "endpoint-place").value = "NVIDIA, USA";
  one(target, "endpoint-context").value = "128000";
  one(target, "endpoint-secret").value = "NVIDIA_API_KEY";
  await asTheBrowser(async (requests) => {
    await click(one(target, "endpoint-test"), true);
    assert.deepEqual(requests, []);
  });
  assert.deepEqual(readSetting(store, "endpoint:nvidia"), { ...NVIDIA, place: "NVIDIA, USA", context: 128000, secret: "NVIDIA_API_KEY" });
  assert.match(one(target, "endpoint-result").textContent, /runs through GitHub Actions/);
  assert.match(one(target, "endpoint-result").textContent, /NVIDIA_API_KEY/);
  await until(() => /No test job was spawned|could not be spawned/.test(one(target, "endpoint-result").textContent), "the test job's outcome is shown");
  assert.match(one(target, "endpoint-result").textContent, /No test job was spawned: the product has no Agent M job workflow yet/);
  assert.deepEqual(repo.commits, []);
});

// TST-1200202 · level: unit · module: MOD-settings-pages
// guards: UC-003; AN UNSUPPORTED ENDPOINT SAYS SO
// given: endpoint nvidia with a key, place and context, which the browser refuses ("Failed to fetch"); and, as the counter-proof, the same endpoint answering 401 with "Invalid API key"
// input: Save and test on the form; then the Settings page's endpoint line
// expect: the result says "✗ integrate.api.nvidia.com does not accept calls from a web page; run it through GitHub Actions (CI secret) or a Bridge.", the browser's "Failed to fetch" only after it in parentheses; the line's status says "Refused: integrate.api.nvidia.com does not accept calls from a web page…"; for the 401 the endpoint's own message is shown
test("a test the browser refuses says plainly that the host does not accept calls from a web page, on the form and on the Settings line", async () => {
  const store = freshStore(), repo = instanceRepository();
  const context = { instance: { repository: "fixture/instance", host: repo.host }, product: null, store, go() {} };
  const target = document.createElement("div");
  await route("endpoints").render(target, context, {});
  for (const [field, value] of [["endpoint-name", "nvidia"], ["endpoint-url", NVIDIA.url], ["endpoint-model", NVIDIA.model], ["endpoint-key", KEY], ["endpoint-place", "NVIDIA, USA"], ["endpoint-context", "128000"]]) one(target, field).value = value;
  await asTheBrowser(() => click(one(target, "endpoint-test"), true));
  const said = one(target, "endpoint-result").textContent;
  assert.equal(said, "✗ integrate.api.nvidia.com does not accept calls from a web page; run it through GitHub Actions (CI secret) or a Bridge. (The browser said: Failed to fetch)");
  const page = document.createElement("div");
  await route("settings").render(page, context, {});
  assert.match(one(page, "settings-endpoint-status").textContent, /^Refused: integrate\.api\.nvidia\.com does not accept calls from a web page; run it through GitHub Actions \(CI secret\) or a Bridge\.$/);
  const real = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: "Invalid API key" } }), { status: 401, headers: { "content-type": "application/json" } });
  try { await click(one(target, "endpoint-test"), true); } finally { globalThis.fetch = real; }
  assert.match(one(target, "endpoint-result").textContent, /Invalid API key/);
  assert.equal(byClass(target, "endpoint-actions").length, 0, "a refused key offers no move to GitHub Actions");
});

// TST-1200203 · level: unit · module: MOD-settings-pages
// guards: UC-003; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the refused endpoint of TST-1200202, whose key this browser keeps; the instance's repository on GitHub, which holds no job workflow
// input: the offer read; a script's click on its button; then a person's click
// expect: before the click the page says what the click does — the secret NVIDIA_API_KEY, the repository fixture/instance, that the key stays in this browser and a test job is spawned —; the script's click stores nothing; the person's click stores exactly one secret, NVIDIA_API_KEY with the key, keeps endpoint:nvidia with the secret's name and with the key, and, since the repository has no job workflow, says that no test job was spawned and why, committing nothing
test("one click stores the key as the GitHub secret, keeps it in this browser and spawns the test job, saying first what it does", async () => {
  const store = freshStore(), repo = instanceRepository();
  const target = document.createElement("div");
  await route("endpoints").render(target, { instance: { repository: "fixture/instance", host: repo.host }, product: null, store, go() {} }, {});
  for (const [field, value] of [["endpoint-name", "nvidia"], ["endpoint-url", NVIDIA.url], ["endpoint-model", NVIDIA.model], ["endpoint-key", KEY], ["endpoint-place", "NVIDIA, USA"], ["endpoint-context", "128000"]]) one(target, field).value = value;
  await asTheBrowser(() => click(one(target, "endpoint-test"), true));
  const consent = one(target, "endpoint-actions-consent").textContent;
  for (const part of ["NVIDIA_API_KEY", "fixture/instance", "the key stays in this browser", "test job"]) assert.ok(consent.includes(part), `${part} in ${consent}`);
  await click(one(target, "endpoint-actions"), false);
  assert.deepEqual(repo.secrets, [], "a script's click stores nothing");
  await click(one(target, "endpoint-actions"), true);
  await until(() => /No test job was spawned|could not be spawned/.test(one(target, "endpoint-result").textContent), "the test job's outcome is shown");
  assert.deepEqual(repo.secrets, [{ name: "NVIDIA_API_KEY", value: KEY }]);
  assert.deepEqual(readSetting(store, "endpoint:nvidia"), { ...NVIDIA, place: "NVIDIA, USA", context: 128000, key: KEY, secret: "NVIDIA_API_KEY" });
  assert.match(one(target, "endpoint-result").textContent, /No test job was spawned: the product has no Agent M job workflow yet/);
  assert.deepEqual(repo.commits, []);
});

// TST-1200204 · level: unit · module: MOD-settings-pages
// guards: UC-010; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: a GitHub product without the job workflow and a token that writes to it; this browser keeps endpoint:nvidia naming the CI secret NVIDIA_API_KEY, and endpoint:plain naming none
// input: the Settings page's product tab, its job workflow line
// expect: the secrets it names are AGENT_M_TOKEN and NVIDIA_API_KEY, and nothing for plain; Set up GitHub Actions commits .github/workflows/agent-m-jobs.yml, whose job reads `NVIDIA_API_KEY: ${{ secrets.NVIDIA_API_KEY }}` and lists it in AGENT_M_KEY_NAMES
test("the job workflow's Set up GitHub Actions names the CI secret each of this browser's endpoints names", async () => {
  const store = freshStore(), repo = instanceRepository(), writes = [];
  writeSetting(store, "endpoint:nvidia", { ...NVIDIA, place: "NVIDIA, USA", context: 128000, secret: "NVIDIA_API_KEY" });
  writeSetting(store, "endpoint:plain", { ...NVIDIA, key: KEY });
  writeSetting(store, "github-token:fixture/product", { value: "github_pat_FIXTURE0123456789abcdef", name: "alice", expires: "2027-01-01" });
  const repository = { server: "github", origin: "https://github.com", path: "fixture/product", web: "https://github.com/fixture/product" };
  const product = { address: repository.web, host: {
    async repositoryInfo() { return { defaultBranch: "main", canWrite: true, visibility: "private" }; },
    async readSnapshot() { return { repository, commit: "1".repeat(40), paths: [], blob: () => null, async read() { return null; } }; },
    async ciSecretNames() { return []; },
    async setCiSecret() {},
    async commitFiles(change) { writes.push(change); return { commit: "2".repeat(40) }; },
  } };
  const page = document.createElement("div");
  await route("settings").render(page, { instance: { repository: "fixture/instance", host: repo.host }, product, store, go() {} }, {});
  await click(byClass(page, "settings-tab")[1]);
  const line = one(page, "settings-job-workflow");
  assert.equal(one(line, "settings-job-workflow-secrets").textContent.trim(), "Secrets named: AGENT_M_TOKEN, NVIDIA_API_KEY.");
  await click(one(line, "settings-job-workflow-install"), true);
  assert.equal(writes.length, 1);
  const workflow = writes[0].files.find((file) => file.path === ".github/workflows/agent-m-jobs.yml").text;
  assert.match(workflow, /^ {6}NVIDIA_API_KEY: \$\{\{ secrets\.NVIDIA_API_KEY \}\}$/m);
  assert.match(workflow, /AGENT_M_KEY_NAMES: "NVIDIA_API_KEY"/);
});

// The instance's repository on GitHub, in memory, with Agent M's job workflow: a commit of a job's record is kept as the record of a job that has already run on CI and ended
// `done`, its log the run RUN, whose log holds the answer "ok" between the answer's lines (MOD-workflow-entries) and, where `tested` is given, that endpoint's test as one
// line of JSON between the test's lines. `starts` keeps the inputs of every started workflow. With `failing`, every read of the repository after the job's workflow was started
// fails, as a server that gives no answer does.
const RUN = "https://github.com/fixture/instance/actions/runs/77";
function instanceWithJobWorkflow({ failing = false, tested = null } = {}) {
  const repository = { server: "github", origin: "https://github.com", path: "fixture/instance", web: "https://github.com/fixture/instance" };
  const files = new Map([["docs/participants.md", PARTICIPANTS], ["SPEC.md", "# Spec\n"], ["AGENTS.md", "# Agents\n"], [".github/workflows/agent-m-jobs.yml", "name: agent-m-jobs\n"]]);
  let head = INSTANCE_COMMIT, made = 0, started = false, id = null;
  const starts = [];
  const unreachable = () => { if (failing && started) throw new Error("Unreachable: the server gave no answer"); };
  return { starts, host: {
    async repositoryInfo() { unreachable(); return { defaultBranch: "main", canWrite: true, visibility: "private", archived: false, description: "" }; },
    async readSnapshot(ref) { unreachable(); return { repository, ref, commit: head, paths: [...files.keys()], blob: (path) => (files.has(path) ? `${made}`.repeat(40).slice(0, 40) : null), async read(path) { return files.get(path) ?? null; }, async readMany() {} }; },
    async listPullRequests() { return []; },
    async containsCommit() { return false; },
    async setCiSecret() {},
    async commitFiles(change) {
      for (const file of change.files) {
        const job = /^docs\/jobs\/(JOB-[^/]+)\.md$/.exec(file.path);
        if (job) id = job[1];
        files.set(file.path, job ? appendToRecord(file.text, { part: "end", at: new Date(), state: "done", results: [], usage: null, cost: null, reason: null, log: RUN, draft: null, rounds: [] }) : file.text);
      }
      made += 1;
      head = `${made}`.repeat(40).slice(0, 40);
      return { commit: head, url: `${repository.web}/commit/${head}` };
    },
    async startWorkflow(workflow, ref, inputs) { started = true; starts.push(inputs); return null; },
    async listCiRuns() { unreachable(); return [{ id: 77, url: RUN, state: "done", started: null }]; },
    async ciRunLog() {
      return `--- answer of ${id} ---\nok\n--- end of the answer of ${id} ---\n${tested ? `--- test of ${id} ---\n${JSON.stringify(tested)}\n--- end of the test of ${id} ---\n` : ""}`;
    },
  } };
}

// An endpoint that runs through GitHub Actions — a CI secret, no Bridge —, tested once before, with a last test that is old.
const OLD_TEST = { at: "2026-01-01T00:00:00.000Z", outcome: "working", tools: true };
function storeWithActionsEndpoint() {
  const store = freshStore();
  writeSetting(store, "endpoint:nvidia", { ...NVIDIA, place: "NVIDIA, USA", context: 128000, secret: "NVIDIA_API_KEY" });
  writeSetting(store, "last-test:endpoint:nvidia", OLD_TEST);
  writeSetting(store, "github-token", { value: "github_pat_FIXTURE0123456789abcdef", name: "alice", expires: "2027-01-01" });
  return store;
}

// What changed: the test job's run now sends MOD-endpoint-calls' testEndpoint and leaves its result in the log (MOD-settings-pages endpoints, as accepted): the last test is
// recorded with `tools` from that test, false where the run left none — as this run, whose log holds no test, does —, where it was recorded with no `tools` before.
// TST-1200205 · level: unit · module: MOD-settings-pages
// guards: UC-003; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: endpoint:nvidia, which runs through GitHub Actions, with a last test of 2026-01-01 that found it working and using tools; the instance's repository with the job workflow, where the test job runs and ends done with the answer "ok", its log holding no endpoint's test; known positive: the line's status names the old test before Test
// input: Test on the endpoint's line of the Settings page
// expect: once the test job has ended, the line on the page says "Works. Last successful test: <the new test's time>", not the old one, and its result names the answer and says "text only"; the last test kept is working with `tools` false — the run left no test —, and the result does not say "can use tools"
test("Test of an endpoint on GitHub Actions shows the new last test on its line once the test job has ended, text only where the run left no test", async () => {
  const store = storeWithActionsEndpoint(), repo = instanceWithJobWorkflow();
  const page = document.createElement("div");
  await route("settings").render(page, { instance: { repository: "fixture/instance", host: repo.host }, product: null, store, go() {} }, {});
  assert.match(one(page, "settings-endpoint-status").textContent, /Last successful test: 2026-01-01T00:00:00\.000Z\./, "known positive: the old test is shown before Test");
  await click(one(page, "settings-endpoint-test"), true);
  await until(() => readSetting(store, "last-test:endpoint:nvidia")?.at !== OLD_TEST.at || /ended|could not|No test job/.test(one(page, "settings-endpoint-result")?.textContent ?? ""), "the test job's end");
  await until(() => true, "a turn");
  const lastTest = readSetting(store, "last-test:endpoint:nvidia");
  assert.notEqual(lastTest.at, OLD_TEST.at, `a new last test is recorded; the line says: ${one(page, "settings-endpoint-result")?.textContent}`);
  assert.equal(lastTest.outcome, "working");
  assert.equal(one(page, "settings-endpoint-status").textContent, `Runs through GitHub Actions with the CI secret NVIDIA_API_KEY. Works. Last successful test: ${lastTest.at}.`);
  assert.match(one(page, "settings-endpoint-result").textContent, /answered through GitHub Actions \(JOB-[^)]+\): ok/);
  assert.equal(lastTest.tools, false, `the run left no test: ${JSON.stringify(lastTest)}`);
  assert.match(one(page, "settings-endpoint-result").textContent, /text only/);
  assert.doesNotMatch(one(page, "settings-endpoint-result").textContent, /can use tools/);
});

// The Settings page's endpoint line of storeWithActionsEndpoint, tested on the instance `repo`: the line's result once the test job has ended, and the last test kept.
async function testedOnTheLine(repo) {
  const store = storeWithActionsEndpoint();
  const page = document.createElement("div");
  await route("settings").render(page, { instance: { repository: "fixture/instance", host: repo.host }, product: null, store, go() {} }, {});
  await click(one(page, "settings-endpoint-test"), true);
  await until(() => readSetting(store, "last-test:endpoint:nvidia")?.at !== OLD_TEST.at, "the test job's end");
  await until(() => true, "a turn");
  return { result: one(page, "settings-endpoint-result"), lastTest: readSetting(store, "last-test:endpoint:nvidia") };
}

// TST-1200207 · level: unit · module: MOD-settings-pages
// guards: UC-003; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: endpoint:nvidia of TST-1200205, and its last test of 2026-01-01 cleared of tools by a run that left none (TST-1200205, the counter-proof); the instance's repository with the job workflow, whose test job's run leaves the answer "ok" and the test {"works":true,"model":"nvidia/nemotron-3-ultra-550b-a55b","tools":true,"toolMessage":null}
// input: Test on the endpoint's line of the Settings page
// expect: the test job's workflow is started with the input test "true"; the line's result names the answer and says "can use tools", not "text only"; the last test kept is working with `tools` true
test("the test job of an endpoint on GitHub Actions is spawned with test, and the run's test says can use tools, recorded as its last test", async () => {
  const repo = instanceWithJobWorkflow({ tested: { works: true, model: NVIDIA.model, tools: true, toolMessage: null } });
  const { result, lastTest } = await testedOnTheLine(repo);
  assert.equal(repo.starts.length, 1);
  assert.equal(repo.starts[0].test, "true", JSON.stringify(repo.starts[0]));
  assert.match(result.textContent, /answered through GitHub Actions \(JOB-[^)]+\): ok/);
  assert.match(result.textContent, /can use tools/);
  assert.doesNotMatch(result.textContent, /text only/);
  assert.equal(lastTest.outcome, "working");
  assert.equal(lastTest.tools, true);
});

// TST-1200208 · level: unit · module: MOD-settings-pages
// guards: UC-003
// given: endpoint:nvidia of TST-1200205; the instance's repository with the job workflow, whose test job's run leaves the answer "ok" and the test {"works":true,…,"tools":false,"toolMessage":"tools are not supported for this model"}
// input: Test on the endpoint's line of the Settings page
// expect: the line's result says "text only" and holds the endpoint's message folded — a details element whose text holds "tools are not supported for this model" —; the last test kept is working with `tools` false
test("a run's test in which the model did not call the tool says text only, its message folded", async () => {
  const repo = instanceWithJobWorkflow({ tested: { works: true, model: NVIDIA.model, tools: false, toolMessage: "tools are not supported for this model" } });
  const { result, lastTest } = await testedOnTheLine(repo);
  assert.match(result.textContent, /text only/);
  const folded = descendants(result, (node) => node.localName === "details");
  assert.equal(folded.length, 1, "the message is folded");
  assert.match(folded[0].textContent, /tools are not supported for this model/);
  assert.equal(lastTest.outcome, "working");
  assert.equal(lastTest.tools, false);
});

// TST-1200206 · level: unit · module: MOD-settings-pages
// guards: UC-003; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: endpoint:nvidia of TST-1200205; the instance's repository, whose server gives no answer once the test job's workflow is started; known positive: the same page shows the job's outcome when the server answers (TST-1200205)
// input: Test on the endpoint's line of the Settings page
// expect: the line's result names what could not be read — "The job could not be followed. Error: Unreachable: the server gave no answer" —, and does not say the job is queued; no test is recorded
test("a poll of the test job that fails is shown on the line as what could not be read, not as queued", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const store = storeWithActionsEndpoint(), repo = instanceWithJobWorkflow({ failing: true });
    const page = document.createElement("div");
    await route("settings").render(page, { instance: { repository: "fixture/instance", host: repo.host }, product: null, store, go() {} }, {});
    await click(one(page, "settings-endpoint-test"), true);
    await until(() => /Test job JOB-/.test(one(page, "settings-endpoint-result").textContent), "the followed test job is shown");
    const said = one(page, "settings-endpoint-result").textContent;
    assert.match(said, /The job could not be followed\. Error: Unreachable: the server gave no answer/);
    assert.doesNotMatch(said, /queued/);
    assert.deepEqual(readSetting(store, "last-test:endpoint:nvidia"), OLD_TEST, "a test job that is not seen to end records no test");
  } finally {
    mock.timers.reset();
  }
});

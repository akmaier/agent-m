// A product not set up for GitHub Actions, in the prompt bar (UC-049 4c; UC-010, Precondition) — MOD-prompt-bar's startPromptBar, as docs/architecture/MOD-prompt-bar.md states it: on
// GitHub, before *Spawn job* spawns and before a hand-over is queued on the CI route, the bar asks MOD-runtimes' actionsSetup for the message's page; where the job workflow is missing, or a
// secret the run reads — AGENT_M_TOKEN, or the one the participant's route names —, nothing is handed over, the bar shows `Nothing was handed over: <owner/repo> is not set up for GitHub
// Actions. Missing: <the job workflow · SECRET · …>` and offers **Set up GitHub Actions**, whose one person's click runs setUp, assesses again on the head the setup left and hands over, or
// spawns, as the Send asked, with no further click. A secret this browser keeps no value for is named with the server's page of the repository's secrets. On GitLab the bar keeps its link to
// the route settings.
// Run: node --test tests/prompt-bar-actions-setup.test.mjs
//
// Module: MOD-prompt-bar
// Guards: UC-049; UC-010; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// Level: component
//
// Each test states its expected result in its own text; none reads it from a document. The real MOD-prompt-bar, MOD-runtimes (actionsSetup, jobWorkflowFiles, handOverJob), MOD-job-runner,
// MOD-job-catalogue (the kind `converse`), MOD-job-ledger and MOD-browser-store run as they are; the one recipe `chapters-for-page` that `converse` names is a fixture that gives no part. The
// repository servers are fakes in memory (default branch `trunk`) that keep every commit attempt, every started workflow, every listing of the Actions secrets and every secret stored, with
// the value it was stored with; the model endpoint at https://models.example stands behind the global `fetch`, and a request to any other address is kept as stray: it must be none. A script's
// click is a plain Event (isTrusted false); a person's click is an Event whose isTrusted is true. The tokens and keys are fixtures, never real credentials. The counter-proofs (a planted fault in
// src/prompt-bar/ and each test's failing result) are recorded in the commit message.

import test, { afterEach, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { jobWorkflowFiles } from "../src/runtimes/index.mjs";
import { startPromptBar } from "../src/prompt-bar/index.mjs";
import { tick, until } from "./prompt-bar.d/until.mjs";

// ---------------------------------------------------------------- the part of a browser's DOM that is used

class Text { constructor(data) { this.data = String(data); this.parentNode = null; } get textContent() { return this.data; } }
class Element extends EventTarget {
  constructor(name) {
    super();
    Object.assign(this, { localName: name, childNodes: [], className: "", value: "", type: "", hidden: false, disabled: false, parentNode: null, attrs: {}, html: "" });
  }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  getAttribute(name) { return this.attrs[name] ?? null; }
  set innerHTML(value) { this.html = String(value); }
  get innerHTML() { return this.html; }
  get textContent() { return this.html + this.childNodes.map((child) => child.textContent).join(""); }
  focus() {}
}
globalThis.document = { createElement: (name) => new Element(name) };

const all = (root, test) => { const found = []; (function visit(node) { for (const child of node.childNodes ?? []) if (child instanceof Element) { if (test(child)) found.push(child); visit(child); } })(root); return found; };
const byClass = (root, name) => all(root, (node) => node.className.split(" ").includes(name));
const one = (root, name) => byClass(root, name)[0];
const textOf = (node) => node?.textContent ?? "";
const settle = async () => { for (let at = 0; at < 60; at += 1) await tick(); };
const scripted = () => new Event("click");
const personal = () => Object.defineProperty(new Event("click"), "isTrusted", { value: true });

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}

// ---------------------------------------------------------------- the repositories

const blobOf = (text) => createHash("sha1").update(text).digest("hex");
const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name }, fields);

// One repository in memory on `server` whose default branch is `trunk`, holding `files`, whose Actions secrets are `secrets` by name. `attempts` keeps every commit attempt, `starts` every
// started workflow, `stored` every secret stored ([name, value]), `listings` counts the listings of the secrets.
function repoOf(web, files, { secrets = [], server = "github" } = {}) {
  const commits = new Map(), attempts = [], starts = [], stored = [], held = new Set(secrets);
  let made = 0, listings = 0;
  const commitOf = (tree) => { const id = createHash("sha1").update(`${web}#${++made}`).digest("hex"); commits.set(id, tree); return id; };
  let head = commitOf(new Map(Object.entries(files)));
  const url = new URL(web);
  const repository = { server, origin: url.origin, path: url.pathname.replace(/^\/+/, ""), web };
  const snapshotAt = (id) => {
    const tree = commits.get(id);
    return { repository, ref: id === head ? "trunk" : id, commit: id, paths: [...tree.keys()].sort(), blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null),
      read: async (path) => (tree.has(path) ? tree.get(path) : null), readMany: async () => {} };
  };
  const it = {
    attempts, starts, stored, head: () => head, listings: () => listings, file: (path) => commits.get(head).get(path) ?? null,
    jobPaths: () => attempts.flatMap((attempt) => attempt.files.map((file) => file.path)).filter((path) => /^docs\/jobs\/JOB-.*\.md$/.test(path)),
    host: {
      async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
      async readSnapshot(ref) { return snapshotAt(ref === "trunk" ? head : commits.has(ref) ? ref : head); },
      async listPullRequests() { return []; },
      async containsCommit() { return false; },
      async commitFiles(change) {
        attempts.push(structuredClone(change));
        if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", { head });
        head = commitOf(new Map([...commits.get(head), ...change.files.map((file) => [file.path, file.text])]));
        return { commit: head, url: `${web}/commit/${head}` };
      },
      async startWorkflow(workflow, ref, inputs) { starts.push({ workflow, ref, inputs: structuredClone(inputs) }); return null; },
      async ciSecretNames() {
        listings += 1;
        if (server !== "github") throw failure("NotSupported", { what: "listing CI secrets on a GitLab server" });
        return [...held];
      },
      async setCiSecret(name, value) { stored.push([name, value]); held.add(name); },
      async listCiRuns() { return []; },
      async ciRunLog() { return null; },
      webLinks: () => ({ secrets: `${web}/settings/secrets/actions` }),
    },
  };
  return it;
}

const INSTANCE_WEB = "https://github.com/alice/agent-m";
const PRODUCT_WEB = "https://github.com/alice/thesis-tool";
const GITLAB_WEB = "https://gitlab.example.test/alice/thesis-tool";
const SECRETS_PAGE = `${PRODUCT_WEB}/settings/secrets/actions`;
const INSTANCE_TOKEN = "github_pat_FIXTURE_INSTANCE_0123456789";
const PRODUCT_TOKEN = "github_pat_FIXTURE_PRODUCT_0123456789";
const NVIDIA_KEY = "nvapi-FIXTURE-KEY-0123456789";
const TASK = "PLANTED-TASK-AS10 look at the export";

const COLUMNS = "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|";
const REGISTER = `# Participants of this instance\n\n**REGISTER**\n\n${COLUMNS}\n| alice | person | — | — | — | read the repository, write to the repository | — | account github.com/alice |\n`;
const INSTANCE_FILES = { "SPEC.md": "# Instance spec\n", "docs/participants.md": REGISTER };

// The files of Agent M's job workflow for a GitHub product, as jobWorkflowFiles gives them for the instance's commit and the secrets this browser names: AGENT_M_TOKEN and NVIDIA_API_KEY
// (and OTHER_KEY where the browser keeps the endpoint `other`).
const workflowFiles = (instance, keys = ["NVIDIA_API_KEY"]) => Object.fromEntries(jobWorkflowFiles("github", { repository: "alice/agent-m", commit: instance.head() },
  { token: "AGENT_M_TOKEN", keys }, []).map(({ path, text }) => [path, text]));

// ---------------------------------------------------------------- the network, the strategies

const MODELS = "https://models.example";
const BRIDGE = "http://localhost:4713";
const BRIDGE_TOKEN = "token-FIXTURE-lab";
const realFetch = globalThis.fetch;
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
// The model endpoint, and the Bridge lab that calls it for relay, answer each message with an answer and, where `handOver` is set, the hand-over it proposes; the Bridge offers no CLI
// session. Every other address is stray.
function network() {
  const state = { handOver: null, seen: [], stray: [] };
  const envelope = () => JSON.stringify({ draft: { answer: "I hand this on.", ...(state.handOver ? { handOver: state.handOver } : {}) }, answers: [] });
  globalThis.fetch = async (url, init = {}) => {
    const where = new URL(String(url));
    const method = init.method ?? "GET";
    state.seen.push({ origin: where.origin, method, path: where.pathname, body: String(init.body ?? "") });
    if (where.origin === MODELS) return json({ choices: [{ message: { content: envelope() } }], usage: { prompt_tokens: 10, completion_tokens: 5 } });
    if (where.origin === BRIDGE && init.headers?.["x-agent-m-bridge-token"] === BRIDGE_TOKEN) {
      if (method === "GET" && where.pathname === "/v1/pair") return json({ bridge: { name: "lab", version: "1.0.0", platform: "linux" }, origin: "https://alice.github.io" });
      if (method === "GET" && where.pathname === "/v1/agents") return json({ agents: [], missing: [] });
      if (method === "POST" && where.pathname === "/v1/ask") return json({ ask: "ask-1" });
      if (method === "GET" && where.pathname === "/v1/ask/ask-1") return json({ state: "done", text: envelope(), calls: [], usage: null });
    }
    state.stray.push(String(url));
    return json({}, 404);
  };
  return state;
}

registerStrategies("tests/prompt-bar-actions-setup.test.mjs", { recipes: { "chapters-for-page": async () => [] } });

const bars = [];
beforeEach(() => { mock.timers.enable({ apis: ["setTimeout"] }); });
afterEach(() => {
  for (const bar of bars.splice(0)) bar.stop();
  mock.timers.reset();
  globalThis.fetch = realFetch;
});

// ---------------------------------------------------------------- the page

const subject = () => ({ key: "use-case:UC-007", title: "UC-007 Derive use cases", entry: "use-cases", paramsFor: () => ({ page: "The page shows UC-007." }), draftRoute: null,
  withhold: null, refuses: [] });

// This browser's endpoints: nvidia, which runs through GitHub Actions (the CI secret NVIDIA_API_KEY, no Bridge) — with its key here unless `nvidiaKey` is false —, so that the button reads
// Spawn job; and, with `other`, the endpoint other, which names the CI secret OTHER_KEY and whose key this browser keeps.
function endpoints({ nvidiaKey = true, other = false } = {}) {
  return {
    nvidia: { kind: "openai-compatible", url: "https://integrate.api.nvidia.com/v1", model: "nvidia/nemotron", place: "NVIDIA, USA", context: 128000, secret: "NVIDIA_API_KEY",
      ...(nvidiaKey ? { key: NVIDIA_KEY } : {}) },
    ...(other ? { other: { kind: "openai-compatible", url: `${MODELS}/v1`, model: "model-other", key: "sk-FIXTURE-OTHER", place: "Anthropic, USA", context: 200000, secret: "OTHER_KEY" } } : {}),
  };
}

// The bar on a page of `product` (null: a page of the instance), with this browser's endpoints, the instance's and the product's tokens, and the frame's tokenKey for the product.
function open({ product, instance, store: storeOptions = {}, extraEndpoints = {}, went = [] }) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: new Storage() });
  const store = openStore("alice/agent-m");
  for (const [name, setting] of Object.entries({ ...endpoints(storeOptions), ...extraEndpoints })) writeSetting(store, `endpoint:${name}`, setting);
  writeSetting(store, "github-token", { value: INSTANCE_TOKEN, name: "alice", expires: "2027-01-01" });
  writeSetting(store, "github-token:alice/thesis-tool", { value: PRODUCT_TOKEN, name: "alice", expires: "2027-01-01" });
  writeSetting(store, "gitlab-token:gitlab.example.test/alice/thesis-tool", { value: "glpat-FIXTURE-0123456789", name: "alice", expires: "2027-01-01" });
  writeSetting(store, "bridge:lab", { address: BRIDGE, token: BRIDGE_TOKEN });
  const net = network();
  const target = document.createElement("div");
  const tokenKey = product === null ? null : product.web.startsWith("https://gitlab.") ? "gitlab-token:gitlab.example.test/alice/thesis-tool" : "github-token:alice/thesis-tool";
  const bar = startPromptBar(target, { page: "main", store, instance: { repository: "alice/agent-m", host: instance.host },
    product: () => (product === null ? null : { address: product.web, host: product.host, tokenKey }), products: () => [], subject,
    explain: () => document.createElement("details"), go: (...where) => went.push(where) });
  bars.push(bar);
  return { target, net, store, went, bar, web: product?.web ?? INSTANCE_WEB };
}

const status = (it) => textOf(one(it.target, "status"));
const setUpButtons = (it) => all(it.target, (node) => node.localName === "button" && textOf(node) === "Set up GitHub Actions");
const writesOf = (...repos) => repos.reduce((sum, repo) => sum + repo.attempts.length + repo.starts.length + repo.stored.length, 0);
const choose = (it, name) => { const selector = one(it.target, "participant"); selector.value = name; selector.dispatchEvent(new Event("change")); };

// Spawn job with nvidia chosen and TASK as the message, by a person's click; resolves once the bar has answered — the job is spawned, or the bar says why not.
async function spawns(it) {
  await until(() => one(it.target, "instruction") !== undefined, "the bar is drawn");
  choose(it, "nvidia");
  assert.equal(textOf(one(it.target, "send")), "Spawn job", "known positive: nvidia runs through GitHub Actions");
  one(it.target, "instruction").value = TASK;
  one(it.target, "send").dispatchEvent(personal());
  await until(() => /Nothing was|Spawned as/.test(status(it)), "the bar answers the Spawn job");
}

const repoWith = (web, files, options) => ({ ...repoOf(web, files, options), web });

// ---------------------------------------------------------------- Spawn job

// TST-2026111001 · level: component · module: MOD-prompt-bar
// guards: UC-049; UC-010; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the GitHub product alice/thesis-tool without Agent M's job workflow, whose repository holds the Actions secret NVIDIA_API_KEY and not AGENT_M_TOKEN; this browser keeps the product's token
//   and nvidia's key; nvidia chosen, so that the button reads Spawn job; known positive: the same bar spawns at once on a product that has both (TST-2026111004)
// input: a person's click on Spawn job with the message TASK
// expect: the bar says "Nothing was handed over: alice/thesis-tool is not set up for GitHub Actions. Missing: the job workflow · AGENT_M_TOKEN" and shows one button "Set up GitHub Actions" and no
//   link "Set up the job workflow"; nothing was written — no commit on the product or the instance, no workflow started, no secret stored —; the secrets were listed once
test("TST-2026111001: Spawn job toward a GitHub product lacking the job workflow and AGENT_M_TOKEN writes nothing and offers Set up GitHub Actions", async () => {
  const instance = repoOf(INSTANCE_WEB, INSTANCE_FILES);
  const product = repoWith(PRODUCT_WEB, { "SPEC.md": "# Spec\n" }, { secrets: ["NVIDIA_API_KEY"] });
  const it = open({ product, instance });
  await spawns(it);
  assert.ok(status(it).includes("Nothing was handed over: alice/thesis-tool is not set up for GitHub Actions. Missing: the job workflow · AGENT_M_TOKEN"), status(it));
  assert.equal(setUpButtons(it).length, 1);
  assert.equal(byClass(it.target, "settings-link").length, 0, "GitHub's setup replaces the link to settings");
  assert.equal(writesOf(product, instance), 0, "nothing was written");
  assert.equal(product.listings(), 1);
  assert.deepEqual(it.net.stray, []);
});

// TST-2026111002 · level: component · module: MOD-prompt-bar
// guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the bar of TST-2026111001, showing Set up GitHub Actions; known positive: a person's click on the same button sets up and spawns (TST-2026111003)
// input: a click a script makes on Set up GitHub Actions (isTrusted false)
// expect: nothing was written — no commit, no workflow started, no secret stored — and the button is still shown
test("TST-2026111002: a script's click on Set up GitHub Actions does nothing", async () => {
  const instance = repoOf(INSTANCE_WEB, INSTANCE_FILES);
  const product = repoWith(PRODUCT_WEB, { "SPEC.md": "# Spec\n" }, { secrets: ["NVIDIA_API_KEY"] });
  const it = open({ product, instance });
  await spawns(it);
  setUpButtons(it)[0].dispatchEvent(scripted());
  await settle();
  assert.equal(writesOf(product, instance), 0, "nothing was written");
  assert.equal(setUpButtons(it).length, 1);
});

// TST-2026111003 · level: component · module: MOD-prompt-bar
// guards: UC-049; UC-010; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: the bar of TST-2026111001, showing Set up GitHub Actions
// input: one person's click on Set up GitHub Actions — and no other click
// expect: setUp runs once: the first commit on the product, on the head the page read, writes the job workflow's two files (.github/workflows/agent-m-jobs.yml and
//   .github/workflows/agent-m-main-changed.yml) and nothing else, and AGENT_M_TOKEN is stored once, with the product's own token, not the instance's; then the job is spawned once: the second
//   commit, on the head the setup left, adds the job's record docs/jobs/JOB-….md (participant nvidia) to the product's repository, the job workflow agent-m-jobs.yml is started once with the
//   task TASK, and the bar says "Spawned as JOB-…"; nothing was written to the instance; no further click was made
test("TST-2026111003: one person's click on Set up GitHub Actions sets up once and then spawns the job once in the product's repository, with no further click", async () => {
  const instance = repoOf(INSTANCE_WEB, INSTANCE_FILES);
  const product = repoWith(PRODUCT_WEB, { "SPEC.md": "# Spec\n" }, { secrets: ["NVIDIA_API_KEY"] });
  const head = product.head();
  const it = open({ product, instance });
  await spawns(it);
  setUpButtons(it)[0].dispatchEvent(personal());
  await until(() => status(it).includes("Spawned as") || product.attempts.length > 2, "the job is spawned after the setup");
  assert.equal(product.attempts.length, 2, JSON.stringify(product.attempts.map((attempt) => attempt.files.map((file) => file.path))));
  const [setup, record] = product.attempts;
  assert.equal(setup.expectedHead, head);
  assert.deepEqual(setup.files.map((file) => file.path).sort(), [".github/workflows/agent-m-jobs.yml", ".github/workflows/agent-m-main-changed.yml"]);
  assert.deepEqual(product.stored, [["AGENT_M_TOKEN", PRODUCT_TOKEN]]);
  assert.notEqual(record.expectedHead, head, "the job is spawned on the head the setup left");
  assert.equal(record.files.length, 1);
  assert.match(record.files[0].path, /^docs\/jobs\/JOB-\d{8}-\d{4}-[0-9a-f]{4}\.md$/);
  assert.match(record.files[0].text, /^participant: nvidia$/m);
  assert.equal(product.starts.length, 1);
  assert.equal(product.starts[0].workflow, "agent-m-jobs.yml");
  assert.equal(product.starts[0].inputs.task, TASK);
  assert.ok(status(it).includes(`Spawned as ${/JOB-[^/]+(?=\.md$)/.exec(record.files[0].path)[0]}`), status(it));
  assert.equal(instance.attempts.length + instance.stored.length, 0, "nothing was written to the instance");
  assert.deepEqual(it.net.stray, []);
});

// TST-2026111004 · level: component · module: MOD-prompt-bar
// guards: UC-049; UC-010
// given: the GitHub product holding the job workflow's files as this instance commit gives them and the Actions secrets AGENT_M_TOKEN and NVIDIA_API_KEY; this browser also keeps the endpoint
//   other, whose CI secret OTHER_KEY the repository lacks — a secret the run of nvidia does not read; and, apart, the product holding the job workflow's files with one of them standing with
//   another text, an outdated file; known positive: TST-2026111001, where the bar holds the job back
// input: a person's click on Spawn job with the message TASK, on each
// expect: on each the job is spawned at once — one commit adds the job's record, the job workflow is started once, the bar says "Spawned as" —, with no "Nothing was handed over" and no button
//   Set up GitHub Actions; no secret was stored
test("TST-2026111004: a product that has what the run reads spawns at once; a missing secret the run does not read, or an outdated file, holds nothing back", async () => {
  for (const outdated of [false, true]) {
    const instance = repoOf(INSTANCE_WEB, INSTANCE_FILES);
    const files = workflowFiles(instance, ["NVIDIA_API_KEY", "OTHER_KEY"]);
    if (outdated) files[".github/workflows/agent-m-main-changed.yml"] = "name: an older text\n";
    const product = repoWith(PRODUCT_WEB, { "SPEC.md": "# Spec\n", ...files }, { secrets: ["AGENT_M_TOKEN", "NVIDIA_API_KEY"] });
    const it = open({ product, instance, store: { other: true } });
    await spawns(it);
    assert.ok(status(it).includes("Spawned as"), status(it));
    assert.equal(status(it).includes("Nothing was handed over"), false);
    assert.equal(setUpButtons(it).length, 0);
    assert.equal(product.attempts.length, 1);
    assert.equal(product.starts.length, 1);
    assert.deepEqual(product.stored, []);
  }
});

// TST-2026111005 · level: component · module: MOD-prompt-bar
// guards: UC-049; UC-010
// given: the GitHub product holding the job workflow's files and the Actions secret AGENT_M_TOKEN, not NVIDIA_API_KEY; this browser keeps no key for nvidia
// input: a person's click on Spawn job with the message TASK
// expect: the bar says "Nothing was handed over: alice/thesis-tool is not set up for GitHub Actions. Missing: NVIDIA_API_KEY", names NVIDIA_API_KEY as a secret this browser keeps no value
//   for with one link whose address is the repository's secrets page (the host's webLinks().secrets), and offers no button Set up GitHub Actions — it could set nothing up —; nothing was written
test("TST-2026111005: a secret the run reads that this browser keeps no value for is named with the secrets page, and nothing is handed over", async () => {
  const instance = repoOf(INSTANCE_WEB, INSTANCE_FILES);
  const product = repoWith(PRODUCT_WEB, { "SPEC.md": "# Spec\n", ...workflowFiles(instance) }, { secrets: ["AGENT_M_TOKEN"] });
  const it = open({ product, instance, store: { nvidiaKey: false } });
  await spawns(it);
  assert.ok(status(it).includes("Nothing was handed over: alice/thesis-tool is not set up for GitHub Actions. Missing: NVIDIA_API_KEY"), status(it));
  const unknown = one(it.target, "unknown-secrets");
  assert.ok(textOf(unknown).includes("NVIDIA_API_KEY"), textOf(unknown));
  const links = byClass(unknown, "secrets-link");
  assert.equal(links.length, 1);
  assert.equal(links[0].getAttribute("href"), SECRETS_PAGE);
  assert.equal(setUpButtons(it).length, 0);
  assert.equal(writesOf(product, instance), 0, "nothing was written");
});

// TST-2026111006 · level: component · module: MOD-prompt-bar
// guards: UC-049; UC-010; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the GitHub product without the job workflow and without any Actions secret; this browser keeps the product's token and no key for nvidia
// input: a person's click on Spawn job with TASK; then a person's click on Set up GitHub Actions
// expect: before the click the bar names "Missing: the job workflow · AGENT_M_TOKEN · NVIDIA_API_KEY", NVIDIA_API_KEY as kept no value for, and the button; the click commits the job workflow
//   and stores AGENT_M_TOKEN, and then hands nothing over: no job record is committed and no workflow started, and the bar says "Nothing was handed over" naming NVIDIA_API_KEY with the
//   repository's secrets page
test("TST-2026111006: after the setup a secret the run reads that this browser could not store still holds the job back", async () => {
  const instance = repoOf(INSTANCE_WEB, INSTANCE_FILES);
  const product = repoWith(PRODUCT_WEB, { "SPEC.md": "# Spec\n" });
  const it = open({ product, instance, store: { nvidiaKey: false } });
  await spawns(it);
  assert.ok(status(it).includes("Missing: the job workflow · AGENT_M_TOKEN · NVIDIA_API_KEY"), status(it));
  assert.ok(textOf(one(it.target, "unknown-secrets")).includes("NVIDIA_API_KEY"));
  setUpButtons(it)[0].dispatchEvent(personal());
  await until(() => product.stored.length > 0 && setUpButtons(it).length === 0, "the setup has run");
  await settle();
  assert.equal(product.attempts.length, 1, "the setup's commit, and no job record");
  assert.deepEqual(product.stored, [["AGENT_M_TOKEN", PRODUCT_TOKEN]]);
  assert.equal(product.jobPaths().length, 0);
  assert.equal(product.starts.length, 0);
  assert.ok(status(it).includes("Nothing was handed over") && status(it).includes("NVIDIA_API_KEY"), status(it));
  assert.equal(byClass(one(it.target, "unknown-secrets"), "secrets-link")[0]?.getAttribute("href"), SECRETS_PAGE);
});

// TST-2026111007 · level: component · module: MOD-prompt-bar
// guards: UC-049; UC-010; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a page of the instance alice/agent-m (no product), whose repository has no job workflow and no Actions secret; this browser keeps the instance's token under github-token and
//   nvidia's key
// input: a person's click on Spawn job with TASK; then a person's click on Set up GitHub Actions
// expect: the bar names "alice/agent-m is not set up for GitHub Actions. Missing: the job workflow · AGENT_M_TOKEN · NVIDIA_API_KEY", with no secret named as kept no value for; the click stores
//   AGENT_M_TOKEN with the instance's token and NVIDIA_API_KEY with nvidia's key, in the instance's repository, and the job is spawned there once
test("TST-2026111007: on a page of the instance the bar sets up the instance's repository with the instance's token", async () => {
  const instance = repoOf(INSTANCE_WEB, INSTANCE_FILES);
  const it = open({ product: null, instance });
  await spawns(it);
  assert.ok(status(it).includes("Nothing was handed over: alice/agent-m is not set up for GitHub Actions. Missing: the job workflow · AGENT_M_TOKEN · NVIDIA_API_KEY"), status(it));
  assert.equal(byClass(it.target, "unknown-secrets").length, 0, status(it));
  setUpButtons(it)[0].dispatchEvent(personal());
  await until(() => status(it).includes("Spawned as") || /Nothing was spawned/.test(status(it)), "the job is spawned after the setup");
  assert.deepEqual(instance.stored, [["AGENT_M_TOKEN", INSTANCE_TOKEN], ["NVIDIA_API_KEY", NVIDIA_KEY]]);
  assert.equal(instance.jobPaths().length, 1);
  assert.equal(instance.starts.length, 1);
});

// ---------------------------------------------------------------- a hand-over on the CI route

// The endpoint relay, called by this tab through the Bridge lab and naming the CI secret NVIDIA_API_KEY of its key, so that the bar reads Send for it and a hand-over of the conversation
// itself takes GitHub Actions (UC-049 4a.2); its answer proposes that hand-over.
const RELAY = { relay: { kind: "openai-compatible", url: `${MODELS}/v1`, model: "model-relay", key: NVIDIA_KEY, place: "Anthropic, USA", context: 200000, secret: "NVIDIA_API_KEY", bridge: "lab" } };

// Sends a message to relay, whose answer proposes handing the conversation itself on, and waits until the proposal is checked.
async function proposesHandOver(it) {
  await until(() => one(it.target, "instruction") !== undefined, "the bar is drawn");
  it.net.handOver = { kind: "converse", works_on: [it.web], task: TASK };
  choose(it, "relay");
  assert.equal(textOf(one(it.target, "send")), "Send", "known positive: relay is called by this tab");
  one(it.target, "instruction").value = "hand this on";
  one(it.target, "send").dispatchEvent(personal());
  await until(() => byClass(it.target, "hand-over").length > 0, "the proposal is shown");
  await until(() => !textOf(one(it.target, "hand-over")).includes("Checking"), "the proposal is checked");
  await settle();
}

// TST-2026111008 · level: component · module: MOD-prompt-bar
// guards: UC-049; UC-010; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the GitHub product without the job workflow, holding the Actions secret NVIDIA_API_KEY and not AGENT_M_TOKEN; the endpoint relay — called through the Bridge lab, naming the CI secret
//   NVIDIA_API_KEY of its key — whose answer hands the conversation itself on ({ kind: "converse", works_on: [the product's address], task: TASK }), which takes GitHub Actions
// input: the person's Send; then one person's click on Set up GitHub Actions
// expect: after Send the hand-over shows "Nothing was handed over: alice/thesis-tool is not set up for GitHub Actions. Missing: the job workflow · AGENT_M_TOKEN", the button, and no link
//   "Set up the job workflow"; nothing is queued; after the click the setup commits the job workflow and stores AGENT_M_TOKEN, and the hand-over is assessed again and queued at once — one
//   commit adds the job's record (route ci hosted), the job workflow is started once with the task TASK
test("TST-2026111008: a hand-over on the CI route toward a product not set up is held back, and one click sets up and queues it", async () => {
  const instance = repoOf(INSTANCE_WEB, INSTANCE_FILES);
  const product = repoWith(PRODUCT_WEB, { "SPEC.md": "# Spec\n" }, { secrets: ["NVIDIA_API_KEY"] });
  const it = open({ product, instance, extraEndpoints: RELAY });
  await proposesHandOver(it);
  const handOver = textOf(one(it.target, "hand-over"));
  assert.ok(handOver.includes("Nothing was handed over: alice/thesis-tool is not set up for GitHub Actions. Missing: the job workflow · AGENT_M_TOKEN"), handOver);
  assert.equal(byClass(it.target, "settings-link").length, 0);
  assert.equal(product.attempts.length + product.starts.length + product.stored.length, 0, "nothing is queued");
  setUpButtons(it)[0].dispatchEvent(personal());
  await until(() => product.starts.length > 0 || /Nothing was queued/.test(textOf(one(it.target, "hand-over"))), "the hand-over is queued after the setup");
  assert.equal(product.attempts.length, 2, textOf(one(it.target, "hand-over")));
  assert.deepEqual(product.attempts[0].files.map((file) => file.path).sort(), [".github/workflows/agent-m-jobs.yml", ".github/workflows/agent-m-main-changed.yml"]);
  assert.deepEqual(product.stored, [["AGENT_M_TOKEN", PRODUCT_TOKEN]]);
  assert.match(product.attempts[1].files[0].text, /^route: ci hosted$/m);
  assert.equal(product.starts.length, 1);
  assert.equal(product.starts[0].inputs.task, TASK);
});

// TST-2026111009 · level: component · module: MOD-prompt-bar
// guards: UC-049; GITLAB PRODUCTS ARE SUPPORTED
// given: a GitLab product without the job workflow; relay's answer hands the conversation itself on; known positive: on GitHub the same hand-over offers Set up GitHub Actions (TST-2026111008)
// input: the person's Send
// expect: the hand-over shows "Route: not available" and the link "Set up the job workflow", whose click goes to the route settings; no button Set up GitHub Actions; the secrets were not listed;
//   nothing was written
test("TST-2026111009: on GitLab a hand-over without the job workflow keeps the link to settings and asks no setup", async () => {
  const instance = repoOf(INSTANCE_WEB, INSTANCE_FILES);
  const product = repoWith(GITLAB_WEB, { "SPEC.md": "# Spec\n" }, { server: "gitlab" });
  const it = open({ product, instance, extraEndpoints: RELAY });
  await proposesHandOver(it);
  assert.match(textOf(one(it.target, "route")), /^Route: not available/);
  const links = byClass(it.target, "settings-link");
  assert.equal(links.length, 1);
  assert.equal(textOf(links[0]), "Set up the job workflow");
  links[0].dispatchEvent(personal());
  assert.deepEqual(it.went.at(-1), ["settings"]);
  assert.equal(setUpButtons(it).length, 0);
  assert.equal(product.listings(), 0);
  assert.equal(writesOf(product, instance), 0);
});

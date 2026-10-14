// MOD-settings-pages — the participants route (ITM-352, ITM-353).
// Run: node --test tests/settings-pages-participants.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-017; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT HAS ONE OF FIVE TYPES
// Guards: A PARTICIPANT DECLARES ITS CAPABILITIES; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
// Guards: A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// Guards: A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; NO SECRET IN THE REPOSITORY; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// The route is driven only through MOD-settings-pages' public view. The DOM is the browser stand-in of tests/site-frame.test.mjs,
// because the route uses MOD-site-frame's schemaForm and folded explanations. The instance host is local to this file: it
// exposes docs/participants.md and docs/sources/SRC-*.md, and records the one commit saveFile makes.

import "./site-frame.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const { view } = await import("../src/settings-pages/index.mjs");
const { openStore, readSetting, writeSetting } = await import("../src/browser-store/index.mjs");
const { readDocument } = await import("../src/documents/index.mjs");
const { participantSchema } = await import("../src/participant-list/index.mjs");

const INSTANCE = "fixture/agent-m";
const PARTICIPANTS = "docs/participants.md";
const EMPTY_PARTICIPANTS = `# Participants of this instance

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
`;

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}

function descendants(root, predicate) {
  const found = [];
  (function visit(node) {
    for (const child of node.childNodes ?? []) {
      if (child.nodeType === 1) {
        if (predicate(child)) found.push(child);
        visit(child);
      }
    }
  })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => (node.className ?? "").split(" ").includes(name));
const byTag = (root, name) => descendants(root, (node) => node.localName === name);
const one = (root, name) => { const found = byClass(root, name); assert.equal(found.length, 1, `exactly one .${name}`); return found[0]; };
const settle = () => new Promise((resolve) => setTimeout(resolve, 15));
const fire = async (node, type) => { node.dispatchEvent(new Event(type)); await settle(); };
const click = (node) => fire(node, "click");
const put = async (node, value, type = "input") => { node.value = value; await fire(node, type); };
const saveOf = (root) => byTag(root, "button").filter((button) => button.textContent === "Save").at(-1);
const rowTextOf = (root) => byTag(one(root, "participants-form-box"), "textarea")[0].value;
const folded = (root) => byTag(root, "details");
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
function withFetch(t, implementation) {
  const prior = globalThis.fetch;
  globalThis.fetch = implementation;
  t.after(() => { globalThis.fetch = prior; });
}

function route() {
  const found = view.routes.find((candidate) => candidate.name === "participants");
  assert.ok(found, "view exposes the public participants Route");
  assert.equal(found.entry, "settings");
  assert.equal(typeof found.render, "function");
  return found;
}

function blobSha(text) {
  const body = Buffer.from(text, "utf8");
  return createHash("sha1").update(Buffer.from(`blob ${body.length}\0`, "utf8")).update(body).digest("hex");
}

function sourceText({ id, title, licence, places }) {
  return ["---", `id: ${id}`, `title: ${title}`, "kind: document", "authority: normative", `licence: ${licence}`,
    ...(places ? ["places:", ...places.map((place) => `  - ${place}`)] : []), "---", `# ${id} ${title}`, "",
    "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
    "| fixture | 2026-10-13 | — | fixture | listed below |", ""].join("\n");
}

function browser(t, { files = {}, settings = {}, visibility = "private" } = {}) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore(INSTANCE);
  for (const [key, value] of Object.entries(settings)) writeSetting(store, key, value);
  const current = { [PARTICIPANTS]: EMPTY_PARTICIPANTS, ...files };
  const commits = [];
  const host = {
    repositoryInfo: async () => ({ defaultBranch: "main", visibility, canWrite: true }),
    readSnapshot: async () => ({ commit: "h".repeat(40), paths: Object.keys(current).sort(),
      read: async (path) => current[path] ?? null,
      blob: (path) => current[path] === undefined || current[path] === null ? null : blobSha(current[path]) }),
    commitFiles: async (change) => {
      commits.push(change);
      for (const file of change.files) current[file.path] = file.text;
      return { commit: `${commits.length}`.repeat(40).slice(0, 40) };
    },
    webLinks: () => ({}),
  };
  t.after(() => { document.body.replaceChildren(); });
  const context = { page: "review", instance: { repository: INSTANCE, host }, product: null, store, go() {} };
  return { store, commits, files: current, context,
    async page() { const target = document.createElement("div"); document.body.append(target); await route().render(target, context, {}); await settle(); return target; } };
}

async function addParticipant(page, type) {
  await click(one(page, "participants-add"));
  assert.equal(byClass(page, "schema-form").length, 0, "the participant type is chosen before the schema form opens");
  await put(one(page, "participant-type"), type, "change");
  return one(page, "participants-form-box");
}

async function save(page) {
  const button = saveOf(one(page, "participants-form-box"));
  assert.ok(button, "schemaForm exposes Save");
  assert.equal(button.disabled, false, "Save is available");
  await click(button);
}

function rowsOf(text) {
  return readDocument(participantSchema(), PARTICIPANTS, text).sections[0].rows.map((row) => row.cells);
}
const committedRows = (b) => rowsOf(b.commits.at(-1).files.find((file) => file.path === PARTICIPANTS).text);

// TST-352001 · level: unit · module: MOD-settings-pages
// guards: UC-017; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT HAS ONE OF FIVE TYPES; A PARTICIPANT DECLARES ITS CAPABILITIES; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: the public participants Route, an empty instance register, and browser settings with one endpoint and one Bridge
// input: each of the five participant types is selected, its type-specific fields are filled, and Save is clicked once
// expect: each type is drafted in MOD-site-frame's schemaForm, then saved as one commit of docs/participants.md with one row
//   whose type, capability preset, processing place and route match the controls; no endpoint key is committed; the page lists
//   the saved participant afterwards
test("participants — each participant type is added through the schema form and saved in one commit", async (t) => {
  const fixtures = [
    { type: "person", name: "akmaier", fields: { account: "github.com/akmaier" }, place: undefined,
      capabilities: ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools", "reach the web"],
      route: "account github.com/akmaier" },
    { type: "model endpoint", name: "campus-model", settings: { "endpoint:campus": { url: "https://models.example/v1", kind: "openai-compatible", model: "llama-campus", key: "endpoint-secret" } },
      fields: { endpoint: "campus", place: "FAU data centre (EU)" }, place: "FAU data centre (EU)", capabilities: ["draft text"], route: "endpoint campus" },
    { type: "CI agent", name: "ci-writer", fields: { model: "gpt-5", workflow: "agent-m.yml", runner: "github-hosted", secret: "MODEL_KEY", place: "GitHub hosted runner" },
      place: "GitHub hosted runner", capabilities: ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools"], route: "workflow agent-m.yml on github-hosted secret MODEL_KEY" },
    { type: "CLI agent", name: "codex-local", settings: { "bridge:laptop": { address: "http://127.0.0.1:8787", token: "bridge-token" } },
      fields: { model: "gpt-5", bridge: "laptop", agent: "codex", place: "this machine" },
      place: "this machine", capabilities: ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools"], route: "bridge laptop agent codex" },
    { type: "sandboxed agent", name: "codex-sandbox", settings: { "bridge:sandbox": { address: "http://127.0.0.1:8788", token: "bridge-token" } },
      fields: { model: "gpt-5-mini", bridge: "sandbox", agent: "codex", place: "sandbox vm" },
      place: "sandbox vm", capabilities: ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools"], route: "bridge sandbox agent codex" },
  ];

  for (const fixture of fixtures) {
    const b = browser(t, { settings: fixture.settings ?? {} });
    const page = await b.page();
    const form = await addParticipant(page, fixture.type);
    await put(one(page, "participant-name"), fixture.name);
    if (fixture.fields.account) await put(one(page, "participant-account"), fixture.fields.account);
    if (fixture.fields.endpoint) await put(one(page, "participant-endpoint"), fixture.fields.endpoint, "change");
    if (fixture.fields.model) await put(one(page, "participant-model"), fixture.fields.model);
    if (fixture.fields.workflow) await put(one(page, "participant-workflow"), fixture.fields.workflow);
    if (fixture.fields.runner) await put(one(page, "participant-runner"), fixture.fields.runner, "change");
    if (fixture.fields.secret) await put(one(page, "participant-secret-name"), fixture.fields.secret);
    if (fixture.fields.bridge) await put(one(page, "participant-bridge"), fixture.fields.bridge, "change");
    if (fixture.fields.agent) await put(one(page, "participant-agent"), fixture.fields.agent);
    if (fixture.fields.place) await put(one(page, "participant-place"), fixture.fields.place);
    assert.ok(byClass(form, "schema-form").length === 1 || byClass(page, "schema-form").length === 1, "the route uses schemaForm");
    assert.match(rowTextOf(page), new RegExp(`\\| ${fixture.name} \\| ${fixture.type.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\|`));
    await save(page);
    assert.equal(b.commits.length, 1, `${fixture.type}: one commit`);
    assert.deepEqual(b.commits[0].files.map((file) => file.path), [PARTICIPANTS], `${fixture.type}: only the participant register`);
    const row = committedRows(b).at(-1);
    assert.equal(row.Name, fixture.name);
    assert.equal(row.Type, fixture.type);
    assert.deepEqual(row.Capabilities, fixture.capabilities);
    if (fixture.place) assert.equal(row["Processing place"], fixture.place);
    assert.equal(row.Route, fixture.route);
    assert.doesNotMatch(b.commits[0].files[0].text, /endpoint-secret|bridge-token/);
    assert.match(one(page, "participants-list").textContent, new RegExp(`${fixture.name}.*${fixture.type}`, "s"));
  }
});

// TST-352002 · level: unit · module: MOD-settings-pages
// guards: A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL
// given: a Bridge named laptop and the CLI-agent participant route
// input: the author chooses that Bridge and agent but leaves Model empty
// expect: the route preview names the chosen Bridge, but schemaForm keeps Save disabled because Model is required
test("participants — a CLI agent names its Bridge route, and without a model cannot be saved", async (t) => {
  const b = browser(t, { settings: { "bridge:laptop": { address: "http://127.0.0.1:8787", token: "bridge-token" } } });
  const page = await b.page();
  await addParticipant(page, "CLI agent");
  await put(one(page, "participant-name"), "codex-local");
  await put(one(page, "participant-bridge"), "laptop", "change");
  await put(one(page, "participant-agent"), "codex");
  await put(one(page, "participant-place"), "this machine");
  assert.match(one(page, "participant-route-preview").textContent, /bridge laptop agent codex/);
  assert.match(rowTextOf(page), /bridge laptop agent codex/);
  const button = saveOf(one(page, "participants-form-box"));
  assert.equal(button.disabled, true);
  assert.match(one(page, "participants-form-box").textContent, /Model/);
  assert.deepEqual(b.commits, []);
});

// TST-352003 · level: unit · module: MOD-settings-pages
// guards: UC-003; NO SECRET IN THE REPOSITORY
// given: no model endpoint is configured in this browser
// input: the author chooses model endpoint, fills the UC-003 endpoint fields in place, and saves the participant
// expect: the UC-003 fields are visible in the participants route, the endpoint is kept in the browser, and the committed
//   participant row names the endpoint without committing its key
test("participants — with no configured endpoint, UC-003 endpoint fields open in place and no key is committed", async (t) => {
  const b = browser(t);
  const page = await b.page();
  await addParticipant(page, "model endpoint");
  assert.ok(one(page, "participant-endpoint-inline"));
  await put(one(page, "participant-name"), "inline-model");
  await put(one(page, "participant-endpoint-name"), "inline");
  await put(one(page, "participant-endpoint-url"), "https://models.example/v1");
  await put(one(page, "participant-endpoint-model"), "llama-inline");
  await put(one(page, "participant-endpoint-key"), "super-secret");
  await put(one(page, "participant-place"), "EU provider");
  await save(page);
  assert.equal(readSetting(b.store, "endpoint:inline").key, "super-secret");
  assert.equal(committedRows(b).at(-1).Route, "endpoint inline");
  assert.equal(committedRows(b).at(-1).Model, "llama-inline");
  assert.doesNotMatch(b.commits[0].files[0].text, /super-secret/);
});

// TST-352004 · level: unit · module: MOD-settings-pages
// guards: RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; EVERY STEP EXPLAINS ITSELF
// given: the instance register has a restricted source allowed only at FAU data centre (EU)
// input: the author chooses a self-hosted CI agent whose processing place is US cloud
// expect: the self-hosted runner explanation is shown folded, and before Save the source that does not allow that place is named
test("participants — self-hosted runners are explained, and source place restrictions are named before save", async (t) => {
  const b = browser(t, { visibility: "public", files: {
    "docs/sources/SRC-secret.md": sourceText({ id: "SRC-secret", title: "Secret Source", licence: "restricted — contract",
      places: ["FAU data centre (EU)"] }),
  } });
  const page = await b.page();
  await addParticipant(page, "CI agent");
  await put(one(page, "participant-name"), "ci-private");
  await put(one(page, "participant-model"), "gpt-5");
  await put(one(page, "participant-workflow"), "agent-m.yml");
  await put(one(page, "participant-runner"), "self-hosted", "change");
  await put(one(page, "participant-secret-name"), "MODEL_KEY");
  await put(one(page, "participant-place"), "US cloud");
  assert.match(one(page, "participant-runner-explanation").textContent, /self-hosted runner serves private repositories only/i);
  assert.match(one(page, "participant-runner-explanation").textContent, /public/i);
  assert.match(one(page, "participants-form-box").textContent, /SRC-secret/);
  assert.match(one(page, "participants-form-box").textContent, /US cloud/);
  const explanations = folded(page);
  assert.ok(explanations.length >= 4, "the route folds its explanations");
  assert.ok(explanations.every((details) => !details.hasAttribute("open")));
  assert.ok(explanations.every((details) => byTag(details, "summary")[0]?.textContent === "What is this?"));
});

// TST-353001 · level: unit · module: MOD-settings-pages
// guards: UC-017; THE BRIDGE FINDS THE INSTALLED AGENTS; A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL
// given: this browser keeps one direct Bridge and one Bridge reached through the jump host, and each Bridge reports its offered agents
// input: the author chooses each Bridge on a CLI participant and asks for its agents, then clicks a ready offered agent
// expect: the route calls testBridge for the chosen Bridge only; ready agents are offered as one-click additions; the clicked
//   agent fills Agent, Model, Route and the Bridge computer as Processing place; missing or not-ready agents are not added
test("participants — offered Bridge agents are listed, and a ready one is added in one click", async (t) => {
  const calls = [];
  withFetch(t, async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url) === "http://127.0.0.1:4711/v1/pair") return json({ bridge: { name: "laptop", version: "1", platform: "darwin" } });
    if (String(url) === "http://127.0.0.1:4711/v1/agents") return json({ agents: [
      { name: "codex", version: "1.2.3", ready: true, loggedIn: true },
      { name: "claude", version: "2.0.0", ready: false, loggedIn: false },
    ], missing: [{ name: "opencode" }] });
    if (String(url) === "https://jump.example.test/bridge/gpu/v1/pair") return json({ bridge: { name: "gpu", version: "1", platform: "linux" } });
    if (String(url) === "https://jump.example.test/bridge/gpu/v1/agents") return json({ agents: [
      { name: "opencode", version: "0.9.0", ready: true, loggedIn: true },
    ], missing: [] });
    throw new Error(`unexpected request ${url}`);
  });
  const b = browser(t, { settings: {
    "bridge:laptop": { address: "http://127.0.0.1:4711", token: "laptop-token" },
    "jump-host": { hostname: "jump.example.test", user: "bridge-user", sshPort: 2222, portRange: [40100, 40103],
      httpsAddress: "https://jump.example.test", login: { user: "alice", password: "proxy-password" } },
    "bridge:gpu": { port: 40100, token: "gpu-token" },
  } });
  const page = await b.page();
  await addParticipant(page, "CLI agent");
  await put(one(page, "participant-name"), "codex-local");
  await put(one(page, "participant-bridge"), "laptop", "change");
  await click(one(page, "participant-list-agents"));
  assert.deepEqual(calls.map((call) => [call.url, call.init.method, call.init.headers["x-agent-m-bridge-token"]]), [
    ["http://127.0.0.1:4711/v1/pair", "GET", "laptop-token"],
    ["http://127.0.0.1:4711/v1/agents", "GET", "laptop-token"],
  ]);
  assert.deepEqual(byClass(page, "participant-agent-offer").map((button) => button.textContent), ["Add codex"]);
  assert.match(one(page, "participant-agent-list-result").textContent, /claude.*not ready|opencode.*missing/s);
  await click(one(page, "participant-agent-offer"));
  assert.equal(one(page, "participant-agent").value, "codex");
  assert.equal(one(page, "participant-model").value, "codex");
  assert.equal(one(page, "participant-place").value, "laptop Bridge's computer");
  assert.match(rowTextOf(page), /bridge laptop agent codex/);

  await put(one(page, "participant-bridge"), "gpu", "change");
  await click(one(page, "participant-list-agents"));
  assert.deepEqual(calls.slice(2).map((call) => [call.url, call.init.method, call.init.headers["x-agent-m-bridge-token"], call.init.headers.Authorization]), [
    ["https://jump.example.test/bridge/gpu/v1/pair", "GET", "gpu-token", `Basic ${Buffer.from("alice:proxy-password").toString("base64")}`],
    ["https://jump.example.test/bridge/gpu/v1/agents", "GET", "gpu-token", `Basic ${Buffer.from("alice:proxy-password").toString("base64")}`],
  ]);
  assert.deepEqual(byClass(page, "participant-agent-offer").map((button) => button.textContent), ["Add opencode"]);
  await click(one(page, "participant-agent-offer"));
  assert.equal(one(page, "participant-agent").value, "opencode");
  assert.equal(one(page, "participant-place").value, "gpu Bridge's computer");
});

// TST-353002 · level: unit · module: MOD-settings-pages
// guards: UC-017; ONE CLICK PER DECISION; THE BRIDGE FINDS THE INSTALLED AGENTS; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a CLI participant row naming a stored Bridge and agent
// input: Test succeeds once; then, on another page, Test cannot reach the Bridge and the author chooses Save untested
// expect: probe is called with kind agent and the selected agent; the successful answer is shown; the failure reason is shown,
//   Save is withheld while the failed test stands, and Save becomes available only after Save untested is clicked
test("participants — Test probes the selected agent, and a failed Bridge test withholds Save until save untested", async (t) => {
  const calls = [];
  withFetch(t, async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (calls.length === 1) return json({ answer: { answered: true, version: "1.2.3" } });
    throw new TypeError("blocked by browser");
  });
  const settings = { "bridge:laptop": { address: "http://127.0.0.1:4711", token: "laptop-token" } };
  const ok = browser(t, { settings });
  let page = await ok.page();
  await addParticipant(page, "CLI agent");
  await put(one(page, "participant-name"), "codex-local");
  await put(one(page, "participant-model"), "codex");
  await put(one(page, "participant-bridge"), "laptop", "change");
  await put(one(page, "participant-agent"), "codex");
  await put(one(page, "participant-place"), "this machine");
  await click(one(page, "participant-agent-test"));
  assert.equal(calls[0].url, "http://127.0.0.1:4711/v1/probes/agent");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].init.body), { args: { agent: "codex" } });
  assert.match(one(page, "participant-agent-test-result").textContent, /answered|1\.2\.3/);
  await save(page);
  assert.equal(ok.commits.length, 1);

  const failed = browser(t, { settings });
  page = await failed.page();
  await addParticipant(page, "CLI agent");
  await put(one(page, "participant-name"), "codex-local");
  await put(one(page, "participant-model"), "codex");
  await put(one(page, "participant-bridge"), "laptop", "change");
  await put(one(page, "participant-agent"), "codex");
  await put(one(page, "participant-place"), "this machine");
  await click(one(page, "participant-agent-test"));
  assert.match(one(page, "participant-agent-test-result").textContent, /blocked by browser|gave no answer/i);
  assert.equal(saveOf(one(page, "participants-form-box")).disabled, true);
  await click(one(page, "participant-save-untested"));
  assert.equal(saveOf(one(page, "participants-form-box")).disabled, false);
  await save(page);
  assert.equal(failed.commits.length, 1);
});

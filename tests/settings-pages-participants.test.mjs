// MOD-settings-pages — the participants route (UC-017): the instance's docs/participants.md as a member list; + Add participant and Change take a
// name, person or agent, and for an agent its model, selected from the models this browser's connections offer (MOD-prompt-bar's endpointsOffered
// and sessionsOffered), each named with the connections that offer it and their processing places; the model a row names already kept selectable and
// marked where no connection here offers it; with no connection here, links to the endpoints and Bridges; a change to a participant that products use,
// with those products and roles named.
// Run: node --test tests/settings-pages-participants.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-017; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT IS A PERSON OR AN AGENT; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL
// Guards: A CONNECTION NAMES THE MODELS IT OFFERS; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; NO SECRET IN THE REPOSITORY; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// The route is driven only through MOD-settings-pages' public view. The DOM is the browser stand-in of tests/site-frame-dom.mjs, because the route uses
// MOD-site-frame's folded explanations. The instance host is local to this file: it exposes docs/participants.md and records the one commit saveFile makes.
// This browser's connections are model endpoints in its store; it keeps no Bridge, so no request leaves this process.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const { view } = await import("../src/settings-pages/index.mjs");
const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");

const INSTANCE = "fixture/agent-m";
const PARTICIPANTS = "docs/participants.md";
const VERSION = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678";
const MODEL_PATH = "docs/process-models/team-scrum.md";
const PRODUCT_ALPHA = "https://github.com/acme/product-alpha";
const PRODUCT_BETA = "https://github.com/acme/product-beta";
const EMPTY_PARTICIPANTS = `# Participants of this instance

| Name | Type | Model |
|---|---|---|
`;
const USED_PARTICIPANTS = `# Participants of this instance

| Name | Type | Model |
|---|---|---|
| alice | person | — |
| dev-a | agent | claude-opus-5-5 |
| dev-b | agent | retired-model |
`;
// Two model endpoints of this browser that offer claude-opus-5-5, one at a provider and one through NHR, and one of another model.
const HUB = { kind: "anthropic", url: "https://api.example/v1", model: "claude-opus-5-5", key: "sk-fixture", place: "Anthropic, USA", context: 200000 };
const CONNECTIONS = { "endpoint:hub": HUB, "endpoint:nhr": { ...HUB, url: "https://nhr.example/v1", place: "NHR@FAU, Erlangen" },
  "endpoint:small": { ...HUB, model: "small-model", context: 32000 } };


const INSTANCE_SPEC = "# Fixture instance\n\n## Process\n\nNo process requirement.\n";
const MODEL_TEXT = [
  "---",
  "name: team-scrum",
  "kind: pulled",
  "adapted_from: scrum",
  "measure: remaining items per time box",
  "---",
  "# Scrum with a person as Product Owner",
  "",
  "## Phases",
  "",
  "| Name | Role | Produces |",
  "|---|---|---|",
  "| Sprint Planning | Product Owner | ITM |",
  "| Development | Developers | MOD, TST |",
  "| Sprint Review | Product Owner | sprint record |",
  "| Sprint Retrospective | Scrum Master | sprint record |",
  "",
  "## Transitions",
  "",
  "| From | To | Kind |",
  "|---|---|---|",
  "| Sprint Planning | Development | sequence |",
  "| Development | Sprint Review | sequence |",
  "| Sprint Review | Sprint Retrospective | sequence |",
  "| Sprint Retrospective | Sprint Planning | back |",
  "",
  "## Verification pairs",
  "",
  "| Phase | Checked by |",
  "|---|---|",
  "| Development | Sprint Review |",
  "",
  "## Roles",
  "",
  "| Name | Filled by | How many | Capabilities |",
  "|---|---|---|---|",
  "| Product Owner | person | one | read the repository, write to the repository |",
  "| Scrum Master | either | one | read the repository |",
  "| Developers | agent | several | read the repository, write to the repository, run code and tests |",
  "",
  "## Flow control",
  "",
  "| Kind | Value |",
  "|---|---|",
  "| WIP limit | — |",
  "| Time box | 1 week |",
  "| Sprints | yes |",
  "",
].join("\n");

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
// A person's click: a browser marks it trusted (`isTrusted`); node marks every Event untrusted, as a script's.
const click = async (node) => { node.dispatchEvent(Object.defineProperty(new Event("click"), "isTrusted", { value: true })); await settle(); };
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

function processText() {
  return [
    "---",
    "model: team-scrum",
    `model_file: ${MODEL_PATH}`,
    `model_version: ${VERSION}`,
    "---",
    "# How the fixture product is developed",
    "",
    "## Practices",
    "",
    "- none",
    "",
    "## Branches",
    "",
    "| Phase or time box | Branch |",
    "|---|---|",
    "",
    "## Definition of Done",
    "",
    "The job rules hold for every pull request; no condition is added.",
    "",
  ].join("\n");
}

function assignmentText(title, rows) {
  return [`# ${title}`, "", "## Roles", "", "| Role | Participants |", "|---|---|",
    ...rows.map(([role, names]) => `| ${role} | ${names.join(", ")} |`), ""].join("\n");
}

function productFiles(assignments) {
  return {
    "docs/process.md": processText(),
    ...Object.fromEntries(Object.entries(assignments).map(([name, rows]) =>
      [`docs/role-assignments/${name}.md`, assignmentText(name, rows)])),
  };
}

function productHost(files, commits) {
  const current = { ...files };
  return {
    repositoryInfo: async () => ({ defaultBranch: "main", visibility: "private", canWrite: true }),
    readSnapshot: async () => ({ commit: "p".repeat(40), paths: Object.keys(current).sort(),
      read: async (path) => current[path] ?? null,
      blob: (path) => current[path] === undefined || current[path] === null ? null : blobSha(current[path]) }),
    commitFiles: async (change) => {
      commits.push(change);
      for (const file of change.files) current[file.path] = file.text;
      return { commit: `${commits.length}`.repeat(40).slice(0, 40) };
    },
    webLinks: () => ({}),
  };
}

function fixtureProductHosts() {
  return {
    [PRODUCT_ALPHA]: productFiles({ "team-one": [
      ["Product Owner", ["alice"]],
      ["Scrum Master", ["alice"]],
      ["Developers", ["dev-a"]],
    ] }),
    [PRODUCT_BETA]: productFiles({ "team-web": [
      ["Product Owner", ["alice"]],
      ["Scrum Master", ["dev-a"]],
      ["Developers", ["alice"]],
    ] }),
  };
}

function instanceProcessFiles() {
  return { "SPEC.md": INSTANCE_SPEC, [MODEL_PATH]: MODEL_TEXT };
}

function browser(t, { files = {}, settings = {}, visibility = "private", products = {} } = {}) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore(INSTANCE);
  for (const [key, value] of Object.entries(settings)) writeSetting(store, key, value);
  const current = { [PARTICIPANTS]: EMPTY_PARTICIPANTS, ...files };
  const commits = [];
  const productCommits = {};
  const productHosts = Object.fromEntries(Object.entries(products).map(([web, productFiles]) => {
    productCommits[web] = [];
    return [web, productHost(productFiles, productCommits[web])];
  }));
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
  const context = { page: "review", instance: { repository: INSTANCE, host }, product: null, store, productHosts, go() {} };
  return { store, commits, files: current, context, productCommits,
    async page(params = {}) { const target = document.createElement("div"); document.body.append(target); await route().render(target, context, params); await settle(); return target; } };
}

const save = (page) => one(page, "participant-save");
const optionsOf = (select) => byTag(select, "option").map((option) => [option.value, option.textContent]);

// TST-20261109161 · level: unit · module: MOD-settings-pages
// guards: UC-017; A PARTICIPANT IS A PERSON OR AN AGENT; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; NO SECRET IN THE REPOSITORY; EVERY STEP EXPLAINS ITSELF
// given: an instance whose register holds no participant yet; this browser's endpoints hub, nhr and small
// input: + Add participant; the type person; the name alice; Save — one click
// expect: the form offers the types person and agent, with a folded What is this? beside them; a person names no model (no model field); Save commits docs/participants.md with the row `| alice | person | — |`, in one commit, holding no key of this browser; the page says Saved. and lists alice
test("participants — a person is added by name, committed directly with no model and no key", async (t) => {
  const it = browser(t, { settings: CONNECTIONS });
  const page = await it.page();
  await click(one(page, "participants-add"));
  assert.deepEqual(optionsOf(one(page, "participant-type")).map(([value]) => value), ["", "person", "agent"]);
  assert.ok(folded(one(page, "participants-add-panel")).length >= 1, "a folded explanation beside the type");
  await put(one(page, "participant-type"), "person", "change");
  assert.equal(byClass(page, "participant-model").length, 0, "a person names no model");
  await put(one(page, "participant-name"), "alice");
  await click(save(page));
  assert.equal(it.commits.length, 1);
  const written = it.commits[0].files.find((file) => file.path === PARTICIPANTS).text;
  assert.match(written, /\n\| alice \| person \| — \|\n/);
  assert.equal(written.includes("sk-fixture"), false, "no key enters the register");
  assert.match(one(page, "participants-result").textContent, /Saved\./);
  assert.match(one(page, "participants-list").textContent, /alice — person/);
});

// TST-20261109162 · level: unit · module: MOD-settings-pages
// guards: UC-017; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; A CONNECTION NAMES THE MODELS IT OFFERS; ONE CLICK PER DECISION
// given: the empty register; this browser's endpoints hub (claude-opus-5-5, Anthropic, USA), nhr (claude-opus-5-5, NHR@FAU, Erlangen) and small (small-model)
// input: + Add participant; the type agent; the name dev-x; known negative first: Save before a model is chosen; then the model claude-opus-5-5 chosen; Save
// expect: the model select offers claude-opus-5-5 named with both connections that offer it and their places — "claude-opus-5-5 — hub (Anthropic, USA), nhr (NHR@FAU, Erlangen)" — and small-model with small; without a model Save is disabled and nothing is committed; with it, one commit adds `| dev-x | agent | claude-opus-5-5 |`, and nothing of a connection
test("participants — an agent's model is chosen among the models this browser's connections offer, each with its connections and places", async (t) => {
  const it = browser(t, { settings: CONNECTIONS });
  const page = await it.page();
  await click(one(page, "participants-add"));
  await put(one(page, "participant-type"), "agent", "change");
  await put(one(page, "participant-name"), "dev-x");
  assert.deepEqual(optionsOf(one(page, "participant-model")), [["", "Choose a model"],
    ["claude-opus-5-5", "claude-opus-5-5 — hub (Anthropic, USA), nhr (NHR@FAU, Erlangen)"], ["small-model", "small-model — small (Anthropic, USA)"]]);
  assert.equal(save(page).disabled, true, "known negative: an agent without its model is not saved");
  await click(save(page));
  assert.equal(it.commits.length, 0);
  await put(one(page, "participant-model"), "claude-opus-5-5", "change");
  assert.equal(save(page).disabled, false);
  await click(save(page));
  assert.equal(it.commits.length, 1);
  const written = it.commits[0].files.find((file) => file.path === PARTICIPANTS).text;
  assert.match(written, /\n\| dev-x \| agent \| claude-opus-5-5 \|\n/);
  for (const piece of ["hub", "nhr", "Anthropic", "sk-fixture"]) assert.equal(written.includes(piece), false, `nothing of a connection: ${piece}`);
});

// TST-20261109163 · level: unit · module: MOD-settings-pages
// guards: UC-017
// given: the empty register and a browser that keeps no endpoint and no Bridge
// input: + Add participant; the type agent
// expect: the page says that no connection of this browser offers a model, with the buttons Endpoints and Bridges, which open the routes endpoints and bridge (UC-017 3a); the model select offers no model
test("participants — with no connection here, an agent's form links to the endpoints and the Bridges", async (t) => {
  const it = browser(t);
  const went = [];
  it.context.go = (name) => went.push(name);
  const page = await it.page();
  await click(one(page, "participants-add"));
  await put(one(page, "participant-type"), "agent", "change");
  assert.match(one(page, "participant-no-connection").textContent, /No connection of this browser offers a model/);
  await click(one(page, "participant-go-endpoints"));
  await click(one(page, "participant-go-bridge"));
  assert.deepEqual(went, ["endpoints", "bridge"]);
  assert.deepEqual(optionsOf(one(page, "participant-model")), [["", "Choose a model"]]);
});

// TST-20261109164 · level: unit · module: MOD-settings-pages
// guards: UC-017; A CONNECTION NAMES THE MODELS IT OFFERS
// given: the register of alice, dev-a (claude-opus-5-5) and dev-b (retired-model, which no endpoint of this browser offers); the endpoints hub, nhr and small
// input: the list; Change dev-b
// expect: the list names dev-a with its model and the connections that offer it, and dev-b with its model and that no connection of this browser offers it; dev-b's form keeps retired-model selected, marked as offered by no connection here
test("participants — the list names each agent's model and its connections, and a model no connection offers stays selectable, marked", async (t) => {
  const it = browser(t, { settings: CONNECTIONS, files: { [PARTICIPANTS]: USED_PARTICIPANTS } });
  const page = await it.page();
  const list = one(page, "participants-list").textContent;
  assert.match(list, /dev-a — agent; model: claude-opus-5-5; on hub \(Anthropic, USA\), nhr \(NHR@FAU, Erlangen\)/);
  assert.match(list, /dev-b — agent; model: retired-model; no connection of this browser offers it/);
  await click(byTag(page, "button").find((button) => button.textContent === "Change dev-b"));
  const model = one(page, "participant-model");
  assert.equal(model.value, "retired-model");
  assert.deepEqual(optionsOf(model).at(-1), ["retired-model", "retired-model — no connection of this browser offers it"]);
});

// TST-20261109165 · level: unit · module: MOD-settings-pages
// guards: UC-017
// given: the register of alice, dev-a and dev-b; the products alpha, whose team-one gives alice the Product Owner and the Scrum Master and dev-a the Developers, and beta, whose team-web gives alice the Product Owner and the Developers and dev-a the Scrum Master; this browser manages both
// input: Change alice; the type agent with the model claude-opus-5-5
// expect: the form names the products and roles that hold alice — alpha team-one Product Owner and Scrum Master, beta team-web Product Owner and Developers —, and names as invalid an assignment the change makes so: the role Product Owner needs a person, and no person holds it
test("participants — a change to a participant that products use names those products and roles, and what the change makes invalid", async (t) => {
  const it = browser(t, { settings: { ...CONNECTIONS, products: [PRODUCT_ALPHA, PRODUCT_BETA] }, files: { [PARTICIPANTS]: USED_PARTICIPANTS, ...instanceProcessFiles() },
    products: fixtureProductHosts() });
  it.context.productHosts = Object.fromEntries(Object.entries(fixtureProductHosts()).map(([web, files]) => [web, productHost(files, [])]));
  const page = await it.page();
  await click(byTag(page, "button").find((button) => button.textContent === "Change alice"));
  await settle();
  const uses = one(page, "participant-product-use-box").textContent;
  for (const piece of [PRODUCT_ALPHA, "team-one: Product Owner", "team-one: Scrum Master", PRODUCT_BETA, "team-web: Product Owner", "team-web: Developers"]) {
    assert.ok(uses.includes(piece), `names ${piece}: ${uses}`);
  }
  await put(one(page, "participant-type"), "agent", "change");
  await put(one(page, "participant-model"), "claude-opus-5-5", "change");
  await settle();
  assert.match(one(page, "participant-product-use-box").textContent, /the role Product Owner needs a person, and no person holds it/);
});

// TST-20261109166 · level: unit · module: MOD-settings-pages
// guards: UC-017; UC-040
// given: the empty register and the endpoints hub, nhr and small
// input: the route opened with the parameters type agent and model small-model, as a resource's Add as participant opens it
// expect: the form of a new participant is open, of the type agent, with small-model selected
test("participants — opened with the parameters type and model, the form of a new agent has that model selected", async (t) => {
  const it = browser(t, { settings: CONNECTIONS });
  const page = await it.page({ type: "agent", model: "small-model" });
  assert.equal(one(page, "participants-add-panel").hidden, false);
  assert.equal(one(page, "participant-type").value, "agent");
  assert.equal(one(page, "participant-model").value, "small-model");
});

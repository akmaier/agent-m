// MOD-implementation-pages' route `models` — the instance's process models are listed (ITM-778), as UC-031 step 1 and 2b and
// docs/architecture/MOD-implementation-pages.md (Interfaces: `models`, `models/<name>`) state them: "the instance's process models: the catalogue, *Adapt* and
// *+ New model*"; UC-031: "Agent M lists the shipped catalogue (waterfall, V-model, reuse-oriented, Scrum, Kanban) and the instance's own definitions. For each model it shows
// the kind of work and the products that use it", "Shipped models cannot be edited in an instance. Agent M offers **Adapt** instead and explains that the shipped catalogue
// follows the book", and "Every part carries a folded **What is this?**". The item settles which products: each address of `readSetting(store, "products")` is connected with
// MOD-site-frame's `chosenProduct` and its declaration `docs/process.md` read with that product's host; an address that cannot be connected is shown with its reason.
// Run: node --test tests/implementation-pages-models.test.mjs
//
// Module: MOD-implementation-pages
// Guards: THE CATALOGUE IS DATA; EVERY STEP EXPLAINS ITSELF; UC-031
// Level: unit
//
// This imports the shared small DOM of tests/site-frame-dom.mjs unchanged, as the other tests of the views do. The real MOD-model-catalogue, MOD-product-process,
// MOD-browser-store, MOD-repository-hosts and MOD-site-frame run as they are; the only thing that is faked is the global `fetch`, a spy that answers the fixtures' GitHub
// repositories and refuses any other address with a TypeError (the request is then kept as `unrouted`). No request leaves the fixtures.
//
// Readings the module file leaves open, which the pull request names:
//   - The page is an <article class="models-page">. Its parts are <section class="shipped-models"> and <section class="own-models">; each model is an <li class="model"> with
//     data-model="<name>" inside one of them, holding a <span class="kind"> with the kind of work as the catalogue names it ("planned" or "pulled"), a <ul class="products"> with one
//     <li> for each address of this browser's products that declares it (none when no product does), a <ul class="findings"> with one <li> for each finding of the catalogue, "<kind>: <what>"
//     (present only when the model has one), and <a> elements for its buttons.
//   - *Adapt*, *Edit* and *+ New model* are links (<a>) with that text. Adapt and Edit lead to "#models/name=<name>" (the name percent-encoded; the frame reads only key=value parts after the route's name); *+ New model*
//     leads to "#models/name=" and is the one link with the class new-model, in the section of the instance's own models.
//   - A product that cannot be connected or read is an <li class="source"> of a <ul class="unreadable">, "<address>: <the reason its host gives>".
//   - A product declares a model when its docs/process.md names the model's file in model_file, as the route `process` reads the declaration.
//   - The folded What is this? is the <details class="explain"> that explain(topic) returns.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";
import { routeOf } from "../src/site-frame/routing.mjs";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const { view } = await import("../src/implementation-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "models");

// ---------------------------------------------------------------- the fixtures: an instance with two models of its own, and four products

const OWN = readFileSync(new URL("../docs/process-models/scrum-wip.md", import.meta.url), "utf8");
// A model of the instance that breaks a rule: its last transition leads to a phase the model does not define.
const BROKEN = OWN.replace("name: scrum-wip", "name: broken-wip").replace("| Retrospective | Sprint planning | sequence |", "| Retrospective | Nowhere | sequence |");
assert.notEqual(BROKEN, OWN, "known positive: the fault was planted in the copy");

const declaring = (name, file) => `---\nmodel: ${name}\nmodel_file: ${file}\nmodel_version: ${"a".repeat(40)}\n---\n\n# How this product is developed\n`;

const INSTANCE = "https://github.com/acme/agent-m", LIBRARY = "https://github.com/acme/library", ATLAS = "https://github.com/acme/atlas",
  BARE = "https://github.com/acme/bare", MISSING = "https://github.com/acme/missing";
const TOKENS = { "acme/agent-m": "github_pat_INSTANCEfixture0123456789", "acme/library": "github_pat_LIBRARYfixture0123456789",
  "acme/atlas": "github_pat_ATLASfixture0123456789", "acme/bare": "github_pat_BAREfixture0123456789" };
const REPOSITORIES = {
  "acme/agent-m": { "docs/process-models/scrum-wip.md": OWN, "docs/process-models/broken-wip.md": BROKEN, "README.md": "# Agent M\n" },
  "acme/library": { "docs/process.md": declaring("scrum", "src/model-catalogue/models/scrum.md") },
  "acme/atlas": { "docs/process.md": declaring("scrum-wip", "docs/process-models/scrum-wip.md") },
  "acme/bare": { "README.md": "# A product that declares no model yet\n" },
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
const spy = { unrouted: [] };
const text = (body) => new Response(body, { status: 200, headers: { "content-type": "text/plain" } });
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
function headerOf(init, name) {
  const given = init?.headers ?? {};
  const found = Object.entries(given instanceof Headers ? Object.fromEntries(given.entries()) : given).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return found ? String(found[1]) : null;
}
// GitHub's API as the host reads it: the repository, its default branch's commit, the commit's tree, and a file; every repository is private, so a request without its own token
// is answered 404.
function github(url, authorization, body) {
  if (url.host === "api.github.com" && url.pathname === "/graphql") return graphql(authorization, JSON.parse(body));
  const api = /^\/repos\/([^/]+\/[^/]+)(\/.*)?$/.exec(decodeURIComponent(url.pathname));
  if (url.host !== "api.github.com" || !api) return null;
  const [, name, rest = ""] = api;
  const files = REPOSITORIES[name];
  if (!files || authorization !== `Bearer ${TOKENS[name]}`) return json(404, { message: "Not Found" });
  if (rest === "") return json(200, { default_branch: "main", visibility: "private", private: true });
  if (rest === "/commits/main") return json(200, { sha: sha(`${name}@main`) });
  if (rest.startsWith("/git/trees/")) return json(200, { tree: Object.entries(files).map(([file, body]) => ({ type: "blob", path: file, sha: sha(body) })) });
  const file = /^\/contents\/(.+)$/.exec(rest);
  if (file && files[file[1]] !== undefined) return text(files[file[1]]);
  return json(404, { message: "Not Found" });
}
// The batch reads of MOD-repository-hosts: one aliased field `f<i>:object(expression:"<commit>:<path>")` for each path, answered with the text of the file in the repository the variables name;
// and, for readSnapshot with `folders` (ITM-1266), `e<i>:object(expression:"<commit>:<path>")`, answered with the oid of the file, or null where the repository holds none.
function graphql(authorization, { query, variables }) {
  const name = `${variables.owner}/${variables.name}`;
  if (!REPOSITORIES[name] || authorization !== `Bearer ${TOKENS[name]}`) return json(200, { data: { repository: null } });
  const repository = {};
  for (const [, alias, expression] of query.matchAll(/([fe]\d+):object\(expression:("[^"]*")\)/g)) {
    const body = REPOSITORIES[name][JSON.parse(expression).split(":").slice(1).join(":")];
    repository[alias] = body === undefined ? null : alias.startsWith("f") ? { text: body, isTruncated: false } : { oid: sha(body) };
  }
  return json(200, { data: { repository } });
}
function install() {
  spy.unrouted = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const served = github(url, headerOf(init, "authorization"), init?.body);
    if (served) return served;
    spy.unrouted.push(url.href);
    throw new TypeError(`no request leaves the fixtures: ${url.href}`);
  };
}
test.afterEach(() => { globalThis.fetch = realFetch; });

// ---------------------------------------------------------------- the page

// The browser: the store of acme/agent-m, with the instance's token and a token for each product but the missing one, and the products it manages.
function browser({ products = [LIBRARY, ATLAS, BARE, MISSING] } = {}) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: new Storage() });
  const store = openStore("acme/agent-m");
  writeSetting(store, "products", products);
  writeSetting(store, "github-token", { value: TOKENS["acme/agent-m"], name: "instance token", expires: "2027-01-01" });
  for (const name of ["library", "atlas", "bare"]) writeSetting(store, `github-token:acme/${name}`, { value: TOKENS[`acme/${name}`], name: `${name} token`, expires: "2027-01-01" });
  return { page: "review", instance: { repository: "acme/agent-m", host: connect(parseAddress(INSTANCE), { token: TOKENS["acme/agent-m"] }) }, product: null, store, go() {} };
}
async function draw(context = browser()) {
  install();
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, context, {});
  assert.deepEqual(spy.unrouted, []);
  return target;
}

const find = (root, match) => {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root);
  return found;
};
const byClass = (root, name) => find(root, (node) => node.className.split(/\s+/).includes(name));
const modelsIn = (section) => byClass(section, "model");
const modelOf = (target, name) => find(target, (node) => node.getAttribute("data-model") === name)[0];
const linesOf = (list) => find(list, (node) => node.localName === "li").map((item) => item.textContent);
const productsOf = (model) => linesOf(byClass(model, "products")[0]);
const linksOf = (root) => find(root, (node) => node.localName === "a");

const SHIPPED = ["waterfall", "v-model", "reuse-oriented", "scrum", "kanban"];
const NO_TOKEN = "was not found — a private repository is found only with a token that reaches it.";

// TST-778001 · level: unit · module: MOD-implementation-pages
// guards: THE CATALOGUE IS DATA; UC-031
// given: the instance acme/agent-m, which holds the models scrum-wip (pulled) and broken-wip (pulled) under docs/process-models/, and the catalogue's five shipped models
// input: the route `models` drawn
// expect: the section of the shipped models holds waterfall (planned), v-model (planned), reuse-oriented (planned), scrum (pulled) and kanban (pulled), in the catalogue's order; the section of the
//   instance's own models holds broken-wip (pulled) and scrum-wip (pulled), in the order of their paths; each model's kind is the text of its kind element
test("TST-778001 the shipped catalogue and the instance's own models are listed, each with its kind of work", async () => {
  const target = await draw();
  const kindOf = (model) => [model.getAttribute("data-model"), byClass(model, "kind")[0].textContent];
  assert.equal(byClass(target, "shipped-models").length, 1, "known positive: the section of the shipped models is found");
  assert.deepEqual(modelsIn(byClass(target, "shipped-models")[0]).map(kindOf),
    [["waterfall", "planned"], ["v-model", "planned"], ["reuse-oriented", "planned"], ["scrum", "pulled"], ["kanban", "pulled"]]);
  assert.deepEqual(modelsIn(byClass(target, "own-models")[0]).map(kindOf), [["broken-wip", "pulled"], ["scrum-wip", "pulled"]]);
});

// TST-778002 · level: unit · module: MOD-implementation-pages
// guards: UC-031
// given: this browser manages acme/library, whose docs/process.md names the shipped scrum, acme/atlas, whose names the instance's scrum-wip, and acme/bare, which has no docs/process.md
// input: the route `models` drawn
// expect: scrum lists https://github.com/acme/library; scrum-wip lists https://github.com/acme/atlas; every other model lists no product; acme/bare is listed under no model
test("TST-778002 each model lists the products of this browser whose declaration names it", async () => {
  const target = await draw();
  assert.deepEqual(productsOf(modelOf(target, "scrum")), [LIBRARY]);
  assert.deepEqual(productsOf(modelOf(target, "scrum-wip")), [ATLAS]);
  for (const name of ["waterfall", "v-model", "reuse-oriented", "kanban", "broken-wip"]) assert.deepEqual(productsOf(modelOf(target, name)), [], name);
  assert.equal(find(target, (node) => node.textContent === BARE && node.localName === "li").length, 0, "acme/bare declares no model");
});

// TST-778003 · level: unit · module: MOD-implementation-pages
// guards: UC-031
// given: the same page
// input: the route `models` drawn
// expect: every shipped model's links are exactly ["Adapt"], leading to "#models/name=<name>"; every model of the instance's own has exactly ["Edit"], leading to "#models/name=<name>"; the page
//   has one link "+ New model"
test("TST-778003 a shipped model offers Adapt only, an instance's model Edit, and the page + New model", async () => {
  const target = await draw();
  for (const name of SHIPPED) {
    assert.deepEqual(linksOf(modelOf(target, name)).map((link) => [link.textContent, link.getAttribute("href")]), [["Adapt", `#models/name=${name}`]], name);
  }
  for (const name of ["scrum-wip", "broken-wip"]) {
    assert.deepEqual(linksOf(modelOf(target, name)).map((link) => [link.textContent, link.getAttribute("href")]), [["Edit", `#models/name=${name}`]], name);
  }
  assert.deepEqual(byClass(target, "new-model").map((link) => link.textContent), ["+ New model"]);
});

// TST-778004 · level: unit · module: MOD-implementation-pages
// guards: UC-031; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: this browser manages acme/missing, which no token reaches (a private repository answers 404), beside the products acme/library and acme/atlas it can read
// input: the route `models` drawn
// expect: the unreadable list holds exactly "https://github.com/acme/missing: <the host's reason>" — the product's address, a colon, and the not-found text of its host —; scrum still lists acme/library
//   and scrum-wip still lists acme/atlas
test("TST-778004 a product that cannot be connected is shown with its reason and the others are still listed", async () => {
  const target = await draw();
  assert.deepEqual(byClass(target, "source").map((item) => item.textContent), [`${MISSING}: ${MISSING} ${NO_TOKEN}`]);
  assert.deepEqual(productsOf(modelOf(target, "scrum")), [LIBRARY]);
  assert.deepEqual(productsOf(modelOf(target, "scrum-wip")), [ATLAS]);
});

// TST-778005 · level: unit · module: MOD-implementation-pages
// guards: UC-031
// given: the instance's broken-wip, whose last transition leads to a phase "Nowhere" that it does not define, and its valid scrum-wip
// input: the route `models` drawn
// expect: broken-wip has a findings list with at least one entry, and each entry names "Nowhere"; scrum-wip and every shipped model have no findings list
test("TST-778005 the findings of a model of the instance are listed with it", async () => {
  const target = await draw();
  const broken = byClass(modelOf(target, "broken-wip"), "findings");
  assert.equal(broken.length, 1, "known positive: broken-wip has a findings list");
  const lines = linesOf(broken[0]);
  assert.ok(lines.length >= 1);
  for (const line of lines) assert.match(line, /Nowhere/);
  for (const name of [...SHIPPED, "scrum-wip"]) assert.deepEqual(byClass(modelOf(target, name), "findings"), [], name);
});

// TST-778006 · level: unit · module: MOD-implementation-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-031
// given: the page drawn, and src/site-frame/explanations.md
// input: the folded explanations of the page: one in each of the two sections, and in each model one beside its kind and one beside its products, and one beside the findings of broken-wip
// expect: each is a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and a body of text; the page holds exactly 2 + 2 × 7 + 1 of them
test("TST-778006 every part of the page carries a folded What is this?", async () => {
  const target = await draw();
  const explains = (root) => byClass(root, "explain");
  assert.equal(explains(target).length, 2 + 2 * 7 + 1);
  assert.equal(explains(byClass(target, "shipped-models")[0]).length, 1 + 2 * 5);
  assert.equal(explains(byClass(target, "own-models")[0]).length, 1 + 2 * 2 + 1);
  for (const folded of explains(target)) {
    assert.equal(folded.localName, "details");
    assert.equal(folded.hasAttribute("open"), false);
    const [summary, body] = folded.children;
    assert.equal(summary.textContent, "What is this?");
    assert.ok(body.textContent.trim().length > 40, "the body is a text, not an empty fold");
  }
});

// TST-778007 · level: unit · module: MOD-implementation-pages
// guards: UC-031
// given: the page drawn, and the frame's routing (MOD-site-frame routeOf), which reads a fragment as a route name and its parameters
// input: the href of every button of the page, read by routeOf
// expect: Adapt of v-model gives route "models" with name "v-model"; Edit of scrum-wip gives "models" with name "scrum-wip"; every shipped and own model's button gives its own name; + New model gives
//   "models" with the empty name ""; known positive: routeOf("#models/name=v-model") gives { name: "models", params: { name: "v-model" } }
test("TST-778007 each button's address, read by the frame's routing, carries its model's name", async () => {
  assert.deepEqual(routeOf("#models/name=v-model"), { name: "models", params: { name: "v-model" } });
  const target = await draw();
  for (const name of [...SHIPPED, "scrum-wip", "broken-wip"]) {
    assert.deepEqual(routeOf(linksOf(modelOf(target, name))[0].getAttribute("href")), { name: "models", params: { name } }, name);
  }
  assert.deepEqual(routeOf(byClass(target, "new-model")[0].getAttribute("href")), { name: "models", params: { name: "" } });
});

// The settings page names, for a GitLab product, the environment scope each CI/CD variable of Agent M's job workflow needs, checks the project's variables against
// them, and calls the setup safe only where every variable stands with exactly those scopes — MOD-settings-pages' line "whether Agent M's job workflow is
// installed" (docs/architecture/MOD-settings-pages.md, Interfaces: settings), with MOD-runtimes' gitlabVariableScopes and MOD-repository-hosts' ciVariableScopes.
// Run: node --test tests/settings-pages-job-workflow-gitlab-scopes.test.mjs
//
// Module: MOD-settings-pages
// Guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; GITLAB PRODUCTS ARE SUPPORTED
// Level: unit
//
// The repository servers are fixtures in memory, as in tests/settings-pages-job-workflow-gitlab-ci.test.mjs: a GitLab product whose host lists the variables given
// — or refuses to —, and an instance whose participants register has one CI participant, whose key is HOSTED_KEY. Nothing reaches the network. Each test states its
// input and its expected result before it runs.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";

class Element {
  constructor(name) { this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.disabled = false; this.attributes = new Map(); this.listeners = []; }
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
const settingsRoute = () => view.routes.find((candidate) => candidate.name === "settings");

const INSTANCE_COMMIT = "0123456789abcdef0123456789abcdef01234567";
const text = (...lines) => `${lines.join("\n")}\n`;
const PARTICIPANTS = text("# Participants of this instance", "", "**REGISTER**", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |",
  "|---|---|---|---|---|---|---|---|",
  "| hosted-ci | CI agent | gpt-5 | 200000 | — | draft text, read the repository, write to the repository, run code and tests, use tools | GitLab hosted runner | ci hosted secret HOSTED_KEY |");
const instanceHost = {
  async repositoryInfo() { return { defaultBranch: "main", canWrite: true, visibility: "private" }; },
  async readSnapshot() {
    return { commit: INSTANCE_COMMIT, paths: ["docs/participants.md"], blob: () => "b".repeat(40), async read(path) { return path === "docs/participants.md" ? PARTICIPANTS : null; } };
  },
};
const VALUE = "sk-THE-VALUE-NEVER-SHOWN-0123456789";

// A GitLab product with no job workflow yet, whose host lists `variables` — each a name and a scope, and here a value too, which the page must not show — or throws `refusal`.
const gitlabProduct = ({ variables = [], refusal = null }) => ({
  address: "https://gitlab.example.test/fixture/product",
  host: {
    async repositoryInfo() { return { defaultBranch: "main", canWrite: true, visibility: "private" }; },
    async readSnapshot() { return { commit: "1".repeat(40), paths: [], blob: () => null, async read() { return null; } }; },
    async commitFiles() { throw new Error("nothing is written here"); },
    async ciVariableScopes() {
      if (refusal) throw refusal;
      return variables.map(([name, scope]) => ({ name, scope, value: VALUE }));
    },
  },
});

async function renderLine(product) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browserStore = openStore("fixture/instance");
  writeSetting(browserStore, "gitlab-token:gitlab.example.test/fixture/product", { value: "glpat_fixture" });
  const target = document.createElement("div");
  await settingsRoute().render(target, { instance: { repository: "fixture/instance", host: instanceHost }, product, store: browserStore, go() {} }, {});
  byClass(target, "settings-tab")[1].fire("click", { isTrusted: false });
  return byClass(target, "settings-job-workflow")[0];
}
const scopeLines = (line) => byClass(line, "settings-job-workflow-scopes")[0]?.childNodes.map((item) => item.textContent) ?? [];
const stateOf = (line) => byClass(line, "settings-job-workflow-scope-state")[0]?.textContent ?? "";

// TST-0125201 · level: unit · module: MOD-settings-pages
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; GITLAB PRODUCTS ARE SUPPORTED
// given: a GitLab product whose variables are AGENT_M_TOKEN scoped to agent-m-write and HOSTED_KEY scoped to agent-m-key-HOSTED_KEY and to agent-m-write, each listed with a value
// input: the person opens Repositories and reads the job workflow line
// expect: the line names `AGENT_M_TOKEN: environment scope agent-m-write` and `HOSTED_KEY: environment scope agent-m-key-HOSTED_KEY and agent-m-write, one variable for each`, says the job workflow is safe, and shows no value
test("TST-0125201: a GitLab product whose variables have exactly the scopes they need is called safe, and no value is shown", async () => {
  const line = await renderLine(gitlabProduct({ variables: [["AGENT_M_TOKEN", "agent-m-write"], ["HOSTED_KEY", "agent-m-key-HOSTED_KEY"], ["HOSTED_KEY", "agent-m-write"]] }));
  assert.ok(line, "failure node: the product settings section shows Agent M's job workflow line");
  assert.deepEqual(scopeLines(line), ["AGENT_M_TOKEN: environment scope agent-m-write",
    "HOSTED_KEY: environment scope agent-m-key-HOSTED_KEY and agent-m-write, one variable for each"]);
  assert.match(stateOf(line), /is safe/);
  assert.ok(!line.textContent.includes(VALUE), "no value is shown");
});

// TST-0125202 · level: unit · module: MOD-settings-pages
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: a GitLab product whose AGENT_M_TOKEN is scoped to `*` and whose HOSTED_KEY is scoped to agent-m-key-HOSTED_KEY alone
// input: the person opens Repositories and reads the job workflow line
// expect: the line does not call the setup safe; it says not safe, naming that AGENT_M_TOKEN has no variable of the scope agent-m-write, that AGENT_M_TOKEN has the scope `*`, which reaches every job, and that HOSTED_KEY has no variable of the scope agent-m-write
test("TST-0125202: a variable with another scope, or missing one, is named and the setup is not called safe", async () => {
  const line = await renderLine(gitlabProduct({ variables: [["AGENT_M_TOKEN", "*"], ["HOSTED_KEY", "agent-m-key-HOSTED_KEY"]] }));
  const state = stateOf(line);
  assert.doesNotMatch(state, /is safe/);
  assert.match(state, /^Not safe: /);
  assert.ok(state.includes("AGENT_M_TOKEN has no variable of the scope agent-m-write"), state);
  assert.ok(state.includes("AGENT_M_TOKEN has the scope *, which reaches every job"), state);
  assert.ok(state.includes("HOSTED_KEY has no variable of the scope agent-m-write"), state);
});

// TST-0125203 · level: unit · module: MOD-settings-pages
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: a GitLab product whose server refuses to list the variables — PermissionMissing, the token has no role Maintainer
// input: the person opens Repositories and reads the job workflow line
// expect: the line still names the scope each variable needs, says the scopes cannot be checked here with the server's reason, and that the job workflow is not safe until they are as named; it never calls it safe
test("TST-0125203: where the server does not list the variables, the line names the scopes and does not call the setup safe", async () => {
  const refusal = Object.assign(new Error("gitlab.example.test refuses: the token needs the role Maintainer"), { name: "PermissionMissing" });
  const line = await renderLine(gitlabProduct({ refusal }));
  assert.equal(scopeLines(line).length, 2);
  const state = stateOf(line);
  assert.match(state, /cannot be checked here \(gitlab\.example\.test refuses: the token needs the role Maintainer\)/);
  assert.match(state, /not safe/);
  assert.doesNotMatch(state, /is safe/);
});

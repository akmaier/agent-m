// MOD-settings-pages' line of Agent M's job workflow for a product (docs/architecture/MOD-settings-pages.md, Interfaces: settings), from MOD-runtimes' actionsSetup with the key
// MOD-site-frame's tokenKeyOf gives for the product's token: for a GitHub product it names what is missing — the job workflow, each secret by name — and offers one button,
// Set up GitHub Actions, whose person's click runs setUp and names the commit and the secrets it stored, never a value; each secret this browser keeps no value for is named
// with the repository's secrets page. A GitLab product keeps Install (UC-010, Precondition).
// Run: node --test tests/settings-pages-job-workflow-github-setup.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-010; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; GITLAB PRODUCTS ARE SUPPORTED
// Level: unit
//
// The repository servers are fixtures in memory, as in tests/settings-pages-settings-regressions.test.mjs: an instance whose participants register lists an agent, and a writable
// product whose host notes every commit and every secret it is asked to store. The keys the job workflow reads are the secrets this browser's endpoints name (MOD-runtimes,
// actionsSetup): hosted (HOSTED_KEY, whose key this browser does not keep) and nvidia (NVIDIA_API_KEY, with its key). The values are fixtures. Nothing reaches the network.
// Each test states its input and its expected result before it runs.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";

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
const click = (node, isTrusted = false) => node.fire("click", { isTrusted });
const settingsRoute = () => view.routes.find((candidate) => candidate.name === "settings");

const TOKEN = "github_pat_FIXTUREproductTOKEN0123456789";
const NVIDIA_KEY = "nvapi-FIXTURE-KEY-0123456789";
const INSTANCE_COMMIT = "0123456789abcdef0123456789abcdef01234567";
const text = (...lines) => `${lines.join("\n")}\n`;
const PARTICIPANTS = text("# Participants of this instance", "", "**REGISTER**", "",
  "| Name | Type | Model |",
  "|---|---|---|",
  "| dev-a | agent | gpt-5 |");
const instanceHost = {
  async repositoryInfo() { return { defaultBranch: "main", canWrite: true, visibility: "private" }; },
  async readSnapshot(ref) {
    return { repository: { server: "github", origin: "https://github.com", path: "fixture/instance", web: "https://github.com/fixture/instance" }, ref, commit: INSTANCE_COMMIT,
      paths: ["docs/participants.md"], blob: () => "b".repeat(40), async read(path) { return path === "docs/participants.md" ? PARTICIPANTS : null; } };
  },
};

// A writable product on `server` with no job workflow and no Actions secret; `calls` notes every commit and every secret stored, in order.
function product(server) {
  const calls = [];
  const repository = server === "github"
    ? { server: "github", origin: "https://github.com", path: "fixture/product", web: "https://github.com/fixture/product" }
    : { server: "gitlab", origin: "https://gitlab.example.test", path: "fixture/product", web: "https://gitlab.example.test/fixture/product" };
  return { calls, address: repository.web, host: {
    async repositoryInfo() { return { defaultBranch: "main", canWrite: true, visibility: "private" }; },
    async readSnapshot(ref) { return { repository, ref, commit: "1".repeat(40), paths: [], blob: () => null, async read() { return null; } }; },
    async ciSecretNames() { return []; },
    async ciVariableScopes() { return []; },
    async commitFiles(change) { calls.push(["commitFiles", change.branch, change.files.length]); return { commit: "2".repeat(40), url: `${repository.web}/commit/${"2".repeat(40)}` }; },
    async setCiSecret(name, value) { calls.push(["setCiSecret", name, value]); },
  } };
}

async function line(chosen, tokenKey) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browserStore = openStore("fixture/instance");
  writeSetting(browserStore, tokenKey, { value: TOKEN, name: "Agent M · product", expires: "2027-01-01" });
  writeSetting(browserStore, "endpoint:hosted", { kind: "openai-compatible", url: "https://hosted.example.test/v1", model: "gpt-5", secret: "HOSTED_KEY" });
  writeSetting(browserStore, "endpoint:nvidia", { kind: "openai-compatible", url: "https://integrate.api.nvidia.com/v1", model: "nemotron", key: NVIDIA_KEY, secret: "NVIDIA_API_KEY" });
  const target = document.createElement("div");
  await settingsRoute().render(target, { instance: { repository: "fixture/instance", host: instanceHost }, product: chosen, store: browserStore, go() {} }, {});
  click(byClass(target, "settings-tab")[1]);
  return byClass(target, "settings-job-workflow")[0];
}

// TST-2026110921 · level: unit · module: MOD-settings-pages
// guards: UC-010; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: a writable GitHub product without the job workflow and without any Actions secret; this browser keeps the product's token under github-token:fixture/product and endpoint:hosted naming the secret HOSTED_KEY without its key, and endpoint:nvidia with its key and the secret NVIDIA_API_KEY
// input: the person opens Repositories and reads the job workflow line; a script clicks its button; then the person clicks it
// expect: the line says Not installed, names the missing secrets AGENT_M_TOKEN, HOSTED_KEY, NVIDIA_API_KEY, names HOSTED_KEY as kept by no value here with the repository's secrets page, and offers one button reading Set up GitHub Actions; the script's click writes nothing; the person's click is one commit on main and then AGENT_M_TOKEN stored with the token and NVIDIA_API_KEY with the key; the line then names the commit and the two secrets stored; neither value is anywhere on the line
test("TST-2026110921: a GitHub product's line names what is missing and Set up GitHub Actions sets it up on the person's click", async () => {
  const chosen = product("github");
  const workflow = await line(chosen, "github-token:fixture/product");
  assert.ok(workflow, "failure node: the product settings section shows Agent M's job workflow line");
  assert.match(workflow.textContent, /Not installed/);
  assert.match(byClass(workflow, "settings-job-workflow-missing")[0]?.textContent ?? "", /AGENT_M_TOKEN, HOSTED_KEY, NVIDIA_API_KEY/);
  const unknown = byClass(workflow, "settings-job-workflow-unknown")[0];
  assert.match(unknown?.textContent ?? "", /HOSTED_KEY/);
  assert.doesNotMatch(unknown.textContent, /AGENT_M_TOKEN|NVIDIA_API_KEY/);
  assert.ok(descendants(workflow, (node) => node.localName === "a" && node.href === "https://github.com/fixture/product/settings/secrets/actions").length >= 1, "the secrets page is linked");
  const buttons = descendants(workflow, (node) => node.localName === "button");
  assert.deepEqual(buttons.map((button) => button.textContent), ["Set up GitHub Actions"]);

  await click(buttons[0], false);
  assert.deepEqual(chosen.calls, [], "a script's click writes nothing");
  await click(buttons[0], true);
  assert.deepEqual(chosen.calls.map(([kind, name]) => [kind, name]), [["commitFiles", "main"], ["setCiSecret", "AGENT_M_TOKEN"], ["setCiSecret", "NVIDIA_API_KEY"]]);
  assert.deepEqual(chosen.calls.slice(1).map(([, , value]) => value), [TOKEN, NVIDIA_KEY]);
  const result = byClass(workflow, "settings-job-workflow-result")[0].textContent;
  assert.match(result, new RegExp(`Committed ${"2".repeat(40)}`));
  assert.match(result, /AGENT_M_TOKEN, NVIDIA_API_KEY/);
  for (const value of [TOKEN, NVIDIA_KEY]) assert.equal(workflow.textContent.includes(value), false, "no value is shown");
});

// TST-2026110922 · level: unit · module: MOD-settings-pages
// guards: UC-010; GITLAB PRODUCTS ARE SUPPORTED
// given: a writable GitLab product without the job workflow; the same browser and instance
// input: the person opens Repositories and reads the job workflow line
// expect: the line says Not installed and offers one button reading Install, and names no missing secret: GitLab lists none
test("TST-2026110922: a GitLab product's line keeps Install", async () => {
  const workflow = await line(product("gitlab"), "gitlab-token:gitlab.example.test/fixture/product");
  assert.match(workflow.textContent, /Not installed/);
  assert.deepEqual(descendants(workflow, (node) => node.localName === "button").map((button) => button.textContent), ["Install"]);
  assert.equal(byClass(workflow, "settings-job-workflow-missing").length, 0);
});

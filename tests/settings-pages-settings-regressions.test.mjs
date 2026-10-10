import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

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
const click = (node, isTrusted = false) => node.fire("click", { isTrusted });
const settingsRoute = () => view.routes.find((candidate) => candidate.name === "settings");
function store() { Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() }); return openStore("fixture/instance"); }
async function render(browserStore, product = null) {
  const target = document.createElement("div");
  await settingsRoute().render(target, { instance: { repository: "fixture/instance" }, product, store: browserStore, go() {} }, {});
  return target;
}
function repositories(target) { click(byClass(target, "settings-tab")[1]); return target; }
function writableProduct(writes) {
  const blob = (text) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0${text}`).digest("hex");
  const files = new Map([
    ["docs/collaborators.md", "# Collaborators of this product\n\n| Name | Account | Agreed on |\n|---|---|---|\n| Ada Example | @ada | 2026-09-01 |\n| A Bea Example | @bea | 2026-09-02 |\n"],
    ["docs/settings.md", "# Settings of this product\n\n- pseudonymisation: on\n"],
  ]);
  let commit = "0".repeat(40);
  return {
    address: "https://github.com/fixture/product",
    host: {
      async repositoryInfo() { return { defaultBranch: "main", canWrite: true, visibility: "public" }; },
      async readSnapshot() {
        const opened = new Map(files);
        return {
          commit,
          blob(path) { return opened.has(path) ? blob(opened.get(path)) : null; },
          async read(path) { return opened.get(path) ?? null; },
        };
      },
      async commitFiles(change) {
        for (const file of change.files) files.set(file.path, file.text);
        commit = `${Number(commit) + 1}`.padStart(40, "0");
        writes.push(change);
        return { commit, url: `https://github.com/fixture/product/commit/${commit}` };
      },
    },
  };
}

// TST-290116
// level: unit
// module: MOD-settings-pages
// guards: UC-042; A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
// given: an unset instance repository token on the public Settings Route
// input: the person opens Repositories
// expect: the visible expiry input starts at the prefilled token link's ninety-day date
test("TST-290116: an unset repository-token expiry defaults to the prefilled ninety days", async () => {
  const target = repositories(await render(store()));
  const line = byClass(target, "settings-repository").find((node) => /GitHub token/.test(node.textContent));
  const expected = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  assert.equal(byClass(line, "settings-repository-expiry")[0].value, expected, "failure node: UC-042 Change starts with the token link's ninety-day expiry");
});

// TST-290117
// level: unit
// module: MOD-settings-pages
// guards: UC-042; SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS; A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
// given: a writable public chosen product with a dated collaborator consent record
// input: the person opens Repositories without saving
// expect: the page names issues, repository publication, history rewrite, consent date, and removal's history consequence
test("TST-290117: product privacy and collaborator disclosures preserve UC-042's public-history consequences", async () => {
  const writes = [], browserStore = store();
  writeSetting(browserStore, "github-token:fixture/product", { value: "ghp_fixture" });
  const target = repositories(await render(browserStore, writableProduct(writes)));
  assert.match(target.textContent, /issues and the repository.*unchanged/i, "failure node: off names both destinations");
  assert.match(target.textContent, /public.*published/i, "failure node: a public product names publication before save");
  assert.match(target.textContent, /history.*rewrite/i, "failure node: switching back on names the existing-history rewrite");
  assert.match(byClass(target, "settings-collaborator-records")[0].textContent, /Ada Example.*@ada.*2026-09-01/);
  assert.match(target.textContent, /earlier commits keep the name in the history/i, "failure node: removal explains its immutable-history consequence");
});

// TST-290118
// level: unit
// module: MOD-settings-pages
// guards: UC-042; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a writable product and a custom event fixture that distinguishes scripted from trusted clicks
// input: the person presses Save pseudonymisation, then a script presses the same visible control
// expect: the known-positive trusted event produces one product commit and the scripted event leaves that count unchanged
test("TST-290118: a scripted product-settings click writes neither pseudonymisation nor collaborator data", async () => {
  const writes = [], browserStore = store();
  writeSetting(browserStore, "github-token:fixture/product", { value: "ghp_fixture" });
  const target = repositories(await render(browserStore, writableProduct(writes)));
  const off = byClass(target, "settings-pseudonymisation-off")[0];
  const acknowledgement = byClass(target, "settings-pseudonymisation-ack")[0];
  off.checked = acknowledgement.checked = true;
  click(byClass(target, "settings-pseudonymisation-save")[0], true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(writes.length, 1, "known positive: the same public save boundary commits once for a trusted person click");
  click(byClass(target, "settings-pseudonymisation-save")[0]);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(writes.length, 1, "failure node: an untrusted click cannot cross the product save boundary");
});

// TST-290119
// level: unit
// module: MOD-settings-pages
// guards: UC-042; A CLEAR IS A REAL CLEAR
// given: a browser-held product and its own token on the public Settings Route
// input: the person declines Remove and Clear
// expect: each destructive browser action asks separately and preserves the product record on refusal
test("TST-290119: product removal and product-list clear ask before changing browser records", async () => {
  const browserStore = store();
  writeSetting(browserStore, "products", ["https://github.com/fixture/product"]);
  writeSetting(browserStore, "github-token:fixture/product", { value: "ghp_fixture" });
  const target = repositories(await render(browserStore));
  const priorConfirm = globalThis.confirm;
  let questions = 0;
  globalThis.confirm = () => { questions += 1; return false; };
  try {
    click(byClass(target, "settings-product-remove")[0]);
    assert.deepEqual(readSetting(browserStore, "products"), ["https://github.com/fixture/product"], "failure node: cancelled Remove retains the product");
    const list = byClass(target, "settings-repository").find((node) => /Products/.test(node.textContent));
    click(byClass(list, "settings-repository-clear")[0]);
    assert.deepEqual(readSetting(browserStore, "products"), ["https://github.com/fixture/product"], "failure node: cancelled Clear retains the product list");
    assert.equal(questions, 2, "each destructive browser action asks its own confirmation");
  } finally { globalThis.confirm = priorConfirm; }
});

// TST-290120
// level: unit
// module: MOD-settings-pages
// guards: UC-042; EVERY STEP EXPLAINS ITSELF; A TOKEN IS SCOPED TO WHAT IT WRITES
// given: the public instance repository-token line
// input: the person opens Repositories
// expect: a folded explanation states the token's purpose and minimum repository scope before it can be changed
test("TST-290120: repository token controls retain folded scope and purpose explanations", async () => {
  const target = repositories(await render(store()));
  const line = byClass(target, "settings-repository").find((node) => /GitHub token/.test(node.textContent));
  assert.ok(descendants(line, (node) => node.localName === "details").length > 0, "failure node: the repository line exposes its folded explanation");
  assert.match(line.textContent, /minimum.*scope|only.*repository/i, "failure node: the explanation states why the token needs its limited repository scope");
});

// TST-290123
// level: unit
// module: MOD-settings-pages
// guards: UC-042; EVERY STEP EXPLAINS ITSELF
// given: the public Settings Route with one repository token, Bridge, jump host, remote session, and writable product
// input: the person opens each Settings tab
// expect: every rendered settings section has a folded What is this? that names purpose, storage, and readers
test("TST-290123: every rendered Settings section states purpose, storage, and readers in a folded explanation", async () => {
  const browserStore = store();
  writeSetting(browserStore, "github-token", { value: "ghp_fixture" });
  writeSetting(browserStore, "bridge", { address: "http://127.0.0.1:8787", token: "bridge_fixture" });
  writeSetting(browserStore, "jump-host", { hostname: "jump.example.test" });
  writeSetting(browserStore, "remote-session:fixture", { port: 8788, token: "remote_fixture" });
  writeSetting(browserStore, "github-token:fixture/product", { value: "ghp_product" });
  const target = await render(browserStore, writableProduct([]));
  for (const tab of byClass(target, "settings-tab")) click(tab);
  const sections = descendants(target, (node) => node.localName === "section" && /^settings-(repository|product|bridge|jump-host|remote-session|export-import|clear)/.test(node.className));
  assert.ok(sections.length >= 7, "known positive: the fixture renders every Settings section under test");
  for (const section of sections) {
    const details = descendants(section, (node) => node.localName === "details" && node.textContent.includes("What is this?"));
    assert.equal(details.length, 1, `failure node: ${section.className} has exactly one folded What is this?`);
    assert.match(details[0].textContent, /browser|repository/i, `${section.className}: explanation names where the setting is kept`);
    assert.match(details[0].textContent, /read/i, `${section.className}: explanation names who can read it`);
  }
});

// TST-290121
// level: unit
// module: MOD-settings-pages
// guards: UC-042; A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a writable chosen product with an existing dated consent record and a host that returns its commit link
// input: the person chooses a consent date, saves the collaborator, then removes that collaborator
// expect: the chosen date is committed and read back beside name/account; removal names immutable history and links its commit
test("TST-290121: collaborator consent preserves the chosen date, readback, and withdrawal history commit link", async () => {
  const fixtures = [
    { address: "https://github.com/fixture/product/tree/main", key: "github-token:fixture/product", token: "ghp_fixture", prefix: "https://github.com/fixture/product/commit/" },
    { address: "https://gitlab.example.test/group/subgroup/product/-/tree/main", key: "gitlab-token:gitlab.example.test/group/subgroup/product", token: "glpat_fixture", prefix: "https://gitlab.example.test/group/subgroup/product/-/commit/" },
  ];
  for (const fixture of fixtures) {
  const writes = [], browserStore = store();
  writeSetting(browserStore, fixture.key, { value: fixture.token });
  const product = writableProduct(writes); product.address = fixture.address;
  const target = repositories(await render(browserStore, product));
  const chosen = byClass(target, "settings-collaborator-agreed-date")[0];
  assert.ok(chosen, "failure node: the public collaborator form lets the person choose the consent date");
  chosen.value = "2026-09-15";
  byClass(target, "settings-collaborator-name")[0].value = "Bea Example";
  byClass(target, "settings-collaborator-account")[0].value = "@bea";
  byClass(target, "settings-collaborator-agreed")[0].checked = true;
  await click(byClass(target, "settings-collaborator-save")[0], true);
  assert.match(writes[0].files[0].text, /\| Bea Example \| @bea \| 2026-09-15 \|/, "the selected consent date reaches the one-file commit");
  assert.match(byClass(target, "settings-collaborator-records")[0].textContent, /Bea Example.*@bea.*2026-09-15/, "readback retains the selected consent date");
  byClass(target, "settings-collaborator-remove-name")[0].value = "Bea Example";
  byClass(target, "settings-collaborator-remove-account")[0].value = "@bea";
  await click(byClass(target, "settings-collaborator-remove")[0], true);
  const withdrawal = byClass(target, "settings-collaborator-result")[0];
  assert.match(withdrawal.textContent, /earlier commits.*history/i, "withdrawal names its immutable-history consequence");
  const link = descendants(withdrawal, (node) => node.localName === "a")[0];
  assert.equal(link?.href, `${fixture.prefix}${"2".padStart(40, "0")}`, "withdrawal exposes the normalized host commit link");
  assert.match(writes[1].files[0].text, /A Bea Example \| @bea \| 2026-09-02/, "the similarly suffixed collaborator remains in committed text");
  assert.match(byClass(target, "settings-collaborator-records")[0].textContent, /A Bea Example.*@bea.*2026-09-02/, "the similarly suffixed collaborator remains visible after withdrawal");
  }
});

// TST-290122
// level: unit
// module: MOD-settings-pages
// guards: UC-042; A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE; SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A CLEAR IS A REAL CLEAR; EVERY STEP EXPLAINS ITSELF; A TOKEN IS SCOPED TO WHAT IT WRITES; A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
// covered cases: TST-290116; TST-290117; TST-290118; TST-290119; TST-290120; TST-290121; TST-290123
// given: GitHub Ubuntu CI and an isolated source copy
// input: a unique public Settings-route fault is planted, then byte-exactly restored
// expect: all seven guarded cases fail in the child and pass after restoration
test("TST-290122: CI counter-proof restores the Settings route for TST-290116 through TST-290123", () => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_290_SETTINGS_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-290-settings-fault-")), copied = join(temporary, "repo");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    const source = join(copied, "src/settings-pages/settings.mjs"), testPath = "tests/settings-pages-settings-regressions.test.mjs";
    const original = readFileSync(source), needle = "function repositoryLine(context, info) {";
    assert.equal(original.toString().split(needle).length - 1, 1, "the Settings-route fault target is unique");
    const argv = [process.execPath, "--test", "--test-name-pattern", "TST-29011[6-9]|TST-290120|TST-290121|TST-290123", testPath];
    const invoke = () => { const env = { ...process.env, AGENT_M_290_SETTINGS_FAULT_CHILD: "1" }; delete env.NODE_TEST_CONTEXT; return spawnSync(argv[0], argv.slice(1), { cwd: copied, encoding: "utf8", timeout: 60_000, env }); };
    const originalHash = createHash("sha256").update(original).digest("hex"), testHash = createHash("sha256").update(readFileSync(join(copied, testPath))).digest("hex");
    const faultStarted = new Date().toISOString(); writeFileSync(source, original.toString().replace(needle, "function repositoryLineFault(context, info) {"));
    const faultHash = createHash("sha256").update(readFileSync(source)).digest("hex"), failed = invoke(), faultEnded = new Date().toISOString();
    const restoreStarted = new Date().toISOString(); writeFileSync(source, original);
    const restoredHash = createHash("sha256").update(readFileSync(source)).digest("hex"), passed = invoke(), restoreEnded = new Date().toISOString();
    console.log(`TST-290122-counterproof ${JSON.stringify({ argv, cwd: copied, childEnv: { AGENT_M_290_SETTINGS_FAULT_CHILD: "1", NODE_TEST_CONTEXT: null }, source, testPath, testHash, originalHash, faultHash, restoredHash, faultStarted, faultEnded, restoreStarted, restoreEnded, failed: { status: failed.status, signal: failed.signal, error: failed.error?.message ?? null, stdout: failed.stdout, stderr: failed.stderr }, passed: { status: passed.status, signal: passed.signal, error: passed.error?.message ?? null, stdout: passed.stdout, stderr: passed.stderr } })}`);
    assert.equal(failed.status, 1); assert.equal(failed.signal, null); assert.equal(failed.error, undefined);
    for (const id of ["TST-290116", "TST-290117", "TST-290118", "TST-290119", "TST-290120", "TST-290121", "TST-290123"]) assert.match(`${failed.stdout}\n${failed.stderr}`, new RegExp(`not ok \\d+ - ${id}:`));
    assert.equal(restoredHash, originalHash, "source bytes are restored exactly");
    assert.equal(passed.status, 0); assert.equal(passed.signal, null); assert.equal(passed.error, undefined);
    for (const id of ["TST-290116", "TST-290117", "TST-290118", "TST-290119", "TST-290120", "TST-290121", "TST-290123"]) assert.match(`${passed.stdout}\n${passed.stderr}`, new RegExp(`ok \\d+ - ${id}:`));
    assert.ok(faultHash !== originalHash);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

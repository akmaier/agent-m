// Module: MOD-settings-pages
//
// UC-042 step 2: *Change* of a repository token opens the same fields as the use case that set it up — for a GitHub token the
// prefilled token page of UC-014 step 7 (the instance's) or UC-001 step 3 (a product's) with the repositories to select spelled
// out beside it, for a GitLab project token its Access tokens page with UC-001 3c's steps. Every expected address is stated here.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.hidden = false; this.attributes = new Map(); }
  append(...nodes) { for (const node of nodes.flat()) this.childNodes.push(typeof node === "string" ? new Text(node) : node); }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
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
const click = (node) => node.dispatchEvent(new Event("click"));

// GitHub's prefilled page for a new fine-grained token ("Pre-filling fine-grained personal access token details using URL
// parameters"): name, description, target_name, expires_in and ONE GITHUB TOKEN SERVES EVERY FEATURE's permissions.
const PERMISSIONS = "contents=write&issues=write&pull_requests=write&actions=write&workflows=write&secrets=write&metadata=read";
const INSTANCE_PAGE = "https://github.com/settings/personal-access-tokens/new?name=Agent+M+%C2%B7+fixture%2Finstance" +
  "&description=Agent+M+dashboard+of+fixture%2Finstance%3A+commits%2C+issues%2C+pull+requests+and+runs+of+the+work+you+start." +
  `&target_name=fixture&expires_in=90&${PERMISSIONS}`;
const PRODUCT_PAGE = "https://github.com/settings/personal-access-tokens/new?name=Agent+M+%C2%B7+alice%2Fthesis-tool" +
  "&description=Agent+M+for+the+product+alice%2Fthesis-tool%3A+reviews%2C+commits%2C+issues%2C+pull+requests+and+runs+of+the+work+you+start+in+it." +
  `&target_name=alice&expires_in=90&${PERMISSIONS}`;

async function repositoryLines(settings) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore("fixture/instance");
  for (const [key, value] of Object.entries(settings)) writeSetting(store, key, value);
  const target = document.createElement("div");
  await view.routes.find((route) => route.name === "settings").render(target, { instance: { repository: "fixture/instance" }, product: null, store, go() {} }, {});
  click(byClass(target, "settings-tab")[1]);
  return (title) => byClass(target, "settings-repository").find((node) => byClass(node, "settings-repository-change").length && node.childNodes[0]?.textContent === title);
}

// What Change shows of the token's page: the link and the steps beside it, and whether their box is hidden — none shown is hidden.
function tokenPage(line) {
  const box = byClass(line, "settings-repository-token")[0];
  const link = box && byClass(box, "settings-repository-token-page")[0];
  const steps = box && byClass(box, "settings-repository-token-steps")[0];
  return { link, steps, hidden: !box || box.hidden };
}

// TST-1801001
// level: unit
// module: MOD-settings-pages
// guards: UC-042; UC-014; THE TOKEN LINK IS PREFILLED; ONE GITHUB TOKEN SERVES EVERY FEATURE; THE REPOSITORY CHOICE IS SPELLED OUT; A TOKEN IS SCOPED TO WHAT IT WRITES
// given: the instance's GitHub token stored in this browser for the instance fixture/instance
// input: the person opens Repositories on Settings and presses Change on the instance's token line
// expect: before Change no token page is shown; after it, the line links GitHub's new-token page prefilled with the instance's name, description, owner fixture, 90 days and every permission of ONE GITHUB TOKEN SERVES EVERY FEATURE, and names fixture/instance as the only repository to select; Renew still opens the list of the person's tokens
test("TST-1801001: Change of the instance's GitHub token links the prefilled token page with every permission", async () => {
  const line = (await repositoryLines({ "github-token": { value: "github_pat_fixture", name: "GitHub token", expires: "2027-01-01" } }))("GitHub token");
  assert.ok(line, "the instance's token line is shown");
  assert.equal(tokenPage(line).hidden, true, "the token page belongs to the form Change opens");
  click(byClass(line, "settings-repository-change")[0]);
  const page = tokenPage(line);
  assert.equal(page.hidden, false, "Change shows the token page");
  assert.equal(page.link.href, INSTANCE_PAGE, "failure node: the instance's token page is prefilled with name, description, owner, expiry and every permission");
  assert.equal(page.link.target, "_blank");
  assert.match(page.steps.textContent, /Only select repositories/);
  assert.match(page.steps.textContent, /pick "fixture\/instance" — nothing else/);
  assert.equal(byClass(line, "settings-repository-renew")[0].href, "https://github.com/settings/personal-access-tokens", "Renew keeps GitHub's list, where Regenerate token keeps permissions and repositories");
});

// TST-1801002
// level: unit
// module: MOD-settings-pages
// guards: UC-042; UC-001; THE TOKEN LINK IS PREFILLED; ONE GITHUB TOKEN SERVES EVERY FEATURE; A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT; A GITHUB PRODUCT USES A TOKEN OF ITS OWN
// given: a GitHub product's own token stored under github-token:alice/thesis-tool
// input: the person presses Change on that product's token line
// expect: the line links GitHub's new-token page prefilled with the product's name and description, owner alice, 90 days and every permission, and names alice/thesis-tool as the only repository to select, not the instance
test("TST-1801002: Change of a GitHub product's token links the product's prefilled token page", async () => {
  const line = (await repositoryLines({ "github-token:alice/thesis-tool": { value: "github_pat_product", name: "Agent M · alice/thesis-tool", expires: "2027-01-01" } }))("GitHub token: alice/thesis-tool");
  assert.ok(line, "the product's token line is shown");
  click(byClass(line, "settings-repository-change")[0]);
  const page = tokenPage(line);
  assert.equal(page.hidden, false);
  assert.equal(page.link.href, PRODUCT_PAGE, "failure node: the product's token page carries its own name, description, owner and every permission");
  assert.match(page.steps.textContent, /pick "alice\/thesis-tool" — nothing else/);
  assert.doesNotMatch(page.steps.textContent, /fixture\/instance/, "the instance is not among the repositories to select");
});

// TST-1801003
// level: unit
// module: MOD-settings-pages
// guards: UC-042; UC-001; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
// given: a GitLab project token stored under gitlab-token:gitlab.example.test/group/product
// input: the person presses Change on that token's line
// expect: the line links the project's Access tokens page and names role Maintainer and scope api, as UC-001 3c does; GitLab offers no prefilled page
test("TST-1801003: Change of a GitLab project token links its Access tokens page with role and scope", async () => {
  const lines = await repositoryLines({ "gitlab-token:gitlab.example.test/group/product": { value: "glpat-fixture", name: "Agent M", expires: "2027-01-01" } });
  const line = lines("GitLab token: gitlab.example.test/group/product");
  assert.ok(line, "the GitLab token line is shown");
  click(byClass(line, "settings-repository-change")[0]);
  const page = tokenPage(line);
  assert.equal(page.hidden, false);
  assert.equal(page.link.href, "https://gitlab.example.test/group/product/-/settings/access_tokens");
  assert.match(page.steps.textContent, /Maintainer/);
  assert.match(page.steps.textContent, /scope: api/);
});

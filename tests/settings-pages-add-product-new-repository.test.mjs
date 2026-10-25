// MOD-settings-pages' notice of a missing repository (ITM-575), as UC-001 2a states it: "The product repository does not exist yet. Agent M says so and links GitHub's page for a
// new repository, with a folded explanation of the choices there; the author returns and continues at step 2." The notice is the one Check and Add product show when the server
// answers 404 for the repository; its folded explanation is MOD-site-frame's `explain("new-repository")`, inside the notice's own element and after the link.
// Run: node --test tests/settings-pages-add-product-new-repository.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-001; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// This takes the browser harness (the fixture document and its helpers) from tests/settings-pages-harness.mjs, the helper file of the tests of MOD-settings-pages, and imports no
// test file. Every request is answered by a fake of fetch of this file's own that answers the status each case names with a JSON body; nothing reaches the
// network. What the explanation says is MOD-site-frame's; here only that the notice carries what the real
// explain() returns for the topic, and where. Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the
// pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { installDocument, elements, byTag, byClass, turn, type, click } from "./settings-pages-harness.mjs";

const document = installDocument();

const { view } = await import("../src/settings-pages/index.mjs");
const { explain } = await import("../src/site-frame/index.mjs");
const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "add-product");

// ---------------------------------------------------------------- the store and the server

class FakeStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
}
function freshStore() {
  Object.defineProperty(globalThis, "localStorage", { value: new FakeStorage(), configurable: true, writable: true });
  return openStore("fixture/instance");
}
const contextOf = (store) => ({ page: "settings", instance: { repository: "akmaier/agent-m" }, product: null, store, go() {} });

// Every request answered with `status` and `body` as JSON, for the length of `run`.
async function withAnswer(status, body, run) {
  const real = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  try { await run(); } finally { globalThis.fetch = real; }
}
const notFound = (run) => withAnswer(404, { message: "Not Found" }, run);

async function renderAddress(context, address) {
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, context, {});
  type(byClass(target, "address")[0], address);
  await turn();
  return target;
}
const stepTitled = (root, prefix) => byClass(root, "step").find((s) => (byTag(s, "h3")[0]?.textContent ?? "").startsWith(prefix));
// The notice of a missing repository: the innermost element of class result that says the repository "was not found" (the step's output element holds it).
const missingNotice = (step) => byClass(step, "result").filter((p) => /was not found/.test(p.textContent)).at(-1);
const foldedIn = (element) => elements(element, (e) => e.localName === "details");
const childIndex = (notice, match) => notice.childNodes.findIndex((n) => n.nodeType === 1 && match(n));

const GH_WEB = "https://github.com/alice/thesis-tool";
const GL_WEB = "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool";

// TST-575001 · level: unit · module: MOD-settings-pages
// guards: UC-001; EVERY STEP EXPLAINS ITSELF
// given: a fresh store and a GitHub address whose repository the server answers 404 for
// input: Check
// expect: known positive — explain("new-repository") is a folded details of class explain. The notice that names the repository as not found holds, in its own element, the link to https://github.com/new and then exactly one folded explanation as its own child, whose text is the text of explain("new-repository"); no other folded explanation stands in the notice
test("add-product — 2a: the notice of Check on a 404 carries explain('new-repository') after the link, inside its own element", async () => {
  const folded = explain("new-repository");
  assert.equal(folded.localName, "details", "known positive: explain returns a folded explanation for the topic new-repository");
  assert.equal(folded.className, "explain");
  const target = await renderAddress(contextOf(freshStore()), GH_WEB);
  const b = stepTitled(target, "Step B · Check");
  await notFound(() => click(byTag(b, "button")[0]));
  const notice = missingNotice(b);
  assert.ok(notice, "the notice names the repository as not found");
  const link = childIndex(notice, (n) => n.localName === "a" && n.href === "https://github.com/new");
  assert.ok(link >= 0, "the notice holds the link to GitHub's page for a new repository");
  const own = notice.childNodes.map((n, i) => [n, i]).filter(([n]) => n.nodeType === 1 && n.localName === "details");
  assert.equal(own.length, 1, "the notice holds exactly one folded explanation as its own child");
  assert.ok(own[0][1] > link, "the explanation stands after the link");
  assert.equal(foldedIn(notice).length, 1, "and no other folded explanation stands anywhere in the notice");
  assert.equal(own[0][0].textContent, folded.textContent, "it is the text of explain('new-repository')");
});

// TST-575002 · level: unit · module: MOD-settings-pages
// guards: UC-001; EVERY STEP EXPLAINS ITSELF
// given: a GitHub product's own token stored, and an address whose repository the server answers 404 for
// input: Add product
// expect: known positive — the topic new-repository gives a folded details. The notice in Step C that names the repository as not found holds the link to https://github.com/new and, after it, one folded explanation with the text of explain("new-repository"); no other folded explanation stands in that notice
test("add-product — 2a: the notice of Add product on a 404 carries explain('new-repository') after the link", async () => {
  assert.equal(explain("new-repository").localName, "details", "known positive: the topic new-repository gives a folded explanation");
  const store = freshStore();
  writeSetting(store, "github-token:alice/thesis-tool", { name: "fixture", expires: "2027-06-01", stored: "2026-01-01", value: "github_pat_X" });
  const target = await renderAddress(contextOf(store), GH_WEB);
  const c = stepTitled(target, "Step C · Add the product");
  await notFound(() => click(byTag(c, "button")[0]));
  const notice = missingNotice(c);
  assert.ok(notice, "the notice names the repository as not found");
  const link = childIndex(notice, (n) => n.localName === "a" && n.href === "https://github.com/new");
  const at = childIndex(notice, (n) => n.localName === "details");
  assert.ok(link >= 0 && at > link, "the explanation stands after the link to GitHub's page for a new repository");
  assert.equal(foldedIn(notice).length, 1, "it is the only folded explanation in the notice");
  assert.equal(notice.childNodes[at].textContent, explain("new-repository").textContent);
});

// TST-575003 · level: unit · module: MOD-settings-pages
// guards: UC-001; EVERY STEP EXPLAINS ITSELF
// given: a project token stored for a GitLab project address (the page then offers Check in Step B, "Give the key to Agent M"), whose project the server answers 404 for
// input: Check
// expect: known positive — the topic new-repository gives a folded details. The notice names the project as not found, links https://gitlab.rrze.fau.de/projects/new, and holds after that link one folded explanation with the text of explain("new-repository")
test("add-product — 2a: the notice of Check on a GitLab 404 links the server's new-project page and carries explain('new-repository')", async () => {
  assert.equal(explain("new-repository").localName, "details", "known positive: the topic new-repository gives a folded explanation");
  const store = freshStore();
  writeSetting(store, "gitlab-token:gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool", { name: "fixture", expires: "2027-06-01", stored: "2026-01-01", value: "glpat-X" });
  const target = await renderAddress(contextOf(store), GL_WEB);
  const b = stepTitled(target, "Step B · Give the key to Agent M");
  await notFound(() => click(byTag(b, "button").find((button) => button.textContent === "Check")));
  const notice = missingNotice(b);
  assert.ok(notice, "the notice names the project as not found");
  const link = childIndex(notice, (n) => n.localName === "a" && n.href === "https://gitlab.rrze.fau.de/projects/new");
  const at = childIndex(notice, (n) => n.localName === "details");
  assert.ok(link >= 0 && at > link, "the explanation stands after the link to the server's page for a new project");
  assert.equal(notice.childNodes[at].textContent, explain("new-repository").textContent);
});

// TST-575004 · level: unit · module: MOD-settings-pages
// guards: UC-001; EVERY STEP EXPLAINS ITSELF
// given: a fresh store and a GitHub address; the server answers 401 once, then 200 for a private repository the key can write to
// input: Check, and Check again
// expect: known positive — the topic new-repository gives a folded details. After the 401, Step B's last result begins with ✗, does not say "was not found" and holds no folded explanation; after the 200, its last result says "is reachable" and holds none either
test("add-product — a refusal other than 404, and a reachable repository, carry no explanation of a new repository", async () => {
  assert.equal(explain("new-repository").localName, "details", "known positive: the topic new-repository gives a folded explanation");
  const target = await renderAddress(contextOf(freshStore()), GH_WEB);
  const b = stepTitled(target, "Step B · Check");
  await withAnswer(401, { message: "Bad credentials" }, () => click(byTag(b, "button")[0]));
  const refusal = byClass(b, "result").at(-1);
  assert.match(refusal.textContent, /^✗/, "known positive: the result is the refusal's");
  assert.doesNotMatch(refusal.textContent, /was not found/);
  assert.deepEqual(foldedIn(refusal).map((d) => d.textContent), [], "a 401 carries no folded explanation");
  const private200 = { default_branch: "main", visibility: "private", private: true, archived: false, description: "", permissions: { push: true } };
  await withAnswer(200, private200, () => click(byTag(b, "button")[0]));
  const reachable = byClass(b, "result").at(-1);
  assert.match(reachable.textContent, /is reachable/, "known positive: the result is the reachable one");
  assert.deepEqual(foldedIn(reachable).map((d) => d.textContent), [], "a reachable repository carries no folded explanation");
});

// Add product (UC-001) — the two alternative flows ITM-132 builds: 2a, a product repository that does not exist is named and
// GitHub's page for a new repository is linked; 3a, Step A is shown as done when the stored token already reaches the product.
// Run: node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: UC-001; EVERY STEP EXPLAINS ITSELF; ONE CLICK PER DECISION
// Level: component
//
// The real dashboard (docs/assets/dashboard-app.mjs) runs in tests/app-harness.mjs, with its richDocument and press, against the
// harness's GitHub fake: the instance's repository, and the product's repository behind it. Every request is recorded; every
// click is a person's click (isTrusted). Each test states its expected result before it runs. Counter-proofs:
// docs/measurements/2026-10-01_add-product-missing-repository-and-step-a-done.md.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, press, TOKEN } from "./app-harness.mjs";

const API = "https://api.github.com";
const PRODUCT = "alice/thesis", PRODUCT_ADDR = `https://github.com/${PRODUCT}`;
const NEW_REPO = "https://github.com/new"; // GitHub's page for a new repository
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
const stored = (key) => globalThis.localStorage.getItem(key);
const addHash = (address) => `#add/${encodeURIComponent(address)}`;
const hrefs = (html) => [...String(html).matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
const STEP_A_DONE = /<h3>Step A · A key for the product — done<\/h3>/;
// Step A's instructions since the change of UC-001 (5260a64): the button to GitHub's prefilled page for a new key, no longer the
// first step of editing the old one.
const STEP_A_INSTRUCTIONS = "Open GitHub's token page (prefilled) ↗";
// Step A as the person sees it: the part the view writes into #add-step-a after a Check, else Step A as the panel first showed it
// (the harness's document keeps each element's HTML apart, where a browser shows the inner one inside the outer).
const stepA = (page) => page.el("add-step-a") || page.el("add-steps").split('<section class="step">')[1] || "";

// The instance's repository, and the product's behind it: GitHub's API under /repos/alice/thesis goes to the product's server.
// missing: GitHub answers 404 for the product — it does not exist, or it is private and the token does not reach it (GitHub
// answers both alike). privateRepo: the product is private and the token reads it. refuse: the product refuses a write (403).
async function world({ files = { "README.md": "# Thesis\n" }, missing = false, privateRepo = false, refuse = false } = {}) {
  let ps = null;
  const gone = () => (missing ? json({ message: "Not Found" }, 404) : undefined);
  const priv = (url, init) => (privateRepo && init.method === "GET" && url.pathname === `/repos/${PRODUCT}`
    ? json({ private: true, default_branch: "main" }) : undefined);
  const tree = (url, init) => (init.method === "GET" && url.pathname === `/repos/${PRODUCT}/git/trees/main`
    ? ps.fetch(`${API}/repos/${PRODUCT}/git/trees/${ps.head}?recursive=1`, init) : undefined);
  const refused = (url, init) => (refuse && init.method === "POST" && url.pathname === `/repos/${PRODUCT}/git/trees`
    ? json({ message: "Resource not accessible by personal access token" }, 403) : undefined);
  ps = await repoServer({ repo: PRODUCT, files, handlers: [gone, priv, refused, tree] });
  const seen = [];
  const srv = await repoServer({ files: { "SPEC.md": "# Agent M\n", "docs/use-cases/README.md": "# Use cases\n" },
    handlers: [
      (url, init) => { seen.push({ method: init.method, url: url.href, auth: init.headers?.Authorization ?? null }); },
      (url, init) => (url.origin === API && url.pathname.startsWith(`/repos/${PRODUCT}`) ? ps.fetch(url.href, init) : undefined),
    ] });
  return { srv, ps, seen };
}

// The Add product panel for the product's address, with a stored token (or none).
async function addPanel(w, { token = TOKEN } = {}) {
  const page = await openDashboard({ server: w.srv, hash: "", token });
  const dom = richDocument();
  await page.go(addHash(PRODUCT_ADDR));
  return { page, dom };
}
const nothingWritten = (w) => {
  assert.deepEqual(w.ps.writes, [], "nothing is written into the product");
  assert.deepEqual(w.srv.writes, [], "nothing is written into the instance");
  assert.deepEqual(w.seen.filter((r) => r.method !== "GET"), [], "no request but reads");
};

// ================================================================ 2a · the product repository does not exist yet

// Expected: Check on an address GitHub answers 404 for still names the failure on its line (4a), then names the repository as
// not found and links GitHub's page for a new repository, with a folded explanation of the choices there; Step A's
// instructions stay — a private repository the key does not reach is answered 404 alike; nothing is written.
test("UC-001 2a: Check on an address GitHub answers 404 for names the missing repository and links GitHub's page for a new repository, with a folded explanation of its choices; nothing is written", async () => {
  const w = await world({ missing: true });
  const { page, dom } = await addPanel(w);
  await press(w.srv, dom.byId("add-check-btn"));
  const out = dom.byId("add-check").innerHTML;
  assert.match(out, /^✗ alice\/thesis: 404/, "the line of 4a comes first");
  assert.match(out, /GitHub has no repository alice\/thesis that your key can see\./, "the repository is named as not found");
  assert.ok(hrefs(out).includes(NEW_REPO), "GitHub's page for a new repository is linked");
  assert.match(out, new RegExp(`<a href="${NEW_REPO}" target="_blank" rel="noopener">GitHub's page for a new repository ↗</a>`));
  assert.match(out, /<details class="explain"><summary>What is this\?<\/summary>/, "the choices there are explained, folded");
  assert.match(out, /README/, "the explanation names the first file a new repository needs");
  assert.doesNotMatch(stepA(page), STEP_A_DONE, "Step A is not done");
  assert.ok(stepA(page).includes(STEP_A_INSTRUCTIONS), "Step A's instructions stay on the page");
  nothingWritten(w);
});

// Expected (counter-proof): Check on a repository that exists shows ✓ and links no page for a new repository.
test("UC-001 2a counter-proof: Check on an existing repository links no page for a new repository", async () => {
  const w = await world();
  const { page, dom } = await addPanel(w);
  await press(w.srv, dom.byId("add-check-btn"));
  assert.match(dom.byId("add-check").innerHTML, /^✓ alice\/thesis reachable/);
  assert.ok(!hrefs(dom.byId("add-check").innerHTML).includes(NEW_REPO));
  assert.ok(!hrefs(page.el("add-steps")).includes(NEW_REPO));
  assert.ok(!hrefs(stepA(page)).includes(NEW_REPO));
});

// Expected: Add product on an address GitHub answers 404 for names the repository as not found and links GitHub's page for a new
// repository; nothing is written, the address is not kept, and Add product can be clicked again.
test("UC-001 2a: Add product on an address GitHub answers 404 for names the missing repository and links GitHub's page for a new repository; nothing is written, nothing kept", async () => {
  const w = await world({ missing: true });
  const { dom } = await addPanel(w);
  await press(w.srv, dom.byId("add-go"));
  const out = dom.byId("add-result").innerHTML;
  assert.match(out, /GitHub has no repository alice\/thesis that your key can see\./);
  assert.ok(hrefs(out).includes(NEW_REPO), "GitHub's page for a new repository is linked");
  assert.match(out, /<details class="explain"><summary>What is this\?<\/summary>/);
  nothingWritten(w);
  assert.equal(stored("agent-m.products"), null, "the address is not kept");
  assert.equal(dom.byId("add-go").disabled, false, "Add product can be clicked again");
});

// Expected (counter-proof): a write refused with 403 on a repository that exists (5a) links no page for a new repository — it
// sends the author to Step A, word for word as before.
test("UC-001 2a counter-proof: a write refused with 403 on an existing repository links no page for a new repository", async () => {
  const w = await world({ refuse: true });
  const { dom } = await addPanel(w);
  await press(w.srv, dom.byId("add-go"));
  // Narrowed between the jobs of sprint 04: the parentheses held the old Git host's answer to the commit; the refusal is now
  // MOD-repository-hosts' PermissionMissing (tests/repository-hosts.test.mjs, UC-001 5a). The page's words around it stay.
  const said = dom.byId("add-result").textContent;
  assert.ok(said.startsWith("Your key cannot write to alice/thesis yet (") &&
    said.endsWith("). Do Step A — give Agent M a key that reaches the product — and click again."), said);
  assert.ok(!hrefs(dom.byId("add-result").innerHTML).includes(NEW_REPO));
});

// ================================================================ 3a · the token already reaches the product

// Expected: the stored token reads the private product — which only a token that reaches it can —, so after Check Step A is
// shown as done, without its instructions and still with its folded What is this?; Add product is then the one remaining
// click and writes the layout.
test("UC-001 3a: a token that reaches the private product — after Check, Step A is shown as done, with its What is this?; Add product is the next and last click", async () => {
  const w = await world({ privateRepo: true });
  const { page, dom } = await addPanel(w);
  assert.ok(stepA(page).includes(STEP_A_INSTRUCTIONS), "before Check, Step A's instructions");
  await press(w.srv, dom.byId("add-check-btn"));
  assert.equal(dom.byId("add-check").innerHTML, "✓ alice/thesis reachable");
  assert.ok(w.seen.some((r) => r.url === `${API}/repos/${PRODUCT}` && r.auth === `Bearer ${TOKEN}`), "read with the stored token");
  const a = stepA(page);
  assert.match(a, STEP_A_DONE);
  // UC-001 3a: the key that already reaches the product is named — here the instance's, read with it above.
  assert.match(a, /✓ Your instance's key already reaches alice\/thesis — nothing to do on GitHub\./);
  assert.ok(!a.includes(STEP_A_INSTRUCTIONS), "no instructions for a step that is done");
  assert.match(a, /<details class="explain"><summary>What is this\?<\/summary>/, "the step still explains itself");
  nothingWritten(w);
  assert.equal(dom.byId("add-go").disabled, false);
  await press(w.srv, dom.byId("add-go"));
  assert.equal(w.ps.writes.length, 1, "one click on Add product writes the layout");
  assert.equal(stored("agent-m.products"), JSON.stringify([PRODUCT_ADDR]));
});

// Expected (counter-proof): a token that does not reach the private product — GitHub answers 404 — keeps Step A's
// instructions after Check, and Step A is not shown as done.
test("UC-001 3a counter-proof: a token that does not reach the private product keeps Step A's instructions after Check", async () => {
  const w = await world({ missing: true });
  const { page, dom } = await addPanel(w);
  await press(w.srv, dom.byId("add-check-btn"));
  assert.match(dom.byId("add-check").innerHTML, /^✗ alice\/thesis/);
  assert.doesNotMatch(stepA(page), STEP_A_DONE);
  assert.ok(stepA(page).includes(STEP_A_INSTRUCTIONS), "Step A's instructions, shown again");
});

// Expected: a public product is read by any token, so a successful Check proves nothing about the key's reach (UC-001 step 4:
// write access is confirmed at the next step) — Step A keeps its instructions and is not shown as done.
test("UC-001 3a: a public product's Check proves nothing about the key — Step A keeps its instructions", async () => {
  const w = await world();
  const { page, dom } = await addPanel(w);
  await press(w.srv, dom.byId("add-check-btn"));
  assert.equal(dom.byId("add-check").innerHTML, "✓ alice/thesis reachable — public, so write access is confirmed only by the first write");
  assert.doesNotMatch(stepA(page), STEP_A_DONE);
  assert.ok(stepA(page).includes(STEP_A_INSTRUCTIONS), "Step A's instructions, unchanged");
});

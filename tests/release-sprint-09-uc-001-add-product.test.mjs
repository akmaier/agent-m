// Release coverage of UC-001 through the dashboard's real #add route.
// Module: MOD-settings-pages
// Guards: UC-001; EVERY STEP EXPLAINS ITSELF; A MANAGED PRODUCT NEEDS NO PAGES SITE; ONE REVIEW LAYOUT FOR EVERY PRODUCT; THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; EVERY PRODUCT HAS ITS OWN VERSION LINE; CONFIGURATION LIVES IN THE BROWSER; THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN; THE TOKEN LINK IS PREFILLED; THE REPOSITORY CHOICE IS SPELLED OUT; ONE GITHUB TOKEN SERVES EVERY FEATURE; A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT; A TOKEN IS SCOPED TO WHAT IT WRITES; THE SHARED PAGES ORIGIN IS DISCLOSED; THE PAGE STATES WHAT IT SENDS WHERE; A PRODUCT IS NAMED BY ITS ADDRESS; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
// Level: release

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, press, settle, REPO, TOKEN } from "./app-harness.mjs";

const PRODUCT = "alice/thesis-tool";
const GH = `https://github.com/${PRODUCT}`;
const GL = "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool";
const API = "https://api.github.com";
const PREFIX = `agent-m:${REPO}:`;
const PRODUCT_TOKEN = "github_pat_RELEASE0010123456789";
const textOf = (html) => String(html).replace(/<[^>]*>/g, " ").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

async function page(address) {
  const server = await repoServer({ files: {} });
  await openDashboard({ server, hash: "#add" });
  const main = richDocument().byId("main");
  const input = main.querySelector("input.address");
  input.value = address;
  input.fire("input", { isTrusted: true });
  return main;
}

async function releaseWorld() {
  const requests = [];
  const product = await repoServer({ repo: PRODUCT, files: { "README.md": "# Product\n" }, handlers: [
    (url) => url.pathname === `/repos/${PRODUCT}`
      ? new Response(JSON.stringify({ visibility: "public", private: false, default_branch: "main", permissions: { push: true } }), { headers: { "Content-Type": "application/json" } })
      : undefined,
  ] });
  const instance = await repoServer({ files: {}, handlers: [
    (url, init) => {
      requests.push({ url: url.href, authorization: new Headers(init.headers ?? {}).get("Authorization") });
      return url.origin === API && url.pathname.startsWith(`/repos/${PRODUCT}`) ? product.fetch(url.href, init) : undefined;
    },
  ] });
  return { instance, product, requests };
}

async function addProduct(world) {
  await openDashboard({ server: world.instance, hash: "#add" });
  const main = richDocument().byId("main"), address = main.querySelector("input.address");
  address.value = GH; address.fire("input", { isTrusted: true });
  const ack = main.querySelector("input.ack"), token = main.querySelector("input.token");
  ack.checked = true; ack.fire("change", { isTrusted: true }); token.value = PRODUCT_TOKEN;
  await press(world.instance, main.querySelector("button.store"));
  return main;
}

// TST-283
// Module: MOD-settings-pages
// Guards: UC-001; EVERY STEP EXPLAINS ITSELF; A MANAGED PRODUCT NEEDS NO PAGES SITE; ONE REVIEW LAYOUT FOR EVERY PRODUCT; THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; EVERY PRODUCT HAS ITS OWN VERSION LINE; CONFIGURATION LIVES IN THE BROWSER; THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN; THE TOKEN LINK IS PREFILLED; THE REPOSITORY CHOICE IS SPELLED OUT; ONE GITHUB TOKEN SERVES EVERY FEATURE; A GITHUB PRODUCT USES A TOKEN OF ITS OWN; A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT; A TOKEN IS SCOPED TO WHAT IT WRITES; THE SHARED PAGES ORIGIN IS DISCLOSED; THE PAGE STATES WHAT IT SENDS WHERE; A PRODUCT IS NAMED BY ITS ADDRESS; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// Level: release
// given: an instance dashboard, a GitHub product address and a GitLab product address
// input: type each address in the actual Add product route
// expect: server-specific key steps disclose the required scope, storage, destinations, layout and GitLab project-token route before any credential can be stored
test("TST-283 UC-001 release disclosure covers GitHub and GitLab product routes", async () => {
  const gh = await page(GH);
  const ghText = textOf(gh.innerHTML);
  assert.match(ghText, /Open GitHub's token page \(prefilled\)/);
  assert.match(ghText, /Only select repositories/);
  assert.match(ghText, /alice\/thesis-tool.*nothing else/);
  const tokenLink = gh.querySelector("a");
  const prefilled = new URL(tokenLink.href).searchParams;
  assert.equal(prefilled.get("name"), "Agent M · alice/thesis-tool");
  assert.equal(prefilled.get("description"), "Agent M for the product alice/thesis-tool: reviews, commits, issues, pull requests and runs of the work you start in it.");
  assert.equal(prefilled.get("target_name"), "alice", "the product owner scopes the token page");
  assert.equal(prefilled.get("expires_in"), "90");
  assert.deepEqual(Object.fromEntries([...prefilled].filter(([key]) => !["name", "description", "target_name", "expires_in"].includes(key))), {
    contents: "write", issues: "write", pull_requests: "write", actions: "write", workflows: "write", metadata: "read",
  }, "the prefilled product token grants every and only UC-014 feature permission");
  assert.match(gh.querySelector("input.expires").value, /^\d{4}-\d\d-\d\d$/, "the pasted token has an expiry date to confirm");
  assert.match(ghText, /kept in this browser for this product only/i);
  assert.match(ghText, /sent only to GitHub's API/i);
  assert.match(ghText, /akmaier\.github\.io/);
  assert.match(ghText, /missing review layout.*default branch/i);
  assert.match(ghText, /nothing is written to the instance repository/i);
  assert.ok((gh.innerHTML.match(/What is this\?/g) ?? []).length >= 5, "address, both key steps and all three product-list/commit explanations are folded");

  const gl = await page(GL);
  const glText = textOf(gl.innerHTML);
  assert.match(glText, /Create a key for this project/);
  assert.match(glText, /Settings → Access tokens/);
  assert.match(glText, /Maintainer/);
  assert.match(glText, /scope: api/);
  assert.match(glText, /personal access token would also work, but it is broader/i);
  assert.match(glText, /only to this project's own API/i);
  assert.match(glText, /never to GitHub/i);
});

// TST-286
// Module: MOD-settings-pages
// Guards: UC-001; ONE CLICK PER DECISION; ADDING A PRODUCT CREATES ITS LAYOUT; THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// Level: release
// given: a browser with its instance token and a public GitHub product containing no review layout
// input: store the product token, fire a synthetic Add product event, then make one trusted Add product click
// expect: only the trusted click writes the complete missing layout and canonical browser list; the instance repository remains untouched
test("TST-286 UC-001 release transaction guards product writes and browser state", async () => {
  const synthetic = await releaseWorld();
  let main = await addProduct(synthetic);
  main.querySelector("button.add").fire("click", { isTrusted: false });
  await settle(synthetic.instance);
  assert.equal(synthetic.product.writes.length, 0, "a synthetic event cannot write the product layout");
  assert.equal(globalThis.localStorage.getItem(`${PREFIX}products`), null, "a synthetic event cannot change the product list");

  const trusted = await releaseWorld();
  main = await addProduct(trusted);
  await press(trusted.instance, main.querySelector("button.add"));
  assert.equal(trusted.product.writes.length, 1, "one trusted decision creates one layout commit");
  for (const path of ["docs/use-cases/README.md", "docs/architecture/README.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "SPEC.md", "CHANGELOG.md"])
    assert.ok(trusted.product.files[path], `the product receives required review-layout part ${path}`);
  assert.match(trusted.product.files["docs/use-cases/README.md"], /status is derived from the approval records/i, "the layout is self-sufficient rather than a product-site placeholder");
  assert.match(trusted.product.files["CHANGELOG.md"], /Changelog of alice\/thesis-tool/, "the product gets its own version line");
  assert.equal(trusted.product.files["README.md"], "# Product\n", "the existing product content is preserved");
  assert.ok(!Object.keys(trusted.product.files).some((path) => /CNAME|pages|\.github\/workflows/i.test(path)), "adding the review layout creates no product Pages-site setup");
  assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}products`)), [GH], "the dashboard keeps only the product address in this browser");
  assert.equal(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}github-token:${PRODUCT}`)).value, PRODUCT_TOKEN, "the canonical browser store keeps the product key with its product address");
  assert.ok(trusted.requests.filter((request) => request.url.includes(`/repos/${PRODUCT}`)).every((request) => request.authorization === `Bearer ${PRODUCT_TOKEN}`), "the product credential is sent only on product API requests");
  assert.ok(!trusted.requests.some((request) => request.authorization === `Bearer ${TOKEN}` && request.url.includes(`/repos/${PRODUCT}`)), "the instance key is absent from product requests");
  assert.deepEqual(trusted.instance.writes, [], "the instance repository is never named or written during Add product");
  assert.equal(globalThis.localStorage.getItem("agent-m.github-token"), TOKEN, "the instance credential remains distinct from the product credential");
});

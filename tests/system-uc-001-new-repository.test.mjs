// System coverage of UC-001 2a through the dashboard's real #add route: "The product repository does not exist yet. Agent M says so and links GitHub's page for a new repository,
// with a folded explanation of the choices there; the author returns and continues at step 2." The notice of the missing repository carries the explanation of the choices on that
// page (ITM-575), and it goes away with the 404.
// Run: node --test tests/system-uc-001-new-repository.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-001; EVERY STEP EXPLAINS ITSELF
// Level: system
//
// The dashboard is the real one behind tests/app-harness.mjs, as in tests/system-uc-001-add-product.test.mjs; the product's server answers 404 for its repository while the case says
// it is missing. The harness cannot sanitise HTML, so the page's innerHTML shows a folded explanation as <details class="explain"> around the rendered topic's source. Each test
// states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, press } from "./app-harness.mjs";

const API = "https://api.github.com";
const PRODUCT = "alice/thesis-tool";
const WEB = `https://github.com/${PRODUCT}`;
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function world(missing) {
  const product = await repoServer({ repo: PRODUCT, files: { "README.md": "# Thesis tool\n" }, handlers: [
    (url) => {
      if (missing.value) return json({ message: "Not Found" }, 404);
      if (url.pathname === `/repos/${PRODUCT}`) return json({ private: false, visibility: "public", default_branch: "main", permissions: { push: true } });
      return undefined;
    },
  ] });
  const instance = await repoServer({ files: {}, handlers: [
    (url, init) => (url.origin === API && url.pathname.startsWith(`/repos/${PRODUCT}`) ? product.fetch(url.href, init) : undefined),
  ] });
  return { instance, product };
}

async function addPage(w) {
  await openDashboard({ server: w.instance, hash: "#add" });
  const main = richDocument().byId("main");
  const address = main.querySelector("input.address");
  address.value = WEB;
  address.fire("input", { isTrusted: true });
  return main;
}

// TST-575008 · level: system · module: MOD-settings-pages
// guards: UC-001 2a; EVERY STEP EXPLAINS ITSELF
// given: the instance's token and a product repository the server answers 404 for
// input: the actual Check control
// expect: the page names the repository as not found; inside the same paragraph, after the link to https://github.com/new, one folded explanation (details of class explain) opens, and no paragraph closes between the notice's beginning and it; its text names a private repository and what a product should not publish; after the repository is created, Check says it is reachable and the folded explanation is not in that notice
test("TST-575008 UC-001 2a the notice of a missing repository carries the folded explanation of the choices on the new-repository page", async () => {
  const missing = { value: true };
  const w = await world(missing);
  const main = await addPage(w);
  await press(w.instance, main.querySelector("button.check"));
  const html = main.innerHTML;
  const start = html.indexOf("was not found");
  assert.ok(start >= 0, "known positive: the page names the repository as not found");
  const link = html.indexOf("Create it on the server's page for a new repository", start);
  assert.ok(link > start, "known positive: the notice links the server's page for a new repository");
  const opening = html.indexOf('<details class="explain">', link);
  assert.ok(opening > link, "a folded explanation opens after the link");
  assert.ok(!html.slice(start, opening).includes("</p>"), "no paragraph closes between the notice's beginning and the explanation: it is inside the notice's own element");
  const end = html.indexOf("</details>", opening);
  const explanation = html.slice(opening, end);
  assert.match(explanation, /<summary>What is this\?<\/summary>/, "it is the shared What is this?");
  assert.match(explanation, /private repository/, "it names a private repository");
  assert.match(explanation, /should not publish/, "it names what a product should not publish");

  missing.value = false;
  await press(w.instance, main.querySelector("button.check"));
  const after = main.innerHTML;
  const reachable = after.indexOf("is reachable");
  assert.ok(reachable >= 0, "known positive: after the repository exists, Check says it is reachable");
  assert.ok(after.indexOf("</p>", reachable) > reachable, "known positive: the reachable notice's paragraph closes");
  assert.ok(!after.slice(reachable, after.indexOf("</p>", reachable)).includes("<details"), "the reachable notice carries no folded explanation");
  assert.ok(!after.includes("Create it on the server's page for a new repository"), "the notice of a missing repository is gone");
});

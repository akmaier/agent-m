// The product list's Change on the Settings page opens Add a product in place (UC-042 step 3).
// Run: node --test tests/system-uc-042-product-list-in-place.test.mjs
//
// Module: MOD-settings-pages · MOD-site-frame
// Level: system
// Guards: UC-042; UC-001; EVERY SETTING IS REACHED FROM ONE PAGE; A FORM OPENS WITH ITS FIRST FIELD FOCUSED
//
// The dashboard runs in the existing harness; the product repository's replies come from a controlled in-process handler.
// No server is called.

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, press, repoServer, richDocument } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const prefix = `agent-m:${INSTANCE}:`;
const PRODUCT = "alice/thesis-tool", WEB = `https://github.com/${PRODUCT}`;
const HEAD = "a".repeat(40);
const LAYOUT = ["docs/use-cases/README.md", "docs/architecture/README.md", "docs/approvals/README.md",
  "docs/spec-freigaben/README.md", "SPEC.md", "CHANGELOG.md"];

// GitHub's replies for the product repository, its review layout complete; null for every other request.
async function productRepository(url) {
  if (url.origin !== "https://api.github.com") return null;
  const replies = {
    [`/repos/${PRODUCT}`]: { default_branch: "main", visibility: "private", private: true, archived: false, description: "",
      permissions: { push: true } },
    [`/repos/${PRODUCT}/commits/main`]: { sha: HEAD, commit: { tree: { sha: "b".repeat(40) } } },
    [`/repos/${PRODUCT}/git/trees/${HEAD}`]: { sha: HEAD, truncated: false,
      tree: LAYOUT.map((path) => ({ path, type: "blob", sha: "e".repeat(40) })) },
  };
  return url.pathname in replies
    ? new Response(JSON.stringify(replies[url.pathname]), { status: 200, headers: { "Content-Type": "application/json" } })
    : null;
}

// TST-290131
// Module: MOD-settings-pages → MOD-site-frame
// Level: system
// Guards: UC-042 (step 3); UC-001; EVERY SETTING IS REACHED FROM ONE PAGE; A FORM OPENS WITH ITS FIRST FIELD FOCUSED
// Precondition: Settings is open in a dashboard browser that keeps a product list and a product's own token.
// Input: the author opens Repositories, presses Add or remove products, types the product's address, presses Add product,
//        then Switch to the new product.
// Expected: the page stays at #settings with Add a product open in it and its address field focused; after the add, Switch
//           to the new product selects the new product.
test("TST-290131: Add or remove products opens Add a product in place on the Settings page", async () => {
  const server = await repoServer({ files: {}, handlers: [productRepository] });
  const page = await openDashboard({ server, hash: "#uc", entries: {
    [`${prefix}products`]: JSON.stringify(["https://github.com/alice/other-tool"]),
    [`${prefix}github-token:${PRODUCT}`]: JSON.stringify({ value: "github_pat_PRODUCT0123456789", name: "Agent M", expires: "2027-06-01" }),
  } });
  const dom = richDocument();
  const main = dom.byId("main"); let mounted = [];
  const replace = main.replaceChildren.bind(main); main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  await page.go("#settings");
  const pane = mounted.find((node) => node.className === "settings-tab-panel" && node.textContent.startsWith("Repositories ·"));
  const change = pane?.querySelectorAll("button.settings-repository-change").find((button) => button.textContent === "Add or remove products");
  assert.ok(change, "the Repositories pane holds the product list's Change");

  await press(server, change);
  assert.equal(globalThis.location.hash, "#settings", "failure node: Add or remove products stays on the Settings page");
  const address = main.querySelector("input.address");
  assert.ok(address, "Add a product opens in place");
  assert.equal(dom.focused(), address, "its address field is focused");

  address.value = WEB;
  address.dispatchEvent(new Event("input"));
  await press(server, main.querySelector("button.add"));
  await press(server, main.querySelector("button.switch"));
  assert.equal(new URLSearchParams(globalThis.location.search).get("repo"), PRODUCT, "Switch to the new product selects it");
});

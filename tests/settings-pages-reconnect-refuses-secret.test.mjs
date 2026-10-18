// A host the Settings page connects again still refuses a commit that holds a stored secret (ITM-868). The real app
// (src/site-frame/dashboard-app.mjs) runs in tests/app-harness.mjs on a product's pages (?repo=alice/thesis), against two GitHub fakes:
// the instance's, and a second repoServer for the product that the instance's server hands the product's requests to. This browser
// stores a model endpoint whose key is SECRET, the instance's GitHub token and the product's own token. The person opens Settings,
// goes through one of the places where the page connects its hosts again with what the store holds, without a reload:
//   - ITM-825: Clear on the line of the GitHub token;
//   - ITM-853: Remove on a product of the list; Clear on the line of the list of products; Change, notice, paste and Save on the line of
//     the GitHub token;
//   - ITM-860: Store and check on the add-product form opened in place;
// and then commits a text that holds SECRET through each host the page holds: the product's, with a collaborator named SECRET
// (Save collaborator commits docs/collaborators.md to the product), and the instance's, with the switch of recording conversations
// (Save commits docs/conversation-recording.md to the instance, a text the page fixes: its front matter line `recording: on`).
// Run: node --test tests/settings-pages-reconnect-refuses-secret.test.mjs
//
// Module: MOD-settings-pages
// Guards: NO SECRET IN THE REPOSITORY
// Level: component
//
// The expected results are written here from NO SECRET IN THE REPOSITORY ("No API key, access token or endpoint credential is written
// into a repository managed by Agent M") and from the sentence of MOD-repository-hosts' `commitFiles` that a file whose text holds a
// configured secret refuses the whole commit with `SecretRefused` and writes nothing; none is read from a document when a test runs.
// A key stored as the key of a model endpoint is such a credential. After each of the places above, the commit of a text that holds
// it is refused as `SecretRefused` (on either host: the message the page shows in its result line, which names the file and says that
// it holds a configured secret) and no write request reaches either server. The known positives
// (AGENTS.md 6a.2): after each of the places, a collaborator named "Alice Example", whose name holds no secret, is committed to the
// product (one write, with that name); and where no endpoint key is stored, the switch of recording conversations is saved to the
// instance after a place (one write, with `recording: on`). The instance's text is fixed by the page, so SECRET is the value
// `recording: on`, a part of that text; it is the key of the endpoint.
// The callers read first (AGENTS.md 6a.1): tests/settings-pages-product-token-followed.test.mjs (TST-853001 to TST-853003) and
// tests/settings-pages-stored-token-followed.test.mjs (TST-860001) open the live Settings page on a product's pages in this harness
// and go through these places; this file copies their pattern (the helpers are written again here: a test file imports no other test
// file). The frame's own connection passes `secrets: secretValues(store)` (src/site-frame/routing.mjs, chosenProduct). The counter-
// proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard, richDocument, press, settle, TOKEN } from "./app-harness.mjs";

const API = "https://api.github.com";
const PREFIX = "agent-m:akmaier/agent-m:";
const PRODUCT = "alice/thesis", PRODUCT_ADDRESS = `https://github.com/${PRODUCT}`;
const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghij";
const NEW_TOKEN = "github_pat_NEWER0123456789abcdefghijk";
const SECRET = "recording: on";
const FILES = {
  "docs/use-cases/UC-001-read-a-file.md": "---\nid: UC-001\ntitle: Read a file\narea: 1\nactors:\n  - Reader\nrealises: []\n---\n# UC-001 Read a file\n",
  "docs/use-cases/README.md": "# Use cases\n",
  "docs/approvals/README.md": "# Approval records\n",
};
const controls = (root, name, out = []) => { for (const child of root?.children ?? []) { if (typeof child !== "object") continue; if (child.className?.split(" ").includes(name)) out.push(child); controls(child, name, out); } return out; };
const stored = (token, name) => JSON.stringify({ value: token, name, expires: null, stored: "2026-10-18" });
const lineOf = (root, title) => controls(root, "settings-repository").find((node) => node.children[0]?.textContent === title);
const productsLine = (root) => controls(root, "settings-repository").find((node) => node.textContent.includes("Product addresses are stored"));

// The live page on the product's pages, then Settings drawn, with `secret` stored as the key of the endpoint ep1 (null: none), the
// instance's token and the product's own token. The product's server answers GET /repos/alice/thesis with push permission, so that the
// page offers to write. -> the instance's server, the product's server, and the Settings page's nodes.
async function settingsOpen({ secret = SECRET } = {}) {
  let product = null;
  const tree = (url, init) => (init.method === "GET" && url.pathname === `/repos/${PRODUCT}/git/trees/main`
    ? product.fetch(`${API}/repos/${PRODUCT}/git/trees/${product.head}?recursive=1`, init) : undefined);
  const info = (url, init) => (init.method === "GET" && url.pathname === `/repos/${PRODUCT}`
    ? new Response(JSON.stringify({ default_branch: "main", private: true, visibility: "private", archived: false, description: "", permissions: { push: true } }), { status: 200, headers: { "Content-Type": "application/json" } })
    : undefined);
  product = await repoServer({ repo: PRODUCT, files: FILES, handlers: [info, tree] });
  const forward = (url, init) => (url.origin === API && url.pathname.startsWith(`/repos/${PRODUCT}`) ? product.fetch(url.href, init) : undefined);
  const srv = await repoServer({ files: FILES, handlers: [forward] });
  const entries = {
    [`${PREFIX}products`]: JSON.stringify([PRODUCT_ADDRESS]),
    [`${PREFIX}endpoint:ep1`]: JSON.stringify({ kind: "openai-compatible", url: "https://models.example/v1", model: "model-a", key: secret }),
    [`${PREFIX}github-token`]: stored(TOKEN, "GitHub token"),
    [`${PREFIX}github-token:${PRODUCT}`]: stored(PRODUCT_TOKEN, "Agent M"),
  };
  const page = await openDashboard({ server: srv, search: `?repo=${encodeURIComponent(PRODUCT)}`, hash: "#uc", token: TOKEN, entries, caches: fakeCaches() });
  const dom = richDocument(), createElement = globalThis.document.createElement.bind(globalThis.document), main = dom.byId("main"), replace = main.replaceChildren.bind(main);
  let mounted = [];
  globalThis.document.createElement = (name) => {
    const node = createElement(name);
    if (!("childNodes" in node)) Object.defineProperty(node, "childNodes", { get: () => node.children ?? [] });
    return node;
  };
  main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  globalThis.confirm = () => true;
  await page.go("#settings");
  return { srv, product, nodes: () => ({ children: mounted }) };
}

// The places where the page connects its hosts again. Each takes the page and does what a person does there, without a reload.
const PLACES = {
  async "Clear on the line of the GitHub token"({ srv, nodes }) { // ITM-825
    await press(srv, controls(lineOf(nodes(), "GitHub token"), "settings-repository-clear")[0]);
    assert.equal(globalThis.localStorage.getItem(`${PREFIX}github-token`), null, "the GitHub token is gone from localStorage");
  },
  async "Remove on a product of the list"({ srv, nodes }) { // ITM-853
    await press(srv, controls(nodes(), "settings-product-remove")[0]);
    assert.equal(globalThis.localStorage.getItem(`${PREFIX}github-token:${PRODUCT}`), null, "the product's own token is gone from localStorage");
  },
  async "Clear on the line of the list of products"({ srv, nodes }) { // ITM-853
    await press(srv, controls(productsLine(nodes()), "settings-repository-clear")[0]);
    assert.equal(globalThis.localStorage.getItem(`${PREFIX}products`), null, "the list of products is gone from localStorage");
  },
  async "Save on the line of the GitHub token"({ srv, nodes }) { // ITM-853
    const line = () => lineOf(nodes(), "GitHub token");
    await press(srv, controls(line(), "settings-repository-change")[0]);
    const acknowledgement = controls(line(), "settings-repository-ack")[0], secret = controls(line(), "settings-repository-secret")[0];
    acknowledgement.checked = true; acknowledgement.fire("change", {});
    secret.value = NEW_TOKEN;
    await press(srv, controls(line(), "settings-repository-save")[0]);
    assert.equal(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}github-token`))?.value, NEW_TOKEN, "Save stored the new token");
  },
  async "Store and check on the add-product form in place"({ srv, nodes }) { // ITM-860
    await press(srv, controls(productsLine(nodes()), "settings-repository-change")[0]);
    const address = controls(nodes(), "address")[0];
    address.value = PRODUCT_ADDRESS;
    await address.fire("input", {});
    const acknowledgement = controls(nodes(), "ack")[0], secret = controls(nodes(), "token")[0];
    acknowledgement.checked = true; await acknowledgement.fire("change", {});
    secret.value = NEW_TOKEN;
    await press(srv, controls(nodes(), "store")[0]);
    assert.equal(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}github-token:${PRODUCT}`))?.value, NEW_TOKEN, "Store and check stored the new token under the product's key");
  },
};

const byResult = (nodes) => controls(nodes(), "settings-collaborator-result")[0].textContent;

// Save a collaborator named `name` through the product host the page holds. -> the error the press rejects with, or null.
async function collaborate(nodes, name) {
  controls(nodes(), "settings-collaborator-name")[0].value = name;
  controls(nodes(), "settings-collaborator-account")[0].value = "alice";
  controls(nodes(), "settings-collaborator-agreed")[0].checked = true;
  try { await controls(nodes(), "settings-collaborator-save")[0].fire("click", { isTrusted: true }); return null; } catch (error) { return error; }
}

// The writes of a server that carry `text` in a file.
const writtenWith = (server, text) => server.writes.filter((write) => Object.values(write.files).some((file) => file.includes(text)));

async function productRefuses(place) {
  const page = await settingsOpen();
  assert.equal(controls(page.nodes(), "settings-collaborator-save").length, 1, "the page offers Save collaborator: the product is writable");
  await PLACES[place](page);
  const refused = await collaborate(page.nodes, SECRET);
  await settle(page.srv);
  assert.equal(refused, null, `the press of Save collaborator does not reject (it rejected with ${refused?.name})`);
  const shown = byResult(page.nodes);
  assert.equal(/docs\/collaborators\.md holds a configured secret — nothing was written/.test(shown), true, `the commit of a collaborator named by the stored secret is refused, and the result line says so (it says: ${shown})`);
  assert.deepEqual(page.product.writes.map((write) => write.message), [], "nothing was written to the product");
  const accepted = await collaborate(page.nodes, "Alice Example");
  await settle(page.srv);
  assert.equal(accepted, null, "a collaborator whose name holds no secret is committed");
  assert.equal(page.product.writes.length, 1, "one write reached the product");
  assert.equal(writtenWith(page.product, "Alice Example").length, 1, "the write holds the collaborator's name");
  assert.equal(writtenWith(page.product, SECRET).length, 0, "no write holds the stored secret");
}

// Save the switch of recording conversations through the instance host the page holds. -> the page's result line.
async function record({ srv, nodes }) {
  const tab = controls(nodes(), "settings-tab").find((node) => node.textContent === "Repositories");
  await press(srv, tab);
  await press(srv, controls(nodes(), "settings-recording-on")[0]);
  const acknowledgement = controls(nodes(), "settings-recording-ack")[0];
  acknowledgement.checked = true; acknowledgement.fire("change", {});
  await press(srv, controls(nodes(), "settings-recording-save")[0]);
  return controls(nodes(), "settings-recording-result")[0].textContent;
}

async function instanceRefuses(place) {
  const page = await settingsOpen();
  await PLACES[place](page);
  const result = await record(page);
  assert.equal(/holds a configured secret/.test(result), true, `the page says the commit holds a configured secret (it says: ${result})`);
  assert.deepEqual(page.srv.writes.map((write) => write.message), [], "nothing was written to the instance");
}

// TST-868001 to TST-868005: one for each place, the product's host.
// level: component
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: the live page on a GitHub product's pages that has drawn Settings, SECRET stored as the key of the endpoint ep1, the instance's token and the product's own token stored
// input: go through the place named, then save a collaborator named SECRET, then one named "Alice Example"
// expect: the first press resolves, the result line says docs/collaborators.md holds a configured secret and nothing was written, and nothing is written; the second is written, once, with that name, and no write holds SECRET
test("TST-868001 · after Clear on the line of the GitHub token, the product host refuses a commit that holds a stored secret", async () => {
  await productRefuses("Clear on the line of the GitHub token");
});
test("TST-868002 · after Remove on a product of the list, the product host refuses a commit that holds a stored secret", async () => {
  await productRefuses("Remove on a product of the list");
});
test("TST-868003 · after Clear on the line of the list of products, the product host refuses a commit that holds a stored secret", async () => {
  await productRefuses("Clear on the line of the list of products");
});
test("TST-868004 · after Save on the line of the GitHub token, the product host refuses a commit that holds a stored secret", async () => {
  await productRefuses("Save on the line of the GitHub token");
});
test("TST-868005 · after Store and check on the add-product form in place, the product host refuses a commit that holds a stored secret", async () => {
  await productRefuses("Store and check on the add-product form in place");
});

// TST-868006 to TST-868010: one for each place, the instance's host.
// level: component
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: the same page
// input: go through the place named, then press Switch on of recording conversations on the Repositories tab, tick I have read this, press Save
// expect: the page says the commit holds a configured secret, and nothing is written to the instance
test("TST-868006 · after Clear on the line of the GitHub token, the instance host refuses a commit that holds a stored secret", async () => {
  await instanceRefuses("Clear on the line of the GitHub token");
});
test("TST-868007 · after Remove on a product of the list, the instance host refuses a commit that holds a stored secret", async () => {
  await instanceRefuses("Remove on a product of the list");
});
test("TST-868008 · after Clear on the line of the list of products, the instance host refuses a commit that holds a stored secret", async () => {
  await instanceRefuses("Clear on the line of the list of products");
});
test("TST-868009 · after Save on the line of the GitHub token, the instance host refuses a commit that holds a stored secret", async () => {
  await instanceRefuses("Save on the line of the GitHub token");
});
test("TST-868010 · after Store and check on the add-product form in place, the instance host refuses a commit that holds a stored secret", async () => {
  await instanceRefuses("Store and check on the add-product form in place");
});

// TST-868011
// level: component
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: the same page, but no endpoint key stored
// input: Change, notice, paste and Save on the line of the GitHub token, then press Switch on of recording conversations on the Repositories tab, tick I have read this, press Save
// expect: the page says "Saved in the instance repository.", and one write reaches the instance, holding `recording: on` (the known positive of TST-868006 to TST-868010)
test("TST-868011 · after Save on the line of the GitHub token, with no secret stored, the instance host commits the switch of recording conversations", async () => {
  const page = await settingsOpen({ secret: null });
  await PLACES["Save on the line of the GitHub token"](page);
  const result = await record(page);
  assert.equal(result, "Saved in the instance repository.", "the page says it saved");
  assert.equal(page.srv.writes.length, 1, "one write reached the instance");
  assert.equal(writtenWith(page.srv, "recording: on").length, 1, "the write holds the switch");
});

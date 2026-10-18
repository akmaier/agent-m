// A product token stored on the add-product page opened in place on the Settings page is used by the open page (ITM-860). The real app
// (src/site-frame/dashboard-app.mjs) runs in tests/app-harness.mjs on a product's pages (?repo=alice/thesis), against two GitHub fakes:
// the instance's, and a second repoServer for the product that the instance's server hands the product's requests to. A handler of
// the test records the headers of every request without answering it. The person opens Settings, which reads the product with the
// token the page holds for it (the product's own, else the instance's), opens the form *Add or remove products* in place, enters the
// product's address, ticks the notice, pastes a token and presses Store and check, and then makes the next page action without a
// reload: clears a model endpoint on its line, which draws Settings again and reads the product through the host the page holds.
// Run: node --test tests/settings-pages-stored-token-followed.test.mjs
//
// Module: MOD-settings-pages
// Guards: A CLEAR IS A REAL CLEAR
// Guards: A GITHUB PRODUCT USES A TOKEN OF ITS OWN
// Level: component
//
// The expected results are written here from A GITHUB PRODUCT USES A TOKEN OF ITS OWN ("after *Store and check* the product is read with
// that token while the instance's token is unchanged"), from A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT (a token leaves the browser
// only as the authorisation header of requests to its server) and from A CLEAR IS A REAL CLEAR (what the page holds follows what the
// browser stores); none is read from a document. A token that was stored is the credential the page holds: the next request to its
// server carries it, and the instance's token, which the product was read with while it had none of its own, is no longer sent to it.
// The callers read first (AGENTS.md 6a.1): tests/settings-pages-product-token-followed.test.mjs (TST-853001 to TST-853003) opens the
// live Settings page on a product's pages in this harness and records the product's requests; this file copies its pattern. The
// button that opens the form in place and the form's own controls are found by their classes (`settings-repository-change` on the line
// of the list of products; `address`, `ack`, `token`, `store` of the form), as src/settings-pages/settings.mjs and products.mjs name
// them. The next page action that reads the product without storing or clearing a token is *Clear* on the line of a model endpoint
// (`settings-endpoint-clear`), which draws the page again through the page's own context (src/settings-pages/settings.mjs, endpointLine).
// The helpers are written again here: a test file imports no other test file.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard, richDocument, press, settle, TOKEN } from "./app-harness.mjs";

const API = "https://api.github.com";
const PREFIX = "agent-m:akmaier/agent-m:";
const PRODUCT = "alice/thesis", PRODUCT_ADDRESS = `https://github.com/${PRODUCT}`;
const NEW_PRODUCT_TOKEN = "github_pat_PRODUCTNEW0123456789abcdefg";
const FILES = {
  "docs/use-cases/UC-001-read-a-file.md": "---\nid: UC-001\ntitle: Read a file\narea: 1\nactors:\n  - Reader\nrealises: []\n---\n# UC-001 Read a file\n",
  "docs/use-cases/README.md": "# Use cases\n",
  "docs/approvals/README.md": "# Approval records\n",
};
const controls = (root, name, out = []) => { for (const child of root?.children ?? []) { if (typeof child !== "object") continue; if (child.className?.split(" ").includes(name)) out.push(child); controls(child, name, out); } return out; };
const carrying = (requests, secret) => requests.filter((request) => request.headers.includes(secret)).map((request) => request.what);
const lineOf = (root, text) => controls(root, "settings-repository").find((node) => node.textContent.includes(text));

// The live page on the product's pages, then Settings drawn, with the model endpoint ep1 stored. `instanceToken`: the instance's GitHub
// token stored, or null; the product has no token of its own. -> the instance's server, the record of every request (what it was, and
// its headers as text), and the Settings page's nodes.
async function settingsOpen({ instanceToken }) {
  const sent = [];
  const spy = (url, init) => { sent.push({ what: `${init.method} ${url.origin}${url.pathname}`, headers: JSON.stringify(init.headers ?? {}) }); return undefined; };
  let product = null;
  const tree = (url, init) => (init.method === "GET" && url.pathname === `/repos/${PRODUCT}/git/trees/main`
    ? product.fetch(`${API}/repos/${PRODUCT}/git/trees/${product.head}?recursive=1`, init) : undefined);
  product = await repoServer({ repo: PRODUCT, files: FILES, handlers: [tree] });
  const forward = (url, init) => (url.origin === API && url.pathname.startsWith(`/repos/${PRODUCT}`) ? product.fetch(url.href, init) : undefined);
  const srv = await repoServer({ files: FILES, handlers: [spy, forward] });
  const entries = {
    [`${PREFIX}products`]: JSON.stringify([PRODUCT_ADDRESS]),
    [`${PREFIX}endpoint:ep1`]: JSON.stringify({ kind: "openai-compatible", url: "https://models.example/v1", model: "model-a", key: null }),
    ...(instanceToken ? { [`${PREFIX}github-token`]: JSON.stringify({ value: instanceToken, name: "GitHub token", expires: null, stored: "2026-10-18" }) } : {}),
  };
  const page = await openDashboard({ server: srv, search: `?repo=${encodeURIComponent(PRODUCT)}`, hash: "#uc", token: instanceToken, entries, caches: fakeCaches() });
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
  return { srv, sent, nodes: () => ({ children: mounted }) };
}

// The page actions after the person's press: the requests it sent, as records.
async function afterPress(srv, sent, control) {
  const from = sent.length;
  const requests = (await press(srv, control)).length;
  await settle(srv);
  return { requests, sent: sent.slice(from) };
}

for (const [name, instanceToken] of [["with the instance's token", TOKEN], ["without the instance's token", null]]) {
  // TST-860001
  // level: component
  // module: MOD-settings-pages
  // guards: A CLEAR IS A REAL CLEAR; A GITHUB PRODUCT USES A TOKEN OF ITS OWN
  // given: the live page on a GitHub product's pages (?repo=) that has drawn Settings, the product in the list, no token of the product's own, a model endpoint ep1 stored, and the instance's token stored or not
  // input: press Add or remove products, enter the product's address, tick I have read this, paste a new token for the product, press Store and check, then press Clear on the line of the endpoint ep1
  // expect: the new token is stored under the product's key, and every request to the product after the press on the endpoint carries it (and there is at least one), and none carries the instance's token
  test(`TST-860001 · a product token stored on the add-product form in place is carried by the next request of the open page, ${name}`, async (t) => {
    const { srv, sent, nodes } = await settingsOpen({ instanceToken });
    const products = lineOf(nodes(), "Product addresses are stored");
    assert.equal(Boolean(products), true, "the page shows the line of the list of products");
    await press(srv, controls(products, "settings-repository-change")[0]);
    const address = controls(nodes(), "address")[0];
    assert.equal(Boolean(address), true, "the form opened in place offers the address field");
    address.value = PRODUCT_ADDRESS;
    await address.fire("input", {});
    const acknowledgement = controls(nodes(), "ack")[0], secret = controls(nodes(), "token")[0], store = controls(nodes(), "store")[0];
    assert.equal(Boolean([acknowledgement, secret, store].every(Boolean)), true, "Step A of the form offers the notice, the token field and Store and check");
    acknowledgement.checked = true; await acknowledgement.fire("change", {});
    secret.value = NEW_PRODUCT_TOKEN;
    await press(srv, store);
    assert.equal(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}github-token:${PRODUCT}`))?.value, NEW_PRODUCT_TOKEN, "Store and check stored the new token under the product's key");
    const clear = controls(controls(nodes(), "settings-endpoint")[0], "settings-endpoint-clear")[0];
    assert.equal(Boolean(clear), true, "the page offers Clear on the line of the endpoint ep1");
    const after = await afterPress(srv, sent, clear);
    const product = after.sent.filter((request) => request.what.includes(`/repos/${PRODUCT}`));
    t.diagnostic(`${name}: requests on the press ${after.requests}, of them to the product ${product.length}; carrying the new product token: ${carrying(product, NEW_PRODUCT_TOKEN).length}; carrying the instance's token: ${carrying(product, TOKEN).length}`);
    assert.equal(product.length > 0, true, "the page read the product again after the press on the endpoint");
    assert.deepEqual(product.filter((request) => !request.headers.includes(NEW_PRODUCT_TOKEN)).map((request) => request.what), [], "every request to the product after the press carries the stored token");
    assert.deepEqual(carrying(product, TOKEN), [], "no request to the product carries the instance's token");
  });
}

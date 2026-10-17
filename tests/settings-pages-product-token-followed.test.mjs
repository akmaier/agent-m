// The open Settings page follows a product token's clear and any token that is stored (ITM-853). The real app
// (src/site-frame/dashboard-app.mjs) runs in tests/app-harness.mjs on a product's pages (?repo=alice/thesis), against two GitHub fakes:
// the instance's, and a second repoServer for the product that the instance's server hands the product's requests to. A handler of
// the test records the headers of every request without answering it. The person opens Settings, which reads the product with the
// product's own token and the instance with the instance's, and then makes the next page actions without a reload:
//   - presses Remove on a product of the list, or Clear on the line of the list of products, which take the product's own token;
//   - clears the GitHub token or has none, opens Change on its line, ticks the notice, pastes a token and presses Save, and then opens
//     the Repositories tab of Settings (which reads the instance's switch of recording conversations through the instance host the
//     page connected when Settings was drawn).
// Run: node --test tests/settings-pages-product-token-followed.test.mjs
//
// Module: MOD-settings-pages
// Guards: A CLEAR IS A REAL CLEAR
// Guards: A GITHUB PRODUCT USES A TOKEN OF ITS OWN
// Level: component
//
// The expected results are written here from A CLEAR IS A REAL CLEAR ("Clearing the configuration removes the stored credentials from
// the browser, not only from the displayed form"), from A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT (a token leaves the browser
// only as the authorisation header of requests to its server) and from A GITHUB PRODUCT USES A TOKEN OF ITS OWN (a product is read
// with its own token, and, while it has none, with the instance's); none is read from a document. A token that was cleared is no
// stored credential: no request sent after the clear carries its value in any header. A token that was stored is the credential the
// page holds: the next request to its server carries it.
// The callers read first (AGENTS.md 6a.1): tests/settings-pages-cleared-token-unused.test.mjs (TST-825001, TST-825002) opens the live
// Settings page in this harness and clears there; this file copies its pattern and adds the product's server. The product's server
// behind the instance's is the pattern of `withProduct` in tests/dashboard-review-flows.test.mjs, and the line of the GitHub token
// is found, pasted into and saved as `publicRepositoryControl` does there (the helpers are written again here: a test file imports
// no other test file).

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard, richDocument, press, settle, TOKEN } from "./app-harness.mjs";

const API = "https://api.github.com";
const PREFIX = "agent-m:akmaier/agent-m:";
const PRODUCT = "alice/thesis", PRODUCT_ADDRESS = `https://github.com/${PRODUCT}`;
const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghij";
const NEW_TOKEN = "github_pat_NEWER0123456789abcdefghij";
const FILES = {
  "docs/use-cases/UC-001-read-a-file.md": "---\nid: UC-001\ntitle: Read a file\narea: 1\nactors:\n  - Reader\nrealises: []\n---\n# UC-001 Read a file\n",
  "docs/use-cases/README.md": "# Use cases\n",
  "docs/approvals/README.md": "# Approval records\n",
};
const controls = (root, name, out = []) => { for (const child of root?.children ?? []) { if (typeof child !== "object") continue; if (child.className?.split(" ").includes(name)) out.push(child); controls(child, name, out); } return out; };
const stored = (token, name) => JSON.stringify({ value: token, name, expires: null, stored: "2026-10-18" });
const carrying = (requests, secret) => requests.filter((request) => request.headers.includes(secret)).map((request) => request.what);
const lineOf = (root, title) => controls(root, "settings-repository").find((node) => node.children[0]?.textContent === title);

// The live page on the product's pages, then Settings drawn. `instanceToken`: the instance's GitHub token stored, or null; `productToken`:
// the product's own token stored, or null. -> the instance's server, the record of every request (what it was, and its headers as text), and
// the Settings page's nodes.
async function settingsOpen({ instanceToken, productToken }) {
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
    ...(instanceToken ? { [`${PREFIX}github-token`]: stored(instanceToken, "GitHub token") } : {}),
    ...(productToken ? { [`${PREFIX}github-token:${PRODUCT}`]: stored(productToken, "Agent M") } : {}),
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
  // TST-853001
  // level: component
  // module: MOD-settings-pages
  // guards: A CLEAR IS A REAL CLEAR; A GITHUB PRODUCT USES A TOKEN OF ITS OWN
  // given: the live page on a GitHub product's pages (?repo=) that has drawn Settings, the product's own token stored, the product in the list, and the instance's token stored or not
  // input: press Remove on the product in the list of managed products
  // expect: the product's own token is gone from localStorage, no request sent after the press carries its value in a header, the product is read again after the press, and, where the instance's token is stored, with that one
  test(`TST-853001 · after Remove of a product ${name}, no request of the open page carries the product's own token`, async (t) => {
    const { srv, sent, nodes } = await settingsOpen({ instanceToken, productToken: PRODUCT_TOKEN });
    assert.ok(carrying(sent, PRODUCT_TOKEN).some((what) => what.includes(`/repos/${PRODUCT}`)), "the page read the product with its own token before the remove");
    const remove = controls(nodes(), "settings-product-remove")[0];
    assert.equal(Boolean(remove), true, "the page offers Remove on the product");
    const after = await afterPress(srv, sent, remove);
    assert.equal(globalThis.localStorage.getItem(`${PREFIX}github-token:${PRODUCT}`), null, "Remove took the product's own token from localStorage");
    const product = after.sent.filter((request) => request.what.includes(`/repos/${PRODUCT}`));
    t.diagnostic(`${name}: requests on the press ${after.requests}, of them to the product ${product.length}; carrying the product's token: ${carrying(after.sent, PRODUCT_TOKEN).length}; carrying the instance's token: ${carrying(after.sent, TOKEN).length}`);
    assert.deepEqual(carrying(after.sent, PRODUCT_TOKEN), [], "no request after Remove carries the product's own token");
    assert.equal(product.length > 0, true, "the page read the product again after Remove");
    if (instanceToken) assert.deepEqual(product.filter((request) => !request.headers.includes(TOKEN)).map((request) => request.what), [], "the product is read with the instance's token while it has none of its own");
  });

  // TST-853002
  // level: component
  // module: MOD-settings-pages
  // guards: A CLEAR IS A REAL CLEAR; A GITHUB PRODUCT USES A TOKEN OF ITS OWN
  // given: the live page on a GitHub product's pages (?repo=) that has drawn Settings, the product's own token stored, the product in the list, and the instance's token stored or not
  // input: press Clear on the line of the list of products and confirm it
  // expect: the product's own token and the list are gone from localStorage, no request sent after the press carries the product's token in a header, and the product is read again after the press
  test(`TST-853002 · after Clear of the list of products ${name}, no request of the open page carries the product's own token`, async (t) => {
    const { srv, sent, nodes } = await settingsOpen({ instanceToken, productToken: PRODUCT_TOKEN });
    assert.ok(carrying(sent, PRODUCT_TOKEN).some((what) => what.includes(`/repos/${PRODUCT}`)), "the page read the product with its own token before the clear");
    const line = controls(nodes(), "settings-repository").find((node) => node.textContent.includes("Product addresses are stored"));
    const clear = controls(line, "settings-repository-clear")[0];
    assert.equal(Boolean(clear), true, "the line of the list of products offers Clear");
    const after = await afterPress(srv, sent, clear);
    assert.equal(globalThis.localStorage.getItem(`${PREFIX}github-token:${PRODUCT}`), null, "Clear took the product's own token from localStorage");
    assert.equal(globalThis.localStorage.getItem(`${PREFIX}products`), null, "Clear took the list from localStorage");
    const product = after.sent.filter((request) => request.what.includes(`/repos/${PRODUCT}`));
    t.diagnostic(`${name}: requests on the press ${after.requests}, of them to the product ${product.length}; carrying the product's token: ${carrying(after.sent, PRODUCT_TOKEN).length}; carrying the instance's token: ${carrying(after.sent, TOKEN).length}`);
    assert.deepEqual(carrying(after.sent, PRODUCT_TOKEN), [], "no request after Clear carries the product's own token");
    assert.equal(product.length > 0, true, "the page read the product again after Clear");
  });
}

for (const [name, instanceToken] of [["after the GitHub token was cleared", TOKEN], ["where the page had no GitHub token", null]]) {
  // TST-853003
  // level: component
  // module: MOD-settings-pages
  // guards: A CLEAR IS A REAL CLEAR; A GITHUB PRODUCT USES A TOKEN OF ITS OWN
  // given: the live page on a GitHub product's pages (?repo=) that has drawn Settings, with the instance's GitHub token stored and cleared on its line, or with none
  // input: press Change on the line of the GitHub token, tick the notice, paste a new token, press Save, then open the Repositories tab of Settings
  // expect: the new token is stored, and every request of the Repositories tab carries it, and none carries the cleared one
  test(`TST-853003 · a GitHub token stored ${name} is carried by the next request of the open page`, async (t) => {
    const { srv, sent, nodes } = await settingsOpen({ instanceToken, productToken: null });
    const line = () => lineOf(nodes(), "GitHub token");
    assert.equal(Boolean(line()), true, "the page shows the line of the GitHub token");
    if (instanceToken) {
      const clear = controls(line(), "settings-repository-clear")[0];
      await press(srv, clear);
      assert.equal(globalThis.localStorage.getItem(`${PREFIX}github-token`), null, "the cleared token is gone from localStorage");
    }
    await press(srv, controls(line(), "settings-repository-change")[0]);
    const acknowledgement = controls(line(), "settings-repository-ack")[0], secret = controls(line(), "settings-repository-secret")[0], save = controls(line(), "settings-repository-save")[0];
    acknowledgement.checked = true; acknowledgement.fire("change", {});
    secret.value = NEW_TOKEN;
    await press(srv, save);
    assert.equal(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}github-token`))?.value, NEW_TOKEN, "Save stored the new token");
    const tab = controls(nodes(), "settings-tab").find((node) => node.textContent === "Repositories");
    assert.equal(Boolean(tab), true, "the page offers the Repositories tab");
    const after = await afterPress(srv, sent, tab);
    t.diagnostic(`${name}: requests on the Repositories tab ${after.requests}; carrying the new token: ${carrying(after.sent, NEW_TOKEN).length}; carrying the cleared token: ${carrying(after.sent, TOKEN).length}`);
    assert.equal(after.sent.length > 0, true, "the Repositories tab sent requests");
    assert.deepEqual(after.sent.filter((request) => !request.headers.includes(NEW_TOKEN)).map((request) => request.what), [], "every request of the Repositories tab carries the new token");
    assert.deepEqual(carrying(after.sent, TOKEN), [], "no request of the Repositories tab carries the cleared token");
  });
}

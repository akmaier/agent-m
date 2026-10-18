// The hosts the live app connects for its routes refuse a commit that holds a stored secret (ITM-882). The real app
// (src/site-frame/dashboard-app.mjs) runs in tests/app-harness.mjs, on the instance's pages and on a product's pages
// (?repo=alice/thesis), against two GitHub fakes: the instance's, and a second repoServer for the product that the instance's server
// hands the product's requests to. This browser stores a model endpoint whose key is SECRET. The route of the review pages (use-case)
// and the route of Settings are wrapped for the length of a test so that they record the ViewContext the app gives them and draw
// nothing; the test then commits a text that holds SECRET through each host of that context and a text that holds none:
//   - the review pages' host of the repository shown, on the instance's pages and on a product's pages (dashboard-app.mjs :214);
//   - the review pages' host of the instance while a product is shown (dashboard-app.mjs :654);
//   - the Settings page's host of the instance (dashboard-app.mjs :766) and of the product shown (dashboard-app.mjs :768);
//   - the review pages' host after a secret was stored on the open page, without a reload.
// Run: node --test tests/site-frame-app-hosts-refuse-secret.test.mjs
//
// Module: MOD-site-frame
// Guards: NO SECRET IN THE REPOSITORY
// Level: component
//
// The expected results are written here from NO SECRET IN THE REPOSITORY ("No API key, access token or endpoint credential is
// written into a repository managed by Agent M") and from the sentence of MOD-repository-hosts' `commitFiles` that a file whose text
// holds a configured secret refuses the whole commit with `SecretRefused` and writes nothing; none is read from a document when a
// test runs. A key stored as the key of a model endpoint is such a credential. The commit of a text that holds it is rejected as
// `SecretRefused` and no write request reaches either server; the known positive (AGENTS.md 6a.2) is the commit of a text that holds
// none through the same host, which is written once.
// The callers read first (AGENTS.md 6a.1): src/site-frame/routing.mjs (chosenProduct, instanceHostFollowingStore) connects with
// `secrets: secretValues(store)`; tests/site-frame-instance-token.test.mjs commits a text that holds a stored secret through the
// instance's host of the frame's own page; tests/settings-pages-reconnect-refuses-secret.test.mjs opens the live Settings page on a
// product's pages in this harness with two fakes, and this file copies its fixture (the helpers are written again here: a test file
// imports no other test file). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard, settle, TOKEN } from "./app-harness.mjs";
import { view as reviewPages } from "../src/review-pages/index.mjs";
import { view as settingsPages } from "../src/settings-pages/index.mjs";

const API = "https://api.github.com";
const PREFIX = "agent-m:akmaier/agent-m:";
const PRODUCT = "alice/thesis", PRODUCT_ADDRESS = `https://github.com/${PRODUCT}`;
const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghij";
const SECRET = "endpoint-key-SECRET-0123456789abcdef";
const LATER_SECRET = "endpoint-key-LATER-0123456789abcdefgh";
const FILES = {
  "docs/use-cases/UC-001-read-a-file.md": "---\nid: UC-001\ntitle: Read a file\narea: 1\nactors:\n  - Reader\nrealises: []\n---\n# UC-001 Read a file\n",
  "docs/use-cases/README.md": "# Use cases\n",
  "docs/approvals/README.md": "# Approval records\n",
};
const stored = (token, name) => JSON.stringify({ value: token, name, expires: null, stored: "2026-10-18" });
const endpoint = (key) => JSON.stringify({ kind: "openai-compatible", url: "https://models.example/v1", model: "model-a", key });

// The route `name` of `view` records the context it is given (the argument at `at`) and draws nothing, until `restore`.
function recording(view, name, at) {
  const route = view.routes.find((each) => each.name === name);
  const original = route.render;
  const contexts = [];
  route.render = async (...given) => { contexts.push(given[at]); };
  return { contexts, restore() { route.render = original; } };
}

// The live page at `hash`, on the instance's pages or, with `withProduct`, on the pages of the product alice/thesis, with SECRET stored
// as the key of the endpoint ep1, the instance's token and the product's own token. The product's server answers GET
// /repos/alice/thesis with push permission. -> the instance's server, the product's server (null on the instance's pages) and the page.
async function livePage({ hash, withProduct }) {
  let product = null;
  if (withProduct) {
    const tree = (url, init) => (init.method === "GET" && url.pathname === `/repos/${PRODUCT}/git/trees/main`
      ? product.fetch(`${API}/repos/${PRODUCT}/git/trees/${product.head}?recursive=1`, init) : undefined);
    const info = (url, init) => (init.method === "GET" && url.pathname === `/repos/${PRODUCT}`
      ? new Response(JSON.stringify({ default_branch: "main", private: true, visibility: "private", archived: false, description: "", permissions: { push: true } }), { status: 200, headers: { "Content-Type": "application/json" } })
      : undefined);
    product = await repoServer({ repo: PRODUCT, files: FILES, handlers: [info, tree] });
  }
  const forward = (url, init) => (product && url.origin === API && url.pathname.startsWith(`/repos/${PRODUCT}`) ? product.fetch(url.href, init) : undefined);
  const srv = await repoServer({ files: FILES, handlers: [forward] });
  const entries = {
    [`${PREFIX}endpoint:ep1`]: endpoint(SECRET),
    [`${PREFIX}github-token`]: stored(TOKEN, "GitHub token"),
    ...(withProduct ? { [`${PREFIX}products`]: JSON.stringify([PRODUCT_ADDRESS]), [`${PREFIX}github-token:${PRODUCT}`]: stored(PRODUCT_TOKEN, "Agent M") } : {}),
  };
  const page = await openDashboard({ server: srv, search: withProduct ? `?repo=${encodeURIComponent(PRODUCT)}` : "", hash, token: TOKEN, entries, caches: fakeCaches() });
  return { srv, product, page };
}

// Commits `text` as a new file through `host` on the default branch. -> the error the commit rejects with, or null.
async function commit(host, text) {
  try {
    const { defaultBranch } = await host.repositoryInfo();
    const head = await host.readSnapshot(defaultBranch);
    await host.commitFiles({ branch: defaultBranch, expectedHead: head.commit, files: [{ path: "docs/notes.md", text }], message: "add notes" });
    return null;
  } catch (error) {
    return error;
  }
}

// The writes of a server that carry `text` in a file.
const writtenWith = (server, text) => server.writes.filter((write) => Object.values(write.files).some((file) => file.includes(text)));

// The commit of a text that holds `secret` through `host` is rejected as SecretRefused and writes nothing to `server`; the commit of a
// text that holds none through the same host is written, once.
async function refuses(host, server, secret) {
  const refused = await commit(host, `the key is ${secret}`);
  await settle(server);
  assert.equal(refused?.name, "SecretRefused", `the commit of a text that holds the stored secret is rejected as SecretRefused (it was ${refused?.name ?? "not rejected"})`);
  assert.deepEqual(server.writes.map((write) => write.message), [], "nothing was written to the server");
  const accepted = await commit(host, "plain notes");
  await settle(server);
  assert.equal(accepted, null, "a text that holds no secret is committed");
  assert.equal(server.writes.length, 1, "one write reached the server");
  assert.equal(writtenWith(server, "plain notes").length, 1, "the write holds the text");
  assert.equal(writtenWith(server, secret).length, 0, "no write holds the stored secret");
}

// TST-882001
// level: component
// module: MOD-site-frame
// guards: NO SECRET IN THE REPOSITORY
// given: the live page on the instance's pages, SECRET stored as the key of the endpoint ep1; the use-case route records its context
// input: commit a text that holds SECRET, then one that holds none, through the context's instance host (the host of the repository shown)
// expect: the first is rejected as SecretRefused and writes nothing to the instance; the second is written, once, and no write holds SECRET
test("TST-882001 · on the instance's pages, the host the review pages are given refuses a commit that holds a stored secret", async () => {
  const route = recording(reviewPages, "use-case", 1);
  try {
    const { srv } = await livePage({ hash: "#uc/UC-001", withProduct: false });
    assert.equal(route.contexts.length > 0, true, "the app gave the use-case route a context");
    await refuses(route.contexts.at(-1).instance.host, srv, SECRET);
  } finally { route.restore(); }
});

// TST-882002
// level: component
// module: MOD-site-frame
// guards: NO SECRET IN THE REPOSITORY
// given: the live page on a product's pages, SECRET stored as the key of the endpoint ep1; the use-case route records its context
// input: commit a text that holds SECRET, then one that holds none, through the context's product host (the host of the repository shown)
// expect: the first is rejected as SecretRefused and writes nothing to the product; the second is written, once, and no write holds SECRET
test("TST-882002 · on a product's pages, the product host the review pages are given refuses a commit that holds a stored secret", async () => {
  const route = recording(reviewPages, "use-case", 1);
  try {
    const { product } = await livePage({ hash: "#uc/UC-001", withProduct: true });
    assert.equal(route.contexts.length > 0, true, "the app gave the use-case route a context");
    assert.equal(route.contexts.at(-1).product !== null, true, "the context names the product");
    await refuses(route.contexts.at(-1).product.host, product, SECRET);
  } finally { route.restore(); }
});

// TST-882003
// level: component
// module: MOD-site-frame
// guards: NO SECRET IN THE REPOSITORY
// given: the live page on a product's pages, SECRET stored as the key of the endpoint ep1; the use-case route records its context
// input: commit a text that holds SECRET, then one that holds none, through the context's instance host (the instance, while a product is shown)
// expect: the first is rejected as SecretRefused and writes nothing to the instance; the second is written, once, and no write holds SECRET
test("TST-882003 · on a product's pages, the instance host the review pages are given refuses a commit that holds a stored secret", async () => {
  const route = recording(reviewPages, "use-case", 1);
  try {
    const { srv } = await livePage({ hash: "#uc/UC-001", withProduct: true });
    assert.equal(route.contexts.length > 0, true, "the app gave the use-case route a context");
    await refuses(route.contexts.at(-1).instance.host, srv, SECRET);
  } finally { route.restore(); }
});

// TST-882004
// level: component
// module: MOD-site-frame
// guards: NO SECRET IN THE REPOSITORY
// given: the live page on a product's pages, SECRET stored as the key of the endpoint ep1; the settings route records its context
// input: commit a text that holds SECRET, then one that holds none, through the context's instance host
// expect: the first is rejected as SecretRefused and writes nothing to the instance; the second is written, once, and no write holds SECRET
test("TST-882004 · the instance host the Settings page is given refuses a commit that holds a stored secret", async () => {
  const route = recording(settingsPages, "settings", 1);
  try {
    const { srv } = await livePage({ hash: "#settings", withProduct: true });
    assert.equal(route.contexts.length > 0, true, "the app gave the settings route a context");
    await refuses(route.contexts.at(-1).instance.host, srv, SECRET);
  } finally { route.restore(); }
});

// TST-882005
// level: component
// module: MOD-site-frame
// guards: NO SECRET IN THE REPOSITORY
// given: the live page on a product's pages, SECRET stored as the key of the endpoint ep1; the settings route records its context
// input: commit a text that holds SECRET, then one that holds none, through the context's product host
// expect: the first is rejected as SecretRefused and writes nothing to the product; the second is written, once, and no write holds SECRET
test("TST-882005 · the product host the Settings page is given refuses a commit that holds a stored secret", async () => {
  const route = recording(settingsPages, "settings", 1);
  try {
    const { product } = await livePage({ hash: "#settings", withProduct: true });
    assert.equal(route.contexts.length > 0, true, "the app gave the settings route a context");
    await refuses(route.contexts.at(-1).product.host, product, SECRET);
  } finally { route.restore(); }
});

// TST-882006
// level: component
// module: MOD-site-frame
// guards: NO SECRET IN THE REPOSITORY
// given: the live page on the instance's pages with SECRET stored; LATER_SECRET is then stored as the key of a second endpoint, without a reload; the use-case route records its context
// input: open the use-case page again (a change of the address), then commit a text that holds LATER_SECRET, then one that holds none, through the new context's instance host
// expect: the first is rejected as SecretRefused and writes nothing to the instance; the second is written, once, and no write holds LATER_SECRET
test("TST-882006 · a secret stored on the open page is refused by the host the review pages are given next", async () => {
  const route = recording(reviewPages, "use-case", 1);
  try {
    const { srv, page } = await livePage({ hash: "#uc/UC-001", withProduct: false });
    globalThis.localStorage.setItem(`${PREFIX}endpoint:ep2`, endpoint(LATER_SECRET));
    const before = route.contexts.length;
    await page.go("#uc/UC-001");
    assert.equal(route.contexts.length > before, true, "the app gave the use-case route a context again");
    await refuses(route.contexts.at(-1).instance.host, srv, LATER_SECRET);
  } finally { route.restore(); }
});

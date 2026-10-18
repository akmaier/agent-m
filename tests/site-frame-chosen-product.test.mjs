// MOD-site-frame's chosenProduct tells whether the browser keeps the chosen product's own token (ITM-856), as docs/architecture/MOD-site-frame.md states it:
// "`chosenProduct(context: { store: Store, fragment: string }) -> Promise<ProductContext | null>` — the product the address's fragment or the selector names, among the products
// this browser keeps, connected with its own token to its own server only, with `tokenStored` true when that token is kept", and "`ProductContext` is `{ address: string, kind:
// "github" | "gitlab", host: Host, tokenStored: boolean }`, `tokenStored` telling whether this browser keeps the product's own token, so that a view hands `readProblem` the fact
// without reading the store's keys itself".
// Run: node --test tests/site-frame-chosen-product.test.mjs
//
// Module: MOD-site-frame
// Guards: A PRODUCT IS NAMED BY ITS ADDRESS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-008; UC-020
// Level: unit
//
// Each test states its input and its expected values in its own text; none reads an expected result from the SPEC, a use case or an architecture file. The page is the small fixture
// of tests/site-frame-start.d/dom.mjs (a location and a local storage); the real MOD-browser-store and MOD-repository-hosts run as they are. Nothing is read from a repository: a spy
// on `fetch` that refuses records that none is called. Readings the module file leaves open, which the pull request names:
//   - "kept" is: the store holds a value under the key of that product's own token (`github-token:<owner>/<repository>`, or `gitlab-token:<server>/<project>` for a GitLab product).
//     The instance's token (`github-token`), another product's token and a token of the other kind under the same path are not that key.
//   - `tokenStored` is the boolean true or false, never undefined, and the other fields of the result stay as they were: address, kind and host.
// The counter-proofs (a planted fault in src/site-frame/ and the test's failing result) are recorded in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { installPage, offline, outside } from "./site-frame-start.d/dom.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";

installPage({ hostname: "acme.github.io", pathname: "/instance/docs/index.html" });
offline();
const { chosenProduct } = await import("../src/site-frame/index.mjs");

const WIDGET = "https://github.com/acme/widget";
const OTHER = "https://github.com/acme/other";
const APP = "https://gitlab.example.org/team/app";
const fragmentOf = (address) => `#alpha/product=${encodeURIComponent(address)}`;

// The store of the instance acme/instance on a fresh local storage, keeping `products` and a token under each key of `tokens`.
function browserKeeping(products, tokens = []) {
  installPage({ hostname: "acme.github.io", pathname: "/instance/docs/index.html" });
  const store = openStore("acme/instance");
  writeSetting(store, "products", products);
  for (const key of tokens) writeSetting(store, key, { value: `pat-${key}`, name: "token", expires: "2030-01-01" });
  return store;
}

test.afterEach(() => { assert.deepEqual([outside.reached, outside.seen], [[], []], "no request left the fixture"); });

// TST-856001 · level: unit · module: MOD-site-frame
// guards: A PRODUCT IS NAMED BY ITS ADDRESS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-008
// given: a browser that keeps the GitHub product https://github.com/acme/widget and, once, the token github-token:acme/widget; and, for the counter-proof, the same browser without that token
// input: chosenProduct({ store, fragment: "#alpha/product=<the widget>" })
// expect: the result has exactly the fields address, host, kind and tokenStored; address is the widget's address, kind is "github", host has a repositoryInfo function, and tokenStored is the boolean true;
// counter-proof: without the token the same four fields are given and tokenStored is the boolean false
test("TST-856001 the chosen GitHub product says its own token is stored, and says it is not where none is", async () => {
  const withToken = await chosenProduct({ store: browserKeeping([WIDGET], ["github-token:acme/widget"]), fragment: fragmentOf(WIDGET) });
  assert.deepEqual(Object.keys(withToken).sort(), ["address", "host", "kind", "tokenStored"]);
  assert.equal(withToken.address, WIDGET);
  assert.equal(withToken.kind, "github");
  assert.equal(typeof withToken.host.repositoryInfo, "function");
  assert.equal(withToken.tokenStored, true);

  const without = await chosenProduct({ store: browserKeeping([WIDGET]), fragment: fragmentOf(WIDGET) });
  assert.deepEqual(Object.keys(without).sort(), ["address", "host", "kind", "tokenStored"]);
  assert.equal(without.tokenStored, false);
});

// TST-856002 · level: unit · module: MOD-site-frame
// guards: A PRODUCT IS NAMED BY ITS ADDRESS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a browser that keeps the products https://github.com/acme/widget and https://github.com/acme/other, the instance's token github-token and the token github-token:acme/other, and no token of the widget
// input: chosenProduct for the widget; and, for the counter-proof, for the widget after github-token:acme/widget is stored too
// expect: tokenStored is false for the widget — neither the instance's token nor another product's token is its own —; counter-proof: with its own token stored it is true, and for the other product, whose token was stored all along, it is true
test("TST-856002 the instance's token and another product's token are not the chosen product's own", async () => {
  const store = browserKeeping([WIDGET, OTHER], ["github-token", "github-token:acme/other"]);
  assert.equal((await chosenProduct({ store, fragment: fragmentOf(WIDGET) })).tokenStored, false);
  assert.equal((await chosenProduct({ store, fragment: fragmentOf(OTHER) })).tokenStored, true);

  writeSetting(store, "github-token:acme/widget", { value: "pat-widget", name: "token", expires: "2030-01-01" });
  assert.equal((await chosenProduct({ store, fragment: fragmentOf(WIDGET) })).tokenStored, true);
});

// TST-856003 · level: unit · module: MOD-site-frame
// guards: A PRODUCT IS NAMED BY ITS ADDRESS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a browser that keeps the GitLab product https://gitlab.example.org/team/app and the token gitlab-token:gitlab.example.org/team/app; and, for the counter-proof, a browser that keeps the same product and
// only the token github-token:team/app, which is a token of the other kind under the same path
// input: chosenProduct({ store, fragment: "#alpha/product=<the app>" })
// expect: kind is "gitlab" and tokenStored is true; counter-proof: with only the GitHub-kind token of the same path, kind is "gitlab" and tokenStored is false
test("TST-856003 the chosen GitLab product says its own project token is stored; a GitHub token of the same path is not it", async () => {
  const stored = await chosenProduct({ store: browserKeeping([APP], ["gitlab-token:gitlab.example.org/team/app"]), fragment: fragmentOf(APP) });
  assert.equal(stored.kind, "gitlab");
  assert.equal(stored.tokenStored, true);

  const other = await chosenProduct({ store: browserKeeping([APP], ["github-token:team/app"]), fragment: fragmentOf(APP) });
  assert.equal(other.kind, "gitlab");
  assert.equal(other.tokenStored, false);
});

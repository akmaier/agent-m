// MOD-main-page's route `home` offers *Get your own Agent M* (ITM-655), as the accepted text of docs/architecture/MOD-main-page.md (Interfaces: `home`) states it: "The greeting has its folded
// explanation and *Get your own Agent M*, which leads to MOD-settings-pages' `get-your-own` (UC-014 step 1)", and UC-014 step 1: "presses **Get your own Agent M**".
// Run: node --test tests/main-page-get-your-own.test.mjs
//
// Module: MOD-main-page
// Guards: UC-014; AN INSTANCE IS A FORK OF AGENT M; THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
// Level: unit
//
// Each test states its input and its expected values in its own text (given / input / expect); no expected value is read from a document. The real MOD-site-frame, MOD-progress-measures,
// MOD-repository-hosts and MOD-browser-store run as they are; only `fetch` is faked, by the helper tests/main-page-home-harness.mjs. No request leaves the fixtures; nothing sleeps.
//
// Readings the module file leaves open, which the tests state (the pull request names them):
//   - *Get your own Agent M* is an <a class="btn"> in the greeting's <p class="actions">, after *Review the use cases*; it is a link and not a button that calls go(), because the route
//     `get-your-own` is served by the review pages (docs/index.html), which the main page does not load: go() would write a fragment the main page cannot show.
//   - Its address is the one the frame writes for a route of the review pages seen from the main page: the page's prefix that menuOf gives every entry, "docs/index.html#", and the route's
//     name, "get-your-own" — here "docs/index.html#get-your-own". The instance is the original or a fork of it, so the address names no product ("/product=" is never part of it).
//   - The link stands in the greeting whatever the page holds: with a product kept, and with none (Agent M's own card).

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/main-page/index.mjs";
import { INSTANCE, PRODUCT, browser, byClass, draw, find, instanceFiles, network, smallProduct, timers } from "./main-page-home-harness.mjs";

const home = view.routes.find((candidate) => candidate.name === "home");
let net;
afterEach(() => {
  net?.restore();
  timers.restore();
});

const linksNamed = (root, text) => find(root, (node) => node.localName === "a" && node.textContent === text);

// TST-655001 · level: unit · module: MOD-main-page
// guards: UC-014; AN INSTANCE IS A FORK OF AGENT M
// given: this browser keeps the product alice/product (a card is drawn for it)
// input: the route home drawn
// expect: the greeting holds exactly one link reading "Get your own Agent M", in the greeting's actions paragraph after the link "Review the use cases", whose address is exactly "docs/index.html#get-your-own" (opened in the same tab: no target); the link "Review the use cases" still leads to "docs/index.html#use-cases"; the greeting is still the page's first child; counter-proof: no other link of the page, a card's stage links included, leads to "docs/index.html#get-your-own"
test("TST-655001 the greeting offers Get your own Agent M, a link to the route get-your-own of the review pages", async () => {
  net = network({ [PRODUCT]: smallProduct(), [INSTANCE]: instanceFiles() });
  net.install();
  const target = await draw(home, browser());
  const [greeting] = byClass(target, "greeting");
  assert.equal(target.children[0], greeting, "the greeting is the page's first child");
  const offered = linksNamed(greeting, "Get your own Agent M");
  assert.equal(offered.length, 1);
  assert.equal(offered[0].getAttribute("href"), "docs/index.html#get-your-own");
  assert.equal(offered[0].getAttribute("target"), null);
  const [actions] = byClass(greeting, "actions");
  assert.deepEqual(actions.children.filter((node) => node.localName === "a").map((node) => node.textContent), ["Review the use cases", "Get your own Agent M"]);
  assert.equal(linksNamed(greeting, "Review the use cases")[0].getAttribute("href"), "docs/index.html#use-cases");
  const toRoute = find(target, (node) => node.localName === "a" && node.getAttribute("href") === "docs/index.html#get-your-own");
  assert.equal(toRoute.length, 1, "only the greeting's link leads to the route");
});

// TST-655002 · level: unit · module: MOD-main-page
// guards: UC-014; WITHOUT A PRODUCT, THE MAIN PAGE SHOWS AGENT M'S OWN PROGRESS
// given: this browser keeps no product, so that Agent M's own card is drawn; and, as a counter-proof, one that keeps alice/product
// input: the route home drawn in each
// expect: in both, the greeting holds one link "Get your own Agent M" at exactly "docs/index.html#get-your-own" — the same address, with no "product=" in it; counter-proof: the address does not follow the card, so that with a product kept it still names the instance's page and not the product
test("TST-655002 Get your own Agent M leads to the same address with Agent M's own card and with a product kept, and names no product", async () => {
  net = network({ [INSTANCE]: instanceFiles() });
  net.install();
  const own = await draw(home, browser({ products: [], tokens: {} }));
  const ownLinks = linksNamed(byClass(own, "greeting")[0], "Get your own Agent M");
  assert.equal(ownLinks.length, 1);
  assert.equal(ownLinks[0].getAttribute("href"), "docs/index.html#get-your-own");

  net.restore();
  net = network({ [PRODUCT]: smallProduct(), [INSTANCE]: instanceFiles() });
  net.install();
  const kept = await draw(home, browser());
  const keptLinks = linksNamed(byClass(kept, "greeting")[0], "Get your own Agent M");
  assert.equal(keptLinks.length, 1);
  assert.equal(keptLinks[0].getAttribute("href"), "docs/index.html#get-your-own");
  assert.equal(keptLinks[0].getAttribute("href").includes("product="), false);
});

// TST-655003 · level: unit · module: MOD-main-page
// guards: UC-014; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; NO SERVER
// given: this browser keeps the product alice/product; the instance's token is stored
// input: the route home drawn, and the link "Get your own Agent M" looked at without being pressed
// expect: the link is an anchor with an address (a click on it is the browser's navigation): the page called no go() for it, and the greeting drew it without any request of its own — the requests of the page are those of a page without the link (the repository reads the cards and the waits take), none to github.com/akmaier/agent-m/fork or to any Pages settings address, and none to Actions beyond the card's list of the runs of its head (the repository read of the scope `all`)
test("TST-655003 the offer is a plain link: it calls no go() and sends no request of its own", async () => {
  net = network({ [PRODUCT]: smallProduct(), [INSTANCE]: instanceFiles() });
  net.install();
  const context = browser();
  const target = await draw(home, context);
  const [offered] = linksNamed(byClass(target, "greeting")[0], "Get your own Agent M");
  assert.ok(offered, "the link is drawn");
  assert.deepEqual(context.went, [], "drawing the page navigated nowhere");
  const urls = net.requests.map((request) => request.url);
  assert.equal(urls.some((url) => /\/fork\b|\/settings\/pages|\/actions\/(?!runs(?:\?|$))/.test(url)), false);
});

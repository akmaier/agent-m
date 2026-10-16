// start.mjs, the script both entry pages load (ITM-531): it reads the page's setup from its own script tag (data-page, data-views,
// data-menu-views), loads the named view modules from ../<slug>/index.mjs, registers their strategies with MOD-job-runner under
// the slug and calls startPage. The views are fixtures (tests/site-frame-start.d/view-a, view-b), named by a slug that leads out of
// src/ to them.
//
// Run: node --test tests/site-frame-start-script.test.mjs
//
// Module: MOD-site-frame
// Guards: THE MENU FOLLOWS THE PROCESS; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// Each test names its input and states its expected values in its own text. The counter-proofs (a planted fault in
// src/site-frame/start.mjs and the test's failing result) are recorded in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { all, changeFragment, installPage } from "./site-frame-start.d/dom.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";

const VIEW_A = "../tests/site-frame-start.d/view-a";
const VIEW_B = "../tests/site-frame-start.d/view-b";
const settle = () => new Promise((resolve) => setImmediate(resolve));

// The page: a fixture whose only script tag is the one that loads start.mjs, with the given setup in its attributes.
function pageWithScript(attributes, fragment = "") {
  const page = installPage({ hostname: "acme.github.io", pathname: "/instance/docs/index.html", hash: fragment });
  page.document.baseURI = new URL("./page.html", import.meta.url).href;
  const script = page.document.createElement("script");
  script.setAttribute("type", "module");
  script.setAttribute("src", "../src/site-frame/start.mjs");
  for (const [name, value] of Object.entries(attributes)) script.setAttribute(name, value);
  page.document.head.append(script);
  page.timers = [];
  globalThis.setInterval = (callback, delay) => { page.timers.push(delay); return page.timers.length; };
  return page;
}

// TST-531012 · level: unit · module: MOD-site-frame
// guards: THE MENU FOLLOWS THE PROCESS
// given: a page whose script tag loading start.mjs has data-page="review", data-views naming the fixture views view-a (routes
//   alpha under requirements and list-of-cases under use-cases, the check itm531CheckA) and view-b (route beta under tests, the
//   check itm531CheckB) and an empty data-menu-views; the fragment #alpha/q=1
// input: start.mjs is loaded (its top level runs), then the fragment changes to #beta
// expect: the route area reads `alpha page=review params={"q":"1"}`, then `beta`; the menu serves requirements, use-cases and
//   tests with links #requirements, #use-cases and #tests; registering the check itm531CheckA again is refused as a
//   DuplicateStrategy whose first owner is ../tests/site-frame-start.d/view-a, and itm531CheckB's first owner is
//   ../tests/site-frame-start.d/view-b; a check name no view registered is accepted
test("TST-531012 start.mjs reads its script tag, loads the named views, registers their strategies under their slugs and starts the page", async () => {
  const page = pageWithScript({ "data-page": "review", "data-views": `${VIEW_A} ${VIEW_B}`, "data-menu-views": "" }, "#alpha/q=1");
  await import("../src/site-frame/start.mjs?review");
  const target = all(page.document.body, "main")[0];
  assert.equal(target.textContent, 'alpha page=review params={"q":"1"}');
  changeFragment(page, "#beta");
  await settle();
  assert.equal(target.textContent, "beta");
  const menu = all(page.document.body, "nav")[0];
  assert.deepEqual(menu.children.map((entry) => entry.getAttribute("href")), ["#requirements", "#use-cases", null, null, "#tests", null, null, null]);
  const owners = (name) => { try { registerStrategies("probe", { checks: { [name]: () => [] } }); return null; } catch (error) { return error.owners ?? error; } };
  assert.deepEqual(owners("itm531CheckA"), [VIEW_A, "probe"]);
  assert.deepEqual(owners("itm531CheckB"), [VIEW_B, "probe"]);
  assert.equal(owners("itm531CheckNobodyRegistered"), null);
  assert.deepEqual(page.timers, [60000], "the page started MOD-notifications' check once");
});

// TST-531013 · level: unit · module: MOD-site-frame
// guards: THE MENU FOLLOWS THE PROCESS
// given: a page whose script tag has data-page="main", empty data-views and empty data-menu-views
// input: start.mjs is loaded (a second evaluation of it, under another query)
// expect: the main page is started: its menu has eight entries, none served, and its route area reads "This page is not built
//   yet."
test("TST-531013 start.mjs starts the main page when its script tag says data-page=main", async () => {
  const page = pageWithScript({ "data-page": "main", "data-views": "", "data-menu-views": "" });
  await import("../src/site-frame/start.mjs?main");
  assert.equal(all(page.document.body, "nav")[0].children.length, 8);
  assert.equal(all(page.document.body, "main")[0].textContent, "This page is not built yet.");
});

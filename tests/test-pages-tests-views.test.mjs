// The Tests entry's views (ITM-1223) — MOD-test-pages' route `tests-views`, as docs/architecture/MOD-test-pages.md states it: titled Tests, outside the menu,
// made to be shown inside the routes that embed it with the frame's embedRoute, and drawing the same navigation and nothing else when opened by its own address;
// the views Schedule, Browser, Runs, Audit, Generate in this order, each a button of the frame whose click calls the context's go, the one its param `shown`
// names marked as the page shown and drawn as the frame's primary button. It reads nothing.
// Run: node --test tests/test-pages-tests-views.test.mjs
//
// Module: MOD-test-pages
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; UC-026; UC-027; UC-028; UC-029; UC-030
// Level: unit
//
// The page is the small fixture DOM of tests/site-frame-start.d/dom.mjs, started with MOD-site-frame's startPage and the view MOD-test-pages hands the frame, beside
// a fixture view whose route `host` embeds `tests-views` with embedRoute. Nothing reaches the network (the fixture's offline fetch). Readings the texts leave open,
// which the pull request names:
//   - "a navigation named Tests" is one <nav> with aria-label "Tests"; its buttons carry the class btn, the one shown also primary and aria-current="page".
//   - "the frame alone writes the address": a click changes the page's fragment to the one the frame writes for go — #schedule, #trace/key=tests, #runs,
//     #trace/key=audit, #generate — and the navigation holds no link of its own (no <a>, no href).
// The counter-proofs are recorded in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { all, installPage, offline, outside } from "./site-frame-start.d/dom.mjs";

const { startPage, embedRoute } = await import("../src/site-frame/index.mjs");
const { view } = await import("../src/test-pages/index.mjs");

const PAGE = { hostname: "acme.github.io", pathname: "/instance/docs/index.html" };
const LABELS = ["Schedule", "Browser", "Runs", "Audit", "Generate"];
const FRAGMENTS = ["#schedule", "#trace/key=tests", "#runs", "#trace/key=audit", "#generate"];
const classes = (node) => String(node.className ?? "").split(" ").filter(Boolean);
const elements = (node) => (node.children ?? []).filter((child) => typeof child !== "string");

// A fixture view whose route `host` embeds the Tests entry's views with the given params into an element of its own.
const seen = { inner: null, caught: [] };
const hostView = (params) => ({ strategies: [], routes: [{ name: "host", entry: "tests", title: "host", async render(target) {
  const inner = document.createElement("div");
  target.append(inner);
  seen.inner = inner;
  try { await embedRoute("tests-views", inner, params); } catch (failure) { seen.caught.push(failure.name); }
} }] });

async function start(fragment, embedding = null) {
  Object.assign(seen, { inner: null, caught: [] });
  const fixture = installPage({ ...PAGE, hash: fragment });
  offline();
  globalThis.setInterval = () => 1;
  await startPage({ page: "review", views: embedding ? [view, hostView(embedding)] : [view] });
  return { ...fixture, main: all(fixture.document.body, "main")[0] };
}

// The navigation drawn in `root`: its one <nav>, checked to hold the five views in order, the one `shown` marked, and no link.
function navigationIn(root, shown) {
  const navs = all(root, "nav");
  assert.equal(navs.length, 1, "one navigation");
  assert.equal(navs[0].getAttribute("aria-label"), "Tests");
  const buttons = all(navs[0], "button");
  assert.deepEqual(buttons.map((button) => button.textContent), LABELS, "the five views in order");
  for (const button of buttons) assert.ok(classes(button).includes("btn"), `${button.textContent} is a button of the frame`);
  assert.deepEqual(buttons.filter((button) => button.getAttribute("aria-current") === "page").map((button) => button.textContent), [shown]);
  assert.ok(classes(buttons[LABELS.indexOf(shown)]).includes("primary"), `${shown} is the primary button`);
  assert.equal(all(navs[0], "a").length, 0, "no link of its own");
  return buttons;
}

test.afterEach(() => { assert.deepEqual(outside.reached, [], "no request left the fixture"); });

// TST-1223008 · level: unit · module: MOD-test-pages
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; UC-027; UC-029
// given: the view of MOD-test-pages
// input: its routes
// expect: it offers the route tests-views, titled Tests, outside the menu (entry null)
test("TST-1223008 — tests-views is a route of the view, titled Tests, outside the menu", () => {
  const route = view.routes.find((candidate) => candidate.name === "tests-views");
  assert.ok(route, "the view offers tests-views");
  assert.equal(route.title, "Tests");
  assert.equal(route.entry, null);
});

// TST-1223009 · level: unit · module: MOD-test-pages
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; UC-028; UC-029; UC-027
// given: the review page started at #tests-views/shown=Runs
// input: the page starts; then each of the five buttons clicked in turn, the page started again before each click
// expect: the route area holds the navigation Tests and nothing else: Schedule, Browser, Runs, Audit, Generate as frame buttons, Runs marked, no link; each click changes the page's fragment to its view's: #schedule, #trace/key=tests, #runs, #trace/key=audit, #generate
test("TST-1223009 — opened by its own address, tests-views draws the navigation alone, and each click goes through the frame", async () => {
  for (const [at, fragment] of FRAGMENTS.entries()) {
    const page = await start("#tests-views/shown=Runs");
    assert.deepEqual(elements(page.main).map((node) => node.localName), ["nav"], "the navigation and nothing else");
    const buttons = navigationIn(page.main, "Runs");
    buttons[at].dispatchEvent(new Event("click"));
    assert.equal(page.location.hash, fragment, `${LABELS[at]} leads to ${fragment}`);
  }
});

// TST-1223010 · level: unit · module: MOD-test-pages
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; UC-030
// given: the review page at #host, whose route embeds tests-views with { shown: "Audit" }
// input: the page starts; then the button Schedule clicked
// expect: the embedding does not fail; the host's element holds the navigation, Audit marked; the click changes the page's fragment to #schedule
test("TST-1223010 — embedded with embedRoute, tests-views marks the view named and leads through the frame", async () => {
  const page = await start("#host", { shown: "Audit" });
  assert.deepEqual(seen.caught, []);
  const buttons = navigationIn(seen.inner, "Audit");
  buttons[0].dispatchEvent(new Event("click"));
  assert.equal(page.location.hash, "#schedule");
});

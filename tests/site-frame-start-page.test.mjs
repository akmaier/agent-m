// MOD-site-frame starts the main and the review pages (ITM-531): startPage draws the header, the menu in the order of the process
// and the product selector, shows the notices, connects the instance and the chosen product, renders the route the fragment
// names again on every change of the fragment, and starts MOD-notifications' watchForAcceptance once; menuOf and the address
// writer of routing.mjs, which startPage uses, are tested on their own.
//
// Run: node --test tests/site-frame-start-page.test.mjs
//
// Module: MOD-site-frame
// Guards: THE MENU FOLLOWS THE PROCESS; EVERY STEP EXPLAINS ITSELF; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A PRODUCT IS
//   NAMED BY ITS ADDRESS; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// Level: unit
//
// Each test names its input and states its expected values in its own text; none reads an expected result from the SPEC, a use
// case or an architecture file. The page is a small fixture DOM (tests/site-frame-start.d/dom.mjs) with a fixture location and
// local storage; the page is given an offline fetch (tests/site-frame-start.d/dom.mjs), so nothing reaches the network, and the one timer the frame may start — MOD-notifications' minute check — is
// counted instead of started. The counter-proofs (a planted fault in src/site-frame/ and the test's failing result) are recorded
// in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { all, changeFragment, installPage, offline, outside } from "./site-frame-start.d/dom.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";

const { startPage, menuOf } = await import("../src/site-frame/index.mjs");

const REVIEW = { hostname: "acme.github.io", pathname: "/instance/docs/index.html" };
const WIDGET = "https://github.com/acme/widget";
const APP = "https://gitlab.example.org/team/app";
const encoded = (address) => encodeURIComponent(address);
const settle = () => new Promise((resolve) => setImmediate(resolve));

// The routes a fixture view serves, each rendering a text that names it and its parameters.
const rendered = [];
const route = (name, entry) => ({ name, entry, title: name, async render(target, context, params) {
  rendered.push({ name, context, params });
  target.textContent = `${name} ${JSON.stringify(params)}`;
} });
const VIEW = { routes: [route("alpha", "requirements"), route("cases-list", "use-cases"), route("cases-new", "use-cases"),
  route("beta", "tests")], strategies: [] };

// Starts a page on a fresh fixture. `timers` collects the delays of the intervals the frame starts. `extra` is the rest of the
// setup besides the page and its views; the tests that do not concern it pass menuViews: [] as the callers in the repository do.
async function start({ page = "review", fragment = "", views = [VIEW], products = [], tokens = {}, extra = { menuViews: [] } } = {}) {
  rendered.length = 0;
  const fixture = installPage({ ...REVIEW, hash: fragment });
  offline();
  const timers = [];
  globalThis.setInterval = (callback, delay) => { timers.push(delay); return timers.length; };
  const store = openStore("acme/instance");
  if (products.length) writeSetting(store, "products", products);
  for (const [key, value] of Object.entries(tokens)) writeSetting(store, key, { value, name: "token", expires: "2030-01-01" });
  await startPage({ page, views, ...extra });
  const body = fixture.document.body;
  return { ...fixture, timers, body, target: all(body, "main")[0], menu: all(body, "nav")[0], select: all(body, "select")[0] };
}

// TST-531001 · level: unit · module: MOD-site-frame
// guards: THE MENU FOLLOWS THE PROCESS; A PRODUCT IS NAMED BY ITS ADDRESS
// given: the review page of the instance acme/instance, a browser that keeps the products https://github.com/acme/widget and
//   https://gitlab.example.org/team/app, and one view that serves the entries requirements, use-cases and tests
// input: startPage({ page: "review", views, menuViews: [] })
// expect: one header; a menu of eight entries whose texts are, in this order, Requirements, Use cases, Architecture,
//   Implementation, Tests, Releases, Maintenance, Settings; the three served entries are links to #requirements, #use-cases and
//   #tests; the five others are spans of class soon titled "not built yet"; and a product selector whose options are, in this
//   order, acme/instance, the widget address, the app address and "+ Add product"
test("TST-531001 startPage on the review page draws the header, the eight entries of the menu in the order of the process and the selector with the instance first", async () => {
  const page = await start({ products: [WIDGET, APP] });
  assert.equal(all(page.body, "header").length, 1, "one header");
  assert.deepEqual(page.menu.children.map((entry) => entry.textContent),
    ["Requirements", "Use cases", "Architecture", "Implementation", "Tests", "Releases", "Maintenance", "Settings"]);
  assert.deepEqual(page.menu.children.map((entry) => [entry.localName, entry.getAttribute("href")]), [
    ["a", "#requirements"], ["a", "#use-cases"], ["span", null], ["span", null], ["a", "#tests"], ["span", null], ["span", null], ["span", null]]);
  for (const entry of page.menu.children.filter((child) => child.localName === "span")) {
    assert.equal(entry.className, "soon", `${entry.textContent} is marked soon`);
    assert.match(entry.getAttribute("title"), /not built yet/, `${entry.textContent} says it is not built yet`);
  }
  assert.deepEqual(page.select.children.map((option) => option.textContent), ["acme/instance", WIDGET, APP, "+ Add product"]);
});

// TST-531002 · level: unit · module: MOD-site-frame
// guards: THE MENU FOLLOWS THE PROCESS
// given: the review page with one view whose routes are alpha (requirements), cases-list and cases-new (use-cases) and beta (tests)
// input: startPage with the fragment #alpha/id=7, then the fragment changes to #beta, then to #use-cases/x=1
// expect: the route area reads `alpha {"id":"7"}`; after the first change `beta {}`; after the second — a fragment that names
//   a menu entry, not a route — the first loaded route of that entry, `cases-list {}`; each route is rendered once per fragment
test("TST-531002 the route the fragment names is rendered, the next on every change of the fragment, and a menu entry's name shows its first loaded route", async () => {
  const page = await start({ fragment: "#alpha/id=7" });
  assert.equal(page.target.textContent, 'alpha {"id":"7"}');
  changeFragment(page, "#beta");
  await settle();
  assert.equal(page.target.textContent, "beta {}");
  changeFragment(page, "#use-cases/x=1");
  await settle();
  assert.equal(page.target.textContent, "cases-list {}");
  assert.deepEqual(rendered.map((entry) => entry.name), ["alpha", "beta", "cases-list"], "one render per fragment");
});

// TST-531003 · level: unit · module: MOD-site-frame
// guards: THE MENU FOLLOWS THE PROCESS
// given: the review page with the same view
// input: startPage with the empty fragment; then startPage with #architecture, an entry no loaded view serves; then with
//   #nothing-like-this, which names neither a route nor an entry
// expect: the first loaded route, `alpha {}`; then a paragraph "The Architecture entry is not built yet." and no route rendered;
//   then the first loaded route again, `alpha {}`
test("TST-531003 an empty fragment shows the first loaded route, an entry no loaded view serves says it is not built yet", async () => {
  let page = await start();
  assert.equal(page.target.textContent, "alpha {}");
  page = await start({ fragment: "#architecture" });
  assert.equal(page.target.textContent, "The Architecture entry is not built yet.");
  assert.equal(all(page.target, "p").length, 1, "the sentence is a paragraph");
  assert.equal(rendered.length, 0, "no route is rendered for an entry nothing serves");
  page = await start({ fragment: "#nothing-like-this" });
  assert.equal(page.target.textContent, "alpha {}");
});

// TST-531004 · level: unit · module: MOD-site-frame
// guards: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// given: a fixture whose setInterval counts the delays it is given, and the review page, the main page and the Bridge page
// input: startPage on the review page, then two changes of the fragment; startPage on the main page; startPage on the bridge page
// expect: MOD-notifications' check is started by one interval of 60000 ms on the review page, still one after two changes of the
//   fragment, one on the main page and none on the Bridge page
test("TST-531004 watchForAcceptance is started once on the review and the main page, never again on a change of the fragment, and not in the Bridge's window", async () => {
  const review = await start({ fragment: "#alpha" });
  assert.deepEqual(review.timers, [60000], "one minute check on the review page");
  changeFragment(review, "#beta");
  changeFragment(review, "#alpha");
  await settle();
  assert.deepEqual(review.timers, [60000], "a change of the fragment starts none");
  const main = await start({ page: "main", views: [] });
  assert.deepEqual(main.timers, [60000], "one minute check on the main page");
  const bridge = await start({ page: "bridge", views: [VIEW] });
  assert.deepEqual(bridge.timers, [], "none in the Bridge's window");
});

// TST-531005 · level: unit · module: MOD-site-frame
// guards: A PRODUCT IS NAMED BY ITS ADDRESS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a browser that keeps the instance token github_pat_INSTANCE, the product https://github.com/acme/widget with its own
//   token github_pat_WIDGET and the GitLab product https://gitlab.example.org/team/app; a fetch that records each request's url
//   and Authorization header and fails
// input: startPage with #alpha, then with #alpha/product=<the widget>, then with #alpha/product=<the app>
// expect: the first route gets repository acme/instance, a host with repositoryInfo and no product; the second gets the product
//   { address: the widget address, kind: "github" } and a host whose request carries Bearer github_pat_WIDGET and not the
//   instance's token, while the instance's request carries Bearer github_pat_INSTANCE; the third { address: the app address,
//   kind: "gitlab" }
test("TST-531005 the instance and the product the fragment names are connected, each with its own token", async () => {
  const requests = [];
  globalThis.fetch = async (url, init) => { requests.push({ url: String(url), authorization: init?.headers?.Authorization ?? null }); throw new TypeError("offline"); };
  const kept = { products: [WIDGET, APP], tokens: { "github-token": "github_pat_INSTANCE", "github-token:acme/widget": "github_pat_WIDGET" } };
  await start({ ...kept, fragment: "#alpha" });
  const [instanceOnly] = rendered;
  assert.equal(instanceOnly.context.page, "review");
  assert.equal(instanceOnly.context.instance.repository, "acme/instance");
  assert.equal(typeof instanceOnly.context.instance.host.repositoryInfo, "function");
  assert.equal(instanceOnly.context.product, null);
  await instanceOnly.context.instance.host.repositoryInfo().catch(() => {});
  await start({ ...kept, fragment: `#alpha/product=${encoded(WIDGET)}` });
  const [withWidget] = rendered;
  assert.equal(withWidget.context.product.address, WIDGET);
  assert.equal(withWidget.context.product.kind, "github");
  await withWidget.context.product.host.repositoryInfo().catch(() => {});
  await start({ ...kept, fragment: `#alpha/product=${encoded(APP)}` });
  assert.equal(rendered[0].context.product.address, APP);
  assert.equal(rendered[0].context.product.kind, "gitlab");
  const toInstance = requests.find((request) => request.url.includes("/repos/acme/instance"));
  const toWidget = requests.find((request) => request.url.includes("/repos/acme/widget"));
  assert.equal(toInstance.authorization, "Bearer github_pat_INSTANCE");
  assert.equal(toWidget.authorization, "Bearer github_pat_WIDGET");
});

// TST-531006 · level: unit · module: MOD-site-frame
// guards: A PRODUCT IS NAMED BY ITS ADDRESS
// given: a browser that keeps the product https://github.com/acme/widget and not https://github.com/other/none
// input: startPage with #alpha/product=<other/none>
// expect: the route is rendered for the instance (product null) and the notices say "does not keep the product
//   https://github.com/other/none"
test("TST-531006 a fragment naming a product this browser does not keep shows the instance and says so", async () => {
  const page = await start({ products: [WIDGET], fragment: `#alpha/product=${encoded("https://github.com/other/none")}` });
  assert.equal(rendered.length, 1);
  assert.equal(rendered[0].context.product, null);
  assert.match(all(page.body, "section").find((section) => section.className === "site-frame-notices").textContent,
    /does not keep the product https:\/\/github\.com\/other\/none/);
});

// TST-531007 · level: unit · module: MOD-site-frame
// guards: A PRODUCT IS NAMED BY ITS ADDRESS
// given: the review page showing #alpha/id=7 in a browser that keeps the widget product
// input: the person chooses the widget in the selector; then calls go("beta", { x: "1" }) from the route; then chooses the
//   instance; then chooses "+ Add product"
// expect: the fragment becomes #alpha/id=7/product=https%3A%2F%2Fgithub.com%2Facme%2Fwidget and, once the page has shown it, the
//   selector stands on the widget; go keeps the product: #beta/x=1/product=https%3A%2F%2Fgithub.com%2Facme%2Fwidget; the
//   instance removes it: #alpha/id=7; "+ Add product" goes to #add-product
test("TST-531007 choosing in the selector sets the fragment's product, go keeps it, the instance removes it, + Add product goes to the add-product route", async () => {
  const page = await start({ products: [WIDGET], fragment: "#alpha/id=7" });
  page.select.value = WIDGET;
  page.select.dispatchEvent(new Event("change"));
  assert.equal(page.location.hash, `#alpha/id=7/product=${encoded(WIDGET)}`);
  changeFragment(page, page.location.hash);
  await settle();
  assert.equal(page.select.value, WIDGET, "the selector stands on the product the fragment names");
  rendered.at(-1).context.go("beta", { x: "1" });
  assert.equal(page.location.hash, `#beta/x=1/product=${encoded(WIDGET)}`);
  changeFragment(page, `#alpha/id=7/product=${encoded(WIDGET)}`);
  await settle();
  page.select.value = "";
  page.select.dispatchEvent(new Event("change"));
  assert.equal(page.location.hash, "#alpha/id=7");
  page.select.value = "+add";
  page.select.dispatchEvent(new Event("change"));
  assert.equal(page.location.hash, "#add-product");
});

// TST-531008 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF
// given: a browser with no token stored; then one with the instance token stored
// input: startPage on the review page
// expect: the notices read "Finish setting up" with a link to #settings while no token is stored, and hold nothing once the
//   instance token is stored
test("TST-531008 the notices say Finish setting up while no token is stored and say nothing once one is", async () => {
  const noticesOf = (page) => all(page.body, "section").find((section) => section.className === "site-frame-notices");
  const without = await start();
  assert.match(noticesOf(without).textContent, /Finish setting up/);
  assert.equal(all(noticesOf(without), "a")[0].getAttribute("href"), "#settings");
  const withToken = await start({ tokens: { "github-token": "github_pat_INSTANCE" } });
  assert.equal(noticesOf(withToken).textContent, "");
});

// TST-531009 · level: unit · module: MOD-site-frame
// guards: THE MENU FOLLOWS THE PROCESS
// given: the main page and no view loaded; once with a setup that also carries menuViews naming a view module that does not exist
// input: startPage({ page: "main", views: [] }); then startPage({ page: "main", views: [], menuViews: ["../tests/site-frame-start.d/not-a-view"] })
// expect: a header, a menu of eight entries that are all links (none a span of class soon) whose hrefs are, in the order
//   Requirements, Use cases, Architecture, Implementation, Tests, Releases, Maintenance, Settings,
//   docs/index.html#requirements, docs/index.html#use-cases, docs/index.html#architecture, docs/index.html#implementation,
//   docs/index.html#tests, docs/index.html#releases, docs/index.html#maintenance, docs/index.html#settings; the selector with the
//   instance first, and the paragraph "This page is not built yet."; the second call is not refused and draws the same eight
//   hrefs, since menuViews is ignored and the missing module is never imported
test("TST-531009 startPage on the main page links every entry into the review pages, loads no view, and ignores menuViews", async () => {
  const hrefs = ["requirements", "use-cases", "architecture", "implementation", "tests", "releases", "maintenance", "settings"].map((key) => `docs/index.html#${key}`);
  const page = await start({ page: "main", views: [], extra: {} });
  assert.equal(all(page.body, "header").length, 1);
  assert.equal(page.menu.children.length, 8);
  assert.ok(page.menu.children.every((entry) => entry.localName === "a" && entry.className !== "soon"));
  assert.deepEqual(page.menu.children.map((entry) => entry.getAttribute("href")), hrefs);
  assert.equal(page.select.children[0].textContent, "acme/instance");
  assert.equal(page.target.textContent, "This page is not built yet.");
  const ignored = await start({ page: "main", views: [], extra: { menuViews: ["../tests/site-frame-start.d/not-a-view"] } });
  assert.deepEqual(ignored.menu.children.map((entry) => entry.getAttribute("href")), hrefs);
});

// TST-531010 · level: unit · module: MOD-site-frame
// guards: THE MENU FOLLOWS THE PROCESS
// given: no page
// input: menuOf("review", ["tests", "requirements"]); menuOf("main", ["use-cases"])
// expect: the eight keys in the order requirements, use-cases, architecture, implementation, tests, releases, maintenance,
//   settings with the labels Requirements, Use cases, Architecture, Implementation, Tests, Releases, Maintenance, Settings; on
//   the review page hrefs #requirements and #tests and null for the other six, whose titles say "not built yet"; on the main
//   page the use-cases entry links into the review pages as docs/index.html#use-cases, and so does every entry of
//   menuOf("main", []): the eight hrefs docs/index.html#<key> for the eight keys, in that order
test("TST-531010 menuOf lists the eight entries in the order of the process and links only the entries a loaded view serves", () => {
  const review = menuOf("review", ["tests", "requirements"]);
  assert.deepEqual(review.map((entry) => entry.key), ["requirements", "use-cases", "architecture", "implementation", "tests", "releases", "maintenance", "settings"]);
  assert.deepEqual(review.map((entry) => entry.label), ["Requirements", "Use cases", "Architecture", "Implementation", "Tests", "Releases", "Maintenance", "Settings"]);
  assert.deepEqual(review.map((entry) => entry.href), ["#requirements", null, null, null, "#tests", null, null, null]);
  for (const entry of review.filter((candidate) => candidate.href === null)) assert.match(entry.title, /not built yet/);
  assert.equal(menuOf("main", ["use-cases"])[1].href, "docs/index.html#use-cases");
  assert.deepEqual(menuOf("main", []).map((entry) => entry.href), review.map((entry) => `docs/index.html#${entry.key}`));
});

// TST-531011 · level: unit · module: MOD-site-frame
// guards: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; A PRODUCT IS NAMED BY ITS ADDRESS
// given: the instance acme/instance, whose review pages stand at https://acme.github.io/instance/docs/index.html and whose main
//   page at https://acme.github.io/instance/index.html, and the products the widget and the app
// input: the address writer for each page, called for the instance, for the widget (repository acme/widget) and for the app
//   (repository team/app); routeOf and productOf read back what it wrote
// expect: for the instance https://acme.github.io/instance/docs/index.html#use-case/id=UC-001 from either page; for the widget
//   …#module/id=MOD-x/product=https%3A%2F%2Fgithub.com%2Facme%2Fwidget; for the app …#release/product=https%3A%2F%2Fgitlab.example.org%2Fteam%2Fapp;
//   read back: name use-case with params { id: "UC-001" }, and the product address of the widget and of the app; none for the instance
test("TST-531011 the address writer writes the address of a review route for the instance or a product in the form routing reads back", async () => {
  const { addressWriter, routeOf, productOf } = await import("../src/site-frame/routing.mjs");
  const docs = "https://acme.github.io/instance/docs/index.html";
  for (const [page, at] of [["review", docs], ["main", "https://acme.github.io/instance/index.html"]]) {
    const write = addressWriter(page, at, "acme/instance", [WIDGET, APP]);
    assert.equal(write("use-case", { id: "UC-001" }, "acme/instance"), `${docs}#use-case/id=UC-001`, page);
    assert.equal(write("module", { id: "MOD-x" }, "acme/widget"), `${docs}#module/id=MOD-x/product=${encoded(WIDGET)}`, page);
    assert.equal(write("release", {}, "team/app"), `${docs}#release/product=${encoded(APP)}`, page);
  }
  const fragment = (address) => address.slice(address.indexOf("#"));
  assert.deepEqual(routeOf(`#use-case/id=UC-001`), { name: "use-case", params: { id: "UC-001" } });
  assert.equal(productOf(fragment(`${docs}#module/id=MOD-x/product=${encoded(WIDGET)}`)), WIDGET);
  assert.equal(productOf(fragment(`${docs}#release/product=${encoded(APP)}`)), APP);
  assert.equal(productOf("#use-case/id=UC-001"), null);
});

// TST-506008 · level: unit · module: MOD-site-frame
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: the pages started by the tests above, each now with the prompt bar, which reads the instance acme/instance when it is drawn;
//   every page of this file was given an offline fetch, and the fetch that stands for the network records what reaches it
// input: the requests the pages made, as the offline fetch and as the network recorded them
// expect: the pages did ask the instance's API (at least one request, every one of them to https://api.github.com/repos/acme/instance,
//   so the check can find what it looks for), and no request reached the network: none left the fixture
test("TST-506008 the pages of this file ask only the offline fetch, and no request leaves the fixture", () => {
  assert.ok(outside.seen.length > 0, "the bar did read the instance, so the offline fetch saw it");
  assert.deepEqual([...new Set(outside.seen)], ["https://api.github.com/repos/acme/instance"]);
  assert.deepEqual(outside.reached, []);
});

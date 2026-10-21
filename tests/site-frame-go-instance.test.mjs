// The `go` of MOD-site-frame's ViewContext reaches a route for the instance itself while a product is chosen (ITM-1042) — docs/architecture/MOD-site-frame.md: ViewContext's
// `go(route, params?: Record<string, string>)`, and the frame's writing of "the address of a route ..., for the instance itself or a product this browser keeps, in the form its routing and
// `chosenProduct` read back". The reading the test takes, since the parameters are strings: `go(route, { product: "" })` names the instance itself, and the fragment it writes holds no
// product; a `go` that names no product keeps the chosen one; one that names another product writes that one.
// Run: node --test tests/site-frame-go-instance.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-042; EVERY SETTING IS REACHED FROM ONE PAGE
// Level: unit
//
// The frame is MOD-site-frame's real startPage in the small DOM of tests/site-frame-dom.mjs, started at the fragment of a product the browser keeps; one recorder route notes the context it
// is given. Nothing reaches the network. Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import "./site-frame-dom.mjs";

const { startPage } = await import("../src/site-frame/index.mjs");
const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");

const turn = () => new Promise((resolve) => setImmediate(resolve));
const storage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key),
    get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null };
};

// The frame started on a product's page; -> { go, location }, restored by `done()`.
async function started() {
  const product = "https://github.com/acme/product";
  const priorLocation = globalThis.location, priorStorage = globalThis.localStorage, priorAdd = window.addEventListener, priorInterval = globalThis.setInterval;
  const location = { hostname: "fork-owner.github.io", pathname: "/fork-agent-m/index.html", hash: `#probe/product=${encodeURIComponent(product)}` };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage() });
  writeSetting(openStore("fork-owner/fork-agent-m"), "products", [product, "https://github.com/acme/other"]);
  window.addEventListener = () => {};
  // The frame's page checks (MOD-notifications) repeat by the clock; here they must not keep the process alive.
  globalThis.setInterval = (...given) => { const timer = priorInterval(...given); timer.unref?.(); return timer; };
  let go = null, chosen;
  await startPage({ page: "main", menuViews: [], views: [{ strategies: [], routes: [{ name: "probe", entry: null, title: "Probe", async render(target, context) { go = context.go; chosen = context.product?.address ?? null; target.replaceChildren(); } }] }] });
  await turn();
  const done = () => {
    document.body.replaceChildren();
    Object.defineProperty(globalThis, "location", { configurable: true, value: priorLocation });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: priorStorage });
    window.addEventListener = priorAdd;
    globalThis.setInterval = priorInterval;
  };
  return { go: (...given) => go(...given), location, chosen, product, selector: document.getElementsByTagName("select")[0], done };
}

// TST-104205 · level: unit · module: MOD-site-frame
// guards: UC-042; EVERY SETTING IS REACHED FROM ONE PAGE
// given: the frame started on the page of a product the browser keeps; the route's go
// input: go("resources", { product: "" })
// expect: the fragment is "#resources", which names no product, so that the frame's routing reads back the instance itself
test("go with the empty product reaches a route of the instance itself while a product is chosen", async () => {
  const page = await started();
  try {
    assert.equal(page.chosen, page.product, "known positive: the product is chosen");
    page.go("resources", { product: "" });
    assert.equal(page.location.hash, "#resources");
  } finally { page.done(); }
});

// TST-104206 · level: unit · module: MOD-site-frame
// guards: UC-042
// given: the same page
// input: go("resources", {}); go("resources", { code: "x" }); go("resources", { product: <another product the browser keeps> })
// expect: counter-proof — a go that names no product keeps the chosen one in its fragment, with the other parameters; one that names another product writes that one, not the chosen one
test("go that names no product keeps the chosen product, and one that names another writes that one", async () => {
  const page = await started();
  try {
    const written = encodeURIComponent(page.product), other = encodeURIComponent("https://github.com/acme/other");
    page.go("resources", {});
    assert.equal(page.location.hash, `#resources/product=${written}`);
    page.go("resources", { code: "x" });
    assert.equal(page.location.hash, `#resources/code=x/product=${written}`);
    page.go("resources", { product: "https://github.com/acme/other" });
    assert.equal(page.location.hash, `#resources/product=${other}`);
  } finally { page.done(); }
});

// TST-1165001 · level: unit · module: MOD-site-frame
// guards: THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE; A PRODUCT IS NAMED BY ITS ADDRESS
// given: the main page on a kept product, with only its own probe route loaded
// input: go to the loaded probe route, then to review routes use-case, spec-entry and settings with the chosen, an explicit and the empty product
// expect: the loaded route keeps the main page's fragment; each unloaded review route navigates to the review page with its literal parameters and the chosen, explicit or absent product
test("TST-1165001 main-page go keeps loaded routes in its hash and navigates unloaded review routes with their product", async () => {
  const page = await started();
  try {
    const chosen = encodeURIComponent(page.product);
    const other = encodeURIComponent("https://github.com/acme/other");
    page.go("probe", { id: "here" });
    assert.equal(page.location.hash, `#probe/id=here/product=${chosen}`);

    page.go("use-case", { id: "UC-001" });
    assert.equal(page.location.href, `https://fork-owner.github.io/fork-agent-m/docs/index.html#use-case/id=UC-001/product=${chosen}`);
    page.go("spec-entry", { id: "2026-10-21-1", product: "https://github.com/acme/other" });
    assert.equal(page.location.href, `https://fork-owner.github.io/fork-agent-m/docs/index.html#spec-entry/id=2026-10-21-1/product=${other}`);
    page.go("settings", { product: "" });
    assert.equal(page.location.href, "https://fork-owner.github.io/fork-agent-m/docs/index.html#settings");
  } finally { page.done(); }
});

// TST-1165002 · level: unit · module: MOD-site-frame
// guards: UC-014; THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
// given: the same main page, whose selector includes + Add product while only probe is loaded
// input: the person selects + Add product
// expect: it navigates to the review page's add-product route, rather than leaving an unloaded main-page hash
test("TST-1165002 the main-page selector adds a product through the review-page navigation", async () => {
  const page = await started();
  try {
    page.selector.value = "+add";
    page.selector.dispatchEvent(new Event("change"));
    assert.equal(page.location.href, "https://fork-owner.github.io/fork-agent-m/docs/index.html#add-product");
  } finally { page.done(); }
});

// MOD-site-frame keeps the route's last lines clear of the prompt bar (ITM-542). The bar stands fixed to the bottom of the window
// (ITM-540), so it takes no room in the page; the footer of class `site-frame-prompt-bar` that holds it takes the bar's height, set when the
// bar is drawn and again whenever the bar changes, with a ResizeObserver where the browser has one, and once, when the bar is drawn,
// where it has none. The Bridge's window draws no bar and gets no such footer.
//
// Run: node --test tests/site-frame-prompt-bar-foot.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-049; THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK
// Level: unit
//
// Each test names its input and states its expected values in its own text; none reads an expected result from the SPEC, a use
// case or an architecture file. The page is the small fixture DOM of tests/site-frame-start.d/dom.mjs, which has no `style` object: a
// style is the element's `style` attribute, a list of `name: value;` declarations (as ITM-540's tests read the bar's). The browser's
// observers are fixtures installed on `globalThis` by the test: a `ResizeObserver` and a `MutationObserver` that keep what they
// observe and the callback they were given, which the test calls the way a browser would. A bar's height is the `offsetHeight` the
// test gives its element. The real MOD-prompt-bar, MOD-job-runner, MOD-runtimes and the real GitHub host run as they are, over a fetch
// that answers the instance and a model endpoint from memory; nothing reaches the network. The counter-proofs (a planted fault in
// src/site-frame/ and the test's failing result) are recorded in the pull request.
//
// Readings the module file leaves open, which the tests state (the pull request names them):
//   - "the bar" is the one element MOD-prompt-bar draws into the footer (<section class="prompt-bar">), the footer's first child.
//   - "takes that height" is the footer's `style` attribute declaring `height` as the bar's `offsetHeight` in pixels, `<n>px`.
//   - "when the bar is drawn" is noticed by a `MutationObserver` on the footer's children; the ResizeObserver observes the bar.

import assert from "node:assert/strict";
import test from "node:test";
import { all, installPage, fixtureStorage } from "./site-frame-start.d/dom.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";
import { until } from "./prompt-bar.d/until.mjs";

const { startPage } = await import("../src/site-frame/index.mjs");

const REVIEW = { hostname: "acme.github.io", pathname: "/instance/docs/index.html" };
const settle = () => new Promise((resolve) => setImmediate(resolve));

// ---------------------------------------------------------------- the instance, the endpoint

const COLUMNS = "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|";
const REGISTER = `# Participants of this instance\n\n${COLUMNS}\n| drafter-a | model endpoint | model-drafter-a | 200000 | — | draft text | Anthropic, USA | endpoint ep1 |\n`;
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const realFetch = globalThis.fetch;
let requested = [];
function installNetwork() {
  requested = [];
  globalThis.fetch = async (url) => {
    const address = String(url);
    requested.push(address);
    const api = /^https:\/\/api\.github\.com\/repos\/acme\/instance(\/.*)?$/.exec(address);
    if (!api) return reply({ message: "Not Found" }, 404);
    const rest = api[1] ?? "";
    if (rest === "") return reply({ default_branch: "main", visibility: "public", private: false, permissions: { push: true }, archived: false, description: "" });
    if (rest.startsWith("/commits/")) return reply({ sha: "c-instance" });
    if (rest.startsWith("/git/trees/")) return reply({ tree: [{ type: "blob", path: "docs/participants.md", sha: "b-participants" }] });
    if (rest.startsWith("/contents/docs/participants.md")) return new Response(REGISTER, { status: 200 });
    return reply({ message: "Not Found" }, 404);
  };
}

// ---------------------------------------------------------------- the browser's observers

// Keep every observer made, with its callback and what it observes; a test calls the callback, as a browser does.
const made = { resize: [], mutation: [] };
class FixtureResizeObserver {
  constructor(callback) { this.callback = callback; this.observed = []; made.resize.push(this); }
  observe(element) { this.observed.push(element); }
  unobserve(element) { this.observed = this.observed.filter((each) => each !== element); }
  disconnect() { this.observed = []; }
}
class FixtureMutationObserver {
  constructor(callback) { this.callback = callback; this.observed = []; made.mutation.push(this); }
  observe(element, options) { this.observed.push({ element, options }); }
  disconnect() { this.observed = []; }
}
function withObservers({ resize }) {
  made.resize = [];
  made.mutation = [];
  globalThis.MutationObserver = FixtureMutationObserver;
  if (resize) globalThis.ResizeObserver = FixtureResizeObserver; else delete globalThis.ResizeObserver;
}
test.afterEach(() => { globalThis.fetch = realFetch; delete globalThis.ResizeObserver; delete globalThis.MutationObserver; });

// The declarations of an element's style attribute, as a name -> value map; empty where it has none.
function declared(node) {
  const style = node.getAttribute("style") ?? "";
  return Object.fromEntries(style.split(";").map((each) => each.trim()).filter(Boolean).map((each) => {
    const at = each.indexOf(":");
    return [each.slice(0, at).trim(), each.slice(at + 1).trim()];
  }));
}

// Starts a page on a fresh fixture, a browser that keeps the endpoint ep1 and the instance token; one route.
async function start(page) {
  installNetwork();
  const fixture = installPage({ ...REVIEW, hash: "#alpha" });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: fixtureStorage() });
  globalThis.setInterval = () => 1;
  const store = openStore("acme/instance");
  writeSetting(store, "endpoint:ep1", { kind: "openai-compatible", url: "https://models.example/v1", model: "model-drafter-a", key: "sk-fixture" });
  writeSetting(store, "github-token", { value: "github_pat_INSTANCE", name: "alice", expires: "2030-01-01" });
  const alpha = { name: "alpha", entry: "requirements", title: "Alpha", async render(target) { target.textContent = "alpha"; } };
  await startPage({ page, views: [{ routes: [alpha], strategies: [] }], menuViews: [] });
  const body = fixture.document.body;
  return { body, footer: all(body, "footer")[0] ?? null };
}

// The page started, the bar drawn into the footer, and the bar given the height `height`; the browser then tells the MutationObserver of
// the footer that its children changed. Resolves with the footer and the bar.
async function pageWithBar(page, height) {
  const it = await start(page);
  await until(() => it.footer.children.length > 0, "the bar is drawn into the footer");
  const bar = it.footer.children[0];
  bar.offsetHeight = height;
  for (const observer of made.mutation) observer.callback([{ type: "childList" }], observer);
  return { ...it, bar };
}

// TST-542001 · level: unit · module: MOD-site-frame
// guards: UC-049
// given: a browser with a ResizeObserver and a MutationObserver; the register offers drafter-a; the bar, once drawn, is 120 pixels high
// input: startPage on the main page, then on the review page; the bar is drawn into the footer; the browser tells the footer's
//   MutationObserver that its children changed
// expect: on each page the footer's style declares height as "120px" — the bar's height — before any ResizeObserver callback; the
//   footer's MutationObserver observes the footer for its children (childList true)
test("TST-542001 the footer takes the height of the bar when the bar is drawn", async () => {
  for (const name of ["main", "review"]) {
    withObservers({ resize: true });
    const it = await pageWithBar(name, 120);
    assert.equal(declared(it.footer).height, "120px", name);
    assert.ok(made.mutation.some((observer) => observer.observed.some((seen) => seen.element === it.footer && seen.options?.childList === true)), `${name}: the footer is observed for its children`);
  }
});

// TST-542002 · level: unit · module: MOD-site-frame
// guards: UC-049
// given: as TST-542001, on the review page, with the bar drawn at 120 pixels and the footer at "120px"
// input: the bar grows to 200 pixels (a conversation, a draft); the browser calls the ResizeObserver's callback; then the bar shrinks to
//   64 pixels and the callback is called again
// expect: the ResizeObserver observes the bar (the footer's first child); the footer's style declares height as "200px" after the first
//   call and "64px" after the second
test("TST-542002 the footer takes the new height whenever the bar changes, with a ResizeObserver", async () => {
  withObservers({ resize: true });
  const it = await pageWithBar("review", 120);
  assert.equal(declared(it.footer).height, "120px");
  const watchers = made.resize.filter((observer) => observer.observed.includes(it.bar));
  assert.equal(watchers.length, 1, "one ResizeObserver observes the bar");
  it.bar.offsetHeight = 200;
  watchers[0].callback([{ target: it.bar }], watchers[0]);
  assert.equal(declared(it.footer).height, "200px");
  it.bar.offsetHeight = 64;
  watchers[0].callback([{ target: it.bar }], watchers[0]);
  assert.equal(declared(it.footer).height, "64px");
});

// TST-542003 · level: unit · module: MOD-site-frame
// guards: UC-049
// given: a browser with a MutationObserver and no ResizeObserver; the register offers drafter-a; the bar, once drawn, is 120 pixels high
// input: startPage on the review page; the bar is drawn and the MutationObserver is told; then the bar grows to 200 pixels
// expect: startPage resolves without error; after the bar is drawn the footer's style declares height as "120px"; after the bar has
//   grown it still declares "120px" (it is set once, when the bar is drawn, nothing observes the bar); the page made no ResizeObserver
test("TST-542003 without a ResizeObserver the footer takes the bar's height once, when the bar is drawn", async () => {
  withObservers({ resize: false });
  const it = await pageWithBar("review", 120);
  assert.equal(declared(it.footer).height, "120px");
  it.bar.offsetHeight = 200;
  assert.equal(declared(it.footer).height, "120px", "nothing tells the frame that the bar grew");
  assert.deepEqual(made.resize, []);
});

// TST-542004 · level: unit · module: MOD-site-frame
// guards: UC-049
// given: a browser with a ResizeObserver and a MutationObserver; the register offers drafter-a
// input: startPage on the bridge page
// expect: the body's children are header, section, main — there is no footer; no ResizeObserver and no MutationObserver was made, so
//   no element of the page was given a height for a bar; the register was not read
test("TST-542004 the Bridge's window, which draws no bar, gets no such footer", async () => {
  withObservers({ resize: true });
  const it = await start("bridge");
  await settle();
  assert.deepEqual(it.body.children.map((child) => child.localName), ["header", "section", "main"]);
  assert.equal(it.footer, null);
  assert.deepEqual([made.resize.length, made.mutation.length], [0, 0]);
  assert.equal(requested.filter((address) => address.includes("participants.md")).length, 0);
});

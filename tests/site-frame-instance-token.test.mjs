// A token stored on one page of the review pages is used by the next page, opened without a reload (ITM-869). MOD-site-frame's
// startPage connects the instance's host and hands it to every route through ViewContext.instance.host; the host a route is given
// calls through a connection made with the GitHub token stored at that moment and with the secrets stored at that moment, as the
// connection of the frame's own startSite makes it (token, tokenName and secrets: secretValues(store)).
// The routes of the fixture view stand for the pages of the person's path: `setup` writes the setting `github-token` into the context's
// store as src/settings-pages/setup.mjs:101 does on "Store and check" (writeSetting(store, "github-token", { value, name, expires,
// stored })), and `next` is a page opened afterwards that asks the instance's host. The Clear of the Settings line removes the
// setting with clearSetting. Callers read first (AGENTS.md 6a.1): tests/site-frame-start-page.test.mjs (TST-531005) starts a page in
// this fixture (tests/site-frame-start.d/dom.mjs) with a fetch that records each request's Authorization header; this file copies
// that pattern.
//
// Run: node --test tests/site-frame-instance-token.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-042; A CLEAR IS A REAL CLEAR; NO SECRET IN THE REPOSITORY; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// Level: unit
//
// Each test names its input and states its expected values in its own text; none reads an expected result from the SPEC, a use
// case or an architecture file. The fetch of the fixture records every request and refuses it, so no request leaves the fixture
// (the last test checks it). The counter-proofs (a planted fault in src/site-frame/ and the test's failing result) are recorded in
// the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { changeFragment, installPage, outside } from "./site-frame-start.d/dom.mjs";
import { openStore, writeSetting, clearSetting } from "../src/browser-store/index.mjs";

const { startPage } = await import("../src/site-frame/index.mjs");

const REVIEW = { hostname: "acme.github.io", pathname: "/instance/docs/index.html" };
const INSTANCE_API = "https://api.github.com/repos/acme/instance";
const TOKEN_A = "github_pat_FIRST0123456789abcdefghijkl";
const TOKEN_B = "github_pat_SECOND123456789abcdefghijkl";
const BRIDGE_AT_START = "bridge-token-AT-START-0123456789";
const BRIDGE_LATER = "bridge-token-STORED-LATER-0123456789";
const stored = (value) => ({ value, name: "Agent M · acme/instance", expires: "2030-01-01", stored: "2026-10-18" });

const asked = [];
const seen = { contexts: [], finished: [] };
let onSetup = () => {};
const until = async (condition, ms = 3000) => {
  const end = Date.now() + ms;
  while (!condition()) {
    if (Date.now() > end) throw new Error("the page did not reach the state the test waits for");
    await new Promise((resolve) => setImmediate(resolve));
  }
};

const VIEW = { strategies: [], routes: [
  { name: "setup", entry: "settings", title: "setup", async render(target, context) { onSetup(context.store); target.textContent = "setup"; seen.finished.push("setup"); } },
  { name: "next", entry: "settings", title: "next", async render(target, context) {
    seen.contexts.push(context);
    await context.instance.host.repositoryInfo().catch(() => {});
    target.textContent = "next";
    seen.finished.push("next");
  } },
] };

// Starts the review page of acme/instance on the route `setup`, with the stored settings given, the fetch recording every request.
async function start({ settings = {} } = {}) {
  asked.length = 0;
  seen.contexts.length = 0;
  seen.finished.length = 0;
  onSetup = () => {};
  const fixture = installPage({ ...REVIEW, hash: "#setup" });
  globalThis.fetch = async (url, init) => { asked.push({ url: String(url), authorization: init?.headers?.Authorization ?? null }); throw new TypeError("offline"); };
  globalThis.setInterval = () => 1;
  const store = openStore("acme/instance");
  for (const [key, value] of Object.entries(settings)) writeSetting(store, key, value);
  await startPage({ page: "review", views: [VIEW] });
  await until(() => seen.finished.includes("setup"));
  return { ...fixture, store };
}

// The person opens a route of the page without a reload and the page has drawn it; -> the requests to the instance's API that were
// sent from then on.
async function openRoute(page, name) {
  asked.length = 0;
  seen.finished.length = 0;
  changeFragment(page, `#${name}`);
  await until(() => seen.finished.includes(name));
  return asked.filter((request) => request.url.startsWith(INSTANCE_API));
}

const commit = (host, text) => host.commitFiles({ branch: "main", expectedHead: "0".repeat(40), files: [{ path: "notes.md", text }], message: "notes" });

// TST-869001 · level: unit · module: MOD-site-frame
// guards: UC-042; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: the review page on the route setup in a browser that keeps no token
// input: the route setup stores the setting github-token { value: github_pat_FIRST… } as "Store and check" does; then the person opens
//   the route next, without a reload
// expect: the instance's requests of the page next are exactly one, to https://api.github.com/repos/acme/instance, carrying the
//   authorisation "Bearer github_pat_FIRST0123456789abcdefghijkl"
test("TST-869001 a token stored on the setup route is sent by the instance's requests of the next page, opened without a reload", async () => {
  const page = await start();
  onSetup = (store) => writeSetting(store, "github-token", stored(TOKEN_A));
  await openRoute(page, "setup");
  const requests = await openRoute(page, "next");
  assert.deepEqual(requests, [{ url: INSTANCE_API, authorization: `Bearer ${TOKEN_A}` }]);
});

// TST-869002 · level: unit · module: MOD-site-frame
// guards: UC-042; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: the review page on the route setup in a browser that keeps the token github_pat_FIRST…
// input: the route setup replaces it by github_pat_SECOND…; the person opens the route next
// expect: the instance's requests of the page next are exactly one, carrying "Bearer github_pat_SECOND123456789abcdefghijkl", and no
//   request carries the first token
test("TST-869002 a token replaced on the setup route is the one the next page sends, not the one the page started with", async () => {
  const page = await start({ settings: { "github-token": stored(TOKEN_A) } });
  onSetup = (store) => writeSetting(store, "github-token", stored(TOKEN_B));
  await openRoute(page, "setup");
  const requests = await openRoute(page, "next");
  assert.deepEqual(requests, [{ url: INSTANCE_API, authorization: `Bearer ${TOKEN_B}` }]);
  assert.equal(asked.some((request) => request.authorization === `Bearer ${TOKEN_A}`), false);
});

// TST-869003 · level: unit · module: MOD-site-frame
// guards: UC-042; A CLEAR IS A REAL CLEAR
// given: the review page on the route setup in a browser that keeps the token github_pat_FIRST…
// input: the token's setting is cleared (clearSetting, as the Clear of the Settings line does); the person opens the route next
// expect: the instance's requests of the page next are exactly one, carrying no authorisation (null), and no request carries the
//   cleared token
test("TST-869003 a token cleared before the next page is opened is not sent by that page", async () => {
  const page = await start({ settings: { "github-token": stored(TOKEN_A) } });
  clearSetting(page.store, "github-token");
  const requests = await openRoute(page, "next");
  assert.deepEqual(requests, [{ url: INSTANCE_API, authorization: null }]);
  assert.equal(asked.some((request) => request.authorization === `Bearer ${TOKEN_A}`), false);
});

// TST-869004 · level: unit · module: MOD-site-frame
// guards: NO SECRET IN THE REPOSITORY
// given: the review page started in a browser that keeps the token github_pat_FIRST… and the Bridge token bridge-token-AT-START-…
// input: the person opens the route next and its host is asked to commit notes.md whose text holds the Bridge token
// expect: the commit fails with a HostError named SecretRefused, and no request is sent for it
test("TST-869004 the host a route is given refuses a commit that holds a secret stored when the page started", async () => {
  const page = await start({ settings: { "github-token": stored(TOKEN_A), "bridge:b0": { token: BRIDGE_AT_START } } });
  await openRoute(page, "next");
  asked.length = 0;
  await assert.rejects(commit(seen.contexts.at(-1).instance.host, `bridge ${BRIDGE_AT_START}`), { name: "SecretRefused" });
  assert.deepEqual(asked, []);
});

// TST-869005 · level: unit · module: MOD-site-frame
// guards: NO SECRET IN THE REPOSITORY
// given: the review page started in a browser that keeps no token and no Bridge
// input: after the page started, the route setup stores the token github_pat_SECOND… and the Bridge token bridge-token-STORED-LATER-…;
//   the person opens the route next and its host is asked to commit notes.md holding the Bridge token, then notes.md holding the token
// expect: both commits fail with a HostError named SecretRefused, and no request is sent for either
test("TST-869005 the host a route is given refuses a commit that holds a secret stored after the page started", async () => {
  const page = await start();
  onSetup = (store) => {
    writeSetting(store, "github-token", stored(TOKEN_B));
    writeSetting(store, "bridge:b1", { token: BRIDGE_LATER });
  };
  await openRoute(page, "setup");
  await openRoute(page, "next");
  asked.length = 0;
  const host = seen.contexts.at(-1).instance.host;
  await assert.rejects(commit(host, `bridge ${BRIDGE_LATER}`), { name: "SecretRefused" });
  await assert.rejects(commit(host, `token ${TOKEN_B}`), { name: "SecretRefused" });
  assert.deepEqual(asked, []);
});

// TST-869006 · level: unit · module: MOD-site-frame
// guards: UC-042
// given: the review page of acme/instance in a browser that keeps no token
// input: the person opens the route next
// expect: the page's context names the repository acme/instance and its host offers repositoryInfo and commitFiles as functions; the
//   instance's requests of the page next are exactly one, carrying no authorisation (null); and no request of any test of this file
//   reached the network
test("TST-869006 without a stored token the instance host is the instance's, sends no authorisation, and nothing reaches the network", async () => {
  const page = await start();
  const requests = await openRoute(page, "next");
  const { instance } = seen.contexts.at(-1);
  assert.equal(instance.repository, "acme/instance");
  assert.deepEqual([typeof instance.host.repositoryInfo, typeof instance.host.commitFiles], ["function", "function"]);
  assert.deepEqual(requests, [{ url: INSTANCE_API, authorization: null }]);
  assert.deepEqual(outside.reached, []);
});

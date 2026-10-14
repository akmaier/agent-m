// Independent release tests by developer-terra-e, who implemented no token-failure behavior.
// Module: MOD-settings-pages; MOD-repository-hosts
// Guards: UC-042
// Level: release
// Run: node --test tests/release-uc-042-token-failures.test.mjs
// The app-harness controls every request. The live Chrome 401 cause is not diagnosed by these fixtures.

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, repoServer, richDocument, press, TOKEN } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const key = (name) => `agent-m:${INSTANCE}:${name}`;
const LAST_TEST = key("last-test:github-token");
const RENEW = "https://github.com/settings/personal-access-tokens";
const RESET = "2030-01-02T03:04:05.000Z";
const tokenEntries = () => ({ [key("github-token")]: JSON.stringify({ value: TOKEN, name: "GitHub token",
  expires: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) }) });
const entries = () => Object.fromEntries(Array.from({ length: localStorage.length }, (_, index) => {
  const name = localStorage.key(index); return [name, localStorage.getItem(name)];
}));
const controls = (root, className, found = []) => {
  for (const child of root?.children ?? []) {
    if (typeof child !== "object" || !child) continue;
    if (child.className?.split(/\s+/).includes(className)) found.push(child);
    controls(child, className, found);
  }
  return found;
};
const one = (root, className) => {
  const found = controls(root, className);
  assert.equal(found.length, 1, `one public ${className} control`);
  return found[0];
};

async function world() {
  const state = { failure: null, answers: [] };
  state.server = await repoServer({ files: { "SPEC.md": "# Fixture specification\n", "docs/use-cases/README.md": "# Use cases\n" }, handlers: [
    (url, init) => {
      if (url.origin !== "https://api.github.com" || url.pathname !== `/repos/${INSTANCE}` || init.method !== "GET") return undefined;
      assert.equal(init.headers?.Authorization, `Bearer ${TOKEN}`, "the actual public Test uses the stored token");
      state.answers.push(state.failure ?? "200");
      if (state.failure === "network") throw new TypeError("Fixture network unavailable");
      const status = state.failure === "refused" ? 401 : state.failure ? 403 : 200;
      const headers = { "content-type": "application/json", ...(state.failure === "rate" ? {
        "x-ratelimit-remaining": "0", "x-ratelimit-limit": "5000",
        "x-ratelimit-reset": String(Date.parse(RESET) / 1000),
      } : {}) };
      return new Response(JSON.stringify(status === 200 ? { private: false, default_branch: "main", permissions: { push: true } }
        : { message: status === 401 ? "Bad credentials" : "Fixture request refused" }), { status, headers });
    },
  ] });
  return state;
}

async function settings(state, stored = tokenEntries()) {
  const page = await openDashboard({ server: state.server, hash: "#uc", token: null, entries: stored });
  const dom = richDocument(), main = dom.byId("main"), replace = main.replaceChildren.bind(main);
  let mounted = [];
  main.replaceChildren = (...nodes) => { mounted = nodes; replace(...nodes); };
  await page.go("#settings");
  const repositories = mounted.find((node) => node.className?.split(/\s+/).includes("settings-tab-panel") && node.textContent.includes("Repositories"));
  assert.ok(repositories, "the public Settings route mounts Repositories");
  const row = controls(repositories, "settings-repository").find((node) => node.children.some((child) => child?.localName === "h3" && child.textContent === "GitHub token"));
  assert.ok(row, "the public Repositories pane mounts the stored GitHub token");
  return { page, row };
}

async function testToken(state, view) {
  const before = state.answers.length;
  await press(state.server, one(view.row, "settings-repository-test"));
  assert.deepEqual(state.answers.slice(before), [state.failure ?? "200"], "one Test click makes one controlled repository request");
  return one(view.row, "settings-repository-result").textContent;
}

async function works(state, view) {
  assert.match(await testToken(state, view), /repository token is working/i);
  const raw = localStorage.getItem(LAST_TEST), saved = JSON.parse(raw);
  assert.equal(saved.outcome, "working");
  assert.ok(Number.isFinite(Date.parse(saved.at)), "the public successful Test records its time");
  assert.ok(one(view.row, "settings-repository-status").textContent.includes(saved.at));
  return raw;
}

async function noRefusalAfterRouteAndReload(state, view) {
  state.failure = null;
  await view.page.go("#uc");
  assert.equal(view.page.el("token-banner"), "", "changing route does not turn a noncredential failure into a token banner");
  const again = await settings(state, entries());
  assert.equal(again.page.el("token-banner"), "", "a fresh dashboard load has no persisted refusal or expiry banner");
  return again;
}

async function noncredential(failure, diagnostic, priorWorking) {
  const state = await world(), view = await settings(state);
  const before = priorWorking ? await works(state, view) : localStorage.getItem(LAST_TEST);
  if (!priorWorking) assert.equal(before, null, "known positive: the stored token has never been tested");
  state.failure = failure;
  const message = await testToken(state, view);
  assert.match(message, diagnostic, "the current request failure is shown separately at the public Test control");
  assert.doesNotMatch(message, /expired|regenerated|deleted|revoked/i, "a noncredential request failure does not diagnose the token");
  assert.equal(localStorage.getItem(LAST_TEST), before, "the previous conclusive result and original timestamp stay byte-identical; absent stays absent");
  const again = await noRefusalAfterRouteAndReload(state, view);
  assert.equal(localStorage.getItem(LAST_TEST), before, "route and fresh-load reads do not rewrite the last test");
  if (priorWorking) {
    assert.ok(one(again.row, "settings-repository-status").textContent.includes(JSON.parse(before).at));
    assert.match(one(again.row, "settings-repository-status").textContent, /Works/);
  } else assert.doesNotMatch(one(again.row, "settings-repository-status").textContent, /Refused|Last successful test/);
  assert.equal(state.server.writes.length, 0, "testing credentials writes no repository artifact");
}

// TST-475301
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: a stored token with an expiry ninety days away; the controlled repository answers HTTP 200
// input: public Settings Test, then UC route and a fresh dashboard load retaining browser storage
// expect: one request records working with its actual timestamp; the same record survives reload with no token banner
test("TST-475301: a public successful token Test persists its working result and date", async () => {
  const state = await world(), view = await settings(state), before = await works(state, view);
  const again = await noRefusalAfterRouteAndReload(state, view);
  assert.equal(localStorage.getItem(LAST_TEST), before);
  assert.ok(one(again.row, "settings-repository-status").textContent.includes(JSON.parse(before).at));
});

// TST-475302
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// given: a successful public token Test followed by HTTP 403 with zero remaining account requests and a reset time
// input: Test again, navigate to UC, then reload the real dashboard with the persisted storage
// expect: current error names account rate limit and reset; original working bytes and timestamp survive with no refusal/expiry banner
test("TST-475302: account rate limiting preserves the successful token test through route and reload", async () => {
  await noncredential("rate", /request limit.*account.*used up.*2030-01-02T03:04:05\.000Z/s, true);
});

// TST-475303
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: a successful public token Test followed by HTTP 403 without rate-limit headers
// input: Test again, navigate to UC, then reload with the persisted browser storage
// expect: current error names missing permission; original working bytes and timestamp survive with no refusal/expiry banner
test("TST-475303: permission failure preserves the successful token test without a persisted banner", async () => {
  await noncredential("permission", /lacks.*permission|lacks.*Metadata/i, true);
});

// TST-475304
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: a successful public token Test followed by a controlled network rejection
// input: Test again, navigate to UC, then reload with the persisted browser storage
// expect: current error names reachability; original working bytes and timestamp survive with no refusal/expiry banner
test("TST-475304: network failure preserves the successful token test without a persisted banner", async () => {
  await noncredential("network", /could not be reached.*Fixture network unavailable/i, true);
});

// TST-475305
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// given: a stored token has no previous test; the controlled repository rate-limits the request
// input: public Test, navigate to UC and reload with the persisted browser storage
// expect: current rate-limit error is shown; last-test stays absent and no refusal/expiry banner is created
test("TST-475305: a first rate-limited Test does not manufacture credential refusal evidence", async () => {
  await noncredential("rate", /request limit.*used up/i, false);
});

// TST-475306
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: a stored token has no previous test; the controlled repository denies a permission
// input: public Test, navigate to UC and reload with the persisted browser storage
// expect: current permission error is shown; last-test stays absent and no refusal/expiry banner is created
test("TST-475306: a first permission failure leaves the token's last-test evidence absent", async () => {
  await noncredential("permission", /lacks.*permission|lacks.*Metadata/i, false);
});

// TST-475307
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: a stored token has no previous test; its request encounters a controlled network failure
// input: public Test, navigate to UC and reload with the persisted browser storage
// expect: current network error is shown; last-test stays absent and no refusal/expiry banner is created
test("TST-475307: a first network failure leaves the token's last-test evidence absent", async () => {
  await noncredential("network", /could not be reached.*Fixture network unavailable/i, false);
});

// TST-475308
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
// given: a successful public Test, then a controlled HTTP 401 with no established expiry/revocation cause
// input: public Test again and inspect its immediate request error and the token's renewal control
// expect: refused is recorded; authentication request refusal names GitHub token and renewal without asserting expiry or another unproven cause
test("TST-475308: a genuine 401 records refusal but does not assert why authentication failed", async () => {
  const state = await world(), view = await settings(state); await works(state, view);
  state.failure = "refused";
  const message = await testToken(state, view);
  assert.equal(JSON.parse(localStorage.getItem(LAST_TEST)).outcome, "refused", "401 is conclusive refusal evidence");
  assert.match(one(view.row, "settings-repository-status").textContent, /Refused/);
  assert.match(message, /GitHub token/); assert.match(message, /Renew/i);
  assert.equal(one(view.row, "settings-repository-renew").href, RENEW);
  assert.match(message, /authentication request/i, "the failed authentication request is named, not an assumed cause");
  assert.match(message, /refused/i);
  assert.doesNotMatch(message, /expired|regenerated|deleted|revoked/i, "a 401 does not establish expiry, regeneration, deletion or revocation");
});

// TST-475309
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// given: a public HTTP 401 Test already recorded a conclusive refused result, followed by rate limiting
// input: public Test once more with controlled account-rate-limit headers
// expect: the current rate error is separate and the older refused record and original timestamp are preserved byte-for-byte
test("TST-475309: rate limiting does not rewrite an earlier conclusive token refusal", async () => {
  const state = await world(), view = await settings(state);
  state.failure = "refused"; await testToken(state, view);
  const before = localStorage.getItem(LAST_TEST); assert.equal(JSON.parse(before).outcome, "refused");
  state.failure = "rate"; assert.match(await testToken(state, view), /request limit.*used up/i);
  assert.equal(localStorage.getItem(LAST_TEST), before, "the prior refused outcome and its original timestamp remain unchanged");
});

// TST-475310
// level: release
// module: MOD-settings-pages; MOD-repository-hosts
// guards: UC-042; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// given: a successful public Test, then a rate-limited Test whose immediate result correctly names the account limit
// input: navigate to UC and load the real dashboard afresh from the persisted storage; later requests answer 200
// expect: both public banner outputs are empty, so neither route nor reload turns the prior rate failure into an expiry/refusal claim
test("TST-475310: route and fresh reload never show token-expiry banners for the preceding rate failure", async () => {
  const state = await world(), view = await settings(state); await works(state, view);
  state.failure = "rate"; assert.match(await testToken(state, view), /request limit.*account.*used up/i);
  state.failure = null;
  await view.page.go("#uc");
  const routeBanner = view.page.el("token-banner");
  const again = await settings(state, entries());
  const reloadBanner = again.page.el("token-banner");
  assert.deepEqual([routeBanner, reloadBanner], ["", ""], "actual UC-route and fresh-load banners must not claim this token was refused or expired");
});

// An expired Microsoft sign-in renewed on the stored connection (ITM-993; UC-037 3b: "The sign-in expires. At the next use, the dashboard asks for the provider's sign-in again, in the
// provider's window; nothing else changes."), and the route `mailbox` opened with the stored connection's fields — MOD-settings-pages' route `mailbox` and the Settings page, as
// docs/architecture/MOD-settings-pages.md states them: "for Microsoft 365 the app registration's steps and the sign-in with its permissions named before the provider's window opens".
// Run: node --test tests/settings-pages-mailbox-renewal.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-037; AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN; ONE CLICK PER DECISION
// Level: unit
//
// The document is the small DOM of tests/site-frame-dom.mjs, imported unchanged; the sign-in is the fake of tests/settings-pages-mailbox-microsoft.test.mjs (a stand-in for the library's
// client at globalThis.msal), the mailbox Microsoft Graph answered by a fake of fetch; the store is a Map-backed localStorage. The readings the item takes, which the pull request names:
//   - After a Test that finds SignInExpired, the connected mailbox's line offers *Sign in with Microsoft*. One click signs in with the stored client identifier and address, and writes
//     the stored connection again with the signed-in account in `graph.account` and nothing else changed: the address, folders, places and client identifier byte for byte. The click
//     does not test; the next *Test* does.
//   - A sign-in that fails (declined, cancelled) changes nothing that is stored and says why.
//   - The route `mailbox`, opened with a stored connection, shows its fields: address, route, folders, the places ticked, the client identifier, or the IMAP servers, account and Bridge. It
//     shows no password and no token: a secret is never put back into a field.
// The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";

const { view } = await import("../src/settings-pages/index.mjs");
const { openStore, readSetting, writeSetting } = await import("../src/browser-store/index.mjs");

const INSTANCE = "fixture/instance";
const CLIENT = "11111111-2222-3333-4444-555555555555";
const ADDRESS = "reports@example.test";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.SECRET-ACCESS-TOKEN";
const SCOPES = ["Mail.ReadWrite", "Mail.Send", "offline_access"];
const OLD_ACCOUNT = "old.account@example.test";
const ACCOUNT = "signed.in@example.test";
const SIGNED_IN = { account: { username: ACCOUNT, homeAccountId: "x.y", tenantId: "t" }, accessToken: TOKEN, scopes: SCOPES };
const libraryError = (name, errorCode, errorMessage) => Object.assign(new Error(`${errorCode}: ${errorMessage}`), { name, errorCode, errorMessage, subError: "" });

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}
function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child.nodeType === 1) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => (node.className ?? "").split(" ").includes(name));
const one = (root, name) => { const found = byClass(root, name); assert.equal(found.length, 1, `exactly one .${name}`); return found[0]; };
const settle = () => new Promise((resolve) => setTimeout(resolve, 10));
const fire = async (node, type) => { node.dispatchEvent(new Event(type)); await settle(); };
const click = (node) => fire(node, "click");
const put = async (node, value) => { node.value = value; await fire(node, "change"); };
const folded = (root) => byClass(root, "explain");

// The stand-in for the library's client. login: what loginPopup answers — an Error to throw, or the result — or a function of the page asked just before the window opens; silent: what
// acquireTokenSilent answers, an Error to throw or the token's answer. Everything it is asked is recorded.
function standIn({ login = SIGNED_IN, silent = { accessToken: TOKEN, scopes: SCOPES }, page = null } = {}) {
  const seen = { configs: [], logins: [], silent: [], pageAtLogin: [] };
  const accounts = [];
  globalThis.msal = {
    createStandardPublicClientApplication: async (config) => {
      seen.configs.push(structuredClone(config));
      return {
        loginPopup: async (request) => {
          seen.logins.push(structuredClone(request));
          seen.pageAtLogin.push(page?.()?.textContent ?? "");
          const answer = typeof login === "function" ? login(seen.logins.length) : login;
          if (answer instanceof Error) throw answer;
          accounts.push(answer.account);
          return answer;
        },
        getAllAccounts: () => accounts,
        acquireTokenSilent: async (request) => {
          seen.silent.push(structuredClone({ scopes: request.scopes }));
          const answer = typeof silent === "function" ? silent(seen.silent.length) : silent;
          if (answer instanceof Error) throw answer;
          return answer;
        },
      };
    },
  };
  return seen;
}

const PARTICIPANTS = `# Participants of this instance

**REGISTER**

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| a-claude | CLI agent | example-model | 200000 | — | draft text | this machine | bridge lab-pc agent claude |
| b-claude | CLI agent | example-model | 200000 | — | draft text | Anthropic, a provider in the USA | bridge laptop agent claude |
`;
const STORED_GRAPH = { address: ADDRESS, route: "graph", folders: ["INBOX", "Receipts"], places: [{ place: "this machine", outsideEu: false }], graph: { clientId: CLIENT, account: OLD_ACCOUNT } };
const STORED_IMAP = { address: ADDRESS, route: "imap", folders: ["INBOX"], places: [{ place: "this machine", outsideEu: false }],
  imap: { bridge: "laptop", jumpHostNoted: false, imap: { host: "imap.example.test", port: 993, security: "tls" }, smtp: { host: "smtp.example.test", port: 465, security: "tls" },
    account: "imap.user@example.test", password: "app-password-constructed-001" } };

// A browser with a stored mailbox; Graph answers as `graph` says (default: a mailbox that works).
function browser(t, { mailbox }) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  Object.defineProperty(globalThis, "crypto", { configurable: true, value: webcrypto });
  const store = openStore(INSTANCE);
  writeSetting(store, "mailbox", mailbox);
  writeSetting(store, "bridge:laptop", { address: "http://127.0.0.1:4711", token: "laptop-token" });
  const requests = [], went = [];
  const priorFetch = globalThis.fetch, priorLocation = Object.getOwnPropertyDescriptor(globalThis, "location");
  Object.defineProperty(globalThis, "location", { configurable: true, value: { hostname: "fixture.github.io", pathname: "/instance/", origin: "https://fixture.github.io", href: "https://fixture.github.io/instance/" } });
  globalThis.fetch = async (url, init = {}) => {
    requests.push({ url: String(url), init });
    const text = String(url);
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
    if (text.startsWith("https://login.microsoftonline.com/")) return new Response("{}", { status: 400 });
    if (text.includes("/me/mailFolders/inbox?")) return json({ totalItemCount: 12 });
    if (text.includes("/me/mailFolders?")) return json({ value: [{ totalItemCount: 3 }] });
    if (text.includes("/me/mailFolders/drafts?") || text.includes("/me/mailFolders/sentitems?")) return json({ id: "folder" });
    return json({}, 404);
  };
  t.after(() => { globalThis.fetch = priorFetch; if (priorLocation) Object.defineProperty(globalThis, "location", priorLocation); else delete globalThis.location; });
  const host = { repositoryInfo: async () => ({ defaultBranch: "main", canWrite: true }),
    readSnapshot: async () => ({ paths: ["docs/participants.md"], blob: () => "b".repeat(40), read: async (path) => (path === "docs/participants.md" ? PARTICIPANTS : null) }),
    commitFiles: async () => { throw new Error("nothing is committed"); } };
  const context = { instance: { repository: INSTANCE, host }, product: null, store, go: (...args) => went.push(args) };
  return { store, requests, went,
    async open(name) { const target = document.createElement("div"); document.body.append(target); await view.routes.find((candidate) => candidate.name === name).render(target, context, {}); await settle(); return target; } };
}
const graphRequests = (b) => b.requests.filter((request) => request.url.startsWith("https://graph.microsoft.com/"));
const buttonsOf = (root, text) => descendants(root, (node) => node.localName === "button" && node.textContent === text);
// The first token request finds the sign-in expired; later ones are answered.
const expiredOnce = () => standIn({ silent: (n) => (n === 1 ? libraryError("InteractionRequiredAuthError", "interaction_required", "the refresh token has expired") : { accessToken: TOKEN, scopes: SCOPES }) });
const line = (shown) => one(shown, "mailbox-setting");

// TST-993001 · level: unit · module: MOD-settings-pages
// guards: UC-037 (3b); AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
// given: a stored Microsoft 365 mailbox whose sign-in has expired: the token request finds the refresh token run out
// input: the Settings page; Test on the mailbox line
// expect: the line says the sign-in has expired and offers one Sign in with Microsoft; no request reaches Microsoft Graph; the connection stays stored; the test is recorded as refused
test("settings — Test finds an expired Microsoft sign-in and the line offers Sign in with Microsoft", async (t) => {
  const b = browser(t, { mailbox: STORED_GRAPH });
  expiredOnce();
  const shown = await b.open("settings");
  assert.equal(buttonsOf(line(shown), "Sign in with Microsoft").length, 0, "known positive: before the test there is nothing to renew");
  await click(one(line(shown), "mailbox-test"));
  assert.match(one(line(shown), "mailbox-line-result").textContent, /sign-in has expired/);
  assert.equal(buttonsOf(line(shown), "Sign in with Microsoft").length, 1);
  assert.equal(graphRequests(b).length, 0);
  assert.equal(readSetting(b.store, "last-test:mailbox").outcome, "refused");
  assert.deepEqual(readSetting(b.store, "mailbox"), STORED_GRAPH);
});

// TST-993002 · level: unit · module: MOD-settings-pages
// guards: UC-037 (3b); AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN; ONE CLICK PER DECISION
// given: the expired sign-in of the previous test, with the stored client identifier, address, two folders and a place
// input: one click on Sign in with Microsoft; then Test
// expect: the window opens once, for the stored client identifier and the stored address as the login hint, asking for the three permissions; the stored `mailbox` is the same entry apart from graph.account, which is the signed-in account — address, route, folders, places and client identifier unchanged —; the click writes no record of a test; the next Test works and is recorded as working
test("settings — one click renews the sign-in on the stored connection, which keeps everything but the account", async (t) => {
  const b = browser(t, { mailbox: STORED_GRAPH });
  const seen = expiredOnce();
  const shown = await b.open("settings");
  await click(one(line(shown), "mailbox-test"));
  const before = JSON.stringify(readSetting(b.store, "mailbox"));
  await click(buttonsOf(line(shown), "Sign in with Microsoft")[0]);
  assert.equal(seen.logins.length, 1, "the window opens once");
  assert.equal(seen.configs[0].auth.clientId, CLIENT, "for the stored client identifier");
  assert.equal(seen.logins[0].loginHint, ADDRESS, "offering the stored address");
  assert.deepEqual(seen.logins[0].scopes.slice().sort(), [...SCOPES].sort());
  const after = readSetting(b.store, "mailbox");
  assert.deepEqual(after, { ...STORED_GRAPH, graph: { clientId: CLIENT, account: ACCOUNT } });
  assert.equal(JSON.stringify({ ...after, graph: { ...after.graph, account: OLD_ACCOUNT } }), before, "byte for byte but the account");
  assert.equal(readSetting(b.store, "last-test:mailbox").outcome, "refused", "the click tests nothing: the record of the last test stands");
  assert.equal(graphRequests(b).length, 0);
  await click(one(line(shown), "mailbox-test"));
  assert.equal(readSetting(b.store, "last-test:mailbox").outcome, "working");
  assert.match(one(line(shown), "mailbox-state").textContent, /connected; last successful test/);
  assert.ok(graphRequests(b).length > 0, "now Microsoft Graph is asked");
});

// TST-993003 · level: unit · module: MOD-settings-pages
// guards: UC-037 (3b); THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING
// given: the expired sign-in; the provider's window is closed without signing in (SignInCancelled), then a permission is declined
// input: Sign in with Microsoft, twice
// expect: each time the line says why and the stored connection is exactly as it was; nothing is renewed
test("settings — a sign-in that fails changes nothing that is stored", async (t) => {
  const b = browser(t, { mailbox: STORED_GRAPH });
  expiredOnce();
  const shown = await b.open("settings");
  await click(one(line(shown), "mailbox-test"));
  for (const [name, extra, words] of [["SignInCancelled", {}, /cancelled|closed|not signed in/i], ["PermissionDeclined", { permission: "Mail.Send" }, /Mail\.Send/]]) {
    standIn({ login: Object.assign(new Error(name), { name, ...extra }) });
    await click(buttonsOf(line(shown), "Sign in with Microsoft")[0]);
    assert.match(one(line(shown), "mailbox-line-result").textContent, words, name);
    assert.deepEqual(readSetting(b.store, "mailbox"), STORED_GRAPH, name);
  }
});

// TST-993004 · level: unit · module: MOD-settings-pages
// guards: UC-037 (3b)
// given: a stored IMAP connection whose test fails with the mail server's refusal, and a Microsoft connection whose account the library knows and whose Graph refuses a permission (403)
// input: Test on each line
// expect: both tests fail and neither line offers Sign in with Microsoft: it is offered after SignInExpired only
test("settings — Sign in with Microsoft is offered after an expired sign-in only", async (t) => {
  const imap = browser(t, { mailbox: STORED_IMAP });
  const failing = await imap.open("settings");
  globalThis.fetch = async () => Response.json({ error: "login-refused", answer: "534 refused" }, { status: 502 });
  await click(one(line(failing), "mailbox-test"));
  assert.equal(buttonsOf(line(failing), "Sign in with Microsoft").length, 0);
  // A Microsoft connection whose account the library knows and whose Graph refuses a permission: a failure, but not an expired sign-in.
  globalThis.msal = { createStandardPublicClientApplication: async () => ({ getAllAccounts: () => [{ username: OLD_ACCOUNT }], loginPopup: async () => SIGNED_IN,
    acquireTokenSilent: async () => ({ accessToken: TOKEN, scopes: SCOPES }) }) };
  const refused = browser(t, { mailbox: STORED_GRAPH });
  const prior = globalThis.fetch;
  globalThis.fetch = async (url, init) => (String(url).startsWith("https://graph.microsoft.com/") ? new Response(JSON.stringify({ error: { code: "ErrorAccessDenied" } }), { status: 403, headers: { "content-type": "application/json" } }) : prior(url, init));
  const shown = await refused.open("settings");
  await click(one(line(shown), "mailbox-test"));
  assert.equal(readSetting(refused.store, "last-test:mailbox").outcome, "refused", "known positive: the test failed");
  assert.doesNotMatch(one(line(shown), "mailbox-line-result").textContent, /sign-in has expired/);
  assert.equal(buttonsOf(line(shown), "Sign in with Microsoft").length, 0, "a refused permission is no expired sign-in");
});

// TST-993005 · level: unit · module: MOD-settings-pages
// guards: UC-037 (3b); EVERY STEP EXPLAINS ITSELF
// given: a stored Microsoft 365 mailbox, and a stored IMAP one, each with the places it allows
// input: the route mailbox opened as the line's Change would open it
// expect: the Microsoft one shows the address, the route graph with its part visible, both folders, the client identifier, the place ticked and no token; the IMAP one shows the address, the route imap, the servers with their ports and encryption, the account, the Bridge and the place ticked, and no password
test("mailbox — opened with a stored connection, the route shows the stored fields and no secret", async (t) => {
  const graph = browser(t, { mailbox: STORED_GRAPH });
  standIn();
  const page = await graph.open("mailbox");
  assert.equal(one(page, "mailbox-address").value, ADDRESS);
  assert.equal(one(page, "mailbox-route").value, "graph");
  assert.equal(one(page, "mailbox-graph").hidden, false);
  assert.equal(one(page, "mailbox-folders").value, "INBOX, Receipts");
  assert.equal(one(page, "mailbox-client-id").value, CLIENT);
  const ticked = byClass(page, "mailbox-place").filter((box) => box.checked).map((box) => box.getAttribute("data-place"));
  assert.deepEqual(ticked, ["this machine"]);
  assert.doesNotMatch(JSON.stringify(descendants(page, (node) => node.value !== undefined && node.value !== "").map((node) => node.value)), /SECRET|refresh|token/i);
  const imap = browser(t, { mailbox: STORED_IMAP });
  const form = await imap.open("mailbox");
  assert.equal(one(form, "mailbox-address").value, ADDRESS);
  assert.equal(one(form, "mailbox-route").value, "imap");
  assert.equal(one(form, "mailbox-imap").hidden, false);
  assert.deepEqual([one(form, "mailbox-imap-host").value, one(form, "mailbox-imap-port").value, one(form, "mailbox-imap-security").value], ["imap.example.test", "993", "tls"]);
  assert.deepEqual([one(form, "mailbox-smtp-host").value, one(form, "mailbox-smtp-port").value, one(form, "mailbox-smtp-security").value], ["smtp.example.test", "465", "tls"]);
  assert.equal(one(form, "mailbox-account").value, "imap.user@example.test");
  assert.equal(one(form, "mailbox-bridge").value, "laptop");
  assert.equal(one(form, "mailbox-password").value, "", "the password is never put back into a field");
  assert.deepEqual(byClass(form, "mailbox-place").filter((box) => box.checked).map((box) => box.getAttribute("data-place")), ["this machine"]);
});

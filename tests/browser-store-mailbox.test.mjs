// The mailbox connection kept in this browser (ITM-422) — MOD-browser-store's key `mailbox` and the mailbox's sign-in, as
// docs/architecture/MOD-browser-store.md states them: the connection's fields as MOD-mail-routes defines them, its password a secret; and the keys
// Microsoft's sign-in library (msal-browser, ARC-053) writes for its token cache under its own names, found by the client identifier the `mailbox` entry
// names and by the library's key names. listSettings lists both, the sign-in as the mailbox's, and returns no secret; clearSetting of `mailbox` also
// removes the library's keys for that connection, clearEverything removes them with every other entry; exportSettings and importSettings carry both.
// Run: node --test tests/browser-store-mailbox.test.mjs
//
// Module: MOD-browser-store
// Guards: UC-037
// Guards: CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE; A CLEAR IS A REAL CLEAR
// Guards: A STORED SECRET IS HIDDEN UNTIL SHOWN; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// Level: unit
//
// The fake localStorage holds a fixture of the library's keys in the shapes the vendored msal-browser 5.24.0 writes them (src/mail-routes/vendor/): the
// list of account keys `msal.3.account.keys`, one account entry for each person, the list of token keys `msal.3.token.keys.<clientId>` with the id, access
// and refresh token entries it names, `msal.<clientId>.active-account-filters` and the other `msal.<clientId>.…` keys, `msal.interaction.status`, and the
// library-wide `msal.version` and `msal.browser.log.level`. The credentials are constructed. Where the module file leaves a reading open, the test states
// the reading it takes, and the pull request names it:
//   - The library's keys of a connection are: every key `msal.<clientId>.…`; the list `msal.<n>.token.keys.<clientId>` and the token entries it names; the
//     account entries whose `homeAccountId` those tokens carry, which are also taken out of the shared list `msal.<n>.account.keys`, the list itself kept
//     for the accounts of other client identifiers; `msal.interaction.status` while it names the client identifier. The library-wide keys are kept.
//   - A connection with no `graph.clientId` has no sign-in keys. `mailbox-sign-in` is listed like every other literal setting, set or not, and is no key
//     of its own: writeSetting refuses it, clearSetting removes the keys.
//   - An export carries the keys in `foreign`, by their names, with the raw text of their values; an import writes those only that the same search finds
//     for the exported connection, and refuses the file, writing nothing, if `foreign` holds any other key. Of the import's lists, `mailbox-sign-in`
//     stands for the keys: added when this browser had none of them, kept when it had.
// A name the module does not provide yet fails each test by itself. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import {
  clearEverything,
  clearSetting,
  exportSettings,
  importSettings,
  listSettings,
  openStore,
  readExport,
  readSetting,
  secretValues,
  writeSetting,
} from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const OTHER_INSTANCE = "other/instance";
const PREFIX = `agent-m:${INSTANCE}:`;
const CLIENT = "11111111-2222-3333-4444-555555555555";
const OTHER_CLIENT = "99999999-8888-7777-6666-000000000000";
const PASSWORD = "imap-password-constructed-001";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    get length() { return values.size; },
    key: (index) => [...values.keys()][index] ?? null,
    keys: () => [...values.keys()].sort(),
  };
}
const assignments = [];
function install(storage) {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true, writable: true });
  // A cookie and an address that record every write: the store may touch neither.
  Object.defineProperty(globalThis, "document", { configurable: true, value: { get cookie() { return ""; }, set cookie(value) { assignments.push(`cookie=${value}`); } } });
  Object.defineProperty(globalThis, "location", { configurable: true, value: new Proxy({ href: "https://akmaier.github.io/agent-m/" }, {
    set(_target, name, value) { assignments.push(`location.${String(name)}=${value}`); return true; } }) });
}

// The library's cache for one client identifier, as msal-browser 5.24.0 writes it, for the person whose home account is `home`.
function libraryCache(client, home, tenant, secrets) {
  const account = `${home}-login.windows.net-${tenant}`;
  const id = `${home}-login.windows.net-idtoken-${client}-${tenant}---`;
  const access = `${home}-login.windows.net-accesstoken-${client}-${tenant}-mail.readwrite mail.send--`;
  const refresh = `${home}-login.windows.net-refreshtoken-${client}----`;
  const credential = (credentialType, secret) => JSON.stringify({ homeAccountId: home, environment: "login.windows.net", credentialType, clientId: client, secret });
  return {
    account: { key: account, value: JSON.stringify({ homeAccountId: home, environment: "login.windows.net", realm: tenant, username: `${home}@example.test` }) },
    entries: {
      [id]: credential("IdToken", secrets.id), [access]: credential("AccessToken", secrets.access), [refresh]: credential("RefreshToken", secrets.refresh),
      [`msal.3.token.keys.${client}`]: JSON.stringify({ idToken: [id], accessToken: [access], refreshToken: [refresh] }),
      [`msal.${client}.active-account-filters`]: JSON.stringify({ homeAccountId: home, localAccountId: `${home}-local`, tenantId: tenant }),
      [`msal.${client}.request.origin`]: "https://akmaier.github.io/agent-m/",
    },
  };
}
const MINE = libraryCache(CLIENT, "aaaa.bbbb", "tenant-1", { id: "id-secret-001", access: "access-secret-002", refresh: "refresh-secret-003" });
const THEIRS = libraryCache(OTHER_CLIENT, "cccc.dddd", "tenant-2", { id: "other-id-004", access: "other-access-005", refresh: "other-refresh-006" });
const MY_KEYS = [...Object.keys(MINE.entries), MINE.account.key, "msal.interaction.status"].sort();
const MY_TOKENS = ["id-secret-001", "access-secret-002", "refresh-secret-003"];

const GRAPH = { address: "reports@example.test", route: "graph", folders: ["INBOX"], places: [{ place: "this machine", outsideEu: false }], graph: { clientId: CLIENT, account: "reports@example.test" } };
const IMAP = { address: "reports@example.test", route: "imap", folders: ["INBOX"], places: [{ place: "this machine", outsideEu: false }],
  imap: { bridge: "lab-pc", jumpHostNoted: false, imap: { host: "imap.example.test", port: 993, security: "tls" }, smtp: { host: "smtp.example.test", port: 587, security: "starttls" }, account: "reports@example.test", password: PASSWORD } };

// A browser with the library's cache for two client identifiers, this instance's store with a Microsoft mailbox, another instance in the same browser and
// the library-wide keys.
function browser({ mailbox = GRAPH } = {}) {
  const storage = memoryStorage();
  install(storage);
  const put = (entries) => { for (const [key, value] of Object.entries(entries)) storage.setItem(key, value); };
  put(MINE.entries); put(THEIRS.entries);
  storage.setItem(MINE.account.key, MINE.account.value);
  storage.setItem(THEIRS.account.key, THEIRS.account.value);
  storage.setItem("msal.3.account.keys", JSON.stringify([MINE.account.key, THEIRS.account.key]));
  storage.setItem("msal.interaction.status", JSON.stringify({ clientId: CLIENT, type: "signin" }));
  storage.setItem("msal.version", "5.24.0");
  storage.setItem("msal.browser.log.level", "2");
  storage.setItem("unrelated-site-key", "kept");
  const store = openStore(INSTANCE);
  if (mailbox) writeSetting(store, "mailbox", mailbox);
  const other = openStore(OTHER_INSTANCE);
  writeSetting(other, "mailbox", { ...GRAPH, graph: { clientId: OTHER_CLIENT, account: "other@example.test" } });
  writeSetting(other, "products", ["https://github.com/other/product"]);
  return { storage, store, other };
}
const byKey = (list) => new Map(list.map((info) => [info.key, info]));

// guards: CONFIGURATION LIVES IN THE BROWSER; A STORED SECRET IS HIDDEN UNTIL SHOWN; UC-037
// given: no mailbox stored; then a stored IMAP connection with its password
// input: listSettings, readSetting, secretValues
// expect: `mailbox` listed, set or not, as a secret set up in the mailbox, its stored fields read back as written under the instance's prefix; the password in
//         secretValues and in no list; no other setting's secret changed
test("mailbox — a stored IMAP connection is listed, and its password is a secret that no list returns", () => {
  const { storage, store } = browser({ mailbox: null });
  const unset = byKey(listSettings(store)).get("mailbox");
  assert.ok(unset, "listed while unset");
  assert.deepEqual([unset.secret, unset.setUpIn, unset.expires, unset.lastTest], [true, "mailbox", null, null]);
  assert.ok(unset.label.length > 0 && unset.grants.length > 0);
  assert.deepEqual(secretValues(store), []);
  writeSetting(store, "mailbox", IMAP);
  assert.deepEqual(readSetting(store, "mailbox"), IMAP);
  assert.equal(storage.getItem(`${PREFIX}mailbox`), JSON.stringify(IMAP));
  assert.deepEqual(secretValues(store), [PASSWORD]);
  assert.ok(!JSON.stringify(listSettings(store)).includes(PASSWORD), "no list returns the password");
});

// guards: A STORED SECRET IS HIDDEN UNTIL SHOWN; UC-037
// given: a Microsoft connection naming a client identifier, whose sign-in keys stand in the browser beside those of another client identifier
// input: listSettings, secretValues, writeSetting of `mailbox-sign-in`
// expect: the sign-in listed as the mailbox's, a secret, with no token in the list; the tokens of this connection only in secretValues; the sign-in is no key of its
//         own, so writing it is UnknownSetting; with an IMAP connection, which names no client identifier, no sign-in secret
test("mailbox — the sign-in keys of a Microsoft connection are listed as the mailbox's sign-in, and their tokens are secrets", () => {
  const { store } = browser();
  const info = byKey(listSettings(store)).get("mailbox-sign-in");
  assert.ok(info, "the sign-in is listed");
  assert.deepEqual([info.secret, info.setUpIn], [true, "mailbox"]);
  assert.ok(info.label.length > 0 && info.grants.length > 0);
  const text = JSON.stringify(listSettings(store));
  for (const token of [...MY_TOKENS, "other-id-004", "other-access-005", "other-refresh-006"]) assert.ok(!text.includes(token), "no list returns a token");
  assert.deepEqual([...secretValues(store)].sort(), [...MY_TOKENS].sort());
  assert.throws(() => writeSetting(store, "mailbox-sign-in", {}), (error) => error.name === "UnknownSetting" && error.key === "mailbox-sign-in");
  writeSetting(store, "mailbox", IMAP);
  assert.deepEqual(secretValues(store), [PASSWORD], "an IMAP connection has no sign-in");
});

// guards: A CLEAR IS A REAL CLEAR; UC-037
// given: a Microsoft connection and its sign-in keys, the sign-in keys of another client identifier and their person in the shared list, the library-wide keys,
//        another site's key, and another instance's mailbox in the same browser
// input: clearSetting(store, "mailbox")
// expect: the connection's entry and exactly its library keys gone from localStorage — the person's account entry and its removal from the shared list
//         included —; every other key as it was, the other instance's entries and the other client identifier's keys among them
test("mailbox — clearing the mailbox removes the connection and the library's keys for it, and nothing of another instance", () => {
  const { storage, store } = browser();
  const before = storage.keys();
  for (const key of [...MY_KEYS, `${PREFIX}mailbox`]) assert.ok(before.includes(key), `known positive: ${key} stands before the clear`);
  clearSetting(store, "mailbox");
  assert.deepEqual(before.filter((key) => !storage.keys().includes(key)), [...MY_KEYS, `${PREFIX}mailbox`].sort());
  assert.deepEqual(storage.keys().filter((key) => !before.includes(key)), [], "nothing appears");
  assert.deepEqual(JSON.parse(storage.getItem("msal.3.account.keys")), [THEIRS.account.key], "the other person stays in the shared list");
  assert.equal(readSetting(store, "mailbox"), null);
  assert.ok(storage.getItem("msal.version") && storage.getItem("msal.browser.log.level") && storage.getItem("unrelated-site-key"));
  assert.ok(storage.getItem(`msal.3.token.keys.${OTHER_CLIENT}`) && storage.getItem(`agent-m:${OTHER_INSTANCE}:mailbox`) && storage.getItem(`agent-m:${OTHER_INSTANCE}:products`));
  clearSetting(store, "mailbox");
});

// guards: A CLEAR IS A REAL CLEAR; UC-037
// given: the same browser, with a GitHub token and the mailbox stored for this instance
// input: clearEverything(store); and clearSetting of the sign-in alone on a fresh browser
// expect: every entry of this instance and the connection's library keys gone, the rest as it was; the sign-in's own clear removes the keys and leaves the connection
test("mailbox — clearing everything removes the library's keys with every other entry, and the sign-in can be cleared alone", () => {
  const { storage, store } = browser();
  writeSetting(store, "github-token", { value: "github-secret-constructed-007" });
  clearEverything(store);
  assert.deepEqual(storage.keys().filter((key) => key.startsWith(PREFIX) || MY_KEYS.includes(key)), []);
  assert.ok(storage.getItem(`msal.3.token.keys.${OTHER_CLIENT}`) && storage.getItem("msal.version") && storage.getItem(`agent-m:${OTHER_INSTANCE}:mailbox`));

  const second = browser();
  clearSetting(second.store, "mailbox-sign-in");
  assert.deepEqual(MY_KEYS.filter((key) => second.storage.getItem(key) !== null), []);
  assert.deepEqual(readSetting(second.store, "mailbox"), GRAPH, "the connection stays");
});

// guards: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; UC-037
// given: a Microsoft connection and its sign-in keys; a locked and a plain export of them; a second browser that has none of them, and a third that has the sign-in
//        keys already
// input: exportSettings, readExport, importSettings
// expect: `mailbox` among the settings and exactly the connection's library keys in `foreign`, by name and raw value, in the plain file with their tokens and in the
//         locked one only once opened; the import into the second browser writes the connection and the keys verbatim, and names both as added; the third keeps its keys
test("mailbox — an export carries the connection and its sign-in keys, and an import writes both", async () => {
  const { storage, store } = browser();
  const plain = await exportSettings(store);
  const locked = await exportSettings(store, "a passphrase");
  const file = JSON.parse(plain);
  assert.deepEqual(file.settings.mailbox, GRAPH);
  assert.deepEqual(Object.keys(file.foreign).sort(), MY_KEYS);
  for (const key of MY_KEYS) assert.equal(file.foreign[key], storage.getItem(key));
  for (const token of MY_TOKENS) assert.ok(plain.includes(token) && !locked.includes(token), "the tokens are in the plain file only");
  assert.deepEqual((await readExport(locked, "a passphrase")).settings.mailbox, GRAPH);

  const fresh = memoryStorage();
  install(fresh);
  const destination = openStore(INSTANCE);
  const result = await importSettings(destination, locked, "a passphrase");
  assert.ok(result.added.includes("mailbox") && result.added.includes("mailbox-sign-in") && !result.kept.includes("mailbox-sign-in"));
  for (const key of MY_KEYS) assert.equal(fresh.getItem(key), storage.getItem(key), key);
  assert.equal(fresh.getItem(`msal.3.account.keys`), JSON.stringify([MINE.account.key]), "the list is written for the person imported");
  assert.deepEqual([...secretValues(destination)].sort(), [...MY_TOKENS].sort());

  const own = browser({ mailbox: null });
  own.storage.setItem("msal.3.token.keys." + CLIENT, JSON.stringify({ idToken: [], accessToken: [], refreshToken: [] }));
  const kept = await importSettings(own.store, plain);
  assert.ok(kept.added.includes("mailbox") && kept.kept.includes("mailbox-sign-in"));
  assert.equal(own.storage.getItem("msal.3.token.keys." + CLIENT), JSON.stringify({ idToken: [], accessToken: [], refreshToken: [] }), "an existing key is kept");
});

// guards: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; CONFIGURATION LIVES IN THE BROWSER
// given: an export whose `foreign` holds, besides the connection's keys, a key of another site, a key under this instance's prefix and a key of another client identifier
// input: importSettings
// expect: NotAnExport, and the browser's localStorage exactly as it was; the same file without those keys is imported (known positive)
test("mailbox — an import refuses a foreign key that is not the connection's library key, and writes nothing", async () => {
  const { storage, store } = browser();
  const file = JSON.parse(await exportSettings(store));
  const fresh = memoryStorage();
  install(fresh);
  const destination = openStore(INSTANCE);
  for (const bad of ["unrelated-site-key", `${PREFIX}github-token`, `msal.3.token.keys.${OTHER_CLIENT}`, "msal.version"]) {
    const hostile = JSON.stringify({ ...file, foreign: { ...file.foreign, [bad]: "{}" } });
    await assert.rejects(importSettings(destination, hostile), (error) => error.name === "NotAnExport", bad);
    assert.deepEqual(fresh.keys(), [], `${bad}: nothing written`);
  }
  assert.ok((await importSettings(destination, JSON.stringify(file))).added.includes("mailbox"), "known positive");
  assert.ok(storage.keys().length > 0);
});

// guards: CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE; UC-037
// given: a cookie and an address that record every write
// input: write, list, read, export, import and clear the mailbox and its sign-in
// expect: no cookie written, the address untouched, and the locked export without a token in clear
test("mailbox — no cookie is set and nothing is put into an address", async () => {
  const { store } = browser();
  assignments.length = 0;
  writeSetting(store, "mailbox", GRAPH);
  listSettings(store); readSetting(store, "mailbox"); secretValues(store);
  const text = await exportSettings(store, "pw");
  await importSettings(store, text, "pw");
  clearSetting(store, "mailbox");
  clearEverything(store);
  assert.deepEqual(assignments, []);
  assert.equal(globalThis.location.href, "https://akmaier.github.io/agent-m/");
  assert.ok(typeof text === "string" && text.length > 0 && !text.includes(MY_TOKENS[0]), "the locked file hides the tokens");
});

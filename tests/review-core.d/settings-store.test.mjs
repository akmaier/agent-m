// The browser store (src/browser-store/, MOD-browser-store) as the dashboard keeps its settings in it — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-browser-store
// Guards: THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS; A CLEAR IS A REAL CLEAR; UC-042
// Level: unit
//
// Every expected value is written here; none is read from a document. The store is opened over a fake localStorage
// (helpers.mjs fakeStorage) installed as the browser's, and every request is recorded, so that "nothing is sent" is seen.

import test from "node:test";
import assert from "node:assert/strict";
import {
  openStore, readSetting, writeSetting, clearSetting, clearEverything, exportSettings, importSettings,
} from "../../src/browser-store/index.mjs";
import { allocatePort } from "../../src/bridge-client/index.mjs";
import { fakeStorage, withFetch, GL_TOKEN, BRIDGE_TOKEN } from "./helpers.mjs";

const INSTANCE = "akmaier/agent-m", PREFIX = "agent-m:akmaier/agent-m:";
const SECRET = "github_pat_11SECRETVALUEabcdefghijklmnop", PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghij";
const THESIS = "https://github.com/alice/thesis", OTHER = "https://github.com/alice/other", GL_PRODUCT = "https://gitlab.example.org/grp/sub/proj";
const JUMP_HOST = { hostname: "jump.example.org", user: "agentm", sshPort: 22, portRange: [20001, 20003],
  httpsAddress: "https://jump.example.org", login: { user: "proxy", password: "jump-host-password" } };
const token = (value, expires = null) => ({ value, name: "Agent M", expires, stored: "2026-09-29" });

// A browser whose localStorage is a fresh fake, with this instance's store opened over it. -> { mem, store }
function browser() {
  const storage = fakeStorage();
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  return { mem: storage.mem, store: openStore(INSTANCE) };
}
// Every request made while `f` runs. -> { value, requests }
async function sent(f) {
  const requests = [];
  const value = await withFetch(async (url) => { requests.push(String(url)); return new Response("{}", { status: 200 }); }, f);
  return { value, requests };
}

// ---------------------------------------------------------------- products in the browser (UC-001)
// THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER

test("THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER — adding a product stores its address in localStorage and commits nothing; counter-proof: after a clear the list is empty", async () => {
  const { mem, store } = browser();
  mem.set("another-site.setting", "kept");
  const { requests } = await sent(() => {
    writeSetting(store, "github-token", token(SECRET));
    writeSetting(store, "products", [THESIS]);
    writeSetting(store, "products", [...readSetting(store, "products"), OTHER]);
  });
  assert.equal(mem.get(`${PREFIX}products`), JSON.stringify([THESIS, OTHER]), "localStorage itself holds the addresses, under the instance's prefix");
  assert.deepEqual(readSetting(store, "products"), [THESIS, OTHER]);
  assert.equal(readSetting(store, "github-token").value, SECRET, "beside the token");
  assert.deepEqual(requests, [], "nothing is committed to the instance repository, nor sent anywhere");
  clearEverything(store);
  assert.equal(readSetting(store, "products"), null, "counter-proof: after a clear the list is empty");
  assert.deepEqual([...mem.keys()], ["another-site.setting"], "only Agent M's entries are cleared");
});

test("A product's own token is kept under its own key, beside the instance's, and goes with a clear of that key", () => {
  const { mem, store } = browser();
  writeSetting(store, "github-token", token(SECRET));
  writeSetting(store, "github-token:alice/thesis", token(PRODUCT_TOKEN, "2026-12-29"));
  writeSetting(store, "gitlab-token:gitlab.example.org/grp/sub/proj", token(GL_TOKEN));
  assert.equal(readSetting(store, "github-token:alice/thesis").value, PRODUCT_TOKEN);
  assert.equal(readSetting(store, "github-token:alice/other"), null, "a product without a token of its own has none");
  assert.equal(readSetting(store, "github-token").value, SECRET, "the instance's token is a separate entry, unchanged");
  clearSetting(store, "github-token:alice/thesis");
  assert.equal(mem.has(`${PREFIX}github-token:alice/thesis`), false, "A CLEAR IS A REAL CLEAR: the entry is gone from localStorage itself");
  assert.equal(readSetting(store, "gitlab-token:gitlab.example.org/grp/sub/proj").value, GL_TOKEN, "the other product's token stays");
});

// ---------------------------------------------------------------- settings in one place (UC-042)
// SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS · AN EXPORT CAN BE LOCKED WITH A PASSPHRASE

// Every kind of secret the dashboard keeps, and the products: what an export must bring back.
const FULL = {
  "github-token": token(SECRET, "2026-12-29"),
  "github-token:alice/thesis": token(PRODUCT_TOKEN, "2027-01-01"),
  "gitlab-token:gitlab.example.org/grp/sub/proj": token(GL_TOKEN),
  products: [THESIS, GL_PRODUCT],
  "jump-host": JUMP_HOST,
  "bridge:lab-pc": { port: 20001, token: BRIDGE_TOKEN },
  "last-test:github-token": { at: "2026-09-30T08:00:00.000Z", outcome: "working" },
};
const fill = (store, settings = FULL) => { for (const [key, value] of Object.entries(settings)) writeSetting(store, key, value); };
const agentEntries = (mem) => Object.fromEntries([...mem].filter(([key]) => key.startsWith(PREFIX)));

test("SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — an import of an export restores every setting, secrets included; counter-proof: nothing is sent", async () => {
  const source = browser();
  fill(source.store);
  const before = agentEntries(source.mem);
  const { value: file, requests: exporting } = await sent(() => exportSettings(source.store));
  for (const secret of [SECRET, PRODUCT_TOKEN, GL_TOKEN, BRIDGE_TOKEN, "jump-host-password"]) assert.ok(file.includes(secret), `an open export carries ${secret}`);
  const into = browser();
  const { value: result, requests: importing } = await sent(() => importSettings(into.store, file));
  assert.deepEqual(agentEntries(into.mem), before, "every setting is restored as it was");
  assert.deepEqual(result.added.sort(), Object.keys(FULL).sort());
  assert.deepEqual(result.kept, []);
  assert.deepEqual([...exporting, ...importing], [], "counter-proof: the export is offered to the person only — no request carries it");
  // Counter-proof: a file of another format imports nothing.
  const empty = browser();
  await assert.rejects(importSettings(empty.store, JSON.stringify({ format: "something-else", settings: FULL })), (error) => error.name === "NotAnExport");
  assert.deepEqual(agentEntries(empty.mem), {});
});

test("AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing", async () => {
  const source = browser();
  fill(source.store);
  const before = agentEntries(source.mem);
  const file = await exportSettings(source.store, "correct horse");
  for (const secret of [SECRET, PRODUCT_TOKEN, GL_TOKEN, BRIDGE_TOKEN, "jump-host-password", "SECRETVALUE"]) assert.ok(!file.includes(secret), `in clear: ${secret}`);
  const locked = JSON.parse(file);
  assert.equal(locked.locked, true);
  assert.ok(locked.kdf.iterations >= 600000, "a high iteration count, stored in the file");
  assert.ok(locked.kdf.salt && locked.cipher.iv && locked.data, "salt, iv and ciphertext stored");
  const other = JSON.parse(await exportSettings(source.store, "correct horse"));
  assert.notEqual(other.kdf.salt, locked.kdf.salt, "a random salt per export");
  assert.notEqual(other.cipher.iv, locked.cipher.iv, "a random IV per export");
  const into = browser();
  await importSettings(into.store, file, "correct horse");
  assert.deepEqual(agentEntries(into.mem), before, "imports with its passphrase");
  // Counter-proof: a wrong passphrase, none, or a tampered file imports nothing.
  for (const [text, passphrase] of [[file, "wrong horse"], [file, ""],
    [JSON.stringify({ ...locked, data: locked.data.slice(0, -4) + (locked.data.endsWith("AAAA") ? "BBBB" : "AAAA") }), "correct horse"]]) {
    const wrong = browser();
    await assert.rejects(importSettings(wrong.store, text, passphrase), (error) => error.name === "WrongPassphrase", passphrase);
    assert.deepEqual(agentEntries(wrong.mem), {}, "nothing was imported");
  }
});

test("UC-042 6a — an import keeps what this browser has and adds only what is missing, listing both", async () => {
  const source = browser();
  fill(source.store);
  const file = await exportSettings(source.store);
  const mine = browser();
  writeSetting(mine.store, "github-token", token("github_pat_mine", "2026-10-01"));
  writeSetting(mine.store, "products", [THESIS]);
  const { added, kept } = await importSettings(mine.store, file);
  assert.deepEqual(kept.sort(), ["github-token", "products"]);
  assert.deepEqual(added.sort(), Object.keys(FULL).filter((key) => !["github-token", "products"].includes(key)).sort());
  // A kept token keeps its own expiry date; the file's date belongs to the file's token.
  assert.deepEqual(readSetting(mine.store, "github-token"), token("github_pat_mine", "2026-10-01"));
  assert.deepEqual(readSetting(mine.store, "products"), [THESIS]);
  assert.equal(readSetting(mine.store, "github-token:alice/thesis").value, PRODUCT_TOKEN, "what was missing is added");
});

// ---------------------------------------------------------------- jump host and remote sessions (UC-042, UC-011)
// THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS

test("THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS — stored under their keys, exported and imported, cleared by a clear", async () => {
  const { mem, store } = browser();
  writeSetting(store, "jump-host", JUMP_HOST);
  const port = allocatePort(JUMP_HOST.portRange, []);
  writeSetting(store, "bridge:lab-pc", { port, token: BRIDGE_TOKEN });
  assert.equal(port, 20001, "the session's port is the lowest free one of the jump host's range");
  assert.deepEqual(readSetting(store, "jump-host"), JUMP_HOST);
  assert.deepEqual(readSetting(store, "bridge:lab-pc"), { port: 20001, token: BRIDGE_TOKEN });
  assert.ok([...mem.keys()].every((key) => key.startsWith(PREFIX)));
  // Exported with the bridge token; imported into an empty browser as they were.
  const file = await exportSettings(store);
  assert.ok(file.includes(BRIDGE_TOKEN));
  const into = browser();
  await importSettings(into.store, file);
  assert.deepEqual(readSetting(into.store, "jump-host"), JUMP_HOST);
  assert.deepEqual(readSetting(into.store, "bridge:lab-pc"), { port: 20001, token: BRIDGE_TOKEN });
  // UC-042 6a: a session this browser has is kept as it is.
  const mine = browser();
  writeSetting(mine.store, "bridge:lab-pc", { port: 20003, token: "mine" });
  const { kept } = await importSettings(mine.store, file);
  assert.ok(kept.includes("bridge:lab-pc"));
  assert.deepEqual(readSetting(mine.store, "bridge:lab-pc"), { port: 20003, token: "mine" });
  // A CLEAR IS A REAL CLEAR: clearing removes them from localStorage itself.
  clearSetting(store, "bridge:lab-pc");
  assert.equal(mem.has(`${PREFIX}bridge:lab-pc`), false, "the session cleared leaves no entry");
  writeSetting(store, "bridge:lab-pc", { port, token: BRIDGE_TOKEN });
  clearEverything(store);
  assert.equal(mem.size, 0);
  assert.equal(readSetting(store, "jump-host"), null);
});

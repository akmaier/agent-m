// The entries an earlier dashboard kept under `agent-m.` — MOD-browser-store's openStore as docs/architecture/MOD-browser-store.md
// states it: "The entries an earlier dashboard kept in this browser under the prefix `agent-m.` … are first moved into the
// instance's keys; an old entry is removed once what it holds stands there, and a value the instance keeps already is never
// replaced."
// Run: node --test tests/browser-store-legacy-keys.test.mjs
//
// Module: MOD-browser-store
// Guards: CONFIGURATION LIVES IN THE BROWSER; THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; UC-001; UC-047
// Level: unit
//
// The browser's localStorage is a map held here; each test plants the old entries, opens the store, and reads both kinds of key.

import test from "node:test";
import assert from "node:assert/strict";
import { openStore, readSetting } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const TODAY = new Date().toISOString().slice(0, 10);

// A browser's localStorage holding `entries`, set as the page's.
function plant(entries = {}) {
  const values = new Map(Object.entries(entries));
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key), get length() { return values.size; }, key: (i) => [...values.keys()][i] ?? null };
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  return values;
}
const old = (values) => [...values.keys()].filter((key) => key.startsWith("agent-m.")).sort();

// TST-265 · level: unit · module: MOD-browser-store
// guards: UC-001; UC-047; CONFIGURATION LIVES IN THE BROWSER
// given: a browser holding the earlier dashboard's GitHub token with its expiry and a test of 2026-10-07, its product list and a product's own token
// input: openStore for the instance
// expect: the instance's keys hold the token named "Agent M · akmaier/agent-m" with its expiry, its last test working on 2026-10-07, the product list and the product's token; of the `agent-m.` entries only the product list is left, empty
test("TST-265 the earlier dashboard's token, products and product token are moved into the instance's keys", () => {
  const values = plant({
    "agent-m.github-token": "github_pat_INSTANCE", "agent-m.github-token-expires": "2027-01-01",
    "agent-m.github-token-tested": JSON.stringify({ ok: "2026-10-07" }),
    "agent-m.products": JSON.stringify(["https://github.com/alice/tool"]),
    "agent-m.github-product-tokens": JSON.stringify({ "https://github.com/alice/tool": { token: "github_pat_PRODUCT", expires: "2027-02-01" } }),
  });
  const store = openStore(INSTANCE);
  assert.deepEqual(readSetting(store, "github-token"), { value: "github_pat_INSTANCE", name: "Agent M · akmaier/agent-m", expires: "2027-01-01", stored: TODAY });
  assert.deepEqual(readSetting(store, "last-test:github-token"), { at: "2026-10-07", outcome: "working" });
  assert.deepEqual(readSetting(store, "products"), ["https://github.com/alice/tool"]);
  assert.deepEqual(readSetting(store, "github-token:alice/tool"), { value: "github_pat_PRODUCT", name: "Agent M", expires: "2027-02-01", stored: TODAY });
  assert.deepEqual(old(values), ["agent-m.products"], "every old entry moved is removed, but the old list, which is left empty");
  assert.equal(values.get("agent-m.products"), "[]");
});

// TST-267 · level: unit · module: MOD-browser-store
// guards: UC-001; UC-047; CONFIGURATION LIVES IN THE BROWSER
// given: a browser holding an earlier GitLab project token with its last test, and no old product list
// input: openStore for the instance
// expect: the product is listed by the token's address, the token kept under gitlab-token:gitlab.example.org/team/first with its last test working on 2026-10-07; the old map is removed
test("TST-267 a GitLab project token without a product entry names its product", () => {
  const first = "https://gitlab.example.org/team/first";
  const values = plant({ "agent-m.gitlab-tokens": JSON.stringify({ [first]: { token: "glpat_FIRST0123456789", expires: "2027-01-01", tested: { ok: "2026-10-07" } } }) });
  const store = openStore(INSTANCE);
  assert.deepEqual(readSetting(store, "products"), [first]);
  assert.equal(readSetting(store, "gitlab-token:gitlab.example.org/team/first").value, "glpat_FIRST0123456789");
  assert.deepEqual(readSetting(store, "last-test:gitlab-token:gitlab.example.org/team/first"), { at: "2026-10-07", outcome: "working" });
  assert.deepEqual(old(values), []);
});

// TST-1800004 · level: unit · module: MOD-browser-store
// guards: CONFIGURATION LIVES IN THE BROWSER
// given: a browser holding an earlier jump host without key files and two remote sessions, lab-pc with its token and gpu that names the Bridge's port
// input: openStore for the instance
// expect: jump-host holds { hostname, user, sshPort 22, portRange }; remote-session:lab-pc holds its port and token; the old jump host is removed and the old list keeps gpu alone, which is not moved
test("the jump host and the remote sessions an earlier dashboard kept are moved, each one that fits", () => {
  const values = plant({
    "agent-m.jump-host": JSON.stringify({ host: "jump.example.org", user: "agentm", portFrom: 20001, portTo: 20010 }),
    "agent-m.remote-sessions": JSON.stringify([{ name: "lab-pc", port: 20001, token: "t-lab" }, { name: "gpu", port: 20002, bridgePort: 8765, token: "t-gpu" }]),
  });
  const store = openStore(INSTANCE);
  assert.deepEqual(readSetting(store, "jump-host"), { hostname: "jump.example.org", user: "agentm", sshPort: 22, portRange: [20001, 20010] });
  assert.deepEqual(readSetting(store, "remote-session:lab-pc"), { port: 20001, token: "t-lab" });
  assert.equal(readSetting(store, "remote-session:gpu"), null);
  assert.deepEqual(old(values), ["agent-m.remote-sessions"]);
  assert.deepEqual(JSON.parse(values.get("agent-m.remote-sessions")).map((s) => s.name), ["gpu"]);
});

// TST-1800005 · level: unit · module: MOD-browser-store
// guards: CONFIGURATION LIVES IN THE BROWSER
// given: a browser whose instance already keeps a GitHub token, holding besides an earlier token, and an earlier jump host that names a key file
// input: openStore for the instance
// expect: the instance's token is kept as it was, and the old token, which differs from it, stays where it is; the jump host with a key file is not moved and stays; nothing else is written
test("counter-proof: a value the instance keeps is never replaced, and an entry that does not fit stays where it is", () => {
  const kept = { value: "github_pat_NEWER", name: "Agent M · akmaier/agent-m", expires: "2027-06-01", stored: "2026-10-20" };
  const values = plant({
    "agent-m:akmaier/agent-m:github-token": JSON.stringify(kept),
    "agent-m.github-token": "github_pat_OLDER",
    "agent-m.jump-host": JSON.stringify({ host: "jump.example.org", user: "agentm", portFrom: 20001, portTo: 20010, reverseKey: "~/.ssh/k" }),
  });
  const store = openStore(INSTANCE);
  assert.deepEqual(readSetting(store, "github-token"), kept);
  assert.equal(readSetting(store, "jump-host"), null);
  assert.deepEqual(old(values), ["agent-m.github-token", "agent-m.jump-host"]);
  assert.deepEqual([...values.keys()].filter((key) => key.startsWith("agent-m:")), ["agent-m:akmaier/agent-m:github-token"]);
});

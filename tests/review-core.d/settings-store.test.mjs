// The browser store (docs/assets/settings-store.mjs) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-settings-store
// Guards: THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS; A CLEAR IS A REAL CLEAR; UC-042
// Level: unit
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md.

import test from "node:test";
import assert from "node:assert/strict";
import {
  createStore, PREFIX, TOKEN_KEY, TOKEN_EXPIRY_KEY, PRODUCTS_KEY, exportSettings, readSettingsFile, mergeSettings, PBKDF2_ITERATIONS,
  GITLAB_TOKENS_KEY, GITHUB_PRODUCT_TOKENS_KEY, JUMP_HOST_KEY, REMOTE_SESSIONS_KEY, KEYS,
} from "../../docs/assets/settings-store.mjs";
import { addRemoteSession } from "../../docs/assets/bridge-tunnel.mjs";
import { fakeStorage, WHEN, GL, GL_ADDR, GL_TOKEN, JUMP, BRIDGE_TOKEN } from "./helpers.mjs";

const SECRET = "github_pat_11SECRETVALUEabcdefghijklmnop";
const FULL = { [TOKEN_KEY]: SECRET, [TOKEN_EXPIRY_KEY]: "2026-12-29",
  [PRODUCTS_KEY]: JSON.stringify(["https://github.com/alice/thesis", "https://github.com/alice/other"]) };

// ---------------------------------------------------------------- products in the browser (UC-001)
// THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER

test("the browser store keeps product addresses beside the token, once each", () => {
  const st = fakeStorage(), s = createStore(st);
  assert.deepEqual(s.getProducts(), []);
  s.addProduct("https://github.com/alice/thesis-tool");
  s.addProduct("https://github.com/alice/thesis-tool");
  s.addProduct("https://github.com/alice/other");
  assert.deepEqual(s.getProducts(), ["https://github.com/alice/thesis-tool", "https://github.com/alice/other"]);
  assert.ok([...st.mem.keys()].every((k) => k.startsWith(PREFIX)));
  st.setItem(PREFIX + "products", "not json");
  assert.deepEqual(s.getProducts(), [], "a damaged entry reads as an empty list");
});

// ---------------------------------------------------------------- settings in one place (UC-042)
// SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS · AN EXPORT CAN BE LOCKED WITH A PASSPHRASE

test("SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — an import of an export restores every setting", async () => {
  const st = fakeStorage(), s = createStore(st);
  s.setToken(SECRET, "2026-12-29");
  s.addProduct("https://github.com/alice/thesis");
  const file = await exportSettings(s.entries(), { now: WHEN });
  assert.ok(file.includes(SECRET), "an open export carries the token itself");
  const into = fakeStorage(), t = createStore(into);
  const m = mergeSettings(t.entries(), await readSettingsFile(file));
  t.putEntries(m.put);
  assert.deepEqual(t.entries(), s.entries());
  assert.equal(t.getToken(), SECRET);
  assert.equal(t.getTokenExpiry(), "2026-12-29");
  assert.deepEqual(t.getProducts(), ["https://github.com/alice/thesis"]);
  // Counter-proof: a file of another format imports nothing.
  await assert.rejects(readSettingsFile(JSON.stringify({ format: "something-else", settings: FULL })), /not an Agent M settings file/);
});

test("AN EXPORT CAN BE LOCKED WITH A PASSPHRASE — no secret in clear, imports with it, a wrong one imports nothing", async () => {
  const file = await exportSettings(FULL, { passphrase: "correct horse", now: WHEN });
  for (const v of Object.values(FULL)) assert.ok(!file.includes(v), `in clear: ${v}`);
  assert.ok(!file.includes("SECRETVALUE"));
  const locked = JSON.parse(file).locked;
  assert.ok(locked.iterations >= 600000 && locked.iterations === PBKDF2_ITERATIONS, "a high iteration count, stored in the file");
  assert.ok(locked.salt && locked.iv && locked.data, "salt, iv and ciphertext stored");
  const other = JSON.parse(await exportSettings(FULL, { passphrase: "correct horse", now: WHEN })).locked;
  assert.notEqual(other.salt, locked.salt, "a random salt per export");
  assert.notEqual(other.iv, locked.iv, "a random IV per export");
  assert.deepEqual(await readSettingsFile(file, "correct horse"), FULL);
  await assert.rejects(readSettingsFile(file), (e) => e.locked === true);
  await assert.rejects(readSettingsFile(file, "wrong horse"), (e) => e.wrongPassphrase === true && /nothing was imported/.test(e.message));
  const tampered = JSON.parse(file);
  tampered.locked.data = tampered.locked.data.slice(0, -4) + (tampered.locked.data.endsWith("AAAA") ? "BBBB" : "AAAA");
  await assert.rejects(readSettingsFile(JSON.stringify(tampered), "correct horse"), (e) => e.wrongPassphrase === true);
});

test("UC-042 6a — an import keeps what this browser has and adds only what is missing, listing both", () => {
  const current = { [TOKEN_KEY]: "github_pat_mine", [TOKEN_EXPIRY_KEY]: "2026-10-01",
    [PRODUCTS_KEY]: JSON.stringify(["https://github.com/alice/thesis"]) };
  const m = mergeSettings(current, { ...FULL, "agent-m.unknown": "x" });
  assert.deepEqual(m.put, { [PRODUCTS_KEY]: JSON.stringify(["https://github.com/alice/thesis", "https://github.com/alice/other"]) });
  assert.deepEqual(m.added, ["product https://github.com/alice/other"]);
  assert.deepEqual(m.kept, ["GitHub token", "product https://github.com/alice/thesis"]);
  assert.deepEqual(m.ignored, ["agent-m.unknown"]);
  // A kept token keeps its own expiry date; the file's date belongs to the file's token.
  assert.ok(!(TOKEN_EXPIRY_KEY in m.put));
  // Into an empty browser, everything is added.
  const e = mergeSettings({}, FULL);
  assert.deepEqual(e.put, FULL);
  assert.deepEqual(e.kept, []);
});

// ---------------------------------------------------------------- GitLab products (queue 2026-09-24b)
// The GitLab project tokens in the browser store, and in the export (UC-042).

test("GitLab tokens in the browser store: one per product, only for that product; removed with the product and by a clear", () => {
  const st = fakeStorage(), s = createStore(st);
  s.setToken("github_pat_t");
  s.addProduct(GL_ADDR);
  s.setGitLabToken(GL_ADDR, ` ${GL_TOKEN} `, "2026-12-29");
  s.setGitLabToken("https://gitlab.com/alice/thesis", "glpat-other0123456789", null);
  assert.deepEqual(s.getGitLabToken(GL_ADDR), { token: GL_TOKEN, expires: "2026-12-29" });
  assert.equal(s.getGitLabToken(`${GL}/grp/sub/other`), null, "a project without its own token has none");
  assert.equal(s.getToken(), "github_pat_t", "the GitHub token is a separate entry");
  assert.ok([...st.mem.keys()].every((k) => k.startsWith(PREFIX)));
  s.removeProduct(GL_ADDR);
  assert.equal(s.getGitLabToken(GL_ADDR), null, "removing the product removes its token");
  assert.ok(s.getGitLabToken("https://gitlab.com/alice/thesis"));
  s.clearGitLabToken("https://gitlab.com/alice/thesis");
  assert.equal(st.getItem(GITLAB_TOKENS_KEY), null, "the last token cleared leaves no entry");
  s.setGitLabToken(GL_ADDR, GL_TOKEN, null);
  s.clear();
  assert.equal(st.mem.size, 0);
});

test("SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitLab tokens included, merged per product", async () => {
  const s = createStore(fakeStorage());
  s.setGitLabToken(GL_ADDR, GL_TOKEN, "2026-12-29");
  s.addProduct(GL_ADDR);
  const file = await exportSettings(s.entries(), { now: WHEN });
  assert.ok(file.includes(GL_TOKEN));
  const t = createStore(fakeStorage());
  t.setGitLabToken("https://gitlab.com/alice/thesis", "glpat-mine0123456789", null);
  t.setGitLabToken(GL_ADDR, "glpat-newer0123456789", "2027-01-01");
  const m = mergeSettings(t.entries(), await readSettingsFile(file));
  t.putEntries(m.put);
  assert.deepEqual(t.getGitLabToken(GL_ADDR), { token: "glpat-newer0123456789", expires: "2027-01-01" }, "what this browser has is kept");
  assert.ok(m.kept.includes(`GitLab project token for ${GL_ADDR}`));
  const u = createStore(fakeStorage());
  const m2 = mergeSettings(u.entries(), await readSettingsFile(file));
  u.putEntries(m2.put);
  assert.deepEqual(u.getGitLabToken(GL_ADDR), { token: GL_TOKEN, expires: "2026-12-29" });
  assert.ok(m2.added.includes(`GitLab project token for ${GL_ADDR}`));
});

// ---------------------------------------------------------------- GitHub products' own tokens (queue 2026-10-06c)
// A GITHUB PRODUCT USES A TOKEN OF ITS OWN: each GitHub product's token in the browser store, beside the instance's (UC-001 Step A,
// UC-042). A request to a product carries its own token — a GitHub product's, or the instance's while it has none; a GitLab
// product's project token, never a GitHub one (tokenFor).

const GH_PRODUCT = "https://github.com/alice/thesis", GH_PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghij";

test("A GITHUB PRODUCT USES A TOKEN OF ITS OWN — in the browser store: one per GitHub product, beside the instance's; removed with the product and by a clear", () => {
  const st = fakeStorage(), s = createStore(st);
  s.setToken("github_pat_t");
  s.addProduct(GH_PRODUCT);
  s.setGitHubProductToken(GH_PRODUCT, ` ${GH_PRODUCT_TOKEN} `, "2026-12-29");
  assert.deepEqual(s.getGitHubProductToken(GH_PRODUCT), { token: GH_PRODUCT_TOKEN, expires: "2026-12-29" });
  assert.equal(s.getGitHubProductToken("https://github.com/alice/other"), null, "a product without a token of its own has none");
  assert.equal(s.getToken(), "github_pat_t", "the instance's token is a separate entry, unchanged");
  assert.equal(s.getGitLabToken(GH_PRODUCT), null, "nor is it a GitLab project token");
  s.setGitHubProductTokenTest(GH_PRODUCT, { ok: "2026-10-06" });
  assert.deepEqual(s.getGitHubProductToken(GH_PRODUCT).tested, { ok: "2026-10-06" }, "its last test is kept beside it");
  s.removeProduct(GH_PRODUCT);
  assert.equal(s.getGitHubProductToken(GH_PRODUCT), null, "removing the product removes its token");
  assert.equal(st.getItem(GITHUB_PRODUCT_TOKENS_KEY), null, "the last token cleared leaves no entry");
  s.setGitHubProductToken(GH_PRODUCT, GH_PRODUCT_TOKEN, null);
  s.clearProducts();
  assert.equal(s.getGitHubProductToken(GH_PRODUCT), null, "clearing the product list clears the products' tokens");
  s.setGitHubProductToken(GH_PRODUCT, GH_PRODUCT_TOKEN, null);
  s.clear();
  assert.equal(st.mem.size, 0);
});

test("A GITHUB PRODUCT USES A TOKEN OF ITS OWN — tokenFor: a GitHub product's own token, or the instance's while it has none; a GitLab product's project token, never a GitHub one", () => {
  const s = createStore(fakeStorage());
  s.setToken("github_pat_instance");
  const gh = { address: GH_PRODUCT, host: "github.com", repo: "alice/thesis" };
  assert.equal(s.tokenFor(gh), "github_pat_instance", "without a token of its own, the instance's");
  s.setGitHubProductToken(GH_PRODUCT, GH_PRODUCT_TOKEN, null);
  assert.equal(s.tokenFor(gh), GH_PRODUCT_TOKEN, "its own, once stored");
  assert.equal(s.tokenFor({ address: "https://github.com/alice/other", host: "github.com", repo: "alice/other" }), "github_pat_instance",
    "counter-proof: another product is not given this product's token");
  const gl = { address: GL_ADDR, host: "gitlab.example.org", repo: "grp/sub/proj", kind: "gitlab" };
  assert.equal(s.tokenFor(gl), null, "a GitLab product without its project token gets none — never a GitHub token");
  s.setGitLabToken(GL_ADDR, GL_TOKEN, null);
  assert.equal(s.tokenFor(gl), GL_TOKEN);
});

test("SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — GitHub product tokens included, merged per product", async () => {
  const s = createStore(fakeStorage());
  s.setGitHubProductToken(GH_PRODUCT, GH_PRODUCT_TOKEN, "2026-12-29");
  s.addProduct(GH_PRODUCT);
  const file = await exportSettings(s.entries(), { now: WHEN });
  assert.ok(file.includes(GH_PRODUCT_TOKEN));
  const newer = "github_pat_NEWER0123456789abcdefghij";
  const t = createStore(fakeStorage());
  t.setGitHubProductToken(GH_PRODUCT, newer, "2027-01-01");
  const m = mergeSettings(t.entries(), await readSettingsFile(file));
  t.putEntries(m.put);
  assert.deepEqual(t.getGitHubProductToken(GH_PRODUCT), { token: newer, expires: "2027-01-01" }, "what this browser has is kept");
  assert.ok(m.kept.includes(`GitHub token for ${GH_PRODUCT}`));
  const u = createStore(fakeStorage());
  const m2 = mergeSettings(u.entries(), await readSettingsFile(file));
  u.putEntries(m2.put);
  assert.deepEqual(u.getGitHubProductToken(GH_PRODUCT), { token: GH_PRODUCT_TOKEN, expires: "2026-12-29" });
  assert.ok(m2.added.includes(`GitHub token for ${GH_PRODUCT}`));
});

// ---------------------------------------------------------------- jump host and remote sessions (queue 2026-09-30, entries 01, 02)
// THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS (UC-042)

test("THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS — stored under their keys, exported and imported, cleared by a clear", async () => {
  const st = fakeStorage(), s = createStore(st);
  assert.ok(KEYS.includes(JUMP_HOST_KEY) && KEYS.includes(REMOTE_SESSIONS_KEY));
  s.setJumpHost(JUMP);
  const sessions = addRemoteSession(JUMP, [], { name: "lab-pc", bridgePort: 8765, token: BRIDGE_TOKEN });
  s.setRemoteSessions(sessions);
  assert.deepEqual(s.getJumpHost(), JUMP);
  assert.deepEqual(s.getRemoteSessions(), sessions);
  assert.ok([...st.mem.keys()].every((k) => k.startsWith(PREFIX)));
  // Exported with the bridge token, named in the notice; imported into an empty browser as they were.
  const file = await exportSettings(s.entries(), { now: WHEN });
  assert.ok(file.includes(BRIDGE_TOKEN));
  const t = createStore(fakeStorage());
  const m = mergeSettings(t.entries(), await readSettingsFile(file));
  t.putEntries(m.put);
  assert.deepEqual(t.getJumpHost(), JUMP);
  assert.deepEqual(t.getRemoteSessions(), sessions);
  // UC-042 6a: a session this browser has is kept; one whose port is taken here is not added, and both are listed.
  const u = createStore(fakeStorage());
  u.setJumpHost(JUMP);
  u.setRemoteSessions([{ name: "lab-pc", port: 20003, bridgePort: 1, token: "mine" }, { name: "other", port: 20001, bridgePort: 1, token: "" }]);
  const m2 = mergeSettings(u.entries(), await readSettingsFile(file));
  u.putEntries(m2.put);
  assert.deepEqual(u.getRemoteSessions().map((x) => [x.name, x.port, x.token]), [["lab-pc", 20003, "mine"], ["other", 20001, ""]]);
  assert.ok(m2.kept.some((k) => /lab-pc/.test(k)));
  // Counter-proof: a session that is new here but whose port a session of this browser uses is not added — no two share a port.
  const w = createStore(fakeStorage());
  w.setJumpHost(JUMP);
  w.setRemoteSessions([{ name: "other", port: 20001, bridgePort: 1, token: "" }]);
  const m3 = mergeSettings(w.entries(), await readSettingsFile(file));
  w.putEntries(m3.put);
  assert.deepEqual(w.getRemoteSessions().map((x) => x.name), ["other"]);
  assert.ok(m3.kept.some((k) => /lab-pc.*20001/.test(k)), "and the page says why");
  // A CLEAR IS A REAL CLEAR: clearing removes them from storage.
  s.clearRemoteSession("lab-pc");
  assert.deepEqual(s.getRemoteSessions(), []);
  assert.equal(st.getItem(REMOTE_SESSIONS_KEY), null, "the last session cleared leaves no entry");
  s.setRemoteSessions(sessions);
  s.clear();
  assert.equal(st.mem.size, 0);
  assert.equal(s.getJumpHost(), null);
});

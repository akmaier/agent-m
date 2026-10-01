// The browser store of an Agent M instance — the ONLY module that touches browser storage.
//
// Module: MOD-settings-store
//
// SPEC §7: configuration, including the GitHub token, lives in the browser's localStorage and
// nowhere else; no cookie; a clear removes the entries, not only the form. Every key carries the
// prefix "agent-m." so that clear() removes exactly Agent M's entries and nothing of another page
// on the same origin.
//
// SPEC §10 THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER: the addresses of the products (A PRODUCT
// IS NAMED BY ITS ADDRESS) are kept here, beside the token, as one JSON list — never in the instance
// repository (NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY). clear() removes them with the token.
//
// SPEC §7 EVERY SETTING IS REACHED FROM ONE PAGE: every key is one of the named constants below, and
// each has its place on the settings page (core.browserSettingsHtml; tests/test_settings_page.py).
// A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE: the date the person entered is kept beside the token.
// SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS: entries() and putEntries() carry exactly
// these keys, and nothing else, to and from an export file.
//
// SPEC §7 A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN: each GitLab product has its own token, kept under
// its product's address in one JSON map { address: { token, expires } }. A token is looked up only by the
// address of the product it was stored for; review-core.mjs sends it only to that project's API
// (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT). Removing the product removes its token.
//
// SPEC §7 THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS: the jump host { host, user, portFrom, portTo, reverseKey,
// forwardKey } — key file NAMES only, never key contents — and the remote sessions [{ name, port, bridgePort, token }], each as
// one JSON entry. Their rules (a port from the range, the tunnel commands) live in bridge-tunnel.mjs.
//
// Beside the settings, this module keeps the texts of repository files the dashboard has read (fileTexts, below) — in Cache
// Storage, never in localStorage.
//
// UC-042 step 1 · A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN: the last test of a setting — ✓ works with its date, or
// ✗ refused at the last use — is kept beside the setting it describes, so that its line shows it after a reload too: the GitHub
// token's in TOKEN_TEST_KEY beside the token and its expiry date; a GitLab project token's as `tested` in its entry of the map; a
// remote session's as `tested` in its entry of the list. A new value starts untested (an old test never sticks to a new token),
// and clearing a setting clears its test with it (A CLEAR IS A REAL CLEAR); an export carries them like every other entry.

export const PREFIX = "agent-m.";
export const TOKEN_KEY = PREFIX + "github-token";
export const TOKEN_EXPIRY_KEY = PREFIX + "github-token-expires";
export const TOKEN_TEST_KEY = PREFIX + "github-token-tested";
export const PRODUCTS_KEY = PREFIX + "products";
export const GITLAB_TOKENS_KEY = PREFIX + "gitlab-tokens";
export const JUMP_HOST_KEY = PREFIX + "jump-host";
export const REMOTE_SESSIONS_KEY = PREFIX + "remote-sessions";
export const KEYS = [TOKEN_KEY, TOKEN_EXPIRY_KEY, TOKEN_TEST_KEY, PRODUCTS_KEY, GITLAB_TOKENS_KEY, JUMP_HOST_KEY, REMOTE_SESSIONS_KEY];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// A token's last test: { ok: "YYYY-MM-DD" } — the server accepted it that day —, { refused: true } — the server refused it at the
// last use —, or null; anything else reads as null.
export function tokenTest(v) {
  if (!v || typeof v !== "object") return null;
  if (v.refused === true) return { refused: true };
  return typeof v.ok === "string" && DATE_RE.test(v.ok) ? { ok: v.ok } : null;
}
// A remote session's last test: { up: "YYYY-MM-DD" } — something answered at its local port that day —, { down: true } — nothing
// answered —, or null.
export function sessionTest(v) {
  if (!v || typeof v !== "object") return null;
  if (v.down === true) return { down: true };
  return typeof v.up === "string" && DATE_RE.test(v.up) ? { up: v.up } : null;
}

export function createStore(storage) {
  const safe = (f, fallback) => { try { return f(); } catch { return fallback; } };
  return {
    getToken: () => safe(() => storage.getItem(TOKEN_KEY), null) || null,
    // A new token comes with its own expiry date, or none: an old date never sticks to a new token, nor an old test.
    setToken(t, expires = null) {
      storage.setItem(TOKEN_KEY, String(t).trim());
      if (expires) storage.setItem(TOKEN_EXPIRY_KEY, String(expires));
      else storage.removeItem(TOKEN_EXPIRY_KEY);
      storage.removeItem(TOKEN_TEST_KEY);
    },
    getTokenExpiry: () => safe(() => storage.getItem(TOKEN_EXPIRY_KEY), null) || null,
    // The GitHub token's last test (tokenTest), kept beside it; none without a token.
    getTokenTest() { return this.getToken() ? tokenTest(safe(() => JSON.parse(storage.getItem(TOKEN_TEST_KEY) || "null"), null)) : null; },
    // result: as tokenTest reads it, or null to forget it. Without a stored token nothing is kept.
    setTokenTest(result) {
      const t = tokenTest(result);
      if (t && this.getToken()) storage.setItem(TOKEN_TEST_KEY, JSON.stringify(t));
      else storage.removeItem(TOKEN_TEST_KEY);
    },
    clearToken() {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(TOKEN_EXPIRY_KEY);
      storage.removeItem(TOKEN_TEST_KEY);
    },
    getProducts() {
      const list = safe(() => JSON.parse(storage.getItem(PRODUCTS_KEY) || "[]"), []);
      return Array.isArray(list) ? list.filter((a) => typeof a === "string") : [];
    },
    addProduct(address) {
      const list = this.getProducts();
      if (!list.includes(address)) storage.setItem(PRODUCTS_KEY, JSON.stringify([...list, address]));
    },
    removeProduct(address) {
      storage.setItem(PRODUCTS_KEY, JSON.stringify(this.getProducts().filter((a) => a !== address)));
      this.clearGitLabToken(address);
    },
    clearProducts() {
      storage.removeItem(PRODUCTS_KEY);
      storage.removeItem(GITLAB_TOKENS_KEY);
    },
    // { address: { token, expires[, tested] } } — every GitLab project token of this browser, with its last test if it has one.
    gitLabTokens() { return gitlabTokenMap(safe(() => storage.getItem(GITLAB_TOKENS_KEY), null)); },
    getGitLabToken(address) { return this.gitLabTokens()[address] || null; },
    // A new token comes with its own expiry date, or none, and untested (as setToken).
    setGitLabToken(address, token, expires = null) {
      const map = this.gitLabTokens();
      map[address] = { token: String(token).trim(), expires: expires ? String(expires) : null };
      storage.setItem(GITLAB_TOKENS_KEY, JSON.stringify(map));
    },
    // The last test of the GitLab project token of `address`, kept in its entry; result as tokenTest reads it, or null to forget
    // it. Without a token for that address nothing is kept.
    setGitLabTokenTest(address, result) {
      const map = this.gitLabTokens();
      if (!map[address]) return;
      const t = tokenTest(result);
      if (t) map[address].tested = t;
      else delete map[address].tested;
      storage.setItem(GITLAB_TOKENS_KEY, JSON.stringify(map));
    },
    clearGitLabToken(address) {
      const map = this.gitLabTokens();
      if (!(address in map)) return;
      delete map[address];
      if (Object.keys(map).length) storage.setItem(GITLAB_TOKENS_KEY, JSON.stringify(map));
      else storage.removeItem(GITLAB_TOKENS_KEY);
    },
    getJumpHost() {
      const j = safe(() => JSON.parse(storage.getItem(JUMP_HOST_KEY) || "null"), null);
      return j && typeof j === "object" && !Array.isArray(j) ? j : null;
    },
    setJumpHost(j) { storage.setItem(JUMP_HOST_KEY, JSON.stringify(j)); },
    clearJumpHost() { storage.removeItem(JUMP_HOST_KEY); },
    getRemoteSessions() {
      const list = safe(() => JSON.parse(storage.getItem(REMOTE_SESSIONS_KEY) || "[]"), []);
      return Array.isArray(list) ? list.filter((x) => x && typeof x.name === "string" && Number.isInteger(x.port)) : [];
    },
    setRemoteSessions(list) {
      if (list.length) storage.setItem(REMOTE_SESSIONS_KEY, JSON.stringify(list));
      else storage.removeItem(REMOTE_SESSIONS_KEY);
    },
    // The last test of the remote session `name`, kept in its entry; result as sessionTest reads it, or null to forget it.
    setRemoteSessionTest(name, result) {
      const list = this.getRemoteSessions();
      const s = list.find((x) => x.name === name);
      if (!s) return;
      const t = sessionTest(result);
      if (t) s.tested = t;
      else delete s.tested;
      this.setRemoteSessions(list);
    },
    clearRemoteSession(name) { this.setRemoteSessions(this.getRemoteSessions().filter((x) => x.name !== name)); },
    clearRemoteSessions() { storage.removeItem(REMOTE_SESSIONS_KEY); },
    // Every stored setting as { key: raw value } — what an export holds.
    entries() {
      const out = {};
      for (const k of KEYS) {
        const v = safe(() => storage.getItem(k), null);
        if (v !== null && v !== undefined) out[k] = v;
      }
      return out;
    },
    // Store raw values from an import; a key this page does not know is not stored.
    putEntries(values) {
      for (const [k, v] of Object.entries(values || {})) {
        if (KEYS.includes(k) && typeof v === "string") storage.setItem(k, v);
      }
    },
    clear() {
      const mine = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith(PREFIX)) mine.push(k);
      }
      for (const k of mine) storage.removeItem(k);
    },
  };
}

// ---------------------------------------------------------------- file texts by blob SHA
//
// The texts of repository files the dashboard has read, kept by repository and git blob SHA so that a file is not read again
// until its blob changes (review-core.mjs readByBlob checks every kept text against its SHA before it is used). They are not
// settings: nothing here configures Agent M, so they are kept in the browser's Cache Storage, not in localStorage, whose every
// key is a setting with a place on the settings page (EVERY SETTING IS REACHED FROM ONE PAGE). "Clear everything" on the
// settings page removes them with the settings (A CLEAR IS A REAL CLEAR). Every access is caught: without Cache Storage — a
// private window, blocked site data, an insecure address — nothing is kept and the page reads every file from the server.

export const FILE_TEXTS = "agent-m-file-texts";

// cacheStorage: the browser's CacheStorage (globalThis.caches) or a stand-in with open, delete and has.
// -> { get(key) -> text | null, put(key, text), clear() -> true when nothing is kept any more }
export function createFileTexts(cacheStorage) {
  let opened = null;
  const cache = () => (opened ??= cacheStorage.open(FILE_TEXTS));
  const address = (key) => `/${FILE_TEXTS}/${String(key).split("/").map(encodeURIComponent).join("/")}`;
  return {
    async get(key) {
      if (!cacheStorage) return null;
      try { const r = await (await cache()).match(address(key)); return r ? await r.text() : null; } catch { return null; }
    },
    async put(key, text) {
      if (!cacheStorage) return;
      try {
        await (await cache()).put(address(key), new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } }));
      } catch { /* not kept: the file is read again next time */ }
    },
    async clear() {
      if (!cacheStorage) return true;
      opened = null;
      try { await cacheStorage.delete(FILE_TEXTS); } catch { /* asked below whether anything is kept */ }
      // A Cache Storage that refuses even this question could keep nothing either.
      try { return !(await cacheStorage.has(FILE_TEXTS)); } catch { return true; }
    },
  };
}

export function fileTexts() {
  let s = null;
  try { s = globalThis.caches ?? null; } catch { s = null; }
  return createFileTexts(s);
}

export function browserStore() {
  let storage = null;
  try { storage = globalThis.localStorage; } catch { storage = null; }
  if (!storage) {
    // Private windows and blocked storage: behave as an empty store that cannot keep anything.
    const mem = new Map();
    storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k),
      get length() { return mem.size; }, key: (i) => [...mem.keys()][i] ?? null };
  }
  return createStore(storage);
}

// ---------------------------------------------------------------- the settings by name, export and import (UC-042 6, UC-014 7a)
//
// EVERY SETTING IS REACHED FROM ONE PAGE · AN EXPORT STATES THAT IT CONTAINS SECRETS: settingKeys names every key this store
// writes, with its label and, for a secret, what it grants; the settings page and the export notice are built from it.

export const settingKeys = [
  { key: TOKEN_KEY, label: "GitHub token", secret: true,
    grants: "writes — commits, issues, pull requests and workflow runs — to every repository it was given, under your account" },
  { key: TOKEN_EXPIRY_KEY, label: "GitHub token expiry date", secret: false, partOf: TOKEN_KEY },
  { key: TOKEN_TEST_KEY, label: "GitHub token's last test", secret: false, partOf: TOKEN_KEY },
  { key: PRODUCTS_KEY, label: "Products", secret: false },
  { key: GITLAB_TOKENS_KEY, label: "GitLab project tokens", secret: true,
    grants: "write — commits — to the one GitLab project each was created for, with the role it was given there" },
  { key: JUMP_HOST_KEY, label: "Jump host", secret: false },
  { key: REMOTE_SESSIONS_KEY, label: "remote sessions' bridge tokens", secret: true,
    grants: "hand jobs to the CLI session behind each tunnel, which works there with that machine's own credentials" },
];

export const parseJson = (raw, fallback) => { try { return JSON.parse(raw || "null") ?? fallback; } catch { return fallback; } };
export const sessionList = (raw) => { const l = parseJson(raw, []); return Array.isArray(l) ? l.filter((x) => x && typeof x.name === "string") : []; };

// The GitLab project tokens of a raw store value: { address: { token, expires[, tested] } } — `tested` only where a last test is
// kept (tokenTest); anything malformed is left out.
export function gitlabTokenMap(raw) {
  let m;
  try { m = JSON.parse(raw || "{}"); } catch { return {}; }
  if (!m || typeof m !== "object" || Array.isArray(m)) return {};
  return Object.fromEntries(Object.entries(m).filter(([, v]) => v && typeof v.token === "string" && v.token)
    .map(([a, v]) => {
      const t = tokenTest(v.tested);
      return [a, { token: v.token, expires: typeof v.expires === "string" && v.expires ? v.expires : null, ...(t ? { tested: t } : {}) }];
    }));
}
const settingLabel = (k) => settingKeys.find((s) => s.key === k)?.label ?? k;

export const SETTINGS_FORMAT = "agent-m-settings";
export const PBKDF2_ITERATIONS = 600000;

const b64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function passphraseKey(passphrase, salt, iterations) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, base,
    { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

// SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS · AN EXPORT CAN BE LOCKED WITH A PASSPHRASE.
// entries: { key: raw value }. Locked: PBKDF2 (SHA-256, random salt) → AES-GCM (random IV); salt, IV and
// iteration count are stored beside the ciphertext. -> the file's text (JSON).
export async function exportSettings(entries, { passphrase = "", now = new Date() } = {}) {
  const head = { format: SETTINGS_FORMAT, version: 1, exported: now.toISOString(),
    note: "Contains the tokens, keys and passwords of an Agent M dashboard. Whoever holds it can use them." };
  if (!passphrase) return JSON.stringify({ ...head, settings: entries }, null, 2) + "\n";
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await passphraseKey(passphrase, salt, PBKDF2_ITERATIONS);
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(entries)));
  return JSON.stringify({ ...head, locked: { kdf: "PBKDF2", hash: "SHA-256", iterations: PBKDF2_ITERATIONS, salt: b64(salt),
    cipher: "AES-GCM", iv: b64(iv), data: b64(data) } }, null, 2) + "\n";
}

// -> { key: raw value }. A locked file without passphrase throws { locked: true }; a wrong passphrase
// throws { wrongPassphrase: true } — in both cases nothing has been read, so nothing can be imported.
export async function readSettingsFile(text, passphrase = "") {
  let f;
  try { f = JSON.parse(text); } catch { f = null; }
  if (!f || f.format !== SETTINGS_FORMAT) throw new Error("This is not an Agent M settings file.");
  let settings = f.settings;
  if (f.locked) {
    if (!passphrase) throw Object.assign(new Error("This file is locked — enter its passphrase."), { locked: true });
    try {
      const L = f.locked;
      const key = await passphraseKey(passphrase, unb64(L.salt), L.iterations);
      settings = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(L.iv) }, key, unb64(L.data))));
    } catch {
      throw Object.assign(new Error("Wrong passphrase, or the file is damaged — nothing was imported."), { wrongPassphrase: true });
    }
  }
  if (!settings || typeof settings !== "object") throw new Error("The file holds no settings.");
  return Object.fromEntries(Object.entries(settings).filter(([, v]) => typeof v === "string"));
}

// UC-042 6a: what this browser has is kept; only what is missing is added; both are listed. A token that is
// kept keeps its own expiry date and its own last test; a token that is added brings the file's. -> { put, added, kept, ignored }
export function mergeSettings(current, incoming) {
  const known = new Set(settingKeys.map((s) => s.key));
  const put = {}, added = [], kept = [], ignored = [];
  const list = (v) => { try { const a = JSON.parse(v || "[]"); return Array.isArray(a) ? a.filter((x) => typeof x === "string") : []; } catch { return []; } };
  for (const [k, v] of Object.entries(incoming)) {
    if (!known.has(k)) { ignored.push(k); continue; }
    if (k === TOKEN_EXPIRY_KEY || k === TOKEN_TEST_KEY) continue; // follow their token, below
    if (k === GITLAB_TOKENS_KEY) {
      const have = gitlabTokenMap(current[k]), inc = gitlabTokenMap(v), out = { ...have };
      for (const [a, t] of Object.entries(inc)) {
        const name = `GitLab project token for ${a}`;
        if (have[a]) { kept.push(name); continue; }
        out[a] = t;
        added.push(name);
      }
      if (Object.keys(out).length > Object.keys(have).length) put[k] = JSON.stringify(out);
      continue;
    }
    if (k === REMOTE_SESSIONS_KEY) {
      const have = sessionList(current[k]), out = [...have];
      for (const s of sessionList(v)) {
        if (have.some((x) => x.name === s.name)) { kept.push(`remote session ${s.name}`); continue; }
        if (out.some((x) => x.port === s.port)) { kept.push(`remote session ${s.name} not added: its port ${s.port} is used here`); continue; }
        out.push(s);
        added.push(`remote session ${s.name}`);
      }
      if (out.length > have.length) put[k] = JSON.stringify(out);
      continue;
    }
    if (k === PRODUCTS_KEY) {
      const have = list(current[k]), fresh = list(v).filter((a) => !have.includes(a));
      kept.push(...list(v).filter((a) => have.includes(a)).map((a) => `product ${a}`));
      added.push(...fresh.map((a) => `product ${a}`));
      if (fresh.length) put[k] = JSON.stringify([...have, ...fresh]);
      continue;
    }
    if (current[k]) { kept.push(settingLabel(k)); continue; }
    put[k] = v;
    added.push(settingLabel(k));
    if (k === TOKEN_KEY && incoming[TOKEN_EXPIRY_KEY]) put[TOKEN_EXPIRY_KEY] = incoming[TOKEN_EXPIRY_KEY];
    if (k === TOKEN_KEY && incoming[TOKEN_TEST_KEY]) put[TOKEN_TEST_KEY] = incoming[TOKEN_TEST_KEY];
  }
  return { put, added, kept, ignored };
}

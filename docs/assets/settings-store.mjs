// The browser store of an Agent M instance — the ONLY module that touches browser storage.
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

export const PREFIX = "agent-m.";
export const TOKEN_KEY = PREFIX + "github-token";
export const TOKEN_EXPIRY_KEY = PREFIX + "github-token-expires";
export const PRODUCTS_KEY = PREFIX + "products";
export const GITLAB_TOKENS_KEY = PREFIX + "gitlab-tokens";
export const KEYS = [TOKEN_KEY, TOKEN_EXPIRY_KEY, PRODUCTS_KEY, GITLAB_TOKENS_KEY];

export function createStore(storage) {
  const safe = (f, fallback) => { try { return f(); } catch { return fallback; } };
  return {
    getToken: () => safe(() => storage.getItem(TOKEN_KEY), null) || null,
    // A new token comes with its own expiry date, or none: an old date never sticks to a new token.
    setToken(t, expires = null) {
      storage.setItem(TOKEN_KEY, String(t).trim());
      if (expires) storage.setItem(TOKEN_EXPIRY_KEY, String(expires));
      else storage.removeItem(TOKEN_EXPIRY_KEY);
    },
    getTokenExpiry: () => safe(() => storage.getItem(TOKEN_EXPIRY_KEY), null) || null,
    clearToken() {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(TOKEN_EXPIRY_KEY);
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
    // { address: { token, expires } } — every GitLab project token of this browser.
    gitLabTokens() {
      const map = safe(() => JSON.parse(storage.getItem(GITLAB_TOKENS_KEY) || "{}"), {});
      if (!map || typeof map !== "object" || Array.isArray(map)) return {};
      return Object.fromEntries(Object.entries(map).filter(([, v]) => v && typeof v.token === "string" && v.token)
        .map(([a, v]) => [a, { token: v.token, expires: typeof v.expires === "string" && v.expires ? v.expires : null }]));
    },
    getGitLabToken(address) { return this.gitLabTokens()[address] || null; },
    // A new token comes with its own expiry date, or none (as setToken).
    setGitLabToken(address, token, expires = null) {
      const map = this.gitLabTokens();
      map[address] = { token: String(token).trim(), expires: expires ? String(expires) : null };
      storage.setItem(GITLAB_TOKENS_KEY, JSON.stringify(map));
    },
    clearGitLabToken(address) {
      const map = this.gitLabTokens();
      if (!(address in map)) return;
      delete map[address];
      if (Object.keys(map).length) storage.setItem(GITLAB_TOKENS_KEY, JSON.stringify(map));
      else storage.removeItem(GITLAB_TOKENS_KEY);
    },
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

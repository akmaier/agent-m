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

export const PREFIX = "agent-m.";
export const TOKEN_KEY = PREFIX + "github-token";
export const PRODUCTS_KEY = PREFIX + "products";

export function createStore(storage) {
  const safe = (f, fallback) => { try { return f(); } catch { return fallback; } };
  return {
    getToken: () => safe(() => storage.getItem(TOKEN_KEY), null) || null,
    setToken: (t) => { storage.setItem(TOKEN_KEY, String(t).trim()); },
    getProducts() {
      const list = safe(() => JSON.parse(storage.getItem(PRODUCTS_KEY) || "[]"), []);
      return Array.isArray(list) ? list.filter((a) => typeof a === "string") : [];
    },
    addProduct(address) {
      const list = this.getProducts();
      if (!list.includes(address)) storage.setItem(PRODUCTS_KEY, JSON.stringify([...list, address]));
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

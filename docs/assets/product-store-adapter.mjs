// Between sprint jobs: the legacy dashboard settings API translated to MOD-browser-store for products and tokens.

import { browserStore } from "./settings-store.mjs";
import { openStore, readSetting, writeSetting, clearSetting } from "../../src/browser-store/index.mjs";

const day = () => new Date().toISOString().slice(0, 10);

function tokenKey(address) {
  const url = new URL(address);
  const path = url.pathname.replace(/^\//, "");
  return url.hostname === "github.com" ? `github-token:${path}` : `gitlab-token:${url.hostname}/${path}`;
}

function valueOf(token, expires, name, tested = null) {
  return { value: token, name, expires: expires ?? null, stored: day(), ...(tested ? { tested } : {}) };
}

function canonicalTest(test, kind = "token") {
  if (!test || typeof test !== "object") return { converted: true, value: null };
  const at = kind === "session" ? test.up : test.ok;
  if (typeof at === "string") return { converted: true, value: { at, outcome: "working" } };
  // Legacy refusal/down records deliberately have no date.  The canonical shape requires one, so leave their
  // source record intact instead of inventing an observed test time.
  return { converted: false, value: null };
}

function observedTest(test) {
  if (!test || typeof test !== "object") return null;
  if (test.refused === true) return { at: new Date().toISOString(), outcome: "refused" };
  if (typeof test.ok === "string") return { at: new Date().toISOString(), outcome: "working" };
  return null;
}

function legacyTest(store, key) {
  const value = readSetting(store, `last-test:${key}`);
  return value?.outcome === "working" ? { ok: value.at } : value?.outcome === "refused" ? { refused: true } : undefined;
}

function tokenMatches(value, token, expires) {
  return value?.value === token && (value.expires ?? null) === (expires ?? null);
}

function copyToken(store, key, token, expires, name, tested) {
  const test = canonicalTest(tested);
  if (typeof token !== "string" || !test.converted) return false;
  const current = readSetting(store, key);
  if (current === null) writeSetting(store, key, valueOf(token, expires, name));
  if (!tokenMatches(readSetting(store, key), token, expires)) return false;
  if (test.value) {
    const testKey = `last-test:${key}`;
    if (readSetting(store, testKey) === null) writeSetting(store, testKey, test.value);
    if (JSON.stringify(readSetting(store, testKey)) !== JSON.stringify(test.value)) return false;
  }
  return true;
}

function copyProducts(store, products) {
  if (!products.length) return true;
  const current = readSetting(store, "products");
  const next = [...new Set([...(Array.isArray(current) ? current : []), ...products])];
  if (current === null || next.length !== current.length) writeSetting(store, "products", next);
  const stored = readSetting(store, "products");
  return Array.isArray(stored) && products.every((address) => stored.includes(address));
}

// productStore(instance) -> the dashboard's established settings API. Its token and product-list calls share the
// instance-prefixed MOD-browser-store entries with the add-product route; unrelated legacy settings and its export/import
// format remain with settings-store.mjs until their own migration.
export function productStore(instance) {
  const legacy = browserStore();
  const store = openStore(instance);

  const migrate = () => {
    const token = legacy.getToken();
    if (token && copyToken(store, "github-token", token, legacy.getTokenExpiry(), `Agent M · ${instance}`, legacy.getTokenTest())) legacy.clearToken();
    const github = legacy.gitHubProductTokens(), gitlab = legacy.gitLabTokens();
    const sources = [...Object.entries(github).map(([address, value]) => ({ address, value, clear: () => legacy.clearGitHubProductToken(address) })),
      ...Object.entries(gitlab).map(([address, value]) => ({ address, value, clear: () => legacy.clearGitLabToken(address) }))];
    const converted = new Set();
    for (const { address, value } of sources) {
      if (copyToken(store, tokenKey(address), value?.token, value?.expires, "Agent M", value?.tested)) converted.add(address);
    }
    const known = [...new Set([...legacy.getProducts(), ...converted])];
    if (copyProducts(store, known)) {
      for (const address of legacy.getProducts()) {
        const source = sources.find((item) => item.address === address);
        if (!source || converted.has(address)) legacy.removeProduct(address);
      }
      for (const source of sources) if (!legacy.getProducts().includes(source.address) && converted.has(source.address)) source.clear();
    }
    const jump = legacy.getJumpHost();
    if (jump && typeof jump.host === "string" && typeof jump.user === "string" && Number.isInteger(jump.portFrom) && Number.isInteger(jump.portTo)
      && !jump.reverseKey && !jump.forwardKey && readSetting(store, "jump-host") === null) {
      const value = { hostname: jump.host, user: jump.user, sshPort: 22, portRange: [jump.portFrom, jump.portTo] };
      writeSetting(store, "jump-host", value);
      if (JSON.stringify(readSetting(store, "jump-host")) === JSON.stringify(value)) legacy.clearJumpHost();
    }
    for (const session of legacy.getRemoteSessions()) {
      const test = canonicalTest(session.tested, "session");
      if (typeof session.token !== "string" || session.bridgePort !== undefined || !test.converted) continue;
      const key = `remote-session:${session.name}`, value = { port: session.port, token: session.token };
      if (readSetting(store, key) === null) writeSetting(store, key, value);
      if (JSON.stringify(readSetting(store, key)) !== JSON.stringify(value)) continue;
      if (test.value) {
        const testKey = `last-test:${key}`;
        if (readSetting(store, testKey) === null) writeSetting(store, testKey, test.value);
        if (JSON.stringify(readSetting(store, testKey)) !== JSON.stringify(test.value)) continue;
      }
      legacy.clearRemoteSession(session.name);
    }
  };
  migrate();
  return {
    ...legacy,
    getToken: () => readSetting(store, "github-token")?.value ?? legacy.getToken(),
    getTokenExpiry: () => readSetting(store, "github-token")?.expires ?? legacy.getTokenExpiry(),
    getTokenTest: () => {
      const value = readSetting(store, "last-test:github-token");
      return value?.outcome === "working" ? { ok: value.at } : value?.outcome === "refused" ? { refused: true } : legacy.getTokenTest();
    },
    setToken(token, expires = null) {
      writeSetting(store, "github-token", valueOf(String(token).trim(), expires, `Agent M · ${instance}`));
    },
    setTokenTest(result) {
      const test = observedTest(result);
      if (readSetting(store, "github-token")?.value && test) writeSetting(store, "last-test:github-token", test);
    },
    getProducts: () => readSetting(store, "products") ?? legacy.getProducts(),
    addProduct(address) {
      const products = readSetting(store, "products") ?? [];
      if (!products.includes(address)) writeSetting(store, "products", [...products, address]);
    },
    getGitHubProductToken(address) {
      const token = readSetting(store, tokenKey(address));
      return token?.value ? { token: token.value, expires: token.expires ?? null, tested: legacyTest(store, tokenKey(address)) } : legacy.getGitHubProductToken(address);
    },
    setGitHubProductToken(address, token, expires = null) {
      writeSetting(store, tokenKey(address), valueOf(String(token).trim(), expires, "Agent M"));
    },
    setGitHubProductTokenTest(address, result) {
      const test = observedTest(result);
      if (readSetting(store, tokenKey(address))?.value && test) writeSetting(store, `last-test:${tokenKey(address)}`, test);
    },
    clearGitHubProductToken(address) {
      clearSetting(store, tokenKey(address));
      legacy.clearGitHubProductToken(address);
    },
    getGitLabToken(address) {
      const token = readSetting(store, tokenKey(address));
      return token?.value ? { token: token.value, expires: token.expires ?? null, tested: legacyTest(store, tokenKey(address)) } : legacy.getGitLabToken(address);
    },
    setGitLabToken(address, token, expires = null) {
      writeSetting(store, tokenKey(address), valueOf(String(token).trim(), expires, "Agent M"));
    },
    setGitLabTokenTest(address, result) {
      const test = observedTest(result);
      if (readSetting(store, tokenKey(address))?.value && test) writeSetting(store, `last-test:${tokenKey(address)}`, test);
    },
    clearGitLabToken(address) {
      clearSetting(store, tokenKey(address));
      legacy.clearGitLabToken(address);
    },
    tokenFor(product) {
      const address = product?.address;
      const own = address ? readSetting(store, tokenKey(address)) : null;
      return own?.value ?? (address && new URL(address).hostname === "github.com"
        ? readSetting(store, "github-token")?.value ?? legacy.getToken() : null);
    },
    clearToken() { clearSetting(store, "github-token"); legacy.clearToken(); },
    clearProducts() {
      for (const address of readSetting(store, "products") ?? []) clearSetting(store, tokenKey(address));
      clearSetting(store, "products"); legacy.clearProducts();
    },
    removeProduct(address) {
      const products = (readSetting(store, "products") ?? []).filter((item) => item !== address);
      clearSetting(store, tokenKey(address));
      if (products.length) writeSetting(store, "products", products);
      else clearSetting(store, "products");
      legacy.removeProduct(address);
    },
    clear() { this.clearToken(); this.clearProducts(); legacy.clear(); },
    putEntries(values) { legacy.putEntries(values); migrate(); },
    entries() { return legacy.entries(); },
  };
}

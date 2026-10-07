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

// productStore(instance) -> the dashboard's established settings API. Its token and product-list calls share the
// instance-prefixed MOD-browser-store entries with the add-product route; unrelated legacy settings and its export/import
// format remain with settings-store.mjs until their own migration.
export function productStore(instance) {
  const legacy = browserStore();
  const store = openStore(instance);

  const migrate = () => {
    if (readSetting(store, "github-token") === null && legacy.getToken()) {
      writeSetting(store, "github-token", valueOf(legacy.getToken(), legacy.getTokenExpiry(), `Agent M · ${instance}`, legacy.getTokenTest()));
    }
    const github = legacy.gitHubProductTokens(), gitlab = legacy.gitLabTokens();
    const products = [...new Set([...(readSetting(store, "products") ?? []), ...legacy.getProducts(), ...Object.keys(github), ...Object.keys(gitlab)])];
    if (products.length && JSON.stringify(products) !== JSON.stringify(readSetting(store, "products") ?? [])) writeSetting(store, "products", products);
    for (const [address, old] of [...Object.entries(github), ...Object.entries(gitlab)]) {
      const key = tokenKey(address);
      if (readSetting(store, key) === null && old?.token) writeSetting(store, key, valueOf(old.token, old.expires, "Agent M", old.tested));
    }
  };
  const syncLegacy = () => {
    const own = readSetting(store, "github-token");
    if (own?.value) {
      // A legacy settings page can add an expiry or last test to the same token after the public route first
      // created its canonical entry.  Preserve that metadata in both stores; if values differ, the canonical
      // token is the current configuration and must not be replaced by the stale legacy value.
      const sameToken = legacy.getToken() === own.value;
      const expires = sameToken ? legacy.getTokenExpiry() ?? own.expires : own.expires;
      const tested = sameToken ? legacy.getTokenTest() ?? own.tested : own.tested;
      const { tested: ignored, ...setting } = own;
      const merged = { ...setting, expires: expires ?? null, ...(tested ? { tested } : {}) };
      if (JSON.stringify(merged) !== JSON.stringify(own)) writeSetting(store, "github-token", merged);
      legacy.setToken(own.value, expires);
      legacy.setTokenTest(tested ?? null);
    }
    const products = readSetting(store, "products");
    if (Array.isArray(products)) {
      legacy.clearProducts();
      for (const address of products) {
        legacy.addProduct(address);
        const token = readSetting(store, tokenKey(address));
        if (token?.value) {
          if (new URL(address).hostname === "github.com") legacy.setGitHubProductToken(address, token.value, token.expires);
          else legacy.setGitLabToken(address, token.value, token.expires);
          if (token.tested) {
            if (new URL(address).hostname === "github.com") legacy.setGitHubProductTokenTest(address, token.tested);
            else legacy.setGitLabTokenTest(address, token.tested);
          }
        }
      }
    }
  };
  migrate();
  // A public add-product route may have written its token without a legacy dashboard call.  Mirror it before legacy
  // settings/export consumers render, so they enumerate the same configured product token after a reload.
  syncLegacy();
  return {
    ...legacy,
    getToken: () => readSetting(store, "github-token")?.value ?? legacy.getToken(),
    setToken(token, expires = null) {
      writeSetting(store, "github-token", valueOf(String(token).trim(), expires, `Agent M · ${instance}`));
      legacy.setToken(token, expires);
    },
    setTokenTest(result) {
      legacy.setTokenTest(result);
      const token = readSetting(store, "github-token"), tested = legacy.getTokenTest();
      if (token?.value) { const { tested: ignored, ...setting } = token; writeSetting(store, "github-token", { ...setting, ...(tested ? { tested } : {}) }); }
    },
    getProducts: () => readSetting(store, "products") ?? legacy.getProducts(),
    addProduct(address) {
      const products = readSetting(store, "products") ?? [];
      if (!products.includes(address)) writeSetting(store, "products", [...products, address]);
      legacy.addProduct(address);
    },
    getGitHubProductToken(address) {
      const token = readSetting(store, tokenKey(address));
      return token?.value ? { token: token.value, expires: token.expires ?? null } : legacy.getGitHubProductToken(address);
    },
    setGitHubProductToken(address, token, expires = null) {
      writeSetting(store, tokenKey(address), valueOf(String(token).trim(), expires, "Agent M"));
      legacy.setGitHubProductToken(address, token, expires);
    },
    setGitHubProductTokenTest(address, result) {
      legacy.setGitHubProductTokenTest(address, result);
      const token = readSetting(store, tokenKey(address)), tested = legacy.getGitHubProductToken(address)?.tested;
      if (token?.value) { const { tested: ignored, ...setting } = token; writeSetting(store, tokenKey(address), { ...setting, ...(tested ? { tested } : {}) }); }
    },
    clearGitHubProductToken(address) {
      clearSetting(store, tokenKey(address));
      legacy.clearGitHubProductToken(address);
    },
    getGitLabToken(address) {
      const token = readSetting(store, tokenKey(address));
      return token?.value ? { token: token.value, expires: token.expires ?? null } : legacy.getGitLabToken(address);
    },
    setGitLabToken(address, token, expires = null) {
      writeSetting(store, tokenKey(address), valueOf(String(token).trim(), expires, "Agent M"));
      legacy.setGitLabToken(address, token, expires);
    },
    setGitLabTokenTest(address, result) {
      legacy.setGitLabTokenTest(address, result);
      const token = readSetting(store, tokenKey(address)), tested = legacy.getGitLabToken(address)?.tested;
      if (token?.value) { const { tested: ignored, ...setting } = token; writeSetting(store, tokenKey(address), { ...setting, ...(tested ? { tested } : {}) }); }
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
    putEntries(values) { legacy.putEntries(values); migrate(); syncLegacy(); },
    entries() { syncLegacy(); return legacy.entries(); },
  };
}

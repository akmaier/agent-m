// Between sprint jobs: the legacy dashboard settings API translated to MOD-browser-store for products and tokens.

import { browserStore } from "./settings-store.mjs";
import { openStore, readSetting, writeSetting } from "../../src/browser-store/index.mjs";

const day = () => new Date().toISOString().slice(0, 10);

function tokenKey(address) {
  const url = new URL(address);
  const path = url.pathname.replace(/^\//, "");
  return url.hostname === "github.com" ? `github-token:${path}` : `gitlab-token:${url.hostname}/${path}`;
}

function valueOf(token, expires, name) {
  return { value: token, name, expires: expires ?? null, stored: day() };
}

// productStore(instance) -> the dashboard's established settings API. Its token and product-list calls share the
// instance-prefixed MOD-browser-store entries with the add-product route; unrelated legacy settings and its export/import
// format remain with settings-store.mjs until their own migration.
export function productStore(instance) {
  const legacy = browserStore();
  const store = openStore(instance);

  const migrate = () => {
    if (readSetting(store, "github-token") === null && legacy.getToken()) {
      writeSetting(store, "github-token", valueOf(legacy.getToken(), legacy.getTokenExpiry(), `Agent M · ${instance}`));
    }
    if (readSetting(store, "products") === null && legacy.getProducts().length) writeSetting(store, "products", legacy.getProducts());
    for (const address of legacy.getProducts()) {
      const old = new URL(address).hostname === "github.com" ? legacy.getGitHubProductToken(address) : legacy.getGitLabToken(address);
      const key = tokenKey(address);
      if (readSetting(store, key) === null && old?.token) writeSetting(store, key, valueOf(old.token, old.expires, "Agent M"));
    }
  };
  const syncLegacy = () => {
    const own = readSetting(store, "github-token");
    if (own?.value) legacy.setToken(own.value, own.expires);
    const products = readSetting(store, "products");
    if (Array.isArray(products)) {
      legacy.clearProducts();
      for (const address of products) {
        legacy.addProduct(address);
        const token = readSetting(store, tokenKey(address));
        if (token?.value) {
          if (new URL(address).hostname === "github.com") legacy.setGitHubProductToken(address, token.value, token.expires);
          else legacy.setGitLabToken(address, token.value, token.expires);
        }
      }
    }
  };
  migrate();
  return {
    ...legacy,
    getToken: () => readSetting(store, "github-token")?.value ?? legacy.getToken(),
    setToken(token, expires = null) {
      writeSetting(store, "github-token", valueOf(String(token).trim(), expires, `Agent M · ${instance}`));
      legacy.setToken(token, expires);
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
    getGitLabToken(address) {
      const token = readSetting(store, tokenKey(address));
      return token?.value ? { token: token.value, expires: token.expires ?? null } : legacy.getGitLabToken(address);
    },
    setGitLabToken(address, token, expires = null) {
      writeSetting(store, tokenKey(address), valueOf(String(token).trim(), expires, "Agent M"));
      legacy.setGitLabToken(address, token, expires);
    },
    tokenFor(product) {
      const address = product?.address;
      const own = address ? readSetting(store, tokenKey(address)) : null;
      return own?.value ?? (address && new URL(address).hostname === "github.com"
        ? readSetting(store, "github-token")?.value ?? legacy.getToken() : null);
    },
    entries() { syncLegacy(); return legacy.entries(); },
  };
}

// routing.mjs — views by the address's fragment, and the address of a route for a repository (docs/architecture/MOD-site-frame.md,
// Parts). The fragment reads `#<route>/<key>=<value>/…`, every part percent-encoded; the parameter `product` names the chosen
// product by its address. Also here: the product that the fragment names, and the one place that loads a view module by its slug.
//
// Module: MOD-site-frame
// It uses MOD-browser-store (readSetting, secretValues) and MOD-repository-hosts (parseAddress, connect) through their index.mjs.
// Private to the module: index.mjs and start.mjs use it.

import { readSetting, secretValues } from "../browser-store/index.mjs";
import { parseAddress, connect } from "../repository-hosts/index.mjs";

const partsOf = (fragment) => String(fragment ?? "").replace(/^#/, "").split("/").filter(Boolean);

// routeOf(fragment) -> { name, params } — the first part is the route's name, the others `key=value` are its parameters.
export function routeOf(fragment) {
  const [name = "", ...given] = partsOf(fragment);
  const params = {};
  for (const part of given) {
    const at = part.indexOf("=");
    if (at > 0) params[decodeURIComponent(part.slice(0, at))] = decodeURIComponent(part.slice(at + 1));
  }
  return { name: decodeURIComponent(name), params };
}

// fragmentOf(route, params) -> the fragment that routeOf reads back as the same route and parameters.
export function fragmentOf(route, params = {}) {
  const supplied = Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  return `#${[route, ...supplied].join("/")}`;
}

// productOf(fragment) -> the address the fragment's `product` names, or null when it names none (the instance itself).
export function productOf(fragment) {
  return routeOf(fragment).params.product ?? null;
}

// addressWriter(page, pageAddress, instance, products) -> (route, params, repository) -> string — the writing of the address of
// a route of the review pages for a repository: the instance's, or a product this browser keeps, which is named in the fragment by
// its address. `pageAddress` is the address of the page that writes ("main" or "review"); the main page's review pages stand at
// docs/index.html beside it. MOD-notifications' watchForAcceptance is handed the function this returns.
export function addressWriter(page, pageAddress, instance, products) {
  const here = String(pageAddress).split("#")[0];
  const review = page === "review" ? here : new URL("docs/index.html", here).href;
  return (route, params, repository) => {
    const product = repository === instance ? null
      : products.map((address) => parseAddress(address)).find((address) => address.path === repository)?.web ?? null;
    return `${review}${fragmentOf(route, product ? { ...params, product } : params)}`;
  };
}

// The key a product's own token is kept under (MOD-browser-store, Data).
const tokenKeyOf = (address) => address.server === "gitlab" ? `gitlab-token:${new URL(address.origin).host}/${address.path}` : `github-token:${address.path}`;

// chosenProduct({ store, fragment }) -> Promise<ProductContext | null> — the product the fragment names among those this browser
// keeps, connected with its own token to its own server only; null when the fragment names none. Throws UnknownProduct { address }
// for a product this browser does not keep.
export async function chosenProduct({ store, fragment }) {
  const named = productOf(fragment);
  if (named === null) return null;
  const kept = (readSetting(store, "products") ?? []).map((address) => { try { return parseAddress(address); } catch { return null; } });
  let wanted = null;
  try { wanted = parseAddress(named).web; } catch { /* not an address: no product is kept under it */ }
  const address = kept.find((candidate) => candidate && candidate.web === wanted);
  if (!address) throw Object.assign(new Error(`This browser does not keep the product ${named}.`), { name: "UnknownProduct", address: named });
  const token = readSetting(store, tokenKeyOf(address));
  const host = connect(address, { token: token?.value ?? null, tokenName: token?.name ?? null, secrets: secretValues(store) });
  return { address: address.web, kind: address.server, host };
}

// viewAddress(slug) -> the address of a view module: `../<slug>/index.mjs`, relative to the folder of the frame.
const viewAddress = (slug) => new URL(`../${slug}/index.mjs`, import.meta.url).href;

// loadView(slug) -> Promise<View> — the `view` a view module provides. Rejects with the loader's error for a module that is not served.
export async function loadView(slug) {
  return (await import(viewAddress(slug))).view;
}

// common.mjs — what the review pages of every kind share (MOD-review-pages, Parts): the elements of a page, the token this browser stores for the
// page's product and the kind of server a product is on.
//
// Module: MOD-review-pages

import { readSetting } from "../browser-store/index.mjs";
import { parseAddress } from "../repository-hosts/index.mjs";
import { readProblem } from "../site-frame/index.mjs";

export const TOKEN_STEP = "#add-product";

export function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}
export const link = (href, className, text) => {
  const a = el("a", className, text);
  a.setAttribute("href", href);
  return a;
};
export const button = (className, text) => {
  const b = el("button", className, text);
  b.type = "button";
  return b;
};

// The token this browser stores for the page's product — its own, never the instance's (A GITHUB PRODUCT USES A TOKEN OF ITS OWN) —,
// or, on the page that shows the instance itself, the instance's.
export function storedToken(context) {
  const keys = [];
  try {
    if (context.product) {
      const address = parseAddress(context.product.address);
      if (address.server === "gitlab") keys.push(`gitlab-token:${new URL(address.origin).host}/${address.path}`);
      else keys.push(`github-token:${address.path}`);
    } else keys.push("github-token");
    for (const key of keys) {
      const token = readSetting(context.store, key);
      if (token) return { name: token.name ?? "a reviewer" };
    }
  } catch { /* a store that cannot be read holds no token */ }
  return null;
}

export const parseServer = (context) => { try { return parseAddress(context.product.address).server; } catch { return null; } };

/** defaultSnapshot(host) — the repository at its default branch now. */
export async function defaultSnapshot(host) {
  const { defaultBranch } = await host.repositoryInfo();
  return host.readSnapshot(defaultBranch);
}

/**
 * readPlace(target, context) — what every route reads before it draws: the host of the page's repository (the product's, else the instance's), the token this
 * browser stores for it, and its default branch now. Returns { host, token, snapshot, context, target } with `target` emptied; a read that fails draws the problem into
 * `target` and returns null.
 */
export async function readPlace(target, context) {
  const host = (context.product ?? context.instance).host;
  const token = storedToken(context);
  target.replaceChildren();
  try {
    return { host, token, snapshot: await defaultSnapshot(host), context, target };
  } catch (failure) {
    target.append(readProblem(failure, Boolean(token)));
    return null;
  }
}


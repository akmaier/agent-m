// common.mjs — what the review pages of every kind share (MOD-review-pages, Parts): the elements of a page, the token this browser stores for the
// page's product, the problem a failed read shows and the kind of server a product is on.
//
// Module: MOD-review-pages

import { readSetting } from "../browser-store/index.mjs";
import { parseAddress } from "../repository-hosts/index.mjs";

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

// What a read that fails says: a private repository without a token that reaches it is named, and nothing is shown.
export function problem(failure, token) {
  const text = failure.name === "NotFound" && !token
    ? "This repository is private or does not exist, and this browser stores no token that reaches it. Store the product's token, then reload."
    : failure.message;
  const paragraph = el("p", "problem", text);
  if (!token) paragraph.append(" ", link(TOKEN_STEP, "token-step", "Store a token"));
  return paragraph;
}

export const parseServer = (context) => { try { return parseAddress(context.product.address).server; } catch { return null; } };

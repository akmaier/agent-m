// waits.mjs — what waits for a person, on the route `home` (docs/architecture/MOD-main-page.md, Parts and Interfaces: `home`): below the cards, what waits across the instance — the open
// use cases, the open SPEC changes, the gates a person decides and the failed jobs of every card —, each item with its kind and its identifier, and its product where there are several
// cards.
//
// Module: MOD-main-page
//
// PROGRESS AND JOB STATE ARE DERIVED, NOT STORED. The items are MOD-progress-measures' waitingForAPerson as it gives them; this file adds nothing to them and drops nothing.

import { el } from "./cards.mjs";

// The route of the page where an item is decided, with its parameters: a route of the review pages (MOD-review-pages' `use-case` and `spec-entry`, MOD-implementation-pages' `process`) or this
// module's `job`. The frame's `go` adds nothing for a product the page does not choose, so the product's address is handed in.
function placeOf({ kind, id, path }) {
  if (kind === "use case") return ["use-case", { id }];
  if (kind === "SPEC change") return ["spec-entry", { id }];
  if (kind === "failed job") return ["job", { id }];
  const job = /^docs\/jobs\/(JOB-[^/]+)\.md$/.exec(path);
  return job ? ["job", { id: job[1] }] : ["process", {}];
}

/**
 * waitsList(items, { several }) -> Element — a <section class="waits"> with an <h2> and, for each of `items` — { kind, id, path, product } —, an <li class="wait"> naming its kind and its
 * identifier, and `product` where `several` says there is more than one card. Each item is also a <button class="wait-link"> that calls `go(route, params)` of the ViewContext for the page
 * where it is decided, with `product` — the item's address — among the params unless the item is Agent M's own (`own`). Without an item it says that nothing waits for a person.
 */
export function waitsList(items, { several, go }) {
  const section = el("section", "waits", el("h2", null, "What waits for a person"));
  if (items.length === 0) {
    section.append(el("p", "muted", "Nothing waits for a person."));
    return section;
  }
  const list = el("ul", "wait-items");
  for (const item of items) {
    const { kind, id, path, product, address, own } = item;
    const [route, params] = placeOf(item);
    const open = el("button", "wait-link btn small", "Open");
    open.setAttribute("type", "button");
    open.addEventListener("click", () => go(route, own ? params : { ...params, product: address }));
    const line = el("li", "wait", el("span", "wait-kind", kind), ": ", el("strong", null, id));
    if (several && product) line.append(" ", el("span", "wait-product", `· ${product}`));
    line.append(" ", open);
    line.setAttribute("data-path", path);
    list.append(line);
  }
  section.append(list);
  return section;
}

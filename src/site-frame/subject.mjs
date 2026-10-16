// subject.mjs — the subject of the route shown, its own or the frame's default, with the route's menu entry
// (docs/architecture/MOD-site-frame.md, Parts and Interfaces: Route). MOD-prompt-bar's `Subject` says what a message in the prompt bar is
// about; a route gives it with `subject(params, context)`, and a route that gives none has the frame's default below. Whichever gives
// the subject, its `entry` is the route's `entry`, `null` for a route out of the menu.
//
// Module: MOD-site-frame
// Private to the module: index.mjs uses it. It reads nothing and writes nothing; the text a default subject gives is read when
// `paramsFor` is called, from what the route has drawn by then. A stored secret is shown only in a hidden field (A STORED SECRET IS
// HIDDEN UNTIL SHOWN), and `textContent` holds no input's value, so no stored secret is in it.

import { labelOf } from "./menu.mjs";
import { fragmentOf } from "./routing.mjs";

/**
 * subjectOf({ route, params, context, drawn }) -> Subject — the subject of the route shown with these `params` and `context`; `drawn()` is
 * the `textContent` of what the route has drawn. The route's own `subject(params, context)` where it gives one, else the default: `key`
 * the route's fragment (its name with its parameters as the fragment writes them, without the leading `#`) with the chosen product's
 * address as the fragment writes it, none for the instance — the same route on another product is another subject —, `title` the route's title, `kind` `converse`,
 * `paramsFor` giving `{ page }` — the route's title, the menu entry's label (none for a route out of the menu), the chosen product's
 * address or the instance's, and what the route has drawn, one per line —, `draftRoute` and `withhold` `null`, `refuses` `[]`.
 */
export function subjectOf({ route, params, context, drawn }) {
  if (typeof route.subject === "function") return { ...route.subject(params, context), entry: route.entry };
  const label = labelOf(route.entry);
  const address = context.product?.address ?? `https://github.com/${context.instance.repository}`;
  return {
    key: fragmentOf(route.name, context.product ? { ...params, product: context.product.address } : params).slice(1),
    title: route.title,
    kind: "converse",
    entry: route.entry,
    paramsFor: () => ({ page: [route.title, ...(label === undefined ? [] : [label]), address, drawn()].join("\n") }),
    draftRoute: null,
    withhold: null,
    refuses: [],
  };
}

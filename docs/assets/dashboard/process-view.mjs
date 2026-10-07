// The view #process — wires MOD-implementation-pages' route `process` (How this product is developed, UC-002; ITM-222)
// into the dashboard.
//
// Module: MOD-dashboard-app
//
// Change between jobs, sprint 06 (SPEC.md WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS): process.mjs's own header named
// "how the dashboard reaches this route" as not part of ITM-222. This file is that call, and nothing else: it connects
// the instance and the product the dashboard shows as MOD-repository-hosts hosts, each with its own token — as
// add-product-view.mjs connects a product (parseAddress, connect) — and hands them to the route's render. When the
// dashboard shows the instance itself, T.product's address already is the instance's own (dashboard-app.mjs
// deriveTarget/start), so both hosts reach the same repository. No logic of the page is here: MOD-implementation-pages'
// route reads and builds everything the page shows; the one line after it only shows the route's own declared title —
// the frame that would do this on its own (MOD-site-frame embedRoute) is not built yet.

import { route } from "../../../src/implementation-pages/process.mjs";
import { parseAddress, connect } from "../../../src/repository-hosts/index.mjs";

export const routes = {
  async process(app) {
    const { T, ghToken, token, main, h } = app;
    const instanceHost = connect(parseAddress(`https://github.com/${T.instance}`), { token: ghToken() });
    const productHost = connect(parseAddress(T.product.address), { token: token() });
    const target = main();
    await route.render(target, { instance: { host: instanceHost }, product: { host: productHost } });
    target.insertAdjacentHTML("afterbegin", `<section class="head"><h2>${h(route.title)}</h2></section>`);
  },
};

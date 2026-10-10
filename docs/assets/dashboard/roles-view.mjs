// The view #roles — wires MOD-implementation-pages' route `roles` (Roles, UC-048) into the dashboard, as process-view.mjs wires
// the route `process`.
//
// Module: MOD-dashboard-app
//
// This file is that call, and nothing else: it connects the instance and the product the dashboard shows as
// MOD-repository-hosts hosts, each with its own token, and hands them to the route's render. No logic of the page is here:
// MOD-implementation-pages' route reads and builds everything the page shows. It reads the route by its `name` in
// `view.routes` (AN INTERFACE HIDES ITS IMPLEMENTATION).

import { view } from "../../../src/implementation-pages/index.mjs";
import { parseAddress, connect } from "../../../src/repository-hosts/index.mjs";

const route = view.routes.find((r) => r.name === "roles");

export const routes = {
  async roles(app) {
    const { T, ghToken, token, main } = app;
    const instanceHost = connect(parseAddress(`https://github.com/${T.instance}`), { token: ghToken() });
    const productHost = connect(parseAddress(T.product.address), { token: token() });
    await route.render(main(), { instance: { host: instanceHost }, product: { host: productHost } });
  },
};

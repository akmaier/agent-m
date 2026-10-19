// The route `process` of MOD-implementation-pages opened the way the live app opens it, for the tests that put the route on a small DOM of their own and not on the whole dashboard: the instance and the product
// connected as MOD-repository-hosts' hosts, each with its own token, and handed to the route's render (src/site-frame/dashboard-app.mjs, the branch for #process and #roles). It is code only; it holds no expected result.
// Imported by tests/system-uc-002-choose-a-process-model.test.mjs, tests/release-sprint-06-uc-002-implementation-pages.test.mjs and tests/release-sprint-16-practice-workflow.test.mjs.
//
// Module: MOD-implementation-pages
// Level: component

import { view } from "../src/implementation-pages/index.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";

const route = view.routes.find((candidate) => candidate.name === "process");

const h = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// routes.process(app) -> the route drawn into app.main(), with the route's title as the head of the page as the app puts it, where app is { T: { instance, product: { address } }, ghToken, token, main }.
export const routes = {
  async process({ T, ghToken, token, main }) {
    await route.render(main(), { instance: { host: connect(parseAddress(`https://github.com/${T.instance}`), { token: ghToken() }) }, product: { host: connect(parseAddress(T.product.address), { token: token() }) } });
    main().insertAdjacentHTML("afterbegin", `<section class="head"><h2>${h(route.title)}</h2></section>`);
  },
};

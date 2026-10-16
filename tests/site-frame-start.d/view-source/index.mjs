// A fixture view of ITM-572's test of start.mjs on the main page, in the form of MOD-main-page's view: one route and
// MOD-source-register's sourceStrategies. Code only; it holds no expected result.
//
// Module: MOD-site-frame
// Level: unit

import { sourceStrategies } from "../../../src/source-register/index.mjs";

export const view = {
  routes: [{ name: "jobs", entry: null, title: "Jobs", async render(target) { target.textContent = "jobs"; } }],
  strategies: [sourceStrategies],
};

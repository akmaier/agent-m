// A fixture view of ITM-572's test of start.mjs: one route in the menu entry tests, and three strategy sets — MOD-approvals'
// approvalStrategies, which view-approvals-a hands too, MOD-source-register's sourceStrategies, and a check of its own. Code only;
// it holds no expected result.
//
// Module: MOD-site-frame
// Level: unit

import { approvalStrategies } from "../../../src/approvals/index.mjs";
import { sourceStrategies } from "../../../src/source-register/index.mjs";

export const view = {
  routes: [{ name: "beta", entry: "tests", title: "Beta", async render(target) { target.textContent = "beta"; } }],
  strategies: [approvalStrategies, sourceStrategies, { checks: { itm572OwnB: () => [] } }],
};

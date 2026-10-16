// A fixture view of ITM-572's test of start.mjs: one route in the menu entry requirements, and two strategy sets — MOD-approvals'
// approvalStrategies, which several views of the review pages hand, and a check of its own. Code only; it holds no expected result.
//
// Module: MOD-site-frame
// Level: unit

import { approvalStrategies } from "../../../src/approvals/index.mjs";

export const view = {
  routes: [{ name: "alpha", entry: "requirements", title: "Alpha", async render(target) { target.textContent = "alpha"; } }],
  strategies: [approvalStrategies, { checks: { itm572OwnA: () => [] } }],
};

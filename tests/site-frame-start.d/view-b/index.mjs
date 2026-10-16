// A fixture view of ITM-531's test of start.mjs: one route in the menu entry tests and one strategy set. Code only; it holds no
// expected result.
//
// Module: MOD-site-frame
// Level: unit

export const view = {
  routes: [{ name: "beta", entry: "tests", title: "Beta", async render(target) { target.textContent = "beta"; } }],
  strategies: [{ checks: { itm531CheckB: () => [] } }],
};

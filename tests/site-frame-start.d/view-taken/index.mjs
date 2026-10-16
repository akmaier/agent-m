// A fixture view of ITM-572's test of start.mjs: one route and one check, itm572Taken, which the test registers under another owner
// before the page loads this view. Code only; it holds no expected result.
//
// Module: MOD-site-frame
// Level: unit

export const view = {
  routes: [{ name: "gamma", entry: "tests", title: "Gamma", async render(target) { target.textContent = "gamma"; } }],
  strategies: [{ checks: { itm572Taken: () => [] } }],
};

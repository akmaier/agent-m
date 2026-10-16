// A fixture view of ITM-531's test of start.mjs: two routes, one in the menu entry requirements and one in use-cases, and one
// strategy set. Code only; it holds no expected result.
//
// Module: MOD-site-frame
// Level: unit

export const view = {
  routes: [
    { name: "alpha", entry: "requirements", title: "Alpha", async render(target, context, params) {
      target.textContent = `alpha page=${context.page} params=${JSON.stringify(params)}`;
    } },
    { name: "list-of-cases", entry: "use-cases", title: "Cases", async render(target) { target.textContent = "cases"; } },
  ],
  strategies: [{ checks: { itm531CheckA: () => [] } }],
};

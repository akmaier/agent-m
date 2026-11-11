// maintenance-pages/tabs.mjs — the strip of the entry's two tabs, which every route draws at its head (docs/architecture/MOD-maintenance-pages.md, Parts): **Mail**, leading to `mail`, and **Issues**,
// leading to `issues`, the tab the route stands under marked as the current one; two links in the look's styles (look.css: `.btn`, `.btn.primary`), with no style of its own. UC-046 step 2.
//
// Module: MOD-maintenance-pages
//
// Readings the texts leave open, which this file takes (the pull request names them): the strip is <nav class="maintenance-tabs">, the current tab is `btn primary` with aria-current="page" so that its
// state is not given by colour alone (THE SITE SERVES A SCREEN READER); a link's href is its route's fragment, with the chosen product where the page has one, and a click goes there through the
// context's `go`, which keeps the chosen product (MOD-site-frame's ViewContext). Opening a tab writes nothing, so it answers any click.

// The tabs in their order, each with the routes it holds (MOD-maintenance-pages, Interfaces).
const TABS = [
  { route: "mail", label: "Mail", holds: ["mail", "replies"] },
  { route: "issues", label: "Issues", holds: ["issues", "issue"] },
];

/** tabsOf(route: string, context: ViewContext) -> Element — the strip for a page of `route` (mail, replies, issues or issue), its tab marked current. */
export function tabsOf(route, context) {
  const nav = document.createElement("nav");
  nav.className = "maintenance-tabs";
  nav.setAttribute("aria-label", "Maintenance");
  const product = context?.product?.address;
  for (const tab of TABS) {
    const link = document.createElement("a");
    const current = tab.holds.includes(route);
    link.className = current ? "btn primary" : "btn";
    link.setAttribute("href", `#${tab.route}${product ? `/product=${encodeURIComponent(product)}` : ""}`);
    if (current) link.setAttribute("aria-current", "page");
    link.append(tab.label);
    link.addEventListener("click", (event) => { event?.preventDefault?.(); context.go(tab.route, {}); });
    nav.append(link);
  }
  return nav;
}

// The menu of the instance's site — THE MENU FOLLOWS THE PROCESS: the stages of the requirements-driven process in their
// order, followed by the maintenance and the settings. The main page and the review pages carry the same menu (UC-046,
// step 2). Each entry opens the review page where that stage's work is reviewed and done: the first of its views whose file
// is built (src/site/views.mjs); an entry none of whose views is built yet is named, without a link.

import { h } from "./html.mjs";

export const MENU = [
  { key: "requirements", label: "Requirements", views: ["specification", "spec"] },
  { key: "use-cases", label: "Use cases", views: ["uc"] },
  { key: "architecture", label: "Architecture", views: ["arc"] },
  { key: "implementation", label: "Implementation", views: ["progress", "backlog"] },
  { key: "tests", label: "Tests", views: ["tests"] },
  { key: "releases", label: "Releases", views: ["release"] },
  { key: "maintenance", label: "Maintenance", views: ["issues", "mail"], title: "Issues and mail" },
  { key: "settings", label: "Settings", views: ["settings"], icon: "⚙", title: "Every setting Agent M uses" },
];


// The view a stage opens, or null while none of its views is built. built: Set of view names (views.mjs builtViews).
export const stageView = (entry, built) => entry.views.find((v) => built.has(v)) ?? null;

// The stage a view belongs to, or null — for marking the entry of the page shown.
export const stageOf = (view) => MENU.find((e) => e.views.includes(view))?.key ?? null;

// The menu as HTML. href(view): the address of a view — on the review pages "#<view>", on the main page "docs/#<view>".
// tabs: the review pages' entries are tabs of one page (role "tab"); the main page's are links to other pages.
export function menuHtml({ built, href = (v) => `#${v}`, tabs = false }) {
  return MENU.map((e) => {
    const view = stageView(e, built);
    const label = `${e.icon ? `<span aria-hidden="true">${h(e.icon)}</span> ` : ""}${h(e.label)}`;
    const title = e.title ? ` title="${h(e.title)}"` : "";
    if (!view) {
      return `<span class="soon" data-stage="${h(e.key)}" aria-disabled="true" title="${h(e.label)} — not built yet">${label}</span>`;
    }
    return `<a href="${h(href(view))}"${tabs ? ` role="tab" id="tab-${h(view)}"` : ""} data-stage="${h(e.key)}"${title}>${label}</a>`;
  }).join("\n");
}

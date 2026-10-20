// greeting.mjs — the greeting of the route `home` (docs/architecture/MOD-main-page.md, Parts and Interfaces: `home`): Agent M's name, one sentence on what Agent M is —
// requirements-driven software engineering with people and agents —, what to do first: review the requirements and the use cases, then add a product, with *Review the use cases*
// leading to the address the frame's menuOf gives for the entry *Use cases*, *Get your own Agent M*, which leads to MOD-settings-pages' `get-your-own` (UC-014 step 1), and the folded explanation of the page. The logo of the Pattern Recognition Lab is the header's.
//
// Module: MOD-main-page
// Private to the module: home.mjs draws it. It reads and stores nothing.

import { explain } from "../site-frame/index.mjs";
import { el } from "./cards.mjs";

/**
 * greeting({ useCasesHref, getYourOwnHref }) -> Element — the greeting; `useCasesHref` is the `href` menuOf gives for the entry *Use cases*, `getYourOwnHref` the address of the route `get-your-own`.
 */
export function greeting({ useCasesHref, getYourOwnHref }) {
  const review = el("a", "btn primary", "Review the use cases");
  review.setAttribute("href", useCasesHref);
  review.setAttribute("id", "first-link");
  const own = el("a", "btn", "Get your own Agent M");
  own.setAttribute("href", getYourOwnHref);
  return el("section", "greeting",
    el("h1", null, "Welcome to Agent M"),
    el("p", "lead", "Agent M is requirements-driven software engineering with people and agents: it runs the cycle of the book Vibe Coding on your own repositories — requirements, use cases, architecture, implementation, tests and release — with agents doing the work and people deciding at every gate."),
    el("p", "first", "Start with the requirements and the use cases: each is reviewed and accepted on its own page. Then add the repository of a product you build."),
    el("p", "actions", review, own),
    explain("main-page"));
}

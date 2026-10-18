// The routes of the site that tests/site-usability.test.mjs and tests/site-accessibility.test.mjs draw, and how a route is drawn: the
// address to open, the text it must show, the script that records the last change of a document, and the wait until the page is drawn.
// It is test code; it holds no expected result beyond the text a route shows.
//
// Module: MOD-site-frame
// Level: system

import { until } from "./browser.mjs";

// Each route: its address, and a text it must show — the known positive that the page was drawn with content before anything is said
// about its widths. `#` addresses are the review pages' fragments; `/` is the main page.
const SECTION = encodeURIComponent("## 1. Reading");
const NAME = encodeURIComponent("A MISSING FILE IS NAMED, NEVER GUESSED AT");
export const ROUTES = [
  { address: "/", shows: "What waits for a person" },
  { address: "#uc", shows: "UC-001" },
  { address: "#uc/UC-001", shows: "UC-001 Read a file at a pinned commit" },
  { address: "#review/uc", shows: "Review all — Use cases" },
  { address: "#use-case/id=draft", shows: "Draft use cases" },
  { address: "#use-case/id=UC-002/edit=1", shows: "Edit UC-002" },
  { address: "#arc", shows: "Architecture decisions" },
  { address: "#arc/ARC-001", shows: "ARC-001 The pages are a static client" },
  { address: "#arc/MOD-reader", shows: "MOD-reader Reads files at a pinned commit" },
  { address: "#review/arc", shows: "Review all — the whole architecture" },
  { address: "#decision/id=draft", shows: "Draft the architecture" },
  { address: "#decision/id=ARC-001/edit=1", shows: "Edit ARC-001" },
  { address: "#module", shows: "Module files" },
  { address: "#module/id=MOD-reader/edit=1", shows: "Edit MOD-reader" },
  { address: "#spec", shows: "SPEC changes" },
  { address: "#spec/2026-10-18_sample/01", shows: "2026-10-18_sample · entry 01" },
  { address: "#spec-entry/id=all", shows: "Review all — SPEC changes" },
  { address: "#spec-entry/id=spec-2026-10-18_sample-01/edit=1", shows: "Edit entry 01 of 2026-10-18_sample" },
  { address: `#requirement/name=${NAME}`, shows: "Edit A MISSING FILE IS NAMED, NEVER GUESSED AT What is this? Other open proposals on this section" },
  { address: `#requirements/section=${SECTION}`, shows: "New requirement What is this? Other open proposals on this section" },
  { address: "#draft/subject=none", shows: "The draft of the conversation" },
  { address: "#how", shows: "How acceptance works" },
  { address: "#settings", shows: "Settings" },
  { address: "#add", shows: "Add a product" },
  { address: "#endpoints", shows: "Configure a model endpoint" },
  { address: "#setup", shows: "Finish setting up your instance" },
  { address: "#bridge", shows: "Connect a Bridge" },
  { address: "#backlog", shows: "Backlog" },
  { address: "#process", shows: "How this product is developed" },
  { address: "#release", shows: "New release" },
  { address: "#roles", shows: "Who fills the roles" },
];

// In every document the browser opens, before its scripts: the time of the last change anywhere in the document.
export const OBSERVE = `window.__lastChange = performance.now(); new MutationObserver(() => { window.__lastChange = performance.now(); }).observe(document, { subtree: true, childList: true, attributes: true, characterData: true });`;
// The page is drawn when nothing changed for 400 ms, no request to GitHub is open, no placeholder is left and every diagram is drawn.
export const DRAWN = `(() => { const main = document.querySelector("main"); if (!main) return false;
  return window.__pending === 0 && performance.now() - window.__lastChange > 400 && !/(^|\\n)\\s*(Loading|Reading)…\\s*($|\\n)/.test(main.innerText)
    && [...document.querySelectorAll(".mermaid")].every((diagram) => diagram.querySelector("svg") !== null); })()`;
// show(page, site, address, { answerWithin = 3000, limit = 30000 }) — opens the address and waits until it is drawn. An evaluation in the page is given
// `answerWithin` ms to answer and is sent again when it does not, until `limit` ms of the wait are over: an evaluation sent while the document is replaced
// is sometimes never answered, and a single evaluation that is given the whole wait cannot be sent again.
export async function show(page, site, address, { answerWithin = 3000, limit = 30000 } = {}) {
  const ask = (name, expression) => until(name, async () => ({ value: await page.evaluate(expression, answerWithin) }), limit).then((answer) => answer.value);
  const here = await ask(`${address} asks where the page is`, "location.pathname + location.hash");
  if (address.startsWith("#") && here.startsWith("/docs/")) {
    await ask(`${address} is set`, `window.__lastChange = performance.now(); location.hash = ${JSON.stringify(address)}`);
  } else {
    const target = address === "/" ? `${site.address}/` : `${site.address}/docs/${address}`;
    await page.call("Page.navigate", { url: target });
    await until(`${address} is loaded`, () => page.evaluate(`location.href === ${JSON.stringify(target)} && document.readyState === "complete"`, answerWithin), limit);
  }
  try {
    await until(`${address} is drawn`, () => page.evaluate(DRAWN, answerWithin), Math.min(limit, 20000));
  } catch (failure) {
    const state = await page.evaluate(`({ href: location.href, ready: document.readyState, pending: window.__pending, quiet: performance.now() - window.__lastChange,
      text: (document.querySelector("main")?.innerText ?? "no main").replace(/\\s+/g, " ").slice(0, 300) })`, answerWithin).catch((error) => String(error));
    throw new Error(`${failure.message}; the page: ${JSON.stringify(state)}`);
  }
}


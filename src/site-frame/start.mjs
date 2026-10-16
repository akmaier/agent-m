// start.mjs — the script both entry pages load (docs/architecture/MOD-site-frame.md, Parts). It reads the page's setup from the
// attributes of its own script tag — `data-page` ("main" or "review") and `data-views`, a list of slugs separated by
// spaces —, loads the view modules the slugs name from `../<slug>/index.mjs`, registers the strategies of each view
// with MOD-job-runner under its slug and then MOD-prompt-bar's handOverStrategies under the owner MOD-prompt-bar, each set once,
// and calls startPage. This is where the entry pages register strategies (ARC-038).
//
// Module: MOD-site-frame
// It uses MOD-job-runner (registerStrategies) and MOD-prompt-bar (handOverStrategies) through their index.mjs. A set is registered
// once per load, however many views or the bar hand it: a set object already registered on this load is skipped. A tab runs this file
// once; a second evaluation in one process finds its sets registered, and a DuplicateStrategy whose first owner is the owner now
// registering counts as a set already registered and is skipped. Throws, so that the page shows no frame, when no script tag of the
// page loads this file, when a view module is not served, and for any other DuplicateStrategy.

import { registerStrategies } from "../job-runner/index.mjs";
import { handOverStrategies } from "../prompt-bar/index.mjs";
import { startPage } from "./index.mjs";
import { loadView } from "./routing.mjs";

const withoutQuery = (address) => String(address).split(/[?#]/)[0];

// The script tag that loads this file: the one whose `src`, read against the page's address, is this module's address.
function ownScriptTag() {
  const here = withoutQuery(import.meta.url);
  const tag = [...document.getElementsByTagName("script")].find((candidate) => {
    const src = candidate.getAttribute("src");
    return src !== null && withoutQuery(new URL(src, document.baseURI).href) === here;
  });
  if (!tag) throw new Error("start.mjs: no script tag of this page loads it.");
  return tag;
}

const tag = ownScriptTag();
const slugsOf = (attribute) => (tag.getAttribute(attribute) ?? "").split(/\s+/).filter(Boolean);

// The sets registered on this load: one set object is registered once, however many hand it.
const handled = new Set();
function registerOnce(owner, strategies) {
  if (handled.has(strategies)) return;
  try {
    registerStrategies(owner, strategies);
  } catch (error) {
    if (error.name !== "DuplicateStrategy" || error.owners[0] !== owner) throw error;
  }
  handled.add(strategies);
}

const views = [];
for (const slug of slugsOf("data-views")) {
  const view = await loadView(slug);
  for (const strategies of view.strategies ?? []) registerOnce(slug, strategies);
  views.push(view);
}
for (const strategies of handOverStrategies) registerOnce("MOD-prompt-bar", strategies);

await startPage({ page: tag.getAttribute("data-page"), views });

// start.mjs — the script both entry pages load (docs/architecture/MOD-site-frame.md, Parts). It reads the page's setup from the
// attributes of its own script tag — `data-page` ("main" or "review") and `data-views`, a list of slugs separated by
// spaces —, loads the view modules the slugs name from `../<slug>/index.mjs`, registers the strategies of each view
// with MOD-job-runner under its slug, and calls startPage. This is where the entry pages register strategies (ARC-038).
//
// Module: MOD-site-frame
// It uses MOD-job-runner (registerStrategies) through its index.mjs. Throws, so that the page shows no frame, when no script tag of
// the page loads this file, when a view module is not served, and when a strategy is registered twice (DuplicateStrategy).

import { registerStrategies } from "../job-runner/index.mjs";
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

const views = [];
for (const slug of slugsOf("data-views")) {
  const view = await loadView(slug);
  for (const strategies of view.strategies ?? []) registerStrategies(slug, strategies);
  views.push(view);
}

await startPage({ page: tag.getAttribute("data-page"), views });

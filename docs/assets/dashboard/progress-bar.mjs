// The progress bar on the main page — how far the product's backlog has come, in the measure its model names (UC-035 step 2,
// its first slice; ITM-162; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE). Every item of the backlog by its state — done, in
// progress, blocked, not started —, counted at every load from the order and the pull requests; nothing is stored, nothing
// written, and no item file is read (PROGRESS AND JOB STATE ARE DERIVED, NOT STORED). It explains itself in a folded "What is
// this?" (EVERY STEP EXPLAINS ITSELF).
//
// Module: MOD-dashboard-app
//
// Not a view: no route and no line of dashboard/built.json. The shell imports it by name (as dashboard/settings-view.mjs for the
// token line) and fills the slot #progress-bar of docs/index.html — outside <main>, above the view — after the view is rendered
// on the main page: the address without a fragment and #uc. On every other route the slot is empty, and so it is for a product
// without a declaration or whose model file is not in the tree; an empty slot costs no request.
//
// What a cold load reads, beyond the view, through the texts this browser keeps by blob SHA (app.fileText): the declaration
// docs/process.md, the model file it names, the order docs/backlog/order.md and the sprint records — none of them again while
// their blob is unchanged —, and one list of the pull requests opened since the earliest sprint's start, without a base
// (MOD-git-host pullRequests: one request per hundred), of which those into a sprint record's branch or into the default branch
// count. The items are the identifiers backlogOrder gives from the order and the item paths of the tree, which the page holds.
//
// The kernel decides — parseModel (MOD-process-model), backlogOrder, sprint and itemState (MOD-work-items), parseFrontMatter
// (MOD-artifacts) —; this file writes the sentences a person reads (ARC-003 decision 5). When MOD-work-items' `progress` exists
// (ITM-035), the numbers are read from it and nothing else here changes; when Progress exists (ITM-084), the bar links there.

import { parseFrontMatter } from "../artifacts.mjs";
import { parseModel } from "../process-model.mjs";
import { backlogOrder } from "../work-items.mjs";
import { sprint as parseSprint, itemState } from "../work-items/flow.mjs";
import { pullRequests } from "../git-host/pull-requests.mjs";

const DECLARATION = "docs/process.md";
const ORDER = "docs/backlog/order.md";
const ITEM_FILE = /^docs\/backlog\/(ITM-\d{3})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const SPRINT_FILE = /^docs\/backlog\/sprints\/(?!README\.md$)[^/]+\.md$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// The states of the bar, in the order its segments stand, each with the attribute that carries its count.
const SEGMENTS = [
  { state: "done", key: "done", label: "done" },
  { state: "in progress", key: "in-progress", label: "in progress" },
  { state: "blocked", key: "blocked", label: "blocked" },
  { state: "not started", key: "not-started", label: "not started" },
];

// The main page: the address without a fragment, and #uc — not a use case's own page (#uc/UC-…).
export const onMainPage = (kind, a) => (kind ?? "") === "" || (kind === "uc" && !a);

const today = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- counting

// The state of one item from the pull requests alone, as the Backlog tab counts its slots: done, in progress, blocked — or, when
// none of these, not started: itemState calls such an item ready, for it is given no name it realises — whether it is ready or
// waiting for acceptance only the item file tells.
const UNDER_WAY = new Set(["done", "in progress", "blocked"]);
const stateOf = (id, prs) => {
  const state = itemState({ id, realises: [] }, { pullRequests: prs, jobs: [] }).state;
  return UNDER_WAY.has(state) ? state : "not started";
};

// What the bar shows, read and counted once per commit: null for an empty slot.
// -> { measure, modelName } for a planned model; { measure, modelName, total, counts } for items per state over time;
//    { measure, modelName, sprint, selected, remaining, counts } for remaining items per time box (sprint null: none running).
export function progressData(app) {
  return app.once("progress-bar", async () => {
    const has = (p) => app.state.byPath.has(p);
    if (!has(DECLARATION)) return null;
    const declaration = parseFrontMatter(await app.fileText(DECLARATION)).fields;
    const modelFile = typeof declaration.model_file === "string" ? declaration.model_file : null;
    if (!modelFile || !has(modelFile)) return null;
    const model = parseModel(await app.fileText(modelFile));
    const measure = model.measure, modelName = model.name ?? (typeof declaration.model === "string" ? declaration.model : null);
    if (measure === "plan entries per phase") return { measure, modelName };
    if (measure !== "items per state over time" && measure !== "remaining items per time box") return null;

    const ids = app.paths(ITEM_FILE).map((e) => ITEM_FILE.exec(e.path)[1]);
    const [orderText, sprints] = await Promise.all([
      has(ORDER) ? app.fileText(ORDER) : Promise.resolve(""),
      Promise.all(app.paths(SPRINT_FILE).map(async (e) => parseSprint(await app.fileText(e.path)))),
    ]);
    const order = backlogOrder(orderText, ids.map((id) => ({ id }))).order;
    const valid = sprints.filter((s) => s.frontMatter && s.id);
    // The pull requests into the branches of the sprint records and into the default branch, opened since the earliest start.
    const bases = new Set([app.T.ref, ...valid.map((s) => s.branch).filter(Boolean)]);
    const since = valid.map((s) => s.start).filter((d) => DATE.test(String(d ?? ""))).sort()[0] ?? null;
    const prs = (await pullRequests({ product: app.T.product, token: app.token() }).list({ since })).filter((p) => bases.has(p.base));
    const tally = (list) => {
      const counts = Object.fromEntries(SEGMENTS.map((s) => [s.state, 0]));
      for (const id of list) counts[stateOf(id, prs)] += 1;
      return counts;
    };
    if (measure === "items per state over time") return { measure, modelName, total: order.length, counts: tally(order) };

    // Remaining items per time box: the running sprint — begun, and not ended: with a time box its end has not passed, without one
    // no end is recorded —, the latest begun if several.
    const day = today(), timeBox = Boolean(model.flow?.timeBox);
    const running = valid.filter((s) => DATE.test(String(s.start ?? "")) && s.start <= day && (!s.end || (timeBox && day <= s.end)))
      .sort((a, b) => String(b.start).localeCompare(String(a.start)) || String(b.id).localeCompare(String(a.id)))[0] ?? null;
    if (!running) return { measure, modelName, sprint: null };
    const counts = tally(running.selection);
    return { measure, modelName, sprint: running.id, selected: running.selection.length,
      remaining: running.selection.length - counts.done, counts };
  });
}

// ---------------------------------------------------------------- the sentences

const percent = (part, whole) => (whole > 0 ? Math.round((100 * part) / whole) : 0);
const explain = (html) => `<details class="explain"><summary>What is this?</summary><div>${html}</div></details>`;

const STATES_TEXT = "A state is derived from the pull requests alone, as the Backlog tab counts the slots taken — a pull request " +
  "belongs to an item when its branch or its title names the item, and only those into a sprint's branch or into the default " +
  "branch count: <i>done</i> — one is merged; <i>in progress</i> — one is open; <i>blocked</i> — a job failed or waits for a " +
  "person (no job writes a record yet, so no item is blocked today); <i>not started</i> — none of these. <i>Not started</i> hides " +
  "two states only the item's own file tells: <i>ready</i>, and <i>waiting for acceptance</i> — it realises a requirement or a use " +
  "case that is not accepted yet. The <a href=\"#backlog\">Backlog</a> tab shows which.";
const DERIVED_TEXT = "The numbers are computed now, at this load, from the order, the sprint records and the pull requests, and " +
  "never kept: nothing here is stored or written, and a reload computes them again.";

function barHtml(app, counts, whole) {
  const { h } = app;
  const segs = SEGMENTS.map((s) => `<span class="seg seg-${s.key}" data-segment="${s.key}" style="width:${h((100 * counts[s.state]) / (whole || 1))}%" ` +
    `title="${h(s.label)}: ${h(counts[s.state])}"></span>`).join("");
  const legend = SEGMENTS.map((s) => `<li><span class="dot seg-${s.key}" aria-hidden="true"></span> ${h(s.label)} <b>${h(counts[s.state])}</b></li>`).join("");
  return `<div class="bar" data-bar role="img" aria-label="${h(SEGMENTS.map((s) => `${s.label} ${counts[s.state]}`).join(", "))}">${segs}</div>
    <ul class="legend small">${legend}</ul>`;
}

// The bar's HTML for what progressData gave; "" for an empty slot.
export function progressBarHtml(app, data) {
  const { h, T } = app;
  if (!data) return "";
  const name = h(T.product?.repo ?? T.repo ?? "this product");
  const measure = `measure: <i>${h(data.measure)}</i>${data.modelName ? ` (model <code>${h(data.modelName)}</code>)` : ""}`;
  const backlog = `<a href="#backlog">Backlog</a>`;
  if (data.measure === "plan entries per phase") {
    return `<section class="panel progress-bar" data-progress-bar data-measure="${h(data.measure)}">
      <p>${name} plans its work in advance; its progress is counted in ${measure}. The plan, and the progress against it, are shown
        on Progress once it exists.</p>
      ${explain("<p>A model that plans its work in advance — the V-model, the waterfall — measures progress as plan entries per " +
        "phase: every accepted requirement in every phase of the model, each open, in progress or done (UC-035; book ch. 6 §2, ch. 15 " +
        "§3). The plan is derived from the SPEC and is not built yet, so no bar is drawn here; nothing is stored or written.</p>")}
    </section>`;
  }
  if (data.measure === "items per state over time") {
    const c = data.counts, pct = percent(c.done, data.total);
    const attrs = `data-total="${h(data.total)}" ${SEGMENTS.map((s) => `data-${s.key}="${h(c[s.state])}"`).join(" ")} data-percent-done="${h(pct)}"`;
    return `<section class="panel progress-bar" data-progress-bar data-measure="${h(data.measure)}" ${attrs}>
      <p><b>${name}: ${h(c.done)} of ${h(data.total)} backlog items done — ${h(pct)}%</b> · ${measure} · ${backlog}</p>
      ${barHtml(app, c, data.total)}
      ${explain(`<p>The bar counts every item of this product's backlog — each file <code>docs/backlog/ITM-….md</code>, in the order ` +
        `of <code>${ORDER}</code> or not placed in it yet — by its state. ${STATES_TEXT}</p><p>The model this product declares names ` +
        "its measure: items per state over time. The bar is its newest point; the chart over time — a cumulative flow, whose " +
        `widening band means work piling up — will stand on Progress (UC-035; book ch. 7 §4, ch. 15 §2). ${DERIVED_TEXT}</p>`)}
    </section>`;
  }
  // remaining items per time box
  const why = `<p>The model this product declares works in time boxes and names its measure: remaining items per time box — of ` +
    "the items the running sprint selected at its planning, those not done yet; the burn-down over the days of the sprint will " +
    `stand on Progress (UC-035; book ch. 7 §5, ch. 15 §2). ${STATES_TEXT}</p><p>${DERIVED_TEXT}</p>`;
  if (!data.sprint) {
    return `<section class="panel progress-bar" data-progress-bar data-measure="${h(data.measure)}">
      <p>${name}: no sprint is running · ${measure} · ${backlog}</p>
      ${explain(why)}
    </section>`;
  }
  const c = data.counts;
  const attrs = `data-selected="${h(data.selected)}" data-remaining="${h(data.remaining)}" ${SEGMENTS.map((s) => `data-${s.key}="${h(c[s.state])}"`).join(" ")}`;
  return `<section class="panel progress-bar" data-progress-bar data-measure="${h(data.measure)}" ${attrs}>
    <p><b>${name}, sprint ${h(data.sprint)}: ${h(data.remaining)} of ${h(data.selected)} selected items remain</b> · ${measure} · ${backlog}</p>
    ${barHtml(app, c, data.selected)}
    ${explain(why)}
  </section>`;
}

// ---------------------------------------------------------------- the slot

// The shell's one call after a view is rendered: the bar on the main page, an empty slot everywhere else. A reading that fails
// says so in the slot and leaves the view as it is.
export async function fillProgressBar(app, { kind, a } = {}) {
  const slot = document.getElementById("progress-bar");
  if (!slot) return;
  if (!onMainPage(kind, a) || !app.state.commit) { slot.innerHTML = ""; return; }
  const seq = app.seq();
  let html;
  try {
    html = progressBarHtml(app, await progressData(app));
  } catch (e) {
    html = `<p class="warn small" data-progress-bar-error>The progress bar could not be computed: ${app.h(app.errorText(app.noteRefusal(e)))}</p>`;
  }
  if (seq === app.seq()) slot.innerHTML = html;
}

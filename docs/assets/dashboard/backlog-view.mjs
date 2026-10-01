// Backlog — the running sprint's board under the model's work-in-progress limit, the backlog in its order with each item's
// derived state, and the accepted requirements and use cases that no item realises yet (UC-032 step 1, and the board of
// step 7, read; ITM-147). Read from the product's repository and derived when shown; nothing is stored and nothing written
// (PROGRESS AND JOB STATE ARE DERIVED, NOT STORED). Every part explains itself (EVERY STEP EXPLAINS ITSELF).
//
// Module: MOD-dashboard-app
//
// Route #backlog. It gets `app`, the page's context (dashboard-app.mjs). What a load reads, through the git host and the texts
// this browser keeps by blob SHA (app.fileText): the declaration docs/process.md and the model file it names, the sprint
// records, the order, the SPEC (which names the accepted requirements), the items the sprint selects, and one list of the pull
// requests into the sprint's branch opened since its start (MOD-git-host pullRequests). Which use cases are accepted is read
// from the names of the approval records in the tree (app.statusOf). The rest of the backlog — and with it the names no item
// realises yet — is read only when the reader unfolds it, together with the pull requests into the branches of the earlier
// sprints and into the default branch. No job writes a record yet, so `jobs` is empty.
//
// The kernel decides — parseModel (MOD-process-model), parseItem, backlogOrder, sprint and itemState (MOD-work-items),
// parseRequirements and parseFrontMatter (MOD-artifacts) —; this view writes the sentences a person reads (ARC-003 decision 5).

import { parseFrontMatter, reviewedId } from "../artifacts.mjs";
import { parseRequirements } from "../artifacts/requirements.mjs";
import { parseModel } from "../process-model.mjs";
import { parseItem, backlogOrder } from "../work-items.mjs";
import { sprint as parseSprint, itemState } from "../work-items/flow.mjs";
import { pullRequests } from "../git-host/pull-requests.mjs";
import { isGitLab, webFileUrl } from "../git-host.mjs";

const DECLARATION = "docs/process.md";
const ORDER = "docs/backlog/order.md";
const ITEM_FILE = /^docs\/backlog\/(ITM-\d{3})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const SPRINT_FILE = /^docs\/backlog\/sprints\/(?!README\.md$)[^/]+\.md$/;
const USE_CASE_FILE = /^docs\/use-cases\/UC-\d{3}-[^/]+\.md$/;
const NAMES_ITEM = /(?<![A-Za-z0-9])(ITM-\d{3})(?![0-9])/g;

// The states of UC-032 step 1, in the order the board shows them, each with what it means.
const STATES = ["ready", "in progress", "done", "blocked", "waiting for acceptance"];
const BADGE = { ready: "b-open", "in progress": "b-changed", done: "b-accepted", blocked: "b-stale", "waiting for acceptance": "b-superseded" };
const STATE_EXPLAIN = {
  ready: "Every requirement and use case the item realises is accepted, and nothing is under way for it: no pull request is " +
    "open and none is merged. Whether it may start now also depends on the sprint's selection and on the limit; the card says " +
    "what holds it back.",
  "in progress": "A pull request that names the item — in its branch or its title — is open: the work is being done or waits " +
    "for review. An item waiting for review counts as in progress.",
  done: "A pull request that names the item is merged — on the board, into the sprint's branch.",
  blocked: "A job for the item failed, ended without record, or waits at a gate for a person. No job writes a record yet, " +
    "so no item is blocked by a job today.",
  "waiting for acceptance": "The item realises a requirement or a use case that is not accepted yet; nothing is implemented " +
    "before it is accepted. A requirement is accepted when it stands in the SPEC, a use case when an approval record names " +
    "its current text.",
};

// ---------------------------------------------------------------- reading

const when = (t) => (t ? `${String(t).slice(0, 10)} ${String(t).slice(11, 16)} UTC` : "");
const today = () => new Date().toISOString().slice(0, 10);
const validDate = (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);

// The pull requests into `base` opened since `since` (all of them without a date), as MOD-git-host gives them; only those into
// that base count, whatever the server answers.
function pullsInto(app, base, since) {
  return app.once(`backlog:pulls:${base}:${since ?? ""}`, async () => {
    const list = await pullRequests({ product: app.T.product, token: app.token() }).list({ base, since: validDate(since) ? since : null });
    return list.filter((p) => p.base === base);
  });
}

// The declaration, the model, the sprint records, the order and what is accepted — what the board needs besides its items.
function context(app) {
  return app.once("backlog:context", async () => {
    const has = (p) => app.state.byPath.has(p);
    const declaration = has(DECLARATION) ? parseFrontMatter(await app.fileText(DECLARATION)).fields : null;
    const modelFile = declaration && typeof declaration.model_file === "string" ? declaration.model_file : null;
    const model = modelFile && has(modelFile) ? parseModel(await app.fileText(modelFile)) : null;
    const items = new Map(app.paths(ITEM_FILE).map((e) => [ITEM_FILE.exec(e.path)[1], e.path]));
    const sprintPaths = app.paths(SPRINT_FILE).map((e) => e.path);
    const [sprints, orderText, specText, useCases] = await Promise.all([
      Promise.all(sprintPaths.map(async (path) => ({ path, ...parseSprint(await app.fileText(path)) }))),
      has(ORDER) ? app.fileText(ORDER) : Promise.resolve(""),
      app.fileText("SPEC.md"),
      Promise.all(app.paths(USE_CASE_FILE).map(async (e) => ({ id: reviewedId(e.path), status: (await app.statusOf(e.path, e.sha)).status }))),
    ]);
    const order = backlogOrder(orderText, [...items.keys()].map((id) => ({ id }))).order;
    const requirements = [...parseRequirements(specText).values()].filter((r) => !r.withdrawn).map((r) => r.name);
    const accepted = useCases.filter((u) => u.status === "accepted").map((u) => u.id);
    const valid = sprints.filter((s) => s.frontMatter && s.id);
    const byStart = (a, b) => String(b.start ?? "").localeCompare(String(a.start ?? "")) || String(b.id).localeCompare(String(a.id));
    const running = valid.filter((s) => !s.end).sort(byStart)[0] ?? null;
    const last = running ?? [...valid].sort((a, b) => String(b.end ?? "").localeCompare(String(a.end ?? "")) || byStart(a, b))[0] ?? null;
    return { declaration, modelFile, model, items, order, requirements, useCases: accepted, sprints: valid, sprint: last,
      running: Boolean(running) };
  });
}

const readItem = (app, id, path) => app.once(`backlog:item:${id}`, async () => parseItem(path, await app.fileText(path)));

// The whole backlog, with the pull requests of every sprint's branch and of the default branch — read when it is unfolded.
function wholeBacklog(app, ctx) {
  return app.once("backlog:whole", async () => {
    const [items, ...lists] = await Promise.all([
      Promise.all(ctx.order.map((id) => readItem(app, id, ctx.items.get(id)))),
      ...ctx.sprints.filter((s) => s.branch).map((s) => pullsInto(app, s.branch, s.start)),
      pullsInto(app, app.T.ref, ctx.sprints.map((s) => s.start).filter(validDate).sort()[0] ?? null),
    ]);
    const seen = new Set();
    const prs = lists.flat().filter((p) => !seen.has(`${p.base}#${p.number}`) && seen.add(`${p.base}#${p.number}`));
    return { items, prs };
  });
}

// ---------------------------------------------------------------- the sentences

function reasonText(app, r) {
  const { h } = app;
  switch (r.kind) {
    case "pull-request": {
      const p = r.pullRequest, link = prLink(app, p);
      if (p.state === "merged") return `${link} merged${p.mergedAt ? ` ${h(when(p.mergedAt))}` : ""} into <code>${h(p.base)}</code>`;
      return `${link} open${p.participantLine ? ` — opened by ${h(p.participantLine)}` : ""}`;
    }
    case "job": return `job ${h(r.job.id)}: ${h(r.job.state)}`;
    case "not-accepted": return `<b>${h(r.name)}</b> is not accepted yet`;
    case "not-in-backlog": return "not in the backlog's order";
    case "no-sprint": return "no sprint is running";
    case "sprint-ended": return `sprint ${h(r.sprint)} has ended (${h(r.end)})`;
    case "sprint-not-started": return `sprint ${h(r.sprint)} starts on ${h(r.start)}`;
    case "not-selected": return `not selected for sprint ${h(r.sprint)}`;
    case "wip-limit": return `cannot start: the work-in-progress limit of ${h(r.limit)} is reached (${r.inProgress.map((i) => h(i.id)).join(", ")})`;
    case "no-item": return "no backlog item";
    default: return h(r.kind);
  }
}

function prLink(app, p) {
  const { h, T } = app;
  const href = `${T.product.address}/${isGitLab(T.product) ? "-/merge_requests" : "pull"}/${p.number}`;
  return `<a href="${h(href)}" target="_blank" rel="noopener" title="${h(p.title)}">${isGitLab(T.product) ? "!" : "#"}${h(p.number)}</a>`;
}

const badge = (app, state) => (state ? `<span class="badge ${BADGE[state] ?? ""}">${app.h(state)}</span>` : "");
const explain = (html) => `<details class="explain"><summary>What is this?</summary><div>${html}</div></details>`;
const fileLink = (app, path, text) => `<a href="${app.h(webFileUrl(app.T.product, app.T.ref, path))}" target="_blank" rel="noopener">${text}</a>`;

// ---------------------------------------------------------------- the parts

function uncoveredBody(app, ctx, whole) {
  const { h } = app;
  if (!whole) {
    return `<p class="muted">Which accepted requirements and use cases no item realises yet is known once every item has been read.</p>
      <p><button class="btn small" data-unfold="backlog">Show them, with the whole backlog (${h(ctx.order.length)} items)</button></p>`;
  }
  const realised = new Set(whole.items.flatMap((i) => i.realises));
  const reqs = ctx.requirements.filter((n) => !realised.has(n)).sort();
  const ucs = ctx.useCases.filter((n) => !realised.has(n)).sort();
  if (!reqs.length && !ucs.length) return `<p>Every accepted requirement and use case is realised by an item.</p>`;
  const list = (names) => `<ul class="small">${names.map((n) => `<li><code>${h(n)}</code></li>`).join("")}</ul>`;
  return `${ucs.length ? `<p>${h(ucs.length)} accepted use case${ucs.length === 1 ? "" : "s"}:</p>${list(ucs)}` : ""}
    ${reqs.length ? `<p>${h(reqs.length)} accepted requirement${reqs.length === 1 ? "" : "s"}:</p>${list(reqs)}` : ""}`;
}

function cardHtml(app, id, item, st, states) {
  const { h } = app;
  const reasons = (st?.reasons ?? []).map((r) => reasonText(app, r)).join("<br>");
  const waits = (item?.dependsOn ?? []).filter((d) => states.has(d) ? states.get(d) !== "done" : true);
  return `<li class="card" data-item="${h(id)}"><b>${item ? fileLink(app, item.path, h(id)) : h(id)}</b> ${h(item?.title ?? "")}
    ${item ? "" : `<p class="warn small">No item file docs/backlog/${h(id)}-….md is in the repository.</p>`}
    ${reasons ? `<div class="small">${reasons}</div>` : ""}
    ${waits.length ? `<p class="muted small">Waits for ${waits.map(h).join(", ")} (not done).</p>` : ""}</li>`;
}

function boardHtml(app, ctx, selected, states) {
  const { h } = app;
  const cols = STATES.map((state) => {
    const mine = selected.filter((x) => x.st?.state === state);
    return `<div class="column" data-column="${h(state)}"><h4>${badge(app, state)} <span class="muted">${h(mine.length)}</span></h4>
      <div data-explain-state="${h(state)}">${explain(h(STATE_EXPLAIN[state]))}</div>
      <ul class="cards">${mine.map((x) => cardHtml(app, x.id, x.item, x.st, states)).join("")}</ul></div>`;
  }).join("");
  const without = selected.filter((x) => !x.st?.state);
  return `<div class="board" data-board style="display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:.75rem">${cols}</div>
    ${without.length ? `<ul class="cards">${without.map((x) => cardHtml(app, x.id, x.item, x.st, states)).join("")}</ul>` : ""}
    <span data-board-end hidden></span>`;
}

function backlogTable(app, ctx, whole, states) {
  const { h } = app;
  const rows = whole.items.map((item, i) => {
    const id = ctx.order[i], st = states.get(id);
    return `<tr data-backlog-item="${h(id)}"><td>${h(i + 1)}</td><td>${fileLink(app, item.path, h(id))}</td><td>${h(item.title ?? "")}</td>
      <td>${h(item.kind ?? "")}</td><td>${h(item.level ?? "")}</td><td class="small">${item.realises.map((n) => `<code>${h(n)}</code>`).join(" ")}</td>
      <td class="small">${item.origins.map((o) => h(o)).join("<br>")}</td><td>${badge(app, st.state)}${st.reasons.length
        ? `<ul class="small">${st.reasons.map((r) => `<li>${reasonText(app, r)}</li>`).join("")}</ul>` : ""}</td></tr>`;
  }).join("");
  return `<table class="backlog"><thead><tr><th>#</th><th>Item</th><th>Title</th><th>Kind</th><th>Level</th><th>Realises</th>
    <th>Where it came from</th><th>State</th></tr></thead><tbody>${rows}</tbody></table>`;
}

// ---------------------------------------------------------------- the view

const unfolded = new WeakSet(); // the pages (their context) on which the reader unfolded the backlog — in memory only

async function viewBacklog(app) {
  const { h, main, stepHtml, T } = app;
  const seq = app.seq();
  const ctx = await context(app);
  const model = ctx.model;
  const flow = model?.flow ?? {};
  const s = ctx.sprint;
  const base = s?.branch || T.ref;
  const sprintPrs = s ? await pullsInto(app, base, s.start) : flow.sprints === true ? [] : await pullsInto(app, T.ref, null);
  const selection = s && flow.sprints !== false ? s.selection : [];
  const selectedItems = await Promise.all(selection.map((id) => (ctx.items.has(id) ? readItem(app, id, ctx.items.get(id)) : null)));
  const isOpen = unfolded.has(app);
  const whole = isOpen ? await wholeBacklog(app, ctx) : null;
  if (seq !== app.seq()) return;

  const wip = { ...flow, kind: model?.kind ?? null, sprint: s, backlog: ctx.order, today: today() };
  const known = { requirements: ctx.requirements, useCases: ctx.useCases, jobs: [] };
  const selected = selection.map((id, i) => ({ id, item: selectedItems[i],
    st: selectedItems[i] ? itemState(selectedItems[i], { ...known, pullRequests: sprintPrs, wip }) : null }));
  const boardStates = new Map(selected.map((x) => [x.id, x.st?.state ?? null]));
  // The slots taken: the items of the backlog that a pull request into the sprint's branch names and that are in progress or
  // blocked (itemState from the pull requests alone — a slot is held whatever the item realises).
  const named = [...new Set(sprintPrs.flatMap((p) => [...`${p.head ?? ""} ${p.title ?? ""}`.matchAll(NAMES_ITEM)].map((m) => m[1])))]
    .filter((id) => ctx.items.has(id));
  const taken = named.filter((id) => ["in progress", "blocked"].includes(itemState({ id, realises: [] }, { pullRequests: sprintPrs, jobs: [] }).state));
  const limit = Number.isInteger(flow.wipLimit) ? flow.wipLimit : null;

  const wholeStates = new Map();
  if (whole) {
    for (const [i, item] of whole.items.entries()) {
      wholeStates.set(ctx.order[i], itemState(item, { ...known, pullRequests: whole.prs, wip }));
    }
  }

  const noModel = !ctx.declaration ? `<p class="warn">This product declares no process model yet: <code>docs/process.md</code> names it
      (UC-002). The states below are derived without a work-in-progress limit or a sprint.</p>`
    : !model ? `<p class="warn">The declaration names the model file <code>${h(ctx.modelFile ?? "—")}</code>, which is not in the
      repository at this commit.</p>` : "";
  const planned = model?.kind === "planned" ? `<p class="warn">This product's model plans its work in advance: there is no backlog
      (UC-032 1b) — its progress is shown on <a href="#progress">Progress</a>.</p>` : "";

  const sprintPart = !s
    ? (flow.sprints === true ? `<p class="muted">No sprint is planned yet: a sprint record under <code>docs/backlog/sprints/</code> holds its
        selection (UC-032 step 6).</p>` : `<p class="muted">The model works without sprints: items are pulled from the top of the backlog
        while the limit allows.</p>`)
    : `${ctx.running ? "" : `<p class="warn" data-no-running-sprint>No sprint is running: this is the board of the last sprint,
        <b>${h(s.id)}</b>, which ended on ${h(s.end)}. The next one is planned from the top of the backlog (UC-032 step 6).</p>`}
      <dl class="meta">
        <dt>Sprint</dt><dd>${fileLink(app, s.path, `<b>${h(s.id)}</b>`)}${s.start ? `, started ${h(s.start)}` : ""}${s.end ? `, ended ${h(s.end)}` : ""}</dd>
        <dt>Goal</dt><dd>${h(s.goal ?? "—")}</dd>
        <dt>Branch</dt><dd><code>${h(s.branch ?? T.ref)}</code>${s.branch ? "" : " (none set: the default branch)"}</dd>
        <dt>Closed by</dt><dd>${h(s.closer ?? "—")}</dd>
        <dt>Planned by</dt><dd>${h(s.plannedBy ?? "—")}</dd>
        <dt>Selected</dt><dd>${h(selection.length)} items, in the order they are pulled</dd>
      </dl>
      ${s.problems.length ? `<ul class="warn small">${s.problems.map((f) => `<li>${h(f.what)} — ${h(f.fix)}</li>`).join("")}</ul>` : ""}
      ${boardHtml(app, ctx, selected, boardStates)}`;

  const limitPart = limit
    ? `<p data-wip-limit="${h(limit)}" data-wip-taken="${h(taken.length)}"><b>${h(taken.length)} of ${h(limit)}</b> slots taken${taken.length
        ? `: ${taken.map(h).join(", ")}` : ""}.${taken.length >= limit ? " No further item starts until one of them is merged." : ""}</p>`
    : `<p class="muted" data-wip-limit="" data-wip-taken="${h(taken.length)}">The model sets no work-in-progress limit${model ? "" : " (no model is declared)"}.
        ${h(taken.length)} item${taken.length === 1 ? "" : "s"} in progress.</p>`;

  const backlogPart = whole
    ? backlogTable(app, ctx, whole, wholeStates)
    : `<p class="muted">${h(ctx.order.length)} items in the order of <code>${h(ORDER)}</code>. Their files are read only when you unfold them.</p>
      <p><button class="btn small" data-unfold="backlog">Show the whole backlog (${h(ctx.order.length)} items)</button></p>`;

  main().innerHTML = `
    <section class="head"><h2>Backlog</h2>
      <p class="muted">${isGitLab(T.product) ? h(T.product.address) : h(T.repo)} · <code>${h(T.ref)}</code> · read now from the
        repository and its pull requests; nothing here is stored or written.</p>${noModel}${planned}</section>
    <div data-part="uncovered">${stepHtml({ title: "Accepted, and realised by no item yet",
      body: `<div data-uncovered>${uncoveredBody(app, ctx, whole)}</div><span data-uncovered-end hidden></span>`,
      explain: "<p>Requirements stand in the SPEC once they are accepted; a use case is accepted when an approval record names its " +
        "current text. Each of them should be realised by at least one backlog item, or nobody will build it. The names listed here " +
        "are the ones no item names under <i>realises</i> yet; the Product Owner adds items for them (UC-032 steps 2–4).</p>" }) }</div>
    <div data-part="sprint">${stepHtml({ title: s ? `The sprint: ${s.id}` : "The sprint", body: sprintPart,
      explain: "<p>A sprint is a stretch of work on a selection the Product Owner made from the top of the ordered backlog at " +
        "sprint planning; only selected items are worked on, and an item added meanwhile goes to the backlog, not into the " +
        "sprint (book ch. 7 §5; UC-032 steps 6 and 6a). The board shows each selected item in its state, in the order of the " +
        "selection. A state is never stored: it is derived now from the pull requests into the sprint's branch and from the " +
        "approval records — a pull request belongs to an item when its branch or its title names the item. Jobs would count too, " +
        "but no job runs yet: no job writes a record before the run engine runs one, so the board knows no job.</p>" }) }</div>
    <div data-part="limit">${stepHtml({ title: "Work in progress", body: limitPart,
      explain: "<p>The work-in-progress limit of the model caps how many items are under way at once: a new item is started " +
        "only while fewer are in progress than the limit allows (book ch. 7 §4; UC-032 step 7). An item counts from the moment " +
        "its team starts it until its pull request is merged into the sprint's branch — one waiting for review included. With " +
        "agents, starting more work is cheap; the limit protects the capacity to review it.</p>" }) }</div>
    <div data-part="backlog">${stepHtml({ title: "The backlog", body: backlogPart,
      explain: "<p>The backlog is the ordered list of everything the product is meant to do next, one Markdown file per item " +
        "under <code>docs/backlog/</code> and their order in <code>docs/backlog/order.md</code> (UC-032). Its order matters: " +
        "sprint planning takes from the top. Each item names what it realises and where it came from; its state is derived " +
        "like the board's, from the pull requests into the branches of the sprints and into the default branch.</p>" }) }</div>`;

  main().querySelectorAll('[data-unfold="backlog"]').forEach((b) => b.addEventListener("click", () => {
    unfolded.add(app);
    viewBacklog(app).catch((e) => { main().innerHTML = `<p class="warn">${h(app.errorText(app.noteRefusal(e)))}</p>`; });
  }));
}

export const routes = { backlog: (app) => viewBacklog(app) };

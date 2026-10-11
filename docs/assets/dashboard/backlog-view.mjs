// Backlog — the state of the current process first: each team's running sprint, what it holds, the state of each held item
// and its burn-down, or that the team runs none; then the backlog, each item after the items it builds on, with its state and,
// in a product with several teams, what keeps it from a team's selection; then the accepted requirements and use cases no
// item realises yet (UC-032 steps 1, 5 and 6; UC-035). Plan sprint, for one team, lists what the team may select, and beside
// it every item the other teams' sprints hold, with its sprint and the modules it changes and uses; Start
// sprint commits the team's sprint through MOD-work-plans' startSprint, as the person's own commit — the one write of this
// view, on the person's click. Everything else is read from the product's repository and its pull requests and derived when
// shown; nothing is stored (PROGRESS AND JOB STATE ARE DERIVED, NOT STORED). Every part explains itself (EVERY STEP EXPLAINS
// ITSELF). The layout is the one of #uc and #arc: a head, panels, list tables, buttons and badges — no style of its own.
//
// Module: MOD-dashboard-app
//
// Route #backlog. It gets `app`, the page's context (dashboard-app.mjs). What a load reads, through the git host and the texts
// this browser keeps by blob SHA (app.fileText): the declaration docs/process.md and the model file it names; the role
// assignments under docs/role-assignments/, which name the teams; every team's sprints under docs/backlog/sprints/<team>/;
// every item under docs/backlog/; the SPEC, which names the accepted requirements; the use cases' approval state; in a
// product with several teams, the architecture's module files; and the product's pull requests, of which those into the
// default branch or into a sprint's branch count. No job writes a record yet, so `jobs` is empty.
//
// MOD-work-plans decides what the sprints hold (heldItems), what keeps an item from a team (conflicts) and how a sprint starts
// (startSprint); MOD-progress-measures derives each team's sprint, its items and whether it runs (progressIn), and the chart
// of a running sprint counts its items left at its start, after each merge and now; MOD-documents reads the items, modules,
// sprints, declaration and role assignments by their schemas; MOD-work-items' kernel derives an item's state from its pull
// requests and what it realises (itemState) and lists the items after the items they build on (buildOrder). This view writes
// the sentences a person reads (ARC-003 decision 5).

import { reviewedId } from "../artifacts.mjs";
import { parseRequirements } from "../artifacts/requirements.mjs";
import { parseModel } from "../process-model.mjs";
import { buildOrder } from "../work-items.mjs";
import { itemState } from "../work-items/flow.mjs";
import { pullRequests } from "../git-host/pull-requests.mjs";
import { isGitLab, webFileUrl } from "../git-host.mjs";
import { artifactSchemas, readDocument } from "../../../src/documents/index.mjs";
import { conflicts, heldItems, planSchemas, startSprint } from "../../../src/work-plans/index.mjs";
import { progressIn } from "../../../src/progress-measures/index.mjs";
import { declarationSchema, roleAssignmentSchema } from "../../../src/product-process/index.mjs";
import { connect, parseAddress } from "../../../src/repository-hosts/index.mjs";

const DECLARATION = "docs/process.md";
const ITEM_FILE = /^docs\/backlog\/(ITM-\d{3})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const SPRINT_FILE = /^docs\/backlog\/sprints\/([^/]+)\/(\d+)\.md$/;
const ASSIGNMENT_FILE = /^docs\/role-assignments\/([^/]+)\.md$/;
const MODULE_FILE = /^docs\/architecture\/MOD-[^/]+\.md$/;
const USE_CASE_FILE = /^docs\/use-cases\/UC-\d{3}-[^/]+\.md$/;

// The badge of each state of UC-032 step 1, by the colours the review pages give their states.
const BADGE = { ready: "b-open", "in progress": "b-changed", done: "b-accepted", blocked: "b-stale",
  "waiting for acceptance": "b-superseded", "waiting for an item it builds on": "b-superseded", unknown: "b-stale" };

const text = (value) => (typeof value === "string" ? value : value === null || value === undefined ? "" : String(value));
const list = (value) => (Array.isArray(value) ? value.map(text) : text(value).split(",").map((part) => part.trim()).filter(Boolean));
const listed = (names) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`);
const today = () => new Date().toISOString().slice(0, 10);
const validDate = (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
const explain = (html) => `<details class="explain"><summary>What is this?</summary><div>${html}</div></details>`;
const idOf = (doc) => text(doc?.id ?? doc?.fields?.id) || ITEM_FILE.exec(text(doc?.path))?.[1] || "";

// ---------------------------------------------------------------- reading

// The model as MOD-progress-measures and MOD-work-plans read it, from the definition MOD-process-model parsed.
const modelOf = (parsed) => ({ name: parsed.name, kind: parsed.kind, measure: parsed.measure,
  flow: { wip: parsed.flow?.wipLimit ?? null, timeBox: parsed.flow?.timeBox ?? null, sprints: parsed.flow?.sprints === true } });

// A pull request in MOD-repository-hosts' form, from MOD-git-host's.
const asPullRequest = (p) => ({ number: p.number, title: text(p.title), branch: text(p.head), base: text(p.base), head: text(p.mergeCommit),
  state: p.state, draft: false, url: "", opened: p.openedAt ?? null, merged: p.mergedAt ?? null, closed: p.mergedAt ?? null });

// What the page needs besides the pull requests: the declaration and its model, the teams, their sprints, the items, the
// modules, and what is accepted.
function context(app) {
  return app.once("backlog:context", async () => {
    const has = (path) => app.state.byPath.has(path);
    const paths = (re) => app.paths(re).map((e) => e.path).sort();
    const declarationText = has(DECLARATION) ? await app.fileText(DECLARATION) : null;
    const declaration = declarationText !== null ? readDocument(declarationSchema, DECLARATION, declarationText) : null;
    const modelFile = text(declaration?.fields?.model_file) || null;
    const parsed = modelFile && has(modelFile) ? parseModel(await app.fileText(modelFile)) : null;
    const [assignments, sprints, items, specText, useCases] = await Promise.all([
      Promise.all(paths(ASSIGNMENT_FILE).map(async (p) => readDocument(roleAssignmentSchema, p, await app.fileText(p)))),
      Promise.all(paths(SPRINT_FILE).map(async (p) => readDocument(planSchemas.sprint, p, await app.fileText(p)))),
      Promise.all(paths(ITEM_FILE).map(async (p) => readDocument(artifactSchemas().item, p, await app.fileText(p)))),
      has("SPEC.md") ? app.fileText("SPEC.md") : Promise.resolve(""),
      Promise.all(app.paths(USE_CASE_FILE).map(async (e) => ({ id: reviewedId(e.path), status: (await app.statusOf(e.path, e.sha)).status }))),
    ]);
    const teams = [...new Set([...assignments.map((a) => ASSIGNMENT_FILE.exec(a.path)?.[1]),
      ...sprints.map((s) => SPRINT_FILE.exec(s.path)?.[1])].filter(Boolean))];
    const modules = teams.length > 1
      ? await Promise.all(paths(MODULE_FILE).map(async (p) => readDocument(artifactSchemas().module, p, await app.fileText(p)))) : [];
    const newest = new Map();
    for (const record of sprints) {
      const [, team, nn] = SPRINT_FILE.exec(record.path);
      if (!newest.has(team) || Number(nn) > Number(newest.get(team).nn)) newest.set(team, { record, nn, name: `${team}/${nn}` });
    }
    return { declaration, modelFile, parsed, model: parsed ? modelOf(parsed) : null, assignments, sprints, items, modules, teams,
      newest, requirements: [...parseRequirements(specText ?? "").values()].filter((r) => !r.withdrawn).map((r) => r.name),
      useCases: useCases.filter((u) => u.status === "accepted").map((u) => u.id) };
  });
}

// The pull requests the page derives from, as MOD-git-host gives them, read in one listing of all of them: an item's hold can
// outlast its sprint, and an item can be done before any sprint ran. Only those into the default branch or into the branch of
// a sprint count, whatever else the server answers.
function pullRequestsOf(app, ctx) {
  const bases = new Set([app.T.ref, ...ctx.sprints.map((s) => text(s.fields.branch)).filter(Boolean)]);
  return app.once("backlog:pulls", async () => {
    const found = await pullRequests({ product: app.T.product, token: app.token() }).list({});
    return found.filter((p) => bases.has(p.base));
  });
}

// Each item's state from its pull requests and what it realises (itemState), by its identifier.
function itemStatesOf(ctx, prs) {
  const known = { requirements: ctx.requirements, useCases: ctx.useCases, jobs: [], pullRequests: prs, wip: {} };
  return new Map(ctx.items.map((doc) => [idOf(doc), itemState({ id: idOf(doc), realises: list(doc.fields.realises) }, known)]));
}

// When each done item became done: the merge time of the pull request that makes it done, as itemState gives it, in UTC.
function mergedAtOf(base) {
  const at = new Map();
  for (const [id, own] of base) {
    const merged = own.state === "done" ? own.reasons.find((r) => r.kind === "pull-request")?.pullRequest?.mergedAt : null;
    if (merged && Number.isFinite(Date.parse(merged))) at.set(id, new Date(merged).toISOString());
  }
  return at;
}

// Each item's state in MOD-work-plans' ItemState form: from its pull requests and what it realises (itemState), and, for an
// item otherwise ready, waiting for an item it builds on that is not done.
function statesOf(ctx, base) {
  return ctx.items.map((doc) => {
    const id = idOf(doc), own = base.get(id);
    const open = own.reasons.find((r) => r.kind === "pull-request" && r.pullRequest?.state === "open")?.pullRequest ?? null;
    const pullRequest = open ? `#${open.number}` : null;
    if (own.state === "waiting for acceptance") {
      return { item: id, state: own.state, reason: listed(own.reasons.filter((r) => r.kind === "not-accepted").map((r) => r.name)), job: null, pullRequest };
    }
    const waits = list(doc.fields.builds_on).filter((b) => base.has(b) && base.get(b).state !== "done");
    if (own.state === "ready" && waits.length) return { item: id, state: "waiting for an item it builds on", reason: listed(waits), job: null, pullRequest };
    return { item: id, state: own.state ?? "unknown", reason: null, job: null, pullRequest };
  });
}

// What the page derives: the pull requests, each item's state and when a done item was merged, what the sprints hold, each
// team's sprint.
async function derived(app, ctx) {
  const prs = await pullRequestsOf(app, ctx);
  const pull = prs.map(asPullRequest);
  const base = itemStatesOf(ctx, prs);
  const states = statesOf(ctx, base);
  const mergedAt = mergedAtOf(base);
  const held = heldItems(ctx.sprints, ctx.items, ctx.modules, pull);
  let progress = null;
  if (ctx.model) {
    try {
      progress = progressIn({ model: ctx.model, modelSince: null, assignments: ctx.assignments, sprints: ctx.sprints,
        plan: { order: null, items: ctx.items, states }, pullRequests: pull }, new Date());
    } catch { progress = null; }
  }
  return { prs, states, mergedAt, held, progress };
}

// ---------------------------------------------------------------- the parts

const badge = (app, state) => `<span class="badge ${BADGE[state] ?? "b-stale"}">${app.h(state)}</span>`;
const fileLink = (app, path, label) => `<a href="${app.h(webFileUrl(app.T.product, app.T.ref, path))}" target="_blank" rel="noopener">${label}</a>`;
const docOf = (ctx, id) => ctx.items.find((doc) => idOf(doc) === id) ?? null;
const stateOf = (d, id) => d.states.find((s) => s.item === id) ?? { item: id, state: "unknown", reason: null };
const stateCell = (app, st) => `${badge(app, st.state)}${st.reason ? ` <span class="muted small">${app.h(st.state === "waiting for acceptance"
  ? `not accepted: ${st.reason}` : st.state === "waiting for an item it builds on" ? `waits for ${st.reason}` : st.reason)}</span>` : ""}`;

// The role of the phase that plans — that produces ITM — and its first holder in the team's role assignment: who closes the
// team's sprint unless the Product Owner names another.
function ownerOf(ctx, team) {
  const role = ctx.parsed?.phases?.find((phase) => (phase.kinds ?? []).includes("ITM"))?.roles?.[0];
  const assignment = ctx.assignments.find((a) => ASSIGNMENT_FILE.exec(a.path)?.[1] === team);
  const row = (assignment?.sections ?? []).flatMap((s) => s.rows ?? []).find((r) => text(r.cells.Role) === role);
  return list(row?.cells.Participants)[0] ?? "";
}

// The items a sprint has left over time: at its start, after each merge of one of its items, in time order, and now — or, for
// a closed sprint, at its end, the last day of its burn-down, after which no merge counts. An item merged before the sprint's
// start is done from the start. A merge is labelled with its time, HH:MM in UTC, or MM-DD HH:MM once a merge falls on another
// day than the start.
function remainingOverTime(items, mergedAt, start, end = "") {
  const merges = items.map((id) => mergedAt.get(id)).filter(Boolean).sort();
  const before = merges.filter((at) => at.slice(0, 10) < start).length;
  const during = merges.filter((at) => at.slice(0, 10) >= start && !(end && at.slice(0, 10) > end));
  const oneDay = during.every((at) => at.slice(0, 10) === start);
  const label = (at) => (oneDay ? at.slice(11, 16) : `${at.slice(5, 10)} ${at.slice(11, 16)}`);
  let remaining = items.length - before;
  const points = [{ label: "start", remaining }];
  for (const at of during) points.push({ label: label(at), remaining: --remaining });
  points.push({ label: end ? "end" : "now", remaining });
  return points;
}

// The Mermaid chart of a sprint's items left over time.
function burnDownChart(name, points) {
  const most = Math.max(1, ...points.map((p) => p.remaining));
  return ["xychart-beta", `  title "${name} — items remaining, times in UTC"`, `  x-axis [${points.map((p) => `"${p.label}"`).join(", ")}]`,
    `  y-axis "Items remaining" 0 --> ${most}`, `  line [${points.map((p) => p.remaining).join(", ")}]`].join("\n");
}

// How many of a team's sprint's items are in progress, against the model's work-in-progress limit, counted per team (UC-032
// step 7: in a model with sprints and a limit, both hold).
function wipLine(app, ctx, d, entry) {
  const wip = ctx.model?.flow.wip;
  if (!wip) return "";
  const busy = entry.items.filter((st) => stateOf(d, st.item).state === "in progress").map((st) => st.item);
  return `<p>${app.h(busy.length)} of ${app.h(wip)} items in progress${busy.length ? `: ${busy.map(app.h).join(", ")}` : ""}.${busy.length >= wip
    ? " No further item starts until one of them is merged." : ""}</p>`;
}

function teamPanel(app, ctx, d, team) {
  const { h, md } = app;
  const newest = ctx.newest.get(team) ?? null;
  const entry = d.progress?.sprints.find((s) => s.team === team) ?? null;
  const plan = (label, primary) => `<button class="btn${primary ? " primary" : ""}" data-plan="${h(team)}">${h(label)}</button>`;
  const why = explain("<p>A team plans, starts and closes sprints of its own (UC-032 step 6). While its sprint runs, the sprint holds the " +
    "items it selected until their change is in the default branch or they go back to the backlog; no other team selects an item " +
    "that changes or uses the same modules. The chart counts the selected items not done yet: at the sprint's start, after each " +
    "merge of one of its items, at the time of that merge in UTC, and now — or, once the sprint is closed, at its end — derived " +
    "now from the sprint's record and the pull requests the page reads anyway, never stored (book ch. 7 §5).</p>");
  const chartOf = (points) => `<div class="md" data-burn-down="${h(team)}">${md(`\`\`\`mermaid\n${burnDownChart(newest.name, points)}\n\`\`\`\n`)}</div>`;
  if (!newest || !entry || entry.final) {
    const last = newest ? `<p class="muted">Its last sprint, ${fileLink(app, newest.record.path, `<b>${h(newest.name)}</b>`)}, `
      + `${text(newest.record.fields.end) ? `ended on ${h(newest.record.fields.end)}` : "is closed"}.</p>` : `<p class="muted">It has run no sprint yet.</p>`;
    const final = newest && entry?.final && entry.burnDown.length ? chartOf(remainingOverTime(entry.items.map((st) => st.item),
      d.mergedAt, text(newest.record.fields.start), entry.burnDown.at(-1).day)) : "";
    return `<section class="panel" data-team="${h(team)}"><h3>${h(team)} — no running sprint</h3>${last}${final}
      <p>${plan("Plan sprint", true)}</p>${why}</section>`;
  }
  const record = newest.record, f = record.fields;
  const heldOf = new Map(d.held.filter((x) => x.team === team).map((x) => [x.item, x]));
  const rows = entry.items.map((st) => {
    const doc = docOf(ctx, st.item), held = heldOf.get(st.item);
    const changes = held?.changes ?? list(doc?.fields?.modules);
    return `<tr data-item="${h(st.item)}"><td>${doc ? fileLink(app, doc.path, h(st.item)) : h(st.item)}</td><td>${h(doc?.fields?.title ?? "")}</td>
      <td>${stateCell(app, stateOf(d, st.item))}</td><td class="small">${changes.map(h).join(", ") || "—"}</td>
      <td class="small">${(held?.uses ?? []).map(h).join(", ") || "—"}</td></tr>`;
  }).join("");
  const chart = entry.burnDown.length ? chartOf(remainingOverTime(entry.items.map((st) => st.item), d.mergedAt, text(f.start)))
    : `<p class="muted">No burn-down yet: the sprint starts on ${h(f.start)}.</p>`;
  return `<section class="panel" data-team="${h(team)}"><h3>${h(team)} — sprint ${fileLink(app, record.path, h(newest.name))}</h3>
    <dl class="meta"><dt>Goal</dt><dd>${h(f.goal)}</dd><dt>Started</dt><dd>${h(f.start)}</dd>
      <dt>Ends</dt><dd>${f.end ? h(f.end) : "when its items are done or the Product Owner ends it — no time box"}</dd>
      <dt>Branch</dt><dd>${f.branch ? `<code>${h(f.branch)}</code>` : `none: <code>${h(app.T.ref)}</code>`}</dd><dt>Closed by</dt><dd>${h(f.closer)}</dd></dl>
    ${wipLine(app, ctx, d, entry)}
    <table class="list"><thead><tr><th>Item</th><th>Title</th><th>State</th><th>Changes</th><th>Uses</th></tr></thead><tbody>${rows}</tbody></table>
    ${chart}
    <p>${plan("Change the selection", false)}</p>${why}</section>`;
}

// What keeps an item from a team other than the one whose sprint holds it, one line per team.
function marks(app, ctx, d, doc) {
  const { h } = app;
  const id = idOf(doc);
  const holding = d.held.find((x) => x.item === id);
  const lines = holding ? [`held by ${h(holding.sprint)}`] : [];
  if (ctx.teams.length > 1) {
    for (const team of ctx.teams) {
      if (holding?.team === team) continue;
      const kept = conflicts(doc, team, d.held, ctx.modules);
      if (kept.length) {
        lines.push(`kept from ${h(team)}: ${kept.map((k) => `${h(k.sprint)} holds ${h(k.item)}${k.module ? ` — ${h(k.module)}` : ""}`).join("; ")}`);
      }
    }
  }
  return lines.join("<br>") || "—";
}

function backlogPanel(app, ctx, d) {
  const { h } = app;
  const byId = new Map(ctx.items.map((doc) => [idOf(doc), doc]));
  const order = buildOrder(ctx.items.map((doc) => ({ id: idOf(doc), dependsOn: list(doc.fields.builds_on) })));
  const rows = order.map((id, i) => {
    const doc = byId.get(id);
    return `<tr data-item="${h(id)}"><td>${h(i + 1)}</td><td>${fileLink(app, doc.path, h(id))}</td><td>${h(doc.fields.title ?? "")}</td>
      <td class="small">${list(doc.fields.realises).map((n) => `<code>${h(n)}</code>`).join(" ")}</td>
      <td>${stateCell(app, stateOf(d, id))}</td><td class="small">${marks(app, ctx, d, doc)}</td></tr>`;
  }).join("");
  return `<section class="panel" data-part="backlog"><h3>The backlog</h3>
    <p class="muted">${h(order.length)} items, each after the items it builds on.</p>
    <table class="list"><thead><tr><th>#</th><th>Item</th><th>Title</th><th>Realises</th><th>State</th><th>Held or kept</th></tr></thead>
      <tbody>${rows}</tbody></table>
    ${explain("<p>The backlog is everything the product is meant to do, one Markdown file per item under <code>docs/backlog/</code> " +
      "(UC-032). It keeps no order of its own: each item is listed after the items it builds on, and what is worth doing next is " +
      "decided at sprint planning. A state is never stored: it is derived now from the pull requests that name the item — in their " +
      "branch or their title — and from what is accepted. In a product with several teams, an item a team's sprint holds is held " +
      "by it, and an item that changes or uses a module a held item changes or uses is kept from the other teams until that hold " +
      "ends.</p>")}</section>`;
}

function uncoveredPanel(app, ctx) {
  const { h } = app;
  const realised = new Set(ctx.items.flatMap((doc) => list(doc.fields.realises)));
  const reqs = ctx.requirements.filter((n) => !realised.has(n)).sort();
  const ucs = ctx.useCases.filter((n) => !realised.has(n)).sort();
  const names = (all) => `<ul class="small">${all.map((n) => `<li><code>${h(n)}</code></li>`).join("")}</ul>`;
  const body = !reqs.length && !ucs.length ? "<p>Every accepted requirement and use case is realised by an item.</p>"
    : `${ucs.length ? `<p>${h(ucs.length)} accepted use case${ucs.length === 1 ? "" : "s"}:</p>${names(ucs)}` : ""}`
      + `${reqs.length ? `<p>${h(reqs.length)} accepted requirement${reqs.length === 1 ? "" : "s"}:</p>${names(reqs)}` : ""}`;
  return `<section class="panel" data-part="uncovered"><h3>Accepted, and realised by no item yet</h3>${body}
    ${explain("<p>Requirements stand in the SPEC once they are accepted; a use case is accepted when an approval record names its " +
      "current text. Each should be realised by at least one backlog item, or nobody will build it; the Product Owner adds items " +
      "for the names listed here (UC-032 steps 2–4).</p>")}</section>`;
}

// Plan sprint for `team`: its goal, start and closer, and every item not done, each selectable or with why it is not.
function planPanel(app, ctx, d, team) {
  const { h } = app;
  const newest = ctx.newest.get(team) ?? null;
  const running = newest && !d.progress?.sprints.find((s) => s.team === team)?.final ? newest.record : null;
  const chosen = new Set(running ? list(running.appended?.filter((s) => s.heading === "## Selection").at(-1)?.fields?.selection
    ?? running.fields.selection) : []);
  const order = buildOrder(ctx.items.map((doc) => ({ id: idOf(doc), dependsOn: list(doc.fields.builds_on) })));
  const rows = order.map((id) => {
    const doc = docOf(ctx, id), st = stateOf(d, id);
    if (st.state === "done") return "";
    const holding = d.held.find((x) => x.item === id && x.team !== team);
    const kept = conflicts(doc, team, d.held, ctx.modules);
    const why = holding ? `held by ${holding.sprint}` : kept.length ? kept.map((k) => `${k.sprint} holds ${k.item}${k.module ? ` — ${k.module}` : ""}`).join("; ")
      : st.state === "waiting for acceptance" ? `not accepted: ${st.reason}` : "";
    return `<tr data-item="${h(id)}"><td><input type="checkbox" data-select-item="${h(id)}"${chosen.has(id) ? " checked" : ""}${why ? " disabled" : ""}></td>
      <td>${fileLink(app, doc.path, h(id))}</td><td>${h(doc.fields.title ?? "")}</td><td>${stateCell(app, st)}</td><td class="small">${h(why) || "—"}</td></tr>`;
  }).join("");
  const token = Boolean(app.token());
  return `<section class="panel" data-plan-team="${h(team)}"><h3>${running ? `Change the selection of ${h(newest.name)}` : `Plan sprint for ${h(team)}`}</h3>
    <p><label>Goal <input data-sprint-goal value="${h(running?.fields.goal ?? "")}"></label></p>
    <p><label>Start <input type="date" data-sprint-start value="${h(today())}"></label>
      <label>Closed by <input data-sprint-closer value="${h(running?.fields.closer ?? ownerOf(ctx, team))}"></label></p>
    <table class="list"><thead><tr><th>Select</th><th>Item</th><th>Title</th><th>State</th><th>Why it cannot be selected</th></tr></thead>
      <tbody>${rows}</tbody></table>
    <p><button class="btn primary" data-start-sprint="${h(team)}"${token ? "" : " disabled"}>Start sprint</button>
      <button class="btn" data-cancel-plan>Cancel</button></p>
    ${token ? "" : `<p class="muted small">Starting a sprint commits to the product's repository: store a token for it first (<a href="#settings">Settings</a>).</p>`}
    <div data-plan-result></div>
    ${explain("<p>The Product Owner selects the items the team works on in its sprint (UC-032 step 6). An item another team's " +
      "sprint holds, or one that changes or uses a module such an item changes or uses, cannot be selected, and its line names " +
      "why; an item is selected only together with, or after, the items it builds on. <em>Start sprint</em> commits " +
      "<code>docs/backlog/sprints/&lt;team&gt;/&lt;nn&gt;.md</code>, numbered within the team, and creates the sprint's own branch " +
      "where the declaration gives one; while the sprint runs, a new selection is added to its record.</p>")}</section>`;
}

// What the other teams' sprints hold, beside `team`'s plan (UC-032 step 5): each item with its title, the sprint that holds
// it, the modules it changes and the modules whose interfaces those use.
function heldPanel(app, ctx, d, team) {
  const { h } = app;
  const others = d.held.filter((x) => x.team !== team);
  const rows = others.map((x) => {
    const doc = docOf(ctx, x.item);
    return `<tr data-held="${h(x.item)}"><td>${doc ? fileLink(app, doc.path, h(x.item)) : h(x.item)}</td><td>${h(doc?.fields?.title ?? "")}</td>
      <td>${h(x.sprint)}</td><td class="small">${x.changes.map(h).join(", ") || "—"}</td><td class="small">${x.uses.map(h).join(", ") || "—"}</td></tr>`;
  }).join("");
  return `<section class="panel" data-part="held"><h3>What the other teams' sprints hold</h3>
    ${others.length ? `<table class="list"><thead><tr><th>Item</th><th>Title</th><th>Sprint</th><th>Changes</th><th>Uses</th></tr></thead>
      <tbody>${rows}</tbody></table>` : `<p class="muted">No other team's sprint holds an item.</p>`}
    ${explain("<p>A sprint holds the items it selected from its start until their change is merged into the default branch or " +
      "they go back to the backlog — after its close too, while its increment waits on its own branch. While another team's " +
      "sprint holds an item, this team selects neither that item nor one that changes a module the item changes or uses, or " +
      "whose modules use a module it changes: each held item is listed with its sprint, the modules it changes and the modules " +
      "whose interfaces they use, as the modules' files under <code>docs/architecture/</code> name them (UC-032 step 5).</p>")}</section>`;
}

// ---------------------------------------------------------------- the view

const planning = new WeakMap(); // the team whose sprint the person plans, per page (its context) — in memory only

async function viewBacklog(app) {
  const { h, main, T } = app;
  const seq = app.seq();
  const ctx = await context(app);
  const d = await derived(app, ctx);
  if (seq !== app.seq()) return;
  const model = ctx.model;
  const noModel = !ctx.declaration ? `<p class="warn">This product declares no process model yet: <code>docs/process.md</code> names it (UC-002).</p>`
    : !model ? `<p class="warn">The declaration names the model file <code>${h(ctx.modelFile ?? "—")}</code>, which is not in the repository at this commit.</p>` : "";
  const planned = model?.kind === "planned" ? `<p class="warn">This product's model plans its work in advance: there is no backlog (UC-032 1b) — its progress is shown on <a href="#progress">Progress</a>.</p>` : "";
  const teamsPart = model?.flow.sprints
    ? (ctx.teams.length ? ctx.teams.map((team) => teamPanel(app, ctx, d, team)).join("")
      : `<section class="panel" data-part="teams"><h3>No team yet</h3><p class="muted">The product's model works in sprints, and no role assignment names a team yet (UC-048).</p>
        ${explain("<p>Each team of a product has a role assignment under <code>docs/role-assignments/</code>, and plans and runs sprints of its own.</p>")}</section>`)
    : model ? `<section class="panel" data-part="flow"><h3>Work in progress</h3>
        <p>${h(d.states.filter((s) => s.state === "in progress").length)} item(s) in progress${model.flow.wip ? ` of a limit of ${h(model.flow.wip)}` : ""}.</p>
        ${explain("<p>The model works without sprints: a ready item is pulled while fewer items are in progress than the work-in-progress limit allows (book ch. 7 §4; UC-032 step 7).</p>")}</section>` : "";
  const team = planning.get(app);
  main().innerHTML = `
    <section class="head"><h2>Backlog</h2>
      <p class="muted">${isGitLab(T.product) ? h(T.product.address) : h(T.repo)} · <code>${h(T.ref)}</code> · read now from the repository and its pull requests; nothing here is stored.</p>
      ${noModel}${planned}
      ${explain("<p>First the state of the current process: each team's running sprint, what it holds and how far it is; then the " +
        "backlog with the state of each item; then what is accepted but realised by no item yet. Everything is derived now from the " +
        "repository and its pull requests.</p>")}</section>
    ${teamsPart}
    ${team && model?.flow.sprints ? planPanel(app, ctx, d, team) : ""}
    ${team && model?.flow.sprints && ctx.teams.length > 1 ? heldPanel(app, ctx, d, team) : ""}
    ${backlogPanel(app, ctx, d)}
    ${uncoveredPanel(app, ctx)}`;
  await app.renderMermaid(main());

  // Each control is looked up by its own selector — a team's Plan button by its team, an item's tick by its item.
  for (const name of ctx.teams) {
    main().querySelectorAll(`[data-plan="${name}"]`).forEach((b) => b.addEventListener("click", () => {
      planning.set(app, name);
      viewBacklog(app).catch((e) => { main().innerHTML = `<p class="warn">${h(app.errorText(app.noteRefusal(e)))}</p>`; });
    }));
  }
  main().querySelectorAll("[data-cancel-plan]").forEach((b) => b.addEventListener("click", () => {
    planning.delete(app);
    viewBacklog(app).catch((e) => { main().innerHTML = `<p class="warn">${h(app.errorText(app.noteRefusal(e)))}</p>`; });
  }));
  main().querySelectorAll("[data-start-sprint]").forEach((b) => b.addEventListener("click", async (ev) => {
    if (ev?.isTrusted === false) return;
    const out = main().querySelector("[data-plan-result]");
    const value = (sel) => text(main().querySelector(sel)?.value).trim();
    const selection = ctx.items.map(idOf).filter((id) => {
      const tick = main().querySelector(`[data-select-item="${id}"]`);
      return tick && tick.checked && !tick.disabled;
    });
    const goal = value("[data-sprint-goal]"), closer = value("[data-sprint-closer]"), start = value("[data-sprint-start]") || today();
    if (!goal || !closer || !selection.length) {
      out.innerHTML = `<p class="warn">Name the sprint's goal and who closes it, and select at least one item.</p>`;
      return;
    }
    const newest = ctx.newest.get(b.dataset.startSprint) ?? null;
    const running = newest && !d.progress?.sprints.find((s) => s.team === b.dataset.startSprint)?.final ? newest.record : null;
    out.innerHTML = `<p class="muted">Starting the sprint…</p>`;
    try {
      const host = connect(parseAddress(T.product.address), { token: app.token() });
      const result = await startSprint(host, { team: b.dataset.startSprint, goal, start, closer, selection },
        { states: d.states, model, declaration: ctx.declaration, held: d.held, architecture: ctx.modules, running,
          head: app.state.commit, trailers: [] });
      planning.delete(app);
      app.setFlash(`${running ? "The selection of" : "Sprint"} <code>${h(result.path)}</code> ${running ? "is changed" : "is started"} — commit ${h(result.commit.slice(0, 7))}.`);
      await app.reloadAndRoute();
    } catch (e) {
      out.innerHTML = e?.name === "SprintRefused"
        ? `<p class="warn">The sprint is not started:</p><ul class="small">${(e.reasons ?? []).map((r) => `<li>${h(r)}</li>`).join("")}</ul>`
        : `<p class="warn">${h(app.errorText(app.noteRefusal(e)))}</p>`;
    }
  }));
}

export const routes = { backlog: (app) => viewBacklog(app) };

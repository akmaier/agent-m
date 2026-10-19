// The route `backlog` — the backlog and the sprints of each team (MOD-implementation-pages, docs/architecture/MOD-implementation-pages.md; Interfaces: backlog; UC-032 steps 1, 5 and 6, UC-033, UC-035): the state of the
// current process first — each team's running sprint, what it holds, the state of each held item and its burn-down, or that the team runs none —, then the backlog, each item after the items it builds on, with its state and, in
// a product with several teams, what keeps it from a team's selection, then the accepted requirements and use cases no item realises yet. *Plan sprint*, for one team, lists what the team may select, and beside it every item
// the other teams' sprints hold, with its sprint and the modules it changes and uses; *Start sprint* commits the team's sprint through MOD-work-plans' startSprint as the person's own commit, on the person's click: the one
// write of this route. Everything else is read from the product's repository and its pull requests and derived when shown; nothing is stored (PROGRESS AND JOB STATE ARE DERIVED, NOT STORED). Every part explains itself
// (EVERY STEP EXPLAINS ITSELF). The layout is the one of the review pages: a head, panels, list tables, buttons and badges — no style of its own; each table stands in a box that scrolls sideways where the page is
// narrower than the table, and the burn-down chart keeps the width at which its text is the size of the page's body text, scrolling sideways in its box where the page is narrower — widths and sizes as the site's
// src/theme/lme.css gives them.
//
// Module: MOD-implementation-pages
//
// What a render reads, through the product's host: the declaration docs/process.md; the role assignments under docs/role-assignments/, which name the teams; every
// team's sprints under docs/backlog/sprints/<team>/; every item under docs/backlog/; the SPEC, which names the accepted requirements; the approval statuses of the use cases (MOD-approvals' statuses, which read no file); in a
// product with several teams, the architecture's module files; the product's pull requests, of which those into the default branch or into a sprint's branch count; and, through the instance's host, the catalogue of
// process models, in which the model the declaration names is found by its file. MOD-work-plans decides each item's state (itemStates, from the pull requests, the approval statuses and the requirements the SPEC
// holds), what the sprints hold (heldItems), what keeps an item from a team (conflicts) and how a sprint starts (startSprint); MOD-progress-measures derives each team's sprint and its burn-down (progressIn).
// Readings the texts leave open, which this file takes: a requirement named in the SPEC is accepted — the approval statuses MOD-work-plans' itemStates reads hold the reviewed files only, so the route adds the SPEC's
// requirements to them; a model is found in the catalogue by the file the declaration names, as the route `roles` finds it; after Start sprint the route draws itself again, and the frame's host serves the snapshot the commit made.

import { statuses } from "../approvals/index.mjs";
import { artifactSchemas, readDocument } from "../documents/index.mjs";
import { renderArtifact, renderMermaid } from "../markdown-render/index.mjs";
import { catalogue } from "../model-catalogue/index.mjs";
import { declarationSchema, roleAssignmentSchema } from "../product-process/index.mjs";
import { progressIn } from "../progress-measures/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";
import { conflicts, heldItems, itemStates, planSchemas, startSprint } from "../work-plans/index.mjs";

const DECLARATION = "docs/process.md";
const ITEM_FILE = /^docs\/backlog\/(ITM-\d{3,})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const SPRINT_FILE = /^docs\/backlog\/sprints\/([^/]+)\/(\d+)\.md$/;
const ASSIGNMENT_FILE = /^docs\/role-assignments\/([^/]+)\.md$/;
const MODULE_FILE = /^docs\/architecture\/MOD-[^/]+\.md$/;

// The badge of each state of UC-032 step 1, by the colours the review pages give their states.
const BADGE = { ready: "b-open", "in progress": "b-changed", done: "b-accepted", blocked: "b-stale",
  "waiting for acceptance": "b-superseded", "waiting for an item it builds on": "b-superseded", unknown: "b-stale" };

const text = (value) => (typeof value === "string" ? value : value === null || value === undefined ? "" : String(value));
const list = (value) => (Array.isArray(value) ? value.map(text) : text(value).split(",").map((part) => part.trim()).filter(Boolean));
const listed = (names) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`);
const today = () => new Date().toISOString().slice(0, 10);
const h = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const explain = (html) => `<details class="explain"><summary>What is this?</summary><div>${html}</div></details>`;
const idOf = (doc) => text(doc?.id ?? doc?.fields?.id) || ITEM_FILE.exec(text(doc?.path))?.[1] || "";
// The items in the order of their numbers (ITM-999 before ITM-1000).
const numberOf = (id) => Number(/\d+/.exec(id)?.[0] ?? Infinity);
const byNumber = (a, b) => numberOf(a) - numberOf(b) || (a < b ? -1 : a > b ? 1 : 0);

// ---------------------------------------------------------------- reading

// What the route needs besides the pull requests: the declaration and its model, the teams, their sprints, the items, the modules, and what is accepted.
async function contextOf(context) {
  const { product, instance } = context;
  // The branch the page has read, where the caller says which it is; else the default branch the repository reports.
  const ref = product.ref ?? (await product.host.repositoryInfo()).defaultBranch;
  const snapshot = await product.host.readSnapshot(ref);
  const paths = (re) => snapshot.paths.filter((path) => re.test(path)).sort();
  const modulePaths = paths(MODULE_FILE);
  const wanted = [DECLARATION, "SPEC.md", ...paths(ITEM_FILE), ...paths(SPRINT_FILE), ...paths(ASSIGNMENT_FILE)].filter((path) => snapshot.paths.includes(path));
  const teamNames = new Set([...paths(ASSIGNMENT_FILE).map((path) => ASSIGNMENT_FILE.exec(path)[1]), ...paths(SPRINT_FILE).map((path) => SPRINT_FILE.exec(path)[1])]);
  await snapshot.readMany?.([...wanted, ...(teamNames.size > 1 ? modulePaths : [])]);
  const readAll = (list_, schema) => Promise.all(list_.map(async (path) => readDocument(schema, path, (await snapshot.read(path)) ?? "")));
  const [declarationText, specText] = await Promise.all([snapshot.read(DECLARATION), snapshot.read("SPEC.md")]);
  const declaration = declarationText !== null ? readDocument(declarationSchema, DECLARATION, declarationText) : null;
  const modelFile = text(declaration?.fields?.model_file) || null;
  const [assignments, sprints, items] = await Promise.all([readAll(paths(ASSIGNMENT_FILE), roleAssignmentSchema), readAll(paths(SPRINT_FILE), planSchemas.sprint),
    readAll(paths(ITEM_FILE), artifactSchemas().item)]);
  const teams = [...new Set([...assignments.map((a) => ASSIGNMENT_FILE.exec(a.path)?.[1]), ...sprints.map((s) => SPRINT_FILE.exec(s.path)?.[1])].filter(Boolean))];
  const modules = teams.length > 1 ? await readAll(modulePaths, artifactSchemas().module) : [];
  // The instance is read for the model the declaration names, and for that file only: the page shows the instance itself when both hosts are one.
  const instanceSnapshot = instance.host === product.host ? snapshot : await instance.host.readSnapshot((await instance.host.repositoryInfo()).defaultBranch);
  const onlyThat = { paths: instanceSnapshot.paths.filter((path) => path === modelFile), read: (path) => instanceSnapshot.read(path), blob: (path) => instanceSnapshot.blob(path) };
  const model = modelFile ? ((await catalogue(onlyThat)).models.find((each) => each.path === modelFile) ?? null) : null;
  const newest = new Map();
  for (const record of sprints) {
    const [, team, nn] = SPRINT_FILE.exec(record.path);
    if (!newest.has(team) || Number(nn) > Number(newest.get(team).nn)) newest.set(team, { record, nn, name: `${team}/${nn}` });
  }
  items.sort((a, b) => byNumber(idOf(a), idOf(b)));
  const requirements = [...parseSpec(specText ?? "").requirements.keys()];
  const reviewed = statuses(snapshot);
  const useCases = [...reviewed.values()].filter((entry) => entry.kind === "use-case" && entry.status === "accepted").map((entry) => entry.id);
  return { ref, snapshot, declaration, modelFile, model, assignments, sprints, items, modules, teams, newest, requirements, useCases, reviewed };
}

// The pull requests the page derives from, in one listing of all of them: an item's hold can outlast its sprint, and an item can be done before any sprint ran. Only those into the default branch or into the branch of a
// sprint count, whatever else the server answers.
async function pullRequestsOf(context, ctx) {
  const bases = new Set([ctx.ref, ...ctx.sprints.map((sprint) => text(sprint.fields.branch)).filter(Boolean)]);
  const found = await context.product.host.listPullRequests();
  return found.filter((pullRequest) => bases.has(pullRequest.branchBase ?? pullRequest.base));
}

// The approval statuses MOD-work-plans' itemStates reads: the reviewed files', and each requirement the SPEC holds as accepted.
function statusesOf(ctx) {
  const all = new Map(ctx.reviewed);
  for (const name of ctx.requirements) all.set(name, { id: name, kind: "requirement", status: "accepted" });
  return all;
}

// What the route derives: the pull requests, each item's state and when a done item was merged, what the sprints hold, each team's sprint.
async function derivedOf(context, ctx) {
  const pull = await pullRequestsOf(context, ctx);
  const states = itemStates(ctx.items, null, { statuses: statusesOf(ctx), queues: [], jobs: [], pullRequests: pull, gates: [], workflow: null });
  const mergedAt = new Map();
  for (const doc of ctx.items) {
    const id = idOf(doc);
    if (states.find((each) => each.item === id)?.state !== "done") continue;
    const merged = pull.filter((each) => each.state === "merged" && new RegExp(`(?<![A-Za-z0-9])${id}(?![0-9])`, "i").test(`${text(each.branch)} ${text(each.title)}`))
      .map((each) => each.merged).filter((at) => at && Number.isFinite(Date.parse(at))).sort()[0];
    if (merged) mergedAt.set(id, new Date(merged).toISOString());
  }
  const held = heldItems(ctx.sprints, ctx.items, ctx.modules, pull);
  let progress = null;
  if (ctx.model) {
    try {
      progress = progressIn({ model: ctx.model, modelSince: null, assignments: ctx.assignments, sprints: ctx.sprints, plan: { order: null, items: ctx.items, states }, pullRequests: pull }, new Date());
    } catch { progress = null; }
  }
  return { pull, states, mergedAt, held, progress };
}

// ---------------------------------------------------------------- the parts

const badge = (state) => `<span class="badge ${BADGE[state] ?? "b-stale"}">${h(state)}</span>`;
const fileLink = (context, ref, path, label) => `<a href="${h(`${context.product.address.replace(/\/$/, "")}${context.product.kind === "gitlab" ? "/-" : ""}/blob/${ref.split("/").map(encodeURIComponent).join("/")}/${path.split("/").map(encodeURIComponent).join("/")}`)}" target="_blank" rel="noopener">${label}</a>`;
const docOf = (ctx, id) => ctx.items.find((doc) => idOf(doc) === id) ?? null;
const stateOf = (d, id) => d.states.find((each) => each.item === id) ?? { item: id, state: "unknown", reason: null };
// The reason of a state, as the page words it.
const reasonOf = (st) => (st.state === "waiting for acceptance" ? `not accepted: ${st.reason}` : st.state === "waiting for an item it builds on" ? `waits for ${st.reason}` : st.reason);
const stateCell = (st) => `${badge(st.state)}${st.reason ? ` <span class="muted small">${h(reasonOf(st))}</span>` : ""}`;

// The role of the phase that plans — that produces ITM — and its first holder in the team's role assignment: who closes the team's sprint unless the Product Owner names another.
function ownerOf(ctx, team) {
  const role = ctx.model?.phases?.find((phase) => (phase.produces ?? []).includes("ITM"))?.roles?.[0];
  const assignment = ctx.assignments.find((each) => ASSIGNMENT_FILE.exec(each.path)?.[1] === team);
  const row = (assignment?.sections ?? []).flatMap((section) => section.rows ?? []).find((each) => text(each.cells.Role) === role);
  return list(row?.cells.Participants)[0] ?? "";
}

// The items a sprint has left over time: at its start, after each merge of one of its items, in time order, and now — or, for a closed sprint, at its end, the last day of its burn-down, after which no merge counts. An item
// merged before the sprint's start is done from the start. A merge is labelled with its time, HH:MM in UTC, or MM-DD HH:MM once a merge falls on another day than the start.
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

// The size of the page's body text, and the width the site keeps the burn-down chart at (src/theme/lme.css), in px, as the browser draws the page; null where nothing is drawn.
const bodyTextSize = () => parseFloat(globalThis.getComputedStyle?.(globalThis.document?.body)?.fontSize) || null;
const burnDownWidth = () => parseFloat(globalThis.getComputedStyle?.(globalThis.document?.documentElement)?.getPropertyValue?.("--burn-down-width")) || null;

// The Mermaid chart of a sprint's items left over time. Given `width`, it is drawn that wide; given `size`, its title and its axes' labels and titles are drawn at `size` px — both by Mermaid's own configuration of the chart.
function burnDownChart(name, points, { width = null, size = null } = {}) {
  const most = Math.max(1, ...points.map((point) => point.remaining));
  const axis = `{ labelFontSize: ${size}, titleFontSize: ${size} }`;
  const settings = [...(width ? [`    width: ${width}`] : []), ...(size ? [`    titleFontSize: ${size}`, `    xAxis: ${axis}`, `    yAxis: ${axis}`] : [])];
  const config = settings.length ? ["---", "config:", "  xyChart:", ...settings, "---"] : [];
  return [...config, "xychart-beta", `  title "${name} — items remaining, times in UTC"`, `  x-axis [${points.map((point) => `"${point.label}"`).join(", ")}]`,
    `  y-axis "Items remaining" 0 --> ${most}`, `  line [${points.map((point) => point.remaining).join(", ")}]`].join("\n");
}

// How many of a team's sprint's items are in progress, against the model's work-in-progress limit, counted per team (UC-032 step 7: in a model with sprints and a limit, both hold).
function wipLine(ctx, d, entry) {
  const wip = ctx.model?.flow?.wip;
  if (!wip) return "";
  const busy = entry.items.filter((st) => stateOf(d, st.item).state === "in progress").map((st) => st.item);
  return `<p>${h(busy.length)} of ${h(wip)} items in progress${busy.length ? `: ${busy.map(h).join(", ")}` : ""}.${busy.length >= wip
    ? " No further item starts until one of them is merged." : ""}</p>`;
}

// The chart as the page places it: MOD-markdown-render's rendering of a Mermaid block, which stays its source until drawCharts draws it once the HTML stands in the page.
const chartBlock = (team, name, points) => `<div class="md" data-burn-down="${h(team)}">${renderArtifact(`\`\`\`mermaid\n${burnDownChart(name, points, { width: burnDownWidth(), size: bodyTextSize() })}\n\`\`\`\n`).innerHTML}</div>`;

function teamPanel(context, ctx, d, team) {
  const newest = ctx.newest.get(team) ?? null;
  const entry = d.progress?.sprints.find((each) => each.team === team) ?? null;
  const plan = (label, primary) => `<button class="btn${primary ? " primary" : ""}" data-plan="${h(team)}">${h(label)}</button>`;
  const why = explain("<p>A team plans, starts and closes sprints of its own (UC-032 step 6). While its sprint runs, the sprint holds the " +
    "items it selected until their change is in the default branch or they go back to the backlog; no other team selects an item " +
    "that changes or uses the same modules. The chart counts the selected items not done yet: at the sprint's start, after each " +
    "merge of one of its items, at the time of that merge in UTC, and now — or, once the sprint is closed, at its end — derived " +
    "now from the sprint's record and the pull requests the page reads anyway, never stored (book ch. 7 §5).</p>");
  if (!newest || !entry || entry.final) {
    const last = newest ? `<p class="muted">Its last sprint, ${fileLink(context, ctx.ref, newest.record.path, `<b>${h(newest.name)}</b>`)}, `
      + `${text(newest.record.fields.end) ? `ended on ${h(text(newest.record.fields.end))}` : "is closed"}.</p>` : `<p class="muted">It has run no sprint yet.</p>`;
    const final = newest && entry?.final && entry.burnDown.length ? chartBlock(team, newest.name, remainingOverTime(entry.items.map((st) => st.item),
      d.mergedAt, text(newest.record.fields.start), entry.burnDown.at(-1).day)) : "";
    return `<section class="panel" data-team="${h(team)}"><h3>${h(team)} — no running sprint</h3>${last}${final}
      <p>${plan("Plan sprint", true)}</p>${why}</section>`;
  }
  const record = newest.record, f = record.fields;
  const heldOf = new Map(d.held.filter((each) => each.team === team).map((each) => [each.item, each]));
  const rows = entry.items.map((st) => {
    const doc = docOf(ctx, st.item), held = heldOf.get(st.item);
    const changes = held?.changes ?? list(doc?.fields?.modules);
    return `<tr data-item="${h(st.item)}"><td>${doc ? fileLink(context, ctx.ref, doc.path, h(st.item)) : h(st.item)}</td><td>${h(doc?.fields?.title ?? "")}</td>
      <td>${stateCell(stateOf(d, st.item))}</td><td class="small">${changes.map(h).join(", ") || "—"}</td>
      <td class="small">${(held?.uses ?? []).map(h).join(", ") || "—"}</td></tr>`;
  }).join("");
  const chart = entry.burnDown.length ? chartBlock(team, newest.name, remainingOverTime(entry.items.map((st) => st.item), d.mergedAt, text(f.start)))
    : `<p class="muted">No burn-down yet: the sprint starts on ${h(text(f.start))}.</p>`;
  return `<section class="panel" data-team="${h(team)}"><h3>${h(team)} — sprint ${fileLink(context, ctx.ref, record.path, h(newest.name))}</h3>
    <dl class="meta"><dt>Goal</dt><dd>${h(text(f.goal))}</dd><dt>Started</dt><dd>${h(text(f.start))}</dd>
      <dt>Ends</dt><dd>${f.end ? h(text(f.end)) : "when its items are done or the Product Owner ends it — no time box"}</dd>
      <dt>Branch</dt><dd>${f.branch ? `<code>${h(text(f.branch))}</code>` : `none: <code>${h(ctx.ref)}</code>`}</dd><dt>Closed by</dt><dd>${h(text(f.closer))}</dd></dl>
    ${wipLine(ctx, d, entry)}
    <div class="table-scroll"><table class="list"><thead><tr><th>Item</th><th>Title</th><th>State</th><th>Changes</th><th>Uses</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${chart}
    <p>${plan("Change the selection", false)}</p>${why}</section>`;
}

// What keeps an item from a team other than the one whose sprint holds it, one line per team.
function marks(ctx, d, doc) {
  const id = idOf(doc);
  const holding = d.held.find((each) => each.item === id);
  const lines = holding ? [`held by ${h(holding.sprint)}`] : [];
  if (ctx.teams.length > 1) {
    for (const team of ctx.teams) {
      if (holding?.team === team) continue;
      const kept = conflicts(doc, team, d.held, ctx.modules);
      if (kept.length) lines.push(`kept from ${h(team)}: ${kept.map((k) => `${h(k.sprint)} holds ${h(k.item)}${k.module ? ` — ${h(k.module)}` : ""}`).join("; ")}`);
    }
  }
  return lines.join("<br>") || "—";
}

// The items after the items they build on, as MOD-work-plans' itemStates lists them.
const orderOf = (d) => d.states.map((each) => each.item);

function backlogPanel(context, ctx, d) {
  const rows = orderOf(d).map((id, at) => {
    const doc = docOf(ctx, id);
    return `<tr data-item="${h(id)}"><td>${h(at + 1)}</td><td>${fileLink(context, ctx.ref, doc.path, h(id))}</td><td>${h(doc.fields.title ?? "")}</td>
      <td class="small">${list(doc.fields.realises).map((name) => `<code>${h(name)}</code>`).join(" ")}</td>
      <td>${stateCell(stateOf(d, id))}</td><td class="small">${marks(ctx, d, doc)}</td></tr>`;
  }).join("");
  return `<section class="panel" data-part="backlog"><h3>The backlog</h3>
    <p class="muted">${h(d.states.length)} items, each after the items it builds on.</p>
    <div class="table-scroll"><table class="list"><thead><tr><th>#</th><th>Item</th><th>Title</th><th>Realises</th><th>State</th><th>Held or kept</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    ${explain("<p>The backlog is everything the product is meant to do, one Markdown file per item under <code>docs/backlog/</code> " +
      "(UC-032). It keeps no order of its own: each item is listed after the items it builds on, and what is worth doing next is " +
      "decided at sprint planning. A state is never stored: it is derived now from the pull requests that name the item — in their " +
      "branch or their title — and from what is accepted. In a product with several teams, an item a team's sprint holds is held " +
      "by it, and an item that changes or uses a module a held item changes or uses is kept from the other teams until that hold " +
      "ends.</p>")}</section>`;
}

function uncoveredPanel(ctx) {
  const realised = new Set(ctx.items.flatMap((doc) => list(doc.fields.realises)));
  const reqs = ctx.requirements.filter((name) => !realised.has(name)).sort();
  const ucs = ctx.useCases.filter((name) => !realised.has(name)).sort();
  const names = (all) => `<ul class="small">${all.map((name) => `<li><code>${h(name)}</code></li>`).join("")}</ul>`;
  const body = !reqs.length && !ucs.length ? "<p>Every accepted requirement and use case is realised by an item.</p>"
    : `${ucs.length ? `<p>${h(ucs.length)} accepted use case${ucs.length === 1 ? "" : "s"}:</p>${names(ucs)}` : ""}`
      + `${reqs.length ? `<p>${h(reqs.length)} accepted requirement${reqs.length === 1 ? "" : "s"}:</p>${names(reqs)}` : ""}`;
  return `<section class="panel" data-part="uncovered"><h3>Accepted, and realised by no item yet</h3>${body}
    ${explain("<p>Requirements stand in the SPEC once they are accepted; a use case is accepted when an approval record names its " +
      "current text. Each should be realised by at least one backlog item, or nobody will build it; the Product Owner adds items " +
      "for the names listed here (UC-032 steps 2–4).</p>")}</section>`;
}

// The sprint of `team` that is running, or null.
function runningOf(ctx, d, team) {
  const newest = ctx.newest.get(team) ?? null;
  return newest && !d.progress?.sprints.find((each) => each.team === team)?.final ? newest.record : null;
}

// Plan sprint for `team`: its goal, start and closer, and every item not done, each selectable or with why it is not.
function planPanel(context, ctx, d, team) {
  const newest = ctx.newest.get(team) ?? null;
  const running = runningOf(ctx, d, team);
  const chosen = new Set(running ? list(running.appended?.filter((section) => section.heading === "## Selection").at(-1)?.fields?.selection ?? running.fields.selection) : []);
  const rows = orderOf(d).map((id) => {
    const doc = docOf(ctx, id), st = stateOf(d, id);
    if (st.state === "done") return "";
    const holding = d.held.find((each) => each.item === id && each.team !== team);
    const kept = conflicts(doc, team, d.held, ctx.modules);
    const why = holding ? `held by ${holding.sprint}` : kept.length ? kept.map((k) => `${k.sprint} holds ${k.item}${k.module ? ` — ${k.module}` : ""}`).join("; ")
      : st.state === "waiting for acceptance" ? reasonOf(st) : "";
    return `<tr data-item="${h(id)}"><td><input type="checkbox" data-select-item="${h(id)}"${chosen.has(id) ? " checked" : ""}${why ? " disabled" : ""}></td>
      <td>${fileLink(context, ctx.ref, doc.path, h(id))}</td><td>${h(doc.fields.title ?? "")}</td><td>${stateCell(st)}</td><td class="small">${h(why) || "—"}</td></tr>`;
  }).join("");
  const token = context.product.tokenStored !== false;
  return `<section class="panel" data-plan-team="${h(team)}"><h3>${running ? `Change the selection of ${h(newest.name)}` : `Plan sprint for ${h(team)}`}</h3>
    <p><label>Goal <input data-sprint-goal value="${h(text(running?.fields.goal))}"></label></p>
    <p><label>Start <input type="date" data-sprint-start value="${h(today())}"></label>
      <label>Closed by <input data-sprint-closer value="${h(text(running?.fields.closer) || ownerOf(ctx, team))}"></label></p>
    <div class="table-scroll"><table class="list"><thead><tr><th>Select</th><th>Item</th><th>Title</th><th>State</th><th>Why it cannot be selected</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
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

// What the other teams' sprints hold, beside `team`'s plan (UC-032 step 5): each item with its title, the sprint that holds it, the modules it changes and the modules whose interfaces those use.
function heldPanel(context, ctx, d, team) {
  const others = d.held.filter((each) => each.team !== team);
  const rows = others.map((each) => {
    const doc = docOf(ctx, each.item);
    return `<tr data-held="${h(each.item)}"><td>${doc ? fileLink(context, ctx.ref, doc.path, h(each.item)) : h(each.item)}</td><td>${h(doc?.fields?.title ?? "")}</td>
      <td>${h(each.sprint)}</td><td class="small">${each.changes.map(h).join(", ") || "—"}</td><td class="small">${each.uses.map(h).join(", ") || "—"}</td></tr>`;
  }).join("");
  return `<section class="panel" data-part="held"><h3>What the other teams' sprints hold</h3>
    ${others.length ? `<div class="table-scroll"><table class="list"><thead><tr><th>Item</th><th>Title</th><th>Sprint</th><th>Changes</th><th>Uses</th></tr></thead>
      <tbody>${rows}</tbody></table></div>` : `<p class="muted">No other team's sprint holds an item.</p>`}
    ${explain("<p>A sprint holds the items it selected from its start until their change is merged into the default branch or " +
      "they go back to the backlog — after its close too, while its increment waits on its own branch. While another team's " +
      "sprint holds an item, this team selects neither that item nor one that changes a module the item changes or uses, or " +
      "whose modules use a module it changes: each held item is listed with its sprint, the modules it changes and the modules " +
      "whose interfaces they use, as the modules' files under <code>docs/architecture/</code> name them (UC-032 step 5).</p>")}</section>`;
}

// ---------------------------------------------------------------- the route

const planning = new WeakMap(); // the team whose sprint the person plans, per page (its target) — in memory only

async function draw(target, context) {
  const ctx = await contextOf(context);
  const d = await derivedOf(context, ctx);
  const { model } = ctx;
  const noModel = !ctx.declaration ? `<p class="warn">This product declares no process model yet: <code>docs/process.md</code> names it (UC-002).</p>`
    : !model ? `<p class="warn">The declaration names the model file <code>${h(ctx.modelFile ?? "—")}</code>, which the catalogue does not hold.</p>` : "";
  const planned = model?.kind === "planned" ? `<p class="warn">This product's model plans its work in advance: there is no backlog (UC-032 1b) — its progress is shown on <a href="#progress">Progress</a>.</p>` : "";
  const sprints = model?.flow?.sprints === true;
  const teamsPart = sprints
    ? (ctx.teams.length ? ctx.teams.map((team) => teamPanel(context, ctx, d, team)).join("")
      : `<section class="panel" data-part="teams"><h3>No team yet</h3><p class="muted">The product's model works in sprints, and no role assignment names a team yet (UC-048).</p>
        ${explain("<p>Each team of a product has a role assignment under <code>docs/role-assignments/</code>, and plans and runs sprints of its own.</p>")}</section>`)
    : model ? `<section class="panel" data-part="flow"><h3>Work in progress</h3>
        <p>${h(d.states.filter((each) => each.state === "in progress").length)} item(s) in progress${model.flow?.wip ? ` of a limit of ${h(model.flow.wip)}` : ""}.</p>
        ${explain("<p>The model works without sprints: a ready item is pulled while fewer items are in progress than the work-in-progress limit allows (book ch. 7 §4; UC-032 step 7).</p>")}</section>` : "";
  const team = planning.get(target);
  const where = context.product.address;
  target.innerHTML = `
    <section class="head"><h2>Backlog</h2>
      <p class="muted">${h(where)} · <code>${h(ctx.ref)}</code> · read now from the repository and its pull requests; nothing here is stored.</p>
      ${noModel}${planned}
      ${explain("<p>First the state of the current process: each team's running sprint, what it holds and how far it is; then the " +
        "backlog with the state of each item; then what is accepted but realised by no item yet. Everything is derived now from the " +
        "repository and its pull requests.</p>")}</section>
    ${teamsPart}
    ${team && sprints ? planPanel(context, ctx, d, team) : ""}
    ${team && sprints && ctx.teams.length > 1 ? heldPanel(context, ctx, d, team) : ""}
    ${backlogPanel(context, ctx, d)}
    ${uncoveredPanel(ctx)}`;
  await drawCharts(target);

  // Each control is looked up by its own selector — a team's Plan button by its team, an item's tick by its item.
  const again = () => draw(target, context).catch((failure) => { target.innerHTML = `<p class="warn">${h(failure?.message ?? failure)}</p>`; });
  for (const name of ctx.teams) {
    target.querySelectorAll(`[data-plan="${name}"]`).forEach((button) => button.addEventListener("click", () => { planning.set(target, name); again(); }));
  }
  target.querySelectorAll("[data-cancel-plan]").forEach((button) => button.addEventListener("click", () => { planning.delete(target); again(); }));
  target.querySelectorAll("[data-start-sprint]").forEach((button) => button.addEventListener("click", async (event) => {
    if (event?.isTrusted === false) return;
    const out = target.querySelector("[data-plan-result]");
    const value = (selector) => text(target.querySelector(selector)?.value).trim();
    const selection = ctx.items.map(idOf).filter((id) => {
      const tick = target.querySelector(`[data-select-item="${id}"]`);
      return tick && tick.checked && !tick.disabled;
    });
    const goal = value("[data-sprint-goal]"), closer = value("[data-sprint-closer]"), start = value("[data-sprint-start]") || today();
    if (!goal || !closer || !selection.length) {
      out.innerHTML = `<p class="warn">Name the sprint's goal and who closes it, and select at least one item.</p>`;
      return;
    }
    const chosenTeam = button.dataset?.startSprint ?? button.getAttribute("data-start-sprint");
    const running = runningOf(ctx, d, chosenTeam);
    out.innerHTML = `<p class="muted">Starting the sprint…</p>`;
    try {
      const result = await startSprint(context.product.host, { team: chosenTeam, goal, start, closer, selection },
        { states: d.states, model, declaration: ctx.declaration, held: d.held, architecture: ctx.modules, running, head: ctx.snapshot.commit, trailers: [] });
      planning.delete(target);
      await draw(target, context);
      target.insertAdjacentHTML?.("afterbegin", `<section class="panel notice flash"><p>${running ? "The selection of" : "Sprint"} <code>${h(result.path)}</code> ${running ? "is changed" : "is started"} — commit ${h(result.commit.slice(0, 7))}.</p></section>`);
    } catch (failure) {
      out.innerHTML = failure?.name === "SprintRefused"
        ? `<p class="warn">The sprint is not started:</p><ul class="small">${(failure.reasons ?? []).map((reason) => `<li>${h(reason)}</li>`).join("")}</ul>`
        : `<p class="warn">${h(failure?.message ?? failure)}</p>`;
    }
  }));
}

// Each block of Mermaid text the page holds is drawn by MOD-markdown-render.
async function drawCharts(target) {
  for (const code of [...target.querySelectorAll("pre > code.language-mermaid")]) code.parentNode.replaceWith(await renderMermaid(code.textContent));
}

export const route = {
  name: "backlog",
  entry: "implementation",
  title: "Backlog",

  async render(target, context) {
    await draw(target, context);
  },
};

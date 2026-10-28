// The route `backlog` — the backlog and what is done (MOD-implementation-pages, docs/architecture/MOD-implementation-pages.md; Interfaces: backlog; UC-032 steps 1, 5 and 6, UC-033): each
// team first — its last sprint that has ended, linked to its record, with its final burn-down, or that it has ended none, and whether a sprint of it runs now, which the route
// `progress` shows —, then the backlog, each item after the items it builds on, with its state and, in a product with several teams, what keeps it from a team's selection, then the
// accepted requirements and use cases no item realises yet. *Plan sprint*, for one team, lists what the team may select, and beside it every item the other teams' sprints hold, with
// its sprint and the modules it changes and uses; with the parameter `plan` naming a team — as `progress` links it — the route opens with that team's planning, and a planning opened
// or cancelled on the page is drawn from what the route has read, without reading it again. *Start sprint* commits the team's sprint through MOD-work-plans' startSprint as the
// person's own commit, on the person's click: the one write of this route. Everything else is read from the product's repository and its pull requests and derived when shown;
// nothing is stored (PROGRESS AND JOB STATE ARE DERIVED, NOT STORED). Every part explains itself (EVERY STEP EXPLAINS ITSELF). The layout is the one of the review pages: a head,
// panels, list tables, buttons and badges — no style of its own; each table stands in a box that scrolls sideways where the page is narrower than the table. The burn-down chart is
// the route progress's (progress.mjs).
//
// Module: MOD-implementation-pages
//
// What a render reads: the facts of the product, which MOD-progress-measures' productFacts gives with the scope `work` — the declaration docs/process.md, the role assignments under docs/role-assignments/, which name the teams,
// every team's sprints under docs/backlog/sprints/<team>/, every item under docs/backlog/, the approval statuses (MOD-approvals' statuses, which read no file), every pull request of the product, and the model the declaration names as the
// instance's catalogue held it at the commit its model_version names. Besides: the SPEC, which names the accepted requirements,
// and, in a product with several teams, the architecture's module files. Of the pull requests those into the default branch or into a sprint's branch count. MOD-work-plans decides
// each item's state (itemStates, from the pull requests, the approval statuses and the requirements the SPEC holds), what the sprints hold (heldItems), what keeps an item from a team (conflicts) and how a sprint starts
// (startSprint); MOD-progress-measures derives each team's sprints and their burn-down (progressIn). A model version the instance cannot read is named on the page (modelUnread); the catalogue as it stands now is not used instead.
// Readings the texts leave open, which this file takes: a requirement named in the SPEC is accepted — the approval statuses MOD-work-plans' itemStates reads hold the reviewed files only, so the route adds the SPEC's
// requirements to them; the model is the one productFacts gives, found in the catalogue by the file the declaration names; after Start sprint the route reads and draws itself again, and the frame's host serves the snapshot the commit
// made; a team's last sprint that has ended is its newest that is closed or past its end, else the one before its running sprint.

import { artifactSchemas, readDocument } from "../documents/index.mjs";
import { productFacts, progressIn } from "../progress-measures/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";
import { conflicts, heldItems, itemStates, startSprint, startable } from "../work-plans/index.mjs";
import { participantSchema, participantsOf } from "../participant-list/index.mjs";
import { chartBlock, drawCharts, mergedAtOf, remainingOverTime } from "./progress.mjs";

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
const whatIsThis = (html) => `<details class="explain"><summary>What is this?</summary><div>${html}</div></details>`;
const idOf = (doc) => text(doc?.id ?? doc?.fields?.id) || ITEM_FILE.exec(text(doc?.path))?.[1] || "";
// The items in the order of their numbers (ITM-999 before ITM-1000).
const numberOf = (id) => Number(/\d+/.exec(id)?.[0] ?? Infinity);
const byNumber = (a, b) => numberOf(a) - numberOf(b) || (a < b ? -1 : a > b ? 1 : 0);

// ---------------------------------------------------------------- reading

// What the route needs besides the pull requests: the declaration and its model, the teams, their sprints, the items, the modules, and what is accepted. The facts are MOD-progress-measures' productFacts with the scope `work`,
// which reads the files in batches. The requirements and the module files, which Facts does not carry, come from the files.
export async function contextOf(context) {
  const { product, instance } = context;
  // The product's host as productFacts reads it: the branch the page has read, where the caller says which it is (else the default branch the repository reports), and each snapshot read once — the instance's too, where
  // the product is the instance.
  const shots = new Map();
  const reading = (host, ref) => {
    const own = Object.create(host);
    const set = (name, value) => Object.defineProperty(own, name, { value, writable: true, configurable: true, enumerable: true });
    if (ref) set("repositoryInfo", async () => ({ defaultBranch: ref }));
    set("readSnapshot", (at) => { if (!shots.has(at)) shots.set(at, host.readSnapshot(at)); return shots.get(at); });
    return own;
  };
  const ref = product.ref ?? (await product.host.repositoryInfo()).defaultBranch;
  const host = reading(product.host, product.ref);
  const same = instance.host === product.host;
  const instanceHost = same ? host : instance.host;
  const instanceSnapshot = same ? await host.readSnapshot(ref) : await instanceHost.readSnapshot((await instanceHost.repositoryInfo()).defaultBranch);
  const facts = await productFacts(host, instanceSnapshot, (commit) => instanceHost.readSnapshot(commit), new Date(), { scope: "work" });
  const snapshot = facts.snapshot;
  const { declaration, assignments, sprints } = facts;
  const items = facts.plan.items.filter((doc) => ITEM_FILE.test(text(doc.path)));
  const modelFile = text(declaration?.fields?.model_file) || null;
  // The model as the instance held it at the commit the declaration's model_version names (UC-031 step 6a); where that cannot be read, none — and the page says so (modelUnread), never today's catalogue.
  const model = facts.model !== null && typeof facts.model === "object" ? facts.model : null;
  const teams = [...new Set([...assignments.map((a) => ASSIGNMENT_FILE.exec(a.path)?.[1]), ...sprints.map((s) => SPRINT_FILE.exec(s.path)?.[1])].filter(Boolean))];
  const modulePaths = snapshot.paths.filter((path) => MODULE_FILE.test(path)).sort();
  const modules = teams.length < 2 ? []
    : await Promise.all(modulePaths.map(async (path) => readDocument(artifactSchemas().module, path, (await snapshot.read(path)) ?? "")));
  const newest = new Map();
  for (const record of sprints) {
    const [, team, nn] = SPRINT_FILE.exec(record.path);
    if (!newest.has(team) || Number(nn) > Number(newest.get(team).nn)) newest.set(team, { record, nn, name: `${team}/${nn}` });
  }
  items.sort((a, b) => byNumber(idOf(a), idOf(b)));
  const requirements = [...parseSpec((await snapshot.read("SPEC.md")) ?? "").requirements.keys()];
  const reviewed = facts.statuses;
  const useCases = [...reviewed.values()].filter((entry) => entry.kind === "use-case" && entry.status === "accepted").map((entry) => entry.id);
  return { ref, snapshot, facts, declaration, modelFile, model, modelUnread: facts.modelUnread, assignments, sprints, items, modules, teams, newest, requirements, useCases, reviewed };
}

// The pull requests the page derives from, in one listing of all of them (the facts hold it): an item's hold can outlast its sprint, and an item can be done before any sprint ran. Every one
// counts, into whichever branch it was merged: the page derives from the same pull requests as MOD-work-plans.
async function pullRequestsOf(context, ctx) {
  return ctx.facts.pullRequests === "unknown" ? await context.product.host.listPullRequests() : ctx.facts.pullRequests;
}

// The approval statuses MOD-work-plans' itemStates reads: the reviewed files', and each requirement the SPEC holds as accepted.
function statusesOf(ctx) {
  const all = new Map(ctx.reviewed);
  for (const name of ctx.requirements) all.set(name, { id: name, kind: "requirement", status: "accepted" });
  return all;
}

// What the route derives: the pull requests, each item's state and when a done item was merged, what the sprints hold, each team's newest sprint, and each team's last sprint that has
// ended — its newest where that is closed or past its end, else the one before — with its final burn-down.
export async function derivedOf(context, ctx) {
  const pull = await pullRequestsOf(context, ctx);
  const states = itemStates(ctx.items, null, { statuses: statusesOf(ctx), queues: [], jobs: [], pullRequests: pull, gates: [], workflow: null });
  const mergedAt = mergedAtOf(states, pull);
  const held = heldItems(ctx.sprints, ctx.items, ctx.modules, pull);
  const progressOf = (sprints) => {
    if (!ctx.model) return null;
    try {
      return progressIn({ model: ctx.model, modelSince: null, assignments: ctx.assignments, sprints, plan: { order: null, items: ctx.items, states }, pullRequests: pull }, new Date());
    } catch { return null; }
  };
  const progress = progressOf(ctx.sprints);
  const runningRecords = new Set(ctx.teams.map((team) => runningOf(ctx, { progress }, team)).filter(Boolean));
  const ended = progressOf(ctx.sprints.filter((record) => !runningRecords.has(record)));
  const lastEnded = new Map();
  for (const record of ctx.sprints.filter((each) => !runningRecords.has(each))) {
    const [, team, nn] = SPRINT_FILE.exec(record.path);
    if (!lastEnded.has(team) || Number(nn) > Number(lastEnded.get(team).nn)) lastEnded.set(team, { record, nn, name: `${team}/${nn}` });
  }
  return { pull, states, mergedAt, held, progress, ended, lastEnded };
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

function teamPanel(context, ctx, d, team) {
  const running = runningOf(ctx, d, team);
  const last = d.lastEnded.get(team) ?? null;
  const entry = last ? d.ended?.sprints.find((each) => each.team === team) ?? null : null;
  const plan = (label, primary) => `<button class="btn${primary ? " primary" : ""}" data-plan="${h(team)}">${h(label)}</button>`;
  const why = whatIsThis("<p>A team plans, starts and closes sprints of its own (UC-032 step 6). While its sprint runs, the sprint holds the " +
    "items it selected until their change is in the default branch or they go back to the backlog; no other team selects an item " +
    "that changes or uses the same modules. What goes on in a running sprint stands on <a href=\"#progress\">Progress</a>. The chart of a " +
    "team's last sprint that has ended counts its selected items not done yet: at its start, after each merge of one of its items, at " +
    "the time of that merge in UTC, and at its end — derived now from the sprint's record and the pull requests, never stored (book ch. 7 §5).</p>");
  const now = running ? `<p>Its sprint <a href="#progress"><b>${h(ctx.newest.get(team).name)}</b></a> runs: what it holds and how far it is stand on Progress.</p>` : "";
  const lastName = last ? "<b>" + h(last.name) + "</b>" : "";
  const lastEnd = last && text(last.record.fields.end) ? "ended on " + h(text(last.record.fields.end)) : "is closed";
  const lastLine = last ? `<p class="muted">Its last sprint, ${fileLink(context, ctx.ref, last.record.path, lastName)}, ${lastEnd}.</p>`
    : `<p class="muted">${running ? "It has ended no sprint yet." : "It has run no sprint yet."}</p>`;
  const final = last && entry?.final && entry.burnDown.length ? chartBlock(team, last.name, remainingOverTime(entry.items.map((st) => st.item),
    d.mergedAt, text(last.record.fields.start), entry.burnDown.at(-1).day)) : "";
  return `<section class="panel" data-team="${h(team)}"><h3>${h(team)} — ${running ? "a sprint runs" : "no running sprint"}</h3>${now}${lastLine}${final}
    <p>${running ? plan("Change the selection", false) : plan("Plan sprint", true)}</p>${why}</section>`;
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
    return `<tr data-item="${h(id)}"><td data-label="#">${h(at + 1)}</td><td data-label="Item">${fileLink(context, ctx.ref, doc.path, h(id))}</td><td data-label="Title">${h(doc.fields.title ?? "")}</td>
      <td class="small" data-label="Realises">${list(doc.fields.realises).map((name) => `<code>${h(name)}</code>`).join(" ")}</td>
      <td data-label="State">${stateCell(stateOf(d, id))}</td><td class="small" data-label="Held or kept">${marks(ctx, d, doc)}</td></tr>`;
  }).join("");
  return `<section class="panel" data-part="backlog"><h3>The backlog</h3>
    <p class="muted">${h(d.states.length)} items, each after the items it builds on.</p>
    <div class="table-scroll" tabindex="0"><table class="list"><thead><tr><th>#</th><th>Item</th><th>Title</th><th>Realises</th><th>State</th><th>Held or kept</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    ${whatIsThis("<p>The backlog is everything the product is meant to do, one Markdown file per item under <code>docs/backlog/</code> " +
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
    ${whatIsThis("<p>Requirements stand in the SPEC once they are accepted; a use case is accepted when an approval record names its " +
      "current text. Each should be realised by at least one backlog item, or nobody will build it; the Product Owner adds items " +
      "for the names listed here (UC-032 steps 2–4).</p>")}</section>`;
}

// The sprint of `team` that is running, or null.
export function runningOf(ctx, d, team) {
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
    return `<tr data-item="${h(id)}"><td data-label="Select"><input type="checkbox" data-select-item="${h(id)}"${chosen.has(id) ? " checked" : ""}${why ? " disabled" : ""}></td>
      <td data-label="Item">${fileLink(context, ctx.ref, doc.path, h(id))}</td><td data-label="Title">${h(doc.fields.title ?? "")}</td><td data-label="State">${stateCell(st)}</td><td class="small" data-label="Why it cannot be selected">${h(why) || "—"}</td></tr>`;
  }).join("");
  const token = context.product.tokenStored !== false;
  return `<section class="panel" data-plan-team="${h(team)}"><h3>${running ? `Change the selection of ${h(newest.name)}` : `Plan sprint for ${h(team)}`}</h3>
    <p><label>Goal <input data-sprint-goal value="${h(text(running?.fields.goal))}"></label></p>
    <p><label>Start <input type="date" data-sprint-start value="${h(today())}"></label>
      <label>Closed by <input data-sprint-closer value="${h(text(running?.fields.closer) || ownerOf(ctx, team))}"></label></p>
    <div class="table-scroll" tabindex="0"><table class="list"><thead><tr><th>Select</th><th>Item</th><th>Title</th><th>State</th><th>Why it cannot be selected</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <p><button class="btn primary" data-start-sprint="${h(team)}"${token ? "" : " disabled"}>Start sprint</button>
      <button class="btn" data-cancel-plan>Cancel</button></p>
    ${token ? "" : `<p class="muted small">Starting a sprint commits to the product's repository: store a token for it first (<a href="#settings">Settings</a>).</p>`}
    <div data-plan-result></div>
    ${whatIsThis("<p>The Product Owner selects the items the team works on in its sprint (UC-032 step 6). An item another team's " +
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
    return `<tr data-held="${h(each.item)}"><td data-label="Item">${doc ? fileLink(context, ctx.ref, doc.path, h(each.item)) : h(each.item)}</td><td data-label="Title">${h(doc?.fields?.title ?? "")}</td>
      <td data-label="Sprint">${h(each.sprint)}</td><td class="small" data-label="Changes">${each.changes.map(h).join(", ") || "—"}</td><td class="small" data-label="Uses">${each.uses.map(h).join(", ") || "—"}</td></tr>`;
  }).join("");
  return `<section class="panel" data-part="held"><h3>What the other teams' sprints hold</h3>
    ${others.length ? `<div class="table-scroll" tabindex="0"><table class="list"><thead><tr><th>Item</th><th>Title</th><th>Sprint</th><th>Changes</th><th>Uses</th></tr></thead>
      <tbody>${rows}</tbody></table></div>` : `<p class="muted">No other team's sprint holds an item.</p>`}
    ${whatIsThis("<p>A sprint holds the items it selected from its start until their change is merged into the default branch or " +
      "they go back to the backlog — after its close too, while its increment waits on its own branch. While another team's " +
      "sprint holds an item, this team selects neither that item nor one that changes a module the item changes or uses, or " +
      "whose modules use a module it changes: each held item is listed with its sprint, the modules it changes and the modules " +
      "whose interfaces they use, as the modules' files under <code>docs/architecture/</code> name them (UC-032 step 5).</p>")}</section>`;
}

// ---------------------------------------------------------------- the route

// The page read now, with the planning of `team` open (or none).
async function draw(target, context, team = null) {
  const ctx = await contextOf(context);
  const d = await derivedOf(context, ctx);
  await paint(target, context, ctx, d, team);
}

// The page drawn from what was read: a planning opened or cancelled draws it again from `ctx` and `d`, without reading anything.
async function paint(target, context, ctx, d, team) {
  const { model } = ctx;
  const unread = ctx.modelUnread ? `<p class="warn">The model version <code>${h(ctx.modelUnread.commit)}</code> the declaration names cannot be read from the instance (${h(ctx.modelUnread.error)}), so no process model is shown.</p>` : "";
  const noModel = unread || (!ctx.declaration ? `<p class="warn">This product declares no process model yet: <code>docs/process.md</code> names it (UC-002).</p>`
    : !model ? `<p class="warn">The declaration names the model file <code>${h(ctx.modelFile ?? "—")}</code>, which the catalogue does not hold.</p>` : "");
  const planned = model?.kind === "planned" ? `<p class="warn">This product's model plans its work in advance: there is no backlog (UC-032 1b) — its progress is shown on <a href="#progress">Progress</a>.</p>` : "";
  const sprints = model?.flow?.sprints === true;
  const planning = sprints && ctx.teams.includes(team) ? team : null;
  const teamsPart = sprints
    ? (ctx.teams.length ? ctx.teams.map((each) => teamPanel(context, ctx, d, each)).join("")
      : `<section class="panel" data-part="teams"><h3>No team yet</h3><p class="muted">The product's model works in sprints, and no role assignment names a team yet (UC-048).</p>
        ${whatIsThis("<p>Each team of a product has a role assignment under <code>docs/role-assignments/</code>, and plans and runs sprints of its own.</p>")}</section>`)
    : model ? `<section class="panel" data-part="flow"><h3>Work in progress</h3>
        <p>${h(d.states.filter((each) => each.state === "in progress").length)} item(s) in progress${model.flow?.wip ? ` of a limit of ${h(model.flow.wip)}` : ""}.</p>
        ${whatIsThis("<p>The model works without sprints: a ready item is pulled while fewer items are in progress than the work-in-progress limit allows (book ch. 7 §4; UC-032 step 7).</p>")}</section>` : "";
  const where = context.product.address;
  target.innerHTML = `
    <section class="head"><h2>Backlog</h2>
      <p class="muted">${h(where)} · <code>${h(ctx.ref)}</code> · read now from the repository and its pull requests; nothing here is stored.${sprints ? ` What goes on now stands on <a href="#progress">Progress</a>.` : ""}</p>
      ${noModel}${planned}
      ${whatIsThis("<p>First each team: its last sprint that has ended and its final burn-down; then the backlog with the state of each item; " +
        "then what is accepted but realised by no item yet. Everything is derived now from the repository and its pull requests.</p>")}</section>
    ${teamsPart}
    ${planning ? planPanel(context, ctx, d, planning) : ""}
    ${planning && ctx.teams.length > 1 ? heldPanel(context, ctx, d, planning) : ""}
    ${backlogPanel(context, ctx, d)}
    ${uncoveredPanel(ctx)}`;
  await drawCharts(target);

  // Each control is looked up by its own selector — a team's Plan button by its team, an item's tick by its item.
  const again = (next) => paint(target, context, ctx, d, next).catch((failure) => { target.innerHTML = `<p class="warn">${h(failure?.message ?? failure)}</p>`; });
  for (const name of ctx.teams) {
    target.querySelectorAll(`[data-plan="${name}"]`).forEach((button) => button.addEventListener("click", () => again(name)));
  }
  target.querySelectorAll("[data-cancel-plan]").forEach((button) => button.addEventListener("click", () => again(null)));
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
      await draw(target, context);
      target.insertAdjacentHTML?.("afterbegin", `<section class="panel notice flash"><p>${running ? "The selection of" : "Sprint"} <code>${h(result.path)}</code> ${running ? "is changed" : "is started"} — commit ${h(result.commit.slice(0, 7))}.</p></section>`);
    } catch (failure) {
      out.innerHTML = failure?.name === "SprintRefused"
        ? `<p class="warn">The sprint is not started:</p><ul class="small">${(failure.reasons ?? []).map((reason) => `<li>${h(reason)}</li>`).join("")}</ul>`
        : `<p class="warn">${h(failure?.message ?? failure)}</p>`;
    }
  }));
}

export const route = {
  name: "backlog",
  entry: "implementation",
  title: "Backlog",

  async render(target, context, params = {}) {
    await draw(target, context, params?.plan ?? null);
  },
};

// ---------------------------------------------------------------- the board (UC-032 steps 7 and 7a)

const REGISTER = "docs/participants.md";

/** participantsIn(context) -> the participants of the instance's register, read from its default branch. */
export async function participantsIn(context) {
  const { instance } = context;
  const snapshot = await instance.host.readSnapshot((await instance.host.repositoryInfo()).defaultBranch);
  const register = await snapshot.read(REGISTER);
  return register === null ? [] : participantsOf(readDocument(participantSchema(), REGISTER, register));
}

// The role assignment of an item: its team's — the team whose newest running sprint selects it —, else the product's first.
export function assignmentOf(ctx, d, id) {
  for (const team of ctx.teams) {
    const running = runningOf(ctx, d, team);
    if (running && list(running.appended?.filter((section) => section.heading === "## Selection").at(-1)?.fields?.selection ?? running.fields.selection).includes(id)) {
      return { assignment: ctx.assignments.find((each) => ASSIGNMENT_FILE.exec(each.path)?.[1] === team) ?? null, sprint: running, team };
    }
  }
  const first = ctx.assignments[0] ?? null;
  const team = first ? ASSIGNMENT_FILE.exec(first.path)?.[1] : null;
  return { assignment: first, sprint: team ? runningOf(ctx, d, team) : null, team };
}


// The column of an item by its derived state: Done; in progress with a pull request open, Review; in progress otherwise, Doing; any other state, Backlog.
const columnOf = (state) => (state.state === "done" ? "Done" : state.state === "in progress" ? (state.pullRequest ? "Review" : "Doing") : "Backlog");
const COLUMNS = ["Backlog", "Doing", "Review", "Done"];

// The board for a model with a work-in-progress limit: the columns with each item in the column of its derived state; the limit, per team in a model with sprints, naming the items in progress and those that
// wait for review; Pull on a ready item — a link to the route implement with the item selected — only where `startable` lets it start, else disabled with the reasons it gives.
async function drawBoard(target, context) {
  const ctx = await contextOf(context);
  const d = await derivedOf(context, ctx);
  const head = (body) => { target.innerHTML = `<section class="head"><h2>Board</h2>${whatIsThis("<p>The board shows each item in the column of its derived state. A ready item is pulled only while fewer items are in progress than the work-in-progress limit allows; items in review count as in progress (book ch. 7 §4; UC-032 step 7).</p>")}${body}</section>`; };
  const wip = ctx.model?.flow?.wip;
  if (!ctx.declaration || !ctx.model) { head(`<p class="warn">This product declares no process model yet: <code>docs/process.md</code> names it (UC-002).</p>`); return; }
  if (!wip) { head(`<p>This model has no work-in-progress limit, so there is no board: see <a href="#backlog">the backlog</a>.</p>`); return; }
  const participants = await participantsIn(context);
  const workflow = ctx.facts.workflow !== "unknown" ? ctx.facts.workflow : null;
  const ids = ctx.items.map(idOf);
  const verdicts = new Map(ids.map((id) => {
    const { assignment, sprint } = assignmentOf(ctx, d, id);
    return [id, startable(id, d.states, { workflow, assignment, sprint, held: d.held, wip, participants })];
  }));
  const stateOf_ = (id) => d.states.find((each) => each.item === id) ?? { item: id, state: "unknown" };
  const item = (id) => {
    const state = stateOf_(id), verdict = verdicts.get(id);
    const pull = state.state !== "ready" ? "" : verdict.startable ? `<a data-pull="${h(id)}" href="#implement/item=${encodeURIComponent(id)}">Pull</a>`
      : `<button type="button" data-pull="${h(id)}" disabled>Pull</button><ul data-reasons>${verdict.reasons.map((reason) => `<li>${h(reason)}</li>`).join("")}</ul>`;
    return `<li data-item="${h(id)}">${h(id)} ${badge(state.state)} ${pull}</li>`;
  };
  const columns = COLUMNS.map((name) => `<section class="panel" data-column="${name}"><h3>${name}</h3><ul>${ids.filter((id) => columnOf(stateOf_(id)) === name).map(item).join("")}</ul></section>`).join("");
  const teams = ctx.model.flow.sprints === true && ctx.teams.length ? ctx.teams : [null];
  const panels = teams.map((team) => {
    const under = team ? new Set(d.held.filter((entry) => entry.team === team).map((entry) => entry.item)) : null;
    const busy = d.states.filter((each) => each.state === "in progress" && (!under || under.has(each.item)));
    const reviewing = busy.filter((each) => each.pullRequest).map((each) => each.item);
    return `<section class="panel" data-wip${team ? ` data-team="${h(team)}"` : ""}><p>${h(busy.length)} of ${h(wip)} items in progress${team ? ` under ${h(team)}` : ""}${busy.length ? `: ${busy.map((each) => h(each.item)).join(", ")}` : ""}.${reviewing.length ? ` Waiting for review: ${reviewing.map(h).join(", ")}.` : ""}${busy.length >= wip ? " No further item is pulled until one of them is merged." : ""}</p></section>`;
  }).join("");
  head(`${panels}${columns}`);
}

export const boardRoute = {
  name: "board",
  entry: "implementation",
  title: "Board",

  async render(target, context) {
    try {
      await drawBoard(target, context);
    } catch (failure) {
      target.innerHTML = `<section class="panel"><h2>Board</h2><p class="warn">${h(failure?.message ?? failure)}</p></section>`;
    }
  },
};

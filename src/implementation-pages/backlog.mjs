// The route `backlog` — the backlog and the sprints of each team (MOD-implementation-pages, docs/architecture/MOD-implementation-pages.md; Interfaces: backlog; UC-032 steps 1, 5 and 6, UC-033, UC-035): the state of the
// current process first — each team's running sprint, what it holds, the state of each held item and its burn-down, or that the team runs none —, then the backlog, each item after the items it builds on, with its state and, in
// a product with several teams, what keeps it from a team's selection, then the accepted requirements and use cases no item realises yet. *Plan sprint*, for one team, lists what the team may select, and beside it every item
// the other teams' sprints hold, with its sprint and the modules it changes and uses; *Start sprint* commits the team's sprint through MOD-work-plans' startSprint as the person's own commit, on the person's click: the one
// write of this route. Everything else is read from the product's repository and its pull requests and derived when shown; nothing is stored (PROGRESS AND JOB STATE ARE DERIVED, NOT STORED). Every part explains itself
// (EVERY STEP EXPLAINS ITSELF). The layout is the one of the review pages: a head, panels, list tables, buttons and badges — no style of its own; each table stands in a box that scrolls sideways where the page is
// narrower than the table, and the burn-down chart keeps its text the size of the page's body text while it fits its narrow box with fewer visible axis labels — widths and sizes as the site's
// src/theme/lme.css gives them.
//
// Module: MOD-implementation-pages
//
// What a render reads: the facts of the product, which MOD-progress-measures' productFacts gives with the scope `work` — the declaration docs/process.md, the role assignments under docs/role-assignments/, which name the teams,
// every team's sprints under docs/backlog/sprints/<team>/, every item under docs/backlog/, the approval statuses (MOD-approvals' statuses, which read no file), the product's pull requests, and the model the declaration names as the
// instance's catalogue held it at the commit its model_version names; where the facts of the commit are stored they are taken from the store and none of those files is read. Besides: the SPEC, which names the accepted requirements,
// and, in a product with several teams, the architecture's module files — from the stored facts' lists, or from the files. Of the pull requests those into the default branch or into a sprint's branch count. MOD-work-plans decides
// each item's state (itemStates, from the pull requests, the approval statuses and the requirements the SPEC holds), what the sprints hold (heldItems), what keeps an item from a team (conflicts) and how a sprint starts
// (startSprint); MOD-progress-measures derives each team's sprint and its burn-down (progressIn). A model version the instance cannot read is named on the page (modelUnread); the catalogue as it stands now is not used instead.
// Readings the texts leave open, which this file takes: a requirement named in the SPEC is accepted — the approval statuses MOD-work-plans' itemStates reads hold the reviewed files only, so the route adds the SPEC's
// requirements to them; the model is the one productFacts gives, found in the catalogue by the file the declaration names; after Start sprint the route draws itself again, and the frame's host serves the snapshot the commit made.
// The route `sprint/<team>/<n>/close` is not built, so *Give up increment* (UC-041 7b) stands where a closed sprint is shown, in its team's panel here, as *End sprint* does: for each closed sprint of the team whose
// record holds no `## Increment given up` and that still holds an item (heldItems) — its increment is not merged —, with a reason, written through MOD-work-plans' giveUpIncrement as the person's own commit.

import { artifactSchemas, readDocument } from "../documents/index.mjs";
import { renderArtifact, renderMermaid } from "../markdown-render/index.mjs";
import { productFacts, progressIn, storedFacts } from "../progress-measures/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";
import { conflicts, endSprint, giveUpIncrement, heldItems, itemStates, startSprint, startable } from "../work-plans/index.mjs";
import { participantSchema, participantsOf } from "../participant-list/index.mjs";

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

// What the route needs besides the pull requests: the declaration and its model, the teams, their sprints, the items, the modules, and what is accepted. The facts are MOD-progress-measures' productFacts with the scope `work`:
// where the facts of the commit are stored they are taken from the store and none of the files they come from is read; otherwise the files are read in batches. The requirements and the module files, which Facts does not carry,
// come from the stored facts' lists, or from the files.
export async function contextOf(context) {
  const { product, instance } = context;
  // The product's host as productFacts reads it: the branch the page has read, where the caller says which it is (else the default branch the repository reports), and each snapshot read once — the instance's too, where
  // the product is the instance.
  const shots = new Map();
  // A snapshot that asks the branch of the stored facts once, whoever asks.
  const once = (snapshot) => {
    if (typeof snapshot.readOn !== "function") return snapshot;
    const asked = new Map();
    return { ...snapshot, readOn: (branch, path) => { const key = `${branch}\n${path}`; if (!asked.has(key)) asked.set(key, snapshot.readOn(branch, path)); return asked.get(key); } };
  };
  const reading = (host, ref) => {
    const own = Object.create(host);
    const set = (name, value) => Object.defineProperty(own, name, { value, writable: true, configurable: true, enumerable: true });
    if (ref) set("repositoryInfo", async () => ({ defaultBranch: ref }));
    set("readSnapshot", (at) => { if (!shots.has(at)) shots.set(at, host.readSnapshot(at).then(once)); return shots.get(at); });
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
  const stored = await storedFacts(snapshot);
  const modulePaths = snapshot.paths.filter((path) => MODULE_FILE.test(path)).sort();
  const modules = teams.length < 2 ? [] : stored ? stored.modules
    : await Promise.all(modulePaths.map(async (path) => readDocument(artifactSchemas().module, path, (await snapshot.read(path)) ?? "")));
  const newest = new Map();
  for (const record of sprints) {
    const [, team, nn] = SPRINT_FILE.exec(record.path);
    if (!newest.has(team) || Number(nn) > Number(newest.get(team).nn)) newest.set(team, { record, nn, name: `${team}/${nn}` });
  }
  items.sort((a, b) => byNumber(idOf(a), idOf(b)));
  const requirements = stored ? stored.requirements : [...parseSpec((await snapshot.read("SPEC.md")) ?? "").requirements.keys()];
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

// What the route derives: the pull requests, each item's state and when a done item was merged, what the sprints hold, each team's sprint.
export async function derivedOf(context, ctx) {
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

// Give up increment (UC-041 7b): each closed sprint of `team` — its record holds `## Review` and no `## Increment given up` — that still holds an item, its increment not merged, with a field for the reason.
function giveUpPart(ctx, d, team) {
  const holds = (record) => (heading) => (record.appended ?? []).some((section) => section.heading === heading);
  return ctx.sprints.filter((record) => SPRINT_FILE.exec(record.path)?.[1] === team && holds(record)("## Review") && !holds(record)("## Increment given up"))
    .map((record) => {
      const [, , nn] = SPRINT_FILE.exec(record.path);
      const name = `${team}/${nn}`;
      return { record, name, items: d.held.filter((each) => each.sprint === name).map((each) => each.item) };
    })
    .filter((each) => each.items.length)
    .map(({ record, name, items }) => `<div data-increment="${h(name)}"><p>Sprint <b>${h(name)}</b> is closed; its increment${text(record.fields.branch) ? ` on <code>${h(text(record.fields.branch))}</code>` : ""} is not merged,
        and it holds ${items.map(h).join(", ")}.</p>
      <p><label>Reason <input data-give-up-reason="${h(name)}"></label> <button class="btn" data-give-up-increment="${h(name)}">Give up increment</button></p>
      ${explain("<p>A closed sprint holds its done items until its increment is merged into the default branch, so that no other team changes or uses their modules meanwhile (UC-041 7b). " +
        "<em>Give up increment</em> records, with its reason, that the increment is not merged: the sprint then holds none of its items, its done items stay done, and a change to one of them is a new item.</p>")}</div>`)
    .join("");
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
const chartWidth = () => Math.min(burnDownWidth() ?? 700, Math.max(1, (globalThis.innerWidth ?? 700) - 72));

// The Mermaid chart of a sprint's items left over time. Given `width`, it is drawn that wide; given `size`, its title and its axes' labels and titles are drawn at `size` px — both by Mermaid's own configuration of the chart.
function burnDownChart(name, points, { width = null, size = null } = {}) {
  const most = Math.max(1, ...points.map((point) => point.remaining));
  const xAxis = `{ labelFontSize: ${size}, titleFontSize: ${size} }`;
  const yAxis = `{ labelFontSize: ${size}, titleFontSize: ${size} }`;
  const settings = [...(width ? [`    width: ${width}`] : []), ...(size ? [`    titleFontSize: ${size}`, `    xAxis: ${xAxis}`, `    yAxis: ${yAxis}`] : [])];
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
    return `<section class="panel" data-team="${h(team)}"><h3>${h(team)} — no running sprint</h3>${last}${final}${giveUpPart(ctx, d, team)}
      <p>${plan("Plan sprint", true)}</p>${why}</section>`;
  }
  const record = newest.record, f = record.fields;
  const heldOf = new Map(d.held.filter((each) => each.team === team).map((each) => [each.item, each]));
  const rows = entry.items.map((st) => {
    const doc = docOf(ctx, st.item), held = heldOf.get(st.item);
    const changes = held?.changes ?? list(doc?.fields?.modules);
    return `<tr data-item="${h(st.item)}"><td data-label="Item">${doc ? fileLink(context, ctx.ref, doc.path, h(st.item)) : h(st.item)}</td><td data-label="Title">${h(doc?.fields?.title ?? "")}</td>
      <td data-label="State">${stateCell(stateOf(d, st.item))}</td><td class="small" data-label="Changes">${changes.map(h).join(", ") || "—"}</td>
      <td class="small" data-label="Uses">${(held?.uses ?? []).map(h).join(", ") || "—"}</td></tr>`;
  }).join("");
  // Without a time box, and until its record holds `## Ended`, the Product Owner ends the sprint with one click (UC-032 6b).
  const endable = !text(f.end) && !(record.appended ?? []).some((section) => section.heading === "## Ended");
  const chart = entry.burnDown.length ? chartBlock(team, newest.name, remainingOverTime(entry.items.map((st) => st.item), d.mergedAt, text(f.start)))
    : `<p class="muted">No burn-down yet: the sprint starts on ${h(text(f.start))}.</p>`;
  return `<section class="panel" data-team="${h(team)}"><h3>${h(team)} — sprint ${fileLink(context, ctx.ref, record.path, h(newest.name))}</h3>
    <dl class="meta"><dt>Goal</dt><dd>${h(text(f.goal))}</dd><dt>Started</dt><dd>${h(text(f.start))}</dd>
      <dt>Ends</dt><dd>${f.end ? h(text(f.end)) : "when its items are done or the Product Owner ends it — no time box"}</dd>
      <dt>Branch</dt><dd>${f.branch ? `<code>${h(text(f.branch))}</code>` : `none: <code>${h(ctx.ref)}</code>`}</dd><dt>Closed by</dt><dd>${h(text(f.closer))}</dd></dl>
    ${wipLine(ctx, d, entry)}
    <div class="table-scroll" tabindex="0"><table class="list"><thead><tr><th>Item</th><th>Title</th><th>State</th><th>Changes</th><th>Uses</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${chart}${giveUpPart(ctx, d, team)}
    <p>${plan("Change the selection", false)}${endable ? ` <button class="btn" data-end-sprint="${h(team)}">End sprint</button>` : ""}</p>${why}</section>`;
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
    return `<tr data-held="${h(each.item)}"><td data-label="Item">${doc ? fileLink(context, ctx.ref, doc.path, h(each.item)) : h(each.item)}</td><td data-label="Title">${h(doc?.fields?.title ?? "")}</td>
      <td data-label="Sprint">${h(each.sprint)}</td><td class="small" data-label="Changes">${each.changes.map(h).join(", ") || "—"}</td><td class="small" data-label="Uses">${each.uses.map(h).join(", ") || "—"}</td></tr>`;
  }).join("");
  return `<section class="panel" data-part="held"><h3>What the other teams' sprints hold</h3>
    ${others.length ? `<div class="table-scroll" tabindex="0"><table class="list"><thead><tr><th>Item</th><th>Title</th><th>Sprint</th><th>Changes</th><th>Uses</th></tr></thead>
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
  const unread = ctx.modelUnread ? `<p class="warn">The model version <code>${h(ctx.modelUnread.commit)}</code> the declaration names cannot be read from the instance (${h(ctx.modelUnread.error)}), so no process model is shown.</p>` : "";
  const noModel = unread || (!ctx.declaration ? `<p class="warn">This product declares no process model yet: <code>docs/process.md</code> names it (UC-002).</p>`
    : !model ? `<p class="warn">The declaration names the model file <code>${h(ctx.modelFile ?? "—")}</code>, which the catalogue does not hold.</p>` : "");
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
  target.querySelectorAll("[data-end-sprint]").forEach((button) => button.addEventListener("click", async (event) => {
    if (event?.isTrusted === false) return;
    const name = button.dataset?.endSprint ?? button.getAttribute("data-end-sprint");
    const sprint = ctx.newest.get(name)?.name;
    try {
      const result = await endSprint(context.product.host, sprint, { head: ctx.snapshot.commit, now: new Date(), trailers: [] });
      await draw(target, context);
      target.insertAdjacentHTML?.("afterbegin", `<section class="panel notice flash"><p>Sprint <code>${h(sprint)}</code> is ended — commit ${h(result.commit.slice(0, 7))}.</p></section>`);
    } catch (failure) {
      target.insertAdjacentHTML?.("afterbegin", `<section class="panel notice flash"><p class="warn">${h(failure?.message ?? failure)}</p></section>`);
    }
  }));
  target.querySelectorAll("[data-give-up-increment]").forEach((button) => button.addEventListener("click", async (event) => {
    if (event?.isTrusted === false) return;
    const sprint = button.dataset?.giveUpIncrement ?? button.getAttribute("data-give-up-increment");
    const reason = text(target.querySelector(`[data-give-up-reason="${sprint}"]`)?.value).trim();
    if (!reason) {
      target.insertAdjacentHTML?.("afterbegin", `<section class="panel notice flash"><p class="warn">Name why the increment of <code>${h(sprint)}</code> is given up.</p></section>`);
      return;
    }
    try {
      const result = await giveUpIncrement(context.product.host, sprint, reason, { head: ctx.snapshot.commit, trailers: [] });
      await draw(target, context);
      target.insertAdjacentHTML?.("afterbegin", `<section class="panel notice flash"><p>The increment of <code>${h(sprint)}</code> is given up — commit ${h(result.commit.slice(0, 7))}.</p></section>`);
    } catch (failure) {
      target.insertAdjacentHTML?.("afterbegin", `<section class="panel notice flash"><p class="warn">${h(failure?.message ?? failure)}</p></section>`);
    }
  }));
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

const chartDraws = new WeakMap();

function fitChartViewport(chart) {
  const svg = chart.querySelector?.("svg");
  if (!svg?.getBBox || !svg.viewBox?.baseVal) return;
  const bounds = svg.getBBox(), viewport = svg.viewBox.baseVal;
  const left = Math.min(viewport.x, bounds.x), top = Math.min(viewport.y, bounds.y);
  const right = Math.max(viewport.x + viewport.width, bounds.x + bounds.width), bottom = Math.max(viewport.y + viewport.height, bounds.y + bounds.height);
  svg.setAttribute("viewBox", `${left} ${top} ${right - left + 1} ${bottom - top + 1}`);
}

function reducePhoneAxisLabels(chart) {
  const labels = chart.querySelectorAll?.(".left-axis .label text") ?? [];
  [...labels].forEach((label, index) => { if (index % 2) label.setAttribute("display", "none"); });
}

// Each block is redrawn through MOD-markdown-render when its viewport changes, so its requested width and available label
// space describe the viewport it is actually shown in.
async function drawCharts(target) {
  chartDraws.get(target)?.abort();
  const charts = [...target.querySelectorAll("pre > code.language-mermaid")].map((code) => ({ element: code.parentNode, source: code.textContent }));
  const redraw = async () => {
    const width = chartWidth(), phone = (globalThis.innerWidth ?? width) < 600;
    for (const entry of charts) {
      const source = entry.source.replace(/width:\s*\d+/, `width: ${width}`).replace("    width:", phone ? `    height: 250\n    width:` : "    width:");
      const chart = await renderMermaid(source);
      chart.setAttribute("tabindex", "0");
      chart.setAttribute("data-chart-width", String(width));
      entry.element.replaceWith(chart);
      fitChartViewport(chart);
      if (phone) reducePhoneAxisLabels(chart);
      entry.element = chart;
    }
  };
  await redraw();
  const controller = new AbortController();
  chartDraws.set(target, controller);
  globalThis.addEventListener?.("resize", () => { redraw().catch(() => undefined); }, { signal: controller.signal });
}

export const route = {
  name: "backlog",
  entry: "implementation",
  title: "Backlog",

  async render(target, context) {
    await draw(target, context);
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
  const head = (body) => { target.innerHTML = `<section class="head"><h2>Board</h2>${explain("<p>The board shows each item in the column of its derived state. A ready item is pulled only while fewer items are in progress than the work-in-progress limit allows; items in review count as in progress (book ch. 7 §4; UC-032 step 7).</p>")}${body}</section>`; };
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

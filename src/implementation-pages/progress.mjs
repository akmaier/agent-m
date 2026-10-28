// The route `progress` — what goes on now (MOD-implementation-pages, docs/architecture/MOD-implementation-pages.md; Interfaces: progress; UC-035): in a model with sprints, each
// team's running sprint with its goal, start, end, branch and closer, its items with their states and the modules they change and use, and its burn-down; *End sprint* for a running
// sprint without a time box, the one write of this route, on the person's click; for one that has ended, that its review and retrospective are not recorded yet; a team without a running sprint says so, and links its
// planning and the backlog; then the workflow's gates, what is blocked among the items the running sprints hold, and who works on what, each current job linked to its page on the
// job dashboard. For a model without sprints it links the plan, the board or the backlog and names its measure as not drawn here yet. Everything is derived when shown from the
// product's facts with MOD-progress-measures' scope `now` — the running sprints, and the pull requests open or updated since the oldest of them started —; nothing is stored
// (PROGRESS AND JOB STATE ARE DERIVED, NOT STORED). Every part explains itself (EVERY STEP EXPLAINS ITSELF). The layout is the one of the review pages, as the backlog's.
// The burn-down chart stands here, and the backlog draws a team's final burn-down with it.
//
// Module: MOD-implementation-pages
//
// Readings the texts leave open, which this file takes: a running sprint whose time box is over, or that the Product Owner ended, and whose close is not recorded yet has ended: its
// panel says so and draws no chart (the route draws no final burn-down); a job's page on the job dashboard is MOD-main-page's route `job` on the main page, which the
// review pages reach at ../index.html; the item states and the burn-down are those of the facts of the scope `now`, which give each item of a running sprint its state.

import { renderArtifact, renderMermaid } from "../markdown-render/index.mjs";
import { blocked, gateOverview, productFacts, progressIn, whoWorksOnWhat } from "../progress-measures/index.mjs";
import { endSprint } from "../work-plans/index.mjs";

const ITEM_FILE = /^docs\/backlog\/ITM-\d{3,}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const SPRINT_FILE = /^docs\/backlog\/sprints\/([^/]+)\/(\d+)\.md$/;
const ASSIGNMENT_FILE = /^docs\/role-assignments\/([^/]+)\.md$/;
const MODULE_FILE = /^docs\/architecture\/MOD-[^/]+\.md$/;
const GATE_FILE = /^docs\/gates\/[^/]+\.md$/;
const JOB_FILE = /^docs\/jobs\//;

const BADGE = { ready: "b-open", "in progress": "b-changed", done: "b-accepted", blocked: "b-stale",
  "waiting for acceptance": "b-superseded", "waiting for an item it builds on": "b-superseded", unknown: "b-stale",
  passed: "b-accepted", "passed on an earlier text": "b-changed", rejected: "b-stale", pending: "b-open", "not reached": "b-superseded" };

const text = (value) => (typeof value === "string" ? value : value === null || value === undefined ? "" : String(value));
const list = (value) => (Array.isArray(value) ? value.map(text) : text(value).split(",").map((part) => part.trim()).filter(Boolean));
const h = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const whatIsThis = (html) => `<details class="explain"><summary>What is this?</summary><div>${html}</div></details>`;
const idOf = (doc) => text(doc?.id ?? doc?.fields?.id) || /(ITM-\d{3,})/.exec(text(doc?.path))?.[1] || "";
const badge = (state) => `<span class="badge ${BADGE[state] ?? "b-stale"}">${h(state)}</span>`;
const reasonOf = (st) => (st.state === "waiting for acceptance" ? `not accepted: ${st.reason}` : st.state === "waiting for an item it builds on" ? `waits for ${st.reason}` : st.reason);
const stateCell = (st) => `${badge(st.state)}${st.reason ? ` <span class="muted small">${h(reasonOf(st))}</span>` : ""}`;
const fileLink = (context, ref, path, label) => `<a href="${h(`${context.product.address.replace(/\/$/, "")}${context.product.kind === "gitlab" ? "/-" : ""}/blob/${ref.split("/").map(encodeURIComponent).join("/")}/${path.split("/").map(encodeURIComponent).join("/")}`)}" target="_blank" rel="noopener">${label}</a>`;
const planLink = (team, label) => `<a class="btn" href="#backlog/plan=${encodeURIComponent(team)}">${h(label)}</a>`;

// ---------------------------------------------------------------- the burn-down chart

// When each done item was first merged, from the pull requests that name it — in their branch or their title —, as an ISO time.
export function mergedAtOf(states, pullRequests) {
  const mergedAt = new Map();
  for (const st of states) {
    if (st.state !== "done") continue;
    const naming = new RegExp(`(?<![A-Za-z0-9])${st.item}(?![0-9])`, "i");
    const merged = (Array.isArray(pullRequests) ? pullRequests : []).filter((each) => each.state === "merged" && naming.test(`${text(each.branch)} ${text(each.title)}`))
      .map((each) => each.merged).filter((at) => at && Number.isFinite(Date.parse(at))).sort()[0];
    if (merged) mergedAt.set(st.item, new Date(merged).toISOString());
  }
  return mergedAt;
}

// The items a sprint has left over time: at its start, after each merge of one of its items, in time order, and now — or, for a closed sprint, at its end, the last day of its burn-down, after which no merge counts. An item
// merged before the sprint's start is done from the start. A merge is labelled with its time, HH:MM in UTC, or MM-DD HH:MM once a merge falls on another day than the start.
export function remainingOverTime(items, mergedAt, start, end = "") {
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

// The chart as the page places it: MOD-markdown-render's rendering of a Mermaid block, which stays its source until drawCharts draws it once the HTML stands in the page.
export const chartBlock = (team, name, points) => `<div class="md" data-burn-down="${h(team)}">${renderArtifact(`\`\`\`mermaid\n${burnDownChart(name, points, { width: burnDownWidth(), size: bodyTextSize() })}\n\`\`\`\n`).innerHTML}</div>`;

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
export async function drawCharts(target) {
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

// ---------------------------------------------------------------- reading

// The product's facts with the scope `now`, read through the product's host at the branch the page has read where the caller names it (else the default branch the repository
// reports); the instance's snapshot from the same host where the product is the instance.
async function contextOf(context) {
  const { product, instance } = context;
  const host = Object.create(product.host);
  if (product.ref) Object.defineProperty(host, "repositoryInfo", { value: async () => ({ defaultBranch: product.ref }), configurable: true });
  // Each snapshot read once, the instance's too where the product is the instance.
  const shots = new Map();
  Object.defineProperty(host, "readSnapshot", { value: (at) => { if (!shots.has(at)) shots.set(at, product.host.readSnapshot(at)); return shots.get(at); }, configurable: true });
  const ref = product.ref ?? (await product.host.repositoryInfo()).defaultBranch;
  const instanceHost = instance.host === product.host ? host : instance.host;
  const instanceSnapshot = await instanceHost.readSnapshot(instance.host === product.host ? ref : (await instanceHost.repositoryInfo()).defaultBranch);
  const facts = await productFacts(host, instanceSnapshot, (commit) => instanceHost.readSnapshot(commit), new Date(), { scope: "now" });
  const model = facts.model !== null && typeof facts.model === "object" ? facts.model : null;
  const teams = [...new Set([...facts.assignments.map((a) => ASSIGNMENT_FILE.exec(a.path)?.[1]), ...facts.sprints.map((s) => SPRINT_FILE.exec(s.path)?.[1])].filter(Boolean))];
  const running = new Map();
  for (const record of facts.sprints) {
    const [, team, nn] = SPRINT_FILE.exec(record.path);
    if (!running.has(team) || Number(nn) > Number(running.get(team).nn)) running.set(team, { record, nn, name: `${team}/${nn}` });
  }
  let progress = null;
  if (model) {
    try { progress = progressIn(facts, new Date()); } catch { progress = null; }
  }
  return { ref, facts, model, teams, running, progress, states: facts.plan.states };
}

// ---------------------------------------------------------------- the parts

const stateOf = (ctx, id) => ctx.states.find((each) => each.item === id) ?? { item: id, state: "unknown", reason: null };
const docOf = (ctx, id) => ctx.facts.plan.items.find((doc) => idOf(doc) === id) ?? null;

// How many of a team's sprint's items are in progress, against the model's work-in-progress limit, counted per team (UC-032 step 7: in a model with sprints and a limit, both hold).
function wipLine(ctx, entry) {
  const wip = ctx.model?.flow?.wip;
  if (!wip) return "";
  const busy = entry.items.filter((st) => stateOf(ctx, st.item).state === "in progress").map((st) => st.item);
  return `<p>${h(busy.length)} of ${h(wip)} items in progress${busy.length ? `: ${busy.map(h).join(", ")}` : ""}.${busy.length >= wip
    ? " No further item starts until one of them is merged." : ""}</p>`;
}

const WHY_SPRINT = whatIsThis("<p>A team plans, starts and closes sprints of its own (UC-032 step 6). While its sprint runs, the sprint holds the " +
  "items it selected until their change is in the default branch or they go back to the backlog; no other team selects an item " +
  "that changes or uses the same modules. The chart counts the selected items not done yet: at the sprint's start, after each " +
  "merge of one of its items, at the time of that merge in UTC, and now — derived now from the sprint's record and the pull requests " +
  "opened or updated since it started, never stored. A burn-down that stays flat means that nothing is merged (book ch. 7 §5, ch. 15).</p>");

function teamPanel(context, ctx, team) {
  const running = ctx.running.get(team) ?? null;
  const entry = ctx.progress?.sprints.find((each) => each.team === team) ?? null;
  if (!running || !entry) {
    return `<section class="panel" data-team="${h(team)}"><h3>${h(team)} — no running sprint</h3>
      <p class="muted">Its last sprint, and its final burn-down, stand on <a href="#backlog">the backlog</a>.</p>
      <p>${planLink(team, "Plan sprint")}</p>${WHY_SPRINT}</section>`;
  }
  const record = running.record, f = record.fields;
  const heldOf = new Map(ctx.facts.held.filter((each) => each.team === team).map((each) => [each.item, each]));
  const rows = entry.items.map((st) => {
    const doc = docOf(ctx, st.item), held = heldOf.get(st.item);
    const changes = held?.changes ?? list(doc?.fields?.modules);
    return `<tr data-item="${h(st.item)}"><td data-label="Item">${doc ? fileLink(context, ctx.ref, doc.path, h(st.item)) : h(st.item)}</td><td data-label="Title">${h(doc?.fields?.title ?? "")}</td>
      <td data-label="State">${stateCell(stateOf(ctx, st.item))}</td><td class="small" data-label="Changes">${changes.map(h).join(", ") || "—"}</td>
      <td class="small" data-label="Uses">${(held?.uses ?? []).map(h).join(", ") || "—"}</td></tr>`;
  }).join("");
  const ended = text(f.end) || text((record.appended ?? []).find((section) => section.heading === "## Ended")?.fields?.at);
  // A sprint whose time box is over, or that the Product Owner ended, waits for its closer, who closes it in a session of their own (UC-041): no chart (UC-032 6b).
  const close = entry.final ? `<p class="muted">It ended on ${h(ended)}; its review and retrospective are not recorded yet.</p>` : "";
  const endable = !entry.final && !text(f.end) && !(record.appended ?? []).some((section) => section.heading === "## Ended");
  const chart = entry.final ? "" : entry.burnDown.length ? chartBlock(team, running.name, remainingOverTime(entry.items.map((st) => st.item), mergedAtOf(ctx.states, ctx.facts.pullRequests), text(f.start)))
    : `<p class="muted">No burn-down yet: the sprint starts on ${h(text(f.start))}.</p>`;
  return `<section class="panel" data-team="${h(team)}"><h3>${h(team)} — sprint ${fileLink(context, ctx.ref, record.path, h(running.name))}</h3>
    <dl class="meta"><dt>Goal</dt><dd>${h(text(f.goal))}</dd><dt>Started</dt><dd>${h(text(f.start))}</dd>
      <dt>Ends</dt><dd>${f.end ? h(text(f.end)) : "when its items are done or the Product Owner ends it — no time box"}</dd>
      <dt>Branch</dt><dd>${f.branch ? `<code>${h(text(f.branch))}</code>` : `none: <code>${h(ctx.ref)}</code>`}</dd><dt>Closed by</dt><dd>${h(text(f.closer))}</dd></dl>
    ${wipLine(ctx, entry)}
    <div class="table-scroll" tabindex="0"><table class="list"><thead><tr><th>Item</th><th>Title</th><th>State</th><th>Changes</th><th>Uses</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${chart}${close}
    <p>${entry.final ? "" : planLink(team, "Change the selection")}${endable ? ` <button class="btn" data-end-sprint="${h(team)}">End sprint</button>` : ""}</p>${WHY_SPRINT}</section>`;
}

function gatesPanel(ctx) {
  const gates = gateOverview(ctx.facts);
  const rows = gates.map((gate) => `<tr><td data-label="Gate">${h(gate.gate)}${gate.addedBy ? ` <span class="muted small">added by ${h(gate.addedBy.requirement)} (${h(gate.addedBy.source)})</span>` : ""}</td>
    <td data-label="State">${badge(gate.state)}</td>
    <td class="small" data-label="Decided">${gate.decided ? `${h(gate.decided.by)}, ${h(gate.decided.date)}, on ${h(gate.decided.on)}` : "—"}</td>
    <td class="small" data-label="Needs">${h(gate.needs ?? gate.difference ?? "") || "—"}</td></tr>`).join("");
  return `<section class="panel" data-part="gates"><h3>Gates</h3>
    ${gates.length ? `<div class="table-scroll" tabindex="0"><table class="list"><thead><tr><th>Gate</th><th>State</th><th>Decided</th><th>Needs</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : `<p class="muted">The workflow names no gate, or it could not be read.</p>`}
    ${whatIsThis("<p>The gates of the product's workflow in their order: passed, with who decided, when and on which text; pending, with what it " +
      "still needs; not reached. A gate whose record names a text that has changed since counts as passed on an earlier text only " +
      "(UC-035 step 3; THE GATE IS RECORDED).</p>")}</section>`;
}

function blockedPanel(ctx) {
  const held = new Set((ctx.progress?.sprints ?? []).filter((entry) => ctx.running.has(entry.team)).flatMap((entry) => entry.items.map((st) => st.item)));
  const found = blocked(ctx.facts).filter((entry) => held.has(entry.item));
  return `<section class="panel" data-part="blocked"><h3>Blocked</h3>
    ${found.length ? `<ul class="small">${found.map((entry) => `<li data-blocked="${h(entry.item)}"><b>${h(entry.item)}</b> — ${h(entry.reason)}: ${h(entry.detail)}</li>`).join("")}</ul>`
      : `<p class="muted">No item a running sprint holds is blocked.</p>`}
    ${whatIsThis("<p>Every item a running sprint holds that cannot move, with its reason: a failed job, a job waiting at a gate, a requirement " +
      "not yet accepted, the team's work-in-progress limit, or another team's sprint that holds a module it needs (UC-035 step 4).</p>")}</section>`;
}

// The page of a job on the job dashboard: MOD-main-page's route `job`, on the main page; the product named where it is not the instance.
function jobHref(context, id) {
  const product = context.product?.address;
  const own = product === `https://github.com/${context.instance?.repository}`;
  const fragment = `#job/id=${encodeURIComponent(id)}${product && !own ? `/product=${encodeURIComponent(product)}` : ""}`;
  return `${context.page === "main" ? "" : "../index.html"}${fragment}`;
}

function whoPanel(context, ctx) {
  const who = whoWorksOnWhat(ctx.facts);
  const several = ctx.teams.length > 1;
  const rows = who.participants.map((entry) => `<tr><td data-label="Participant">${h(entry.participant)}</td><td class="small" data-label="Roles">${entry.roles.map(h).join(", ")}</td>
    ${several ? `<td class="small" data-label="Teams">${entry.teams.map(h).join(", ") || "—"}</td>` : ""}
    <td class="small" data-label="Current jobs">${entry.jobs.map((id) => `<a href="${h(jobHref(context, id))}">${h(id)}</a>`).join(", ") || "—"}</td></tr>`).join("");
  const missing = who.unreachable.length ? `<p class="warn small">Not reached: ${who.unreachable.map((each) => `${h(each.route)}${each.reason ? ` (${h(each.reason)})` : ""}`).join("; ")} — jobs running there are not shown.</p>` : "";
  return `<section class="panel" data-part="who"><h3>Who works on what</h3>
    ${who.participants.length ? `<div class="table-scroll" tabindex="0"><table class="list"><thead><tr><th>Participant</th><th>Roles</th>${several ? "<th>Teams</th>" : ""}<th>Current jobs</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : `<p class="muted">No role assignment names a participant yet.</p>`}${missing}
    ${whatIsThis("<p>Each participant of the product with its roles — and its team, with several teams — and the jobs it works on now, each " +
      "linked to its page on the job dashboard, where its log, cost and state stand (UC-035 step 5, UC-036).</p>")}</section>`;
}

// For a model without sprints, where its progress stands instead.
function elsewhere(ctx) {
  const where = ctx.model.kind === "planned" ? ["plan", "the implementation plan"] : ctx.model.flow?.wip ? ["board", "the board"] : ["backlog", "the backlog"];
  return `<section class="panel" data-part="measure"><h3>${h(ctx.model.measure ?? "Progress")}</h3>
    <p>Progress in this model's measure, ${h(ctx.model.measure ?? "its own")}, is not drawn here yet: see <a href="#${where[0]}">${h(where[1])}</a>.</p>
    ${whatIsThis("<p>Each process model names the measure its progress is shown in: plan entries per phase, remaining items per time box, " +
      "or items per state over time (UC-035; book ch. 15 §2–3).</p>")}</section>`;
}

// ---------------------------------------------------------------- the route

async function draw(target, context) {
  const ctx = await contextOf(context);
  const { model } = ctx;
  const unread = ctx.facts.modelUnread ? `<p class="warn">The model version <code>${h(ctx.facts.modelUnread.commit)}</code> the declaration names cannot be read from the instance (${h(ctx.facts.modelUnread.error)}), so no process model is shown.</p>` : "";
  const noModel = unread || (!ctx.facts.declaration ? `<p class="warn">This product declares no process model yet: <code>docs/process.md</code> names it (UC-002).</p>`
    : !model ? `<p class="warn">The declaration names the model file <code>${h(text(ctx.facts.declaration.fields?.model_file) || "—")}</code>, which the catalogue does not hold.</p>` : "");
  const sprints = model?.flow?.sprints === true;
  const teamsPart = !model ? "" : !sprints ? elsewhere(ctx)
    : ctx.teams.length ? ctx.teams.map((team) => teamPanel(context, ctx, team)).join("")
      : `<section class="panel" data-part="teams"><h3>No team yet</h3><p class="muted">The product's model works in sprints, and no role assignment names a team yet (UC-048).</p>
        ${whatIsThis("<p>Each team of a product has a role assignment under <code>docs/role-assignments/</code>, and plans and runs sprints of its own.</p>")}</section>`;
  target.innerHTML = `
    <section class="head"><h2>Progress</h2>
      <p class="muted">${h(context.product.address)} · <code>${h(ctx.ref)}</code> · what goes on now, read now from the repository and the pull requests open or updated since the oldest running sprint started; nothing here is stored. <a href="#backlog">The backlog</a> keeps every item and each team's last ended sprint.</p>
      ${noModel}
      ${whatIsThis("<p>What goes on now: each team's running sprint, its items and how far it is; the gates; what is blocked; who works on " +
        "what. Everything is derived now from the repository and its pull requests (UC-035).</p>")}</section>
    ${teamsPart}
    ${model ? `${gatesPanel(ctx)}${sprints ? blockedPanel(ctx) : ""}${whoPanel(context, ctx)}` : ""}`;
  await drawCharts(target);

  target.querySelectorAll("[data-end-sprint]").forEach((button) => button.addEventListener("click", async (event) => {
    if (event?.isTrusted === false) return;
    const name = button.dataset?.endSprint ?? button.getAttribute("data-end-sprint");
    const sprint = ctx.running.get(name)?.name;
    try {
      const result = await endSprint(context.product.host, sprint, { head: ctx.facts.snapshot.commit, now: new Date(), trailers: [] });
      await draw(target, context);
      target.insertAdjacentHTML?.("afterbegin", `<section class="panel notice flash"><p>Sprint <code>${h(sprint)}</code> is ended — commit ${h(result.commit.slice(0, 7))}.</p></section>`);
    } catch (failure) {
      target.insertAdjacentHTML?.("afterbegin", `<section class="panel notice flash"><p class="warn">${h(failure?.message ?? failure)}</p></section>`);
    }
  }));
}

export const route = {
  name: "progress",
  entry: "implementation",
  title: "Progress",

  // The first wave the page reads: every file the facts of the scope `now` read from the product — the declaration, the SPEC, the items, the sprints, the role assignments, the gate
  // records, the module files and the job records.
  async reads(params, snapshot) {
    const named = [ITEM_FILE, SPRINT_FILE, ASSIGNMENT_FILE, GATE_FILE, MODULE_FILE, JOB_FILE];
    return ["docs/process.md", "SPEC.md", ...snapshot.paths.filter((path) => named.some((pattern) => pattern.test(path)))].filter((path) => snapshot.paths.includes(path));
  },

  async render(target, context) {
    await draw(target, context);
  },
};

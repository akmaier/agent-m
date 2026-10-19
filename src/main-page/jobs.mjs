// jobs.mjs — the route `jobs` (docs/architecture/MOD-main-page.md, Parts and Interfaces: `jobs`): every job of every product and of the instance in one list, with the job of this
// tab's conversation among them, waiting at a gate first, filtered by product, state, participant or where it runs; a source that cannot be read is named above the list with its reason.
// It also draws the route `job`: one job's inputs, log, cost and the gate it waits at (Interfaces: `job`).
//
// Module: MOD-main-page
//
// ONE DASHBOARD SHOWS EVERY JOB; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; NO COST IS GUESSED. The page computes no state, no elapsed time and no cost of a record: listJobs derives them
// (MOD-job-ledger) from the records and from the live state each job's runtime reports (MOD-runtimes), asked once when the list is drawn. It stores nothing. It reads each repository through
// the host the frame connected for it — the instance's from the ViewContext, a product's by MOD-site-frame's chosenProduct, with its own token and the stored secrets the host refuses to write — and sends no
// token anywhere else (MOD-repository-hosts). Uses MOD-site-frame, MOD-browser-store, MOD-bridge-client, MOD-repository-hosts, MOD-job-ledger, MOD-runtimes and MOD-prompt-bar only through their index.mjs.
//
// How a list is drawn: each source's default branch is read; listJobs reads the records once (without live states) to name the jobs whose record has no end; each of those is asked once with
// liveState, and listJobs derives the rows again with what was reported — the records are not fetched twice, since a snapshot reads a file once. A Bridge handle is made as the prompt bar and
// the review pages make one (settingsOf with the stored jump host, then bridgeAt), since a Bridge kept at a port of the jump host has no address of its own.

import { readSetting } from "../browser-store/index.mjs";
import { bridgeAt, settingsOf } from "../bridge-client/index.mjs";
import { parseAddress } from "../repository-hosts/index.mjs";
import { chosenProduct } from "../site-frame/index.mjs";
import { listJobs } from "../job-ledger/index.mjs";
import { liveState, jobLog } from "../runtimes/index.mjs";
import { currentJob } from "../prompt-bar/index.mjs";
import { el, clock } from "./cards.mjs";

// The sources, each with the host the frame connected: the instance's own (the ViewContext's), then each address of the setting `products` that parses, once, through MOD-site-frame's chosenProduct,
// which connects it with its own token to its own server only and with the stored secrets the host refuses to write. A product the frame cannot connect is { address, reason }.
export async function sourcesOf(context) {
  const { store, instance } = context;
  const own = parseAddress(`https://github.com/${instance.repository}`).web;
  const seen = new Set([own]);
  const sources = [{ address: own, host: instance.host }];
  for (const text of readSetting(store, "products") ?? []) {
    let web;
    try { web = parseAddress(text).web; } catch { continue; /* an address that is none names no source */ }
    if (seen.has(web)) continue;
    seen.add(web);
    try { sources.push({ address: web, host: (await chosenProduct({ store, fragment: `#jobs/product=${encodeURIComponent(web)}` })).host }); } catch (failure) { sources.push({ address: web, reason: String(failure?.message ?? failure) }); }
  }
  return sources;
}

// One source read: its default branch as a snapshot. A source that fails is { address, reason }.
async function readSource({ address, host, reason }) {
  if (reason !== undefined) return { address, reason };
  try {
    const { defaultBranch } = await host.repositoryInfo();
    return { address, host, snapshot: await host.readSnapshot(defaultBranch) };
  } catch (failure) {
    return { address, reason: String(failure?.message ?? failure) };
  }
}

// A handle for each Bridge a record's `by:` names that this browser keeps under `bridge:<name>`; a name it does not keep, or cannot reach through the jump host, has none.
export function bridgesOf(rows, store) {
  const bridges = {};
  for (const { record } of rows) {
    const name = record.taken?.by;
    if (record.end || !name || Object.hasOwn(bridges, name)) continue;
    try {
      const stored = readSetting(store, `bridge:${name}`);
      if (stored) bridges[name] = bridgeAt(settingsOf({ name, ...stored }, readSetting(store, "jump-host")));
    } catch { /* not a Bridge's name, or no jump host: the live state then says why it is not reachable */ }
  }
  return bridges;
}

// The live state of each job whose record has no end and whose source was read, asked once at its runtime: a Map from the job's identifier. A failure is the state `reachable: false` with its reason.
export async function liveStatesOf(rows, hostOf, bridges) {
  const lives = new Map();
  await Promise.all(rows.filter((row) => !row.record.end && row.source.reachable).map(async (row) => {
    try { lives.set(row.record.id, await liveState(row.record, { host: hostOf.get(row.product) }, bridges)); } catch (failure) {
      lives.set(row.record.id, { reachable: false, reason: String(failure?.message ?? failure), known: false });
    }
  }));
  return lives;
}

const costText = (cost) => (cost.known ? `${cost.amount} ${cost.currency}` : "unknown");

// The rows of the list as the page shows them: a JobRow of MOD-job-ledger, with what its live state says; the job of this tab's conversation after the rows that wait at a gate.
function shownRow(row, lives) {
  const live = lives.get(row.record.id) ?? null;
  return {
    id: row.record.id, product: row.product, works: row.record.worksOn.join(", "), kind: row.record.kind ?? "", participant: row.record.participant ?? "",
    runs: row.record.taken?.by ?? "not taken", state: row.state, elapsed: clock(row.elapsed), cost: costText(row.cost),
    reason: live && !live.reachable ? `not reachable: ${live.reason}` : !row.source.reachable ? `could not be read: ${row.source.reason}` : null,
  };
}
function listOf(jobRows, lives) {
  const shown = jobRows.map((row) => shownRow(row, lives));
  const tab = currentJob();
  if (tab !== null) {
    const waiting = shown.filter((row) => row.state === "waiting at a gate").length;
    shown.splice(waiting, 0, { tab: true, id: "", product: "", works: "", kind: tab.kind, participant: tab.participant, runs: "this tab", state: "running",
      elapsed: clock((Date.now() - tab.started.getTime()) / 1000), cost: "unknown", reason: null });
  }
  return shown;
}

const FILTERS = [["product", "Product"], ["state", "State"], ["participant", "Participant"], ["runs", "Where it runs"]];

// The groups of the list, in the order of the states of MOD-job-ledger's JobState with the jobs that wait at a gate first (UC-036 step 2).
const GROUPS = ["waiting at a gate", "running", "queued", "done", "failed", "cancelled", "ended without record"];
const place = (row) => (GROUPS.includes(row.state) ? GROUPS.indexOf(row.state) : GROUPS.length);

function drawList(rows, go) {
  const chosen = {};
  const body = el("tbody");
  const draw = () => body.replaceChildren(...rows.filter((row) => FILTERS.every(([key]) => !chosen[key] || row[key] === chosen[key])).sort((a, b) => place(a) - place(b)).flatMap((row, at, shown) => {
    const line = el("tr", row.tab ? "job this-tab" : "job");
    if (!row.tab) line.setAttribute("data-id", row.id);
    const state = el("td", "state", row.state);
    if (row.reason) state.append(" ", el("span", "reason", row.reason));
    const open = el("button", "job-link", row.id);
    open.setAttribute("type", "button");
    open.addEventListener("click", () => go("job", { id: row.id, product: row.product }));
    line.append(el("td", "id", ...(row.tab ? ["this tab's"] : [open])), el("td", "product", row.product || "—"), el("td", "works-on", row.works), el("td", "kind", row.kind),
      el("td", "participant", row.participant || "—"), el("td", "runs", row.runs), state, el("td", "elapsed", row.elapsed), el("td", "cost", row.cost));
    if (at > 0 && shown[at - 1].state === row.state) return [line];
    const name = el("th", "group-state", row.state);
    name.setAttribute("colspan", "9");
    const header = el("tr", "group", name);
    header.setAttribute("data-state", row.state);
    return [header, line];
  }));
  const filters = el("p", "filters");
  for (const [key, label] of FILTERS) {
    const select = el("select", "filter");
    select.setAttribute("data-filter", key);
    const all = el("option", null, "all");
    all.value = "";
    select.append(all);
    for (const value of [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort()) {
      const option = el("option", null, value);
      option.value = value;
      select.append(option);
    }
    select.addEventListener("change", () => { chosen[key] = select.value; draw(); });
    filters.append(el("label", null, `${label} `, select), " ");
  }
  draw();
  const head = el("tr", null, ...["Job", "Product", "Works on", "Kind", "Participant", "Where it runs", "State", "Elapsed", "Cost"].map((text) => el("th", null, text)));
  return [filters, el("table", "jobs", el("thead", null, head), body)];
}

// Every job of every source, read once: the JobRows of MOD-job-ledger with the live state each runtime reported, the sources that could not be read, and what a job's log needs.
async function everyJob(context) {
  const sources = await Promise.all((await sourcesOf(context)).map(readSource));
  const readable = sources.filter((source) => source.snapshot);
  const products = readable.map(({ address, snapshot }) => ({ address, snapshot }));
  const first = await listJobs(products, new Map());
  const bridges = bridgesOf(first, context.store);
  const hostOf = new Map(readable.map((source) => [source.address, source.host]));
  const lives = await liveStatesOf(first, hostOf, bridges);
  return { jobRows: await listJobs(products, lives), lives, bridges, hostOf, unreadable: sources.filter((source) => source.reason) };
}
const unreadableList = (unreadable) => (unreadable.length ? [el("ul", "unreadable", ...unreadable.map((source) => el("li", "source", `${source.address}: ${source.reason}`)))] : []);

async function render(target, context) {
  target.replaceChildren(el("h2", null, "Every job"), el("p", "reading", "Reading…"));
  const { jobRows, lives, unreadable } = await everyJob(context);
  target.replaceChildren(el("h2", null, "Every job"), ...unreadableList(unreadable), ...drawList(listOf(jobRows, lives), context.go));
}

/**
 * jobs: Route — { name: "jobs", entry: null, title: "Every job", render }; the frame's default subject.
 */
export const jobs = { name: "jobs", entry: null, title: "Every job", render };

// ---------------------------------------------------------------- one job

const usageText = (usage) => [usage.inputTokens != null && `${usage.inputTokens} input tokens`, usage.outputTokens != null && `${usage.outputTokens} output tokens`,
  usage.minutes != null && `${usage.minutes} minutes`].filter(Boolean).join(", ");
// NO COST IS GUESSED: the amount only where the runtime or the declared price made one known; else the usage that was reported, with its price unknown; else unknown.
function costLine(cost) {
  if (cost.known) return `${cost.amount} ${cost.currency} (${cost.basis})`;
  const usage = cost.usage ? usageText(cost.usage) : "";
  return usage ? `${usage} · price unknown` : "unknown";
}

function link(className, address, text) {
  const anchor = el("a", className, text);
  anchor.setAttribute("href", address);
  anchor.setAttribute("target", "_blank");
  anchor.setAttribute("rel", "noopener");
  return anchor;
}

// The log, drawn into `box` as the runtime gives it: a Bridge's lines one after another while the page is shown, a CI run's by its address, else the sentence that the runtime keeps none.
async function drawLog(box, page, row, { hostOf, bridges }) {
  const gone = () => box.append(el("p", "log-gone", "The runtime keeps no log for this job any more."), ...(row.record.end?.log ? [el("p", null, "Recorded at its end: ", link("record-link", row.record.end.log, row.record.end.log))] : []));
  try {
    const log = await jobLog(row.record, { host: hostOf.get(row.product) }, bridges);
    if (log.address) box.append(link("log-link", log.address, "Open the log of the run"));
    else if (log.gone) gone();
    else {
      const lines = [], shown = el("pre", "job-log-lines");
      box.append(shown);
      for await (const line of log.stream) {
        if (page.parentNode === null) return; // the page was left: the stream is not followed any more
        lines.push(line);
        shown.textContent = lines.join("\n");
      }
    }
  } catch (failure) {
    box.append(el("p", "warn log-problem", `The log could not be read: ${String(failure?.message ?? failure)}`));
  }
}

async function renderJob(target, context, params) {
  target.replaceChildren(el("h2", null, "Job"), el("p", "reading", "Reading…"));
  const read = await everyJob(context);
  let product = params.product ?? null;
  if (product !== null) { try { product = parseAddress(product).web; } catch { /* the address as given */ } }
  const held = read.jobRows.find(({ record, product: at }) => record.id === params.id && (product === null || at === product));
  if (held === undefined) {
    target.replaceChildren(el("h2", null, "Job"), ...unreadableList(read.unreadable), el("p", "job-missing", `No job ${params.id} in the instance or in the products this browser keeps.`));
    return;
  }
  const { record } = held, row = shownRow(held, read.lives);
  const page = el("section", "job-page", el("h2", null, `Job ${row.id}`),
    el("p", "job-facts", [row.product, row.works, row.kind, row.participant, row.runs, row.state, row.elapsed].join(" · ")));
  if (record.inputs.length) page.append(el("h3", null, "Inputs"), el("ul", "job-inputs", ...record.inputs.map((input) => el("li", "job-input", input))));
  if (record.destinations.length) page.append(el("ul", "job-destinations", ...record.destinations.map(({ participant, place, parts }) => el("li", "job-destination", `${participant}, at ${place}: ${parts.join(", ")}.`))));
  if (Object.keys(record.params).length) page.append(el("h3", null, "Parameters"), el("pre", "job-params", JSON.stringify(record.params, null, 2)));
  const gate = row.state === "waiting at a gate" ? record.gates.findLast((reached) => reached.resumedBy === null) : undefined;
  if (gate) {
    page.append(el("p", "job-gate", "Waiting at the gate ", el("span", "gate-name", gate.gate), ", decided by ", el("span", "gate-decider", gate.decider),
      ...(/^check:/.test(gate.decider) ? [" — ", el("span", "gate-self", "decides by itself")] : [])));
  }
  page.append(el("h3", null, "Cost"), el("p", "job-cost", costLine(held.cost)));
  const log = el("div", "job-log");
  page.append(el("h3", null, "Log"), log);
  target.replaceChildren(el("h2", null, "Job"), ...unreadableList(read.unreadable), page);
  drawLog(log, page, held, read); // not awaited: the page stands while the log follows its runtime
}

/**
 * job: Route — { name: "job", entry: null, title: "Job", render }; `params.id` names the job, `params.product` (where given) the product that holds it.
 */
export const job = { name: "job", entry: null, title: "Job", render: (target, context, params) => renderJob(target, context, params) };

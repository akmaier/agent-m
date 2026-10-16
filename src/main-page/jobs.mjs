// jobs.mjs — the route `jobs` (docs/architecture/MOD-main-page.md, Parts and Interfaces: `jobs`): every job of every product and of the instance in one list, with the job of this
// tab's conversation among them, waiting at a gate first, filtered by product, state, participant or where it runs; a source that cannot be read is named above the list with its reason.
//
// Module: MOD-main-page
//
// ONE DASHBOARD SHOWS EVERY JOB; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; NO COST IS GUESSED. The page computes no state, no elapsed time and no cost of a record: listJobs derives them
// (MOD-job-ledger) from the records and from the live state each job's runtime reports (MOD-runtimes), asked once when the list is drawn. It stores nothing. It reads each repository through
// the host connected with the token this browser keeps for it, and sends no token anywhere else (MOD-repository-hosts). Uses MOD-browser-store, MOD-bridge-client, MOD-repository-hosts,
// MOD-job-ledger, MOD-runtimes and MOD-prompt-bar only through their index.mjs.
//
// How a list is drawn: each source's default branch is read; listJobs reads the records once (without live states) to name the jobs whose record has no end; each of those is asked once with
// liveState, and listJobs derives the rows again with what was reported — the records are not fetched twice, since a snapshot reads a file once. A Bridge handle is made as the prompt bar and
// the review pages make one (settingsOf with the stored jump host, then bridgeAt), since a Bridge kept at a port of the jump host has no address of its own.

import { readSetting } from "../browser-store/index.mjs";
import { bridgeAt, settingsOf } from "../bridge-client/index.mjs";
import { parseAddress, connect } from "../repository-hosts/index.mjs";
import { listJobs } from "../job-ledger/index.mjs";
import { liveState } from "../runtimes/index.mjs";
import { currentJob } from "../prompt-bar/index.mjs";

const el = (name, className, ...children) => {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
};

// The key a repository's own token is kept under (MOD-browser-store, Data): `github-token:<owner>/<repository>` or `gitlab-token:<server>/<project>`; the instance's is `github-token`.
const tokenKeyOf = (address) => (address.server === "gitlab" ? `gitlab-token:${new URL(address.origin).host}/${address.path}` : `github-token:${address.path}`);

// The sources, each connected with the token this browser keeps for it: the instance, then each address of the setting `products` that parses, once.
function sourcesOf(context) {
  const { store, instance } = context;
  const asked = [{ address: parseAddress(`https://github.com/${instance.repository}`), key: "github-token" }];
  for (const text of readSetting(store, "products") ?? []) {
    try { asked.push({ address: parseAddress(text), key: null }); } catch { /* an address that is none names no source */ }
  }
  const seen = new Set();
  return asked.filter(({ address }) => !seen.has(address.web) && seen.add(address.web)).map(({ address, key }) => {
    const token = readSetting(store, key ?? tokenKeyOf(address));
    return { address, token };
  });
}

// One source read: its host, and its default branch as a snapshot. A source that fails is { address, reason }.
async function readSource({ address, token }) {
  try {
    const host = connect(address, { token: token?.value ?? null, tokenName: token?.name ?? null });
    const { defaultBranch } = await host.repositoryInfo();
    return { address: address.web, host, snapshot: await host.readSnapshot(defaultBranch) };
  } catch (failure) {
    return { address: address.web, reason: String(failure?.message ?? failure) };
  }
}

// A handle for each Bridge a record's `by:` names that this browser keeps under `bridge:<name>`; a name it does not keep, or cannot reach through the jump host, has none.
function bridgesOf(rows, store) {
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

// The elapsed time in hours, minutes and seconds.
const clock = (seconds) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 3600)}h ${Math.floor((whole % 3600) / 60)}m ${whole % 60}s`;
};

const costText = (cost) => (cost.known ? `${cost.amount} ${cost.currency}` : "unknown");

// The rows of the list as the page shows them: a JobRow of MOD-job-ledger, with what its live state says; the job of this tab's conversation after the rows that wait at a gate.
function listOf(jobRows, lives) {
  const shown = jobRows.map((row) => {
    const live = lives.get(row.record.id) ?? null;
    return {
      id: row.record.id, product: row.product, works: row.record.worksOn.join(", "), kind: row.record.kind ?? "", participant: row.record.participant ?? "",
      runs: row.record.taken?.by ?? "not taken", state: row.state, elapsed: clock(row.elapsed), cost: costText(row.cost),
      reason: !row.source.reachable ? `could not be read: ${row.source.reason}` : live && !live.reachable ? `not reachable: ${live.reason}` : null,
    };
  });
  const tab = currentJob();
  if (tab !== null) {
    const waiting = shown.filter((row) => row.state === "waiting at a gate").length;
    shown.splice(waiting, 0, { tab: true, id: "", product: "", works: "", kind: tab.kind, participant: tab.participant, runs: "this tab", state: "running",
      elapsed: clock((Date.now() - tab.started.getTime()) / 1000), cost: "unknown", reason: null });
  }
  return shown;
}

const FILTERS = [["product", "Product"], ["state", "State"], ["participant", "Participant"], ["runs", "Where it runs"]];

function drawList(rows) {
  const chosen = {};
  const body = el("tbody");
  const draw = () => body.replaceChildren(...rows.filter((row) => FILTERS.every(([key]) => !chosen[key] || row[key] === chosen[key])).map((row) => {
    const line = el("tr", row.tab ? "job this-tab" : "job");
    if (!row.tab) line.setAttribute("data-id", row.id);
    const state = el("td", "state", row.state);
    if (row.reason) state.append(" ", el("span", "reason", row.reason));
    line.append(el("td", "id", row.tab ? "this tab's" : row.id), el("td", "product", row.product || "—"), el("td", "works-on", row.works), el("td", "kind", row.kind),
      el("td", "participant", row.participant || "—"), el("td", "runs", row.runs), state, el("td", "elapsed", row.elapsed), el("td", "cost", row.cost));
    return line;
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

async function render(target, context) {
  target.replaceChildren(el("h2", null, "Every job"), el("p", "reading", "Reading…"));
  const sources = await Promise.all(sourcesOf(context).map(readSource));
  const readable = sources.filter((source) => source.snapshot);
  const products = readable.map(({ address, snapshot }) => ({ address, snapshot }));
  const first = await listJobs(products, new Map());
  const bridges = bridgesOf(first, context.store);
  const hostOf = new Map(readable.map((source) => [source.address, source.host]));
  const lives = new Map();
  await Promise.all(first.filter((row) => !row.record.end && row.source.reachable).map(async (row) => {
    try { lives.set(row.record.id, await liveState(row.record, { host: hostOf.get(row.product) }, bridges)); } catch (failure) {
      lives.set(row.record.id, { reachable: false, reason: String(failure?.message ?? failure), known: false });
    }
  }));
  const rows = listOf(await listJobs(products, lives), lives);
  const unreadable = sources.filter((source) => source.reason);
  target.replaceChildren(el("h2", null, "Every job"),
    ...(unreadable.length ? [el("ul", "unreadable", ...unreadable.map((source) => el("li", "source", `${source.address}: ${source.reason}`)))] : []),
    ...drawList(rows));
}

/**
 * jobs: Route — { name: "jobs", entry: null, title: "Every job", render }; the frame's default subject.
 */
export const jobs = { name: "jobs", entry: null, title: "Every job", render };

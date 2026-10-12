// jobs.mjs — preparing, starting and following the drafting jobs of a kind (MOD-review-pages, Parts): the page `<route>/id=draft` of a kind whose descriptor names a
// kind of job to draft it (`draft`), and the notes of the job that wrote an open file, shown beside it. For use cases (UC-007): the requirements to cover, the
// participants that can draft text with where each processes data and its routes, the run panel and Run; a job on the tab's route runs here, attended, and
// writes its files open at once; a job on another route is queued there.
//
// Module: MOD-review-pages
//
// ONE CLICK PER DECISION; THE PAGE STATES WHAT IT SENDS WHERE; A GENERATED ARTIFACT IS A PROPOSAL; THE ROUNDS ARE COUNTED AND SHOWN; THE DASHBOARD WRITES ONLY ON A
// PERSON'S CLICK. Nothing is written or sent while the page is drawn or while the run panel is shown: Run, the panel's own button, is the one click that starts the
// job. The job's record is written in the product's repository.

import { readSetting } from "../browser-store/index.mjs";
import { readDocument } from "../documents/index.mjs";
import { newJobId, listJobs } from "../job-ledger/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { prepareJob } from "../job-runner/index.mjs";
import { eligible, participantSchema, participantsOf } from "../participant-list/index.mjs";
import { queueJob, routesFor, runOnTab } from "../runtimes/index.mjs";
import { runPanel, explain } from "../site-frame/index.mjs";
import { coverageGaps, traceGraph } from "../trace-graph/index.mjs";
import { el, button, link, problem, TOKEN_STEP } from "./common.mjs";

const REGISTER = "docs/participants.md";
const WORKFLOWS = [".github/workflows/agent-m-jobs.yml", ".gitlab/agent-m-jobs.yml"];
const JOB_FILE = /^docs\/jobs\/(JOB-[^/]+)\.md$/;

// The route as a job's record writes it: `tab`, `ci hosted`, `ci runner:<label>`, `bridge <name>`.
const recordRoute = (route) => (route.kind === "tab" ? "tab" : route.kind === "ci" ? (route.runner === "hosted" ? "ci hosted" : `ci runner:${route.runner}`) : `bridge ${route.bridge}`);

// The endpoints of the participants as the tab's route calls them: the configuration the page stored for each, and whether it is reached through a Bridge.
function connectionsOf(participants, store) {
  const endpoints = {};
  for (const participant of participants) {
    const name = /^endpoint\s+(\S+)/.exec(participant.route ?? "")?.[1];
    const stored = name === undefined ? null : readSetting(store, `endpoint:${name}`);
    if (stored) endpoints[name] = { config: { name, kind: stored.kind, baseUrl: stored.url, model: stored.model, key: stored.key ?? null }, bridge: stored.throughBridge ? "paired" : null };
  }
  return { endpoints, bridges: {} };
}

async function defaultSnapshot(host) {
  const { defaultBranch } = await host.repositoryInfo();
  return host.readSnapshot(defaultBranch);
}

/**
 * showDraft(where, kind) — the drafting page of a kind: its selection, its participants, the run panel and the result of a run. `where` is the flow's: the
 * host and snapshot of the product (or of the instance itself), the token, the context and the target.
 */
export async function showDraft(where, kind) {
  const { target, snapshot, token, host, context } = where;
  target.append(el("h2", null, `Draft ${kind.plural}`), explain(kind.explain.draft.requirements), link(`#${kind.route}`, null, `All ${kind.plural}`));
  let definition, graph, participants, instanceSnapshot, info;
  try {
    definition = await kindOf(kind.draft);
    graph = await traceGraph(snapshot);
    instanceSnapshot = context.product ? await defaultSnapshot(context.instance.host) : snapshot;
    const register = await instanceSnapshot.read(REGISTER);
    participants = register === null ? [] : participantsOf(readDocument(participantSchema(), REGISTER, register));
    info = await host.repositoryInfo();
  } catch (failure) {
    target.append(problem(failure, token));
    return;
  }
  const names = [...graph.nodes.values()].filter((node) => node.kind === "requirement").map((node) => node.id).sort();
  const uncovered = new Set(coverageGaps(graph).requirementsWithoutUseCase);
  const list = el("ul", "requirements");
  for (const name of names) {
    const box = el("input", "requirement");
    box.type = "checkbox";
    box.value = name;
    box.checked = uncovered.has(name);
    list.append(el("li", null, el("label", null, box, ` ${name}`)));
  }
  target.append(el("section", "to-cover", el("h3", null, "Requirements to cover"), list));

  const product = { visibility: info.visibility, jobWorkflow: WORKFLOWS.some((path) => snapshot.paths.includes(path)) };
  const needs = definition.resources === "none" ? [] : [];
  const drafters = eligible(participants, { capabilities: definition.needs }).eligible;
  const offered = el("ul", "participants");
  for (const participant of drafters) {
    const box = el("input", "participant");
    box.type = "radio";
    box.name = "participant";
    box.value = participant.name;
    const route = el("span", "route");
    const offers = routesFor(participant, product, needs);
    route.append(offers.length ? offers.map((offer) => `${recordRoute(offer.route)}${offer.available ? "" : " — not available"}`).join(", ") : "no route of a job");
    const item = el("li", "participant", el("label", null, box, ` ${participant.name} `), el("span", "place", participant.place ?? "no processing place declared"), " ", route);
    for (const offer of offers) if (!offer.available) item.append(" ", el("span", "reason", offer.reason));
    item.setAttribute("data-name", participant.name);
    offered.append(item);
  }
  target.append(el("section", "drafters", el("h3", null, "Drafting participant"), explain(kind.explain.draft.participant), offered));

  const stage = el("section", "stage");
  if (!token) {
    target.append(el("p", "problem", "A job is recorded and its result written with your token. ", link(TOKEN_STEP, "token-step", "Store the token")), stage);
    return;
  }
  const prepare = button("btn prepare", "Show the run panel");
  prepare.addEventListener("click", async () => {
    stage.replaceChildren();
    const chosen = drafters.find((participant) => byClassChecked(offered, participant.name));
    if (!chosen) { stage.append(el("p", "problem", "Choose the participant that drafts.")); return; }
    const selected = inputsOf(list, "requirement").filter((box) => box.checked).map((box) => box.value);
    await panelOf({ ...where, definition, kind, chosen, selected, participants, instanceSnapshot, product, needs, stage });
  });
  target.append(prepare, stage);
}

// The inputs of a class under a node, in the order they stand.
const inputsOf = (root, className) => {
  const walk = (node) => [...node.childNodes].flatMap((kid) => (kid.nodeType === 1 ? [kid, ...walk(kid)] : []));
  return walk(root).filter((node) => node.localName === "input" && node.className.split(" ").includes(className));
};
const byClassChecked = (list, name) => inputsOf(list, "participant").some((box) => box.value === name && box.checked);

// The run panel for the chosen participant and selection; Run starts the job.
async function panelOf(run) {
  const { stage, context, token, host, snapshot, definition, kind, chosen, selected, participants, instanceSnapshot } = run;
  const now = new Date();
  const taken = new Set(snapshot.paths.map((path) => JOB_FILE.exec(path)?.[1]).filter(Boolean));
  const id = newJobId(now, taken);
  const agentM = { version: instanceSnapshot.commit ?? "unknown", commit: instanceSnapshot.commit ?? "unknown" };
  const jobContext = { kind: definition, params: { requirements: selected }, product: { address: snapshot.repository?.web ?? "", snapshot, host },
    instance: { snapshot: instanceSnapshot, host: context.product ? context.instance.host : host, checkout: null }, connect: async () => host, participants,
    places: { sources: {}, mailbox: null }, gates: [], person: token.name, now, agentM, jobId: id };
  let prepared;
  try {
    prepared = await prepareJob(kind.draft, jobContext, { drafter: chosen, reviewers: [] });
  } catch (failure) {
    stage.append(problem(failure, token));
    return;
  }
  const offer = routesFor(chosen, run.product, run.needs)[0];
  stage.append(explain(kind.explain.draft.panel), runPanel(prepared, { onRun: () => start({ ...run, prepared, jobContext, id, now, agentM, offer }) }));
}

async function start(run) {
  const { stage, host, token, snapshot, prepared, jobContext, id, now, agentM, offer, chosen, selected, kind, participants } = run;
  const result = el("section", "job");
  stage.append(result);
  try {
    if (!offer || !offer.available) throw Object.assign(new Error(offer ? offer.reason : "the participant has no route of a job"), { name: "RouteUnavailable" });
    const start_ = { id, kind: kind.draft, worksOn: selected, participant: chosen.name, model: chosen.model, route: recordRoute(offer.route), run: null, retries: null,
      startedBy: token.name, start: now, agentM, inputs: prepared.parts.map((part) => part.name), limit: prepared.limit,
      destinations: prepared.destinations.map((each) => ({ participant: each.participant.name, place: each.place, parts: each.parts })), params: { requirements: selected } };
    const { path } = await queueJob(host, start_, offer.route, snapshot.commit);
    if (offer.route.kind !== "tab") {
      result.append(el("p", "queued", `Job ${id} is queued on the route ${recordRoute(offer.route)}; it is not run in this tab.`), explain(kind.explain.draft.ci));
      return;
    }
    const outcome = await runOnTab(prepared, jobContext, connectionsOf(run.participants, run.context.store), { host, record: { ...start_, path } });
    result.append(el("p", "rounds", `Correction rounds: ${outcome.rounds.length}`), explain(kind.explain.draft.loop));
    const left = el("ul", "left");
    for (const finding of outcome.remaining) left.append(el("li", "left", `${finding.rule}: ${finding.what} — ${finding.fix}`));
    const written = el("ul", "written");
    for (const file of outcome.written?.files ?? []) written.append(el("li", null, file));
    result.append(left, written, explain(kind.explain.draft.written), link(`#${kind.route}`, null, `All ${kind.plural}`));
  } catch (failure) {
    result.append(el("p", "result problem", `${failure.name}: ${failure.message}`));
  }
}

/**
 * jobNotes(snapshot, id) -> Promise<string[]> — the notes of the end records of the jobs that name the file `id` (`note: …` lines of an end's results): what a
 * drafting job did to a use case it wrote — a realised name it removed, a use case that realises none.
 */
export async function jobNotes(snapshot, id) {
  const rows = await listJobs([{ address: snapshot.repository?.web ?? "", snapshot }], new Map());
  return rows.flatMap((row) => row.record.end?.results ?? []).filter((line) => line.startsWith("note: ") && line.includes(id)).map((line) => line.slice("note: ".length));
}

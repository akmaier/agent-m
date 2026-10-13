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
import { approvalStrategies, statuses } from "../approvals/index.mjs";
import { differs, eligible, participantSchema, participantsOf } from "../participant-list/index.mjs";
import { permittedPlaces } from "../source-register/index.mjs";
import { queueJob, routesFor, runOnTab } from "../runtimes/index.mjs";
import { runPanel, explain } from "../site-frame/index.mjs";
import { coverageGaps, traceGraph } from "../trace-graph/index.mjs";
import { el, button, link, problem, TOKEN_STEP } from "./common.mjs";
import { sourcesOf } from "./spec-entries.mjs";

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
 * loadStage(where, jobKind) -> { definition, participants, instanceSnapshot, product, needs, drafters } — what a page that starts a job of `jobKind` shows before it: the kind, the
 * participants of the instance's register that can do what the kind needs, and what the product allows of a route.
 */
export async function loadStage(where, jobKind) {
  const { snapshot, host, context } = where;
  const definition = await kindOf(jobKind);
  const instanceSnapshot = context.product ? await defaultSnapshot(context.instance.host) : snapshot;
  const register = await instanceSnapshot.read(REGISTER);
  const participants = register === null ? [] : participantsOf(readDocument(participantSchema(), REGISTER, register));
  const info = await host.repositoryInfo();
  const product = { visibility: info.visibility, jobWorkflow: WORKFLOWS.some((path) => snapshot.paths.includes(path)) };
  const needs = definition.resources === "none" ? [] : [];
  return { definition, participants, instanceSnapshot, product, needs, drafters: eligible(participants, { capabilities: definition.needs }).eligible };
}

/** participantList(drafters, product, needs, role) -> Element — each participant that can draft with where it processes data and its routes, a radio to choose it; `role` is "participant", or "reviewer" for the reviewing participant of a derivation. */
export function participantList(drafters, product, needs, role = "participant") {
  const offered = el("ul", `${role}s`);
  for (const participant of drafters) {
    const box = el("input", role);
    box.type = "radio";
    box.name = role;
    box.value = participant.name;
    const route = el("span", "route");
    const offers = routesFor(participant, product, needs);
    route.append(offers.length ? offers.map((offer) => `${recordRoute(offer.route)}${offer.available ? "" : " — not available"}`).join(", ") : "no route of a job");
    const item = el("li", role, el("label", null, box, ` ${participant.name} `), el("span", "place", participant.place ?? "no processing place declared"), " ", route);
    for (const offer of offers) if (!offer.available) item.append(" ", el("span", "reason", offer.reason));
    item.setAttribute("data-name", participant.name);
    offered.append(item);
  }
  return offered;
}

/**
 * showDraft(where, kind) — the drafting page of a kind: its selection, its participants, the run panel and the result of a run. `where` is the flow's: the
 * host and snapshot of the product (or of the instance itself), the token, the context and the target.
 */
export async function showDraft(where, kind) {
  if (kind.whole) return showArchitectureDraft(where, kind);
  const { target, snapshot, token, host, context } = where;
  target.append(el("h2", null, `Draft ${kind.plural}`), explain(kind.explain.draft.requirements), link(`#${kind.route}`, null, `All ${kind.plural}`));
  let graph, loaded;
  try {
    graph = await traceGraph(snapshot);
    loaded = await loadStage(where, kind.draft);
  } catch (failure) {
    target.append(problem(failure, token));
    return;
  }
  const { definition, participants, instanceSnapshot, product, needs, drafters } = loaded;
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

  const offered = participantList(drafters, product, needs);
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
    await panelOf({ ...where, definition, kind, jobKind: kind.draft, params: { requirements: selected }, worksOn: selected, present: presentDraft, chosen, participants,
      instanceSnapshot, product, needs, stage });
  });
  target.append(prepare, stage);
}

// The inputs of a class under a node, in the order they stand.
const inputsOf = (root, className) => {
  const walk = (node) => [...node.childNodes].flatMap((kid) => (kid.nodeType === 1 ? [kid, ...walk(kid)] : []));
  return walk(root).filter((node) => node.localName === "input" && node.className.split(" ").includes(className));
};
export const byClassChecked = (list, name, role = "participant") => inputsOf(list, role).some((box) => box.value === name && box.checked);

// The run panel for the chosen participant and selection; Run starts the job.
export async function panelOf(run) {
  const { stage, context, token, host, snapshot, definition, kind, chosen, params, participants, instanceSnapshot } = run;
  const now = new Date();
  const taken = new Set(snapshot.paths.map((path) => JOB_FILE.exec(path)?.[1]).filter(Boolean));
  const id = newJobId(now, taken);
  const agentM = { version: instanceSnapshot.commit ?? "unknown", commit: instanceSnapshot.commit ?? "unknown" };
  const jobContext = { kind: definition, params, product: { address: snapshot.repository?.web ?? "", snapshot, host },
    instance: { snapshot: instanceSnapshot, host: context.product ? context.instance.host : host, checkout: null }, connect: async () => host, participants,
    places: run.places ?? { sources: {}, mailbox: null }, gates: [], person: token.name, now, agentM, jobId: id };
  let prepared;
  try {
    prepared = await prepareJob(run.jobKind, jobContext, { drafter: chosen, reviewers: run.reviewers ?? [] });
    if (run.relax) prepared = run.relax(prepared);
  } catch (failure) {
    stage.append(problem(failure, token));
    return;
  }
  const offer = routesFor(chosen, run.product, run.needs)[0];
  stage.append(explain(kind.explain.draft.panel), runPanel(prepared, { onRun: () => start({ ...run, prepared, jobContext, id, now, agentM, offer }) }));
}

async function start(run) {
  const { stage, host, token, snapshot, prepared, id, now, agentM, offer, chosen, kind, params, worksOn } = run;
  const result = el("section", "job");
  stage.append(result);
  try {
    if (!offer || !offer.available) throw Object.assign(new Error(offer ? offer.reason : "the participant has no route of a job"), { name: "RouteUnavailable" });
    const start_ = { id, kind: run.jobKind, worksOn, participant: chosen.name, model: chosen.model, route: recordRoute(offer.route), run: null, retries: null,
      startedBy: token.name, start: now, agentM, inputs: prepared.parts.map((part) => part.name), limit: prepared.limit,
      destinations: prepared.destinations.map((each) => ({ participant: each.participant.name, place: each.place, parts: each.parts })), params };
    const { path } = await queueJob(host, start_, offer.route, snapshot.commit);
    if (offer.route.kind !== "tab") {
      result.append(el("p", "queued", `Job ${id} is queued on the route ${recordRoute(offer.route)}; it is not run in this tab.`), explain(kind.explain.draft.ci));
      return;
    }
    const outcome = await runOnTab(prepared, run.jobContext, connectionsOf(run.participants, run.context.store), { host, record: { ...start_, path } });
    await run.present(outcome, result, { ...run, record: start_ });
  } catch (failure) {
    result.append(el("p", "result problem", `${failure.name}: ${failure.message}`));
  }
}

// What a run of the drafting job came to: the rounds, what the loop left, the files written.
async function presentDraft(outcome, result, run) {
  const { kind } = run;
  result.append(el("p", "rounds", `Correction rounds: ${outcome.rounds.length}`), explain(kind.explain.draft.loop));
  const left = el("ul", "left");
  for (const finding of outcome.remaining) left.append(el("li", "left", `${finding.rule}: ${finding.what} — ${finding.fix}`));
  const written = el("ul", "written");
  for (const file of outcome.written?.files ?? []) written.append(el("li", null, file));
  result.append(left, written, explain(kind.explain.draft.written), link(`#${kind.route}`, null, `All ${kind.plural}`));
}

/**
 * jobNotes(snapshot, id) -> Promise<string[]> — the notes of the end records of the jobs that name the file `id` (`note: …` lines of an end's results): what a
 * drafting job did to a use case it wrote — a realised name it removed, a use case that realises none.
 */
export async function jobNotes(snapshot, id) {
  const rows = await listJobs([{ address: snapshot.repository?.web ?? "", snapshot }], new Map());
  return rows.flatMap((row) => row.record.end?.results ?? []).filter((line) => line.startsWith("note: ") && line.includes(id)).map((line) => line.slice("note: ".length));
}

// ---------------------------------------------------------------- the architecture's derivation, up to Run (UC-022 steps 1 to 4)

const ONLY_ACCEPTED = "ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES";
const NO_REVIEWER = "NO REVIEWER IS THE DRAFTER";

// The places the product's linked sources allow: for each restricted source the product's links file holds a row of, the places its register entry permits.
async function placesOf(where) {
  const { links, register } = await sourcesOf(where);
  const linked = new Set(links.sections.flatMap((section) => section.rows ?? []).map((row) => String(row.cells.Source ?? "").replaceAll("`", "")));
  const sources = {};
  for (const entry of register.filter((each) => linked.has(each.id))) {
    const allowed = permittedPlaces(entry);
    if (allowed !== "any") sources[entry.id] = allowed;
  }
  return { sources, mailbox: null };
}

// What the precondition `architecture-ready` found, with the way on: to an open use case's review, to the SPEC changes to decide first, to UC-023 for an existing architecture.
function readiness(found, snapshot) {
  const box = el("section", "readiness");
  if (!found) return box;
  box.append(el("p", `finding ${found.kind}`, `${found.kind}: ${found.what} — ${found.fix} [${found.rule}]`));
  if (found.kind === "warning") box.append(link("#spec-entry", "decide-first", "Decide the open SPEC changes first (UC-006)"));
  else if (found.rule === ONLY_ACCEPTED) {
    for (const { id, kind, status } of statuses(snapshot).values()) {
      if (kind === "use-case" && status !== "accepted") box.append(" ", link(`#use-case/id=${encodeURIComponent(id)}`, "review-link", `Review ${id}`));
    }
  } else box.append(link("#decision", "change-architecture", "Change the architecture (UC-023)"));
  return box;
}

// Why no reviewer is offered for `drafter`: no other participant that can draft text, none with another model, or none whose place the content may go to.
function noReviewer(drafter, participants, needs, places) {
  const others = eligible(participants.filter((each) => each.name !== drafter.name), { capabilities: needs }).eligible;
  if (others.length === 0) return `No participant other than ${drafter.name} can draft text, so none can review its draft.`;
  if (!others.some((each) => differs(drafter, each))) return `No other participant that can draft text uses another model than ${drafter.model ?? "the drafter's"}.`;
  return `No participant that uses another model than ${drafter.name} processes data at a place that ${Object.keys(places.sources).join(", ")} permit.`;
}

/**
 * showArchitectureDraft(where, kind) — the drafting page of the architecture (`decision/draft`): what the derivation covers, what the precondition found, the drafting and the reviewing participant,
 * the run panel and Run. Nothing is sent before Run.
 */
async function showArchitectureDraft(where, kind) {
  const { target, snapshot, token } = where;
  target.append(el("h2", null, "Draft the architecture"), explain(kind.explain.draft.whole), link(`#${kind.route}`, null, `All ${kind.plural}`));
  let graph, loaded, places, found, reviewing;
  try {
    graph = await traceGraph(snapshot);
    loaded = await loadStage(where, kind.draft);
    places = await placesOf(where);
    found = await approvalStrategies.preconditions["architecture-ready"]({ product: { snapshot, address: snapshot.repository?.web ?? "" } });
    reviewing = await kindOf(loaded.definition.reviewer);
  } catch (failure) {
    target.append(problem(failure, token));
    return;
  }
  const { definition, participants, instanceSnapshot, product, needs } = loaded;
  const requirements = [...graph.nodes.values()].filter((node) => node.kind === "requirement").map((node) => node.id).sort();
  const useCases = [...statuses(snapshot).values()].filter((each) => each.kind === "use-case").map((each) => each.id).sort();
  const covers = el("section", "covers", el("h3", null, "What the derivation covers"),
    el("p", null, `Every requirement of the SPEC (${requirements.length}) and every use case (${useCases.length}); nothing is selected.`));
  covers.append(el("ul", "covered", ...requirements.map((name) => el("li", "requirement", name)), ...useCases.map((id) => el("li", "use-case", id))));
  target.append(covers, readiness(found, snapshot));

  const placed = Object.entries(places.sources).map(([from, allowed]) => ({ from, allowed }));
  const drafters = eligible(participants, { capabilities: definition.needs, places: placed }).eligible;
  const reviewable = eligible(participants, { capabilities: reviewing.needs, places: placed }).eligible;
  const offered = participantList(drafters, product, needs);
  const reviewers = el("div", "reviewer-choice");
  const reviewersFor = (drafter) => (drafter ? reviewable.filter((each) => differs(drafter, each)) : []);
  const drafterChosen = () => drafters.find((each) => byClassChecked(offered, each.name));
  function showReviewers() {
    const drafter = drafterChosen();
    reviewers.replaceChildren();
    if (!drafter) reviewers.append(el("p", "none", "Choose the drafting participant first; the reviewer must use another model."));
    else if (reviewersFor(drafter).length === 0) reviewers.append(el("p", "no-reviewer", noReviewer(drafter, participants, reviewing.needs, places)));
    else reviewers.append(participantList(reviewersFor(drafter), product, needs, "reviewer"));
  }
  for (const box of inputsOf(offered, "participant")) box.addEventListener("change", showReviewers);
  showReviewers();
  target.append(el("section", "drafters", el("h3", null, "Drafting participant"), explain(kind.explain.draft.participant), offered),
    el("section", "reviewers", el("h3", null, "Reviewing participant"), explain(kind.explain.draft.reviewer), reviewers));

  const stage = el("section", "stage");
  if (!token) {
    target.append(el("p", "problem", "A job is recorded and its result written with your token. ", link(TOKEN_STEP, "token-step", "Store the token")), stage);
    return;
  }
  const prepare = button("btn prepare", "Show the run panel");
  prepare.addEventListener("click", async () => {
    stage.replaceChildren();
    const chosen = drafterChosen();
    if (!chosen) { stage.append(el("p", "problem", "Choose the participant that drafts.")); return; }
    const candidates = reviewersFor(chosen);
    const reviewer = candidates.find((each) => byClassChecked(reviewers, each.name, "reviewer"));
    if (candidates.length && !reviewer) { stage.append(el("p", "problem", "Choose the participant that reviews.")); return; }
    // An open SPEC change is a warning the person decides on: the page names it, and Run is still offered. A missing reviewer keeps Run from being offered.
    const relax = (prepared) => ({ ...prepared, blocking: [...prepared.blocking.filter((each) => each.kind === "error"), ...(reviewer ? [] : [{ artifact: "docs/participants.md", line: 1,
      kind: "error", rule: NO_REVIEWER, what: noReviewer(chosen, participants, reviewing.needs, places), fix: "declare a participant that can draft text and uses another model" }])] });
    await panelOf({ ...where, definition, kind, jobKind: kind.draft, params: {}, worksOn: [...requirements, ...useCases], present: presentDerivation, chosen,
      reviewers: reviewer ? [reviewer] : [], places, relax, participants, instanceSnapshot, product, needs, stage });
  });
  target.append(prepare, stage);
}

// What a run of the derivation came to, here: that it ran. The draft that waits for the author is shown by the page that follows.
async function presentDerivation(outcome, result, run) {
  result.append(el("p", "ran", `Job ${run.id} ran in this tab.`));
}

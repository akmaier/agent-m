// implement.mjs — the route `implement`: the ready items of the backlog started as implementation jobs (MOD-implementation-pages, Parts; Interfaces: implement; UC-034 steps 1 to 4, 2a, 3a, 4a). The items of the
// backlog — or, with the address `#implement/sprint=<team>/<nn>`, which *Start sprint work* leads to, every item of that sprint's selection — each with its state and, if it cannot start, every reason MOD-work-plans'
// startable gives; for a startable item the participants that hold the implementing role in the item's role assignment and can write and run tests (MOD-participant-list's eligible), each with where it processes data
// and its routes from MOD-runtimes' routesFor, the attempt limit, who merges, the target branch, the gates the job will meet with who decides them, and what is sent where (MOD-job-runner's prepareJob). *Start jobs*, one
// click of a person, writes each chosen item's start record under docs/jobs/ and queues it on its participant's route with queueJob, handed to a Bridge at once where the route is one; a route that does not answer leaves the
// job queued, and is named.
//
// Module: MOD-implementation-pages
//
// NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; A JOB GOES ONLY TO A HOLDER OF ITS ROLE; THE PAGE NAMES WHERE IT SENDS;
// ONE CLICK PER DECISION. A render writes nothing and sends nothing: *Start jobs* and *Merge* are the writes, each on a person's click. Readings the texts leave open, which this file takes:
//   - The items and their states are those of backlog.mjs' contextOf and derivedOf, over the facts of the scope `work` this route reads once; the workflow is theirs.
//   - An item is listed in every state but done; the startable ones are ticked, the others carry their reasons and cannot be ticked.
//   - The implementing roles are those of the phases that produce MOD; the item's role assignment is its team's — the team whose newest running sprint selects it —, else the product's first.
//   - Who merges is the parameter `merges` (`agent` or `person`) of the job's `## Parameters`, chosen when the jobs are started; acting on it is the merge's.
//   - What is sent where is drawn from prepareJob's destinations and parts, in the page's own list, with no second Run: *Start jobs* is the one click.
//   - A pull request is of a job the page started when its description has the line `Job: <id>` (MOD-runtimes' writer writes it) and `<id>` is a record of kind implement or refactor under docs/jobs/. For it the page shows
//     the CI runs of the first commit and of the head, and whether the Definition of Done holds: doneCheck over pullRequestFacts, given the modules of the items or steps the job works on. *Merge* is offered for an open pull
//     request that is no draft and for which doneCheck finds nothing, and calls mergePullRequest on the head the page read. A merged pull request is shown as done.

import { readSetting } from "../browser-store/index.mjs";
import { bridgeAt, settingsOf } from "../bridge-client/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { newJobId } from "../job-ledger/index.mjs";
import { prepareJob } from "../job-runner/index.mjs";
import { eligible, participantSchema, participantsOf } from "../participant-list/index.mjs";
import { artifactSchemas, readDocument } from "../documents/index.mjs";
import { doneCheck, holdsRole } from "../product-process/index.mjs";
import { productFacts } from "../progress-measures/index.mjs";
import { queueJob, routesFor } from "../runtimes/index.mjs";
import { explain as frameExplain } from "../site-frame/index.mjs";
import { restrictedPlaces, sourceSchemas } from "../source-register/index.mjs";
import { startable } from "../work-plans/index.mjs";
import { assignmentOf, contextOf, derivedOf, participantsIn } from "./backlog.mjs";

const REGISTER = "docs/participants.md";
const WORKFLOWS = [".github/workflows/agent-m-jobs.yml", ".gitlab/agent-m-jobs.yml"];
const ASSIGNMENT_FILE = /^docs\/role-assignments\/([^/]+)\.md$/;
const JOB_FILE = /^docs\/jobs\/(JOB-[^/]+)\.md$/;

const text = (value) => (typeof value === "string" ? value : value === null || value === undefined ? "" : String(value));
const list = (value) => (Array.isArray(value) ? value.map(text) : text(value).split(",").map((part) => part.trim()).filter(Boolean));
const h = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const idOf = (doc) => text(doc?.id ?? doc?.fields?.id);
const explain = (html) => `<details class="explain"><summary>What is this?</summary><div>${html}</div></details>`;
const recordRoute = (route) => (route.kind === "tab" ? "tab" : route.kind === "ci" ? (route.runner === "hosted" ? "ci hosted" : `ci runner:${route.runner}`) : `bridge ${route.bridge}`);

// The phases that produce MOD are the implementing ones, and their roles the implementing roles (as MOD-work-plans' startable reads them).
const implementingRoles = (workflow) => {
  const names = new Set((workflow?.phases ?? []).filter((phase) => (phase.produces ?? []).includes("MOD")).flatMap((phase) => phase.roles ?? []));
  return (workflow?.roles ?? []).filter((role) => names.has(role.name));
};

// The person who starts the jobs, by the name of the token stored for the product.
function personOf(context) {
  try {
    const path = new URL(context.product.address).pathname.replace(/^\/|\/$/g, "");
    const stored = readSetting(context.store, context.product.kind === "gitlab" ? `gitlab-token:${new URL(context.product.address).host}/${path}` : `github-token:${path}`);
    return stored?.name ?? "the author";
  } catch { return "the author"; }
}

// The Bridges and endpoints a participant's route names, as the tab holds them.
function bridgesOf(participants, store) {
  const bridges = {};
  for (const participant of participants) {
    const name = /^bridge\s+(\S+)\s+agent\s+\S+/.exec(participant.route ?? "")?.[1];
    const stored = name === undefined ? null : readSetting(store, `bridge:${name}`);
    if (stored) bridges[name] = bridgeAt(settingsOf({ name, ...stored }, readSetting(store, "jump-host")));
  }
  return bridges;
}

// What one startable item shows: the holders that can implement, and for the chosen one what is sent where.
async function sentFor(prepare, participant) {
  const prepared = await prepare(participant);
  const sent = prepared.destinations.map((destination) => `${h(destination.participant.name)} at ${h(destination.place ?? "no declared place")}: ${destination.parts.map(h).join(", ") || "nothing"}`);
  const blocking = prepared.blocking.map((found) => `${h(found.what)}`);
  return { prepared, html: `<ul>${sent.map((line) => `<li>${line}</li>`).join("")}</ul>${blocking.length ? `<p class="warn">${blocking.join("; ")}</p>` : ""}<p class="small">Correction rounds: at most ${h(prepared.limit)}</p>` };
}

// The page's head: the title, the folded explanation of the route the product's model prescribes (UC-024 step 1), and the part given.
function headOf(target, body, note = "Ready backlog items are handed to coding agents, one job per item (UC-034).") {
  target.innerHTML = `<section class="panel head"><h2>Implement</h2><div data-route-explain></div>${explain(`<p>${note}</p>`)}${body}</section>`;
  target.querySelector("[data-route-explain]")?.append(frameExplain("implementation-route"));
}

// The places the restricted sources permit (JobContext.places.sources and .contents): the entries of the instance's register at its default branch, and MOD-source-register's restrictedPlaces over them for the product.
async function placesOf(instanceSnapshot, address) {
  const { entry } = sourceSchemas();
  const paths = instanceSnapshot.paths.filter((path) => /^docs\/sources\/[^/]+\.md$/.test(path));
  const register = await Promise.all(paths.map(async (path) => readDocument(entry, path, (await instanceSnapshot.read(path)) ?? "")));
  return restrictedPlaces(register, address);
}

// Of the holders of a role, those the job can go to and those a linked source forbids (UC-024 5b): a holder is withheld where preparing the job for it finds that a source whose content the job includes does not permit its place;
// what is said of it is that finding's words, which name the source and the place. A job that cannot be prepared is not judged here: the holder stays, and the page shows the failure where it shows what is sent.
async function placed(holders, prepare) {
  const offered = [], withheld = [];
  for (const participant of holders) {
    try {
      const forbidden = (await prepare(participant)).blocking.filter((found) => found.rule === "RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS");
      if (forbidden.length) withheld.push({ participant, said: forbidden.map((found) => found.what) });
      else offered.push(participant);
    } catch {
      offered.push(participant);
    }
  }
  return { offered, withheld };
}

// What starting a job needs, whichever the part of the page: the page's context and facts, the participants, and what the product allows of a route.
const agentMOf = (snapshot) => ({ version: snapshot.commit ?? "unknown", commit: snapshot.commit ?? "unknown" });
function jobContextOf(m, definition, params) {
  return { kind: definition, params, product: { address: m.ctx.snapshot.repository?.web ?? m.context.product.address, snapshot: m.ctx.snapshot, host: m.context.product.host },
    instance: { snapshot: m.instanceSnapshot, host: m.context.instance.host, checkout: null }, connect: async () => m.context.product.host, participants: m.participants, places: m.places, gates: [],
    person: personOf(m.context), now: new Date(), agentM: agentMOf(m.instanceSnapshot), jobId: null };
}
const prepareFor = (m, definition, params, participant) => prepareJob(definition.name, jobContextOf(m, definition, params), { drafter: participant, reviewers: [] });

// One job: its start record written and queued on the participant's route with queueJob, handed to a Bridge at once where the route is one. A failure carries the job it was for (`failure.job`).
async function startJob(m, { definition, worksOn, participant, params, limit = null }) {
  const job = { kind: definition.name, participant: participant.name };
  try {
    const offer = routesFor(participant, m.participants, m.productInfo, []).find((each) => each.available);
    if (!offer) throw new Error(`${participant.name} has no route a job can take`);
    const bridge = offer.route.kind === "bridge" ? bridgesOf([participant], m.context.store)[offer.route.bridge] : undefined;
    if (offer.route.kind === "bridge" && !bridge) throw new Error(`The Bridge ${offer.route.bridge} is not connected in this browser, so the job cannot be handed to it`);
    const prepared = await prepareFor(m, definition, params, participant);
    const id = newJobId(new Date(), m.taken);
    m.taken.add(id);
    job.id = id;
    const record = { id, kind: definition.name, worksOn, participant: participant.name, model: participant.model, route: recordRoute(offer.route), run: null, retries: null, startedBy: personOf(m.context), start: new Date(),
      agentM: agentMOf(m.instanceSnapshot), inputs: prepared.parts.map((part) => part.name), limit: limit ?? prepared.limit,
      destinations: prepared.destinations.map((each) => ({ participant: each.participant.name, place: each.place, parts: each.parts })), params };
    const defaultBranch = (await m.context.product.host.repositoryInfo()).defaultBranch;
    const head = (await m.context.product.host.readSnapshot(defaultBranch)).commit;
    const queued = await queueJob(m.context.product.host, record, offer.route, head, bridge);
    return { id, path: queued.path, route: recordRoute(offer.route) };
  } catch (failure) {
    throw Object.assign(failure, { job });
  }
}

// The phase each step is in, by the plan's order (a row of the order document names a step and its phase).
const phasesOf = (order) => new Map((order?.sections ?? []).flatMap((section) => section.rows ?? []).map((row) => [text(row.cells?.Step), text(row.cells?.Phase)]));

// For a model that plans its work (UC-024 steps 1 to 3): the steps of the plan in their order, each with its derived state and its phase; the ready, startable steps of the current phase ticked, the others
// not selectable, with their reasons. The jobs' participants and *Start jobs* are not on this part of the page.
async function drawPlan(target, context, facts, ctx, participants, workflow, m) {
  if (facts.plan.items.length === 0) {
    headOf(target, `<p class="warn" data-missing>This product has no implementation plan yet, so there is nothing to start. <a href="#plan">Plan the implementation</a>; the process is declared on <a href="#process">How this product is developed</a>.</p>`,
      "A model that plans its work implements the steps of its implementation plan.");
    return;
  }
  const phases = phasesOf(facts.plan.order);
  const assignment = ctx.assignments[0] ?? null;
  const states = facts.plan.states;
  const rows = states.map((state) => ({ state, phase: phases.get(state.item) ?? "", verdict: startable(state.item, states, { workflow, assignment, sprint: null, held: [], wip: null, participants }) }));
  const current = rows.find((row) => row.state.state !== "done")?.phase ?? null;
  const preselected = (row) => row.verdict.startable && row.state.state === "ready" && row.phase === current;
  headOf(target, rows.length === 0 ? "" : `<table class="list"><thead><tr><th></th><th>Step</th><th>Phase</th><th>State</th><th>Why not</th></tr></thead><tbody>${rows.map((row) => `
    <tr data-step="${h(row.state.item)}" data-state="${h(row.state.state)}" data-phase="${h(row.phase)}"><td><input type="checkbox" data-select-step aria-label="Select ${h(row.state.item)}"${row.verdict.startable ? "" : " disabled"}${preselected(row) ? " checked" : ""}></td>
    <td>${h(row.state.item)}</td><td>${h(row.phase)}</td><td><span class="badge">${h(row.state.state)}</span></td>
    <td>${row.verdict.startable ? "" : `<ul data-reasons>${row.verdict.reasons.map((reason) => `<li>${h(reason)}</li>`).join("")}</ul>${row.verdict.reasons.some((reason) => /^No job can implement/.test(reason)) ? `<p data-none-of="${h(row.state.item)}">No participant can write and run tests. <a href="#participants">Declare a participant with the capabilities</a>; a model endpoint can draft a decision, not implement it.</p>` : ""}`}</td></tr>`).join("")}</tbody></table>
    <p data-selected></p><div data-jobs></div><p><button type="button" data-start-jobs>Start jobs</button></p><div data-start-result></div>`, "A model that plans its work implements the steps of its implementation plan, in the plan's order.");
  // A box is ticked by its property; a document that does not keep the property is read by the attribute the page wrote.
  const isTickedBox = (box) => box.getAttribute("disabled") === null && (box.checked === undefined ? box.getAttribute("checked") !== null : box.checked === true);
  const count = () => {
    const n = target.querySelectorAll("[data-select-step]").filter(isTickedBox).length;
    const out = target.querySelector("[data-selected]");
    if (out) out.textContent = `${n} step${n === 1 ? "" : "s"} selected`;
    return drawJobs();
  };

  // UC-024 steps 5 and 6 for the selected steps: the holders of the implementing role that can write and run tests, with where each processes data; the attempt limit, who merges, refactoring; the target
  // branch, the gates from the step's phase on, and what is sent where. Nothing is sent: *Start jobs* is the one click.
  const definitions = { implement: await kindOf("implement"), refactor: await kindOf("refactor") };
  const roles = implementingRoles(workflow);
  const phaseNames = (workflow?.phases ?? []).map((phase) => phase.name);
  const branchOf = (step, phase) => (workflow?.branches?.[phase] ?? "").replaceAll("<item>", step) || m.defaultBranch;
  const gatesOf = (phase) => (workflow?.gates ?? []).filter((gate) => phaseNames.indexOf(gate.from) >= phaseNames.indexOf(phase)).map((gate) => `${h(gate.name)} (decided by ${h(gate.decider)})`);
  const holdersFor = () => eligible(participants.filter((participant) => assignment && roles.some((role) => holdsRole(assignment, participant.name, role.name))), { capabilities: definitions.implement.needs }).eligible;
  const jobBox = target.querySelector("[data-jobs]");
  const choice = (step, attribute) => target.querySelector(`[data-${attribute}-of="${step}"]`);
  async function drawJobs() {
    if (!jobBox) return;
    const boxes = target.querySelectorAll("[data-select-step]");
    const steps = rows.filter((row, at) => row.verdict.startable && isTickedBox(boxes[at]));
    const capable = holdersFor();
    const placedBy = new Map();
    for (const row of steps) placedBy.set(row.state.item, await placed(capable, (participant) => prepareFor(m, definitions.implement, { steps: [row.state.item] }, participant)));
    const holdersOf = (step) => placedBy.get(step).offered;
    jobBox.innerHTML = steps.map((row) => {
      const step = row.state.item;
      const { offered: holders, withheld } = placedBy.get(step);
      const withheldText = withheld.length ? `<p class="warn small" data-withheld-of="${h(step)}">${withheld.map(({ said }) => said.map(h).join("; ")).join("; ")}</p>` : "";
      return capable.length === 0
        ? `<div data-job-of="${h(step)}"><h3>${h(step)}</h3><p class="warn" data-none-of="${h(step)}">No participant can write and run tests, so ${h(step)} cannot start. <a href="#participants">Declare a participant with the capabilities</a>; a model endpoint can draft a decision, not implement it.</p></div>`
        : holders.length === 0
        ? `<div data-job-of="${h(step)}"><h3>${h(step)}</h3><p class="warn" data-none-of="${h(step)}">No holder of the implementing role is at a place the linked sources permit for this job, so ${h(step)} cannot start.</p>${withheldText}</div>`
        : `<div data-job-of="${h(step)}"><h3>${h(step)}</h3>
          <label>Participant <select data-participant-of="${h(step)}">${holders.map((participant) => `<option value="${h(participant.name)}">${h(participant.name)}</option>`).join("")}</select></label>
          ${withheldText}
          <p class="small" data-places-of="${h(step)}">${holders.map((participant) => `${h(participant.name)} processes data at ${h(participant.place ?? "no declared place")}`).join("; ")}</p>
          <label>Attempt limit <input type="number" data-limit-of="${h(step)}" value="${h(definitions.implement.limit)}"></label>
          <label>Merges <select data-merges-of="${h(step)}"><option value="agent">the coding agent</option><option value="person">a person</option></select></label>
          <label><input type="checkbox" data-refactor-of="${h(step)}"> Refactoring: structure changes, behaviour does not</label>
          <p class="small" data-branch-of="${h(step)}">Target branch: ${h(branchOf(step, row.phase))}</p>
          <p class="small" data-gates-of="${h(step)}">${gatesOf(row.phase).length ? `Gates: ${gatesOf(row.phase).join(", ")}.` : "No gate stands after this phase."}</p>
          <div data-sent-of="${h(step)}"></div></div>`;
    }).join("");
    for (const row of steps) {
      const step = row.state.item;
      const sent = target.querySelector(`[data-sent-of="${step}"]`);
      const draw_ = async () => {
        const participant = holdersOf(step).find((each) => each.name === choice(step, "participant")?.value) ?? holdersOf(step)[0];
        if (!participant || !sent) return;
        const kind = choice(step, "refactor")?.checked === true ? "refactor" : "implement";
        try {
          const prepared = await prepareFor(m, definitions[kind], { steps: [step] }, participant);
          sent.innerHTML = `<ul>${prepared.destinations.map((each) => `<li>${h(each.participant.name)} at ${h(each.place ?? "no declared place")}: ${each.parts.map(h).join(", ") || "nothing"}</li>`).join("")}</ul>${prepared.blocking.length ? `<p class="warn">${prepared.blocking.map((found) => h(found.what)).join("; ")}</p>` : ""}`;
        } catch (failure) { sent.innerHTML = `<p class="warn">${h(failure?.message ?? failure)}</p>`; }
      };
      await draw_();
      for (const attribute of ["participant", "refactor"]) choice(step, attribute)?.addEventListener("change", draw_);
    }
  }
  await count();
  target.querySelectorAll("[data-select-step]").forEach((box) => box.addEventListener("change", count));
  target.querySelector("[data-start-jobs]")?.addEventListener("click", async (event) => {
    if (event?.isTrusted === false) return;
    const out = target.querySelector("[data-start-result]");
    const steps = rows.filter((row) => row.verdict.startable && target.querySelector(`[data-job-of="${row.state.item}"]`) && choice(row.state.item, "participant"));
    if (steps.length === 0) { out.innerHTML = `<p class="warn">No selected step can start: nothing starts.</p>`; return; }
    const holders = holdersFor();
    const lines = [];
    for (const row of steps) {
      const step = row.state.item;
      const kind = choice(step, "refactor")?.checked === true ? "refactor" : "implement";
      const participant = holders.find((each) => each.name === choice(step, "participant")?.value) ?? holders[0];
      try {
        const started = await startJob(m, { definition: definitions[kind], worksOn: [step], participant, limit: Number(choice(step, "limit")?.value) || definitions.implement.limit,
          params: { steps: [step], merges: choice(step, "merges")?.value ?? "agent", ...(kind === "refactor" ? { refactoring: true } : {}) } });
        lines.push(`<li>${h(step)}: job ${h(started.id)} (<code>${h(started.path)}</code>) is queued on the route ${h(started.route)}.</li>`);
      } catch (failure) {
        if (failure?.name === "PermissionMissing") {
          const actions = (typeof context.product.host.webLinks === "function" ? context.product.host.webLinks()?.actions : null) ?? `${context.product.address.replace(/\/$/, "")}/actions`;
          lines.push(`<li class="warn">${h(step)}: the token may not start workflows. <a data-run-workflow href="${h(actions)}">Open the workflow's Run workflow page</a> and start it there with the inputs job ${h(failure.job?.id ?? "")}, kind ${h(failure.job?.kind ?? kind)}, participant ${h(participant.name)}.</li>`);
        } else lines.push(`<li class="warn">${h(step)}: ${h(failure?.name === "WorkflowMissing" ? `the job workflow is missing (${(failure.files ?? []).join(", ")})` : failure?.message ?? failure)}; ${failure?.queued ? `its start record is committed and stays queued` : "nothing was started for it"}.</li>`);
      }
    }
    out.innerHTML = `<ul>${lines.join("")}</ul>`;
  });
}

// A box is ticked by its property; a document that does not keep the property is read by the attribute the page wrote.
const isTicked = (box) => box !== null && box !== undefined && (box.checked === undefined ? box.getAttribute("checked") !== null : box.checked === true);

// What starting jobs needs of the page: its context and facts, the participants, what the product allows of a route, and the job identifiers taken.
async function machineryFor(context, ctx, instanceSnapshot, participants) {
  const info = await context.product.host.repositoryInfo();
  const places = { ...(await placesOf(instanceSnapshot, ctx.snapshot.repository?.web ?? context.product.address)), mailbox: null };
  return { context, ctx, instanceSnapshot, participants, places, defaultBranch: info.defaultBranch, productInfo: { visibility: info.visibility, jobWorkflow: WORKFLOWS.some((path) => ctx.snapshot.paths.includes(path)) },
    taken: new Set(ctx.snapshot.paths.map((path) => JOB_FILE.exec(path)?.[1]).filter(Boolean)) };
}

// The runs of one commit, each as a link to its page with its state; "no run listed" where the server lists none.
async function runsOf(host, commit) {
  const runs = commit ? await host.listCiRuns({ commit }) : [];
  return runs.length ? runs.map((run) => `<a href="${h(run.url)}">run ${h(run.id)}</a> ${h(run.state)}`).join(", ") : "no run listed";
}

// The pull requests of the jobs this page started (UC-024 steps 11 to 13): each with its branch, the CI runs of its first (tests-only) commit and of its head, and, while it is open, whether the Definition of Done
// holds, naming each condition that does not, and *Merge* once it does, on the head read. A pull request that cannot be read is named, not left out.
async function drawPulls(target, context, facts) {
  const host = context.product.host;
  if (facts.pullRequests === "unknown" || !Array.isArray(facts.jobs)) return;
  const jobs = new Map(facts.jobs.map((row) => row.record).filter((record) => record.kind === "implement" || record.kind === "refactor").map((record) => [record.id, record]));
  const own = facts.pullRequests.map((pull) => ({ pull, job: jobs.get(/^Job: (\S+)/m.exec(pull.body ?? "")?.[1]) })).filter((each) => each.job);
  if (own.length === 0) return;
  const workflow = facts.workflow !== "unknown" ? facts.workflow : null;
  const parts = [], mergeable = [];
  for (const { pull, job } of own) {
    try {
      const read = await host.pullRequestFacts(pull.number);
      const first = read.commits[0], last = read.commits.at(-1);
      const ci = `<ul><li data-ci="first">${first === last ? "The only commit" : "The first commit, with the tests only,"} <code>${h(first?.sha.slice(0, 7) ?? "none")}</code>: ${await runsOf(host, first?.sha)}</li>
        ${first === last ? "" : `<li data-ci="last">The head <code>${h(last?.sha.slice(0, 7) ?? "none")}</code>: ${await runsOf(host, last?.sha)}</li>`}</ul>`;
      const shown = `<h4>#${h(pull.number)} ${h(pull.title)}</h4><p class="small">Job ${h(job.id)}; branch <code>${h(pull.branch)}</code> into <code>${h(pull.base)}</code>; head <code>${h(read.pullRequest.head.slice(0, 7))}</code>.</p>${ci}`;
      if (pull.state !== "open") {
        parts.push(`<div data-pull="${h(pull.number)}" data-state="${h(pull.state)}">${shown}<p>${pull.state === "merged" ? `Done: merged as <code>${h((pull.mergeCommit ?? "").slice(0, 7))}</code>.` : "Closed without a merge."}</p></div>`);
        continue;
      }
      const names = job.worksOn.flatMap((name) => list(facts.plan.items.find((item) => idOf(item) === name)?.fields?.modules));
      const modules = await Promise.all(names.map(async (name) => readDocument(artifactSchemas().module, `docs/architecture/${name}.md`, (await facts.snapshot.read(`docs/architecture/${name}.md`)) ?? "")));
      const findings = workflow ? await doneCheck(read, workflow, modules, facts.gates, { kind: job.kind, modules: names }) : null;
      const offered = findings !== null && findings.length === 0 && !pull.draft;
      if (offered) mergeable.push({ number: pull.number, head: read.pullRequest.head });
      parts.push(`<div data-pull="${h(pull.number)}" data-state="open">${shown}
        ${findings === null ? `<p class="warn" data-done data-holds="false">The product's workflow cannot be read, so the Definition of Done cannot be checked.</p>`
          : findings.length === 0 ? `<p data-done data-holds="true">The Definition of Done holds.</p>`
          : `<p class="warn" data-done data-holds="false">The Definition of Done does not hold:</p><ul data-findings>${findings.map((each) => `<li>${h(each.what)}</li>`).join("")}</ul>`}
        ${pull.draft ? `<p class="warn">The pull request is a draft.</p>` : ""}
        ${offered ? `<p><button type="button" data-merge-pull="${h(pull.number)}">Merge</button></p>` : ""}<p data-merge-result></p></div>`);
    } catch (failure) {
      parts.push(`<div data-pull="${h(pull.number)}"><h4>#${h(pull.number)} ${h(pull.title)}</h4><p class="warn">${h(failure?.message ?? failure)}</p></div>`);
    }
  }
  const section = document.createElement("section");
  section.className = "panel";
  section.setAttribute("data-pulls", "");
  section.innerHTML = `<h3>Pull requests of the jobs</h3>${explain("<p>CI runs the tests on every push, and the Definition of Done is checked on the pull request. <em>Merge</em> is offered once both hold, and merges only while the head is the one shown (UC-024 steps 11 to 13).</p>")}${parts.join("")}`;
  target.append(section);
  for (const { number, head } of mergeable) {
    const button = section.querySelector(`[data-merge-pull="${number}"]`);
    button?.addEventListener("click", async (event) => {
      if (event?.isTrusted === false) return;
      const out = section.querySelector(`[data-pull="${number}"]`)?.querySelector("[data-merge-result]");
      try {
        const merged = await host.mergePullRequest(number, head);
        out.textContent = `Merged as ${String(merged.commit).slice(0, 7)}.`;
        button.setAttribute("disabled", "");
      } catch (failure) {
        out.textContent = `Not merged: ${failure?.reason ?? failure?.message ?? failure}`;
      }
    });
  }
}

async function draw(target, context, params) {
  const { product, instance } = context;
  const instanceSnapshot = await instance.host.readSnapshot((await instance.host.repositoryInfo()).defaultBranch);
  const facts = await productFacts(product.host, instanceSnapshot, (commit) => instance.host.readSnapshot(commit), new Date(), { scope: "work" });
  const workflow = facts.workflow !== "unknown" ? facts.workflow : null;
  const participants = await participantsIn(context);
  if (facts.declaration === null || facts.model === null || facts.model === "unknown") {
    headOf(target, `<p class="warn" data-missing>${facts.declaration === null ? "No process model is declared for this product" : "The declared process model could not be read"}, so there is nothing to start. <a href="#process">Declare or open the process</a>; the plan or the backlog follows it (<a href="#plan">plan</a>, <a href="#backlog">backlog</a>).</p>`);
    return;
  }
  const ctx = await contextOf(context, facts);
  if (facts.model.kind !== "pulled") { await drawPlan(target, context, facts, ctx, participants, workflow, await machineryFor(context, ctx, instanceSnapshot, participants)); await drawPulls(target, context, facts); return; }
  const d = await derivedOf(context, ctx);
  const head = (body) => headOf(target, `<p data-backlog-link>This model works from a backlog: <a href="#backlog">open the backlog</a>.</p>${body}`);
  if (ctx.declaration === null || ctx.model === null) {
    head(`<p class="warn">No process model is declared for this product, so there is nothing to implement from. <a href="#process">Declare one</a>.</p>`);
    return;
  }
  const definition = await kindOf("implement");
  const info = await product.host.repositoryInfo();
  const productInfo = { visibility: info.visibility, jobWorkflow: WORKFLOWS.some((path) => ctx.snapshot.paths.includes(path)) };
  const asked = text(params?.sprint);
  const chosenSprint = asked ? ctx.sprints.find((record) => record.path.endsWith(`/${asked}.md`)) : null;
  const selection = chosenSprint ? new Set(list(chosenSprint.appended?.filter((section) => section.heading === "## Selection").at(-1)?.fields?.selection ?? chosenSprint.fields.selection)) : null;
  const items = ctx.items.map(idOf).filter((id) => (selection ? selection.has(id) : true))
    .filter((id) => (d.states.find((state) => state.item === id)?.state ?? "unknown") !== "done");

  const places = { ...(await placesOf(instanceSnapshot, ctx.snapshot.repository?.web ?? product.address)), mailbox: null };
  const now = () => new Date();
  const jobContextFor = (id, merges) => ({ kind: definition, params: { items: [id], merges }, product: { address: ctx.snapshot.repository?.web ?? product.address, snapshot: ctx.snapshot, host: product.host },
    instance: { snapshot: instanceSnapshot, host: instance.host, checkout: null }, connect: async () => product.host, participants, places, gates: [], person: personOf(context),
    now: now(), agentM: { version: instanceSnapshot.commit ?? "unknown", commit: instanceSnapshot.commit ?? "unknown" }, jobId: null });
  const prepareFor = (id, merges) => (participant) => prepareJob("implement", jobContextFor(id, merges), { drafter: participant, reviewers: [] });
  const rows = [];
  for (const id of items) {
    const state = d.states.find((each) => each.item === id) ?? { item: id, state: "unknown" };
    const { assignment, sprint, team } = assignmentOf(ctx, d, id);
    const verdict = startable(id, d.states, { workflow, assignment, sprint, held: d.held, wip: ctx.model?.flow?.wip ?? null, participants });
    const roles = implementingRoles(workflow);
    const holding = verdict.startable
      ? eligible(participants.filter((participant) => assignment && roles.some((role) => holdsRole(assignment, participant.name, role.name))), { capabilities: definition.needs }).eligible : [];
    const { offered: holders, withheld } = await placed(holding, prepareFor(id, "agent"));
    rows.push({ id, state, verdict, holders, withheld, team, sprint });
  }

  // The holders a linked source forbids, each with the finding's words naming the source and the place (UC-024 5b).
  const withheldText = (row) => (row.withheld.length ? `<p class="warn small" data-withheld-of="${h(row.id)}">${row.withheld.map(({ said }) => said.map(h).join("; ")).join("; ")}</p>` : "");
  const gatesText = (workflow?.gates ?? []).filter((gate) => implementingRoles(workflow).some((role) => (workflow.phases.find((phase) => phase.name === gate.from)?.roles ?? []).includes(role.name)))
    .map((gate) => `${h(gate.name)} (decided by ${h(gate.decider)})`);
  const body = rows.length === 0 ? `<p>No item is waiting to be implemented.</p>` : `<table class="list"><thead><tr><th></th><th>Item</th><th>State</th><th>Start</th></tr></thead><tbody>${rows.map((row) => `
    <tr data-item="${h(row.id)}" data-state="${h(row.state.state)}" data-startable="${row.verdict.startable}"><td>${row.verdict.startable ? `<input type="checkbox" data-start-item="${h(row.id)}"${params?.item && params.item !== row.id ? "" : " checked"} aria-label="Start ${h(row.id)}">` : ""}</td>
    <td>${h(row.id)}</td><td><span class="badge">${h(row.state.state)}</span></td>
    <td>${row.verdict.startable ? (row.holders.length === 0 ? `<p class="warn" data-reasons>${row.withheld.length ? "No holder of the implementing role is at a place the linked sources permit for this job." : "No holder of the implementing role can write and run tests."}</p>${withheldText(row)}` : `
      <label>Participant <select data-participant-of="${h(row.id)}">${row.holders.map((participant) => `<option value="${h(participant.name)}">${h(participant.name)}</option>`).join("")}</select></label>
      ${withheldText(row)}
      <p class="small" data-holders>${row.holders.map((participant) => `${h(participant.name)} processes data at ${h(participant.place ?? "no declared place")}; routes: ${routesFor(participant, participants, productInfo, []).map((offer) => `${h(recordRoute(offer.route))}${offer.available ? "" : " (not available)"}`).join(", ") || "none"}`).join("<br>")}</p>
      <p class="small">Attempt limit: ${h(definition.limit)}. Merges: <select data-merges-of="${h(row.id)}"><option value="agent">the coding agent</option><option value="person">a person</option></select>.
        Target branch: ${h(text(row.sprint?.fields?.branch) || info.defaultBranch)}. ${gatesText.length ? `Gates: ${gatesText.join(", ")}.` : "No gate stands before the merge."}</p>
      <div data-sent="${h(row.id)}"></div>`) : `<ul data-reasons>${row.verdict.reasons.map((reason) => `<li>${h(reason)}</li>`).join("")}</ul>`}</td></tr>`).join("")}</tbody></table>
    <p><button type="button" data-start-jobs>Start jobs</button></p><div data-start-result></div>`;
  head(body);

  // What is sent where, for the participant chosen on each startable row: the job is prepared, nothing is sent.
  const taken = new Set(ctx.snapshot.paths.map((path) => JOB_FILE.exec(path)?.[1]).filter(Boolean));
  const choice = (id) => target.querySelector(`[data-participant-of="${id}"]`)?.value;
  const merges = (id) => target.querySelector(`[data-merges-of="${id}"]`)?.value ?? "agent";
  const drawSent = async (row) => {
    const place = target.querySelector(`[data-sent="${row.id}"]`);
    const participant = row.holders.find((each) => each.name === choice(row.id)) ?? row.holders[0];
    if (!place || !participant) return;
    try { place.innerHTML = (await sentFor(prepareFor(row.id, merges(row.id)), participant)).html; } catch (failure) { place.innerHTML = `<p class="warn">${h(failure?.message ?? failure)}</p>`; }
  };
  for (const row of rows.filter((each) => each.verdict.startable && each.holders.length)) {
    await drawSent(row);
    target.querySelector(`[data-participant-of="${row.id}"]`)?.addEventListener("change", () => drawSent(row));
  }

  target.querySelector("[data-start-jobs]")?.addEventListener("click", async (event) => {
    if (event?.isTrusted === false) return;
    const out = target.querySelector("[data-start-result]");
    const chosen = rows.filter((row) => row.verdict.startable && row.holders.length && isTicked(target.querySelector(`[data-start-item="${row.id}"]`)));
    if (chosen.length === 0) { out.innerHTML = `<p class="warn">No startable item is ticked: nothing starts.</p>`; return; }
    const lines = [];
    for (const row of chosen) {
      const participant = row.holders.find((each) => each.name === choice(row.id)) ?? row.holders[0];
      try {
        const offer = routesFor(participant, participants, productInfo, []).find((each) => each.available);
        if (!offer) throw new Error(`${participant.name} has no route a job can take`);
        const { prepared } = await sentFor(prepareFor(row.id, merges(row.id)), participant);
        const id = newJobId(now(), taken);
        taken.add(id);
        const record = { id, kind: "implement", worksOn: [row.id], participant: participant.name, model: participant.model, route: recordRoute(offer.route), run: null, retries: null, startedBy: personOf(context), start: now(),
          agentM: { version: instanceSnapshot.commit ?? "unknown", commit: instanceSnapshot.commit ?? "unknown" }, inputs: prepared.parts.map((part) => part.name), limit: prepared.limit,
          destinations: prepared.destinations.map((each) => ({ participant: each.participant.name, place: each.place, parts: each.parts })), params: { items: [row.id], merges: merges(row.id) } };
        const defaultBranch = (await product.host.repositoryInfo()).defaultBranch;
        const head = (await product.host.readSnapshot(defaultBranch)).commit;
        const queued = await queueJob(product.host, record, offer.route, head, bridgesOf([participant], context.store)[offer.route.bridge]);
        lines.push(`<li>${h(row.id)}: job ${h(id)} (<code>${h(queued.path)}</code>) is queued on the route ${h(recordRoute(offer.route))}.</li>`);
      } catch (failure) {
        lines.push(`<li class="warn">${h(row.id)}: ${h(failure?.name === "WorkflowMissing" ? `the job workflow is missing (${(failure.files ?? []).join(", ")})` : failure?.message ?? failure)}; nothing was started for it.</li>`);
      }
    }
    out.innerHTML = `<ul>${lines.join("")}</ul>`;
  });
  await drawPulls(target, context, facts);
}

export const route = {
  name: "implement",
  entry: "implementation",
  title: "Implement",
  async render(target, context, params = {}) {
    try {
      await draw(target, context, params);
    } catch (failure) {
      target.innerHTML = `<section class="panel"><h2>Implement</h2><p class="warn">${h(failure?.message ?? failure)}</p></section>`;
    }
  },
};

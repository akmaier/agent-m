// MOD-prompt-bar, hand-over.mjs — a hand-over the participant proposed (docs/architecture/MOD-prompt-bar.md: Interfaces, startPromptBar; UC-049 4a): whether it may start,
// the route it would take, and queuing it. assess reads the product's facts for the scope `work` and asks MOD-work-plans' startable for each item or step of the product's plan
// the hand-over works on, with the proposed participant as the only participant, so that startable's own check of the implementing role (MOD-product-process' holdsRole) is the
// check of this participant: this file repeats no rule of the work plans. queue prepares the job of the kind the participant named and hands it over with MOD-runtimes'
// handOverJob; the bar calls it only on a person's click.
//
// Module: MOD-prompt-bar
//
// NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; A JOB GOES ONLY TO A HOLDER OF ITS ROLE; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK. assess writes and queues nothing. The task's
// words reach no record and no commit through this file: they are the `instruction` of the job prepared in memory and the `task` handOverJob carries to the run.
// Readings of the module file this file takes (the pull request names them):
//   - startable's context: the role assignment and the sprint are those of the team whose sprint holds the item (`facts.held`, which MOD-work-plans' heldItems derives, naming the sprint
//     and the team); where no sprint holds it, both are null — except in a model without sprints, where the product's one role assignment is the item's (MOD-work-plans, Data: "the
//     product's one in a model without sprints"). The work-in-progress limit is the workflow's `model.flow.wip`.
//   - routesFor is given the repository's visibility from the host's repositoryInfo, whether the product holds Agent M's job workflow (one of the two files below, as the review pages
//     look for them), and no resource needs: the scope `work` reads none.
//   - The job's parameters name what the hand-over works on as the parameters `requirements`, `useCases` and `items` of the kinds that rest on them; the task is no parameter.

import { newJobId } from "../job-ledger/index.mjs";
import { prepareJob } from "../job-runner/index.mjs";
import { productFacts } from "../progress-measures/index.mjs";
import { handOverJob, routesFor, tabContext } from "../runtimes/index.mjs";
import { startable } from "../work-plans/index.mjs";
import { readParticipants } from "./offer.mjs";
import { connectionsOf, defaultSnapshot, personOf } from "./send.mjs";

const WORKFLOWS = [".github/workflows/agent-m-jobs.yml", ".gitlab/agent-m-jobs.yml"];

/** recordRoute(route: Route) -> string — the route as a job's record writes it: `ci hosted`, `ci runner:<label>`, `bridge <name>`. */
export const recordRoute = (route) => (route.kind === "tab" ? "tab" : route.kind === "ci" ? (route.runner === "hosted" ? "ci hosted" : `ci runner:${route.runner}`) : `bridge ${route.bridge}`);

/** worksOnOf(handOver: { works_on }) -> string[] — what the hand-over works on, as a list. */
export const worksOnOf = (handOver) => [handOver.works_on].flat().filter(Boolean).map(String);

// The team's role assignment and sprint that startable is asked with for an item (see the readings above).
function teamOf(item, facts, workflow) {
  const held = facts.held.find((each) => each.item === item);
  if (held) {
    return { assignment: facts.assignments.find((each) => each.path.endsWith(`/${held.team}.md`)) ?? null,
      sprint: facts.sprints.find((each) => each.path.endsWith(`/${held.sprint}.md`)) ?? null };
  }
  if (workflow?.model?.flow?.sprints !== true && facts.assignments.length === 1) return { assignment: facts.assignments[0], sprint: null };
  return { assignment: null, sprint: null };
}

/**
 * assess({ handOver, participant, instance, page }) -> Promise<{ reasons: string[], route: Route | null, routeText: string, facts, head: string, instanceSnapshot, participants }> — whether the
 * hand-over { kind, works_on, task } of `participant` may start, now: for each item or step of the product's plan that it works on, the reasons startable gives (none: it may start); and the route
 * routesFor gives it, with `routeText` the route as the record writes it, or why none is offered. `page` is { address, host } of the repository the conversation is held on; `head` is the commit
 * the facts were read at. Reads through the hosts and writes nothing; throws what the hosts throw.
 */
export async function assess({ handOver, participant, instance, page }) {
  const instanceSnapshot = await defaultSnapshot(instance.host);
  const participants = await readParticipants(instanceSnapshot);
  const facts = await productFacts(page.host, instanceSnapshot, (commit) => instance.host.readSnapshot(commit), new Date(), {}, { scope: "work" });
  const workflow = facts.workflow === "unknown" ? null : facts.workflow;
  const wip = workflow?.model?.flow?.wip ?? null;
  const reasons = [];
  for (const item of worksOnOf(handOver).filter((id) => facts.plan.states.some((state) => state.item === id))) {
    const { assignment, sprint } = teamOf(item, facts, workflow);
    const verdict = startable(item, facts.plan.states, { workflow, assignment, sprint, held: facts.held, wip, participants: [participant] });
    if (!verdict.startable) reasons.push(...verdict.reasons);
  }
  const { visibility } = await page.host.repositoryInfo();
  const jobWorkflow = WORKFLOWS.some((path) => facts.snapshot.paths.includes(path));
  const offers = routesFor(participant, participants, { visibility, jobWorkflow }, []);
  const taken = offers.find((each) => each.route.kind !== "tab" && each.available) ?? null;
  const refused = offers.find((each) => each.route.kind !== "tab") ?? null;
  const routeText = taken ? recordRoute(taken.route) : refused ? refused.reason
    : offers.length > 0 ? "this participant's route is this tab, which a hand-over does not take" : "this participant has no route a job takes";
  return { reasons, route: taken?.route ?? null, routeText, facts, head: facts.snapshot.commit, instanceSnapshot, participants };
}

// The parameters the job rests on: use cases, items and requirements by their names; any other identifier is in the record's `works_on` only.
function paramsOf(worksOn) {
  const useCases = worksOn.filter((name) => /^UC-\d+$/.test(name));
  const items = worksOn.filter((name) => /^ITM-\d+$/.test(name));
  const requirements = worksOn.filter((name) => !/^[A-Z]+-[A-Za-z0-9-]+$/.test(name));
  return { ...(requirements.length ? { requirements } : {}), ...(useCases.length ? { useCases } : {}), ...(items.length ? { items } : {}) };
}

/**
 * queue({ handOver, participant, assessment, store, instance, page, ofProduct, conversation }) -> Promise<{ id: string, path: string, commit: string, person: string }> — prepares the job of
 * the kind the participant named, with the task as its instruction, and hands it over on the route `assessment` found, as the person's commit on the head the facts were read at
 * (MOD-runtimes' handOverJob). `conversation` is the path of the conversation record the job names, or null. Throws NoToken when no token that writes to the page's repository is stored,
 * what prepareJob throws, and what handOverJob throws — NotStartable { findings } among it, with nothing written.
 */
export async function queue({ handOver, participant, assessment, store, instance, page, ofProduct, conversation }) {
  const { facts, route, instanceSnapshot, participants } = assessment;
  const person = personOf(store, facts.snapshot, ofProduct);
  if (person === null) throw Object.assign(new Error("no token that writes to this repository is stored in this browser"), { name: "NoToken" });
  const now = new Date();
  const id = newJobId(now, new Set(facts.jobs.map((row) => row.record.id)));
  const commit = instanceSnapshot.commit ?? "unknown";
  const agentM = { version: commit, commit };
  const worksOn = worksOnOf(handOver);
  const params = paramsOf(worksOn);
  const inputs = { product: { address: page.address, snapshot: facts.snapshot, host: page.host }, instance: { snapshot: instanceSnapshot, host: instance.host }, participants,
    places: { sources: {}, mailbox: null, contents: [] }, gates: [], person, agentM, jobId: id };
  const prepared = await prepareJob(handOver.kind, tabContext({ kind: null, params: { ...params, instruction: handOver.task }, ...inputs }), { drafter: participant, reviewers: [] });
  const start = { id, kind: handOver.kind, worksOn, participant: participant.name, model: participant.model ?? null, route: recordRoute(route), run: null, retries: null, startedBy: person,
    start: now, agentM, inputs: prepared.parts.map((part) => part.name), limit: prepared.limit, task: "with the hand-over", conversation: conversation ?? null,
    destinations: prepared.destinations.map((each) => ({ participant: each.participant.name, place: each.place ?? "", parts: each.parts })), params };
  const { endpoints, bridges } = connectionsOf(participant, store);
  const endpoint = endpoints[/^endpoint\s+(\S+)/.exec(participant.route ?? "")?.[1]]?.config ?? null;
  const target = { endpoint: route.kind === "ci" && endpoint ? { kind: endpoint.kind, baseUrl: endpoint.baseUrl, model: endpoint.model } : null,
    bridge: route.kind === "bridge" ? bridges[route.bridge] ?? null : null };
  const queued = await handOverJob(prepared, route, start, page.host, assessment.head, handOver.task, target);
  return { id, ...queued, person };
}

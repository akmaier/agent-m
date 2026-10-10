// Whether a job may start for a step or an item, and every reason it may not (docs/architecture/MOD-work-plans.md,
// Interfaces: startable; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT, NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED, NO
// JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT, A JOB GOES ONLY TO A HOLDER OF ITS ROLE). Pure: the states, the workflow, the
// role assignment, the sprint, the held items and the participants are handed in; nothing is read, written or kept.
//
// Module: MOD-work-plans
//
// A state is an ItemState — { item, state, reason, job, pullRequest } —, as itemStates derives it. An item's role assignment
// is the one of the team whose sprint holds it, and the product's one in a model without sprints; its team is named by the
// assignment's file, docs/role-assignments/<team>.md. The implementing role is the role of the workflow's phases that produce
// MOD, the modules' code. A reason is a sentence a person reads.

import { holdsRole } from "../product-process/index.mjs";
import { selectionOf, sprintOf } from "./sprints.mjs";

const text = (value) => (typeof value === "string" ? value : value === null || value === undefined ? "" : String(value));
const listed = (names) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`);
const teamOf = (assignment) => text(assignment?.path).split("/").pop().replace(/\.md$/, "") || "the product";

// Why an item in this state cannot start; null for a ready item.
function stateReason(item, state) {
  if (!state) return `${item} has no state: it is no item of the backlog and no step of the plan.`;
  const why = text(state.reason);
  switch (state.state) {
    case "ready": return null;
    case "waiting for acceptance": return `${item} realises ${why}, which is not accepted yet.`;
    case "waiting for an item it builds on": return `${item} builds on ${why}, which is not done.`;
    case "waiting": return `${item} waits for ${why}: no decision of it is recorded.`;
    case "in progress": return `${item} is in progress already.`;
    case "blocked": return `${item} is blocked${why ? `: ${why}` : ""}.`;
    case "done": return `${item} is done.`;
    default: return `The state of ${item} is unknown: the pull requests could not be read.`;
  }
}

// The roles of the workflow's phases that produce MOD, as the workflow names them, each with the capabilities it needs.
function implementingRoles(workflow) {
  const names = new Set((workflow?.phases ?? []).filter((phase) => (phase.produces ?? []).includes("MOD")).flatMap((phase) => phase.roles ?? []));
  return (workflow?.roles ?? []).filter((role) => names.has(role.name));
}

// Why no holder of the implementing role in the assignment can implement; null when one holder has all the role needs.
function holderReason(item, workflow, assignment, participants) {
  const roles = implementingRoles(workflow);
  if (!roles.length) return `The process names no role whose phase produces MOD, so no job implements ${item}.`;
  const team = teamOf(assignment);
  const parts = [];
  for (const role of roles) {
    const holders = (participants ?? []).filter((participant) => assignment && holdsRole(assignment, participant.name, role.name));
    const needs = role.capabilities ?? [];
    if (holders.some((holder) => needs.every((capability) => (holder.capabilities ?? []).includes(capability)))) return null;
    if (!holders.length) { parts.push(`${role.name} has no holder in ${team}`); continue; }
    const lacking = needs.filter((capability) => !holders.some((holder) => (holder.capabilities ?? []).includes(capability)));
    parts.push(`no holder of ${role.name} in ${team} has all it needs — ${listed(needs)}${lacking.length
      ? `; none can ${listed(lacking)}` : ""}`);
  }
  return `No job can implement ${item}: ${parts.join("; ")}.`;
}

/**
 * startable(item: string, states: ItemState[], context: { workflow: Workflow, assignment: Document, sprint: Document | null,
 * held: Held[], wip: number | null, participants: Participant[] }) -> { startable: true } | { startable: false, reasons:
 * string[] } — every reason a job for this step or item cannot start: its state, where it is not ready — a requirement or use
 * case it names not accepted, an item it builds on not done, the gate before its phase not recorded, or that it is under way
 * or done —; not selected for `sprint`, the current sprint of its team, or no such sprint, in a model with sprints; the
 * work-in-progress limit `wip` reached by the items in progress under `assignment`, its role assignment, naming them and
 * those waiting for review; no holder of the implementing role in `assignment` with what the role needs.
 * @param {string} item @param {object[]} states @param {object} context
 * @returns {{ startable: true } | { startable: false, reasons: string[] }}
 */
export function startable(item, states, context) {
  const { workflow, assignment, sprint = null, held = [], wip = null, participants = [] } = context ?? {};
  const all = states ?? [];
  const team = teamOf(assignment);
  const sprints = workflow?.model?.flow?.sprints === true;
  const reasons = [];

  const own = stateReason(item, all.find((state) => state?.item === item));
  if (own) reasons.push(own);

  if (sprints && !sprint) reasons.push(`No sprint of ${team} is running: ${item} can start only once one selects it.`);
  else if (sprints && !selectionOf(sprint).includes(item)) {
    reasons.push(`${item} is not selected for ${sprintOf(sprint)?.name ?? text(sprint.path)}, the current sprint of ${team}.`);
  }

  if (typeof wip === "number") {
    const under = sprints ? new Set((held ?? []).filter((entry) => entry.team === team).map((entry) => entry.item)) : null;
    const busy = all.filter((state) => state?.item !== item && state?.state === "in progress" && (!under || under.has(state.item)));
    if (busy.length >= wip) {
      const review = busy.filter((state) => state.pullRequest).map((state) => state.item);
      reasons.push(`The work-in-progress limit of ${wip} is reached under ${team}: ${listed(busy.map((state) => state.item))} `
        + `${busy.length === 1 ? "is" : "are"} in progress${review.length ? `, ${listed(review)} waiting for review` : ""}.`);
    }
  }

  const holder = holderReason(item, workflow, assignment, participants);
  if (holder) reasons.push(holder);

  return reasons.length ? { startable: false, reasons } : { startable: true };
}

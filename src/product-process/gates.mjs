// Who may decide a gate (MOD-product-process, Interfaces: mayDecide). index.mjs offers it. gateStates and
// recordGateDecision, which the module file places here too, are not built yet.
//
// Module: MOD-product-process
//
// A gate's decider is a role of the model, or `check: <CI check name>`, a check whose result decides (A GATE NAMES WHO
// DECIDES IT). Only a holder of the deciding role in the job's role assignment decides a gate (A GATE IS DECIDED WITHIN THE
// JOB'S ROLE ASSIGNMENT), and a decision by a participant whose work the gate checks does not pass it, even when it holds
// the role (A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS).

import { holdersOf } from "./assignments.mjs";

// A decider that is an automated check, whose result decides: `check: <CI check name>`.
const CHECK = /^check:[ \t]*(\S(?:.*\S)?)[ \t]*$/;

/**
 * mayDecide(participant: { name: string, kind: "person" | "agent" | "check" }, gate: string, workflow: Workflow,
 * assignment: Document, workBy: string[]) -> { may: true } | { may: false, reason: "not a holder of the deciding role" |
 * "did the work this gate checks" | "not the gate's check", holders: string[] } — whether a decision of `participant` would
 * pass the gate the workflow names `gate`. A gate decided by a check is passed only by that check, and `holders` is empty. A
 * gate decided by a role is passed only by a holder of that role in `assignment`, the job's role assignment, and `holders`
 * names them; a participant of `workBy`, whose work the gate checks, does not pass it, even when it holds the role.
 * Throws TypeError when the workflow has no gate of that name.
 * @param {{ name: string, kind: "person" | "agent" | "check" }} participant — who would decide: a participant by its name in
 *   the instance's list, or a CI check by its name
 * @param {string} gate — the gate as the workflow names it: `<phase> → <phase>`, or the requirement that adds it
 * @param {Workflow} workflow — the product's workflow, as workflowOf gives it
 * @param {Document} assignment — the job's role assignment, as readDocument returns it with roleAssignmentSchema
 * @param {string[]} workBy — the participants whose work the gate checks
 * @returns {{ may: true } | { may: false, reason: string, holders: string[] }}
 */
export function mayDecide(participant, gate, workflow, assignment, workBy) {
  const named = workflow.gates.find((candidate) => candidate.name === gate);
  if (!named) throw new TypeError(`mayDecide: the workflow has no gate ${gate}`);
  const check = CHECK.exec(named.decider);
  if (check) {
    return participant.kind === "check" && participant.name === check[1]
      ? { may: true } : { may: false, reason: "not the gate's check", holders: [] };
  }
  const holders = holdersOf(assignment, named.decider);
  if (participant.kind === "check" || !holders.includes(participant.name)) {
    return { may: false, reason: "not a holder of the deciding role", holders };
  }
  if (workBy.includes(participant.name)) return { may: false, reason: "did the work this gate checks", holders };
  return { may: true };
}

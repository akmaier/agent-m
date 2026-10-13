// Who may decide a gate, and the state of each gate (MOD-product-process, Interfaces: mayDecide, gateStates). index.mjs offers both.
// recordGateDecision, which the module file places here too, is not built yet.
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

// ---------------------------------------------------------------- the state of each gate
//
// gateStates reads the workflow, the records of docs/gates read with gateSchema, and the blobs of the artifacts the gates check; it keeps nothing. Where
// the module file leaves a reading open, this file takes the one it names:
//   - A record counts for a gate when its `gate` is the gate's name and its decider is the gate's: its `role` is the role the workflow names, or, for a gate decided by a
//     check, its `decider` is that `check: <name>`. Whether the participant held the role is mayDecide's, at the time of the decision. Of the records that count, the
//     newest by `date`, then by path, decides.
//   - A passed record's `on` holds `<path>@<blob>` for each artifact checked; it is `passed` when each equals the blob `texts` holds for the path, else `passed on an
//     earlier text`, the difference naming each path with the twelve digits of the blob it was checked at and of the one now ("no current text" where `texts` holds none).
//     An entry that is a commit or an address names no artifact and is not compared.
//   - A gate is reached when the phase it leaves is entered: the model's first phase is, and a phase is entered by a transition from an entered phase whose gate, if it has
//     one, is `passed`. A gate not reached is `not reached` whatever its records say.

const ARTIFACT = /^([^\s@]+)@([0-9a-f]{7,64})$/;
const short = (blob) => blob.slice(0, 12);

// The record that decides a gate, if any, among those that count for it.
function decidingRecord(gate, records) {
  const check = CHECK.exec(gate.decider);
  const counts = (record) => {
    const { gate: named, decider, role } = record.fields ?? {};
    if (named !== gate.name) return false;
    return check ? CHECK.exec(String(decider ?? ""))?.[1] === check[1] : role === gate.decider && !CHECK.test(String(decider ?? ""));
  };
  return records.filter(counts).sort((a, b) => String(a.fields.date).localeCompare(String(b.fields.date)) || String(a.path).localeCompare(String(b.path))).at(-1) ?? null;
}

// The state of a gate by its records alone, before it is known whether it is reached.
function verdictOf(gate, records, texts) {
  const record = decidingRecord(gate, records);
  if (!record) {
    const check = CHECK.exec(gate.decider);
    return { state: "pending", record: null, needs: check ? `the result of the check ${check[1]}` : `a decision by ${gate.decider}`, difference: null };
  }
  if (record.fields.decision !== "passed") return { state: "rejected", record: record.path, needs: null, difference: null };
  const differences = [];
  for (const entry of Array.isArray(record.fields.on) ? record.fields.on : []) {
    const artifact = ARTIFACT.exec(String(entry));
    if (!artifact) continue;
    const now = texts?.[artifact[1]];
    if (now !== artifact[2]) differences.push(`${artifact[1]}: checked ${short(artifact[2])}, ${typeof now === "string" ? `now ${short(now)}` : "no current text"}`);
  }
  return differences.length
    ? { state: "passed on an earlier text", record: record.path, needs: "a decision on the current text", difference: differences.join("; ") }
    : { state: "passed", record: record.path, needs: null, difference: null };
}

/**
 * gateStates(workflow: Workflow, records: Document[], texts: Record<string, string>) -> Array<{ gate: string, state: "passed" | "passed on an earlier text" |
 * "rejected" | "pending" | "not reached", record: string | null, needs: string | null, difference: string | null }> — each gate of the workflow, in its order
 * (STATUS IS DERIVED FROM THE RECORDS). `records` are the gate records, as readDocument gives them with gateSchema; `texts` are the blobs of the artifacts
 * the gates check, by path. Pure: nothing is written or kept.
 */
export function gateStates(workflow, records, texts) {
  const verdicts = new Map(workflow.gates.map((gate) => [gate.name, verdictOf(gate, records, texts)]));
  const entered = new Set(workflow.phases.length ? [workflow.phases[0].name] : []);
  for (let grew = true; grew;) {
    grew = false;
    for (const { from, to } of workflow.transitions) {
      if (!entered.has(from) || entered.has(to)) continue;
      const gate = workflow.gates.find((candidate) => candidate.from === from && candidate.to === to);
      if (!gate || verdicts.get(gate.name).state === "passed") { entered.add(to); grew = true; }
    }
  }
  return workflow.gates.map((gate) => (entered.has(gate.from)
    ? { gate: gate.name, ...verdicts.get(gate.name) }
    : { gate: gate.name, state: "not reached", record: null, needs: `the phase ${gate.from} to be entered`, difference: null }));
}

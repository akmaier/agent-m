// Who may decide a gate, and the state of each gate (MOD-product-process, Interfaces: mayDecide, gateStates). index.mjs offers both.
// recordGateDecision, which the module file places here too, writes a decision as a gate record.
//
// Module: MOD-product-process
//
// A gate's decider is a role of the model, or `check: <CI check name>`, a check whose result decides (A GATE NAMES WHO
// DECIDES IT). Only a holder of the deciding role in the job's role assignment decides a gate (A GATE IS DECIDED WITHIN THE
// JOB'S ROLE ASSIGNMENT), and a decision by a participant whose work the gate checks does not pass it, even when it holds
// the role (A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS).

import { holdersOf } from "./assignments.mjs";
import { readDocument, writeDocument } from "../documents/index.mjs";
import { blobSha } from "../text-tools/index.mjs";
// gateSchema is used only when a decision is recorded, long after both modules are loaded, so the cycle with index.mjs, which offers it, is harmless.
import { gateSchema } from "./index.mjs";

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

// ---------------------------------------------------------------- the record of a decision
//
// recordGateDecision turns a decision into one gate record. Where the module file leaves a reading open, this file takes the one it names:
//   - The record's `decider` is the participant's name, or `check: <name>` for a check; its `date` is `now` as `YYYY-MM-DD HH:MM UTC`, as the repository's own records give it.
//   - The path is docs/gates/<yyyymmdd>-<hhmm>-<gate slug>-<4 hex>.md, the slug the gate's name in lower case with every run of other characters as one `-`, the four hex digits the
//     first of the record text's blob SHA.
//   - The commit message is a subject line, then the trailers after an empty line, one per line; no trailer, no empty line.

// The failures of this function itself, named as MOD-repository-hosts' HostError is: `MayNotDecide { reason, holders }`, `ReasonMissing`. The host's own — Moved, TokenRefused,
// PermissionMissing, RateLimited, Unreachable — pass through as the host gave them.
class GateDecisionError extends Error {
  constructor(name, fields, message) {
    super(message);
    this.name = name;
    Object.assign(this, fields);
  }
}

const two = (n) => String(n).padStart(2, "0");

/**
 * recordGateDecision(host: Host, decision: { gate, job, decider: { name, kind }, role, decision: "passed" | "rejected", reason, on: string[] }, context: { workflow, assignment,
 * workBy: string[], head: string, now: Date, trailers: string[] }) -> Promise<{ commit: string, path: string }> — a decision on a gate, written as one gate record of gateSchema in
 * one commit on `head`, the head that was read, on the default branch `host.repositoryInfo()` names. mayDecide runs first: a decision it would not pass is refused with MayNotDecide
 * { reason, holders } and nothing is written; a rejection without a reason fails with ReasonMissing. `on` names each checked artifact as `<path>@<blob>`, or the commit; `trailers`
 * are a job's provenance lines, empty for a person's own decision. Moved and the other failures of the host's commitFiles pass through.
 */
export async function recordGateDecision(host, decision, context) {
  const { workflow, assignment, workBy, head, now, trailers } = context;
  const may = mayDecide(decision.decider, decision.gate, workflow, assignment, workBy);
  if (!may.may) throw new GateDecisionError("MayNotDecide", { reason: may.reason, holders: may.holders }, `${decision.decider.name} may not decide ${decision.gate}: ${may.reason}`);
  const reason = typeof decision.reason === "string" ? decision.reason.trim() : "";
  if (decision.decision === "rejected" && !reason) throw new GateDecisionError("ReasonMissing", {}, `a rejection of ${decision.gate} needs its reason`);
  const day = `${now.getUTCFullYear()}${two(now.getUTCMonth() + 1)}${two(now.getUTCDate())}`;
  const clock = `${two(now.getUTCHours())}${two(now.getUTCMinutes())}`;
  const slug = decision.gate.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
  const text = [
    "---",
    `gate: ${decision.gate}`,
    `job: ${decision.job ?? ""}`,
    `decider: ${decision.decider.kind === "check" ? `check: ${decision.decider.name}` : decision.decider.name}`,
    `role: ${decision.role}`,
    `decision: ${decision.decision}`,
    "on:",
    ...decision.on.map((entry) => `  - ${entry}`),
    `date: ${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6)} ${clock.slice(0, 2)}:${clock.slice(2)} UTC`,
    "---",
    `# ${decision.gate}`,
    "",
    "**REGISTER**",
    "",
    ...(reason ? ["## Reason", "", reason, ""] : []),
  ].join("\n");
  const canonical = writeDocument(gateSchema, readDocument(gateSchema, "docs/gates/-.md", text));
  const path = `docs/gates/${day}-${clock}-${slug}-${(await blobSha(canonical)).slice(0, 4)}.md`;
  const { defaultBranch } = await host.repositoryInfo();
  const subject = `gates: ${decision.gate} ${decision.decision} by ${decision.decider.name}`;
  const { commit } = await host.commitFiles({
    branch: defaultBranch, expectedHead: head, files: [{ path, text: canonical }],
    message: trailers.length ? `${subject}\n\n${trailers.join("\n")}` : subject,
  });
  return { commit, path };
}

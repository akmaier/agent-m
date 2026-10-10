// Gate readers for MOD-product-process: role membership, the derived state of gate records, and who may decide a gate.
// They read only the declaration, workflow, records and current blob identifiers their caller supplied.

import { rolesOf } from "./declaration.mjs";

const text = (value) => (typeof value === "string" ? value : "");
const list = (value) => (Array.isArray(value) ? value : []);
const checkName = (decider) => decider.startsWith("check: ") ? decider.slice("check: ".length) : null;

export function holdsRole(declaration, participant, role) {
  return rolesOf(declaration).some((assignment) => assignment.role === role && assignment.holders.includes(participant));
}

function gateOf(workflow, name) {
  return workflow?.gates?.find((gate) => gate.name === name) ?? null;
}

function holdersOf(workflow, gate) {
  if (checkName(gate.decider) !== null) return [];
  return [...(workflow.roles?.find((role) => role.name === gate.decider)?.holders ?? [])];
}

function validRecord(record, gate, workflow) {
  if (text(record?.fields?.gate) !== gate.name) return false;
  const check = checkName(gate.decider);
  if (check !== null) return text(record.fields.decider) === `check: ${check}`;
  return text(record.fields.role) === gate.decider && holdersOf(workflow, gate).includes(text(record.fields.decider));
}

function checkedNow(record, texts) {
  const on = list(record.fields.on);
  if (!on.length) return false;
  return on.every((entry) => {
    const at = entry.lastIndexOf("@");
    if (at < 1) return false;
    return texts[entry.slice(0, at)] === entry.slice(at + 1);
  });
}

function difference(record, texts) {
  return list(record.fields.on).map((entry) => {
    const at = entry.lastIndexOf("@");
    if (at < 1) return entry;
    const path = entry.slice(0, at);
    return `${path}@${entry.slice(at + 1)} → ${texts[path] ?? "missing"}`;
  }).join("\n");
}

function directState(gate, records, workflow, texts) {
  const matching = records.filter((candidate) => validRecord(candidate, gate, workflow));
  const record = matching.find((candidate) => text(candidate.fields.decision) === "passed" && checkedNow(candidate, texts))
    ?? matching[0];
  if (!record) return null;
  if (text(record.fields.decision) === "rejected") {
    return { gate: gate.name, state: "rejected", record: record.path, needs: null, difference: null };
  }
  if (checkedNow(record, texts)) {
    return { gate: gate.name, state: "passed", record: record.path, needs: null, difference: null };
  }
  return { gate: gate.name, state: "passed on an earlier text", record: record.path, needs: null, difference: difference(record, texts) };
}

export function gateStates(workflow, records, texts) {
  const gates = Array.isArray(workflow?.gates) ? workflow.gates : [];
  const stateByName = new Map();
  const output = gates.map((gate) => {
    const direct = directState(gate, records, workflow, texts);
    if (direct) {
      stateByName.set(gate.name, direct);
      return direct;
    }
    const before = gates.filter((candidate) => candidate.to === gate.from).map((candidate) => stateByName.get(candidate.name));
    const reached = before.length === 0 || before.some((state) => state?.state === "passed");
    const state = reached ? "pending" : "not reached";
    const result = { gate: gate.name, state, record: null,
      needs: reached ? `${gate.artifacts}: ${gate.condition}` : `a passed gate before ${gate.from}`,
      difference: null };
    stateByName.set(gate.name, result);
    return result;
  });
  return output;
}

export function mayDecide(participant, gateName, workflow, workBy) {
  const gate = gateOf(workflow, gateName);
  const name = text(participant?.name);
  const kind = text(participant?.kind);
  if (!gate) return { may: false, reason: "not the gate's check", holders: [] };
  const check = checkName(gate.decider);
  const holders = holdersOf(workflow, gate);
  if (check !== null) {
    if (kind !== "check" || name !== check) return { may: false, reason: "not the gate's check", holders };
    if (list(workBy).includes(name)) return { may: false, reason: "did the work this gate checks", holders };
    return { may: true };
  }
  if (!holders.includes(name)) return { may: false, reason: "not a holder of the deciding role", holders };
  if (list(workBy).includes(name)) return { may: false, reason: "did the work this gate checks", holders };
  return { may: true };
}

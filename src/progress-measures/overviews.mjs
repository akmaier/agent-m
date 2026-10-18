// The workflow's gates in their states (docs/architecture/MOD-progress-measures.md, Interfaces: gateOverview; UC-035 steps 3 and 3a,
// THE GATE IS RECORDED, STATUS IS DERIVED FROM THE RECORDS). Pure: the facts are handed in; nothing is read, written or kept.
//
// Module: MOD-progress-measures
//
// Where the module file leaves a reading open, this file takes the one it names:
//   - `decided` is given for each gate that has a record — passed, passed on an earlier text, rejected — and is null for pending and not reached.
//   - `by` is the record's `decider`, `date` its `date`, `on` the entries of its `on` joined by ", ", `record` its path.

/** The record of a gate, among the records the facts hold, by the path gateStates names. */
function decidedBy(facts, path) {
  const record = path === null ? undefined : facts.gates.find((candidate) => candidate.path === path);
  if (record === undefined) return null;
  const { decider, date, on } = record.fields;
  return { by: String(decider), date: String(date), on: (Array.isArray(on) ? on : [on]).join(", "), record: record.path };
}

/**
 * gateOverview(facts: Facts) -> Array<{ gate, state, decided: { by, date, on, record } | null, needs, difference, addedBy: { requirement, source } | null }> — the
 * workflow's gates in their order, each with the state gateStates gave it, who decided it, when and on which text, the record, what it still needs, the difference
 * where a record names a text that has changed since, and the requirement and source of a gate a process requirement adds. A workflow that is unknown or absent has no gate.
 * @param {object} facts MOD-progress-measures' Facts
 */
export function gateOverview(facts) {
  if (!Array.isArray(facts.workflow?.gates)) return [];
  return facts.workflow.gates.map((gate) => {
    const state = facts.gateStates.find((candidate) => candidate.gate === gate.name);
    return { gate: gate.name, state: state.state, decided: decidedBy(facts, state.record), needs: state.needs, difference: state.difference, addedBy: gate.addedBy };
  });
}

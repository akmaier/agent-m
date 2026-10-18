// The workflow's gates in their states (docs/architecture/MOD-progress-measures.md, Interfaces: gateOverview; UC-035 steps 3 and 3a,
// THE GATE IS RECORDED, STATUS IS DERIVED FROM THE RECORDS). Pure: the facts are handed in; nothing is read, written or kept.
//
// Module: MOD-progress-measures
//
// Where the module file leaves a reading open, this file takes the one it names:
//   - `decided` is given for each gate that has a record — passed, passed on an earlier text, rejected — and is null for pending and not reached.
//   - `by` is the record's `decider`, `date` its `date`, `on` the entries of its `on` joined by ", ", `record` its path.
//
// For whoWorksOnWhat (UC-035 step 5 and 1b):
//   - The participants of the product are those its role assignments name, in the order they first appear; a team is the file name of a role assignment,
//     as MOD-work-plans' Held names it, and is given only where the product has several role assignments.
//   - A job is current while it has not ended: queued, running, cancelling or waiting at a gate. Its identifier is the record's `id`.
//   - A source of jobs is the route its record names; a record that could not be read names none, so its path stands for the source. A source is listed once.

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

// The job states of a job that has not ended (MOD-job-ledger's JobState).
const CURRENT = new Set(["queued", "running", "cancelling", "waiting at a gate"]);

/**
 * whoWorksOnWhat(facts: Facts) -> { participants: Array<{ participant, roles, teams, jobs }>, held: Held[], unreachable: Array<{ route, reason }> } — each
 * participant of the product with its roles, its teams in a product with several teams, and its current jobs; what each team's sprint holds; and each source
 * of jobs that could not be read, whose running jobs are not shown.
 * @param {object} facts MOD-progress-measures' Facts
 */
export function whoWorksOnWhat(facts) {
  const several = facts.assignments.length > 1;
  const entries = new Map();
  for (const assignment of facts.assignments) {
    const team = /([^/]+)\.md$/.exec(assignment.path)?.[1] ?? assignment.path;
    for (const row of assignment.sections.flatMap((section) => section.rows ?? [])) {
      for (const name of row.cells.Participants) {
        const entry = entries.get(name) ?? { participant: name, roles: [], teams: [], jobs: [] };
        if (!entry.roles.includes(row.cells.Role)) entry.roles.push(row.cells.Role);
        if (several && !entry.teams.includes(team)) entry.teams.push(team);
        entries.set(name, entry);
      }
    }
  }
  const unreachable = [];
  for (const row of facts.jobs) {
    if (row.source.reachable) {
      if (CURRENT.has(row.state)) entries.get(row.record.participant)?.jobs.push(row.record.id);
      continue;
    }
    const route = row.record.route ?? row.record.path;
    if (!unreachable.some((seen) => seen.route === route && seen.reason === row.source.reason)) unreachable.push({ route, reason: row.source.reason });
  }
  return { participants: [...entries.values()], held: facts.held, unreachable };
}

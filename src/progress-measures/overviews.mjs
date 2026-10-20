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

// For blocked (UC-035 step 4; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED, SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES).
// Where the module file leaves a reading open, this file takes the one it names:
//   - An entry is an item or step of facts.plan.states with the first reason that applies, in the order of the plan; its `detail` is the sentence
//     the item's state gives (the gate and its decider are in it), or, for the two reasons only the facts can give, the sentence built here.
//   - A state `blocked` is a failed job or a job waiting at a gate by the state of the row of its job in facts.jobs; without that row it is not listed.
//   - A `ready` item is held by another team's sprint for each module it changes (facts.plan.items) that a held item of another team changes or uses;
//     the modules an item uses are not in the facts, so they are not compared.
//   - A `ready` item meets the work-in-progress limit (facts.model.flow.wip) when the items in progress under its team number at least the limit: in a
//     model with sprints those held by the same team's sprint, and none for an item no sprint holds; otherwise all of them.

const listed = (names) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`);
const modulesOf = (document) => {
  const value = document?.fields?.modules;
  return Array.isArray(value) ? value : String(value ?? "").split(",").map((part) => part.trim()).filter(Boolean);
};

// The modules `item` changes that a held item of another team changes or uses, one sentence for each, in the order of the held items and of the modules.
function heldBy(item, team, facts) {
  const changes = modulesOf(facts.plan.items.find((candidate) => candidate.id === item));
  const sentences = [];
  for (const other of facts.held) {
    if (other.team === team) continue;
    for (const module of [...new Set([...other.changes, ...other.uses])].sort()) {
      if (changes.includes(module)) sentences.push(`${module} is held by ${other.item} in ${other.sprint} of ${other.team}`);
    }
  }
  return sentences;
}

// The sentence of the work-in-progress limit when it keeps `item` from moving, else null.
function limitOf(item, team, facts) {
  const flow = facts.model?.flow;
  if (typeof flow?.wip !== "number" || (flow.sprints && team === undefined)) return null;
  const busy = facts.plan.states.filter((state) => state.state === "in progress"
    && (!flow.sprints || facts.held.some((entry) => entry.item === state.item && entry.team === team)));
  if (busy.length < flow.wip) return null;
  return `the limit of ${flow.wip} is reached${flow.sprints ? ` under ${team}` : ""}: ${listed(busy.map((state) => state.item))} ${busy.length === 1 ? "is" : "are"} in progress`;
}

/**
 * blocked(facts: Facts) -> Array<{ item, reason: "failed job" | "waiting at a gate" | "requirement not accepted" | "work-in-progress limit" | "held by another
 * team's sprint", detail }> — every item or plan entry that cannot move, each with its reason; for a gate, the role or check that decides it; for a held
 * module, the other team's sprint and the module.
 * @param {object} facts MOD-progress-measures' Facts
 */
export function blocked(facts) {
  const found = [];
  for (const state of facts.plan.states) {
    const entry = (reason, detail) => found.push({ item: state.item, reason, detail });
    if (state.state === "blocked") {
      const job = facts.jobs.find((row) => row.record.id === state.job);
      if (job?.state === "failed") entry("failed job", state.reason);
      else if (job?.state === "waiting at a gate") entry("waiting at a gate", state.reason);
    } else if (state.state === "waiting") entry("waiting at a gate", state.reason);
    else if (state.state === "waiting for acceptance") entry("requirement not accepted", state.reason);
    else if (state.state === "ready") {
      const team = facts.held.find((other) => other.item === state.item)?.team;
      const held = heldBy(state.item, team, facts);
      const limit = limitOf(state.item, team, facts);
      if (held.length) entry("held by another team's sprint", held.join("; "));
      else if (limit !== null) entry("work-in-progress limit", limit);
    }
  }
  return found;
}

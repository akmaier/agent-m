// Progress in the declared model's measure (docs/architecture/MOD-progress-measures.md, Interfaces: progressIn; PROGRESS IS
// SHOWN IN THE MODEL'S OWN MEASURE, PROGRESS AND JOB STATE ARE DERIVED, NOT STORED). Of progressIn, this builds the burn-down
// of each team's sprint, for a model that works in sprints — with a time box of a fixed length, or without one, until the
// sprint ends —; the grid of a planned model and the board's flow are not built yet, and are null. Pure: the facts and the day
// are handed in; nothing is read, written or kept.
//
// Module: MOD-progress-measures
//
// A team's sprint is the record docs/backlog/sprints/<team>/<nn>.md, read with MOD-work-plans' planSchemas.sprint; a team's
// newest sprint is its running one while it is neither closed — its record holds ## Review — nor past its end, else its last.
// An item is done on the day a pull request naming it — in its head branch or its title — is merged.

const DAY = 86400000;
const SPRINT_PATH = /^docs\/backlog\/sprints\/([^/]+)\/(\d+)\.md$/;
const ASSIGNMENT_PATH = /^docs\/role-assignments\/([^/]+)\.md$/;

/** A failure of progressIn, named as MOD-progress-measures' file names it. */
class ProgressError extends Error {
  constructor(name, message) {
    super(message);
    this.name = name;
  }
}

const text = (value) => (typeof value === "string" ? value : value === null || value === undefined ? "" : String(value));
const list = (value) => (Array.isArray(value) ? value.map(text) : text(value).split(",").map((part) => part.trim()).filter(Boolean));
const nextDay = (day) => new Date(Date.parse(`${day}T00:00:00Z`) + DAY).toISOString().slice(0, 10);
const sectionsOf = (record, heading) => (record?.appended ?? []).filter((section) => section?.heading === heading);

// The items a sprint holds on a day: those of the last ## Selection appended on or before it, else those of its front matter.
function selectionOn(record, day) {
  const decisions = sectionsOf(record, "## Selection").filter((section) => section.fields?.selection && text(section.fields.at) <= day);
  return list(decisions.length ? decisions.at(-1).fields.selection : record?.fields?.selection);
}

// The day an item is done: the earliest day a merged pull request names it; null while none is merged.
function doneOn(item, pullRequests) {
  const naming = new RegExp(`(?<![A-Za-z0-9])${item}(?![0-9])`);
  const days = pullRequests.filter((pr) => pr?.state === "merged" && (naming.test(text(pr.branch)) || naming.test(text(pr.title))))
    .map((pr) => text(pr.merged).slice(0, 10)).filter(Boolean).sort();
  return days[0] ?? null;
}

// A team's sprint: its items with their states, the remaining items per day from its start to its end — to today while it
// runs —, and whether that burn-down is final. With the pull requests unknown, the burn-down is not guessed: it is empty.
function teamSprint(team, record, states, pullRequests, today) {
  const end = text(record.fields?.end) || text(sectionsOf(record, "## Ended")[0]?.fields?.at);
  const final = sectionsOf(record, "## Review").length > 0 || Boolean(end && end < today);
  const last = end && end < today ? end : today;
  const items = selectionOn(record, "9999-12-31").map((item) => states.find((s) => s?.item === item)
    ?? { item, state: "unknown", reason: null, job: null, pullRequest: null });
  const burnDown = [];
  if (pullRequests !== "unknown") {
    for (let day = text(record.fields?.start); day && day <= last; day = nextDay(day)) {
      const remaining = selectionOn(record, day).filter((item) => { const done = doneOn(item, pullRequests); return !done || done > day; });
      burnDown.push({ day, remaining: remaining.length });
    }
  }
  return { team, items, burnDown, final };
}

/**
 * progressIn(facts: Facts, now: Date) -> { measure, planned, sprints, flow, since } — the progress in the declared model's
 * measure. For a model that works in sprints, `sprints` holds, for each team — in the order of its role assignments, then any
 * other team with a sprint —, its newest sprint's items with their states and the remaining items per day of that sprint,
 * `final` once the sprint is closed or past its end; a team without a sprint has no entry. `planned` and `flow` are not built
 * yet and are null; `since` is the change of model, as the facts give it. Throws NoModel when the product declares none.
 * @param {object} facts @param {Date} now
 */
export function progressIn(facts, now) {
  const model = facts?.model;
  if (!model) throw new ProgressError("NoModel", "The product declares no process model, so it shows no progress in a model's measure.");
  const since = facts.modelSince ?? null;
  if (model === "unknown" || !model.flow?.sprints) {
    return { measure: model === "unknown" ? null : model.measure, planned: null, sprints: [], flow: null, since };
  }
  const today = now.toISOString().slice(0, 10);
  const states = facts.plan?.states ?? [];
  const pullRequests = facts.pullRequests === "unknown" ? "unknown" : (facts.pullRequests ?? []);
  const newest = new Map();
  for (const record of facts.sprints ?? []) {
    const match = SPRINT_PATH.exec(text(record?.path));
    if (match && (!newest.has(match[1]) || Number(match[2]) > newest.get(match[1]).number)) {
      newest.set(match[1], { number: Number(match[2]), record });
    }
  }
  const named = (facts.assignments ?? []).map((assignment) => ASSIGNMENT_PATH.exec(text(assignment?.path))?.[1]).filter(Boolean);
  const teams = [...new Set([...named, ...newest.keys()])].filter((team) => newest.has(team));
  return { measure: model.measure, planned: null,
    sprints: teams.map((team) => teamSprint(team, newest.get(team).record, states, pullRequests, today)), flow: null, since };
}

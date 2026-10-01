// Sprints, item states and the work-in-progress limit — a sprint record read into its parts, and the state of a backlog
// item derived from the accepted names, the job records and the pull requests passed in, with every reason that refuses
// its start (UC-032 steps 1, 6, 6a, 6b, 7, 7a; NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT, A TIME BOX WORKS ONLY ON WHAT
// WAS SELECTED FOR IT, AGILE IMPLEMENTATION STARTS FROM THE BACKLOG). Kernel (ARC-003): pure functions over the texts and
// data they are given — no clock, the day is passed in —; nothing is read, written or kept, and no state is stored in a
// sprint record (PROGRESS AND JOB STATE ARE DERIVED, NOT STORED).
//
// Module: MOD-work-items
//
// A sprint record is a Markdown file of docs/backlog/sprints/ with front matter
//
//   id: <name>   goal: <one line>   start: YYYY-MM-DD   end: YYYY-MM-DD or empty   closer:, branch:, model:, planned_by:
//   selection:   — a list of item identifiers ITM-<nnn>, in the order they are pulled
//
// In a model with a time box, `end` is the day the time box ends, recorded when the sprint starts; in a sprint without a
// time box it stays empty until every selected item is done or the Product Owner records the end (UC-032 6b).
//
// The data itemState reads, beside the item as parseItem gives it:
//   requirements, useCases — the product's accepted requirement names and accepted use cases (from MOD-review-core);
//   pullRequests — as MOD-git-host's pullRequests gives them: { number, title, head, base, state, openedAt, mergedAt, … };
//     one belongs to an item when its head branch or its title names the item's identifier;
//   jobs — job records: { id, item, state, start, waitsForPerson }, state one of the seven of ONE DASHBOARD SHOWS EVERY JOB;
//   wip — the model's flow control as parseModel reads it ({ wipLimit, timeBox, sprints }) with the model's `kind`, the
//     running `sprint` (as sprint() gives it, or null), the `backlog` (the identifiers of backlogOrder's order) and `today`
//     (YYYY-MM-DD).
// A reason is data, never a sentence (ARC-003 decision 5): { kind, rule, … }. The sentence a person reads is the dashboard's.

import { frontMatter } from "../work-items.mjs";

const LIVES = "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY";
const SELECTED = "A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT";
const WIP = "NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT";
const AGILE = "AGILE IMPLEMENTATION STARTS FROM THE BACKLOG";
const ACCEPTED = "NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED";
const DERIVED = "PROGRESS AND JOB STATE ARE DERIVED, NOT STORED";

const ITEM_ID = /^ITM-\d{3}$/;
const USE_CASE = /^UC-\d{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// The job states of ONE DASHBOARD SHOWS EVERY JOB that make an item in progress or blocked. A job done or cancelled says
// nothing about its item: its pull request does.
const RUNNING = new Set(["queued", "running"]);
const STOPPED = new Set(["failed", "ended without record"]);
const GATE = "waiting at a gate";

const finding = (artifact, line, kind, rule, what, fix) => ({ artifact, line, kind, rule, what, fix });
const scalar = (f) => (f && typeof f.value === "string" && f.value ? f.value : null);

// sprint(text) -> { id, goal, start, end, selection, closer, branch, model, plannedBy, lines, frontMatter, problems } — a
// value the record does not give is null; `problems` are findings: no front matter, no id, no start, a date that is no
// date, an end before the start, a selection that is no list, selects nothing, or names something other than an item, or
// an item twice.
export function sprint(text) {
  const lines = String(text ?? "").replace(/\r\n/g, "\n").split("\n");
  const { fields, end } = frontMatter(lines);
  const sel = fields.selection;
  const s = {
    id: scalar(fields.id), goal: scalar(fields.goal), start: scalar(fields.start), end: scalar(fields.end),
    selection: Array.isArray(sel?.value) ? [...sel.value] : [],
    closer: scalar(fields.closer), branch: scalar(fields.branch), model: scalar(fields.model), plannedBy: scalar(fields.planned_by),
    lines: { start: fields.start?.line ?? null, end: fields.end?.line ?? null, selection: sel?.line ?? null,
      selectionItems: sel?.items ?? [] },
    frontMatter: end > 0, problems: [],
  };
  const artifact = s.id ?? "sprint record";
  const problem = (line, rule, what, fix) => s.problems.push(finding(artifact, line, "error", rule, what, fix));
  if (!end) {
    problem(1, LIVES, "the sprint record has no front matter",
      "begin the record with front matter: id, goal, start, end, selection, closer, branch.");
    return s;
  }
  if (!s.id) problem(1, LIVES, "the sprint record has no id", "name the sprint in its front matter: id: <name>, as its file name.");
  if (!s.start) {
    problem(s.lines.start ?? 1, SELECTED, "the sprint has no start date", "record the day the sprint started: start: YYYY-MM-DD.");
  } else if (!DATE.test(s.start)) {
    problem(s.lines.start, SELECTED, `the start "${s.start}" is no date YYYY-MM-DD`, "write the start as YYYY-MM-DD.");
  }
  if (s.end && !DATE.test(s.end)) {
    problem(s.lines.end, SELECTED, `the end "${s.end}" is no date YYYY-MM-DD`,
      "write the end as YYYY-MM-DD, or leave it empty while the sprint runs without a time box.");
  } else if (s.end && s.start && DATE.test(s.start) && s.end < s.start) {
    problem(s.lines.end, SELECTED, `the end ${s.end} lies before the start ${s.start}`, "record an end on or after the start.");
  }
  if (scalar(sel)) {
    problem(sel.line, SELECTED, "the selection is not a list", "list the selected items under selection, one per line, as \"  - ITM-<nnn>\".");
  } else if (!s.selection.length) {
    problem(sel?.line ?? 1, SELECTED, "the sprint selects no item", "select the sprint's items under selection.");
  } else {
    const seen = new Set();
    s.selection.forEach((id, i) => {
      const line = s.lines.selectionItems[i] ?? s.lines.selection;
      if (!ITEM_ID.test(id)) {
        problem(line, SELECTED, `the selection names "${id}", which is no item ITM-<nnn>`, "name each selected item by its identifier.");
      } else if (seen.has(id)) {
        problem(line, SELECTED, `the selection names ${id} a second time`, "select each item once; remove the second line.");
      }
      seen.add(id);
    });
  }
  return s;
}

// A pull request names an item when its head branch or its title holds the identifier, not followed by a digit.
const naming = (id) => new RegExp(`(?<![A-Za-z0-9])${id}(?![0-9])`);
const names = (p, id) => {
  const re = naming(id);
  return re.test(String(p?.head ?? "")) || re.test(String(p?.title ?? ""));
};
const time = (t) => (t ? Date.parse(t) : NaN);

// What the pull requests and jobs say of one item: { state: "in progress" | "blocked" | "done" | null, reasons }.
// In progress — a pull request open (in review), or a job queued, running or waiting at a gate that does not wait for a
// person. Blocked — a job waits at a gate for a person, or the item's latest job failed or ended without record, unless a
// merge came after it. Done — a pull request merged. Open work counts before a block, a block before a merge.
function activity(id, pullRequests, jobs) {
  const prs = (pullRequests ?? []).filter((p) => p && names(p, id));
  const mine = (jobs ?? []).filter((j) => j && j.item === id);
  const open = prs.filter((p) => p.state === "open");
  const active = mine.filter((j) => RUNNING.has(j.state) || (j.state === GATE && j.waitsForPerson !== true));
  if (open.length || active.length) {
    return { state: "in progress", inReview: open.length > 0, reasons: [
      ...open.map((p) => ({ kind: "pull-request", rule: DERIVED, pullRequest: p })),
      ...active.map((j) => ({ kind: "job", rule: DERIVED, job: j }))] };
  }
  const merged = prs.filter((p) => p.state === "merged")
    .sort((a, b) => (time(b.mergedAt) || 0) - (time(a.mergedAt) || 0))[0] ?? null;
  // The latest job by its start; jobs without a start count in the order given, after those with one.
  const latest = mine.reduce((acc, j) => (!acc || !(time(j.start) < time(acc.start)) ? j : acc), null);
  const afterMerge = (j) => !merged || !(time(j.start) <= time(merged.mergedAt));
  const blocking = [
    ...mine.filter((j) => j.state === GATE && j.waitsForPerson === true),
    ...(latest && STOPPED.has(latest.state) && afterMerge(latest) ? [latest] : []),
  ];
  if (blocking.length) {
    return { state: "blocked", inReview: false, reasons: blocking.map((j) => ({ kind: "job", rule: DERIVED, job: j })) };
  }
  if (merged) return { state: "done", inReview: false, reasons: [{ kind: "pull-request", rule: DERIVED, pullRequest: merged }] };
  return { state: null, inReview: false, reasons: [] };
}

// The items that hold a slot of the limit: in progress or blocked — started and not merged (docs/process.md, *Sprint*) —,
// each named by a pull request or a job, of the backlog where one is given. The item asked about is not among them: it is
// neither in progress nor blocked, or it would not be asked about.
function holding(pullRequests, jobs, backlog) {
  const ids = new Set();
  for (const p of pullRequests ?? []) {
    for (const m of `${p?.head ?? ""} ${p?.title ?? ""}`.matchAll(/(?<![A-Za-z0-9])(ITM-\d{3})(?![0-9])/g)) ids.add(m[1]);
  }
  for (const j of jobs ?? []) if (j && ITEM_ID.test(String(j.item))) ids.add(j.item);
  const known = Array.isArray(backlog) ? new Set(backlog) : null;
  return [...ids].filter((id) => !known || known.has(id)).sort()
    .map((id) => ({ id, ...activity(id, pullRequests, jobs) }))
    .filter((a) => a.state === "in progress" || a.state === "blocked")
    .map(({ id, state, inReview }) => ({ id, state, inReview }));
}

// The sprint is the current one at `today`: begun, and not ended — with a time box its end date has not passed, without
// one no end is recorded.
function sprintRefusal(s, wip) {
  const today = typeof wip.today === "string" && DATE.test(wip.today) ? wip.today : null;
  if (today && s.start && today < s.start) return { kind: "sprint-not-started", rule: SELECTED, sprint: s.id, start: s.start };
  if (s.end && (!wip.timeBox || (today && today > s.end))) return { kind: "sprint-ended", rule: SELECTED, sprint: s.id, end: s.end };
  return null;
}

// What refuses the start of an item that is not under way: a pulled model's backlog without it, a sprint that does not
// select it, the limit reached.
function startRefusals(id, wip, pullRequests, jobs) {
  const out = [];
  if (wip.kind === "pulled" && !(Array.isArray(wip.backlog) ? wip.backlog : []).includes(id)) {
    out.push({ kind: "not-in-backlog", rule: AGILE });
  }
  if (wip.sprints === true) {
    const s = wip.sprint ?? null;
    const ended = s ? sprintRefusal(s, wip) : null;
    if (!s) out.push({ kind: "no-sprint", rule: SELECTED });
    else if (ended) out.push(ended);
    else if (!(s.selection ?? []).includes(id)) out.push({ kind: "not-selected", rule: SELECTED, sprint: s.id });
  }
  if (Number.isInteger(wip.wipLimit) && wip.wipLimit > 0) {
    const inProgress = holding(pullRequests, jobs, wip.backlog);
    if (inProgress.length >= wip.wipLimit) out.push({ kind: "wip-limit", rule: WIP, limit: wip.wipLimit, inProgress });
  }
  return out;
}

// itemState(item, { requirements, useCases, jobs, pullRequests, wip }) -> { state, reasons } — the state of UC-032 step 1:
// in progress, blocked or done from the pull requests and jobs that name the item, each named as a reason; otherwise
// waiting for acceptance, with each name the item realises that is not accepted, or ready. For an item waiting or ready,
// `reasons` also holds what refuses its start: not in a pulled model's backlog, outside the running sprint's selection or
// with no sprint running, the work-in-progress limit reached (with the limit and the items that hold it). A start is
// allowed exactly when the state is "ready" and no reason stands. Without an item, the state is null, and a pulled model
// refuses the start: an implementation job implements one item of the backlog.
export function itemState(item, { requirements = [], useCases = [], jobs = [], pullRequests = [], wip = {} } = {}) {
  const flow = wip ?? {};
  if (!item || !item.id) {
    return { state: null, reasons: flow.kind === "pulled" ? [{ kind: "no-item", rule: AGILE }] : [] };
  }
  const now = activity(item.id, pullRequests, jobs);
  if (now.state) return { state: now.state, reasons: now.reasons };
  const reqs = new Set(requirements ?? []), ucs = new Set(useCases ?? []);
  const reasons = (item.realises ?? []).filter((n) => !(USE_CASE.test(n) ? ucs.has(n) : reqs.has(n)))
    .map((name) => ({ kind: "not-accepted", rule: ACCEPTED, name }));
  const state = reasons.length ? "waiting for acceptance" : "ready";
  return { state, reasons: [...reasons, ...startRefusals(item.id, flow, pullRequests, jobs)] };
}

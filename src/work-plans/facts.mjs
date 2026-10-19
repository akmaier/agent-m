// The facts of a sprint (docs/architecture/MOD-work-plans.md, Interfaces: sprintFacts; UC-041 steps 2 and 5; A SPRINT ENDS WITH A REVIEW OF ITS
// INCREMENT, A SPRINT ENDS WITH A RETROSPECTIVE, PROGRESS AND JOB STATE ARE DERIVED, NOT STORED, NO COST IS GUESSED). Nothing is read or written
// here: the states, job rows, pull requests and the snapshot of the branch test-results are handed in.
//
// Module: MOD-work-plans

import { flakyTests } from "../result-records/index.mjs";
import { naming, selectionOf } from "./sprints.mjs";

const text = (value) => (typeof value === "string" ? value : value === null || value === undefined ? "" : String(value));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
// The names a pull request's body lists on a line "<label>: a, b".
const bodyList = (body, label) => {
  const line = text(body).split("\n").find((each) => each.startsWith(`${label}:`));
  return line ? line.slice(label.length + 1).split(",").map((part) => part.trim()).filter(Boolean) : [];
};

// The cost of the rows: the sum of the known ones per currency; "unknown" where none is known.
function costOf(rows) {
  const sums = new Map();
  let unknown = 0;
  for (const { cost } of rows) {
    if (cost?.known === true) sums.set(cost.currency, (sums.get(cost.currency) ?? 0) + cost.amount);
    else unknown += 1;
  }
  if (sums.size === 0) return "unknown";
  const sum = [...sums].map(([currency, amount]) => `${amount} ${currency}`).join(" + ");
  return unknown ? `${sum}, for the jobs whose cost is known` : sum;
}

/**
 * sprintFacts(sprint, facts: { states, jobs, results, pullRequests, issues }) -> Promise<{ increment, notDone, numbers }> — see MOD-work-plans;
 * async because MOD-result-records' flakyTests, which it calls once for the head of each merged pull request of the increment, is.
 */
export async function sprintFacts(sprint, facts) {
  const selection = selectionOf(sprint);
  const pullRequests = facts.pullRequests ?? [];
  const increment = [], heads = new Set();
  for (const item of selection) {
    const merged = pullRequests.find((pullRequest) => pullRequest?.state === "merged" && naming(pullRequest, item));
    if (!merged) continue;
    increment.push({ item, pullRequest: text(merged.number), realises: bodyList(merged.body, "Realises"), tests: bodyList(merged.body, "Tests") });
    heads.add(merged.head);
  }
  const done = new Set(increment.map((each) => each.item));
  const notDone = selection.filter((item) => !done.has(item)).map((item) => (facts.states ?? []).find((state) => state.item === item)
    ?? { item, state: "unknown", reason: "no state is known for it", job: null, pullRequest: null });

  const rows = (facts.jobs ?? []).filter((row) => (row.record?.worksOn ?? []).some((item) => selection.includes(item)));
  const gates = rows.flatMap((row) => row.record.gates ?? []);
  const waiting = rows.filter((row) => row.record.question || (row.record.end?.results ?? []).includes("waits for a person")).length;
  const flaky = new Set();
  for (const head of heads) for (const { test } of await flakyTests(facts.results, head)) flaky.add(test);
  return {
    increment, notDone,
    numbers: {
      failedJobs: rows.filter((row) => row.state === "failed").length,
      retriedJobs: rows.filter((row) => row.record.retries).length,
      correctionRounds: rows.reduce((sum, row) => sum + (row.record.end?.rounds?.length ?? 0), 0),
      waitingAtGates: gates.length ? `${plural(gates.length, "gate", "gates")} reached, ${gates.filter((gate) => !gate.resumedBy).length} not resumed` : "none",
      waitingForAPerson: waiting ? plural(waiting, "job", "jobs") : "none",
      flakyTests: [...flaky].sort(),
      cost: costOf(rows),
    },
  };
}

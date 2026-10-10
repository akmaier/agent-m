// The derived state of a plan step or backlog item, and the reasons it cannot start (MOD-work-plans, Interfaces).
// All records are supplied by the caller; this file reads and writes nothing.

import { holdsRole } from "../product-process/index.mjs";

const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === "string" ? value : "";
const idOf = (item) => text(item?.id) || text(item?.fields?.id);
const fieldsOf = (item) => item?.fields ?? {};
const named = (values) => list(values).filter((value) => typeof value === "string" && value);

function orderedItems(items, order) {
  const byId = new Map(items.map((item) => [idOf(item), item]));
  const entries = [];
  for (const section of list(order?.sections)) {
    for (const row of list(section?.rows)) {
      const name = text(row?.cells?.Item) || text(row?.cells?.Step);
      if (name && byId.has(name) && !entries.some((entry) => idOf(entry.item) === name)) {
        entries.push({ item: byId.get(name), phase: text(row?.cells?.Phase) });
      }
    }
  }
  for (const item of items) if (!entries.some((entry) => idOf(entry.item) === idOf(item))) entries.push({ item, phase: "" });
  return entries;
}

function statusOf(statuses, name) {
  for (const [key, value] of statuses instanceof Map ? statuses : []) {
    if (key === name || value?.id === name) return value?.status ?? null;
  }
  return null;
}

function gatesBefore(phase, gates, workflow) {
  if (!phase) return [];
  return list(workflow?.gates).filter((gate) => gate.to === phase
    && list(gates).find((candidate) => candidate.gate === gate.name)?.state !== "passed");
}

function jobFor(item, jobs) {
  const name = idOf(item);
  return list(jobs).find((row) => list(row?.record?.worksOn).includes(name)) ?? null;
}

function pullFor(item, pullRequests) {
  const name = idOf(item);
  return list(pullRequests).find((pull) => pull?.branch === name || text(pull?.title).includes(name)) ?? null;
}

function state(item, phase, states, facts) {
  const name = idOf(item);
  const realises = named(fieldsOf(item).realises);
  const unaccepted = realises.filter((artifact) => statusOf(facts.statuses, artifact) !== "accepted");
  const prerequisites = named(fieldsOf(item).builds_on).filter((dependency) => states.get(dependency)?.state !== "done");
  const gates = gatesBefore(phase, facts.gates, facts.workflow);
  const reasons = [
    ...unaccepted.map((artifact) => `${artifact} is not accepted`),
    ...prerequisites.map((dependency) => `${dependency} is not done`),
    ...gates.map((gate) => `${gate.name} is not recorded by ${gate.decider}`),
  ];
  const reason = reasons.join("; ");
  if (unaccepted.length) return { item: name, state: "waiting for acceptance", reason, job: null, pullRequest: null };

  if (prerequisites.length) return { item: name, state: "waiting for an item it builds on", reason, job: null, pullRequest: null };
  if (gates.length) return { item: name, state: "waiting", reason, job: null, pullRequest: null };

  const job = jobFor(item, facts.jobs);
  if (job?.state === "failed" || job?.state === "waiting at a gate") {
    return { item: name, state: "blocked", reason: `job ${job.record?.id ?? name} ${job.state}`, job: job.record?.id ?? null, pullRequest: null };
  }
  if (["queued", "running", "cancelling"].includes(job?.state)) {
    return { item: name, state: "in progress", reason: `job ${job.record?.id ?? name} ${job.state}`, job: job.record?.id ?? null, pullRequest: null };
  }

  if (facts.pullRequests === "unknown") return { item: name, state: "unknown", reason: "pull request facts are unknown", job: null, pullRequest: null };
  const pullRequest = pullFor(item, facts.pullRequests);
  if (pullRequest?.state === "merged") return { item: name, state: "done", reason: null, job: null, pullRequest: String(pullRequest.number) };
  if (pullRequest?.state === "open") return { item: name, state: "in progress", reason: `pull request ${pullRequest.number} is open for review`, job: null, pullRequest: String(pullRequest.number) };
  return { item: name, state: "ready", reason: null, job: null, pullRequest: null };
}

/**
 * itemStates(items, order, facts) -> ItemState[] — each supplied item in the supplied order, with its state derived
 * from supplied records only.
 */
export function itemStates(items, order, facts) {
  const states = new Map();
  for (const { item, phase } of orderedItems(list(items), order)) {
    const result = state(item, phase, states, facts ?? {});
    states.set(result.item, result);
  }
  return [...states.values()];
}

function implementingRole(workflow) {
  return list(workflow?.phases).find((phase) => list(phase.produces).includes("MOD"))?.role ?? "Developers";
}

/**
 * startable(item, states, context) -> { startable: true } | { startable: false, reasons: string[] } — every supplied
 * refusal for starting work on an item.
 */
export function startable(item, states, context) {
  const reasons = [];
  const current = list(states).find((state) => state.item === item);
  if (!current) reasons.push(`${item} has no derived state`);
  else if (current.state !== "ready") reasons.push(current.reason ?? `${item} is ${current.state}`);

  const selection = context?.sprint?.fields?.selection;
  if (Array.isArray(selection) && !selection.includes(item)) reasons.push(`${item} is not selected for the current sprint`);

  const active = list(states).filter((state) => state.state === "in progress");
  if (typeof context?.wip === "number" && active.length >= context.wip) {
    reasons.push(`the WIP limit ${context.wip} is reached by ${active.map((state) => state.item).join(", ")}`);
  }

  const role = implementingRole(context?.workflow);
  const needs = list(context?.workflow?.roles).find((candidate) => candidate.name === role)?.capabilities ?? [];
  const holder = list(context?.participants).find((participant) => holdsRole(context?.declaration, participant.name, role)
    && needs.every((need) => list(participant.capabilities).includes(need)));
  if (!holder) reasons.push(`no holder of ${role} has ${needs.join(", ")}`);

  return reasons.length ? { startable: false, reasons } : { startable: true };
}

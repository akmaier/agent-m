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
  const names = [];
  for (const section of list(order?.sections)) {
    for (const row of list(section?.rows)) {
      const name = text(row?.cells?.Item) || text(row?.cells?.Step);
      if (name && byId.has(name) && !names.includes(name)) names.push(name);
    }
  }
  for (const item of items) if (!names.includes(idOf(item))) names.push(idOf(item));
  return names.map((name) => byId.get(name));
}

function statusOf(statuses, name) {
  for (const [key, value] of statuses instanceof Map ? statuses : []) {
    if (key === name || value?.id === name) return value?.status ?? null;
  }
  return null;
}

function gateBefore(item, gates, workflow) {
  const phase = text(fieldsOf(item).phase);
  if (!phase) return null;
  const gate = list(workflow?.gates).find((candidate) => candidate.to === phase);
  if (!gate) return null;
  const state = list(gates).find((candidate) => candidate.gate === gate.name)?.state;
  return state === "passed" ? null : gate;
}

function jobFor(item, jobs) {
  const name = idOf(item);
  return list(jobs).find((row) => list(row?.record?.worksOn).includes(name)) ?? null;
}

function pullFor(item, pullRequests) {
  const name = idOf(item);
  return list(pullRequests).find((pull) => pull?.branch === name || text(pull?.title).includes(name)) ?? null;
}

function state(item, states, facts) {
  const name = idOf(item);
  const realises = named(fieldsOf(item).realises);
  const unaccepted = realises.find((artifact) => statusOf(facts.statuses, artifact) !== "accepted");
  if (unaccepted) return { item: name, state: "waiting for acceptance", reason: `${unaccepted} is not accepted`, job: null, pullRequest: null };

  const prerequisite = named(fieldsOf(item).builds_on).find((dependency) => states.get(dependency)?.state !== "done");
  if (prerequisite) return { item: name, state: "waiting for an item it builds on", reason: `${prerequisite} is not done`, job: null, pullRequest: null };

  const gate = gateBefore(item, facts.gates, facts.workflow);
  if (gate) return { item: name, state: "waiting", reason: `${gate.name} is not recorded`, job: null, pullRequest: null };

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
  for (const item of orderedItems(list(items), order)) {
    const result = state(item, states, facts ?? {});
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

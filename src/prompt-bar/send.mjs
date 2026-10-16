// MOD-prompt-bar, send.mjs — preparing and running a message as a job in this tab (docs/architecture/MOD-prompt-bar.md: Parts,
// Interfaces: startPromptBar). A message is the job of the kind its page's subject names, with the subject's parameters and the person's
// words, the conversation so far, the subject's menu entry and the tools it refuses; it is prepared with MOD-job-runner's prepareJob in a
// MOD-runtimes tabContext and run with runOnTab, without a job record.
//
// Module: MOD-prompt-bar
//
// The connections handed to runOnTab are built as the review pages build theirs: an endpoint's configuration and its Bridge from its
// setting, each Bridge with settingsOf and then bridgeAt. prepareJob and runOnTab write nothing: the only write of a message is the
// conversation record (record.mjs), which the bar makes first, where recording is on.

import { readSetting } from "../browser-store/index.mjs";
import { bridgeAt, settingsOf } from "../bridge-client/index.mjs";
import { prepareJob } from "../job-runner/index.mjs";
import { runOnTab, tabContext } from "../runtimes/index.mjs";
import { readParticipants } from "./offer.mjs";
import { recordingOf } from "./record.mjs";

/** defaultSnapshot(host: Host) -> Promise<Snapshot> — the repository at its default branch now. */
export async function defaultSnapshot(host) {
  const { defaultBranch } = await host.repositoryInfo();
  return host.readSnapshot(defaultBranch);
}

// The name of the token this browser stores for the page's repository, or null without one: a product's own, never the instance's; the
// instance's for the page of the instance.
function personOf(store, snapshot, ofProduct) {
  const { server, origin, path } = snapshot.repository;
  const keys = !ofProduct ? ["github-token"] : server === "gitlab" ? [`gitlab-token:${new URL(origin).host}/${path}`] : [`github-token:${path}`];
  for (const key of keys) {
    const token = readSetting(store, key);
    if (token) return token.name ?? "a reviewer";
  }
  return null;
}

// The endpoint and the Bridges the participant is reached through, from what the store keeps.
function connectionsOf(participant, store) {
  const endpoints = {}, bridges = {};
  const connectBridge = (name) => {
    if (!name || bridges[name]) return;
    const stored = readSetting(store, `bridge:${name}`);
    if (stored) bridges[name] = bridgeAt(settingsOf({ name, ...stored }, readSetting(store, "jump-host")));
  };
  const name = /^endpoint\s+(\S+)/.exec(participant.route ?? "")?.[1];
  const stored = name === undefined ? null : readSetting(store, `endpoint:${name}`);
  if (stored) {
    endpoints[name] = { config: { name, kind: stored.kind, baseUrl: stored.url, model: stored.model, key: stored.key ?? null }, bridge: stored.bridge ?? null };
    connectBridge(stored.bridge);
  }
  connectBridge(/^bridge\s+(\S+)\s+agent\s+\S+/.exec(participant.route ?? "")?.[1]);
  return { endpoints, bridges };
}

/**
 * prepareMessage({ subject, participant, instruction, conversation, store, instance, product }) -> Promise<Ready> — reads the instance
 * and the page's repository now, builds the job's parameters, and prepares the job without sending anything. Ready holds `prepared`, the
 * `context` and `connections` to run it with, the `participants` of the register, whether the instance `recording` is on now, the
 * `person`, and the repository `page` the conversation is held on ({ address, host, snapshot }). Throws what the hosts and prepareJob throw.
 */
export async function prepareMessage({ subject, participant, instruction, conversation, store, instance, product }) {
  const instanceSnapshot = await defaultSnapshot(instance.host);
  const page = product
    ? { address: product.address, host: product.host, snapshot: await defaultSnapshot(product.host) }
    : { address: instanceSnapshot.repository.web, host: instance.host, snapshot: instanceSnapshot };
  const participants = await readParticipants(instanceSnapshot);
  const person = personOf(store, page.snapshot, product !== null);
  const commit = instanceSnapshot.commit ?? "unknown";
  const inputs = {
    params: { ...subject.paramsFor(participant), instruction, conversation, entry: subject.entry, refuses: subject.refuses },
    product: page, instance: { snapshot: instanceSnapshot, host: instance.host }, participants,
    places: { sources: {}, mailbox: null, contents: [] }, gates: [], person, agentM: { version: commit, commit }, jobId: null,
  };
  // The kind's definition is the job's own: prepareJob reads it by name, and the context that runs the job carries it.
  const prepared = await prepareJob(subject.kind, tabContext({ kind: null, ...inputs }), { drafter: participant, reviewers: [] });
  return { prepared, context: tabContext({ kind: prepared.kind, ...inputs }), connections: connectionsOf(participant, store), participants, person, page,
    recording: await recordingOf(instanceSnapshot) };
}

/**
 * shown(finding: Finding) -> string — a finding as the run panel and a form of MOD-site-frame show it: its kind, what is wrong, the correction
 * expected and the requirement, read from the fields of MOD-text-tools' Finding.
 */
export const shown = (finding) => `${finding.kind}: ${finding.what} — ${finding.fix} [${finding.rule}]`;

/**
 * whyNot(prepared: Prepared, offered: Participant[]) -> string[] — what keeps a prepared job from being sent: each finding that keeps it
 * from starting, and each participant it does not fit with the offered participants whose context would hold it (UC-049 3a, UC-019 4a, 4b).
 * Empty when the job may be sent.
 */
export function whyNot(prepared, offered) {
  const larger = (size) => offered.filter((each) => each.context !== null && each.context >= size).map((each) => each.name);
  return [
    ...prepared.blocking.map(shown),
    ...prepared.notFitting.map(({ participant, size, context }) => {
      const choice = larger(size);
      return `${participant.name} does not hold this message: ${context === null ? "it declares no context size" : `its context holds ${context} tokens`}, `
        + `the job needs about ${size}. ${choice.length ? `Choose ${choice.join(" or ")}, whose context is larger.` : "No offered participant has a larger context."}`;
    }),
  ];
}

/**
 * runMessage(ready: Ready, { signal, onOutput }) -> Promise<JobResult> — runs the prepared job in this tab, attended, without a job record.
 * Throws a driver's failure by name, and Cancelled when the signal is aborted.
 */
export function runMessage(ready, { signal, onOutput }) {
  return runOnTab(ready.prepared, ready.context, ready.connections, { signal, onOutput });
}

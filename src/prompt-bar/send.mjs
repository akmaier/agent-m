// MOD-prompt-bar, send.mjs — preparing and running a message, or a piece of a plan of a kind whose result waits for the person, as a job in this tab (docs/architecture/MOD-prompt-bar.md:
// Parts, Interfaces: startPromptBar). A message is a job of the bar's one kind, `converse`, whatever the page, with the subject's parameters as its
// context and the person's words, the conversation so far, the subject's menu entry and the tools it refuses; a piece the tab runs is a
// job of the kind it names, prepared the same way with `hand-over` among its refuses; each is prepared with MOD-job-runner's prepareJob in a MOD-runtimes tabContext and run
// with runOnTab — a message without a job record, a piece with its record, queued on the tab's route (queueHere).
//
// Module: MOD-prompt-bar
//
// The connections handed to runOnTab are built as the review pages build theirs: an endpoint's configuration and its Bridge from its
// setting, each Bridge with settingsOf and then bridgeAt. prepareJob writes nothing; the only write of a message is the conversation record (record.mjs), which the bar makes
// first, where recording is on, and a piece's only writes are its record's start, taking and end, which hold none of its task's words.

import { readSetting } from "../browser-store/index.mjs";
import { bridgeAt, settingsOf } from "../bridge-client/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { handOverParams, prepareJob, taskRefusal } from "../job-runner/index.mjs";
import { queueJob, runOnTab, tabContext } from "../runtimes/index.mjs";
import { newJobId } from "../job-ledger/index.mjs";
import { BAR_KIND, readParticipants } from "./offer.mjs";
import { readDocument } from "../documents/index.mjs";
import { personAccount, registerPaths, restrictedPlaces, sourceSchemas } from "../source-register/index.mjs";
import { recordingOf } from "./record.mjs";

/** defaultSnapshot(host: Host) -> Promise<Snapshot> — the repository at its default branch now. */
export async function defaultSnapshot(host) {
  const { defaultBranch } = await host.repositoryInfo();
  return host.readSnapshot(defaultBranch);
}

// The places a job is given for the restricted sources (JobContext.places): the entries of the instance's register, read from its snapshot, and MOD-source-register's restrictedPlaces over them for the page's
// repository. The rule itself is that function's; this reads the entries. Empty for an instance without sources.
export async function placesOf(instanceSnapshot, address) {
  const { entry } = sourceSchemas();
  const register = [];
  for (const path of registerPaths(instanceSnapshot.paths)) register.push(readDocument(entry, path, (await instanceSnapshot.read(path)) ?? ""));
  return restrictedPlaces(register, address);
}

/**
 * personOf(store: Store, snapshot: Snapshot, ofProduct: boolean, instanceSnapshot?: Snapshot) -> string | null — the name of the token this browser stores for the page's
 * repository, or null without one: a product's own, never the instance's; the instance's for the page of the instance, and for a product whose repository is the
 * instance's own, whose own token the instance's is.
 */
export function personOf(store, snapshot, ofProduct, instanceSnapshot = null) {
  const { server, origin, path } = snapshot.repository;
  const instanceItself = instanceSnapshot !== null && instanceSnapshot.repository.server === server && instanceSnapshot.repository.path === path;
  const keys = !ofProduct || instanceItself ? ["github-token"] : server === "gitlab" ? [`gitlab-token:${new URL(origin).host}/${path}`] : [`github-token:${path}`];
  for (const key of keys) {
    const token = readSetting(store, key);
    if (token) return token.name ?? "a reviewer";
  }
  return null;
}

/**
 * sourceOf(instanceSnapshot: Snapshot) -> string | null — the `source` the bar gives every message and hand-over: the person's account, which MOD-source-register's
 * personAccount gives for the instance's snapshot (THE PERSON WHO PROMPTS IS A SOURCE); null where the snapshot names no owner. The one place the bar computes it.
 */
export const sourceOf = (instanceSnapshot) => personAccount(instanceSnapshot);

/**
 * keepsTokenFor(store: Store, address: string) -> boolean — whether this browser keeps the own token of the product at `address`, a repository's web address, as
 * personOf reads it for a product's page: `github.com/<owner>/<name>` on GitHub, any other server a GitLab server (UC-049 3d). No request is made.
 */
export function keepsTokenFor(store, address) {
  let url;
  try { url = new URL(address); } catch { return false; }
  const repository = { server: url.hostname === "github.com" ? "github" : "gitlab", origin: url.origin, path: url.pathname.replace(/^\/+|\/+$/g, "") };
  return personOf(store, { repository }, true) !== null;
}

/**
 * recordRoute(route: Route, participant?: Participant) -> string — the route as a job's record writes it (MOD-job-ledger, `route`): `tab`, `ci hosted` or
 * `ci runner:<label>`, followed for a model endpoint's job by its connection's route, `endpoint <name>[ secret <NAME>]`; for a coding agent a Bridge offers, its
 * connection's route `bridge <name> agent <agent>`; `bridge <name>` where no participant on such a connection is given.
 */
export function recordRoute(route, participant = null) {
  const connection = String(participant?.route ?? "").trim();
  if (route.kind === "bridge") return /^bridge\s+\S+\s+agent\s+\S+/.test(connection) ? connection : `bridge ${route.bridge}`;
  const where = route.kind === "tab" ? "tab" : route.runner === "hosted" ? "ci hosted" : `ci runner:${route.runner}`;
  return /^endpoint\s+\S+/.test(connection) ? `${where} ${connection}` : where;
}

/**
 * declaresOf(participant: Participant) -> { declares } | {} — what the record of a job of an agent on a connection declares for its model (MOD-job-ledger,
 * `declares`): the model's context and the connection's capabilities; nothing for a participant without a connection.
 */
export const declaresOf = (participant) => (participant?.route ? { declares: { context: participant.context ?? null, capabilities: participant.capabilities ?? [] } } : {});

/**
 * connectionsOf(participant: Participant, store: Store) -> { endpoints, bridges } — the endpoint and the Bridges the participant is reached through, from what the store
 * keeps: an endpoint's configuration and the Bridge it is called through, and the Bridge of an agent, each Bridge with settingsOf and then bridgeAt.
 */
export function connectionsOf(participant, store) {
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
 * and the page's repository now, builds the job's parameters — beside the subject's, the bar's `source` (sourceOf) —, and prepares the job without sending anything. Ready holds `prepared`, the
 * `context` and `connections` to run it with, the `participants` of the register, whether the instance `recording` is on now, the
 * `person`, and the repository `page` the conversation is held on ({ address, host, snapshot }). Throws what the hosts and prepareJob throw.
 */
export function prepareMessage({ subject, participant, instruction, conversation, store, instance, product, connections }) {
  return prepareIn(BAR_KIND, () => ({ ...subject.paramsFor(participant), instruction, conversation, entry: subject.entry, refuses: subject.refuses }),
    { participant, store, instance, product, connections });
}

export { BAR_KIND };

/**
 * prepareHandOver({ handOver, subject, participant, conversation, store, instance, product }) -> Promise<Ready> — a hand-over { kind, works_on, task } prepared to run in this
 * tab as a message is (UC-049 4a.1): of its kind, its parameters the subject's paramsFor less `page`, with what MOD-job-runner's handOverParams gives for what it works on, its
 * task as `instruction`, the conversation so far, the subject's entry and refuses, and the bar's `source` (sourceOf). A kind with reviewers is prepared with the participant itself as its one reviewer and
 * `selfReview` set, since the change is described in the prompt bar (NO REVIEWER IS THE DRAFTER). Writes nothing; throws what prepareMessage throws, and what kindOf throws.
 */
export async function prepareHandOver({ handOver, subject, participant, conversation, store, instance, product, connections }) {
  const reviewed = (await kindOf(handOver.kind)).reviewer !== null;
  return prepareIn(handOver.kind, (snapshot) => {
    const { page: _page, ...context } = subject.paramsFor(participant);
    // A piece of a plan hands nothing on: `hand-over` is among its refuses (MOD-job-runner's hand-over).
    return { ...context, ...handOverParams(handOver.works_on, snapshot), instruction: String(handOver.task ?? ""), conversation, entry: subject.entry,
      refuses: [...new Set([...(subject.refuses ?? []), "hand-over"])] };
  }, { participant, store, instance, product, connections }, reviewed ? { reviewers: [participant], selfReview: true } : { reviewers: [] });
}

// A job record's path under docs/jobs/, with the job's identifier.
const JOB_RECORD = /^docs\/jobs\/(JOB-[^/]+)\.md$/;

/**
 * queueHere(ready: Ready, piece: { kind, works_on }, { conversation, source }) -> Promise<{ id: string, path: string, run: null }> — the record of a piece of a plan that runs in this tab
 * (UC-049 4a.1): queued on the tab's route with MOD-runtimes' queueJob — its start and its taking one commit, as the person's commit on the head the page's repository has now —, the
 * task travelling with the hand-over and none of its words in the record: its parameters are the bar's `source`, those MOD-job-runner's handOverParams gives for what it works on, and
 * `refuses` naming hand-over. `conversation` is the path of the conversation record it names, or null. The prepared context then carries the job's identifier. Throws NoToken where this
 * browser keeps no token that writes to the page's repository, and what queueJob throws; nothing is written then.
 */
export async function queueHere(ready, piece, { conversation = null, source } = {}) {
  if (ready.person === null) throw Object.assign(new Error("no token that writes to this repository is stored in this browser"), { name: "NoToken" });
  const { host } = ready.page;
  const snapshot = await host.readSnapshot((await host.repositoryInfo()).defaultBranch);
  const now = new Date();
  const id = newJobId(now, new Set(snapshot.paths.map((path) => JOB_RECORD.exec(path)?.[1]).filter(Boolean)));
  const worksOn = [piece.works_on].flat().filter(Boolean).map(String);
  const { prepared } = ready;
  const drafter = prepared.drafter;
  // A piece that works on nothing yet — something new, whose place its task names — is a job that works on the repository the page is held on, by its web address.
  const start = { id, kind: prepared.kind.name, worksOn: worksOn.length ? worksOn : [snapshot.repository.web], participant: drafter.name, model: drafter.model ?? null, route: recordRoute({ kind: "tab" }, drafter), run: null, retries: null, startedBy: ready.person,
    start: now, agentM: ready.context.agentM, inputs: prepared.parts.map((part) => part.name), limit: prepared.limit, task: "with the hand-over", conversation,
    destinations: prepared.destinations.map((each) => ({ participant: each.participant.name, place: each.place ?? "", parts: each.parts })),
    params: { ...(source === undefined || source === null ? {} : { source }), ...handOverParams(worksOn, snapshot), refuses: ["hand-over"] },
    ...declaresOf(drafter) };
  const { path } = await queueJob(host, start, { kind: "tab" }, snapshot.commit);
  ready.context.jobId = id;
  return { id, path, run: null };
}

/**
 * runHere(ready: Ready, record: { id, path, run: null }, { signal }) -> Promise<JobResult> — runs a piece of a plan in this tab, attended, with its record, which gains its end — `waits for
 * a person` for its draft — through the page's host (MOD-runtimes' runOnTab). Throws a driver's failure by name, and Cancelled when the signal is aborted.
 */
export function runHere(ready, record, { signal }) {
  return runOnTab(ready.prepared, ready.context, ready.connections, { host: ready.page.host, record, signal });
}

// A job of `kind` prepared in this tab's context, its parameters `paramsOf(snapshot of the page's repository)`, drafted by the participant and reviewed as `review`
// gives — by none for a message; the Ready of prepareMessage.
async function prepareIn(kind, paramsOf, { participant, store, instance, product, connections = [participant] }, review = { reviewers: [] }) {
  const instanceSnapshot = await defaultSnapshot(instance.host);
  const page = product
    ? { address: product.address, host: product.host, snapshot: await defaultSnapshot(product.host) }
    : { address: instanceSnapshot.repository.web, host: instance.host, snapshot: instanceSnapshot };
  const participants = await readParticipants(instanceSnapshot, connections);
  const person = personOf(store, page.snapshot, product !== null, instanceSnapshot);
  const commit = instanceSnapshot.commit ?? "unknown";
  const inputs = {
    // The bar's source, the person's account, on every page (THE PERSON WHO PROMPTS IS A SOURCE): none where the instance names no owner, which a kind that needs
    // one refuses by its own precondition.
    params: { ...paramsOf(page.snapshot), ...(sourceOf(instanceSnapshot) === null ? {} : { source: sourceOf(instanceSnapshot) }) },
    product: page, instance: { snapshot: instanceSnapshot, host: instance.host }, participants,
    places: { ...(await placesOf(instanceSnapshot, page.address)), mailbox: null }, gates: [], person, agentM: { version: commit, commit }, jobId: null,
  };
  // The kind's definition is the job's own: prepareJob reads it by name, and the context that runs the job carries it.
  const prepared = await prepareJob(kind, tabContext({ kind: null, ...inputs }), { drafter: participant, ...review });
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
 * from starting, each participant it does not fit with the offered participants whose context would hold it (UC-049 3a, UC-019 4a, 4b), and,
 * for a job given an instruction — a hand-over's task — of a kind that takes none, MOD-job-runner's taskRefusal, since the task would reach no
 * prompt (UC-049 4a). Empty when the job may be sent.
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
    ...(typeof prepared.params?.instruction === "string" && prepared.params.instruction.trim() ? [taskRefusal(prepared.kind)].filter(Boolean).map(shown) : []),
  ];
}

/**
 * runMessage(ready: Ready, { signal, onOutput }) -> Promise<JobResult> — runs the prepared job in this tab, attended, without a job record.
 * Throws a driver's failure by name, and Cancelled when the signal is aborted.
 */
export function runMessage(ready, { signal, onOutput }) {
  return runOnTab(ready.prepared, ready.context, ready.connections, { signal, onOutput });
}

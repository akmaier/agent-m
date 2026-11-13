// MOD-prompt-bar, send.mjs — preparing and running a message, or a piece of a plan of a kind whose result waits for the person, as a job in this tab (docs/architecture/MOD-prompt-bar.md:
// Parts, Interfaces: startPromptBar). A message is a job of the bar's one kind, `converse`, whatever the page, with the subject's parameters as its
// context and the person's words, the conversation so far, the subject's menu entry and the tools it refuses; a piece the tab runs is a
// job of the kind it names, prepared the same way with `hand-over` among its refuses; each is prepared with MOD-job-runner's prepareJob in a MOD-runtimes tabContext and run
// with runOnTab — a message without a job record, a piece with its record, queued on the tab's route (queueHere). A message to a CLI session is prepared the
// same way but not run in the tab: its parts, filled into session.md, go to the session's Bridge as one ask, typed into the session the conversation keeps
// (runSession, UC-049 step 4, ARC-055).
//
// Module: MOD-prompt-bar
//
// The connections handed to runOnTab are built as the review pages build theirs: an endpoint's configuration and its Bridge from its
// setting, each Bridge with settingsOf and then bridgeAt. prepareJob writes nothing; the only write of a message is the conversation record (record.mjs), which the bar makes
// first, where recording is on, and a piece's only writes are its record's start, taking and end, which hold none of its task's words.

import { readSetting } from "../browser-store/index.mjs";
import { ask, bridgeAt, bridgeJobLog, bridgeJobs, cancelOnBridge, settingsOf } from "../bridge-client/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { handOverParams, prepareJob, taskRefusal } from "../job-runner/index.mjs";
import { queueJob, runOnTab, tabContext } from "../runtimes/index.mjs";
import { newJobId } from "../job-ledger/index.mjs";
import { BAR_KIND, readParticipants } from "./offer.mjs";
import { readDocument } from "../documents/index.mjs";
import { personAccount, registerPaths, restrictedPlaces, sourceSchemas } from "../source-register/index.mjs";
import { recordingOf } from "./record.mjs";
import { ownText } from "./own.mjs";

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
  // A coding agent on CI: its connection's route names its runner already.
  if (route.kind === "ci" && /^ci\s+\S+\s+agent\s+\S+/.test(connection)) return connection;
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

// ---------------------------------------------------------------- a message to a CLI session (UC-049 step 4; ARC-055)

// A CLI session: a coding agent a Bridge offers, whose connection's route is `bridge <bridge> agent <agent>` (MOD-job-ledger, `route`).
const SESSION_ROUTE = /^bridge\s+(\S+)\s+agent\s+(\S+)/;

/** isSession(participant: Participant) -> boolean — whether the participant is a CLI session, which the bar does not run in the tab (UC-049 step 4). */
export const isSession = (participant) => SESSION_ROUTE.test(String(participant?.route ?? "").trim());

// Where Agent M's files lie from where a session is started: the root of its working folder, the Bridge's clone of the instance (MOD-bridge-jobs).
const FROM_CHECKOUT = "";
// A part of the recipe chapters-for-page, as MOD-source-register names it: `<file> — <source> <version>, version hash <hash>`; the file lies in the
// instance at docs/sources/<source>/<version>/<file>.
const CHAPTER = /^(\S+) — (SRC-[^\s]+) (\S+), version hash /;
// Every how many messages after the one that starts the session the instruction to read Agent M's files is given again (A CLI SESSION IS TOLD AGAIN EVERY
// FIFTH MESSAGE TO READ AGENTS.MD).
const READ_AGAIN_EVERY = 5;

// session.md's template and its two instructions to read Agent M's files, each the text after its `<!-- read… -->` line.
async function sessionText() {
  const [template, ...blocks] = (await ownText("session.md")).split(/^<!-- (read(?: again)?):[^\n]*-->\n/m);
  const instructions = {};
  for (let at = 0; at < blocks.length; at += 2) instructions[blocks[at]] = blocks[at + 1].trim();
  return { template, read: instructions.read, again: instructions["read again"] };
}

/**
 * sessionInput(prepared: Prepared, { sent }: { sent: number | null }) -> Promise<string> — what a CLI session is given with a message: session.md with each
 * named place filled by the parts of its recipe, each under its name. `sent` is how many messages the conversation has sent to the session it keeps, null
 * where the message starts one. With the message that starts the session, and with every fifth message after it, the input begins with the instruction to
 * read Agent M's AGENTS.md — where the instance holds it, the job's `rules` — and the chapters for the page, each named by the path of its file in the
 * Bridge's clone of the instance from the session's checkout and none given as text; with every fifth, also that they need not be read again while they are
 * still in the agent's context. With any other message that place is empty. The conversation so far is given only where the message starts the session.
 * The one place where a session's input is composed.
 */
export async function sessionInput(prepared, { sent = null } = {}) {
  const starts = sent === null;
  const { template, read, again } = await sessionText();
  const files = [...(prepared.rules ? [`${FROM_CHECKOUT}AGENTS.md`] : []),
    ...prepared.parts.filter((part) => part.recipe === "chapters-for-page").map((part) => CHAPTER.exec(part.name))
      .filter(Boolean).map(([, file, source, version]) => `${FROM_CHECKOUT}docs/sources/${source}/${version}/${file}`)];
  const instruction = starts ? read : sent % READ_AGAIN_EVERY === 0 ? again : "";
  const given = (recipe) => {
    const parts = prepared.parts.filter((part) => part.recipe === recipe);
    return parts.length ? parts.map((part) => `### ${part.name}\n\n${part.text}`).join("\n\n") : "(none)";
  };
  const places = {
    read: instruction ? instruction.replace("{{files}}", files.map((file) => `- \`${file}\``).join("\n")) : "",
    conversation: starts ? `## The conversation\n\n${given("conversation")}` : "",
  };
  const filled = template.replace(/\{\{([a-z-]+)\}\}/g, (_place, name) => (name in places ? places[name] : given(name)));
  return filled.replace(/\n{3,}/g, "\n\n").trim();
}

// How often the session's console is read while a message runs.
const CONSOLE_POLL_MS = 500;
// How many lines of the console the bar shows.
const CONSOLE_LINES = 80;

// How a session ended that the Bridge no longer runs, as its listing and its log say: by its agent — its listing `done` or `failed` (UC-049 4h) — or with its
// Bridge (4g), with the last lines its console showed. A Bridge that does not answer ended it.
async function howEnded(bridge, id) {
  try {
    const listed = (await bridgeJobs(bridge))?.find((job) => job.id === id) ?? null;
    let lines = [];
    try {
      const log = await bridgeJobLog(bridge, id, 0);
      lines = [...(log.lines ?? []), ...(log.partial ? String(log.partial).split("\n") : [])];
    } catch { /* a log the Bridge no longer gives */ }
    return { by: ["done", "failed"].includes(listed?.state) ? "agent" : "bridge", state: listed?.state ?? null, lines: lines.slice(-20) };
  } catch {
    return { by: "bridge", state: null, lines: [] };
  }
}

// Follows a session's console with MOD-bridge-client's bridgeJobLog until `stop` is called, handing `onConsole` the lines it has shown so far and the part its
// screen shows now.
function followConsole(bridge, id, onConsole) {
  let stopped = false, from = 0;
  const lines = [];
  (async () => {
    while (!stopped) {
      try {
        const log = await bridgeJobLog(bridge, id, from);
        lines.push(...(log.lines ?? []));
        from = log.next ?? from;
        if (!stopped) onConsole?.({ lines: lines.slice(-CONSOLE_LINES), partial: log.partial ?? "" });
        if (log.ended) return;
      } catch { return; }
      await new Promise((resolve) => setTimeout(resolve, CONSOLE_POLL_MS));
    }
  })();
  return () => { stopped = true; };
}

/** The Bridge and the agent of a CLI session's participant, and the Bridge as this browser keeps it. Throws NotFound where it keeps none of that name. */
function sessionTarget(participant, bridges) {
  const [, bridgeName, agent] = SESSION_ROUTE.exec(String(participant.route).trim());
  const bridge = bridges[bridgeName];
  if (!bridge) throw Object.assign(new Error(`this browser keeps no Bridge named ${bridgeName}`), { name: "NotFound" });
  return { bridgeName, agent, bridge };
}

/**
 * runSession(ready: Ready, { kept, keep, onConsole, signal }) -> Promise<{ text: string, usage: null, ended: { by: "agent" | "bridge", state, lines } | null }> —
 * sends a prepared message to the CLI session it names on its Bridge (MOD-bridge-client's `ask`; ARC-055), with the session's model, the address of the
 * message's page's repository as `product`, the commit of the instance it was prepared on as `instance`, and, where the conversation keeps a session of that
 * Bridge and agent (`kept`: { bridge, agent, id, sent }), that one as `session`. `keep` is handed the session the conversation keeps from then on — its
 * Bridge, its agent, its identifier and how many messages were sent to it —, or null where it keeps none; `onConsole` the session's console while the
 * message runs. A session the Bridge no longer runs (not-found) is forgotten and the message sent again, starting a new session, its end in `ended`. Throws
 * SessionEnded { ended } where the agent exits before it answers, the session forgotten; Cancelled where `signal` was aborted; NotFound where this browser
 * keeps no Bridge of that name; and what `ask` throws.
 */
export async function runSession(ready, { kept = null, keep = () => {}, onConsole = null, signal = null } = {}) {
  const { bridgeName, agent, bridge } = sessionTarget(ready.prepared.drafter, ready.connections.bridges);
  const model = ready.prepared.drafter.model ?? undefined;
  const current = kept && kept.bridge === bridgeName && kept.agent === agent && typeof kept.id === "string" ? kept : null;
  const send = async (session) => {
    const input = await sessionInput(ready.prepared, { sent: session ? session.sent ?? 0 : null });
    let id = session?.id ?? null, stop = () => {};
    const target = { agent, ...(model ? { model } : {}), product: ready.page.address, instance: ready.context.agentM.commit, ...(session ? { session: session.id } : {}) };
    try {
      const { text } = await ask(bridge, target, input, { onSession: (named) => {
        id = named;
        keep({ bridge: bridgeName, agent, id: named, sent: (session && session.id === named ? session.sent ?? 0 : 0) + 1 });
        stop = followConsole(bridge, named, onConsole);
      } });
      return { text, usage: null, ended: null };
    } catch (failure) {
      if (signal?.aborted) throw Object.assign(new Error("the message was stopped"), { name: "Cancelled" });
      if (failure?.name === "BridgeFailed" && failure.error === "not-found" && session) {
        keep(null);
        const ended = await howEnded(bridge, session.id);
        return { ...(await send(null)), ended };
      }
      if (failure?.name === "AskFailed" && id) {
        keep(null);
        throw Object.assign(new Error(failure.message), { name: "SessionEnded", ended: await howEnded(bridge, id) });
      }
      throw failure;
    } finally {
      stop();
    }
  };
  return send(current);
}

/**
 * endSession(store: Store, kept: { bridge, id }) -> Promise<{ confirmed }> — ends the session the conversation keeps, on its Bridge as this browser keeps it,
 * with MOD-bridge-client's cancelOnBridge: its agent, with every process it started (UC-049 5a, 6d). Throws NotFound where this browser keeps no such
 * Bridge, and what cancelOnBridge throws.
 */
export function endSession(store, kept) {
  const route = `bridge ${kept.bridge} agent ${kept.agent}`;
  const { bridge } = sessionTarget({ route }, connectionsOf({ route }, store).bridges);
  return cancelOnBridge(bridge, kept.id);
}

/**
 * runMessage(ready: Ready, { signal, onOutput }) -> Promise<JobResult> — runs the prepared job in this tab, attended, without a job record.
 * Throws a driver's failure by name, and Cancelled when the signal is aborted.
 */
export function runMessage(ready, { signal, onOutput }) {
  return runOnTab(ready.prepared, ready.context, ready.connections, { signal, onOutput });
}

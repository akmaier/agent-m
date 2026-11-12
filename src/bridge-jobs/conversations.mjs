// conversations.mjs — the running CLI sessions of the prompt bar's conversations: started, typed into, answered, ended (MOD-bridge-jobs, Parts:
// conversations.mjs; Interfaces: POST /v1/ask, GET /v1/jobs, GET /v1/jobs/{id}/log, POST /v1/jobs/{id}/cancel, stopWatching; ARC-055).
//
// Module: MOD-bridge-jobs
//
// A conversation's first message to a CLI session starts it as a job's session is started (session.mjs) — the clones at the instance's commit the message
// names, its checkout of the product with the token file —, the agent kept running in a pseudo-terminal of MOD-agent-processes' startSession in its enclosure,
// its checkout alone writable; every later message of the conversation is typed into that one. The session is listed and logged as a job this Bridge took
// (watch.mjs), of the kind `converse`, under an identifier of its own, and has no job record. It ends when it is cancelled, when its agent exits or when the
// Bridge quits; its checkout and its token file are then removed, and its log is kept.

import { installedAgents, startSession as startTerminal } from "../agent-processes/index.mjs";
import { newJobId } from "../job-ledger/index.mjs";
import { enclosureOf } from "./enclosures.mjs";
import { readListings } from "./joblogs.mjs";
import { startSession, toldOf } from "./session.mjs";
import { cancelJob, endTaken, listJobs, logLine, takeSession } from "./watch.mjs";
import { foldersOf, removeClone } from "./workfolders.mjs";

// The kind a session of the prompt bar is listed under (MOD-prompt-bar's one kind).
const KIND = "converse";
// A session's identifier, one segment of a path (MOD-job-ledger's newJobId).
const IDENTIFIER = /^JOB-[A-Za-z0-9-]+$/;
// How often a message's answer is looked for on the session's screen.
const ANSWER_POLL_MS = 100;

const failure = (code, message) => Object.assign(new Error(message), { code });
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The sessions running now, by their identifiers.
const running = new Map();

// A session started for the first message of a conversation: listed at once, its checkout and its agent made in the background.
function open(id, agent, { model, product, instance: commit }, { instance, enclosures }) {
  const listed = { id, product, kind: KIND, agent: agent.name, state: "running", started: new Date().toISOString(), usage: null };
  // The session's log, as watch.mjs keeps a job's: the lines scrolled off its screen, and, while it runs, what its screen shows as the part still written.
  const log = { lines: [], first: 0, ended: false, screen: () => [], get partial() { return this.ended ? "" : this.screen().join("\n"); } };
  const controller = new AbortController();
  const live = { controller, done: null };
  const held = { ended: false, exit: null, told: "", first: true, chain: Promise.resolve() };
  running.set(id, held);
  takeSession(listed, log, live);
  const working = foldersOf(agent.folder).job(id, product);

  held.ready = (async () => {
    const enclosure = await enclosureOf(enclosures, agent.folder);
    const session = await startSession({ folder: agent.folder, instance, commit, product, id });
    await enclosure.prepare({ writable: [session.working], readable: [session.instanceFolder, session.clone] });
    const installed = (await installedAgents({ enclosure, workdir: session.working })).find((each) => each.name === agent.name);
    held.told = await toldOf({ file: session.file, address: product });
    if (controller.signal.aborted) throw Object.assign(new Error("the session was cancelled"), { name: "Cancelled" });
    const terminal = startTerminal(installed, { workdir: session.working, cwd: agent.folder, enclosure, writable: [session.working], chrome: agent.chrome === true }, { name: agent.name, model });
    log.screen = terminal.screen;
    terminal.onLine((line) => logLine(id, log, line));
    terminal.exited.then((exit) => { held.exit = exit; });
    if (controller.signal.aborted) terminal.stop();
    else controller.signal.addEventListener("abort", () => { terminal.stop(); }, { once: true });
    return terminal;
  })();

  live.done = held.ready.then((terminal) => terminal.exited.then((exit) => ({ terminal, exit })), (error) => ({ error })).then(async ({ terminal, exit, error }) => {
    held.ended = true;
    running.delete(id);
    // When it ends, the lines its screen still shows join its log.
    if (terminal) for (const line of terminal.screen()) logLine(id, log, line);
    log.ended = true;
    await removeClone(working);
    listed.state = controller.signal.aborted ? "cancelled" : error || exit.exitCode !== 0 ? "failed" : "done";
    endTaken(id);
  });

  held.message = (text) => {
    const answer = held.chain.then(async () => {
      const terminal = await held.ready;
      const typed = held.first && held.told ? `${text}\n\n${held.told}` : text;
      held.first = false;
      terminal.type(typed);
      for (;;) {
        const said = terminal.answer();
        if (said !== null) return { text: said, usage: null };
        if (held.exit) throw Object.assign(new Error(`the agent exited with ${held.exit.exitCode} before it answered`), { exitCode: held.exit.exitCode });
        await Promise.race([pause(ANSWER_POLL_MS), terminal.exited]);
      }
    });
    held.chain = answer.catch(() => {});
    return answer;
  };
  return held;
}

/**
 * converse(agent: { name, folder, chrome }, request: { model, input, product, instance, session? }, { instance, enclosures }) -> { session: string, answer:
 * Promise<{ text: string, usage: null }> } — a message of the prompt bar to a CLI session (ARC-055): without `session`, a new session started for it, under a
 * new identifier, typed the input followed by token.md where a token file is left; with `session`, typed into that running session. The answer is what the
 * agent printed after the message, once its screen shows that it waits; it fails, naming the agent's exit code, where the agent exits first. Throws not-found,
 * at once, for a session this Bridge does not run.
 */
export function converse(agent, request, { instance, enclosures }) {
  if (request.session !== undefined) {
    const held = running.get(request.session);
    if (!held || held.ended) throw failure("not-found", "This Bridge runs no such session.");
    return { session: request.session, answer: held.message(request.input) };
  }
  const id = newJobId(new Date(), new Set([...listJobs().map((job) => job.id), ...running.keys()]));
  return { session: id, answer: open(id, agent, request, { instance, enclosures }).message(request.input) };
}

/** endSessions() -> Promise<void> — ends every running session as a cancel ends it: the Bridge quits (UC-049 4g). */
export async function endSessions() {
  await Promise.all([...running.keys()].map((id) => cancelJob(id).catch(() => {})));
}

/**
 * removeLeftSessions(agents: { folder }[]) -> Promise<void> — removes, in each agent's working folder, the checkout `products/<name>-<id>/` of every session of the kind
 * converse that the kept listings name and that runs no longer: what a quit the Bridge did not see through left there (UC-049 4g).
 */
export async function removeLeftSessions(agents) {
  const left = readListings().filter((job) => job.kind === KIND && IDENTIFIER.test(String(job.id)) && !running.has(job.id) && job.product);
  for (const { folder } of agents.filter((each) => each?.folder)) for (const job of left) await removeClone(foldersOf(folder).job(job.id, job.product));
}

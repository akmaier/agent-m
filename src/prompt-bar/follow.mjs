// MOD-prompt-bar, follow.mjs — a handed-over job followed until it has ended (docs/architecture/MOD-prompt-bar.md: Interfaces, startPromptBar; UC-049 4a, 5a). Every 15 seconds the
// product's default branch is read, the job's row is listed with MOD-job-ledger's listJobs and the live state MOD-runtimes' liveState reports; the job's log is MOD-runtimes' jobLog —
// the run's address on CI, the lines a Bridge streams, as they come —; once the record has its end, following stops. cancel is MOD-runtimes' cancelJob.
//
// Module: MOD-prompt-bar
//
// PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; A CANCELLED JOB WRITES NOTHING MORE. Nothing is kept here but what the last poll saw, for the bar to show; the state is the row's.
// The row is listed from a snapshot narrowed to the job's own record, so that a poll reads that one record and not every record of the product, which keeps a followed job within a few
// hundred requests an hour. Bridges are handed to the runtimes from their stored entries with settingsOf and then bridgeAt, as the main page hands them.

import { readSetting } from "../browser-store/index.mjs";
import { bridgeAt, settingsOf } from "../bridge-client/index.mjs";
import { listJobs } from "../job-ledger/index.mjs";
import { cancelJob, jobLog, liveState } from "../runtimes/index.mjs";
import { defaultSnapshot } from "./send.mjs";

/**
 * answerIn(log: string | null, id: string) -> string | null — the answer a run on CI left in its log for the job `id` (MOD-workflow-entries: between the lines
 * `--- answer of <id> ---` and `--- end of the answer of <id> ---`), each line without the time stamp the server puts before it; null where the log holds none.
 */
export function answerIn(log, id) {
  const lines = String(log ?? "").split("\n").map((line) => line.replace(/^\d{4}-\d\d-\d\dT[\d:.]+Z /, "").replace(/\r$/, ""));
  const from = lines.indexOf(`--- answer of ${id} ---`);
  const to = lines.indexOf(`--- end of the answer of ${id} ---`, from + 1);
  return from === -1 || to === -1 ? null : lines.slice(from + 1, to).join("\n");
}

/** EVERY — the time between two polls of a followed job, in milliseconds. */
export const EVERY = 15000;

const said = (failure) => `${failure?.name ?? "Error"}: ${failure?.message ?? failure}`;

// A handle for the Bridge a record's `## Taken` names, when this browser keeps it under `bridge:<name>`; none for a CI run's address, a tab, or a Bridge it does not keep.
function bridgesOf(record, store) {
  const name = record?.taken?.by;
  if (!name || /^https?:\/\//.test(name)) return {};
  try {
    const stored = readSetting(store, `bridge:${name}`);
    return stored ? { [name]: bridgeAt(settingsOf({ name, ...stored }, readSetting(store, "jump-host"))) } : {};
  } catch {
    return {};
  }
}

/**
 * followJob({ id, address, host, store, show }) -> { stop: () => void, cancel: () => Promise<void> } — polls the job `id` of the repository at `address` through `host`, once at once and then
 * every 15 seconds until its record has its end, and hands `show` the view after each poll and each line of a Bridge's log: { id, state, route, address, lines, end, cancel, problem } —
 * `state` the job's state as listJobs derives it; `route` the record's route; `address` the CI run's address once jobLog gives it; `lines` the Bridge's log so far; `end` the record's end
 * (state, results, reason) or null; `answer` the answer a hand-over's run on CI left in its log (answerIn), read once when its end is read, else null; `cancel` `cancelled` or `cancelling` after cancel; `problem` what could not be read, by name. A failure of a poll is shown, never thrown, and polling goes on.
 * `cancel` cancels the job at its runtime with cancelJob and polls again at once. `stop` ends the polling.
 */
export function followJob({ id, address, host, store, show }) {
  const path = `docs/jobs/${id}.md`;
  const view = { id, state: null, route: null, address: null, missingSecret: null, lines: [], end: null, answer: null, cancel: null, problem: null };
  let record = null, timer = null, stopped = false, busy = false, streaming = false, answerRead = false;

  const emit = () => { if (!stopped) show({ ...view, lines: [...view.lines] }); };

  // The job's log, asked once the runtime has taken the job: the CI run's address once, the Bridge's stream once, whose lines are shown as they come.
  async function logOf(bridges) {
    if (view.address !== null || streaming || record.end || !record.taken) return;
    const log = await jobLog(record, { host }, bridges);
    if (log.address) view.address = log.address;
    else if (log.stream) {
      streaming = true;
      (async () => {
        try {
          for await (const line of log.stream) {
            if (stopped) return;
            view.lines.push(line);
            emit();
          }
        } catch (failure) {
          view.problem = `The log could not be followed. ${said(failure)}`;
          emit();
        }
      })();
    }
  }

  // A run that ended `not run` for a missing secret takes no job, so the record stays queued: the newest failed run of the job workflow that this record's start does not
  // predate says so in its log (MOD-workflow-entries' command line prints `<entry>: not run — <SECRET> is missing`). The secret is named; none is asked for.
  async function secretOf() {
    const runs = await host.listCiRuns({ workflow: "agent-m-jobs.yml" });
    const failed = runs.filter((run) => run.state === "failed" && (run.started === null || new Date(run.started) >= record.start));
    const log = failed.length ? await host.ciRunLog(failed[failed.length - 1].id) : null;
    return /: not run — (\S+) is missing/.exec(log ?? "")?.[1] ?? null;
  }

  // The answer of a job ended on CI, read once from the log of the run its end names: the run among the job workflow's runs whose address that is.
  async function answerOf() {
    answerRead = true;
    const run = (await host.listCiRuns({ workflow: "agent-m-jobs.yml" })).find((each) => each.url === record.end.log);
    return run ? answerIn(await host.ciRunLog(run.id), id) : null;
  }

  async function poll() {
    if (busy || stopped) return;
    busy = true;
    try {
      const snapshot = await defaultSnapshot(host);
      const products = [{ address, snapshot: Object.create(snapshot, { paths: { value: snapshot.paths.includes(path) ? [path] : [] } }) }];
      const [first] = await listJobs(products, new Map());
      if (!first) throw Object.assign(new Error(`${path} is not on the default branch`), { name: "NotFound" });
      record = first.record;
      const bridges = bridgesOf(record, store);
      const lives = new Map();
      if (!record.end) {
        try {
          lives.set(id, await liveState(record, { host }, bridges));
        } catch (failure) {
          lives.set(id, { reachable: false, reason: said(failure), known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] });
        }
      }
      const [row] = await listJobs(products, lives);
      const live = lives.get(id);
      view.state = row.state;
      view.route = record.route;
      view.end = record.end;
      view.problem = live && !live.reachable ? `The runtime is not reachable: ${live.reason}` : !row.source.reachable ? `The record could not be read: ${row.source.reason}` : null;
      if (record.end && view.address === null && typeof record.end.log === "string") view.address = record.end.log;
      if (!record.end && !record.taken && record.route.startsWith("ci ")) view.missingSecret = await secretOf().catch(() => null);
      if (record.end && !answerRead && record.task === "with the hand-over" && record.route.startsWith("ci ") && typeof record.end.log === "string") {
        view.answer = await answerOf().catch((failure) => { view.problem = `The answer could not be read from the run's log. ${said(failure)}`; return null; });
      }
      if (!live || live.reachable) await logOf(bridges); // a runtime that has just not answered is not asked again for the log
    } catch (failure) {
      view.problem = `The job could not be followed. ${said(failure)}`;
    } finally {
      busy = false;
    }
    emit();
    if (!stopped && !record?.end) timer = setTimeout(poll, EVERY);
  }

  poll();
  return {
    stop() {
      stopped = true;
      clearTimeout(timer);
    },
    async cancel() {
      if (stopped || record === null || record.end) return;
      try {
        view.cancel = await cancelJob(record, { host }, bridgesOf(record, store));
        view.problem = null;
      } catch (failure) {
        view.problem = `Stop failed. ${said(failure)}`;
      }
      emit();
      clearTimeout(timer);
      await poll();
    },
  };
}

// joblogs.mjs — the jobs' logs kept on disk for six weeks (MOD-bridge-jobs, Parts: joblogs.mjs; Interfaces: keepJobLogs).
//
// Module: MOD-bridge-jobs
//
// In the folder `job-logs/` of the Bridge's data folder, readable by its user only, each job this Bridge took has two files: `<id>.log`, what its agent
// wrote to its standard output, as it wrote it, and `<id>.json`, the job as listJobs lists it, written when the job is taken and when it ends. Nothing
// else is written to them: no request, task, token or key. A job whose `<id>.json` was last written more than six weeks ago is removed, both files,
// whenever the folder is opened and whenever a job is taken. Without keepJobLogs, nothing is kept on disk.

import { appendFileSync, chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KEPT_MS = 6 * 7 * 24 * 60 * 60 * 1000;
const FOLDER = "job-logs";
// A job's identifier names its files: one segment of a path, of the characters an identifier has (MOD-job-ledger).
const IDENTIFIER = /^JOB-[A-Za-z0-9-]+$/;

let folder = null;

const fileOf = (id, extension) => (folder && IDENTIFIER.test(String(id)) ? join(folder, `${id}.${extension}`) : null);

/**
 * keepJobLogs(dataFolder: string) -> void — from now on keeps each job's log and its listing in `job-logs/` of the data folder, made readable by its user
 * only, and removes those of jobs whose listing was last written more than six weeks ago. Called once, by the composing program, before any job is taken.
 */
export function keepJobLogs(dataFolder) {
  folder = join(dataFolder, FOLDER);
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  chmodSync(folder, 0o700);
  removeOld();
}

// Removes the files of every job whose listing was last written more than six weeks ago, and every log without a listing as old.
export function removeOld(now = Date.now()) {
  if (!folder || !existsSync(folder)) return;
  for (const name of readdirSync(folder)) {
    const path = join(folder, name);
    if (now - statSync(path).mtimeMs > KEPT_MS) rmSync(path, { force: true });
  }
}

// A file that cannot be written leaves the job running as it is: the log is the job's account, not its condition.
const tolerant = (write) => { try { write(); } catch (failure) { console.error(`A job's log could not be written: ${failure.message}`); } };

// The listing of a job, written anew.
export function writeListing(job) {
  const path = fileOf(job.id, "json");
  if (path) tolerant(() => writeFileSync(path, `${JSON.stringify(job)}\n`, { mode: 0o600 }));
}

// What an agent wrote, added to its job's log as it wrote it.
export function appendOutput(id, chunk) {
  const path = fileOf(id, "log");
  if (path) tolerant(() => appendFileSync(path, chunk, { mode: 0o600 }));
}

// The listings of the jobs kept, in no order.
export function readListings() {
  if (!folder || !existsSync(folder)) return [];
  return readdirSync(folder).filter((name) => name.endsWith(".json")).flatMap((name) => {
    try { return [JSON.parse(readFileSync(join(folder, name), "utf8"))]; } catch { return []; }
  });
}

// The text of a job's log, or null where none is kept.
export function readOutput(id) {
  const path = fileOf(id, "log");
  if (!path) return null;
  if (existsSync(path)) return readFileSync(path, "utf8");
  return existsSync(fileOf(id, "json")) ? "" : null;
}

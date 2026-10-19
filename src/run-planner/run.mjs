// Run — a run from its record (MOD-run-planner, Interfaces: Run, runOf; Data). A run is a job record of kind `run`, in the format MOD-job-ledger defines
// and reads: its `works_on` is the selection, its parameters its limits, a `## Job started` part names each job it started, and a `## Limits raised`
// part holds the limits a person raised, the newest in force. A run's end is `## End`: `done` for a finished run, `cancelled` for a run a person stopped.
//
// Module: MOD-run-planner
//
// Pure: nothing is read or written here; the record and the rows of the run's jobs are handed in.

/**
 * runOf(record: JobRecord, jobs: JobRow[]) -> Run — a run from its record and the rows of its jobs, with the limits of its newest `## Limits raised`
 * part, or of its parameters. Throws NotARun for a record of another kind. The state is `finished` for a record ended `done`, `stopped` for one ended
 * `cancelled`; else `held by a limit` when the cost the rows report reaches the cost limit in force, else `waiting at a gate` when a row waits at one,
 * else `running`.
 * @param {object} record @param {object[]} jobs
 * @returns {{ id: string, selection: string[], limits: { jobsAtOnce: number, cost: number | null, rounds: number },
 *   jobs: Array<{ job: string, kind: string, worksOn: string }>, state: string }}
 */
export function runOf(record, jobs = []) {
  if (record?.kind !== "run") {
    throw Object.assign(new TypeError(`${record?.id ?? "this record"} is a record of kind ${record?.kind ?? "none"}, not of a run`), { name: "NotARun" });
  }
  const newest = (record.limitsRaised ?? []).at(-1)?.limits ?? null;
  const given = newest ?? record.params ?? {};
  const limits = { jobsAtOnce: given.jobsAtOnce, cost: given.cost ?? null, rounds: given.rounds };
  const reported = jobs.reduce((sum, row) => sum + (row?.cost?.known === true ? row.cost.amount : 0), 0);
  return {
    id: record.id,
    selection: [...(record.worksOn ?? [])],
    limits,
    jobs: (record.jobs ?? []).map((job) => ({ job: job.job, kind: job.kind, worksOn: (job.worksOn ?? []).join(", ") })),
    state: record.end?.state === "done" ? "finished" : record.end?.state === "cancelled" ? "stopped"
      : limits.cost !== null && reported >= limits.cost ? "held by a limit"
        : jobs.some((row) => row?.state === "waiting at a gate") ? "waiting at a gate" : "running",
  };
}

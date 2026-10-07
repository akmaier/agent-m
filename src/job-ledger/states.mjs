// The derivation of a job's state (MOD-job-ledger, Interfaces: jobState; Data: JobState).
//
// Module: MOD-job-ledger
//
// From the record's last part; for a job that has not ended, with the live state: a runtime that is reachable and does
// not know the job makes it "ended without record"; an unreachable one leaves it as the record alone says (PROGRESS AND
// JOB STATE ARE DERIVED, NOT STORED; A RECORD IS EVIDENCE, NOT A PROPOSAL). A record waiting at an unresolved gate — a
// named gate or a question to the author, under the same heading `## Gate reached` — is "waiting at a gate", whatever
// the live state says: a person's or a check's decision ends that wait, not the runtime.

/**
 * jobState(record: JobRecord, live: LiveState | null) -> JobState
 */
export function jobState(record, live) {
  if (record.end) return record.end.state;
  if (record.question) return "waiting at a gate";
  const lastGate = record.gates[record.gates.length - 1];
  if (lastGate && lastGate.resumedBy === null) return "waiting at a gate";
  if (!record.taken) return "queued";
  if (live && live.reachable && !live.known) return "ended without record";
  if (live && live.reachable && live.known) return live.cancelling ? "cancelling" : "running";
  return "running";
}

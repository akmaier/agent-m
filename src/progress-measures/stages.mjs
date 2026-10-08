// stages.mjs — waitingForAcceptance: what waits for the person's acceptance in one repository, derived from the
// snapshot and, for a release-test report, its host through MOD-release-evidence (MOD-progress-measures, Interfaces).
// stageShares, currentStage, the build in progress and waitingForAPerson are not built yet (index.mjs).
//
// Module: MOD-progress-measures

import { statuses } from "../approvals/index.mjs";
import { queues } from "../spec-changes/index.mjs";
import { reportsAwaitingAcceptance } from "../release-evidence/index.mjs";

// The human-readable kind MOD-progress-measures' waitingForAcceptance names a reviewed file by (Interfaces), keyed by
// MOD-approvals' own kind (approval-record.schema.md). A kind with no entry here — release-report — names no
// reviewed file this item derives a wait from.
const REVIEWED_KINDS = { "use-case": "use case", "architecture-decision": "architecture decision", module: "module" };

// The statuses MOD-approvals derives that still wait for the person's acceptance — not accepted.
const WAITING_STATUSES = new Set(["open", "changed"]);

// Every queue's folder, docs/spec-freigaben/<slug>/ (MOD-spec-changes, Data), stripped to build an entry's
// identifier, spec-<slug>-<NN> (MOD-approvals, Data: the approval record's path for an entry of a change queue).
const QUEUE_FOLDER_PREFIX = "docs/spec-freigaben/";

/**
 * waitingForAcceptance(host, snapshot) -> Promise<Array<{ kind, id, path, blob }>> — what waits for the person's
 * acceptance in one repository (MOD-progress-measures, Interfaces): every entry of a change queue in the state open
 * (MOD-spec-changes' queues), and every use case, architecture decision and module file whose status is open or
 * changed (MOD-approvals' statuses), and a completed release candidate's report (MOD-release-evidence).
 * @param {{ listTags: (pattern: string) => Promise<Array<{ name: string, commit: string }>> }} host
 * @param {{ paths: string[], read: (path: string) => Promise<string | null>, blob: (path: string) => string | null }} snapshot
 * @returns {Promise<Array<{ kind: string, id: string, path: string, blob: string }>>}
 */
export async function waitingForAcceptance(host, snapshot) {
  const specChanges = (await queues(snapshot)).flatMap((queue) => {
    const slug = queue.folder.slice(QUEUE_FOLDER_PREFIX.length);
    return queue.entries
      .filter((entry) => entry.state === "open")
      .map((entry) => ({
        kind: "SPEC change",
        id: `spec-${slug}-${String(entry.number).padStart(2, "0")}`,
        path: entry.proposal.path,
        blob: entry.proposal.blob,
      }));
  });

  const reviewed = [...statuses(snapshot)]
    .filter(([, status]) => Object.hasOwn(REVIEWED_KINDS, status.kind) && WAITING_STATUSES.has(status.status))
    .map(([path, status]) => ({ kind: REVIEWED_KINDS[status.kind], id: status.id, path, blob: snapshot.blob(path) }));

  const report = await reportsAwaitingAcceptance(host, snapshot);
  const releaseReport = report ? [{
    kind: "release test report", id: `release-v${report.version}`, path: report.record, blob: report.blob,
  }] : [];
  return [...specChanges, ...reviewed, ...releaseReport];
}

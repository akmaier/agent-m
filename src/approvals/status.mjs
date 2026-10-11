// status.mjs — statuses: the status of every reviewed file of a snapshot, from one pass over docs/approvals/; and
// lastAcceptedText: the text that the most recent record of an identifier names (MOD-approvals, Interfaces). statusOf is not
// built yet (ITM-233 builds statuses, ITM-334 lastAcceptedText).
//
// Module: MOD-approvals
//
// STATUS IS DERIVED FROM THE RECORDS: a reviewed file counts as accepted exactly when an approval record names its
// current blob SHA. A record's own path names what it approves and the blob it names,
// docs/approvals/<ID>-<blob12>.md — the first twelve hex digits of the 40-hex blob its text would also state
// (MOD-approvals, Data; AN APPROVAL NAMES THE EXACT TEXT). A snapshot already holds every path and every blob SHA of
// its tree in memory (MOD-repository-hosts, Snapshot: paths, blob), so status is derived from the names alone, matched
// by identifier — so a renamed file keeps its status, as MOD-approvals' statusOf states it: no record's text is read,
// and statuses crosses no network. lastAcceptedText does: it reads the repository, the history of the records and the text
// itself through the host it is given. Host, Snapshot and HistoryEntry are MOD-repository-hosts' types.

import { readDocument } from "../documents/index.mjs";
import { kindOfIdentifier } from "../identifiers/index.mjs";
import { HostError } from "../repository-hosts/index.mjs";
// The schema is loaded by index.mjs, once, and used here only when a function is called: that is after both have loaded.
import { approvalSchema } from "./index.mjs";

// The approval record's `kind` for a reviewed file's identifier kind (MOD-approvals, Data: kind is one of use-case,
// architecture-decision, module, spec, release-report). This item derives only the three a reviewed file's own folder
// gives by the identifier scheme — UC in docs/use-cases/, ARC and MOD in docs/architecture/; spec and release-report
// name no such file and are no part of it (statuses' Files: docs/use-cases/UC-*.md, docs/architecture/ARC-*.md,
// docs/architecture/MOD-*.md).
const RECORD_KIND = { UC: "use-case", ARC: "architecture-decision", MOD: "module" };

// A reviewed file's identifier and kind from its path, by the naming rules ONE USE CASE, ONE FILE
// (docs/use-cases/UC-<nnn>-<slug>.md), ONE ARCHITECTURE DECISION, ONE FILE (docs/architecture/ARC-<nnn>-<slug>.md) and
// ONE MODULE, ONE FILE (docs/architecture/MOD-<slug>.md, the whole slug its identifier) — or null for a path that is
// none of them. The exact digit counts of each kind are MOD-identifiers' (kindOfIdentifier), not repeated here.
function reviewedFile(path) {
  const name = path.split("/").pop() ?? "";
  if (!name.endsWith(".md")) return null;
  const stem = name.slice(0, -3);
  if (path.startsWith("docs/architecture/") && kindOfIdentifier(stem) === "MOD") {
    return { id: stem, kind: RECORD_KIND.MOD };
  }
  const m = /^([A-Z]+-\d+)-/.exec(stem);
  if (!m) return null;
  const kind = kindOfIdentifier(m[1]);
  if (path.startsWith("docs/use-cases/") && kind === "UC") return { id: m[1], kind: RECORD_KIND.UC };
  if (path.startsWith("docs/architecture/") && kind === "ARC") return { id: m[1], kind: RECORD_KIND.ARC };
  return null;
}

// An approval record's identifier and the first twelve hex digits of the blob its own name says it approves, from its
// path docs/approvals/<ID>-<blob12>.md (MOD-approvals, Data) — or null for a path of no such shape
// (docs/approvals/README.md among them).
const RECORD_NAME = /^docs\/approvals\/([^/]+)-([0-9a-f]{12})\.md$/;
function approvalRecord(path) {
  const m = RECORD_NAME.exec(path);
  return m ? { id: m[1], blob12: m[2] } : null;
}

/**
 * statuses(snapshot: Snapshot) -> Map<string, { id: string, kind: string, status: "open" | "accepted" | "changed" }> —
 * the status of every reviewed file of a snapshot, keyed by path; computed in one pass over docs/approvals/.
 * @param {{ paths: string[], blob: (path: string) => string | null }} snapshot
 * @returns {Map<string, { id: string, kind: string, status: "open" | "accepted" | "changed" }>}
 */
export function statuses(snapshot) {
  const recordsById = new Map();
  for (const path of snapshot.paths) {
    const record = approvalRecord(path);
    if (!record) continue;
    if (!recordsById.has(record.id)) recordsById.set(record.id, []);
    recordsById.get(record.id).push(record.blob12);
  }
  const out = new Map();
  for (const path of snapshot.paths) {
    const file = reviewedFile(path);
    if (!file) continue;
    const blob12s = recordsById.get(file.id) ?? [];
    const blob = snapshot.blob(path);
    const status = blob12s.some((blob12) => typeof blob === "string" && blob.startsWith(blob12)) ? "accepted"
      : blob12s.length ? "changed" : "open";
    out.set(path, { id: file.id, kind: file.kind, status });
  }
  return out;
}

/**
 * lastAcceptedText(id: string, host: Host) -> Promise<{ text: string, blob: string, path: string } | null> — the text that the
 * most recent approval record of the identifier `id` names, with the blob the record names and the path the file had when it
 * was accepted (the record's `file`), also when the file has been renamed since; null when no record names the identifier.
 * The records of an identifier are those of the default branch whose names carry it (docs/approvals/<id>-<blob12>.md); the
 * most recent is the one whose commit, found in the history of the record, was committed last — the date as the server gives
 * it, in its own offset; two records committed at the same instant are not told apart. The text is read in the repository as
 * it stood at the commit that added that record, where the file still has the path the record names. Crosses the network,
 * through the host; fails with its failures, unchanged — TokenRefused, RateLimited, NotFound, Unreachable —, and with
 * NotFound { what: the file } when the file did not hold the text the record names at the commit that added the record: no
 * other text is given for it.
 * @param {string} id
 * @param {object} host
 * @returns {Promise<{ text: string, blob: string, path: string } | null>}
 */
export async function lastAcceptedText(id, host) {
  const { defaultBranch } = await host.repositoryInfo();
  const head = await host.readSnapshot(defaultBranch);
  const records = head.paths.filter((path) => approvalRecord(path)?.id === id);
  if (records.length === 0) return null;
  const added = await Promise.all(records.map(async (path) => {
    const [adding] = await host.readHistory(path, { ref: head.commit, limit: 1 });
    return { path, commit: adding.commit, at: Date.parse(adding.date) };
  }));
  const last = added.reduce((newest, each) => (each.at > newest.at ? each : newest));
  const { file, blob } = readDocument(approvalSchema, last.path, await head.read(last.path)).fields;
  const then = await host.readSnapshot(last.commit);
  if (then.blob(file) !== blob) {
    throw new HostError("NotFound", { what: file }, `${file} did not hold the text ${last.path} names when the record was added`);
  }
  return { text: await then.read(file), blob, path: file };
}

// status.mjs — statuses: the status of every reviewed file of a snapshot, from one pass over docs/approvals/
// (MOD-approvals, Interfaces). lastAcceptedText is not built yet (ITM-233 builds only statuses and approvalSchema,
// index.mjs).
//
// Module: MOD-approvals
//
// STATUS IS DERIVED FROM THE RECORDS: a reviewed file counts as accepted exactly when an approval record names its
// current blob SHA. A record's own path names what it approves and the blob it names,
// docs/approvals/<ID>-<blob12>.md — the first twelve hex digits of the 40-hex blob its text would also state
// (MOD-approvals, Data; AN APPROVAL NAMES THE EXACT TEXT). A snapshot already holds every path and every blob SHA of
// its tree in memory (MOD-repository-hosts, Snapshot: paths, blob), so status is derived from the names alone, matched
// by identifier — so a renamed file keeps its status, as MOD-approvals' statusOf states it: no record's text is read,
// and nothing here crosses the network.

import { kindOfIdentifier } from "../identifiers/index.mjs";

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

// queues.mjs — queues: every queue of a snapshot with its entries and each entry's state (MOD-spec-changes,
// Interfaces). The module's Queue and queues are built here: an entry is open, approved, in SPEC, stale or waiting for its
// anchor, derived and never written. ITM-234 built open, approved and in SPEC from each queue's index.md and
// entscheidungen.md and the approval records under docs/approvals/, matched to an entry by name alone, as MOD-approvals'
// statuses matches a reviewed file to its record. ITM-339 adds the two states that need the text of the target, and
// createdBy:
//
//   - A decision row decides: an entry it names is in SPEC.
//   - Otherwise a record that names the entry makes it stale when it names a proposal blob that is no longer the proposal's
//     (its file name carries the first twelve digits of the blob it names) or a SPEC section that is no longer the section as
//     the target holds it (its text names the section's blob, which is the git blob SHA of the section's exact bytes,
//     MOD-spec-document's sectionText; a record that names no section names another); and approved when it names both.
//   - An entry without a record waits for its anchor when the target does not hold the anchor and an earlier entry of the
//     queue, one above it in the index with another anchor, holds it in its proposal; createdBy is that entry's number, and
//     is set for every undecided entry whose anchor is missing and created.
//   - What the snapshot cannot read gives no evidence: without the target's text, or a record's, the entry keeps the state
//     ITM-234 derived. The target of an entry is the file its own row names (Datei).
//
// openQueueOf, proposeSection, saveEntry, entrySections and requirementHistory are not built yet (index.mjs); entryView, which reads
// an entry through this file, is accept.mjs's, and specStrategies' recipe spec-with-queues, which reads every queue through it,
// strategies.mjs's. Its own data files, the two schemas below, are read once, when the module is loaded: from the disk in Node, from the
// module's own address in a browser — as MOD-approvals' index.mjs reads its own.
//
// Module: MOD-spec-changes

import { loadSchema, readDocument, readRegister } from "../documents/index.mjs";
import { approvalSchema } from "../approvals/index.mjs";
import { sectionText } from "../spec-document/index.mjs";
import { blobSha } from "../text-tools/index.mjs";

const OWNER = "MOD-spec-changes";
const INDEX_SCHEMA_FILE = new URL("./queue-index.schema.md", import.meta.url);
const DECISIONS_SCHEMA_FILE = new URL("./queue-decisions.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming
// the file and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

const queueIndexSchema = loadSchema(
  disk ? disk.readFileSync(INDEX_SCHEMA_FILE, "utf8") : await ownFile(INDEX_SCHEMA_FILE), OWNER);
const queueDecisionsSchema = loadSchema(
  disk ? disk.readFileSync(DECISIONS_SCHEMA_FILE, "utf8") : await ownFile(DECISIONS_SCHEMA_FILE), OWNER);

// A queue is a folder docs/spec-freigaben/<YYYY-MM-DD><letter>_<slug>/ (MOD-spec-changes, Data); every queue has
// exactly one index.md, so its folder is found from the snapshot's own paths, without a request.
const QUEUE_INDEX = /^docs\/spec-freigaben\/([^/]+)\/index\.md$/;

// A spec approval record's file name, docs/approvals/spec-<queue folder>-<NN>-<blob12>.md (MOD-spec-changes, Files).
const RECORD_FILE = /^spec-(.+)-(\d{2})-([0-9a-f]{12})\.md$/;

// A decision row's fourth cell that names a record, approval:<file name> (MOD-spec-changes, Data). A row of the
// retired form — a bare commit SHA — matches nothing here (queue-decisions.schema.md).
const APPROVAL_REF = /^approval:(.+)$/;

// The line above the entry table that names every entry's target, in backticks (MOD-spec-changes, Data): what the
// schema's language cannot say, read from the underTitle section's own text.
const TARGET_LINE = /\*\*Zieldatei aller Einträge:\*\*\s*(.+)/;

// A value written in backticks for readability, with the backticks taken off; any other value as it stands — what
// the schema's "text" columns do not strip themselves.
function unbacktick(text) {
  const t = String(text ?? "").trim();
  return t.length >= 2 && t.startsWith("`") && t.endsWith("`") ? t.slice(1, -1) : t;
}

// The <title> of a queue's title line "# SPEC approvals — queue <folder date> · <title>" (MOD-spec-changes, Data):
// document.title is that line without its leading "# " (MOD-documents); this item reads the part after "·".
function titleOf(heading) {
  const m = /·\s*(.+)$/.exec(heading ?? "");
  return (m ? m[1] : heading ?? "").trim();
}

// The target named above the entry table, or "" when the line is not found.
function targetOf(sectionText) {
  const m = TARGET_LINE.exec(sectionText ?? "");
  return m ? unbacktick(m[1]) : "";
}

// The file names directly under a queue's folder, from the paths a snapshot already holds in memory — no request.
function filesOf(paths, base) {
  const prefix = `${base}/`;
  return paths.filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes("/"))
    .map((p) => p.slice(prefix.length));
}

// Every spec approval record under docs/approvals/, by its queue folder and entry number, from the record's own
// file name alone — no record's text is read, so a renamed queue folder would lose the match, as MOD-approvals'
// statuses notes for a renamed reviewed file.
function specRecordsOf(paths) {
  const byKey = new Map();
  for (const path of paths) {
    if (!path.startsWith("docs/approvals/spec-")) continue;
    const m = RECORD_FILE.exec(path.slice("docs/approvals/".length));
    if (!m) continue;
    const key = `${m[1]}#${m[2]}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push({ path, blob12: m[3] });
  }
  return byKey;
}

// The decision row of entscheidungen.md for each entry number that names a record, keyed by the entry's number.
async function decisionsOf(snapshot, base) {
  const path = `${base}/entscheidungen.md`;
  const text = await snapshot.read(path);
  const out = new Map();
  if (text === null) return out;
  const { rows } = readRegister(queueDecisionsSchema, path, text);
  for (const row of rows) {
    const ref = APPROVAL_REF.exec(String(row.cells.Reference ?? ""));
    if (ref) out.set(row.cells.Entry, `docs/approvals/${ref[1]}`);
  }
  return out;
}

// One entry of the index table (MOD-spec-changes, Interfaces: Queue), as its files alone give it: open, approved or in SPEC
// by the names of its records and its decision row, and createdBy null. What the target's text adds is withEvidence's.
function entryOf(row, folder, base, files, snapshot, records, decisions) {
  const number = row.cells.Nr;
  const nn = String(number).padStart(2, "0");
  const fileName = files.find((name) => name.startsWith(`${nn}-`) && name.endsWith(".md")
    && !name.endsWith(".begruendung.md"));
  const proposalPath = fileName ? `${base}/${fileName}` : null;
  const blob = proposalPath ? snapshot.blob(proposalPath) : null;
  const rationale = fileName ? `${base}/${fileName.replace(/\.md$/, ".begruendung.md")}` : "";

  const decisionRecord = decisions.get(number) ?? null;
  const candidates = records.get(`${folder}#${nn}`) ?? [];
  const approved = candidates.find((c) => typeof blob === "string" && blob.startsWith(c.blob12)) ?? null;
  const recordPath = approved ? approved.path : decisionRecord;

  return {
    number,
    file: unbacktick(row.cells.Datei),
    anchor: row.cells["Anker (Überschrift, wortgetreu)"] ?? "",
    until: row.cells["bis (exklusiv)"] ?? null,
    proposal: { path: proposalPath, blob },
    rationale,
    record: recordPath,
    decision: decisionRecord,
    state: decisionRecord ? "in SPEC" : approved ? "approved" : "open",
    createdBy: null,
  };
}

// A record's file name key for an entry, <queue folder>#<NN>, as specRecordsOf keys them.
const recordKey = (folder, number) => `${folder}#${String(number).padStart(2, "0")}`;

// Whether the record at `path` names a SPEC section other than `section`: the blob in its text's `section` line against the blob
// of the section's exact bytes. A record the snapshot cannot read gives no evidence and names none; one it reads that names no
// section does not name this one.
async function namesOtherSection(snapshot, path, section) {
  const recordText = await snapshot.read(path);
  if (typeof recordText !== "string") return false;
  const named = readDocument(approvalSchema, path, recordText).fields.section;
  return named !== await blobSha(section);
}

// The number of the earlier entry whose proposal holds `entry`'s anchor as a section, or null. An earlier entry is one above it in
// the index; an entry with the same anchor replaces the same section and creates nothing for it.
async function creatorOf(snapshot, entry, earlier) {
  for (const other of earlier) {
    if (other.anchor === entry.anchor || !other.proposal.path) continue;
    const proposal = await snapshot.read(other.proposal.path);
    if (typeof proposal === "string" && sectionText(proposal, entry.anchor) !== null) return other.number;
  }
  return null;
}

// The queue with the states and createdBy that need the target's text (ITM-339), entry by entry in the index's order. The target of
// an entry is the file its own Datei cell names; the queue's line "Zieldatei aller Einträge", which a queue written in another
// repository gives as products/<name>/SPEC.md, stays Queue.target and finds no section. An entry a decision row names needs no text,
// and one whose target the snapshot cannot read keeps the state its files give.
async function withEvidence(snapshot, queue, folder, records) {
  const entries = [];
  for (const entry of queue.entries) {
    const targetText = entry.state === "in SPEC" ? null : await snapshot.read(entry.file);
    if (typeof targetText !== "string") {
      entries.push(entry);
      continue;
    }
    const section = sectionText(targetText, entry.anchor);
    const createdBy = section === null ? await creatorOf(snapshot, entry, entries) : null;
    const named = records.get(recordKey(folder, entry.number)) ?? [];
    let { state } = entry;
    if (named.length > 0) {
      // A record that names the proposal's current blob is the entry's record (entryOf); one that names another leaves it none.
      if (state !== "approved" || (section !== null && await namesOtherSection(snapshot, entry.record, section))) state = "stale";
    } else if (createdBy !== null) {
      state = "waiting for its anchor";
    }
    entries.push({ ...entry, state, createdBy });
  }
  return { ...queue, entries };
}

// One queue, with every entry of its index table and its state.
async function oneQueue(snapshot, folder, records) {
  const base = `docs/spec-freigaben/${folder}`;
  const files = filesOf(snapshot.paths, base);
  const indexPath = `${base}/index.md`;
  const indexText = await snapshot.read(indexPath);
  const { document, rows } = readRegister(queueIndexSchema, indexPath, indexText ?? "");
  const decisions = await decisionsOf(snapshot, base);
  const entries = rows.map((row) => entryOf(row, folder, base, files, snapshot, records, decisions));
  const queue = { folder: base, title: titleOf(document.title), target: targetOf(document.sections[0]?.text), entries };
  return withEvidence(snapshot, queue, folder, records);
}

/**
 * @typedef {{ path: string, blob: string | null }} Proposal
 * @typedef {{ number: number, file: string, anchor: string, until: string | null, proposal: Proposal,
 *   rationale: string, record: string | null, decision: string | null,
 *   state: "open" | "approved" | "in SPEC" | "stale" | "waiting for its anchor", createdBy: number | null }} Entry
 * @typedef {{ folder: string, title: string, target: string, entries: Entry[] }} Queue
 */

/**
 * queues(snapshot: Snapshot) -> Promise<Queue[]> — every queue of a snapshot with every entry and its state, newest
 * first (MOD-spec-changes, Interfaces).
 * @param {{ paths: string[], read: (path: string) => Promise<string | null>, blob: (path: string) => string | null }} snapshot
 * @returns {Promise<Queue[]>}
 */
export async function queues(snapshot) {
  const folders = snapshot.paths.map((p) => QUEUE_INDEX.exec(p)?.[1]).filter(Boolean).sort().reverse();
  const records = specRecordsOf(snapshot.paths);
  const out = [];
  for (const folder of folders) out.push(await oneQueue(snapshot, folder, records));
  return out;
}

/**
 * queueAt(snapshot, base) -> Promise<Queue | null> — the one queue whose folder is `base`, docs/spec-freigaben/<folder>, as
 * queues gives it, or null where the snapshot holds no such queue. For entryView, which needs one queue and not all of them.
 * @param {{ paths: string[], read: (path: string) => Promise<string | null>, blob: (path: string) => string | null }} snapshot
 * @param {string} base
 * @returns {Promise<Queue | null>}
 */
export async function queueAt(snapshot, base) {
  const folder = QUEUE_INDEX.exec(`${base}/index.md`)?.[1];
  if (!folder || !snapshot.paths.includes(`${base}/index.md`)) return null;
  return oneQueue(snapshot, folder, specRecordsOf(snapshot.paths));
}

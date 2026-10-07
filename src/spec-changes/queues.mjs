// queues.mjs — queues: every queue of a snapshot with its entries and each entry's state (MOD-spec-changes,
// Interfaces). Of the module, this item (ITM-234) builds Queue and queues: entries in the state open, approved or in
// SPEC, read from each queue's index.md and entscheidungen.md and from the approval records under docs/approvals/ —
// matched to an entry by name alone, as MOD-approvals' statuses matches a reviewed file to its record: no record's
// text is read. The states stale and waiting for its anchor are not part of this item: they need a SPEC section's
// text, which this item does not read; an entry that would be either of them reads as open here (ITM-234, Outcome).
// openQueueOf, proposeSection, entryView, acceptEntries, applyApproved, requirementHistory and specStrategies are not
// built yet (index.mjs). Its own data files, the two schemas below, are read once, when the module is loaded: from
// the disk in Node, from the module's own address in a browser — as MOD-approvals' index.mjs reads its own.
//
// Module: MOD-spec-changes

import { loadSchema, readRegister } from "../documents/index.mjs";

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

// One entry of the index table (MOD-spec-changes, Interfaces: Queue). Its state is open, approved or in SPEC — this
// item derives no other (ITM-234, Outcome): createdBy, which only the excluded "waiting for its anchor" needs, is
// always null here.
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

// One queue, with every entry of its index table and its state.
async function oneQueue(snapshot, folder, records) {
  const base = `docs/spec-freigaben/${folder}`;
  const files = filesOf(snapshot.paths, base);
  const indexPath = `${base}/index.md`;
  const indexText = await snapshot.read(indexPath);
  const { document, rows } = readRegister(queueIndexSchema, indexPath, indexText ?? "");
  const decisions = await decisionsOf(snapshot, base);
  const entries = rows.map((row) => entryOf(row, folder, base, files, snapshot, records, decisions));
  return { folder: base, title: titleOf(document.title), target: targetOf(document.sections[0]?.text), entries };
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
 * first (MOD-spec-changes, Interfaces). This item derives only open, approved and in SPEC (ITM-234, Outcome).
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

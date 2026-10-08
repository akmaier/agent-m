// MOD-job-ledger — the record, state and cost of every job (docs/architecture/MOD-job-ledger.md): its interface. Of it,
// ITM-252 builds JobStart, RecordPart, JobRecord, LiveState, JobState, Cost, JobRow, newJobId, startRecord, jobState,
// listJobs, recordsNewestFirst and jobCost, as its file states them: a job's identifier, none of those its product holds; the start of its
// record; a record read with every part appended to it, each kind of part as the file writes it — the lines
// `gate record:`, `works on:` and `jobs at once:` with their spaces, a question to the author under `## Gate reached`,
// an End's `draft:` as one fenced JSON block, its End without a round record (MOD-job-runner's roundsText, which no
// item has built and no job has written yet); its state from its last part and, for a job that has not ended, from its
// runtime's live state; and every job of the products given, newest first, with its cost. appendToRecord and takeJob
// belong to the routes of UC-010/UC-011 and are not built yet.
//
// Module: MOD-job-ledger
//
// It belongs to Participants and jobs (ARC-046). It runs unchanged in a browser and in Node. Its one read is that of its
// own data file job.schema.md — the job record's schema, in MOD-documents' language —, once, when the module is loaded:
// from the disk in Node, from the module's own address in a browser, as src/participant-list/index.mjs reads its schema.
// A schema that cannot be read, or that breaks the language, stops the module's load. listJobs reads docs/jobs/ of the
// snapshots it is given, through MOD-repository-hosts' Snapshot; nothing else here crosses the network. It uses
// MOD-documents only through its index.mjs. Every other file of this folder is private to it.

import { loadSchema, readDocument, writeDocument } from "../documents/index.mjs";
import { jobState } from "./states.mjs";
import { jobCost } from "./cost.mjs";

const OWNER = "MOD-job-ledger";
const SCHEMA_FILE = new URL("./job.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the
// file and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

/**
 * jobSchema: Schema — the job record's schema, read from this module's data file job.schema.md with MOD-documents'
 * loadSchema.
 */
export const jobSchema = loadSchema(
  disk ? disk.readFileSync(SCHEMA_FILE, "utf8") : await ownFile(SCHEMA_FILE), OWNER);

export { jobState } from "./states.mjs";
export { jobCost } from "./cost.mjs";

// ---------------------------------------------------------------- the types this module provides (MOD-job-ledger.md, Data
// and Interfaces)

/**
 * The start of a job, everything its record's front matter, Destinations and Parameters hold — what the caller gives
 * startRecord.
 * @typedef {{ id: string, kind: string, worksOn: string[], participant: string | null, model: string | null,
 *   route: string, run: string | null, retries: string | null, startedBy: string, start: Date,
 *   agentM: { version: string, commit: string }, inputs: string[], limit: number,
 *   destinations: Array<{ participant: string, place: string, parts: string[] }>, params: Record<string, unknown> }}
 *   JobStart
 */

/**
 * One part of a record, as it is appended over time (MOD-job-ledger.md, Data: the appended sections). A `"gate reached"`
 * part is a named gate; a `"question"` part is the other form of the same heading, a question to the author.
 * @typedef {{ part: "taken", at: Date, by: string } | { part: "gate reached", at: Date, gate: string, decider: string } |
 *   { part: "question", at: Date, question: string } | { part: "resumed", at: Date, gateRecord: string } |
 *   { part: "job started", at: Date, job: string, kind: string, worksOn: string[] } |
 *   { part: "limits raised", at: Date, by: string, limits: { jobsAtOnce: number, cost: number | null, rounds: number } } |
 *   { part: "end", at: Date, state: "done" | "failed" | "cancelled", results: string[], draft: unknown | null,
 *     rounds: Round[], usage: Usage | null, cost: Cost, reason: string | null, log: string | null } } RecordPart
 */

/**
 * The record as readDocument's Document gives it, turned into this module's own shape: the fields of JobStart, its
 * path, and what is appended — each null or empty while absent. `gates` holds only a named gate, each with the record
 * that resumed it; `question` is the record's current question — the question of its last `## Gate reached` when that
 * one is not yet resumed, else null.
 * @typedef {{ id: string, kind: string, worksOn: string[], participant: string | null, model: string | null,
 *   route: string | null, run: string | null, retries: string | null, startedBy: string | null, start: Date | null,
 *   agentM: { version: string, commit: string } | null, inputs: string[], limit: number | null,
 *   destinations: Array<{ participant: string, place: string, parts: string[] }>, params: Record<string, unknown>,
 *   path: string, taken: { at: Date, by: string } | null,
 *   gates: Array<{ at: Date, gate: string, decider: string, resumedBy: string | null }>, question: string | null,
 *   jobs: Array<{ at: Date, job: string, kind: string, worksOn: string[] }>,
 *   limitsRaised: Array<{ at: Date, by: string, limits: { jobsAtOnce: number, cost: number | null, rounds: number } }>,
 *   end: { at: Date, state: "done" | "failed" | "cancelled", results: string[], draft: unknown | null, rounds: Round[],
 *     usage: Usage | null, cost: Cost | null, reason: string | null, log: string | null } | null }} JobRecord
 */

/**
 * What a job's runtime reports while it has not ended (MOD-runtimes).
 * @typedef {{ reachable: boolean, reason: string | null, known: boolean, running: boolean, cancelling: boolean,
 *   log: string | null, usage: Usage | null, writtenAfterCancel: string[] }} LiveState
 */

/**
 * The seven states of ONE DASHBOARD SHOWS EVERY JOB; "cancelling" shown within "running".
 * @typedef {"queued" | "running" | "cancelling" | "waiting at a gate" | "done" | "failed" | "cancelled" |
 *   "ended without record"} JobState
 */

/**
 * A job's cost: known, with the amount and how it was found; or unknown, with the usage if any was reported
 * (NO COST IS GUESSED — never zero, never an estimate).
 * @typedef {{ known: true, amount: number, currency: string, basis: "reported" | "usage at the declared price" } |
 *   { known: false, usage: Usage | null }} Cost
 */

/**
 * One line of the job dashboard's list.
 * @typedef {{ record: JobRecord, product: string, state: JobState, elapsed: number, cost: Cost,
 *   source: { reachable: boolean, reason: string | null } }} JobRow
 */

// ---------------------------------------------------------------- time, lists and the fields no scalar type expresses
//
// readDocument/writeDocument know only text, a list or a number (MOD-documents, Data: A document as this module reads
// it); a job's Date fields, its destinations, its parameters and its agent_m are this module's own, both ways.

const pad = (n, width) => String(n).padStart(width, "0");

// The "time" value of MOD-documents' schema language, minute precision, as job.schema.md's own worked example writes it.
function formatTime(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1, 2)}-${pad(date.getUTCDate(), 2)} `
    + `${pad(date.getUTCHours(), 2)}:${pad(date.getUTCMinutes(), 2)} UTC`;
}

const TIME_FORM = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}) UTC$/;

// The Date a "time" value holds, in either of the two forms MOD-documents' Data allows; null for a value that is
// neither — left out, or a line the record does not hold.
function parseTime(text) {
  if (!text) return null;
  const m = TIME_FORM.exec(text);
  if (m) {
    const [, y, mo, d, h, mi] = m;
    return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi)));
  }
  const iso = new Date(text);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

const asList = (value) => (Array.isArray(value) ? value : value ? [value] : []);

// "## Destinations": a bullet per destination, as the module file's own worked example writes it — "- NAME, at PLACE:
// PART, PART.".
function renderDestinations(destinations) {
  const lines = destinations.map((d) => `- ${d.participant}, at ${d.place}: ${d.parts.join(", ")}.`);
  return `\n${lines.join("\n")}\n\n`;
}

const DESTINATION_LINE = /^-\s*(.+?),\s*at\s+(.+?):\s*(.+)\.$/;

function parseDestinations(text) {
  const out = [];
  for (const raw of (text ?? "").split("\n")) {
    const m = DESTINATION_LINE.exec(raw.trim());
    if (m) out.push({ participant: m[1], place: m[2], parts: m[3].split(",").map((s) => s.trim()) });
  }
  return out;
}

// "## Parameters", and an End's "draft:" (job.schema.md's own note): the one fenced json block of the section's raw
// text — neither is a field this schema names, the same way MOD-documents hands back a section's raw text where a
// schema names no fields for it.
function renderParameters(params) {
  return `\n\`\`\`json\n${JSON.stringify(params ?? {}, null, 2)}\n\`\`\`\n\n`;
}

const JSON_BLOCK = /```json\n([\s\S]*?)\n```/;

function parseFencedJson(text, fallback) {
  const m = JSON_BLOCK.exec(text ?? "");
  if (!m) return fallback;
  try {
    return JSON.parse(m[1]);
  } catch {
    return fallback;
  }
}

// "agent_m": "<version>, commit <instance commit>", the module file's own worked example.
const renderAgentM = (agentM) => `${agentM.version}, commit ${agentM.commit}`;

function parseAgentM(text) {
  const m = /^(.*), commit (.+)$/.exec(text ?? "");
  return m ? { version: m[1], commit: m[2] } : { version: text ?? "", commit: "" };
}

// A field that is a JSON value on one line (Usage, Cost of "## End" — a value no scalar type of the schema language
// expresses; job.schema.md, its own note). "" and a missing line both decode to null.
function decodeJsonField(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- newJobId

// newJobId(now: Date, taken: Set<string>) -> string — a new identifier of the form JOB-<yyyymmdd>-<hhmm>-<4 hex>, none of
// `taken`. The caller gives the identifiers its product holds; a commit that would create an existing record is refused
// by the host, and the caller then asks for another (A JOB IDENTIFIER IS NEVER REUSED).
export function newJobId(now, taken) {
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1, 2)}${pad(now.getUTCDate(), 2)}`
    + `-${pad(now.getUTCHours(), 2)}${pad(now.getUTCMinutes(), 2)}`;
  let id;
  do {
    let hex = "";
    for (let i = 0; i < 4; i += 1) hex += Math.floor(Math.random() * 16).toString(16);
    id = `JOB-${stamp}-${hex}`;
  } while (taken.has(id));
  return id;
}

// ---------------------------------------------------------------- startRecord

// startRecord(job: JobStart) -> { path: string, text: string } — the record's start, for the caller to commit.
export function startRecord(job) {
  const path = `docs/jobs/${job.id}.md`;
  const document = {
    kind: "job",
    path,
    id: job.id,
    title: null,
    fields: {
      id: job.id,
      kind: job.kind,
      works_on: job.worksOn,
      participant: job.participant ?? "",
      model: job.model ?? "",
      route: job.route,
      run: job.run ?? "",
      retries: job.retries ?? "",
      started_by: job.startedBy,
      start: formatTime(job.start),
      agent_m: renderAgentM(job.agentM),
      inputs: job.inputs ?? [],
      limit: job.limit,
    },
    sections: [
      { heading: "## Destinations", text: renderDestinations(job.destinations ?? []) },
      { heading: "## Parameters", text: renderParameters(job.params ?? {}) },
    ],
    appended: [],
    body: "",
  };
  return { path, text: writeDocument(jobSchema, document) };
}

// ---------------------------------------------------------------- reading a record

// The appended chunks of one heading, in the order they stand.
const chunksOf = (doc, heading) => doc.appended.filter((chunk) => chunk.heading === heading);

// The record MOD-documents' Document gives, as this module's JobRecord (Data: a job's record; Interfaces: JobRecord).
// Pairing a "## Gate reached" (named gate or question, the Data table's two forms of the one heading) with the
// "## Resumed" that ends its wait is positional, in the order each stands — a job waits at one gate at a time
// (MOD-job-ledger.md, Data). `gates` holds only the named gates; `question` is the current question — that of the
// record's last "## Gate reached", when it is a question and nothing has resumed it yet, else null (so a question
// already resumed, like a named gate already resumed, does not leave the record "waiting at a gate" — states.mjs).
// Its End is read without a round record: no item has built MOD-job-runner's roundsText yet, and no job has written one
// (ITM-252's Outcome); its draft, where its kind hands one back, is the one fenced json block of the End's raw text,
// read the same way "## Parameters" is (job.schema.md, its own note).
function recordFromDocument(doc) {
  const f = doc.fields;
  const destinations = doc.sections.find((s) => s.heading === "## Destinations");
  const parameters = doc.sections.find((s) => s.heading === "## Parameters");
  const taken = chunksOf(doc, "## Taken")[0] ?? null;
  const reachedChunks = chunksOf(doc, "## Gate reached");
  const resumedChunks = chunksOf(doc, "## Resumed");
  const end = chunksOf(doc, "## End")[0] ?? null;

  const reached = reachedChunks.map((chunk, i) => ({
    at: parseTime(chunk.fields.at),
    gate: chunk.fields.gate || null,
    decider: chunk.fields.decider || null,
    question: chunk.fields.question || null,
    resumedBy: resumedChunks[i] ? resumedChunks[i].fields["gate record"] : null,
  }));
  const gates = reached.filter((r) => r.gate !== null).map(({ at, gate, decider, resumedBy }) => ({ at, gate, decider, resumedBy }));
  const lastReached = reached[reached.length - 1] ?? null;
  const question = lastReached && lastReached.resumedBy === null && lastReached.question !== null ? lastReached.question : null;

  return {
    id: doc.id,
    kind: f.kind,
    worksOn: asList(f.works_on),
    participant: f.participant || null,
    model: f.model || null,
    route: f.route,
    run: f.run || null,
    retries: f.retries || null,
    startedBy: f.started_by,
    start: parseTime(f.start),
    agentM: parseAgentM(f.agent_m),
    inputs: asList(f.inputs),
    limit: f.limit,
    destinations: parseDestinations(destinations?.text),
    params: parseFencedJson(parameters?.text, {}),
    path: doc.path,
    taken: taken ? { at: parseTime(taken.fields.at), by: taken.fields.by } : null,
    gates,
    question,
    jobs: chunksOf(doc, "## Job started").map((chunk) => ({
      at: parseTime(chunk.fields.at), job: chunk.fields.job, kind: chunk.fields.kind,
      worksOn: asList(chunk.fields["works on"]),
    })),
    limitsRaised: chunksOf(doc, "## Limits raised").map((chunk) => ({
      at: parseTime(chunk.fields.at), by: chunk.fields.by,
      limits: {
        jobsAtOnce: chunk.fields["jobs at once"], cost: chunk.fields.cost ?? null, rounds: chunk.fields.rounds,
      },
    })),
    end: end ? {
      at: parseTime(end.fields.at),
      state: end.fields.state,
      results: asList(end.fields.results),
      draft: parseFencedJson(end.text, null),
      rounds: [],
      usage: decodeJsonField(end.fields.usage),
      cost: decodeJsonField(end.fields.cost),
      reason: end.fields.reason ?? null,
      log: end.fields.log ?? null,
    } : null,
  };
}

// A record at a path that could not be read or did not parse: as much of JobRecord as a path alone gives, so the caller
// still lists it (listJobs: "a record that cannot be read is listed with what could be read and the reason").
function unreadableRecord(path) {
  const id = /([^/]+)\.md$/.exec(path)?.[1] ?? path;
  return {
    id, kind: null, worksOn: [], participant: null, model: null, route: null, run: null, retries: null, startedBy: null,
    start: null, agentM: null, inputs: [], limit: null, destinations: [], params: {}, path, taken: null, gates: [],
    question: null, jobs: [], limitsRaised: [], end: null,
  };
}

// ---------------------------------------------------------------- listJobs

const JOB_PATH = /^docs\/jobs\/JOB-[^/]+\.md$/;

function elapsedOf(record, live) {
  if (!record.start) return 0;
  const end = record.end ? record.end.at : (live?.known ? new Date() : record.start);
  if (!end) return 0;
  return Math.max(0, (end.getTime() - record.start.getTime()) / 1000);
}

function costOf(record, live) {
  if (record.end) return record.end.cost ?? { known: false, usage: record.end.usage ?? null };
  return { known: false, usage: live?.usage ?? null };
}

// waiting at a gate first among the jobs that have not ended; otherwise newest first, by the record's own start.
function compareRows(a, b) {
  const bucket = (row) => (row.state === "waiting at a gate" ? 0 : 1);
  const diff = bucket(a) - bucket(b);
  if (diff !== 0) return diff;
  const ta = a.record.start ? a.record.start.getTime() : 0;
  const tb = b.record.start ? b.record.start.getTime() : 0;
  return tb - ta;
}

// listJobs(products: { address: string, snapshot: Snapshot }[], live: Map<string, LiveState>) -> Promise<JobRow[]> —
// every job of every product given, newest first, waiting at a gate first among those that have not ended. A record
// that cannot be read is listed with what could be read and the reason.
//
// Gap (MOD-job-ledger.md, Interfaces): the line gives no Promise<...>, but a snapshot's read(path) is MOD-repository-
// hosts' own async Promise<string | null> (its file, Interfaces), the only way to reach a job record's text; this
// function is async for that reason, matching recordsNewestFirst's and takeJob's own async shape in the same file.
export async function listJobs(products, live) {
  const rows = [];
  for (const { address, snapshot } of products) {
    const paths = snapshot.paths.filter((path) => JOB_PATH.test(path));
    for (const path of paths) {
      let record, source;
      try {
        const text = await snapshot.read(path);
        if (text === null) throw new Error("not held at this commit");
        record = recordFromDocument(readDocument(jobSchema, path, text));
        source = { reachable: true, reason: null };
      } catch (error) {
        record = unreadableRecord(path);
        source = { reachable: false, reason: error.message };
      }
      const jobLive = live.get(record.id) ?? null;
      rows.push({
        record, product: address, state: jobState(record, jobLive), elapsed: elapsedOf(record, jobLive),
        cost: costOf(record, jobLive), source,
      });
    }
  }
  return rows.sort(compareRows);
}

// recordsNewestFirst(snapshot: Snapshot) -> AsyncIterable<JobRecord> — records ordered by the timestamp their paths
// name.  Reading happens in the generator, after ordering, so a caller may stop when it has found the recent record it
// needs without reading older files.
export async function* recordsNewestFirst(snapshot) {
  const paths = snapshot.paths.filter((path) => JOB_PATH.test(path)).sort().reverse();
  for (const path of paths) {
    const text = await snapshot.read(path);
    if (text === null) throw new Error(`job record is not held: ${path}`);
    yield recordFromDocument(readDocument(jobSchema, path, text));
  }
}

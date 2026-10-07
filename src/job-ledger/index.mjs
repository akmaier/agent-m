// MOD-job-ledger — the record, state and cost of every job (docs/architecture/MOD-job-ledger.md): its interface. Of it,
// ITM-252 builds newJobId, startRecord, jobState, listJobs and jobCost, as its file states them: a job's identifier,
// none of those its product holds; the start of its record; its state from its last part and, for a job that has not
// ended, from its runtime's live state; and every job of the products given, newest first, with its cost. appendToRecord,
// takeJob and recordsNewestFirst are not built yet.
//
// Module: MOD-job-ledger
//
// It belongs to Participants and jobs (ARC-046). It runs unchanged in a browser and in Node. Its one read is that of its
// own data file job.schema.md — the job record's schema, in MOD-documents' language —, once, when the module is loaded:
// from the disk in Node, from the module's own address in a browser, as src/approvals/index.mjs reads its schema. A
// schema that cannot be read, or that breaks the language, stops the module's load. listJobs reads docs/jobs/ of the
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

const DESTINATION_LINE = /^-\s*(.+?),\s*at\s*(.+?):\s*(.+)\.$/;

function parseDestinations(text) {
  const out = [];
  for (const raw of (text ?? "").split("\n")) {
    const m = DESTINATION_LINE.exec(raw.trim());
    if (m) out.push({ participant: m[1], place: m[2], parts: m[3].split(",").map((s) => s.trim()) });
  }
  return out;
}

// "## Parameters": the one fenced json block the module file's Data names.
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
const encodeJsonField = (value) => (value === null || value === undefined ? "" : JSON.stringify(value));

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
// Gate and question share one heading ("## Gate reached"; job.schema.md, its own note); pairing a gate with the resume
// that ends its wait is positional, in the order each stands — a job waits at one gate at a time.
function recordFromDocument(doc) {
  const f = doc.fields;
  const destinations = doc.sections.find((s) => s.heading === "## Destinations");
  const parameters = doc.sections.find((s) => s.heading === "## Parameters");
  const taken = chunksOf(doc, "## Taken")[0] ?? null;
  const gateChunks = chunksOf(doc, "## Gate reached");
  const resumedChunks = chunksOf(doc, "## Resumed");
  const end = chunksOf(doc, "## End")[0] ?? null;

  const gates = gateChunks.map((chunk, i) => ({
    at: parseTime(chunk.fields.at),
    gate: chunk.fields.gate ?? null,
    decider: chunk.fields.decider ?? null,
    question: chunk.fields.question ?? null,
    resumedBy: resumedChunks[i] ? resumedChunks[i].fields.gate_record : null,
  }));
  const lastGate = gates[gates.length - 1] ?? null;

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
    question: lastGate && lastGate.resumedBy === null ? lastGate.question : null,
    jobs: chunksOf(doc, "## Job started").map((chunk) => ({
      at: parseTime(chunk.fields.at), job: chunk.fields.job, kind: chunk.fields.kind, worksOn: asList(chunk.fields.works_on),
    })),
    limitsRaised: chunksOf(doc, "## Limits raised").map((chunk) => ({
      at: parseTime(chunk.fields.at), by: chunk.fields.by,
      limits: { jobsAtOnce: chunk.fields.jobs_at_once, cost: chunk.fields.cost ?? null, rounds: chunk.fields.rounds },
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

// listJobs(products: { address: string, snapshot: Snapshot }[], live: Map<string, LiveState>) -> JobRow[] — every job of
// every product given, newest first, waiting at a gate first among those that have not ended. A record that cannot be
// read is listed with what could be read and the reason.
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

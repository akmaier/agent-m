// stored.mjs — the facts of a commit that its files alone give, as a text and back (docs/architecture/MOD-progress-measures.md, Data: `<commit>.facts.json` on the branch
// `overview-cache`; Interfaces: storedFacts, publishOverview). `factsText` makes the text publishOverview adds beside the commit's overview; `storedFacts` reads it back with the
// snapshot's readOn, in one request.
//
// Module: MOD-progress-measures
//
// Where the module file leaves a reading open, this file takes the one it names:
//   - The file is JSON with a line end: `format` (the number 1), `commit`, and the facts `declaration`, `order`, `items`, `sprints`, `assignments`, `gates`, `modules`, `queues`, `requirements`, `tests`, `jobs` and,
//     where one was read, `model`.
//   - A document and a job record stand in it as the file it was read from — { path, text } —, and are read again with the schemas, so that the facts are the same whether they come from the store or from the files.
//     The queues, the requirements, the test declarations and the model stand as data.
//   - A model that could not be read (Facts.model "unknown") is left out; no model that was read as none (null) is left out.
//   - A reader of another format's number, or of a commit other than the snapshot's, gets null.

import { artifactSchemas, readDocument } from "../documents/index.mjs";
import { declarationSchema, gateSchema, roleAssignmentSchema } from "../product-process/index.mjs";
import { listJobs } from "../job-ledger/index.mjs";
import { planSchemas } from "../work-plans/index.mjs";

export const FACTS_BRANCH = "overview-cache";
const FORMAT = 1;

/** The module files of an architecture: the files a Facts does not hold, which the held items are told by (MOD-work-plans). */
export const MODULE_FILE = /^docs\/architecture\/MOD-[^/]+\.md$/;

/** The path of the facts file of a commit on the branch `overview-cache`. */
export const factsPath = (commit) => `${commit}.facts.json`;

// A document as the file it was read from.
const fileOf = async (snapshot, document) => ({ path: document.path, text: (await snapshot.read(document.path)) ?? "" });
const filesOf = (snapshot, documents) => Promise.all(documents.map((document) => fileOf(snapshot, document)));

/**
 * factsText(snapshot, facts) -> Promise<string> — the facts file of the snapshot's commit: the facts the commit's files alone give, from `facts` read with the scope `all`. The texts of the files are those the
 * snapshot read already.
 * @param {object} snapshot the product's snapshot @param {object} facts
 */
export async function factsText(snapshot, facts) {
  const stored = {
    format: FORMAT,
    commit: snapshot.commit,
    declaration: facts.declaration === null ? null : await fileOf(snapshot, facts.declaration),
    order: facts.plan.order === null ? null : await fileOf(snapshot, facts.plan.order),
    items: await filesOf(snapshot, facts.plan.items),
    sprints: await filesOf(snapshot, facts.sprints),
    assignments: await filesOf(snapshot, facts.assignments),
    gates: await filesOf(snapshot, facts.gates),
    modules: await filesOf(snapshot, snapshot.paths.filter((path) => MODULE_FILE.test(path)).sort().map((path) => ({ path }))),
    queues: facts.queues,
    requirements: facts.requirements,
    tests: facts.tests,
    jobs: await Promise.all(facts.jobs.map((row) => fileOf(snapshot, { path: row.record.path }))),
    ...(facts.model === "unknown" ? {} : { model: facts.model }),
  };
  return `${JSON.stringify(stored)}\n`;
}

const isFile = (value) => value !== null && typeof value === "object" && typeof value.path === "string" && typeof value.text === "string";
const isFiles = (value) => Array.isArray(value) && value.every(isFile);

// The stored facts of the snapshot's commit, and a stand-in for the snapshot that holds only the job records, for listJobs; null where there are none (see storedFacts).
async function readStored(snapshot) {
  if (typeof snapshot?.readOn !== "function") return null;
  let text;
  try {
    text = await snapshot.readOn(FACTS_BRANCH, factsPath(snapshot.commit));
  } catch (error) {
    // No stored facts is no failure: a branch or a file that is missing, and a clone that cannot show a file of a branch it does not hold (`Unreachable`, as local-git names it). A host that is really out of reach fails
    // the reads of the files that follow with the same error.
    if (error?.name === "NotFound" || error?.name === "Unreachable") return null;
    throw error;
  }
  if (typeof text !== "string") return null;
  let held;
  try { held = JSON.parse(text); } catch { return null; }
  if (held === null || typeof held !== "object" || held.format !== FORMAT || held.commit !== snapshot.commit) return null;
  const single = (value) => value === null || isFile(value);
  if (!single(held.declaration) || !single(held.order) || !isFiles(held.items) || !isFiles(held.sprints) || !isFiles(held.assignments) || !isFiles(held.gates)
    || !isFiles(held.modules) || !isFiles(held.jobs) || !Array.isArray(held.queues) || !Array.isArray(held.requirements) || !Array.isArray(held.tests)) return null;
  const read = (schema) => (file) => readDocument(schema, file.path, file.text);
  const texts = new Map(held.jobs.map((file) => [file.path, file.text]));
  const jobsSnapshot = { paths: held.jobs.map((file) => file.path), read: async (path) => texts.get(path) ?? null, blob: () => null };
  const jobs = (await listJobs([{ address: "", snapshot: jobsSnapshot }], new Map())).map((row) => row.record);
  const facts = {
    declaration: held.declaration === null ? null : read(declarationSchema)(held.declaration),
    order: held.order === null ? null : read(planSchemas.planOrder)(held.order),
    items: held.items.map(read(artifactSchemas().item)),
    sprints: held.sprints.map(read(planSchemas.sprint)),
    assignments: held.assignments.map(read(roleAssignmentSchema)),
    gates: held.gates.map(read(gateSchema)),
    modules: held.modules.map(read(artifactSchemas().module)),
    queues: held.queues,
    requirements: held.requirements,
    tests: held.tests,
    jobs,
    model: Object.hasOwn(held, "model") ? held.model : undefined,
  };
  // The snapshot Facts holds, for a caller that derives the job rows again (listJobs over it): it answers the read of a job record from the stored text, so that no record file is read again.
  const serving = (own) => ({ ...own, read: async (path) => (texts.has(path) ? texts.get(path) : own.read(path)) });
  return { facts, jobsSnapshot, serving };
}

/**
 * storedFacts(snapshot) -> Promise<{ declaration, order, items, sprints, assignments, gates, modules, queues, requirements, tests, jobs, model } | null> — the facts stored for the snapshot's commit, read with the
 * snapshot's readOn in one request; `model` is undefined where none is stored. null without readOn, or when the branch or the file is missing, carries another format's number, or names another commit.
 * @param {object} snapshot
 */
export async function storedFacts(snapshot) {
  return (await readStored(snapshot))?.facts ?? null;
}

/** The stored facts with the stand-in snapshot of the job records, for productFacts to derive the rows of the jobs with listJobs; null as storedFacts. */
export const storedFactsWithJobs = readStored;

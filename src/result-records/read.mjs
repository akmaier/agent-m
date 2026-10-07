// read.mjs — resultSchema, resultsAt, flakyTests and rateComparison: the schemas of the branch test-results, and what
// its records say about one commit (MOD-result-records, Interfaces). Of the module, this item (ITM-251) builds these
// and Outcome (index.mjs); parseOutcomes, appendResult, testHistory and resultStrategies are not built yet. Its own
// data files, the two schemas below, are read once, when the module is loaded: from the disk in Node, from the
// module's own address in a browser — as MOD-spec-changes' queues.mjs reads its own two.
//
// resultsAt, flakyTests and rateComparison read a commit's run records through the Snapshot they are given
// (MOD-repository-hosts): results.paths to find them, results.read(path) for each one's text — always a
// Promise<string | null> (src/repository-hosts/index.mjs), so all three are async here, built and tested as
// MOD-spec-changes' queues(snapshot) already is for the same reason. docs/architecture/MOD-result-records.md types
// them without Promise<>; the gap is named, not designed around, in the pull request (tests/result-records-
// outcomes.test.mjs's header note), as this sprint's own record already resolved the same gap the same way for
// MOD-job-ledger's listJobs.
//
// Module: MOD-result-records

import { loadSchema, readDocument } from "../documents/index.mjs";

const OWNER = "MOD-result-records";
const RUN_SCHEMA_FILE = new URL("./result-record.schema.md", import.meta.url);
const COUNTER_PROOF_SCHEMA_FILE = new URL("./counter-proof.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming
// the file and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

/**
 * resultSchema: { run: Schema, counterProof: Schema } — the two schemas of the branch test-results, loaded from this
 * module's own result-record.schema.md and counter-proof.schema.md, for MOD-documents and for MOD-release-evidence.
 * @type {{ run: import("../documents/index.mjs").Schema, counterProof: import("../documents/index.mjs").Schema }}
 */
export const resultSchema = {
  run: loadSchema(disk ? disk.readFileSync(RUN_SCHEMA_FILE, "utf8") : await ownFile(RUN_SCHEMA_FILE), OWNER),
  counterProof: loadSchema(
    disk ? disk.readFileSync(COUNTER_PROOF_SCHEMA_FILE, "utf8") : await ownFile(COUNTER_PROOF_SCHEMA_FILE), OWNER),
};

// The form of a model-dependent test's Runs cell, "<k> of <n>".
const RUNS_FORMAT = /^(\d+) of (\d+)$/;

// The run records of one commit on the branch test-results that are not marked uncommitted, each read with
// resultSchema.run: { path, document }.
async function recordsAt(results, commit) {
  const prefix = `runs/${commit}/`;
  const paths = results.paths.filter((path) => path.startsWith(prefix) && path.endsWith(".md"));
  const out = [];
  for (const path of paths) {
    const text = await results.read(path);
    if (text == null) continue;
    const document = readDocument(resultSchema.run, path, text);
    if (document.fields.uncommitted === "true") continue; // shown, never counted for the commit
    out.push({ path, document });
  }
  return out;
}

// The rows of a record's ## Outcomes table, or none for a record that holds none.
function outcomeRows(document) {
  return document.sections.find((section) => section.heading === "## Outcomes")?.rows ?? [];
}

// Every test named in a commit's (not-uncommitted) records, by its id, with one entry per row it appears in:
// { outcome, runs, path }.
async function rowsByTest(results, commit) {
  const byTest = new Map();
  for (const { path, document } of await recordsAt(results, commit)) {
    for (const row of outcomeRows(document)) {
      const id = row.cells.Test;
      if (!id) continue;
      if (!byTest.has(id)) byTest.set(id, []);
      byTest.get(id).push({ outcome: row.cells.Outcome, runs: row.cells.Runs ?? null, path });
    }
  }
  return byTest;
}

// One test's outcome, runs and records, derived from its rows at a commit: a test with no row at all is not run. A
// deterministic test — no row of it names Runs — with both a passing and a failing row is flaky, never passed
// (A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY names a deterministic test). A test with any row naming Runs is
// model-dependent: its outcome is failed if any row failed, else passed if any row passed, else not run, and never
// flaky — its rate moving between records is not the flakiness this requirement names.
function summaryOf(rows) {
  if (!rows?.length) return { outcome: "not run", runs: null, records: [] };
  const records = rows.map((row) => row.path);
  const hasRuns = rows.some((row) => row.runs);
  const passed = rows.some((row) => row.outcome === "passed");
  const failed = rows.some((row) => row.outcome === "failed");
  const runs = rows.slice().reverse().find((row) => row.runs)?.runs ?? null;
  let outcome;
  if (!hasRuns && passed && failed) outcome = "flaky";
  else if (failed) outcome = "failed";
  else if (passed) outcome = "passed";
  else outcome = "not run";
  return { outcome, runs, records };
}

/**
 * resultsAt(results: Snapshot, commit: string, tests: Array<{ id: string, level: string }>) -> Promise<Array<{
 * level: string, passed: number, failed: number, flaky: number, notRun: number, tests: Array<{ id: string, outcome:
 * "passed" | "failed" | "flaky" | "not run", runs: string | null, records: string[] }> }>> — what the records of the
 * branch test-results say about one commit, per level: a level without a record of this commit reads not run, never
 * passed; a record marked uncommitted is left out (MOD-result-records, Interfaces). Async — see this file's header.
 * @param {{ paths: string[], read: (path: string) => Promise<string | null> }} results
 * @param {string} commit
 * @param {Array<{ id: string, level: string }>} tests
 */
export async function resultsAt(results, commit, tests) {
  const byTest = await rowsByTest(results, commit);
  const byLevel = new Map();
  for (const { id, level } of tests) {
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level).push(id);
  }
  const out = [];
  for (const [level, ids] of byLevel) {
    let passed = 0, failed = 0, flaky = 0, notRun = 0;
    const levelTests = ids.map((id) => {
      const summary = summaryOf(byTest.get(id));
      if (summary.outcome === "passed") passed += 1;
      else if (summary.outcome === "failed") failed += 1;
      else if (summary.outcome === "flaky") flaky += 1;
      else notRun += 1;
      return { id, ...summary };
    });
    out.push({ level, passed, failed, flaky, notRun, tests: levelTests });
  }
  return out;
}

/**
 * flakyTests(results: Snapshot, commit: string) -> Promise<Array<{ test: string, passedIn: string[], failedIn:
 * string[] }>> — every deterministic test with both a passing and a failing outcome recorded on the same commit,
 * with both records (MOD-result-records, Interfaces). Async — see this file's header.
 * @param {{ paths: string[], read: (path: string) => Promise<string | null> }} results
 * @param {string} commit
 */
export async function flakyTests(results, commit) {
  const byTest = await rowsByTest(results, commit);
  const out = [];
  for (const [id, rows] of byTest) {
    const deterministic = rows.filter((row) => !row.runs);
    const passedIn = deterministic.filter((row) => row.outcome === "passed").map((row) => row.path);
    const failedIn = deterministic.filter((row) => row.outcome === "failed").map((row) => row.path);
    if (passedIn.length && failedIn.length) out.push({ test: id, passedIn, failedIn });
  }
  return out;
}

// The rate of each model-dependent test recorded at a commit, as its Runs cell's text — the last one found, where a
// test has more than one record.
async function ratesAt(results, commit) {
  const byTest = await rowsByTest(results, commit);
  const rates = new Map();
  for (const [id, rows] of byTest) {
    const runs = rows.slice().reverse().find((row) => row.runs)?.runs;
    if (runs) rates.set(id, runs);
  }
  return rates;
}

// The fraction a Runs cell's "<k> of <n>" text names, or null when it does not fit that form.
function fractionOf(runsText) {
  const match = RUNS_FORMAT.exec(runsText ?? "");
  return match ? Number(match[1]) / Number(match[2]) : null;
}

/**
 * rateComparison(results: Snapshot, commit: string, lastRelease: string | null) -> Promise<Array<{ test: string,
 * now: string, then: string | null, worse: boolean }>> — each model-dependent test's rate on a commit beside its rate
 * on the last release's commit; worse when the rate is lower; no comparison without a last release
 * (MOD-result-records, Interfaces). Async — see this file's header.
 * @param {{ paths: string[], read: (path: string) => Promise<string | null> }} results
 * @param {string} commit
 * @param {string | null} lastRelease
 */
export async function rateComparison(results, commit, lastRelease) {
  if (lastRelease == null) return [];
  const [now, then] = await Promise.all([ratesAt(results, commit), ratesAt(results, lastRelease)]);
  const out = [];
  for (const [test, nowRate] of now) {
    const thenRate = then.get(test) ?? null;
    const worse = thenRate != null && fractionOf(nowRate) < fractionOf(thenRate);
    out.push({ test, now: nowRate, then: thenRate, worse });
  }
  return out;
}

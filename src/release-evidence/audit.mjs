// audit.mjs — the audit rows of a release (MOD-release-evidence, Parts: "audit.mjs — the audit rows, their summary and
// the export"). Of it, ITM-756 builds auditRows, as the module file states it (UC-030 steps 2 and 3; alternative flows 1a,
// 2a, 2b, 2c). auditDocument, the export, is not part of it.
//
// Module: MOD-release-evidence
//
// Readings where the accepted text is silent (each is a gap noted in ITM-756's pull request):
// - the product's links are read from `at`, `docs/sources.md`; the instance's register is the `register` the caller passes;
//   a source's hashes are the version's hash, then the SHA-256 of each of its files;
// - the job records are read from `at`, `docs/jobs/`; the implementer of a release test is a participant of an `implement`
//   job that works on an item or a use case naming the requirement, its writer a participant of a `write-tests` job whose
//   results name the test's file;
// - a test's counter-proof is the path of its record `docs/tests/counter-proofs/TST-<nnn>.md` in `at` when that records the
//   test failing, else null; a test's outcome is its rate where the records give one, else its plain outcome;
// - the report is `docs/tests/releases/<tag>.md` on `head`, the default branch, which holds it and its approval record because
//   acceptAndRelease commits them after the tagged commit; it is accepted when MOD-approvals' statusOf says so of it in `head`;
//   the limitations are those of the record `docs/approvals/release-<tag>-<blob12>.md`, read through approvalSchema;
// - a release before Agent M's records — no result record of its commit and no release test report in its tree — has every
//   outcome "cannot be derived", and summary.limitations names the parts: the interface has no other place for the statement;
// - passing: a requirement with tests, all passed, none at a worse rate; no test: none at all; not passed: a test failed or not
//   run; flaky and worse: any test flaky or at a worse rate. A requirement may be counted in several.
//
// resultsAt, flakyTests, rateComparison and listJobs are async, typed without Promise<> by their module files (see report.mjs).

import { readDocument } from "../documents/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";
import { testDeclarations } from "../test-document/index.mjs";
import { traceGraph, tracesTo } from "../trace-graph/index.mjs";
import { resultsAt, flakyTests, rateComparison, resultSchema } from "../result-records/index.mjs";
import { approvalSchema, statusOf } from "../approvals/index.mjs";
import { listJobs } from "../job-ledger/index.mjs";
import { sourceSchemas, linkedVersion } from "../source-register/index.mjs";
import { lastReleaseCommit } from "./report.mjs";

const LINKS_PATH = "docs/sources.md";
const UNDERIVABLE = "cannot be derived";
const { links: linksSchema } = sourceSchemas();

async function linksOf(at) {
  const linksText = await at.read(LINKS_PATH);
  return linksText === null ? null : readDocument(linksSchema, LINKS_PATH, linksText);
}

function sourcesOf(requirement, links, register) {
  const found = new Map();
  if (!links) return [];
  for (const item of requirement.sources) {
    const linked = linkedVersion(links, register, item);
    if (!linked || found.has(linked.source.id)) continue;
    found.set(linked.source.id, { id: linked.source.id, authority: linked.source.fields.authority, version: linked.version.version,
      hashes: [linked.version.hash, ...linked.version.files.map((file) => file.sha256)] });
  }
  return [...found.values()];
}

// The report's acceptance, on the default branch: statusOf of the report in `head`; its limitations are those of the record
// named after the report's current blob.
async function acceptance(head, reportPath, tag) {
  const blob = head.blob(reportPath);
  if (blob === null) return { reported: false, accepted: false, limitations: [] };
  if (statusOf(reportPath, blob, head) !== "accepted") return { reported: true, accepted: false, limitations: [] };
  const path = `docs/approvals/release-${tag}-${blob.slice(0, 12)}.md`;
  const text = await head.read(path);
  const limitations = text === null ? [] : [].concat(readDocument(approvalSchema, path, text).fields.limitation ?? []);
  return { reported: true, accepted: true, limitations };
}

async function counterProofOf(at, id) {
  const path = `docs/tests/counter-proofs/${id}.md`;
  const text = await at.read(path);
  if (text === null) return null;
  return readDocument(resultSchema.counterProof, path, text).fields.outcome === "failed" ? path : null;
}

/**
 * auditRows(at: Snapshot, results: Snapshot, head: Snapshot, release: { tag: string, commit: string }, gates: Array<{
 * requirement: string, gate: string, record: string }>, instanceSpec: string, register: Document[]) -> Promise<{ summary, rows }> (MOD-release-evidence, Interfaces): one
 * row per requirement valid at the release — each requirement of the product's SPEC, and each requirement of the instance's SPEC
 * whose gate `gates` holds — with its sources, its tests by level and its gate records, and the summary of UC-030 step 3.
 */
export async function auditRows(at, results, head, release, gates, instanceSpec, register) {
  const product = [...parseSpec((await at.read("SPEC.md")) ?? "").requirements.values()].map((req) => ({ req, constrains: "product" }));
  const gated = new Set(gates.map((gate) => gate.requirement));
  const process = [...parseSpec(instanceSpec).requirements.values()].filter((req) => gated.has(req.name))
    .map((req) => ({ req, constrains: "process" }));
  const graph = await traceGraph(at, { commit: release.commit });
  const traced = [...product, ...process].map((each) => ({ ...each, traces: tracesTo(graph, each.req.name) }));

  // A test's level is its declaration's, read from the file the graph says it stands in.
  const tests = new Map();
  for (const { traces } of traced) {
    for (const id of traces.tests) {
      const path = graph.nodes.get(id).path;
      const declared = testDeclarations(path, (await at.read(path)) ?? "").find((each) => each.id === id);
      tests.set(id, { id, level: declared?.level ?? "unit", path });
    }
  }
  const levels = await resultsAt(results, release.commit, [...tests.values()].map(({ id, level }) => ({ id, level })));
  const entries = new Map(levels.flatMap((level) => level.tests.map((one) => [one.id, one])));
  const flaky = new Set((await flakyTests(results, release.commit)).map((row) => row.test));
  const version = release.tag.replace(/^v/, "");
  const worse = new Set((await rateComparison(results, release.commit, await lastReleaseCommit(at, version)))
    .filter((row) => row.worse).map((row) => row.test));

  const reportPath = `docs/tests/releases/${release.tag}.md`;
  const report = await acceptance(head, reportPath, release.tag);
  const predates = !report.reported && ![...entries.values()].some((one) => one.records.length > 0);

  const jobs = await listJobs([{ address: release.tag, snapshot: at }], new Map());
  const jobsOf = (kind) => jobs.map((row) => row.record).filter((record) => record.kind === kind);
  const links = await linksOf(at);

  const summary = { passing: 0, noTest: 0, notPassed: 0, flaky: 0, worse: 0, byImplementer: 0, accepted: report.accepted,
    limitations: predates ? [`${UNDERIVABLE}: outcomes (no result record of ${release.commit})`,
      `${UNDERIVABLE}: acceptance (no release test report ${reportPath})`] : report.limitations };
  const byImplementer = new Set();
  const rows = [];
  for (const { req, constrains, traces } of traced) {
    const rowTests = [];
    for (const id of traces.tests) {
      const entry = entries.get(id);
      rowTests.push({ id, level: tests.get(id).level, outcome: predates ? UNDERIVABLE : (entry.runs ?? entry.outcome),
        counterProof: await counterProofOf(at, id) });
    }
    const outcomes = traces.tests.map((id) => entries.get(id).outcome);
    const isWorse = traces.tests.some((id) => worse.has(id));
    if (!traces.tests.length) summary.noTest += 1;
    if (!predates && outcomes.some((outcome) => outcome === "failed" || outcome === "not run")) summary.notPassed += 1;
    if (!predates && traces.tests.some((id) => flaky.has(id))) summary.flaky += 1;
    if (!predates && isWorse) summary.worse += 1;
    if (!predates && outcomes.length && outcomes.every((outcome) => outcome === "passed") && !isWorse) summary.passing += 1;

    const behaviour = new Set([...traces.items, ...traces.useCases]);
    const implementers = new Set(jobsOf("implement").filter((record) => record.worksOn.some((name) => behaviour.has(name)))
      .map((record) => record.participant).filter(Boolean));
    for (const id of traces.tests.filter((each) => tests.get(each).level === "release")) {
      const writers = jobsOf("write-tests").filter((record) => (record.end?.results ?? []).includes(tests.get(id).path)).map((record) => record.participant);
      if (writers.some((writer) => implementers.has(writer))) byImplementer.add(id);
    }
    rows.push({ requirement: req.name, constrains, sources: sourcesOf(req, links, register), tests: rowTests,
      gates: gates.filter((gate) => gate.requirement === req.name).map((gate) => gate.record) });
  }
  summary.byImplementer = byImplementer.size;
  return { summary, rows };
}

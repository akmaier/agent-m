// audit.mjs — the audit rows of a release (MOD-release-evidence, Parts: "audit.mjs — the audit rows, their summary and
// the export"). Of it, ITM-756 builds auditRows, as the module file states it (UC-030 steps 2 and 3; alternative flows 1a,
// 2a, 2b, 2c); ITM-757 adds its `evidence` and its `accepted` argument, and builds auditDocument, the export (UC-030 step 5).
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
// - the evidence is the report on `head` with its blob, every record `docs/approvals/release-<tag>-*.md` on `head` that names
//   the report's current blob, with its own blob, and the acceptance — `accepted`, the person and date the caller read for
//   the commit that added the record, with the blob the record names; what is missing is named in summary.limitations, one
//   line each, beginning "missing:" (a release before Agent M's records says "cannot be derived" instead);
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

// The report's acceptance, on the default branch: statusOf of the report in `head`; every record that names the report, and
// among them `current`, those that name its current blob, whose first gives the limitations.
async function acceptance(head, reportPath, tag) {
  const blob = head.blob(reportPath);
  if (blob === null) return { reported: false, blob, accepted: false, limitations: [], records: [], current: [] };
  const records = [];
  for (const path of head.paths.filter((each) => each.startsWith(`docs/approvals/release-${tag}-`) && each.endsWith(".md")).sort()) {
    const { fields } = readDocument(approvalSchema, path, (await head.read(path)) ?? "");
    if (fields.file === reportPath) records.push({ path, blob: head.blob(path), fields });
  }
  const current = records.filter((record) => record.fields.blob === blob);
  if (statusOf(reportPath, blob, head) !== "accepted") return { reported: true, blob, accepted: false, limitations: [], records, current };
  return { reported: true, blob, accepted: true, limitations: [].concat(current[0]?.fields.limitation ?? []), records, current };
}

async function counterProofOf(at, id) {
  const path = `docs/tests/counter-proofs/${id}.md`;
  const text = await at.read(path);
  if (text === null) return null;
  return readDocument(resultSchema.counterProof, path, text).fields.outcome === "failed" ? path : null;
}

/**
 * auditRows(at: Snapshot, results: Snapshot, head: Snapshot, release: { tag: string, commit: string }, gates: Array<{
 * requirement: string, gate: string, record: string }>, instanceSpec: string, register: Document[], accepted: { person: string,
 * date: string } | null) -> Promise<{ summary, rows, evidence }> (MOD-release-evidence, Interfaces): one
 * row per requirement valid at the release — each requirement of the product's SPEC, and each requirement of the instance's SPEC
 * whose gate `gates` holds — with its sources, its tests by level and its gate records, the summary of UC-030 step 3, and the
 * evidence: the report and the approval records that name it, with their blobs, and the acceptance.
 */
export async function auditRows(at, results, head, release, gates, instanceSpec, register, accepted = null) {
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

  const record = report.current[0] ?? null;
  const evidence = { report: report.reported ? { path: reportPath, blob: report.blob } : null,
    records: report.records.map(({ path, blob }) => ({ path, blob })),
    acceptance: record && accepted ? { person: accepted.person, date: accepted.date, blob: record.fields.blob } : null };
  const missing = [];
  if (!report.reported) missing.push(`missing: release test report ${reportPath} on the default branch`);
  else if (!record) missing.push(`missing: approval record naming blob ${report.blob} of ${reportPath}`);
  else if (!accepted) missing.push(`missing: who accepted the report and when (the commit that added ${record.path})`);
  const summary = { passing: 0, noTest: 0, notPassed: 0, flaky: 0, worse: 0, byImplementer: 0, accepted: report.accepted,
    limitations: predates ? [`${UNDERIVABLE}: outcomes (no result record of ${release.commit})`,
      `${UNDERIVABLE}: acceptance (no release test report ${reportPath})`] : [...report.limitations, ...missing] };
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
  return { summary, rows, evidence };
}

const code = (text) => `\`${text}\``;

// One source of a row: its identifier, authority and version, then the version's hash and the hash of each of its files.
const sourceLine = (source) => `- Source ${code(source.id)} (${source.authority}), version ${code(source.version)}, hashes: ${source.hashes.map(code).join(", ")}`;

const testLine = (test) => `- Test ${code(test.id)} (${test.level}): ${test.outcome}; ${test.counterProof ? `counter-proof ${code(test.counterProof)}` : "no counter-proof"}`;

function rowSection(row, accepted) {
  return [`### ${row.requirement}`, "",
    `- Constrains: ${row.constrains}`,
    ...(accepted ? [] : ["- Evidence not accepted: no approval record names the release test report"]),
    ...(row.sources.length ? row.sources.map(sourceLine) : ["- Sources: none"]),
    ...(row.tests.length ? row.tests.map(testLine) : ["- Tests: no test"]),
    ...row.gates.map((record) => `- Gate record: ${code(record)}`), ""];
}

function evidenceLines({ report, records, acceptance }) {
  return [
    report ? `- Release test report: ${code(report.path)}, blob ${code(report.blob)}` : "- No release test report on the default branch.",
    ...(records.length ? records.map((record) => `- Approval record: ${code(record.path)}, blob ${code(record.blob)}`) : ["- Approval records: none."]),
    acceptance ? `- Accepted text: blob ${code(acceptance.blob)}, accepted by ${acceptance.person} on ${acceptance.date}`
      : report ? "- Not accepted: no approval record names the report's current text, or who accepted it and when is not given."
        : "- Acceptance: none, there is no report.",
  ];
}

/**
 * auditDocument(audit: { summary, rows, evidence }, release: { tag: string, commit: string }) -> string (MOD-release-evidence,
 * Interfaces and Data, "The audit document"): the self-contained Markdown document of the audit — the tag and its commit SHA,
 * the summary, the evidence (the report, the approval records and the acceptance, with their blob SHAs), and one section per
 * row with its sources, their versions and hashes, its tests with outcome and counter-proof, and its gate records. Every
 * statement names a path, an identifier or a hash of the repository, so that it is checked there, without Agent M.
 */
export function auditDocument(audit, release) {
  const { summary, rows, evidence } = audit;
  return [
    "---", `tag: ${release.tag}`, `commit: ${release.commit}`, "---",
    `# Audit of ${release.tag}`, "",
    `Release tag ${code(release.tag)}, commit ${code(release.commit)}. Each statement below names the path, the identifier or the hash by which it is checked in the repository.`, "",
    "## Summary", "",
    `- Requirements with passing evidence: ${summary.passing}`,
    `- Requirements without a test: ${summary.noTest}`,
    `- Requirements with a test that did not pass: ${summary.notPassed}`,
    `- Requirements with a flaky test: ${summary.flaky}`,
    `- Requirements with a rate worse than the previous release: ${summary.worse}`,
    `- Release tests written by the implementer: ${summary.byImplementer}`,
    `- Release test report accepted: ${summary.accepted ? "yes" : "no"}`,
    ...(summary.limitations.length ? ["", "Limitations:", "", ...summary.limitations.map((line) => `- ${line}`)] : ["", "Limitations: none."]),
    "", "## Evidence", "", ...evidenceLines(evidence), "",
    "## Requirements", "", ...rows.flatMap((row) => rowSection(row, summary.accepted)),
  ].join("\n");
}

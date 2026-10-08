// report.mjs — the release test report, and releasing on its acceptance (MOD-release-evidence, Parts: "report.mjs —
// the release test report, whether one waits for acceptance, and releasing on its acceptance"). Of it, ITM-254 builds
// releaseReport and acceptAndRelease, as the module file states them. reportsAwaitingAcceptance is ITM-239's and not
// built here.
//
// Module: MOD-release-evidence
//
// Rework (po-opus's rejection of #200, gate docs/gates/20261007-2016-development-release-testing-45b3.md): a release
// candidate's own commit `at` holds every earlier release's report under docs/tests/releases/, each naming its own
// tested `commit` in its front matter — so the last release's commit for MOD-result-records' rateComparison is found
// there, not left null (lastReleaseCommit, below); and acceptAndRelease recomputes the report itself, from the host
// alone, and commits its text together with the approval record and the changelog entry, in the one commit "commits
// the report, its approval record ... and the changelog entry ... together" names — not treating the report as
// already committed. report.blob is then what it was shown as: the blob of the text this function itself
// recomputes, checked against it (MOD-text-tools' blobSha) before anything is written.
//
// Gap: releaseReport's signature carries no "today" for the report's `date` front matter (unlike acceptAndRelease,
// which is given one); the call below uses the real clock. No item needs the signature changed now.
//
// resultsAt, flakyTests, rateComparison and listJobs are async, typed without Promise<> by MOD-result-records.md and
// MOD-job-ledger.md for the same reason (docs/backlog/sprints/12.md, "notes of earlier gates"; src/result-records/
// read.mjs's and src/job-ledger/index.mjs's own header notes) — awaited at every call below.

import { loadSchema, readDocument, writeDocument } from "../documents/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";
import { testDeclarations } from "../test-document/index.mjs";
import { traceGraph, tracesTo } from "../trace-graph/index.mjs";
import { resultsAt, rateComparison } from "../result-records/index.mjs";
import { approvalSchema } from "../approvals/index.mjs";
import { listJobs, recordsNewestFirst } from "../job-ledger/index.mjs";
import { blobSha } from "../text-tools/index.mjs";
import { ReleaseEvidenceError } from "./errors.mjs";

const OWNER = "MOD-release-evidence";

// The release candidate's report, docs/tests/releases/v<version>.md, in MOD-documents' schema language (private: not
// part of this module's `provides`): version, candidate (the tag v<version>-rc.<N>), commit (the tested commit) and
// date as front matter; "## Limitations" free text, first — every failing test and every rate worse than the last
// release's, empty when the run is green —; "## Levels" and "## Tests" and "## Requirements" each a table; "##
// Changelog entry" free text, the entry as it will stand in CHANGELOG.md. Embedded here, not read from a data file at
// load time (unlike scheduleSchema, approvalSchema, …): this module's own file names no committed data file for it,
// and a browser's `fetch` of one is a request channel this repository's tests check by an allowlist (tests/
// test_no_backend.py, PERMITTED_CHANNELS) that no item of this sprint adds this module to.
const CANDIDATE_DOCUMENT_SCHEMA_TEXT = `
\`\`\`json
{
  "schema": "release-candidate-document",
  "shape": "document",
  "rule": "A RELEASE IS TAGGED AND LOGGED",
  "path": "docs/tests/releases/v{any}.md",
  "frontMatter": {
    "version": { "type": "text", "required": true },
    "candidate": { "type": "text", "required": true },
    "commit": { "type": "sha", "digits": 40, "required": true },
    "date": { "type": "date", "required": true }
  },
  "sections": [
    { "heading": "## Limitations", "required": true },
    { "heading": "## Levels", "required": true, "table": {
      "columns": [
        { "name": "Level", "value": { "type": "text", "required": true } },
        { "name": "Passed", "value": { "type": "number", "required": true } },
        { "name": "Failed", "value": { "type": "number", "required": true } },
        { "name": "Flaky", "value": { "type": "number", "required": true } },
        { "name": "Not run", "value": { "type": "number", "required": true } }
      ]
    } },
    { "heading": "## Tests", "required": true, "table": {
      "columns": [
        { "name": "Test", "value": { "type": "text", "required": true } },
        { "name": "Level", "value": { "type": "text", "required": true } },
        { "name": "Outcome", "value": { "type": "text", "required": true } },
        { "name": "Guards", "value": { "type": "list", "item": { "type": "text" }, "required": false } }
      ]
    } },
    { "heading": "## Requirements", "required": true, "table": {
      "columns": [
        { "name": "Requirement", "value": { "type": "text", "required": true } },
        { "name": "Level", "value": { "type": "text", "required": false } },
        { "name": "Tests", "value": { "type": "list", "item": { "type": "text" }, "required": false } },
        { "name": "Outcome", "value": { "type": "text", "required": true } }
      ]
    } },
    { "heading": "## Changelog entry", "required": true }
  ],
  "otherSections": "forbidden",
  "noHistory": true
}
\`\`\`
`;
const candidateDocumentSchema = loadSchema(CANDIDATE_DOCUMENT_SCHEMA_TEXT, OWNER);

// A test file, by MOD-trace-graph's own selection (src/trace-graph/build.mjs): under a folder named test, tests or
// __tests__, or named as tests are in their language. Duplicated here, minimally, since build.mjs is private to
// MOD-trace-graph and only traceGraph and tracesTo are its interface.
const TEST_FOLDERS = new Set(["test", "tests", "__tests__"]);
const TEST_NAME = /^test_[^/]+$|_test\.[A-Za-z0-9]+$|\.(?:test|spec)\.[A-Za-z0-9]+$/;
function isTestPath(path) {
  const parts = String(path).split("/");
  return parts.slice(0, -1).some((part) => TEST_FOLDERS.has(part)) || TEST_NAME.test(parts[parts.length - 1]);
}

// Every test declaration of `at`, by its identifier (the last one read wins, as a later item's graph would also see).
async function collectDeclarations(at) {
  const byId = new Map();
  for (const path of at.paths) {
    if (!isTestPath(path)) continue;
    const text = await at.read(path);
    if (text === null) continue;
    for (const d of testDeclarations(path, text)) byId.set(d.id, d);
  }
  return byId;
}

// One test's entry from resultsAt's per-level lists, by its identifier.
function flattenTests(levels) {
  const byId = new Map();
  for (const level of levels) for (const t of level.tests) byId.set(t.id, t);
  return byId;
}

// The "## Tests" column Outcome: a model-dependent test's rate where resultsAt gave one, else its plain outcome; "not
// run" for a test resultsAt never mentions (no record at all, at any level this report's tests span).
function outcomeCell(entry) {
  if (!entry) return "not run";
  return entry.runs ?? entry.outcome;
}

function limitationsText(ids, declarations) {
  if (!ids.length) return "\n";
  const lines = ids.map((id) => `- ${id}: ${(declarations.get(id)?.guards ?? []).join(", ")}`);
  return `\n${lines.join("\n")}\n\n`;
}

// A release report's path and its version, docs/tests/releases/v<version>.md.
const RELEASE_REPORT_PATH = /^docs\/tests\/releases\/v(\d{4}\.\d+\.\d+)\.md$/;

// Whether version `a` is later than `b`, both YYYY.MINOR.PATCH.
function laterVersion(a, b) {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i += 1) if (pa[i] !== pb[i]) return pa[i] > pb[i];
  return false;
}

// The commit of the last release before `currentVersion`, read from the release reports `at` already holds under
// docs/tests/releases/ — each one a past release's own report, naming its tested commit in its front matter — or
// null where none stands yet. `at` is the release candidate's own commit, so every release before it is already in
// its tree.
async function lastReleaseCommit(at, currentVersion) {
  let best = null;
  for (const path of at.paths) {
    const m = RELEASE_REPORT_PATH.exec(path);
    if (!m || m[1] === currentVersion) continue;
    if (!best || laterVersion(m[1], best.version)) best = { version: m[1], path };
  }
  if (!best) return null;
  const text = await at.read(best.path);
  if (text === null) return null;
  return readDocument(candidateDocumentSchema, best.path, text).fields.commit ?? null;
}

async function requirementsRows(at, candidateCommit, declarations, testEntries) {
  const specText = await at.read("SPEC.md");
  const spec = parseSpec(specText ?? "");
  const graph = await traceGraph(at, { commit: candidateCommit });
  const rows = [];
  for (const name of spec.requirements.keys()) {
    const traces = tracesTo(graph, name);
    if (!traces.tests.length) {
      rows.push({ Requirement: name, Level: "", Tests: [], Outcome: "not run" });
      continue;
    }
    const byLevel = new Map();
    for (const id of traces.tests) {
      const level = declarations.get(id)?.level ?? "unit";
      if (!byLevel.has(level)) byLevel.set(level, []);
      byLevel.get(level).push(id);
    }
    for (const [level, ids] of [...byLevel.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
      const outcomes = ids.map((id) => testEntries.get(id)?.outcome ?? "not run");
      const outcome = outcomes.every((o) => o === "not run") ? "not run"
        : outcomes.every((o) => o === "passed") ? "passed" : "failed";
      rows.push({ Requirement: name, Level: level, Tests: ids.slice().sort(), Outcome: outcome });
    }
  }
  return rows;
}

/**
 * releaseReport(at: Snapshot, results: Snapshot, candidate: { version: string, tag: string, commit: string, changelog:
 * string }) -> Promise<{ text: string, complete: boolean, failing: string[], worse: string[] }> (MOD-release-evidence,
 * Interfaces): the release test report of a release candidate's complete run so far — its parts as this module's file
 * states them, `## Limitations` first —; `complete` false while any test has not run on the candidate's commit.
 */
export async function releaseReport(at, results, candidate) {
  const declarations = await collectDeclarations(at);
  const tests = [...declarations.values()].map((d) => ({ id: d.id, level: d.level ?? "unit" }));
  const levels = await resultsAt(results, candidate.commit, tests);
  const lastRelease = await lastReleaseCommit(at, candidate.version);
  const worseRows = await rateComparison(results, candidate.commit, lastRelease);
  const testEntries = flattenTests(levels);

  let complete = true;
  const failing = [];
  for (const level of levels) {
    for (const t of level.tests) {
      if (t.outcome === "not run") complete = false;
      else if (t.outcome === "failed" || t.outcome === "flaky") failing.push(t.id);
    }
  }
  failing.sort();
  const worse = worseRows.filter((r) => r.worse).map((r) => r.test).sort();

  const testsRows = [...declarations.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).map((d) => ({
    Test: d.id, Level: d.level ?? "unit", Outcome: outcomeCell(testEntries.get(d.id)), Guards: d.guards ?? [],
  }));
  const levelsRows = levels.map((l) => ({ Level: l.level, Passed: l.passed, Failed: l.failed, Flaky: l.flaky, "Not run": l.notRun }));
  const requirements = await requirementsRows(at, candidate.commit, declarations, testEntries);
  const limitationIds = [...new Set([...failing, ...worse])].sort();

  const document = {
    kind: "release-candidate-document",
    path: `docs/tests/releases/v${candidate.version}.md`,
    id: null,
    title: null,
    fields: { version: candidate.version, candidate: candidate.tag, commit: candidate.commit,
      date: new Date().toISOString().slice(0, 10) },
    sections: [
      { heading: "## Limitations", text: limitationsText(limitationIds, declarations) },
      { heading: "## Levels", text: "\n", rows: levelsRows.map((cells) => ({ cells })) },
      { heading: "## Tests", text: "\n", rows: testsRows.map((cells) => ({ cells })) },
      { heading: "## Requirements", text: "\n", rows: requirements.map((cells) => ({ cells })) },
      { heading: "## Changelog entry", text: `\n${candidate.changelog}\n\n` },
    ],
    appended: [],
    body: "",
  };
  return { text: writeDocument(candidateDocumentSchema, document), complete, failing, worse };
}

const CANDIDATE_TAG = /^v(\d{4}\.\d+\.\d+)-rc\.(\d+)$/;

function newestPendingCandidate(tags, snapshot) {
  const releases = new Set(tags.map((tag) => tag.name));
  const reported = new Set(snapshot.paths
    .map((path) => /^docs\/tests\/releases\/v(\d{4}\.\d+\.\d+)\.md$/.exec(path)?.[1])
    .filter(Boolean));
  return tags.map(({ name }) => {
    const match = CANDIDATE_TAG.exec(name);
    return match ? { tag: name, version: match[1], number: Number(match[2]) } : null;
  }).filter((candidate) => candidate && !releases.has(`v${candidate.version}`) && !reported.has(candidate.version))
    .sort((a, b) => {
      const av = a.version.split(".").map(Number), bv = b.version.split(".").map(Number);
      return av[0] - bv[0] || av[1] - bv[1] || av[2] - bv[2] || a.number - b.number;
    }).at(-1) ?? null;
}

// reportsAwaitingAcceptance(host, snapshot) -> the completed newest candidate's run record where its report has not
// yet been written.  Job iteration is deliberately lazy: after any candidate run, an earlier record cannot establish a
// pending newer candidate.
export async function reportsAwaitingAcceptance(host, snapshot) {
  const candidate = newestPendingCandidate(await host.listTags("v*"), snapshot);
  if (!candidate) return null;
  for await (const record of recordsNewestFirst(snapshot)) {
    if (record.kind !== "run-tests" || !record.params?.candidate?.tag) continue;
    if (record.params.candidate.tag !== candidate.tag) return null;
    if (record.end?.state !== "done") return null;
    return { version: candidate.version, candidate: candidate.tag, record: record.path, blob: snapshot.blob(record.path) };
  }
  return null;
}

// ---------------------------------------------------------------- acceptAndRelease

// The changelog's text with a new entry added right after its title line (CHANGELOG.md, MOD-release-evidence.md,
// Data: a heading "## v<version> — <date>", the entry's text, and, with limitations, "Known limitations:").
function withChangelogEntry(current, version, today, entryText, limitations) {
  const lines = [`## v${version} — ${today}`, "", entryText.trim(), ""];
  if (Object.keys(limitations).length) {
    lines.push("Known limitations:", ...Object.entries(limitations).map(([id, reason]) => `- ${id}: ${reason}`), "");
  }
  const body = (current ?? "# Changelog\n").split("\n");
  const insertAt = body[1] === "" ? 2 : 1;
  body.splice(insertAt, 0, ...lines);
  return body.join("\n");
}

const CANDIDATE_TAG_ANY_VERSION = /^v(.+)-rc\.(\d+)$/;

// The newest release candidate tag of `version` — the one whose run just ended, the same "next free N" an earlier
// one would have stood at (candidate.mjs's nextCandidateNumber) — or null where none is tagged.
function newestCandidateTag(tags, version) {
  let best = null, highest = -1;
  for (const t of tags) {
    const m = CANDIDATE_TAG_ANY_VERSION.exec(t.name);
    if (m && m[1] === version && Number(m[2]) > highest) { highest = Number(m[2]); best = t; }
  }
  return best;
}

/**
 * acceptAndRelease(host: Host, report: { path: string, blob: string }, decision: { limitations: Record<string, string>
 * }, person: string, today: string) -> Promise<{ commit: string, tag: string }> (MOD-release-evidence, Interfaces): on
 * the person's one click, recomputes the release test report (releaseReport, above) from the host alone — the
 * candidate's own commit (its newest tag v<version>-rc.<N>), the branch test-results, and the changelog entry the
 * run-tests job it queued carries (startReleaseCandidate) — checks its blob against the one `report` names it was
 * shown as (MOD-text-tools' blobSha), then commits the report's text, its approval record (naming its blob and every
 * limitation) and the changelog entry together, on the head read just before the write (so the release still goes
 * through when the default branch moved on, 4b); then sets the tag v<version> on the candidate's own commit — never a
 * later one. Errors: Incomplete (the run has not finished, or no candidate of this version is tagged, or no run-tests
 * job for it is recorded), LimitationMissing (naming every failing test and worse rate without a reason), TagExists
 * (an existing tag is never moved, from the host's createTag), Moved (the report changed since it was shown).
 */
export async function acceptAndRelease(host, report, decision, person, today) {
  const versionMatch = RELEASE_REPORT_PATH.exec(report.path);
  if (!versionMatch) throw new TypeError(`acceptAndRelease: not a release report's path: ${report.path}`);
  const version = versionMatch[1];

  const info = await host.repositoryInfo();
  const branchSnapshot = await host.readSnapshot(info.defaultBranch);
  const candidateTag = newestCandidateTag(await host.listTags(`v${version}-rc.*`), version);
  if (!candidateTag) throw new ReleaseEvidenceError("Incomplete", {}, `No release candidate of v${version} is tagged yet.`);

  const at = await host.readSnapshot(candidateTag.name);
  const results = await host.readSnapshot("test-results");
  const jobs = await listJobs([{ address: branchSnapshot.repository.path, snapshot: branchSnapshot }], new Map());
  const job = jobs.find((row) => row.record.kind === "run-tests" && row.record.params?.candidate?.tag === candidateTag.name);
  if (!job) throw new ReleaseEvidenceError("Incomplete", {}, `No run-tests job queued for ${candidateTag.name} is recorded.`);

  const candidate = { version, tag: candidateTag.name, commit: at.commit, changelog: job.record.params.changelog };
  const { text, complete, failing, worse } = await releaseReport(at, results, candidate);
  const blob = await blobSha(text);
  if (blob !== report.blob) {
    throw new ReleaseEvidenceError("Moved", { path: report.path }, "The release test report has changed since it was shown.");
  }
  if (!complete) throw new ReleaseEvidenceError("Incomplete", {}, "The release candidate's run has not finished at every level yet.");

  const ids = [...new Set([...failing, ...worse])].sort();
  const limitations = decision?.limitations ?? {};
  const missing = ids.filter((id) => !String(limitations[id] ?? "").trim());
  if (missing.length) {
    throw new ReleaseEvidenceError("LimitationMissing", { tests: missing },
      `Every failing test and worse rate needs its reason recorded before the release: ${missing.join(", ")}.`);
  }

  const tag = `v${version}`;
  // Checked before the commit, so a release already tagged leaves no dangling commit of the report, the approval and
  // the changelog entry (4a: an existing tag is never moved); the rare race of two concurrent clicks is still caught
  // by the host's own createTag below, unchanged.
  const existingTag = (await host.listTags(tag)).find((t) => t.name === tag);
  if (existingTag) throw new ReleaseEvidenceError("TagExists", { commit: existingTag.commit }, `${tag} already stands, on ${existingTag.commit}.`);

  // Gap, noted rather than designed around: approval-record.schema.md's own prose reads "limitation ... zero or more
  // lines <TST or rate> — <reason>, one per line", but MOD-documents' "lines" shape (src/documents/read-write.mjs,
  // typed/writeDocument) joins a list field's several items onto its one line, comma separated, and refuses an item
  // that itself holds a comma — not a file this item changes. A reason is therefore recorded without a comma.
  const approvalPath = `docs/approvals/release-v${version}-${blob.slice(0, 12)}.md`;
  const approvalText = writeDocument(approvalSchema, {
    fields: { kind: "release-report", file: report.path, blob,
      limitation: ids.map((id) => `${id} — ${limitations[id]}`) },
  });

  // Read just before the write (not `branchSnapshot`, read earlier, for the job record): the report, the approval and
  // the changelog entry all land in the same commit, on the head the branch stands at now, even when it moved since
  // the report was shown (4b) — the tag below still goes on the candidate's own commit, not this one.
  const writeSnapshot = await host.readSnapshot(info.defaultBranch);
  const changelogBefore = await writeSnapshot.read("CHANGELOG.md");
  const changelogAfter = withChangelogEntry(changelogBefore, version, today, candidate.changelog, limitations);

  const { commit } = await host.commitFiles({
    branch: info.defaultBranch, expectedHead: writeSnapshot.commit,
    files: [{ path: report.path, text }, { path: approvalPath, text: approvalText }, { path: "CHANGELOG.md", text: changelogAfter }],
    message: `Release v${version}`,
  });
  await host.createTag(tag, candidate.commit); // TagExists propagates from here, unchanged — the candidate's commit, never the one just committed.
  return { commit, tag };
}

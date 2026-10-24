// ITM-293 independent release verification through MOD-release-evidence's public API.
// Module: MOD-release-evidence
// Level: release
// Guards: UC-013; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
//
// This controlled Host/Snapshot never reaches a server or creates a real tag.  It exercises only releaseReport and
// acceptAndRelease from the public index, with a 6-of-10 candidate and an 8-of-10 running release.

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { acceptAndRelease, releaseReport } from "../src/release-evidence/index.mjs";
import { storedGraphReadOn } from "./stored-graph-fake.mjs";

const VERSION = "2026.4.0", TAG = `v${VERSION}-rc.1`, PATH = `docs/tests/releases/v${VERSION}.md`;
const OLD = "e".repeat(40), CANDIDATE = "c".repeat(40), Z = 1.959963984540054;
const FAULTS = {
  "TST-293201": ["return `; current ${row.now}, running version ${row.then}; two-sided 95% Wilson confidence interval [${lower.toFixed(4)}, ${upper.toFixed(4)}]`;", "return \"\";"],
  "TST-293202": ["if (missing.length) {", "if (false) {"],
};

const blob = (text) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest("hex");
// `readOn`: the snapshot's readOn of other branches, where the fixture gives one.
const snapshot = (files, commit, readOn) => ({ repository: { path: "fixture/release" }, commit, paths: Object.keys(files),
  read: async (path) => files[path] ?? null, blob: (path) => files[path] === undefined ? null : blob(files[path]), ...(readOn ? { readOn } : {}) });
const outcome = (commit, id, runs) => ["---", `commit: ${commit}`, "levels:", "  - release", "occasion: release-candidate", "participant: ci", "date: 2026-10-11 22:00 UTC", "---", "## Outcomes", "", "| Test | Level | Outcome | Runs |", "|---|---|---|---|", `| ${id} | release | passed | ${runs} |`, ""].join("\n");
const prior = (id) => ["---", "version: 2026.3.0", "candidate: v2026.3.0-rc.1", `commit: ${OLD}`, "date: 2026-10-01", "---", "## Limitations", "", "## Levels", "", "| Level | Passed | Failed | Flaky | Not run |", "|---|---|---|---|---|", "| release | 1 | 0 | 0 | 0 |", "", "## Tests", "", "| Test | Level | Outcome | Guards |", "|---|---|---|---|", `| ${id} | release | 8 of 10 | A MODEL-DEPENDENT TEST IS MEASURED AS A RATE |`, "", "## Requirements", "", "| Requirement | Level | Tests | Outcome |", "|---|---|---|---|", `| A MODEL-DEPENDENT TEST IS MEASURED AS A RATE | release | ${id} | passed |`, "", "## Changelog entry", "", "Earlier.", ""].join("\n");
const spec = ["# Fixture", "", "**A MODEL-DEPENDENT TEST IS MEASURED AS A RATE** *(Product Owner)*", "A model-dependent test reports a rate.", "*Check:* `tests/rate.test.mjs`", ""].join("\n");
const declaration = (id) => [`// ${id}`, "// level: release", "// module: MOD-release-evidence", "// guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE", "// runs: 10", "// phrasings: 2", ""].join("\n");
const job = (id) => ["---", "id: JOB-293", "kind: run-tests", "works_on:", `  - ${CANDIDATE}`, "route: ci hosted", "started_by: akmaier", "start: 2026-10-11 22:00 UTC", "agent_m: fixture, commit fixture", "limit: 1", "---", "## Destinations", "", "## Parameters", "", "```json", JSON.stringify({ candidate: { version: VERSION, tag: TAG, commit: CANDIDATE }, changelog: "Documented rate limitation." }), "```", ""].join("\n");

function fixture(id) {
  const candidateFiles = { "SPEC.md": spec, "tests/rate.test.mjs": declaration(id), "docs/tests/releases/v2026.3.0.md": prior(id) };
  const main = { "CHANGELOG.md": "# Changelog\n", "docs/jobs/JOB-293.md": job(id) };
  const results = { [`runs/${OLD}/old.md`]: outcome(OLD, id, "8 of 10"), [`runs/${CANDIDATE}/now.md`]: outcome(CANDIDATE, id, "6 of 10") };
  const commits = new Map([["main", main], [CANDIDATE, candidateFiles], ["test-results", results]]);
  const tags = new Map([[TAG, CANDIDATE]]); let serial = 0;
  const calls = [];
  // The candidate's graph is stored on trace-cache as the workflow "main changed" stores it (tests/stored-graph-fake.mjs), whichever snapshot reads it.
  const readOn = storedGraphReadOn({ commit: CANDIDATE, paths: Object.keys(candidateFiles), read: async (path) => candidateFiles[path] ?? null });
  const host = {
    async repositoryInfo() { return { defaultBranch: "main" }; },
    async readSnapshot(ref) { const key = tags.get(ref) ?? ref; return snapshot(commits.get(key), key, readOn); },
    async listTags(pattern = "*") { const rx = new RegExp(`^${pattern.replaceAll("*", ".*")}$`); return [...tags].filter(([name]) => rx.test(name)).map(([name, commit]) => ({ name, commit })); },
    async commitFiles(change) { calls.push({ fn: "commitFiles", change: structuredClone(change) }); assert.equal(change.expectedHead, "main"); const next = { ...commits.get("main") }; for (const file of change.files) next[file.path] = file.text; const commit = `write-${++serial}`; commits.set(commit, next); commits.set("main", next); return { commit }; },
    async createTag(name, commit) { calls.push({ fn: "createTag", name, commit }); if (tags.has(name)) { const error = new Error("exists"); error.name = "TagExists"; throw error; } tags.set(name, commit); },
  };
  return { host, calls, at: snapshot(candidateFiles, CANDIDATE, readOn), results: snapshot(results, "test-results", readOn), main };
}

function scoreInterval(successes, total) {
  const observed = successes / total;
  const edge = (p) => Math.abs(observed - p) / Math.sqrt(p * (1 - p) / total) - Z;
  const solve = (left, right) => { let low = left, high = right; for (let i = 0; i < 80; i += 1) { const mid = (low + high) / 2; if (edge(mid) > 0) { if (left < observed) low = mid; else high = mid; } else if (left < observed) high = mid; else low = mid; } return (low + high) / 2; };
  return [solve(Number.EPSILON, observed), solve(observed, 1 - Number.EPSILON)];
}

// TST-293201
// level: release
// module: MOD-release-evidence
// guards: UC-013; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// given: a controlled candidate with 6 of 10 recorded model runs and a prior release with 8 of 10
// input: public releaseReport(at, results, candidate)
// expect: Limitations contains the current/running rates, a two-sided 95% Wilson interval matching independent score inversion, and no verdict
test("TST-293201 releaseReport records the 6-of-10 finding and its independently checked two-sided 95% Wilson interval", async () => {
  const id = "TST-293201", { at, results } = fixture(id);
  const report = await releaseReport(at, results, { version: VERSION, tag: TAG, commit: CANDIDATE, changelog: "Documented rate limitation." });
  const limits = report.text.slice(report.text.indexOf("## Limitations"), report.text.indexOf("## Levels"));
  const [nistLow, nistHigh] = scoreInterval(20, 25);
  assert.ok(Math.abs(nistLow - .6086905) < .00001 && Math.abs(nistHigh - .9113942) < .00001, "known positive: independent score inversion agrees with NIST 20-of-25 bounds");
  const [low, high] = scoreInterval(6, 10), match = /confidence interval \[([0-9.]+), ([0-9.]+)\]/i.exec(limits);
  assert.deepEqual(report.worse, [id]); assert.match(limits, /6 of 10/); assert.match(limits, /8 of 10/); assert.match(limits, /two-sided/i); assert.match(limits, /95%/); assert.match(limits, /Wilson/i); assert.ok(match);
  assert.ok(Math.abs(Number(match[1]) - low) <= .00005 && Math.abs(Number(match[2]) - high) <= .00005);
  assert.deepEqual(Object.keys(report).sort(), ["complete", "failing", "text", "worse"]);
});

// TST-293202
// level: release
// module: MOD-release-evidence
// guards: UC-013; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: the same worse-rate report on a controlled Host, first without a person's reason and then with one
// input: public acceptAndRelease(host, report, decision, person, today)
// expect: it refuses the missing reason; a reason records the approval, report and changelog in one commit and tags the tested candidate
test("TST-293202 acceptAndRelease refuses an unreasoned rate finding then records the person's decision", async () => {
  const id = "TST-293202", { host, calls, at, results } = fixture(id);
  const shown = await releaseReport(at, results, { version: VERSION, tag: TAG, commit: CANDIDATE, changelog: "Documented rate limitation." });
  const report = { path: PATH, blob: blob(shown.text) };
  await assert.rejects(() => acceptAndRelease(host, report, { limitations: {} }, "akmaier", "2026-10-11"), (error) => error.name === "LimitationMissing" && error.tests.includes(id));
  assert.deepEqual(calls, [], "refusal makes neither a release commit nor a tag");
  const reason = "The person accepts this observed rate uncertainty.";
  const accepted = await acceptAndRelease(host, report, { limitations: { [id]: reason } }, "akmaier", "2026-10-11");
  assert.equal(accepted.tag, `v${VERSION}`); const committed = await host.readSnapshot("main");
  assert.match(await committed.read(PATH), /6 of 10/); assert.equal(blob(await committed.read(PATH)), report.blob, "the accepted report is exactly the one shown"); assert.ok((await committed.read("CHANGELOG.md")).includes(`- ${id}: ${reason}`), "the changelog records the person's exact reason");
  const approval = committed.paths.find((path) => path.startsWith(`docs/approvals/release-v${VERSION}-`)); assert.ok(approval); assert.ok((await committed.read(approval)).includes(`${id} — ${reason}`), "the approval records the person's exact reason");
  assert.equal(calls.length, 2); assert.equal(calls[0].fn, "commitFiles"); assert.deepEqual(calls[0].change.files.map((file) => file.path).sort(), ["CHANGELOG.md", PATH, approval].sort(), "one commit carries report, approval, and changelog"); assert.equal(calls[1].fn, "createTag"); assert.equal(calls[1].commit, CANDIDATE, "the tag names the tested candidate after the decision commit");
});

after(() => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_293_RELEASE_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-293-release-fault-")), copied = join(temporary, "repo");
  const digest = (value) => createHash("sha256").update(value).digest("hex");
  try { cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    for (const [id, [needle, replacement]] of Object.entries(FAULTS)) { const source = join(copied, "src/release-evidence/report.mjs"), original = readFileSync(source), testFile = join(copied, "tests/release-evidence-293-release.test.mjs");
      assert.equal(original.toString().split(needle).length - 1, 1, `${id}: unique fault target`); const argv = [process.execPath, "--test", "--test-name-pattern", id, "tests/release-evidence-293-release.test.mjs"]; const run = () => { const env = { ...process.env, AGENT_M_293_RELEASE_FAULT_CHILD: "1" }; delete env.NODE_TEST_CONTEXT; return spawnSync(argv[0], argv.slice(1), { cwd: copied, encoding: "utf8", timeout: 15_000, env }); };
      const sourceHash = digest(original), testHash = digest(readFileSync(testFile)), faultStarted = new Date().toISOString(); let failed, faultHash, faultEnded, restoreStarted, restoredHash, restoredEnded;
      try { writeFileSync(source, original.toString().replace(needle, replacement)); faultHash = digest(readFileSync(source)); failed = run(); faultEnded = new Date().toISOString(); } finally { restoreStarted = new Date().toISOString(); writeFileSync(source, original); restoredHash = digest(readFileSync(source)); restoredEnded = new Date().toISOString(); }
      const passed = run(), positiveEnded = new Date().toISOString(); console.log("TST293-release-counterproof " + JSON.stringify({ id, source, needle, replacement, sourceHash, testHash, faultHash, restoredHash, faultStarted, faultEnded, restoreStarted, restoredEnded, positiveEnded, argv, cwd: copied, childflag: "AGENT_M_293_RELEASE_FAULT_CHILD=1", failed: { status: failed.status, signal: failed.signal, error: failed.error?.message ?? null, stdout: failed.stdout, stderr: failed.stderr }, passed: { status: passed.status, signal: passed.signal, error: passed.error?.message ?? null, stdout: passed.stdout, stderr: passed.stderr } }));
      assert.equal(failed.status, 1, id); assert.match(`${failed.stdout}\n${failed.stderr}`, new RegExp(`not ok \\d+ - ${id}\\b`)); assert.match(`${failed.stdout}\n${failed.stderr}`, /AssertionError|ERR_ASSERTION/); assert.equal(restoredHash, sourceHash, id); assert.equal(passed.status, 0, id); assert.match(`${passed.stdout}\n${passed.stderr}`, new RegExp(`ok \\d+ - ${id}\\b`));
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

// ITM-293 — a confidence interval in a release-rate finding, through the public releaseReport API.
//
// Module: MOD-release-evidence
// Guards: UC-013; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// Level: unit
//
// The fixtures are Snapshot-shaped plain objects. They use no network, clock control, host write, or product runtime.

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { releaseReport } from "../src/release-evidence/index.mjs";
import { storedGraphReadOn } from "./stored-graph-fake.mjs";

const RUNNING_COMMIT = "e".repeat(40);
const Z_95 = 1.959963984540054;
const FAULTS = {
  "TST-293101": [
    "return `; current ${row.now}, running version ${row.then}; two-sided 95% Wilson confidence interval [${lower.toFixed(4)}, ${upper.toFixed(4)}]`;",
    "return \"\";",
  ],
  "TST-293102": [
    "const worse = worseRows.filter((r) => r.worse).map((r) => r.test).sort();",
    "const worse = worseRows.map((r) => r.test).sort();",
  ],
};

function snapshotOf(files) {
  return {
    paths: Object.keys(files),
    blob: () => null,
    read: async (path) => files[path] ?? null,
  };
}

function runRecord(commit, rows) {
  return [
    "---",
    `commit: ${commit}`,
    "levels:",
    "  - unit",
    "occasion: release-candidate",
    "participant: ci",
    "date: 2026-10-11 21:00 UTC",
    "---",
    "## Outcomes",
    "",
    "| Test | Level | Outcome | Runs |",
    "|---|---|---|---|",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    "",
  ].join("\n");
}

function modelTest(id) {
  return [
    `// ${id} · level: unit · module: MOD-release-evidence`,
    "// guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE",
    "// given: a controlled model response set",
    "// input: ten independently recorded runs",
    "// expect: the report records the observed rate",
    "// runs: 10",
    "// phrasings: 2",
    "",
  ].join("\n");
}

function priorReport(commit, id) {
  return [
    "---",
    "version: 2026.3.0",
    "candidate: v2026.3.0-rc.1",
    `commit: ${commit}`,
    "date: 2026-10-01",
    "---",
    "## Limitations",
    "",
    "## Levels",
    "",
    "| Level | Passed | Failed | Flaky | Not run |",
    "|---|---|---|---|---|",
    "| unit | 1 | 0 | 0 | 0 |",
    "",
    "## Tests",
    "",
    "| Test | Level | Outcome | Guards |",
    "|---|---|---|---|",
    `| ${id} | unit | 8 of 10 | A MODEL-DEPENDENT TEST IS MEASURED AS A RATE |`,
    "",
    "## Requirements",
    "",
    "| Requirement | Level | Tests | Outcome |",
    "|---|---|---|---|",
    `| A MODEL-DEPENDENT TEST IS MEASURED AS A RATE | unit | ${id} | passed |`,
    "",
    "## Changelog entry",
    "",
    "Earlier release.",
    "",
  ].join("\n");
}

// Independent Wilson oracle: invert the two-sided score-test boundary by bisection. Production may use the equivalent
// closed form; this battery deliberately does not. NIST's 20/25 known-positive interval rounds to [0.609, 0.911].
function wilson95ByScoreInversion(successes, total) {
  const observed = successes / total;
  const boundary = (p) => Math.abs(observed - p) / Math.sqrt((p * (1 - p)) / total) - Z_95;
  const solve = (left, right) => {
    let low = left;
    let high = right;
    for (let i = 0; i < 80; i += 1) {
      const middle = (low + high) / 2;
      if (boundary(middle) > 0) {
        if (left < observed) low = middle;
        else high = middle;
      } else if (left < observed) high = middle;
      else low = middle;
    }
    return (low + high) / 2;
  };
  return { lower: solve(Number.EPSILON, observed), upper: solve(observed, 1 - Number.EPSILON) };
}

function limitationsOf(text) {
  return text.slice(text.indexOf("## Limitations"), text.indexOf("## Levels"));
}

// The candidate's commit is one of this call's own: MOD-trace-graph's storedGraph keeps a commit's graph for the page, and the calls differ in their files.
// The branch trace-cache holds the graph of the candidate's files as that commit's, as the workflow "main changed" stores it (tests/stored-graph-fake.mjs).
let candidates = 0;
function reportInputs(id, currentRuns, runningRuns = "8 of 10") {
  const CANDIDATE_COMMIT = createHash("sha1").update(`candidate ${++candidates}`).digest("hex");
  const atFiles = {
    "SPEC.md": [
      "# Fixture product — Specification",
      "",
      "## Release",
      "",
      "**A MODEL-DEPENDENT TEST IS MEASURED AS A RATE** *(Product Owner)*",
      "A model-dependent test reports a rate.",
      "*Check:* `tests/rate.test.mjs`",
      "",
    ].join("\n"),
    "tests/rate.test.mjs": modelTest(id),
  };
  const resultFiles = {
    [`runs/${CANDIDATE_COMMIT}/20261011-2100-release-candidate.md`]: runRecord(CANDIDATE_COMMIT,
      [[id, "unit", "passed", currentRuns]]),
  };
  if (runningRuns !== null) {
    atFiles["docs/tests/releases/v2026.3.0.md"] = priorReport(RUNNING_COMMIT, id);
    resultFiles[`runs/${RUNNING_COMMIT}/20261001-2100-release-candidate.md`] = runRecord(RUNNING_COMMIT,
      [[id, "unit", "passed", runningRuns]]);
  }
  const at = { ...snapshotOf(atFiles), readOn: storedGraphReadOn({ paths: Object.keys(atFiles), read: async (path) => atFiles[path] ?? null, commit: CANDIDATE_COMMIT }) };
  return { at, results: snapshotOf(resultFiles), commit: CANDIDATE_COMMIT };
}

// TST-293101 · level: unit · module: MOD-release-evidence
// guards: UC-013; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: a candidate record of 6 of 10 for a model-dependent test and a running-version record of 8 of 10, whose prior release report names the running commit
// input: releaseReport(at, results, candidate)
// expect: its public Limitations text names the test, current and running rates, and the two-sided 95% Wilson interval calculated independently by score-test inversion; the NIST 20/25 check rounds to [0.609, 0.911]
test("TST-293101 releaseReport — a worse 6-of-10 model rate has its two-sided 95% Wilson interval in the public finding", async () => {
  const nist = wilson95ByScoreInversion(20, 25);
  assert.ok(Math.abs(nist.lower - 0.609) < 0.002 && Math.abs(nist.upper - 0.911) < 0.002,
    "known positive: score inversion agrees with NIST's 20-of-25 Wilson interval");

  const id = "TST-293101";
  const { at, results, commit } = reportInputs(id, "6 of 10");
  const report = await releaseReport(at, results, {
    version: "2026.4.0", tag: "v2026.4.0-rc.1", commit, changelog: "Rate finding.",
  });
  const limits = limitationsOf(report.text);
  const expected = wilson95ByScoreInversion(6, 10);

  assert.deepEqual(report.worse, [id]);
  assert.match(limits, new RegExp(id));
  assert.match(limits, /6 of 10/);
  assert.match(limits, /8 of 10/);
  assert.match(limits, /Wilson/i);
  assert.match(limits, /two-sided/i);
  assert.match(limits, /95%/);
  const interval = /confidence interval\s*\[([0-9.]+),\s*([0-9.]+)\]/i.exec(limits);
  assert.ok(interval, "the public finding contains one bracketed confidence interval");
  const lower = Number(interval[1]);
  const upper = Number(interval[2]);
  assert.ok(lower >= 0 && lower < upper && upper <= 1, "the displayed bounds are ordered probabilities");
  assert.ok(Math.abs(lower - expected.lower) <= 0.00005, "the displayed lower bound rounds the independent oracle to four decimals");
  assert.ok(Math.abs(upper - expected.upper) <= 0.00005, "the displayed upper bound rounds the independent oracle to four decimals");
});

// TST-293102 · level: unit · module: MOD-release-evidence
// guards: UC-013; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// given: three otherwise complete candidate reports: a rate equal to the running version, one above it, and one with no prior release record
// input: releaseReport(at, results, candidate) for each report
// expect: no worse-rate finding or Wilson interval is added; the returned `worse` stays empty and the existing report return does not make an acceptance decision
test("TST-293102 releaseReport — unchanged, improved, and no-baseline rates add no confidence finding or automatic decision", async () => {
  const cases = [
    ["8 of 10", "8 of 10"],
    ["9 of 10", "8 of 10"],
    ["6 of 10", null],
  ];
  for (const [current, running] of cases) {
    const { at, results, commit } = reportInputs("TST-293102", current, running);
    const report = await releaseReport(at, results, {
      version: "2026.4.0", tag: "v2026.4.0-rc.1", commit, changelog: "No finding.",
    });
    const limits = limitationsOf(report.text);
    assert.deepEqual(report.worse, [], `${current} versus ${running}`);
    assert.doesNotMatch(limits, /Wilson|confidence interval/i, `${current} versus ${running}`);
    assert.deepEqual(Object.keys(report).sort(), ["complete", "failing", "text", "worse"], "no acceptance decision is returned");
  }
});

after(() => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_293_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-293-fault-"));
  const copied = join(temporary, "repo");
  const digest = (value) => createHash("sha256").update(value).digest("hex");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    for (const [id, [needle, replacement]] of Object.entries(FAULTS)) {
      const source = join(copied, "src", "release-evidence", "report.mjs");
      const original = readFileSync(source);
      const argv = [process.execPath, "--test", "--test-name-pattern", id, "tests/release-evidence-293.test.mjs"];
      assert.equal(original.toString().split(needle).length - 1, 1, `${id}: unique fault target`);
      const invoke = () => {
        const env = { ...process.env, AGENT_M_293_FAULT_CHILD: "1" };
        delete env.NODE_TEST_CONTEXT;
        return spawnSync(argv[0], argv.slice(1), { cwd: copied, encoding: "utf8", timeout: 15_000, env });
      };
      const sourceHash = digest(original);
      const testHash = digest(readFileSync(join(copied, "tests", "release-evidence-293.test.mjs")));
      let failed, passed, faultHash, restoredHash, faultEnded, restoreStarted, restoredEnded, positiveEnded;
      const faultStarted = new Date().toISOString();
      try {
        writeFileSync(source, original.toString().replace(needle, replacement));
        faultHash = digest(readFileSync(source));
        failed = invoke();
        faultEnded = new Date().toISOString();
      } finally {
        restoreStarted = new Date().toISOString();
        writeFileSync(source, original);
        restoredHash = digest(readFileSync(source));
        restoredEnded = new Date().toISOString();
      }
      passed = invoke();
      positiveEnded = new Date().toISOString();
      console.log("TST293-counterproof " + JSON.stringify({
        id, source, needle, replacement, sourceHash, testHash, faultHash, restoredHash,
        faultStarted, faultEnded, restoreStarted, restoredEnded, positiveEnded, argv, cwd: copied,
        childflag: "AGENT_M_293_FAULT_CHILD=1",
        failed: { status: failed.status, signal: failed.signal, error: failed.error?.message ?? null, stdout: failed.stdout, stderr: failed.stderr },
        passed: { status: passed.status, signal: passed.signal, error: passed.error?.message ?? null, stdout: passed.stdout, stderr: passed.stderr },
      }));
      assert.equal(failed.status, 1, id);
      assert.match(`${failed.stdout}\n${failed.stderr}`, new RegExp(`not ok \\d+ - ${id}\\b`));
      assert.match(`${failed.stdout}\n${failed.stderr}`, /AssertionError|ERR_ASSERTION/, `${id}: source fault reaches its assertion node`);
      assert.equal(restoredHash, sourceHash, id);
      assert.equal(passed.status, 0, id);
      assert.match(`${passed.stdout}\n${passed.stderr}`, new RegExp(`ok \\d+ - ${id}\\b`));
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

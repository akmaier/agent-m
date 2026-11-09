// The findings of a schedule (ITM-742) — MOD-test-schedule's scheduleFindings(schedule), as the accepted
// text of docs/architecture/MOD-test-schedule.md states it: the release candidate column not ticked for a row, the row
// paid ticked for every commit or a pull request, and runs on neither hosted nor runner:<label>. Each finding names the row
// and the column.
// Run: node --test tests/test-schedule-findings.test.mjs
//
// Module: MOD-test-schedule
// Guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; COMMIT TESTS CALL NO PAID SERVICE; THE TEST SCHEDULE IS DECLARED PER PRODUCT
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). Nothing here sleeps,
// waits or reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { scheduleSchema, defaultSchedule, scheduleFindings } from "../src/test-schedule/index.mjs";
import { readDocument } from "../src/documents/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";

const HEAD = "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |\n|---|---|---|---|---|---|---|";

// A schedule file whose rows are the book's default, except for the rows given by name (the text of the whole row).
function scheduleWith(changed = {}) {
  const rows = {
    unit: "| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |",
    component: "| component | ✓ | ✓ | ✓ | ✓ | ✓ | |",
    system: "| system | ✓ | ✓ | ✓ | ✓ | ✓ | |",
    paid: "| paid | | | ✓ | ✓ | ✓ | |",
    release: "| release | | | | ✓ | ✓ | |",
    user: "| user | | | | ✓ | ✓ | |",
    ...changed,
  };
  const text = `---\nnightly: 02:00\n---\n## Levels\n\n${HEAD}\n${Object.values(rows).join("\n")}\n`;
  return readDocument(scheduleSchema, "docs/tests/schedule.md", text);
}

const lines = (findings) => findings.map(formatFinding);

// TST-742001 · level: unit · module: MOD-test-schedule
// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; COMMIT TESTS CALL NO PAID SERVICE; THE TEST SCHEDULE IS DECLARED PER PRODUCT
// given: the book's default schedule
// input: scheduleFindings(defaultSchedule()); and of a schedule whose system row runs on runner:lab, a self-hosted runner by its label, and whose unit row runs on hosted
// expect: no finding in either case
test("scheduleFindings — the default and a schedule on a self-hosted runner give no finding", () => {
  assert.deepEqual(scheduleFindings(defaultSchedule()), []);
  const own = scheduleWith({ system: "| system | ✓ | ✓ | ✓ | ✓ | ✓ | runner:lab |", unit: "| unit | ✓ | ✓ | ✓ | ✓ | ✓ | hosted |" });
  assert.deepEqual(scheduleFindings(own), []);
});

// TST-742002 · level: unit · module: MOD-test-schedule
// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a schedule whose row release has its release candidate cell empty (the row stands on line 12)
// input: scheduleFindings(schedule)
// expect: one error finding on docs/tests/schedule.md:11 naming the row release and the column release candidate, under A RELEASE RUNS EVERY TEST AT EVERY LEVEL
test("scheduleFindings — a row whose release candidate cell is not ticked", () => {
  const schedule = scheduleWith({ release: "| release | | | | | ✓ | |" });
  assert.deepEqual(lines(scheduleFindings(schedule)), [
    "docs/tests/schedule.md:12: error: the row release leaves the column release candidate unticked "
      + "[A RELEASE RUNS EVERY TEST AT EVERY LEVEL] — tick the column release candidate of the row release.",
  ]);
});

// TST-742003 · level: unit · module: MOD-test-schedule
// guards: COMMIT TESTS CALL NO PAID SERVICE
// given: a schedule whose row paid is ticked for every commit and not for a pull request (the row stands on line 11)
// input: scheduleFindings(schedule)
// expect: one error finding on docs/tests/schedule.md:10 naming the row paid and the column every commit, under COMMIT TESTS CALL NO PAID SERVICE
test("scheduleFindings — the row paid ticked for every commit", () => {
  const schedule = scheduleWith({ paid: "| paid | ✓ | | ✓ | ✓ | ✓ | |" });
  assert.deepEqual(lines(scheduleFindings(schedule)), [
    "docs/tests/schedule.md:11: error: the row paid is ticked for the column every commit "
      + "[COMMIT TESTS CALL NO PAID SERVICE] — remove the tick of the column every commit from the row paid.",
  ]);
});

// TST-742004 · level: unit · module: MOD-test-schedule
// guards: COMMIT TESTS CALL NO PAID SERVICE
// given: a schedule whose row paid is ticked for a pull request and not for every commit (the row stands on line 11)
// input: scheduleFindings(schedule)
// expect: one error finding on docs/tests/schedule.md:10 naming the row paid and the column pull request, under COMMIT TESTS CALL NO PAID SERVICE
test("scheduleFindings — the row paid ticked for a pull request", () => {
  const schedule = scheduleWith({ paid: "| paid | | ✓ | ✓ | ✓ | ✓ | |" });
  assert.deepEqual(lines(scheduleFindings(schedule)), [
    "docs/tests/schedule.md:11: error: the row paid is ticked for the column pull request "
      + "[COMMIT TESTS CALL NO PAID SERVICE] — remove the tick of the column pull request from the row paid.",
  ]);
});

// TST-742005 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT
// given: a schedule whose row component runs on "lab-runner", a name that is neither hosted nor runner:<label> (the row stands on line 9)
// input: scheduleFindings(schedule)
// expect: one error finding on docs/tests/schedule.md:9 naming the row component and the column runs on, saying it is neither hosted nor runner:<label>
test("scheduleFindings — runs on neither hosted nor runner:<label>", () => {
  const schedule = scheduleWith({ component: "| component | ✓ | ✓ | ✓ | ✓ | ✓ | lab-runner |" });
  assert.deepEqual(lines(scheduleFindings(schedule)), [
    "docs/tests/schedule.md:9: error: the row component names lab-runner in the column runs on, which is neither hosted nor "
      + "runner:<label> [THE TEST SCHEDULE IS DECLARED PER PRODUCT] — write hosted, or runner: followed by the label of a "
      + "self-hosted runner, in the column runs on of the row component.",
  ]);
});

// TST-742006 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT
// given: a schedule whose row system runs on "runner:" (no label) and whose row user runs on "runner:lab"
// input: scheduleFindings(schedule)
// expect: one error finding, for the row system on line 10: a runner without a label is no runner:<label>; runner:lab gives none
test("scheduleFindings — runs on runner: without a label", () => {
  const schedule = scheduleWith({
    system: "| system | ✓ | ✓ | ✓ | ✓ | ✓ | runner: |",
    user: "| user | | | | ✓ | ✓ | runner:lab |",
  });
  assert.deepEqual(lines(scheduleFindings(schedule)), [
    "docs/tests/schedule.md:10: error: the row system names runner: in the column runs on, which is neither hosted nor "
      + "runner:<label> [THE TEST SCHEDULE IS DECLARED PER PRODUCT] — write hosted, or runner: followed by the label of a "
      + "self-hosted runner, in the column runs on of the row system.",
  ]);
});

// TST-742007 · level: unit · module: MOD-test-schedule
// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; COMMIT TESTS CALL NO PAID SERVICE
// given: a schedule breaking two rules: the row user has no release candidate tick (line 13), and the row paid is ticked for a pull request (line 11)
// input: scheduleFindings(schedule)
// expect: two error findings, one for each rule, in the order of the rows: paid / pull request first, then user / release candidate
test("scheduleFindings — a schedule breaking two rules gives both findings", () => {
  const schedule = scheduleWith({ paid: "| paid | | ✓ | ✓ | ✓ | ✓ | |", user: "| user | | | | | ✓ | |" });
  const found = scheduleFindings(schedule);
  assert.deepEqual(found.map(({ kind, line, rule }) => [kind, line, rule]), [
    ["error", 11, "COMMIT TESTS CALL NO PAID SERVICE"],
    ["error", 13, "A RELEASE RUNS EVERY TEST AT EVERY LEVEL"],
  ]);
  assert.match(found[0].what, /row paid.*column pull request/);
  assert.match(found[1].what, /row user.*column release candidate/);
});

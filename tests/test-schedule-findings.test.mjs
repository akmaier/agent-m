// The findings of a schedule (ITM-742) — MOD-test-schedule's scheduleFindings(schedule, participants), as the accepted
// text of docs/architecture/MOD-test-schedule.md states it: the release candidate column not ticked for a row, the row
// paid ticked for every commit or a pull request, and runs on naming a participant without "run code and tests" or
// without a runner route. Each finding names the row and the column.
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
import { participantSchema } from "../src/participant-list/index.mjs";
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

const REGISTER = `# Participants of this instance

**REGISTER**

The participants of the test instance.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| lab-runner | CI agent | example-model | 200000 | — | draft text, run code and tests | this machine | ci runner:lab secret LAB_KEY |
| hosted-ci | CI agent | example-model | 200000 | — | draft text, run code and tests | the server | ci hosted secret CI_KEY |
| writer | CLI agent | example-model | 200000 | — | draft text, read the repository | this machine | bridge lab-pc agent claude |
| bridge-runner | CLI agent | example-model | 200000 | — | draft text, run code and tests | this machine | bridge lab-pc agent claude |
`;
const participants = readDocument(participantSchema(), "docs/participants.md", REGISTER);

const lines = (findings) => findings.map(formatFinding);

// TST-742001 · level: unit · module: MOD-test-schedule
// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; COMMIT TESTS CALL NO PAID SERVICE; THE TEST SCHEDULE IS DECLARED PER PRODUCT
// given: the book's default schedule, and a participant list with a runner participant that has "run code and tests"
// input: scheduleFindings(defaultSchedule(), participants); and of a schedule whose system row runs on lab-runner, a participant with "run code and tests" and a runner route, and whose unit row runs on hosted
// expect: no finding in either case
test("scheduleFindings — the default and a schedule on a capable runner give no finding", () => {
  assert.deepEqual(scheduleFindings(defaultSchedule(), participants), []);
  const own = scheduleWith({ system: "| system | ✓ | ✓ | ✓ | ✓ | ✓ | lab-runner |", unit: "| unit | ✓ | ✓ | ✓ | ✓ | ✓ | hosted |" });
  assert.deepEqual(scheduleFindings(own, participants), []);
});

// TST-742002 · level: unit · module: MOD-test-schedule
// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a schedule whose row release has its release candidate cell empty (the row stands on line 12)
// input: scheduleFindings(schedule, participants)
// expect: one error finding on docs/tests/schedule.md:11 naming the row release and the column release candidate, under A RELEASE RUNS EVERY TEST AT EVERY LEVEL
test("scheduleFindings — a row whose release candidate cell is not ticked", () => {
  const schedule = scheduleWith({ release: "| release | | | | | ✓ | |" });
  assert.deepEqual(lines(scheduleFindings(schedule, participants)), [
    "docs/tests/schedule.md:12: error: the row release leaves the column release candidate unticked "
      + "[A RELEASE RUNS EVERY TEST AT EVERY LEVEL] — tick the column release candidate of the row release.",
  ]);
});

// TST-742003 · level: unit · module: MOD-test-schedule
// guards: COMMIT TESTS CALL NO PAID SERVICE
// given: a schedule whose row paid is ticked for every commit and not for a pull request (the row stands on line 11)
// input: scheduleFindings(schedule, participants)
// expect: one error finding on docs/tests/schedule.md:10 naming the row paid and the column every commit, under COMMIT TESTS CALL NO PAID SERVICE
test("scheduleFindings — the row paid ticked for every commit", () => {
  const schedule = scheduleWith({ paid: "| paid | ✓ | | ✓ | ✓ | ✓ | |" });
  assert.deepEqual(lines(scheduleFindings(schedule, participants)), [
    "docs/tests/schedule.md:11: error: the row paid is ticked for the column every commit "
      + "[COMMIT TESTS CALL NO PAID SERVICE] — remove the tick of the column every commit from the row paid.",
  ]);
});

// TST-742004 · level: unit · module: MOD-test-schedule
// guards: COMMIT TESTS CALL NO PAID SERVICE
// given: a schedule whose row paid is ticked for a pull request and not for every commit (the row stands on line 11)
// input: scheduleFindings(schedule, participants)
// expect: one error finding on docs/tests/schedule.md:10 naming the row paid and the column pull request, under COMMIT TESTS CALL NO PAID SERVICE
test("scheduleFindings — the row paid ticked for a pull request", () => {
  const schedule = scheduleWith({ paid: "| paid | | ✓ | ✓ | ✓ | ✓ | |" });
  assert.deepEqual(lines(scheduleFindings(schedule, participants)), [
    "docs/tests/schedule.md:11: error: the row paid is ticked for the column pull request "
      + "[COMMIT TESTS CALL NO PAID SERVICE] — remove the tick of the column pull request from the row paid.",
  ]);
});

// TST-742005 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT
// given: a schedule whose row component runs on "writer", a participant of the list without "run code and tests" (the row stands on line 9)
// input: scheduleFindings(schedule, participants)
// expect: one error finding on docs/tests/schedule.md:8 naming the row component and the column runs on, saying the participant lacks "run code and tests"
test("scheduleFindings — runs on naming a participant without run code and tests", () => {
  const schedule = scheduleWith({ component: "| component | ✓ | ✓ | ✓ | ✓ | ✓ | writer |" });
  assert.deepEqual(lines(scheduleFindings(schedule, participants)), [
    "docs/tests/schedule.md:9: error: the row component names writer in the column runs on, which lacks the capability "
      + "\"run code and tests\" [THE TEST SCHEDULE IS DECLARED PER PRODUCT] — name a participant with \"run code and tests\" in the "
      + "column runs on of the row component, or hosted.",
  ]);
});

// TST-742006 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT
// given: a schedule whose row system runs on "bridge-runner" (has "run code and tests", route "bridge lab-pc agent claude", no runner route) and whose row user runs on "nobody", which the list does not hold
// input: scheduleFindings(schedule, participants)
// expect: two error findings in the order of the rows, each naming its row and the column runs on: system — the route is no runner; user — the participant is not in the list
test("scheduleFindings — runs on naming a participant without a runner route, or none of the list", () => {
  const schedule = scheduleWith({
    system: "| system | ✓ | ✓ | ✓ | ✓ | ✓ | bridge-runner |",
    user: "| user | | | | ✓ | ✓ | nobody |",
  });
  assert.deepEqual(lines(scheduleFindings(schedule, participants)), [
    "docs/tests/schedule.md:10: error: the row system names bridge-runner in the column runs on, whose route "
      + "\"bridge lab-pc agent claude\" is no self-hosted runner [THE TEST SCHEDULE IS DECLARED PER PRODUCT] — name a participant "
      + "with a runner route in the column runs on of the row system, or hosted.",
    "docs/tests/schedule.md:13: error: the row user names nobody in the column runs on, which is no participant of the list "
      + "[THE TEST SCHEDULE IS DECLARED PER PRODUCT] — name a participant with \"run code and tests\" and a runner route in the "
      + "column runs on of the row user, or hosted.",
  ]);
});

// TST-742007 · level: unit · module: MOD-test-schedule
// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; COMMIT TESTS CALL NO PAID SERVICE
// given: a schedule breaking two rules: the row user has no release candidate tick (line 13), and the row paid is ticked for a pull request (line 11)
// input: scheduleFindings(schedule, participants)
// expect: two error findings, one for each rule, in the order of the rows: paid / pull request first, then user / release candidate
test("scheduleFindings — a schedule breaking two rules gives both findings", () => {
  const schedule = scheduleWith({ paid: "| paid | | ✓ | ✓ | ✓ | ✓ | |", user: "| user | | | | | ✓ | |" });
  const found = scheduleFindings(schedule, participants);
  assert.deepEqual(found.map(({ kind, line, rule }) => [kind, line, rule]), [
    ["error", 11, "COMMIT TESTS CALL NO PAID SERVICE"],
    ["error", 13, "A RELEASE RUNS EVERY TEST AT EVERY LEVEL"],
  ]);
  assert.match(found[0].what, /row paid.*column pull request/);
  assert.match(found[1].what, /row user.*column release candidate/);
});

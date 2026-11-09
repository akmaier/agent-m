// The findings of a schedule (MOD-test-schedule, Interfaces: scheduleFindings): what a schedule may not say.
//
// Module: MOD-test-schedule
//
// Three rules, each judged per row of the "## Levels" table and each finding naming the row and the column: the release
// candidate column unticked (A RELEASE RUNS EVERY TEST AT EVERY LEVEL); the row paid ticked for every commit or a pull
// request (COMMIT TESTS CALL NO PAID SERVICE); and runs on neither `hosted` nor `runner:<label>`, a self-hosted runner by its
// label (THE TEST SCHEDULE IS DECLARED PER PRODUCT). And a count the schedule declares that is not a whole number from 1 —
// the front matter's minutes, first, and a row's shards — (THE TEST SCHEDULE IS DECLARED PER PRODUCT); a value left out is
// none.

import { finding } from "../text-tools/index.mjs";

const RUNNER = /^runner:\S+$/;
const DECLARED = "THE TEST SCHEDULE IS DECLARED PER PRODUCT";

// Whether a value the schedule declares is a count it may hold: left out, or a whole number from 1.
const isCount = (value) => value === undefined || value === null || value === "" || (Number.isInteger(value) && value >= 1);

// The line of a front matter key, counted as MOD-documents counts it: the line --- first, then each key on a line of its own,
// and each item of a list on one more.
function keyLine(fields, key) {
  let line = 2;
  for (const [name, value] of Object.entries(fields)) {
    if (name === key) return line;
    line += 1 + (Array.isArray(value) ? value.length : 0);
  }
  return 1;
}

/**
 * scheduleFindings(schedule: Document) -> Finding[] — the errors of a schedule read with scheduleSchema, in the order of its rows. A
 * row whose `runs on` is left out, `hosted` or `runner:<label>` runs where it names.
 * @param {Document} schedule
 * @returns {Finding[]}
 */
export function scheduleFindings(schedule) {
  const rows = schedule.sections.find((section) => section.heading === "## Levels")?.rows ?? [];
  const found = [];
  const error = (line, rule, what, fix) => found.push(finding({ artifact: schedule.path, line, kind: "error", rule, what, fix }));
  const minutes = schedule.fields.minutes;
  if (!isCount(minutes)) {
    error(keyLine(schedule.fields, "minutes"), DECLARED, `the key minutes has the value ${minutes}, which is not a whole number from 1`,
      "give the key minutes a whole number of minutes from 1, or leave it out for no time limit");
  }
  for (const { line, cells } of rows) {
    const row = cells.Row;
    if (!isCount(cells.shards)) {
      error(line, DECLARED, `the row ${row} gives the column shards the value ${cells.shards}, which is not a whole number from 1`,
        `give the column shards of the row ${row} a whole number from 1, or leave it empty for one shard`);
    }
    if (cells["release candidate"] !== "✓") {
      error(line, "A RELEASE RUNS EVERY TEST AT EVERY LEVEL", `the row ${row} leaves the column release candidate unticked`,
        `tick the column release candidate of the row ${row}`);
    }
    for (const column of row === "paid" ? ["every commit", "pull request"] : []) {
      if (cells[column] === "✓") {
        error(line, "COMMIT TESTS CALL NO PAID SERVICE", `the row paid is ticked for the column ${column}`,
          `remove the tick of the column ${column} from the row paid`);
      }
    }
    const runsOn = cells["runs on"];
    if (runsOn === undefined || runsOn === "hosted") continue;
    if (!RUNNER.test(runsOn)) {
      error(line, DECLARED, `the row ${row} names ${runsOn} in the column runs on, which is neither hosted nor runner:<label>`,
        `write hosted, or runner: followed by the label of a self-hosted runner, in the column runs on of the row ${row}`);
    }
  }
  return found;
}

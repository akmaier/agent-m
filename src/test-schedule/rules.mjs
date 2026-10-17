// The findings of a schedule (MOD-test-schedule, Interfaces: scheduleFindings): what a schedule may not say.
//
// Module: MOD-test-schedule
//
// Three rules, each judged per row of the "## Levels" table and each finding naming the row and the column: the release
// candidate column unticked (A RELEASE RUNS EVERY TEST AT EVERY LEVEL); the row paid ticked for every commit or a pull
// request (COMMIT TESTS CALL NO PAID SERVICE); and runs on naming a participant without "run code and tests" or without
// a runner route (THE TEST SCHEDULE IS DECLARED PER PRODUCT). A runner route is the route of a CI agent that names a
// runner: `ci runner:<label> secret <NAME>` (MOD-participant-list, Data, Route).

import { finding } from "../text-tools/index.mjs";
import { participantsOf } from "../participant-list/index.mjs";

const RUN = "run code and tests";
const RUNNER_ROUTE = /^ci runner:\S+/;

/**
 * scheduleFindings(schedule: Document, participants: Document) -> Finding[] — the errors of a schedule read with
 * scheduleSchema, in the order of its rows; the participants are the register read with participantSchema. A row whose
 * `runs on` is left out or `hosted` is judged by no participant.
 * @param {Document} schedule
 * @param {Document} participants
 * @returns {Finding[]}
 */
export function scheduleFindings(schedule, participants) {
  const known = participantsOf(participants);
  const rows = schedule.sections.find((section) => section.heading === "## Levels")?.rows ?? [];
  const found = [];
  const error = (line, rule, what, fix) => found.push(finding({ artifact: schedule.path, line, kind: "error", rule, what, fix }));
  for (const { line, cells } of rows) {
    const row = cells.Row;
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
    const named = known.find((participant) => participant.name === runsOn);
    const at = `the row ${row} names ${runsOn} in the column runs on`;
    const rule = "THE TEST SCHEDULE IS DECLARED PER PRODUCT";
    if (!named) {
      error(line, rule, `${at}, which is no participant of the list`,
        `name a participant with "${RUN}" and a runner route in the column runs on of the row ${row}, or hosted`);
    } else if (!named.capabilities.includes(RUN)) {
      error(line, rule, `${at}, which lacks the capability "${RUN}"`,
        `name a participant with "${RUN}" in the column runs on of the row ${row}, or hosted`);
    } else if (!RUNNER_ROUTE.test(named.route ?? "")) {
      error(line, rule, `${at}, whose route "${named.route}" is no self-hosted runner`,
        `name a participant with a runner route in the column runs on of the row ${row}, or hosted`);
    }
  }
  return found;
}

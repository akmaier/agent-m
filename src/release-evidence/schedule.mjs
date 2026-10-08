// schedule.mjs — reading a product's test schedule at a commit (MOD-test-schedule), private to this module: the rows of
// its "## Levels" table, falling back to the book's default where the product declares none (THE DEFAULT SCHEDULE
// FOLLOWS THE BOOK).
//
// Module: MOD-release-evidence

import { scheduleSchema, defaultSchedule } from "../test-schedule/index.mjs";
import { readDocument } from "../documents/index.mjs";

const SCHEDULE_PATH = "docs/tests/schedule.md";

// scheduleAt(snapshot) -> Promise<Document> — the product's own schedule.md at this snapshot, read with scheduleSchema,
// or the book's default where the product holds none.
export async function scheduleAt(snapshot) {
  const text = await snapshot.read(SCHEDULE_PATH);
  return text === null ? defaultSchedule() : readDocument(scheduleSchema, SCHEDULE_PATH, text);
}

// levelRows(schedule) -> Row[] — the rows of the schedule's "## Levels" table, each { line, cells: { Row, ..., "runs
// on" } } (schedule.schema.md).
export function levelRows(schedule) {
  return schedule.sections.find((section) => section.heading === "## Levels")?.rows ?? [];
}

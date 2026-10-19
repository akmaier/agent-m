// When a row runs and which secrets the schedule needs by name (MOD-test-schedule, Interfaces: occasionsOf, secretsNeeded).
//
// Module: MOD-test-schedule

export const OCCASIONS = ["every commit", "pull request", "nightly", "release candidate", "on demand"];
const CI_SECRET = /^ci:([A-Za-z_][A-Za-z0-9_]*)$/;
export const rowsOf = (schedule) => schedule.sections.find((section) => section.heading === "## Levels")?.rows ?? [];

/**
 * occasionsOf(row: string, schedule: Document) -> string[] — the occasions on which a row runs: the columns the schedule
 * ticks for the row, in the order of the table (every commit, pull request, nightly, release candidate, on demand); none
 * for a row the schedule does not hold or ticks nowhere.
 * @param {string} row
 * @param {Document} schedule
 * @returns {string[]}
 */
export function occasionsOf(row, schedule) {
  const found = rowsOf(schedule).find(({ cells }) => cells.Row === row);
  return found ? OCCASIONS.filter((occasion) => found.cells[occasion] === "✓") : [];
}

// The rows the schedule ticks for the nightly occasion, in the order of the table.
export const nightlyRows = (schedule) => rowsOf(schedule).map(({ cells }) => cells.Row).filter((row) => occasionsOf(row, schedule).includes("nightly"));

// The cron expression of the declared nightly time, `HH:MM` in UTC.
export function nightlyCron(schedule) {
  const [hour, minute] = schedule.fields.nightly.split(":").map(Number);
  return `${minute} ${hour} * * *`;
}

/**
 * secretsNeeded(schedule: Document, resources: Document) -> Array<{ name: string, for: string }> — the names of the secrets
 * the scheduled tests need: of each endpoint or agent of the product's resources — the row `paid` is the tests that call a
 * paid service or a model, so it calls them all —, the CI
 * secret its Secret column names (`ci:<NAME>`), once the row is ticked on some occasion. Never a value: a Secret cell that
 * is no `ci:<NAME>` — a key kept in a browser, left out, or a value written where a name belongs — gives nothing.
 * @param {Document} schedule
 * @param {Document} resources the list docs/resources.md as readDocument reads it with MOD-resource-list's schema
 * @returns {Array<{ name: string, for: string }>}
 */
export function secretsNeeded(schedule, resources) {
  if (occasionsOf("paid", schedule).length === 0) return [];
  return resources.sections.flatMap((section) => section.rows ?? []).flatMap(({ cells }) => {
    const named = CI_SECRET.exec(cells.Secret ?? "");
    const called = cells.Kind === "endpoint" || cells.Kind === "agent";
    return called && named ? [{ name: named[1], for: cells.Name }] : [];
  });
}

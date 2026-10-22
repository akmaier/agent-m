// MOD-test-schedule — the test schedule and the CI configuration generated from it (docs/architecture/MOD-test-schedule.md):
// its interface. Of it, ITM-250 builds scheduleSchema and defaultSchedule, as its file states them: the schema of a
// product's docs/tests/schedule.md in schedule.schema.md, and the book's default in default-schedule.md, marked as the
// default. They give the complete run of a release candidate the levels it runs, the command that runs them and the
// runner of each (MOD-release-evidence). ITM-742 adds scheduleFindings (rules.mjs). ITM-743 adds occasionsOf and secretsNeeded (occasions.mjs). ITM-744 adds
// ciConfiguration (generate.mjs, templates/). ITM-746 adds proposeSchedule and applyPipelineSchedule (propose.mjs). ITM-747 adds scheduleStrategies
// (strategies.mjs). ITM-745 adds configurationDrift (generate.mjs).
//
// Module: MOD-test-schedule
//
// It belongs to Tests and releases (ARC-043). It runs unchanged in a browser and in Node. Its one read is that of its own
// two data files — schedule.schema.md, the schedule's schema, and default-schedule.md, the book's default —, once, when
// the module is loaded: from the disk in Node, from the module's own address in a browser, as src/job-ledger/index.mjs
// reads its schema. A file that cannot be read, or a schema that breaks the language, stops the module's load.

import { loadSchema, readDocument } from "../documents/index.mjs";
import { ownText } from "./own-file.mjs";

export { scheduleFindings } from "./rules.mjs";
export { occasionsOf, secretsNeeded } from "./occasions.mjs";
export { ciConfiguration, configurationDrift } from "./generate.mjs";
export { proposeSchedule, applyPipelineSchedule } from "./propose.mjs";
export { scheduleStrategies } from "./strategies.mjs";

const OWNER = "MOD-test-schedule";
const SCHEMA_FILE = "schedule.schema.md";
const DEFAULT_FILE = "default-schedule.md";
const DEFAULT_PATH = "docs/tests/schedule.md";

/**
 * scheduleSchema: Schema — the schedule's schema, read from this module's data file schedule.schema.md with
 * MOD-documents' loadSchema: the format of a product's docs/tests/schedule.md.
 */
export const scheduleSchema = loadSchema(
  await ownText(SCHEMA_FILE), OWNER);

// The book's default, as text — read once with the schema above already loaded, parsed afresh on every call of
// defaultSchedule so that no caller can hold, and so change, the one copy every other caller would then see.
const DEFAULT_TEXT = await ownText(DEFAULT_FILE);

/**
 * defaultSchedule() -> Document & { default: true } — the book's default as a schedule (`THE DEFAULT SCHEDULE FOLLOWS
 * THE BOOK`): this module's own default-schedule.md, read with scheduleSchema and marked as the default — the one
 * property no document scheduleSchema reads from a product's own file ever carries.
 */
export function defaultSchedule() {
  const document = readDocument(scheduleSchema, DEFAULT_PATH, DEFAULT_TEXT);
  return { ...document, default: true };
}

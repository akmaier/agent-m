// MOD-test-schedule — the test schedule and the CI configuration generated from it (docs/architecture/MOD-test-schedule.md):
// its interface. Of it, ITM-250 builds scheduleSchema and defaultSchedule, as its file states them: the schema of a
// product's docs/tests/schedule.md in schedule.schema.md, and the book's default in default-schedule.md, marked as the
// default. They give the complete run of a release candidate the levels it runs, the command that runs them and the
// runner of each (MOD-release-evidence). scheduleFindings, ciConfiguration, configurationDrift, secretsNeeded,
// occasionsOf, proposeSchedule, applyPipelineSchedule and scheduleStrategies are UC-027's, not part of this item, and
// are not built yet.
//
// Module: MOD-test-schedule
//
// It belongs to Tests and releases (ARC-043). It runs unchanged in a browser and in Node. Its one read is that of its own
// two data files — schedule.schema.md, the schedule's schema, and default-schedule.md, the book's default —, once, when
// the module is loaded: from the disk in Node, from the module's own address in a browser, as src/job-ledger/index.mjs
// reads its schema. A file that cannot be read, or a schema that breaks the language, stops the module's load.

import { loadSchema, readDocument } from "../documents/index.mjs";

const OWNER = "MOD-test-schedule";
const SCHEMA_FILE = new URL("./schedule.schema.md", import.meta.url);
const DEFAULT_FILE = new URL("./default-schedule.md", import.meta.url);
const DEFAULT_PATH = "docs/tests/schedule.md";
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the
// file and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

/**
 * scheduleSchema: Schema — the schedule's schema, read from this module's data file schedule.schema.md with
 * MOD-documents' loadSchema: the format of a product's docs/tests/schedule.md.
 */
export const scheduleSchema = loadSchema(
  disk ? disk.readFileSync(SCHEMA_FILE, "utf8") : await ownFile(SCHEMA_FILE), OWNER);

// The book's default, as text — read once with the schema above already loaded, parsed afresh on every call of
// defaultSchedule so that no caller can hold, and so change, the one copy every other caller would then see.
const DEFAULT_TEXT = disk ? disk.readFileSync(DEFAULT_FILE, "utf8") : await ownFile(DEFAULT_FILE);

/**
 * defaultSchedule() -> Document & { default: true } — the book's default as a schedule (`THE DEFAULT SCHEDULE FOLLOWS
 * THE BOOK`): this module's own default-schedule.md, read with scheduleSchema and marked as the default — the one
 * property no document scheduleSchema reads from a product's own file ever carries.
 */
export function defaultSchedule() {
  const document = readDocument(scheduleSchema, DEFAULT_PATH, DEFAULT_TEXT);
  return { ...document, default: true };
}

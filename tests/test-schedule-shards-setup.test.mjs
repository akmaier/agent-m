// The schedule declares shards, a time limit and a setup (ITM-1213) — MOD-test-schedule's schema and scheduleFindings, as
// docs/architecture/MOD-test-schedule.md states them under Data: the front matter `setup`, `cache` and `minutes`, and the
// column `shards` of `## Levels`, a whole number from 1, empty for 1; `report` is no field of the schedule. scheduleFindings
// finds a `shards` or a `minutes` that is not a whole number from 1. The test files of a row (testsOfRow) are tested in
// tests/test-schedule-rows.test.mjs.
// Run: node --test tests/test-schedule-shards-setup.test.mjs
//
// Module: MOD-test-schedule
// Guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). Every schedule read here is
// written out below; nothing reads a file, sleeps or reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { scheduleSchema, scheduleFindings } from "../src/test-schedule/index.mjs";
import { readDocument, documentFindings } from "../src/documents/index.mjs";
import { participantSchema } from "../src/participant-list/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";

const PATH = "docs/tests/schedule.md";
const HEAD = "| Row | every commit | pull request | nightly | release candidate | on demand | runs on | shards |\n"
  + "|---|---|---|---|---|---|---|---|";

// A schedule with the front matter given, whose rows are the book's default with the shards given by row.
function scheduleWith(frontMatter, shards = {}) {
  const ticks = {
    unit: "✓ | ✓ | ✓ | ✓ | ✓", component: "✓ | ✓ | ✓ | ✓ | ✓", system: "✓ | ✓ | ✓ | ✓ | ✓",
    paid: " |  | ✓ | ✓ | ✓", release: " |  |  | ✓ | ✓", user: " |  |  | ✓ | ✓",
  };
  const rows = Object.entries(ticks).map(([row, cells]) => `| ${row} | ${cells} | | ${shards[row] ?? ""} |`);
  return `---\n${frontMatter}\n---\n## Levels\n\n${HEAD}\n${rows.join("\n")}\n`;
}

const read = (text) => readDocument(scheduleSchema, PATH, text);
const participants = readDocument(participantSchema(), "docs/participants.md", `# Participants of this instance

**REGISTER**

The participants of the test instance.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| hosted-ci | CI agent | example-model | 200000 | — | draft text, run code and tests | the server | ci hosted secret CI_KEY |
`);
const lines = (findings) => findings.map(formatFinding);
const rowsOf = (document) => document.sections.find((s) => s.heading === "## Levels").rows.map((row) => row.cells);

// TST-1213001 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: a schedule with the front matter nightly 02:00, command "./tests/run.sh", setup "sudo apt-get install --yes xvfb openbox", cache the two paths /home/runner/apt-archives and /home/runner/apt-lists, minutes 2; and a column shards with 7 for the row unit, 20 for the row component and empty for the other rows
// input: readDocument(scheduleSchema, "docs/tests/schedule.md", text); documentFindings and scheduleFindings of it
// expect: no finding of either; the fields read back as given — minutes the number 2, cache the two paths in order —; the shards of unit 7 and of component 20, and no shards for the row system
test("scheduleSchema — a schedule declares shards, a setup, a cache and a time limit", () => {
  const document = read(scheduleWith([
    "nightly: 02:00", "command: ./tests/run.sh", "setup: sudo apt-get install --yes xvfb openbox",
    "cache:", "  - /home/runner/apt-archives", "  - /home/runner/apt-lists", "minutes: 2",
  ].join("\n"), { unit: "7", component: "20" }));
  assert.deepEqual(lines(documentFindings(scheduleSchema, document)), []);
  assert.deepEqual(lines(scheduleFindings(document, participants)), []);
  assert.equal(document.fields.setup, "sudo apt-get install --yes xvfb openbox");
  assert.deepEqual(document.fields.cache, ["/home/runner/apt-archives", "/home/runner/apt-lists"]);
  assert.equal(document.fields.minutes, 2);
  const [unit, component, system] = rowsOf(document);
  assert.equal(unit.shards, 7);
  assert.equal(component.shards, 20);
  assert.equal(system.shards, undefined);
});

// TST-1213002 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: a schedule whose front matter holds nightly 02:00 on line 2 and minutes x on line 3, and whose column shards holds 0 for the row unit (line 9) and 2.5 for the row system (line 11); and the same schedule with minutes 0
// input: scheduleFindings(schedule, participants) of each
// expect: for the first, three errors under THE TEST SCHEDULE IS DECLARED PER PRODUCT, in the order of the file: the key minutes on line 3, the row unit's shards on line 9, the row system's shards on line 11, each naming the value and asking for a whole number from 1; for the second, the error of the key minutes with the value 0 first
test("scheduleFindings — a shards or a minutes that is not a whole number from 1", () => {
  const shards = { unit: "0", system: "2.5" };
  assert.deepEqual(lines(scheduleFindings(read(scheduleWith("nightly: 02:00\nminutes: x", shards)), participants)), [
    "docs/tests/schedule.md:3: error: the key minutes has the value x, which is not a whole number from 1 "
      + "[THE TEST SCHEDULE IS DECLARED PER PRODUCT] — give the key minutes a whole number of minutes from 1, or leave it out "
      + "for no time limit.",
    "docs/tests/schedule.md:9: error: the row unit gives the column shards the value 0, which is not a whole number from 1 "
      + "[THE TEST SCHEDULE IS DECLARED PER PRODUCT] — give the column shards of the row unit a whole number from 1, or leave "
      + "it empty for one shard.",
    "docs/tests/schedule.md:11: error: the row system gives the column shards the value 2.5, which is not a whole number "
      + "from 1 [THE TEST SCHEDULE IS DECLARED PER PRODUCT] — give the column shards of the row system a whole number from 1, "
      + "or leave it empty for one shard.",
  ]);
  const zero = lines(scheduleFindings(read(scheduleWith("nightly: 02:00\nminutes: 0", shards)), participants));
  assert.match(zero[0], /^docs\/tests\/schedule\.md:3: error: the key minutes has the value 0, which is not a whole number/);
});

// TST-1213003 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: a schedule whose front matter holds nightly 02:00 on line 2 and report build/junit.xml on line 3, as a schedule could before the command wrote the report itself
// input: documentFindings(scheduleSchema, schedule)
// expect: one error on line 3 under THE TEST SCHEDULE IS DECLARED PER PRODUCT naming report as no key of the format schedule
test("scheduleSchema — report is no field of the schedule", () => {
  const document = read(scheduleWith("nightly: 02:00\nreport: build/junit.xml"));
  const found = lines(documentFindings(scheduleSchema, document));
  assert.equal(found.length, 1, found.join("\n"));
  assert.match(found[0], /^docs\/tests\/schedule\.md:3: error: the key report is not a key of the format schedule /);
  assert.match(found[0], /\[THE TEST SCHEDULE IS DECLARED PER PRODUCT\]/);
});

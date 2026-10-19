// MOD-result-records' check `test-proposals` of `resultStrategies`, its use for the kind `propose-tests` (ITM-851), as the accepted text of docs/architecture/MOD-result-records.md states it
// (:139-142): "an error finding for ... a case of a level that runs on a commit or pull request and reaches a service `paidServices` marks paid", and :173-174: the levels that run on a
// commit or a pull request come from the product's schedule, or the book's default where none is saved (MOD-test-schedule's `occasionsOf`, `defaultSchedule`). For UC-026 step 6.
// Run: node --test tests/result-records-test-proposals-paid.test.mjs
//
// Module: MOD-result-records
// Guards: COMMIT TESTS CALL NO PAID SERVICE; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE; UC-026
// Level: unit
//
// Where the file leaves a reading open, the tests state the one they take, and the pull request names it:
//   - A proposed case carries `paid`, the name of the paid service it really calls (ITM-890 added the field; MOD-test-document's declaration key of that name); a case that does not leaves it out.
//   - A case "reaches a service paidServices marks paid" when its `paid` equals, after trimming, the Name of a resource of docs/resources.md that `paidServices` marks paid. A name that no resource
//     bears, and a name of a service marked free, give no finding.
//   - A level "runs on a commit or pull request" when `occasionsOf(level, schedule)` holds `every commit` or `pull request`; the schedule is the product's docs/tests/schedule.md, or `defaultSchedule()`
//     where the snapshot holds none.
//   - The finding is an error under COMMIT TESTS CALL NO PAID SERVICE, its `line` the case's position in `cases` from 1, its `artifact` the case's identifier, and it names the service and the level.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { resultStrategies } from "../src/result-records/index.mjs";

const RULE = "COMMIT TESTS CALL NO PAID SERVICE";
const check = (draft, files = {}) => resultStrategies.checks["test-proposals"](draft, contextOf(files));
const snapshotOf = (files) => ({ paths: Object.keys(files), read: async (path) => (Object.hasOwn(files, path) ? files[path] : null) });
const contextOf = (files) => ({ kind: null, params: {},
  product: { address: "https://github.com/acme/product", snapshot: snapshotOf(files), host: null },
  instance: { snapshot: snapshotOf({}), host: null, checkout: null }, connect: async () => null, participants: [], places: { sources: {}, mailbox: null },
  gates: [], person: "alice", now: new Date("2026-10-19T08:00:00Z"), agentM: { version: "unreleased", commit: "a".repeat(40) }, jobId: null });
const rules = (findings) => findings.map((found) => [found.artifact, found.line, found.kind, found.rule]);

const HEADER = "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|";
const RESOURCES = `# Resources of this product\n\n**REGISTER**\n\nThe resources.\n\n${HEADER}\n`
  + "| translator | endpoint | https://api.example.org/v1 | — | — | — | runner:cpu | the vendor | yes | ci:TRANSLATOR_KEY |\n"
  + "| local-model | endpoint | http://localhost:11434/v1 | — | — | — | runner:cpu | this machine | no | — |\n";
const scheduleOf = (rows) => `---\nnightly: 02:00\n---\n## Levels\n\n| Row | every commit | pull request | nightly | release candidate | on demand | runs on |\n|---|---|---|---|---|---|---|\n${rows.join("\n")}\n`;
// A product schedule that runs `component` only on a pull request, `system` only nightly, and `unit` on every commit.
const SCHEDULE = scheduleOf([
  "| unit | ✓ | | ✓ | ✓ | ✓ | |", "| component | | ✓ | ✓ | ✓ | ✓ | |", "| system | | | ✓ | ✓ | ✓ | |", "| paid | | | ✓ | ✓ | ✓ | |",
  "| release | | | | ✓ | ✓ | |", "| user | | | | ✓ | ✓ | |",
]);
const CASE = { identifier: "TST-960", level: "unit", guards: ["A SELECTED RULE"], precondition: "a text", input: "translate it", expected: "translated", class: "new" };
const files = { "docs/resources.md": RESOURCES };

// TST-851101 · level: unit · module: MOD-result-records
// guards: COMMIT TESTS CALL NO PAID SERVICE; A FINDING READS LIKE A COMPILER MESSAGE; UC-026 (6)
// given: a product with docs/resources.md (translator paid, local-model free) and no saved schedule, so the default holds; a proposal of three cases: (1) level unit, paid "translator", (2) level unit, paid "local-model", (3) level unit, no paid
// input: the check test-proposals on the proposal
// expect: one error finding under COMMIT TESTS CALL NO PAID SERVICE, for case 1 (line 1, artifact TST-961), whose what names translator and the level unit and whose fix is not empty; none for cases 2 and 3
test("test-proposals — a unit case that reaches a paid service is an error under COMMIT TESTS CALL NO PAID SERVICE; a free service and no service are none", async () => {
  const found = await check({ cases: [{ ...CASE, identifier: "TST-961", paid: "translator" }, { ...CASE, identifier: "TST-962", paid: "local-model" }, { ...CASE, identifier: "TST-963" }] }, files);
  assert.deepEqual(rules(found), [["TST-961", 1, "error", RULE]]);
  assert.match(found[0].what, /translator/);
  assert.match(found[0].what, /unit/);
  assert.notEqual(found[0].fix, "");
});

// TST-851102 · level: unit · module: MOD-result-records
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-026 (6)
// given: the default schedule (none saved) and a paid service; four cases of the levels unit, component, system and release, each with paid "translator"
// input: the check test-proposals on the proposal
// expect: error findings for the unit (line 1), component (line 2) and system (line 3) cases, which the default runs on every commit; none for the release case (line 4), which it runs only on a release candidate and on demand
test("test-proposals — under the default schedule unit, component and system cases are commit-level and the release case is not", async () => {
  const paid = { ...CASE, paid: "translator" };
  const found = await check({ cases: [{ ...paid, identifier: "TST-971", level: "unit" }, { ...paid, identifier: "TST-972", level: "component" },
    { ...paid, identifier: "TST-973", level: "system" }, { ...paid, identifier: "TST-974", level: "release" }] }, files);
  assert.deepEqual(rules(found), [["TST-971", 1, "error", RULE], ["TST-972", 2, "error", RULE], ["TST-973", 3, "error", RULE]]);
});

// TST-851103 · level: unit · module: MOD-result-records
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-026 (6)
// given: a product whose docs/tests/schedule.md runs unit on every commit, component only on a pull request and system only nightly; three cases of those levels, each with paid "translator"
// input: the check test-proposals on the proposal
// expect: error findings for the unit case (line 1, every commit) and the component case (line 2, pull request); none for the system case (line 3), which runs only nightly and on a release candidate and on demand
test("test-proposals — the product's own schedule decides the commit-level: a pull request counts, a nightly-only level does not", async () => {
  const paid = { ...CASE, paid: "translator" };
  const found = await check({ cases: [{ ...paid, identifier: "TST-981", level: "unit" }, { ...paid, identifier: "TST-982", level: "component" },
    { ...paid, identifier: "TST-983", level: "system" }] }, { ...files, "docs/tests/schedule.md": SCHEDULE });
  assert.deepEqual(rules(found), [["TST-981", 1, "error", RULE], ["TST-982", 2, "error", RULE]]);
});

// TST-851104 · level: unit · module: MOD-result-records
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-026 (6)
// given: a product that holds no docs/resources.md; one case of level unit with paid "translator", and one of level unit with paid "nobody-lists-this" in a product whose resources do not name it
// input: the check test-proposals on each
// expect: no finding for either: a service that no resource lists is not one paidServices marks paid
test("test-proposals — a paid name that no resource of the product lists is no finding", async () => {
  assert.deepEqual(await check({ cases: [{ ...CASE, paid: "translator" }] }), []);
  assert.deepEqual(await check({ cases: [{ ...CASE, paid: "nobody-lists-this" }] }, files), []);
});

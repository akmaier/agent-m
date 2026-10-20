// When a row runs, and the secrets the schedule needs by name (ITM-743) — MOD-test-schedule's occasionsOf(row, schedule)
// and secretsNeeded(schedule, resources), as the accepted text of docs/architecture/MOD-test-schedule.md states them:
// the occasions on which a row runs, and the names — never the values — of the secrets of the paid services the ticked
// row paid calls.
// Run: node --test tests/test-schedule-occasions-secrets.test.mjs
//
// Module: MOD-test-schedule
// Guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; NO SECRET IN THE REPOSITORY
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). Nothing here sleeps,
// waits or reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { scheduleSchema, defaultSchedule, occasionsOf, secretsNeeded } from "../src/test-schedule/index.mjs";
import { readDocument } from "../src/documents/index.mjs";
import { resourceSchema } from "../src/resource-list/index.mjs";

const HEAD = "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |\n|---|---|---|---|---|---|---|";
const scheduleOf = (rows) => readDocument(scheduleSchema, "docs/tests/schedule.md", `---\nnightly: 02:00\n---\n## Levels\n\n${HEAD}\n${rows.join("\n")}\n`);

const RESOURCE_HEAD = "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|";
const ORACLE = "| oracle | endpoint | https://api.example.org/v1 | example-model | — | — | runner:cpu | the vendor | yes | ci:ORACLE_KEY |";
const FREE = "| local-llm | endpoint | http://gpu01:8000/v1 | example-model | — | — | runner:cpu | the group's server | no | ci:LOCAL_KEY |";
const BROWSERY = "| coder | agent | https://agent.example.org | example-model | — | Acme | runner:cpu | Acme | yes | browser |";
const LEAKY = "| leaky | endpoint | https://leaky.example.org | example-model | — | — | runner:cpu | the vendor | yes | sk-live-abc123def456 |";
const resourcesOf = (...rows) => readDocument(resourceSchema(), "docs/resources.md",
  `# Resources of this product\n\n**REGISTER**\n\nThe resources.\n\n${RESOURCE_HEAD}\n${rows.join("\n")}\n`);

// TST-743001 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-028
// given: the book's default schedule
// input: occasionsOf(row, defaultSchedule()) for each of the rows unit, component, system, paid, release and user
// expect: for each row exactly the occasions its row ticks: unit, component and system on every commit, pull request, nightly, release candidate and on demand; paid on nightly, release candidate and on demand; release and user on release candidate and on demand
test("occasionsOf — the default gives each row exactly its ticked columns", () => {
  const schedule = defaultSchedule();
  const all = ["every commit", "pull request", "nightly", "release candidate", "on demand"];
  for (const row of ["unit", "component", "system"]) assert.deepEqual(occasionsOf(row, schedule), all, row);
  assert.deepEqual(occasionsOf("paid", schedule), ["nightly", "release candidate", "on demand"]);
  assert.deepEqual(occasionsOf("release", schedule), ["release candidate", "on demand"]);
  assert.deepEqual(occasionsOf("user", schedule), ["release candidate", "on demand"]);
});

// TST-743002 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-029
// given: a schedule whose unit row ticks only pull request, whose system row ticks nothing, and whose other rows are the default
// input: occasionsOf("unit", schedule), occasionsOf("system", schedule) and occasionsOf("paid", schedule)
// expect: ["pull request"] for unit, [] for system, and the default's three occasions for paid
test("occasionsOf — a declared schedule is followed, and a row ticked nowhere runs on no occasion", () => {
  const schedule = scheduleOf([
    "| unit | | ✓ | | | |  |", "| component | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| system | | | | | | |",
    "| paid | | | ✓ | ✓ | ✓ | |", "| release | | | | ✓ | ✓ | |", "| user | | | | ✓ | ✓ | |"]);
  assert.deepEqual(occasionsOf("unit", schedule), ["pull request"]);
  assert.deepEqual(occasionsOf("system", schedule), []);
  assert.deepEqual(occasionsOf("paid", schedule), ["nightly", "release candidate", "on demand"]);
});

// TST-743003 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; NO SECRET IN THE REPOSITORY; UC-027
// given: the book's default schedule, which ticks the row paid; a resource list with a paid endpoint oracle whose Secret is ci:ORACLE_KEY, a free model endpoint local-llm whose Secret is ci:LOCAL_KEY, and a paid agent whose key is kept in a browser
// input: secretsNeeded(defaultSchedule(), resources)
// expect: exactly [{ name: "ORACLE_KEY", for: "oracle" }, { name: "LOCAL_KEY", for: "local-llm" }] — the row paid is the tests that call a paid service or a model, so a model endpoint counts as well; the agent whose key is in a browser gives none
test("secretsNeeded — names the secret of each endpoint the ticked row paid calls", () => {
  assert.deepEqual(secretsNeeded(defaultSchedule(), resourcesOf(ORACLE, FREE, BROWSERY)),
    [{ name: "ORACLE_KEY", for: "oracle" }, { name: "LOCAL_KEY", for: "local-llm" }]);
});

// TST-743004 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: a schedule whose row paid is ticked on no occasion; the resource list with the paid endpoint oracle
// input: secretsNeeded(schedule, resources)
// expect: [] — no secret is needed for a row that is not ticked on any occasion
test("secretsNeeded — nothing for a row ticked on no occasion", () => {
  const schedule = scheduleOf([
    "| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| component | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| system | ✓ | ✓ | ✓ | ✓ | ✓ | |",
    "| paid | | | | | | |", "| release | | | | ✓ | ✓ | |", "| user | | | | ✓ | ✓ | |"]);
  assert.deepEqual(secretsNeeded(schedule, resourcesOf(ORACLE, FREE)), []);
});

// TST-743005 · level: unit · module: MOD-test-schedule
// guards: NO SECRET IN THE REPOSITORY; UC-027
// given: the default schedule; a resource list whose paid endpoint oracle names ci:ORACLE_KEY and whose paid endpoint leaky holds a value, sk-live-abc123def456, where a name belongs; a fixture store that holds ORACLE_KEY = sk-live-store-7788
// input: secretsNeeded(defaultSchedule(), resources), serialised
// expect: the names only — ORACLE_KEY for oracle; neither the value in the list nor the value in the store appears anywhere in the result
test("secretsNeeded — never a value", () => {
  const store = { ORACLE_KEY: "sk-live-store-7788" };
  const needed = secretsNeeded(defaultSchedule(), resourcesOf(ORACLE, LEAKY));
  const text = JSON.stringify(needed);
  assert.deepEqual(needed, [{ name: "ORACLE_KEY", for: "oracle" }]);
  assert.ok(!text.includes(store.ORACLE_KEY), text);
  assert.ok(!text.includes("sk-live-abc123def456"), text);
});

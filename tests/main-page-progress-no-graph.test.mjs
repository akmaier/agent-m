// MOD-progress-measures' productFacts, scope `all`, builds no trace graph: no reader of Facts.graph exists, so the files only the graph
// read — the use cases, the architecture decisions — are no longer read for a page load (A PAGE LOAD READS THE REPOSITORY IN BATCHES:
// "the texts of the files it shows in requests of at most 100 files each"). The tests it needs — the declarations of the test files — are
// read without the graph. Facts.graph stays a field of the structure and is "unknown" in both scopes (the module's Facts: `graph: Graph |
// "unknown"`). The counts are taken through the real MOD-repository-hosts host over the counting fake of GitHub of
// tests/progress-measures-load.mjs; the callers of productFacts' scope `all` — MOD-main-page's route home, and MOD-progress-measures' own
// stageShares, currentStage, buildInProgress and waitingForAPerson — are shown to run on the new value.
// Run: node --test tests/main-page-progress-no-graph.test.mjs
//
// Module: MOD-progress-measures
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// Level: unit
//
// Each test states its input and its expected values in its own text (given / input / expect); no expected value is read from a document.
// Nothing reaches the network: `fetch` is the fake for every test and is put back when the test ends. The counter-proofs are recorded in
// the pull request.

import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { buildInProgress, currentStage, productFacts, stageShares, waitingForAPerson } from "../src/progress-measures/index.mjs";
import { view } from "../src/main-page/index.mjs";
import { INSTANCE, PRODUCT, githubServer, hosts, instanceFiles, productFiles, summary } from "./progress-measures-load.mjs";
import {
  INSTANCE as HOME_INSTANCE, PRODUCT as HOME_PRODUCT, browser, byClass, cardsOf, draw, instanceFiles as homeInstanceFiles, network, smallProduct, stagesOf, timers,
} from "./main-page-home-harness.mjs";

const NOW = new Date("2026-10-17T12:00:00Z");
let server;

// 250 use cases, no other file of the product reads them: only the trace graph did.
const USE_CASES = 250;
const useCasePath = (n) => `docs/use-cases/UC-${String(n).padStart(3, "0")}-case.md`;
const useCases = () => Object.fromEntries(Array.from({ length: USE_CASES }, (_, i) => [useCasePath(i + 1),
  `---\nid: UC-${String(i + 1).padStart(3, "0")}\ntitle: Case ${i + 1}\narea: fixture\nactors:\n  - Reader\nrealises:\n  - FIRST RULE\n---\n# Case ${i + 1}\n`]));

const TEST_FILE = (id, guards) => [`// ${id} · level: unit · module: MOD-store`, `// guards: ${guards}`, "// given: a store", "// input: a read", "// expect: its text",
  "test(\"a store reads\", () => {});", ""].join("\n");

const files = (extra = {}) => ({ ...productFiles({ items: 600, jobs: 400 }), ...useCases(), ...extra });

beforeEach(() => {
  server = githubServer({ [PRODUCT]: files(), [INSTANCE]: instanceFiles() });
  server.install();
});
afterEach(() => server.restore());

async function facts(scope, token) {
  const { host, instance, instanceAt } = await hosts(server, { token });
  const result = await productFacts(host, instance, instanceAt, NOW, { scope });
  return { result, seen: summary(server.log) };
}

const hundreds = (n) => Array.from({ length: n }, () => 100);
const bySize = (sizes) => [...sizes].sort((a, b) => b - a);

// TST-873001 · level: unit · module: MOD-progress-measures
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a product of 600 backlog items, 400 job records, SPEC.md, one test file and 250 use cases; an instance holding its participant list; a token
// input: productFacts(…, { scope: "all" })
// expect: 19 requests in all, as for the product without use cases (TST-826001) — the repository 1, the commits 2, the tree 1, the pull requests 1, the tags 1, 13 batch requests: 100 files ten times and 1 file three times; none of the 250 use cases is read
test("productFacts, scope all, with a token — 250 use cases nothing but the trace graph read are not read: 19 requests in all, as without them", async () => {
  const { seen } = await facts("all", true);
  assert.deepEqual(seen.allFiles.filter((path) => path.startsWith("docs/use-cases/")), []);
  assert.equal(seen.total, 20);
  assert.deepEqual(seen.kinds, { repository: 1, commit: 2, tree: 1, "pull requests": 1, tags: 1, batch: 13, file: 1 });
  assert.deepEqual(bySize(seen.batches), [...hundreds(10), 1, 1, 1]);
  assert.deepEqual(seen.singles.map((path) => path.replace(/^[0-9a-f]{40}/, "<commit>")), ["<commit>.facts.json"], "the one file read by its own request is the stored facts' (none is stored here)");
});

// TST-873002 · level: unit · module: MOD-progress-measures
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the product and instance of TST-873001; no token, so that every file is read by a request of its own
// input: productFacts(…, { scope: "all" })
// expect: 1,009 requests in all — the repository 1, the commit 2 (main and test-results), the tree 1, the pull requests 1, the tags 1, and 1,003 files each by a request of its own (the 600 items, the 400 job records, SPEC.md, the test file and the instance's participant list); no use case is read
test("productFacts, scope all, without a token — the 250 use cases are not read, 1,009 requests in all", async () => {
  const { seen } = await facts("all", false);
  assert.equal(seen.singles.filter((path) => path.startsWith("docs/use-cases/")).length, 0);
  assert.equal(seen.total, 1010);
  assert.deepEqual(seen.kinds, { repository: 1, commit: 2, tree: 1, "pull requests": 1, tags: 1, file: 1004 });
});

// TST-873003 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: a product whose tests/unit.test.mjs declares TST-001, tests/second.test.mjs declares TST-002 and TST-003, tests/empty.test.mjs declares nothing, docs/notes.md names a TST-004 in prose, and src/store.mjs, which is no test file, holds a comment declaring TST-005; a token
// input: productFacts(…, { scope: "all" })
// expect: graph is "unknown"; tests are, in the alphabetical order of the paths, [TST-002 at tests/second.test.mjs, TST-003 at tests/second.test.mjs, TST-001 at tests/unit.test.mjs]; requirements ["FIRST RULE", "SECOND RULE"]
test("productFacts, scope all — graph is \"unknown\", and the tests are the declarations of the test files, read without the graph", async () => {
  server.restore();
  server = githubServer({ [PRODUCT]: files({ "tests/second.test.mjs": `${TEST_FILE("TST-002", "FIRST RULE")}${TEST_FILE("TST-003", "SECOND RULE")}`,
    "tests/empty.test.mjs": "test(\"nothing declared\", () => {});\n", "docs/notes.md": "TST-004 is only named here.\n",
    "src/store.mjs": TEST_FILE("TST-005", "FIRST RULE") }), [INSTANCE]: instanceFiles() });
  server.install();
  const { result } = await facts("all", true);
  assert.equal(result.graph, "unknown");
  assert.deepEqual(result.tests.map((t) => [t.id, t.path]), [["TST-002", "tests/second.test.mjs"], ["TST-003", "tests/second.test.mjs"], ["TST-001", "tests/unit.test.mjs"]]);
  assert.deepEqual(result.requirements, ["FIRST RULE", "SECOND RULE"]);
});

// TST-873004 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: the facts of the product of TST-873001 read with the scope all (so that graph is "unknown"); a token — the callers of productFacts' scope all read them: stageShares, currentStage, buildInProgress and waitingForAPerson
// input: stageShares(facts), currentStage of that, buildInProgress(facts), waitingForAPerson(facts)
// expect: graph is "unknown"; the six stages in their order — Requirements 1 "2 requirements, no change open", Use cases 0 "0 of 250 accepted", Architecture 0 "not designed yet", Implementation null "the process is configured when implementation starts", Tests 0 "0 of 2 requirements guarded by a passing test", Release 0 "no release yet"; the current stage is Use cases; the build has ITM-0001 queued; what waits for a person is the 250 open use cases and nothing else
test("the callers of productFacts' scope all — stageShares, currentStage, buildInProgress and waitingForAPerson — run on facts whose graph is \"unknown\"", async () => {
  const { result } = await facts("all", true);
  assert.equal(result.graph, "unknown");
  const shares = await stageShares(result);
  assert.deepEqual(shares.map((s) => [s.stage, s.share, s.detail]), [
    ["Requirements", 1, "2 requirements, no change open"], ["Use cases", 0, "0 of 250 accepted"], ["Architecture", 0, "not designed yet"],
    ["Implementation", null, "the process is configured when implementation starts"], ["Tests", 0, "0 of 2 requirements guarded by a passing test"], ["Release", 0, "no release yet"],
  ]);
  assert.equal(currentStage(shares), "Use cases");
  assert.deepEqual(buildInProgress(result), [{ item: "ITM-0001", job: "JOB-20261014-0900-0001", participant: null, state: "queued", elapsed: 0, reachable: true }]);
  const waits = waitingForAPerson(result);
  assert.equal(waits.length, USE_CASES);
  assert.deepEqual([...new Set(waits.map((w) => w.kind))], ["use case"]);
});

// TST-873005 · level: unit · module: MOD-main-page
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE
// given: this browser keeps alice/product of two requirements, a test file, two use cases of which UC-001 is accepted, one backlog item, no process model (the product of TST-827002), with a token for it and one for the instance
// input: the route home drawn — the caller of productFacts' scope all — and the paths the fake GitHub was asked for read
// expect: the card shows the stages of TST-827002 (Use cases 50 % "1 of 2 accepted", …) and neither use case file is read from the product (docs/use-cases/UC-001-first.md, docs/use-cases/UC-002-second.md); the test file is read
test("MOD-main-page's route home, a caller of productFacts' scope all, draws its stages and reads no use case file for a graph", async () => {
  const net = network({ [HOME_PRODUCT]: smallProduct(), [HOME_INSTANCE]: homeInstanceFiles() });
  try {
    net.install();
    const home = view.routes.find((candidate) => candidate.name === "home");
    const [card] = cardsOf(await draw(home, browser()));
    assert.deepEqual(stagesOf(card)[1], ["Use cases", "50 %", "1 of 2 accepted"]);
    const read = net.server.log.flatMap((entry) => entry.files);
    assert.deepEqual(read.filter((path) => path.startsWith("docs/use-cases/")), []);
    assert.ok(read.includes("tests/unit.test.mjs"), "the test file is read");
    assert.equal(byClass(card, "card-head").length, 1);
  } finally {
    net.restore();
    timers.restore();
  }
});

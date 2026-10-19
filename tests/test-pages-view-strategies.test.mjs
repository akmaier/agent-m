// The strategies the view of MOD-test-pages hands the frame are enough to prepare the jobs its routes start (ITM-1083): the route `generate` prepares a job of the
// kind `propose-tests` (recipe `chapters-for-tests`, MOD-source-register's) and, from the proposal, one of the kind `write-tests` (recipe `resource-pins`,
// MOD-resource-list's). docs/architecture/MOD-test-pages.md:104-108 names `sourceStrategies` and `resourceStrategies` among the strategies its view hands.
// Run: node --test tests/test-pages-view-strategies.test.mjs
//
// Module: MOD-test-pages
// Guards: UC-026; A TEST JOB RECEIVES THE CHAPTER ON TESTING
// Level: unit
//
// Only the strategies of the view are registered, as the frame does with the view alone on the page; the real MOD-job-runner and MOD-job-catalogue run as they are.
// The product is a snapshot of a SPEC; the instance's snapshot gives the book from the disk. No request leaves the process. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { view } = await import("../src/test-pages/index.mjs");
const { registerStrategies, prepareJob } = await import("../src/job-runner/index.mjs");
const { kindOf } = await import("../src/job-catalogue/index.mjs");
view.strategies.forEach((strategies, at) => registerStrategies(`tests/test-pages-view-strategies.test.mjs#${at}`, strategies));

const ROOT = new URL("../", import.meta.url);
const onDisk = (path) => { try { return readFileSync(new URL(path, ROOT), "utf8"); } catch { return null; } };
const SPEC = "# Product — Specification\n\n## Section\n\n**RULE ONE** *(Product Owner)*\nOne rule.\n*Check:* `tests/a.test.mjs`\n";
const REGISTER_HEAD = onDisk("docs/participants.md").split("\n").filter((line, at, all) => at <= all.findIndex((each) => each.startsWith("|---"))).join("\n");
const NEEDS = "read the repository, write to the repository, run code and tests";
const WRITER = { name: "ci-writer", type: "CI agent", model: "model-x", context: 200000, capabilities: NEEDS.split(", "), place: "GitHub Actions in the USA", route: "ci hosted secret CI_KEY" };

const files = { "SPEC.md": SPEC, "tests/a.test.mjs": "// no declaration\n", "docs/resources.md": null };
const product = { address: "https://github.com/alice/product", host: {}, snapshot: { repository: { web: "https://github.com/alice/product" }, commit: "a".repeat(40),
  paths: ["SPEC.md", "tests/a.test.mjs"], read: async (path) => files[path] ?? null, blob: () => "b".repeat(40) } };
const instance = { host: {}, checkout: null, snapshot: { repository: { path: "alice/agent-m", web: "https://github.com/alice/agent-m" }, commit: "c".repeat(40), paths: [],
  read: async (path) => onDisk(path), blob: () => null } };

async function prepared(kindName, params) {
  const kind = await kindOf(kindName);
  const now = new Date("2026-10-19T10:00:00Z");
  return prepareJob(kindName, { kind, params, product, instance, connect: async () => product.host, participants: [WRITER], places: { sources: {}, mailbox: null }, gates: [],
    person: "alice", now, agentM: { version: "2026.10.0", commit: "abc" }, jobId: "JOB-20261019-1000-abcd" }, { drafter: WRITER, reviewers: [] });
}
const SELECTION = { requirements: ["RULE ONE"], useCases: [], modules: [], levels: ["release"] };

// TST-1083001 · level: unit · module: MOD-test-pages
// guards: UC-026; A TEST JOB RECEIVES THE CHAPTER ON TESTING
// given: only the strategies of the view of MOD-test-pages are registered; a product whose SPEC holds the requirement RULE ONE
// input: prepareJob for the kind propose-tests, selecting RULE ONE at the level release
// expect: the job is prepared, and among its parts are the selection and chapter 13 of the book
test("view — its strategies prepare a job of the kind propose-tests, with the chapter on testing", async () => {
  const job = await prepared("propose-tests", SELECTION);
  const names = job.parts.map((part) => part.name);
  assert.ok(names.includes("test-selection"), names.join(" | "));
  assert.ok(names.some((name) => /^13_software-testing\.md/.test(name)), `the chapter on testing: ${names.join(" | ")}`);
  assert.deepEqual(job.blocking, []);
});

// TST-1083002 · level: unit · module: MOD-test-pages
// guards: UC-026
// given: the same registration, a product that lists no resources
// input: prepareJob for the kind write-tests with the cases of a proposal as its draft and the route ci hosted
// expect: the job is prepared: the writer branch-and-pull-request and the recipe resource-pins are among what the view hands; its parts hold the draft
test("view — its strategies prepare a job of the kind write-tests, with the cases as its draft", async () => {
  const job = await prepared("write-tests", { ...SELECTION, route: "ci hosted", draft: { cases: [{ identifier: "TST-1", level: "release", guards: ["RULE ONE"], precondition: "p", input: "i", expected: "e", class: "new" }] } });
  const names = job.parts.map((part) => part.name);
  assert.ok(names.includes("draft"), names.join(" | "));
  assert.deepEqual(job.blocking, []);
});

// TST-1083003 · level: unit · module: MOD-test-pages
// guards: UC-026
// given: the view of the module
// input: its strategies
// expect: they hold the recipes chapters-for-tests and resource-pins, besides test-selection, and the writer branch-and-pull-request
test("view — hands the recipes chapters-for-tests and resource-pins", () => {
  const names = (category) => view.strategies.flatMap((strategies) => Object.keys(strategies[category] ?? {}));
  for (const recipe of ["chapters-for-tests", "resource-pins", "test-selection"]) assert.ok(names("recipes").includes(recipe), recipe);
  assert.ok(names("writers").includes("branch-and-pull-request"));
});

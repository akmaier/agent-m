// The review pages reach an endpoint only through what their text names (ITM-1115) — MOD-review-pages' `uses:` names MOD-runtimes' `runOnTab` and MOD-job-runner's `prepareJob`, `writeResult` and
// `provenanceLines`; it names neither MOD-endpoint-calls' `endpointDriver` nor MOD-job-runner's `runJob`. `runOnTab` builds the drivers of a job that runs in the tab (MOD-runtimes: "an endpoint's driver
// from its configuration, `endpointDriver` where its `bridge` is `null`") and, with its hook `from`, runs a draft a person changed as a whole once more (UC-022, UC-023), which is what the page's
// *Check this edit* does.
// Run: node --test tests/review-pages-reach-endpoints-through-runtimes.test.mjs
//
// Module: MOD-review-pages
// Guards: DEVELOP AGAINST INTERFACES; UC-022; UC-023
// Level: unit
//
// The reading the test takes, which the pull request names: "the review pages build no endpoint driver of their own" is read from the import lines of the files of src/review-pages/ — none imports
// `endpointDriver` or a module of MOD-endpoint-calls, and none names `runJob` among the names it takes from MOD-job-runner. The behaviour of *Check this edit* is that of tests/review-pages-draft-architecture.test.mjs
// ("Check this edit runs the whole draft again") and the hook is tested in tests/runtimes-tab.test.mjs. Each test states its input and its expected result before it runs (given / input / expect).
// The counter-proof is run as a mutation and recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const FOLDER = new URL("../src/review-pages/", import.meta.url);
const files = readdirSync(FOLDER).filter((name) => name.endsWith(".mjs")).map((name) => ({ name, text: readFileSync(new URL(name, FOLDER), "utf8") }));
// The import declarations of a source text: { names, from }.
const importsOf = (text) => [...text.matchAll(/^import\s+(?:\{([^}]*)\}|\*\s+as\s+(\w+)|(\w+))\s+from\s+"([^"]+)";/gm)]
  .map((match) => ({ names: (match[1] ?? match[2] ?? match[3]).split(",").map((name) => name.trim().split(/\s+as\s+/)[0]).filter(Boolean), from: match[4] }));

// TST-111502 · level: unit · module: MOD-review-pages
// guards: DEVELOP AGAINST INTERFACES
// given: the files of src/review-pages/
// input: their import declarations
// expect: known positive — jobs.mjs imports runOnTab from the runtimes and prepareJob from the job runner; no file imports from MOD-endpoint-calls, and no file takes runJob from the job runner
test("the review pages build no endpoint driver of their own and run no job but through runOnTab", () => {
  const imports = files.map(({ name, text }) => ({ name, imports: importsOf(text) }));
  const jobs = imports.find(({ name }) => name === "jobs.mjs").imports;
  assert.ok(jobs.some(({ names, from }) => from === "../runtimes/index.mjs" && names.includes("runOnTab")), "known positive: jobs.mjs imports runOnTab");
  assert.ok(jobs.some(({ names, from }) => from === "../job-runner/index.mjs" && names.includes("prepareJob")), "known positive: jobs.mjs imports prepareJob");
  const endpointCalls = imports.flatMap(({ name, imports: each }) => each.filter(({ from }) => /endpoint-calls/.test(from)).map(() => name));
  assert.deepEqual(endpointCalls, [], "no file imports MOD-endpoint-calls");
  const runJobs = imports.flatMap(({ name, imports: each }) => each.filter(({ from, names }) => /job-runner/.test(from) && names.includes("runJob")).map(() => name));
  assert.deepEqual(runJobs, [], "no file takes runJob from MOD-job-runner");
});

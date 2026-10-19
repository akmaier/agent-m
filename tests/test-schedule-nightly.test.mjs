// The nightly run builds the real Linux Bridge (ITM-1095): `.github/workflows/nightly.yml` — MOD-test-schedule's file, named in its Parts
// (docs/architecture/MOD-test-schedule.md, "Taken over, outside this folder") — holds one job on a Linux runner that runs TST-961006
// of tests/bridge-build-build-platform.test.mjs with BRIDGE_BUILD_REAL=1 under xvfb-run, and carries its own timeout, longer than the two
// minutes of a pull request's jobs (SPEC.md, A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES), since no pull request starts it.
// Run: node --test tests/test-schedule-nightly.test.mjs
//
// Module: MOD-test-schedule
// Guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES; THE TEST SCHEDULE IS DECLARED PER PRODUCT; THE BRIDGE IS ONE FILE PER PLATFORM
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The workflow is read as text: a job is the
// block under `jobs:` at two spaces of indentation. Nothing is started. The counter-proofs are recorded in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../.github/workflows/${path}`, import.meta.url), "utf8");

// The jobs of a workflow by name, each as its text: the keys at two spaces below `jobs:`.
function jobsOf(text) {
  const body = text.slice(text.indexOf("\njobs:\n") + 7);
  const keys = [...body.matchAll(/^ {2}([A-Za-z0-9_-]+):\s*$/gm)];
  return Object.fromEntries(keys.map((key, i) => [key[1], body.slice(key.index, keys[i + 1]?.index ?? body.length)]));
}
// The job that runs the real build: the one whose text names the test file.
const realBuild = () => Object.entries(jobsOf(read("nightly.yml"))).filter(([, job]) => job.includes("bridge-build-build-platform.test.mjs"));

// TST-1095001 · level: unit · module: MOD-test-schedule
// guards: THE BRIDGE IS ONE FILE PER PLATFORM; THE TEST SCHEDULE IS DECLARED PER PRODUCT
// given: .github/workflows/nightly.yml
// input: the jobs under `jobs:`
// expect: exactly one job runs tests/bridge-build-build-platform.test.mjs; it runs on ubuntu-latest, installs xvfb, installs the Bridge app's packages with `npm install --prefix src/bridge-build --omit=dev --ignore-scripts`, and runs the test with BRIDGE_BUILD_REAL=1 under xvfb-run
// Planted fault: removing the job, dropping the variable, or running the test without xvfb-run fails one assertion.
test("nightly.yml has one Linux job that runs the real Bridge build under xvfb with BRIDGE_BUILD_REAL=1", () => {
  const found = realBuild();
  assert.equal(found.length, 1, "exactly one job runs tests/bridge-build-build-platform.test.mjs");
  const [, job] = found[0];
  assert.match(job, /runs-on:\s*ubuntu-latest/);
  assert.match(job, /apt-get install[^\n]*\bxvfb\b/);
  assert.match(job, /npm install --prefix src\/bridge-build --omit=dev --ignore-scripts/);
  assert.match(job, /BRIDGE_BUILD_REAL=1[^\n]*xvfb-run[^\n]*node --test[^\n]*tests\/bridge-build-build-platform\.test\.mjs|xvfb-run[^\n]*BRIDGE_BUILD_REAL=1[^\n]*node --test[^\n]*tests\/bridge-build-build-platform\.test\.mjs/);
});

// TST-1095002 · level: unit · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/nightly.yml
// input: the timeout of the job that runs the real build
// expect: it carries `timeout-minutes` with a whole number above 2 and at most 60
// Planted fault: a job without a timeout, or with 2, fails; so does one that may run for hours.
test("the job of the real Bridge build carries its own timeout, longer than two minutes", () => {
  const [[, job]] = realBuild();
  const minutes = /^\s+timeout-minutes:\s*(\d+)\s*$/m.exec(job)?.[1];
  assert.ok(minutes, "the job names timeout-minutes");
  assert.ok(Number(minutes) > 2 && Number(minutes) <= 60, `timeout-minutes ${minutes} is above 2 and at most 60`);
});

// TST-1095003 · level: unit · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml, which a pull request starts, and nightly.yml
// input: the text of each
// expect: tests.yml names neither BRIDGE_BUILD_REAL nor the xvfb-run of the real build, so no pull request runs it; nightly.yml does not start on a pull request
// Planted fault: moving the job into tests.yml, or adding a pull_request trigger to nightly.yml, fails.
test("no pull request runs the real Bridge build", () => {
  assert.doesNotMatch(read("tests.yml"), /BRIDGE_BUILD_REAL/);
  assert.doesNotMatch(read("nightly.yml").split("\njobs:\n")[0], /^\s*pull_request\s*:/m);
});

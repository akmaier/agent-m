// CI installs xvfb and openbox once, before the tests (ITM-1179): `.github/workflows/tests.yml` and `nightly.yml` — MOD-test-schedule's
// files, named in its Parts (docs/architecture/MOD-test-schedule.md, "Taken over, outside this folder") — hold, in the job that runs the
// node tests, one step that installs xvfb and openbox, with apt's retries and the dpkg lock wait, from an actions/cache of the downloaded
// archives, so that the tests which start Electron under a window manager find openbox and install nothing on CI
// (SPEC.md, A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES).
// Run: node --test tests/test-schedule-openbox.test.mjs
//
// Module: MOD-test-schedule
// Guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). A workflow is read as text: a job is the block
// under `jobs:` at two spaces of indentation, a step the block at six spaces that starts with `- `. Nothing is started. The counter-proofs
// are recorded in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../.github/workflows/${path}`, import.meta.url), "utf8");

// The steps of one job of a workflow text, each as its text, in order; [] when the job is missing.
function stepsOf(text, jobName) {
  const body = text.slice(text.indexOf("\njobs:\n") + 7);
  const keys = [...body.matchAll(/^ {2}([A-Za-z0-9_-]+):\s*$/gm)];
  const at = keys.findIndex((key) => key[1] === jobName);
  if (at < 0) return [];
  const job = body.slice(keys[at].index, keys[at + 1]?.index ?? body.length);
  const starts = [...job.matchAll(/^ {6}- /gm)];
  return starts.map((start, i) => job.slice(start.index, starts[i + 1]?.index ?? job.length));
}
const indexOfStep = (steps, pattern) => steps.findIndex((step) => pattern.test(step));
// The paths a cache step names: one after `path:`, or the lines of a block under `path: |`.
const pathsOf = (step) => {
  const block = /^\s+path:\s*\|\s*\n((?:\s+\/\S+\n?)+)/m.exec(step);
  if (block) return block[1].split("\n").map((line) => line.trim()).filter(Boolean);
  const one = /^\s+path:\s*(\S+)\s*$/m.exec(step)?.[1];
  return one ? [one] : [];
};
const INSTALL = /apt-get[^\n]*install[^\n]*\bxvfb\b[^\n]*\bopenbox\b|apt-get[^\n]*install[^\n]*\bopenbox\b[^\n]*\bxvfb\b/;

// TST-1179001 · level: unit · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml
// input: the steps of the job `node`
// expect: one step runs `apt-get install` of xvfb and openbox with `Acquire::Retries` and `DPkg::Lock::Timeout`, and stands before the step that runs the tests (`node --test`)
// Planted fault: removing the step, dropping either option, or moving the step behind the tests fails one assertion.
test("tests.yml: the node job installs xvfb and openbox, with retries and the lock wait, before the tests", () => {
  const steps = stepsOf(read("tests.yml"), "node");
  const install = indexOfStep(steps, INSTALL);
  assert.ok(install >= 0, "a step installs xvfb and openbox");
  assert.match(steps[install], /Acquire::Retries=\d+/);
  assert.match(steps[install], /DPkg::Lock::Timeout=\d+/);
  const tests = indexOfStep(steps, /node --test/);
  assert.ok(tests > install, "the install step stands before the step that runs the tests");
});

// TST-1179002 · level: unit · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml
// input: the steps of the job `node`
// expect: the install step takes its packages from an actions/cache step that stands before it, whose path is the directory the install step names as apt's archives (`Dir::Cache::archives`)
// Planted fault: an install step without the cache step before it, or a cache path that is not apt's archive directory, fails.
test("tests.yml: the packages come from an actions/cache of the downloaded archives", () => {
  const steps = stepsOf(read("tests.yml"), "node");
  const install = indexOfStep(steps, INSTALL);
  const cache = indexOfStep(steps, /uses:\s*actions\/cache@/);
  assert.ok(cache >= 0 && cache < install, "an actions/cache step stands before the install step");
  const archives = /Dir::Cache::archives=([^\s"']+)/.exec(steps[install])?.[1];
  const lists = /Dir::State::lists=([^\s"']+)/.exec(steps[install])?.[1];
  assert.ok(archives, "the install step names the directory of apt's archives");
  assert.ok(lists, "the install step names the directory of apt's package lists");
  assert.deepEqual(pathsOf(steps[cache]).sort(), [archives, lists].sort(), "the cached paths are apt's archive and list directories");
});

// TST-1179003 · level: unit · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/nightly.yml
// input: the steps of the job `nightly`, which runs the release tests of the node suite
// expect: the same install step, preceded by the same kind of actions/cache step, stands before the step that runs `node --test`
// Planted fault: leaving the nightly job without the step, or behind its tests, fails.
test("nightly.yml: the job that runs the node tests installs xvfb and openbox the same way, before them", () => {
  const steps = stepsOf(read("nightly.yml"), "nightly");
  const install = indexOfStep(steps, INSTALL);
  assert.ok(install >= 0, "a step installs xvfb and openbox");
  assert.match(steps[install], /Acquire::Retries=\d+/);
  assert.match(steps[install], /DPkg::Lock::Timeout=\d+/);
  const cache = indexOfStep(steps, /uses:\s*actions\/cache@/);
  assert.ok(cache >= 0 && cache < install, "an actions/cache step stands before the install step");
  assert.ok(indexOfStep(steps, /node --test/) > install, "the install step stands before the step that runs the tests");
});

// TST-1179004 · level: unit · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml
// input: the job `node` and its limit
// expect: the job keeps `timeout-minutes: 2` on the job itself, with the install step inside it
// Planted fault: a longer limit on the job, or the install step in a job of its own, fails.
test("tests.yml: the install step counts against the two minutes of the node job", () => {
  const text = read("tests.yml");
  const body = text.slice(text.indexOf("\n  node:\n"));
  assert.match(body, /^ {4}timeout-minutes:\s*2\s*$/m);
  assert.ok(INSTALL.test(body), "the install step is in the node job");
});

// TST-1179005 · level: unit · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml
// input: the job `apt-archives` and the job `node`
// expect: `apt-archives` carries `timeout-minutes: 2`, has an actions/cache step whose path is apt's archive directory before a step that runs `apt-get install --download-only` of xvfb and openbox with `Acquire::Retries`, and the job `node` lists it under `needs`, so that the sixteen shards do not each download the packages from the mirror
// Planted fault: dropping the job, its limit, `--download-only`, the cache step, or the `needs` line fails one assertion.
test("tests.yml: one job downloads the archives into the cache, and the node shards wait for it", () => {
  const text = read("tests.yml");
  assert.ok(text.includes("\n  apt-archives:\n"), "a job apt-archives exists");
  const body = text.slice(text.indexOf("\n  apt-archives:\n"));
  const end = body.indexOf("\n  node:\n");
  const job = end > 0 ? body.slice(0, end) : body;
  assert.match(job, /^ {4}timeout-minutes:\s*2\s*$/m);
  const steps = stepsOf(text, "apt-archives");
  const download = steps.findIndex((step) => /apt-get[^\n]*install[^\n]*--download-only[^\n]*\bxvfb\b[^\n]*\bopenbox\b/.test(step));
  assert.ok(download >= 0, "a step downloads xvfb and openbox without installing them");
  assert.match(steps[download], /Acquire::Retries=\d+/);
  const cache = indexOfStep(steps, /uses:\s*actions\/cache@/);
  assert.ok(cache >= 0 && cache < download, "an actions/cache step stands before the download");
  const archives = /Dir::Cache::archives=([^\s"']+)/.exec(steps[download])?.[1];
  const lists = /Dir::State::lists=([^\s"']+)/.exec(steps[download])?.[1];
  assert.deepEqual(pathsOf(steps[cache]).sort(), [archives, lists].sort(), "the cached paths are apt's archive and list directories");
  const node = text.slice(text.indexOf("\n  node:\n"));
  assert.match(node, /^ {4}needs:\s*(apt-archives|\[\s*apt-archives\s*\])\s*$/m);
});

// TST-1179006 · level: unit · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml and nightly.yml
// input: the step that downloads xvfb and openbox in the job `apt-archives` and in the job `nightly`
// expect: the first download is bounded by `timeout` of at most 60 s (the mirror azure.archive.ubuntu.com sometimes sends one file so slowly that apt neither fails nor moves on to the next mirror), and when it fails the step makes archive.ubuntu.com the mirror in /etc/apt/apt-mirrors.txt and downloads again; `Acquire::Retries` is at most 1
// Planted fault: a download without `timeout`, without the switch of the mirror, or with `Acquire::Retries=5`, fails.
test("the download of xvfb and openbox is bounded, and a stalled mirror gives way to archive.ubuntu.com", () => {
  for (const [file, job] of [["tests.yml", "apt-archives"], ["nightly.yml", "nightly"]]) {
    const steps = stepsOf(read(file), job);
    const download = steps.find((step) => /apt-get[^\n]*install[^\n]*--download-only|apt-get[^\n]*install[^\n]*\bxvfb\b/.test(step));
    assert.ok(download, `${file}: a step downloads xvfb and openbox`);
    const limit = Number(/\btimeout\s+(\d+)\s+apt-get/.exec(download)?.[1] ?? /sudo\s+timeout\s+(\d+)/.exec(download)?.[1]);
    assert.ok(limit > 0 && limit <= 60, `${file}: the first download is bounded by timeout of at most 60 s`);
    assert.match(download, /archive\.ubuntu\.com\/ubuntu\/?[^\n]*\/etc\/apt\/apt-mirrors\.txt/, `${file}: the next mirror is written to apt-mirrors.txt after a failure`);
    assert.ok(Number(/Acquire::Retries=(\d+)/.exec(download)?.[1]) <= 1, `${file}: Acquire::Retries is at most 1`);
  }
});

// TST-1184003 · level: unit · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml
// input: the install step of the job `node`
// expect: it installs from the cached archives and package lists with `--no-download`, with no `apt-get update` before that install; an `update` may stand only after it, for the case that the cache is gone. The job `apt-archives` runs the one `update`, into the listed directory
// Planted fault: an `apt-get update` before the first install in the node job, or the install without `--no-download`, fails; so does an `apt-archives` job that runs no update.
test("tests.yml: a node shard installs from the cache without an apt-get update", () => {
  const text = read("tests.yml");
  const node = stepsOf(text, "node");
  const install = node.find((step) => INSTALL.test(step));
  assert.ok(install, "the node job installs xvfb and openbox");
  const first = install.search(/apt-get[^\n]*install/);
  assert.match(install.slice(first).split("\n")[0], /--no-download/, "the first install fetches nothing");
  const update = install.search(/apt-get[^\n]*\bupdate\b/);
  assert.ok(update < 0 || update > first, "no apt-get update stands before the first install");
  const seed = stepsOf(text, "apt-archives").find((step) => /--download-only/.test(step));
  assert.match(seed, /apt-get[^\n]*\bupdate\b/, "the job apt-archives runs the update");
});

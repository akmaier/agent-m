// The node shards of the pull-request CI keep the test files that need the controlled Electron apart (ITM-945): the partition that
// .github/workflows/tests.yml writes as level.mjs in its node job and runs once per shard puts no two of those files into one shard,
// however many files sort before them, and leaves every other file in the shard its place in the sorted list gives it.
// Run: node --test tests/test-schedule-ci-shards.test.mjs
//
// Module: MOD-test-schedule
// Guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES; A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
// Level: unit
//
// The expected results are written here, in the cases, and none is read from a document. The files that need the Electron are named in
// ELECTRON below, each by what it does today: it takes the lock of the one Electron fixture the node tests share, or stages the Electron
// through tests/site-usability.d/browser.mjs. A test cannot take two of them at once, and a job that gives one shard three of them waits
// on the lock and runs past its two minutes.
// Readings, each adding no word to the sentence it reads (ITM-945's Acceptance, "No two test files that start Electron share a node shard,
// in every mode"):
//   - "every mode" is the two modes the workflow runs, `all` (a pull request into the default branch) and `rest` (a pull request into a
//     sprint's branch, which leaves out the files of level release); the shard count is the node job's eight.
//   - "a list with files added before them" is the repository's files with files added whose paths sort before every path of tests/.
// The counter-proof of the whole file is plain `index % 8` over the same sorted list: the cases state, from the same lists, that it puts two
// of these files into one shard, so that the lists are able to show the fault. Planted in a scratch copy of the workflow, the partition
// reduced to `index % count` fails the cases that look for distinct shards; the run is recorded in the pull request.

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const SHARDS = 8;
const ELECTRON = [
  "tests/dashboard-backlog-layout.test.mjs",
  "tests/desktop-shell.test.mjs",
  "tests/markdown-render-918-diagram-drawn.test.mjs",
  "tests/release-itm-276-desktop-shell.test.mjs",
  "tests/release-itm-290-public-settings-layout.test.mjs",
  "tests/site-accessibility.test.mjs",
  "tests/site-usability.test.mjs",
];
// Of level release, which mode `rest` leaves out.
const RELEASE = ["tests/release-itm-276-desktop-shell.test.mjs", "tests/release-itm-290-public-settings-layout.test.mjs"];

const work = mkdtempSync(join(tmpdir(), "agent-m-945-"));
after(() => rmSync(work, { recursive: true, force: true }));

// The text the node job of the workflow writes as level.mjs: the lines between `<<'JS'` and `JS`, without the indentation of the block.
function workflowScript() {
  const lines = readFileSync(join(root, ".github/workflows/tests.yml"), "utf8").split("\n");
  const job = lines.indexOf("  node:");
  assert.ok(job >= 0, "the workflow has a node job");
  const first = lines.findIndex((line, index) => index > job && line.includes("<<'JS'")) + 1;
  assert.ok(first > 0, "the node job writes level.mjs");
  const last = lines.findIndex((line, index) => index >= first && line.trim() === "JS");
  assert.ok(last > first, "level.mjs ends at JS");
  const indent = lines[first].match(/^ */)[0].length;
  return `${lines.slice(first, last).map((line) => line.slice(indent)).join("\n")}\n`;
}
const script = join(work, "level.mjs");
writeFileSync(script, workflowScript());

const repositoryFiles = () => readdirSync(join(root, "tests")).filter((name) => name.endsWith(".test.mjs")).map((name) => `tests/${name}`);
// Files added before every path of tests/ (an absolute path sorts before "tests/"): small unit tests, none needing the Electron.
const added = (count) => Array.from({ length: count }, (_, number) => {
  const path = join(work, `a-added-${number}.test.mjs`);
  writeFileSync(path, "// Level: unit\n");
  return path;
});

const memory = new Map();
// The files of each of the eight shards, as the workflow's partition gives them: Map<file, shard>. Each file stands in exactly one shard.
function shards(mode, files, key) {
  if (memory.has(key)) return memory.get(key);
  const where = new Map();
  for (let shard = 0; shard < SHARDS; shard += 1) {
    const run = spawnSync(process.execPath, [script, mode, String(shard), String(SHARDS), ...files], { cwd: root, encoding: "utf8" });
    assert.equal(run.status, 0, `shard ${shard} of mode ${mode}: ${run.stderr}`);
    for (const file of run.stdout.trim().split("\n")) {
      assert.equal(where.has(file), false, `${file} stands in two shards`);
      where.set(file, shard);
    }
  }
  memory.set(key, where);
  return where;
}
// The shards that hold two or more of `names`, as "shard: files".
const shared = (where, names) => {
  const by = new Map();
  for (const name of names) by.set(where.get(name), [...(by.get(where.get(name)) ?? []), name.replace(/^.*\//, "")]);
  return [...by].filter(([, held]) => held.length > 1).map(([shard, held]) => `${shard}: ${held.join(", ")}`);
};
// What plain `index % 8` gives the files the partition handed out: Map<file, shard> over their sorted list.
const plain = (where) => new Map([...where.keys()].sort().map((file, index) => [file, index % SHARDS]));

const modes = [["all", ELECTRON], ["rest", ELECTRON.filter((name) => !RELEASE.includes(name))]];

// The files of ELECTRON that the mode runs stand in shards of their own, over the repository's files and over the same with two files added.
function standApart(mode, names) {
  for (const count of [0, 2]) {
    const where = shards(mode, [...added(count), ...repositoryFiles()], `${mode}-${count}`);
    for (const name of names) assert.equal(where.has(name), true, `${name} is in a shard (${count} files added)`);
    assert.deepEqual(shared(where, names), [], `${count} files added: shards that hold two files needing the Electron`);
  }
}

// TST-945001
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files, and the same files with two small test files added before them; the node job's partition of mode `all` (a pull request into the default branch), of eight shards
// input: the partition run for each shard 0..7 over each list
// expect: the seven files that need the Electron (dashboard-backlog-layout, desktop-shell, markdown-render-918-diagram-drawn, site-accessibility, site-usability and the two release files) stand in seven different shards, in both lists
test("TST-945001 · mode all: the files that need the Electron stand in shards of their own, over the repository's files and over files added before them", () => {
  standApart("all", modes[0][1]);
});

// TST-945002
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the same two lists, and the partition of mode `rest` (a pull request into a sprint's branch), which leaves out the two release files
// input: the partition run for each shard 0..7 over each list
// expect: the five files that need the Electron and are not of level release stand in five different shards, in both lists
test("TST-945002 · mode rest: the files that need the Electron stand in shards of their own, over the repository's files and over files added before them", () => {
  standApart("rest", modes[1][1]);
});

// TST-945003
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files in mode `rest`, with a file added before them that is a copy of tests/site-usability.test.mjs under another name, so that it needs the Electron too
// input: the partition run for each shard 0..7
// expect: the added copy and the five files that need the Electron in mode `rest` stand in six different shards: a file is taken to need the Electron by what it does, not by its name
test("TST-945003 · a file added before them that needs the Electron stands apart from the others", () => {
  const copy = join(work, "a-electron-copy.test.mjs");
  copyFileSync(join(root, "tests/site-usability.test.mjs"), copy);
  const names = [copy, ...modes[1][1]];
  const where = shards("rest", [copy, ...repositoryFiles()], "rest-copy");
  for (const name of names) assert.equal(where.has(name), true, `${name} is in a shard`);
  assert.deepEqual(shared(where, names), []);
});

// TST-945004
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files in mode `all`, alone and with two small test files added before them
// input: the partition run for each shard 0..7
// expect: every file that does not need the Electron stands in shard (its place in the sorted list) % 8, as it does with plain `index % 8`
test("TST-945004 · every other file keeps the shard its place in the sorted list gives it", () => {
  for (const count of [0, 2]) {
    const where = shards("all", [...added(count), ...repositoryFiles()], `all-${count}`);
    const sorted = [...where.keys()].sort();
    assert.equal(sorted.length, count + repositoryFiles().length, "every file stands in a shard");
    const moved = sorted.map((file, index) => [file, index % SHARDS]).filter(([file, shard]) => !ELECTRON.includes(file) && where.get(file) !== shard).map(([file]) => file);
    assert.deepEqual(moved, [], `${count} files added: files that left the shard their place gives them`);
  }
});

// TST-945005
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the files the partition handed out for the lists of TST-945001 and TST-945002, and the plain rule `index % 8` over the same sorted files
// input: the shards `index % 8` gives to the files that need the Electron
// expect: in every one of the four lists (two modes, with none and with two files added) `index % 8` puts at least two of those files into one shard, which the partition of the workflow does not
test("TST-945005 · counter-proof: plain index % 8 puts two files that need the Electron into one shard over the same lists", () => {
  for (const [mode, names] of modes) {
    for (const count of [0, 2]) {
      const where = shards(mode, [...added(count), ...repositoryFiles()], `${mode}-${count}`);
      assert.notDeepEqual(shared(plain(where), names), [], `${mode}, ${count} files added: plain index % 8 keeps them apart, so these lists cannot show the fault`);
      assert.deepEqual(shared(where, names), [], `${mode}, ${count} files added: the partition of the workflow keeps them apart`);
    }
  }
});

// Copies of tests/site-usability.test.mjs under other names, added before every path of tests/: files that need the Electron too.
const electronCopies = (count) => Array.from({ length: count }, (_, number) => {
  const path = join(work, `a-electron-copy-${number}.test.mjs`);
  copyFileSync(join(root, "tests/site-usability.test.mjs"), path);
  return path;
});

// TST-945006
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files in mode `all` with two copies of tests/site-usability.test.mjs added before them: nine files that need the Electron for eight shards
// input: the partition run for the shards 0 and 7
// expect: each run ends with a non-zero status and no file list, and its error text names all nine files and "8 shards", instead of letting two of them share a lock
test("TST-945006 · more files that need the Electron than shards: the partition fails and names the files and the number of shards", () => {
  const copies = electronCopies(2);
  const names = [...copies, ...ELECTRON];
  for (const shard of [0, 7]) {
    const run = spawnSync(process.execPath, [script, "all", String(shard), String(SHARDS), ...copies, ...repositoryFiles()], { cwd: root, encoding: "utf8" });
    assert.notEqual(run.status, 0, `shard ${shard} ends with a failure`);
    assert.equal(run.stdout.trim(), "", `shard ${shard} hands out no files`);
    for (const name of names) assert.equal(run.stderr.includes(name), true, `shard ${shard}: the error names ${name}`);
    assert.equal(run.stderr.includes("8 shards"), true, `shard ${shard}: the error names the number of shards`);
  }
});

// TST-945007
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files in mode `all` with one copy of tests/site-usability.test.mjs added before them: eight files that need the Electron for eight shards
// input: the partition run for each shard 0..7
// expect: every run succeeds and the eight files stand in eight different shards (the limit is more files than shards, not as many)
test("TST-945007 · as many files that need the Electron as shards: the partition succeeds and each has a shard of its own", () => {
  const copies = electronCopies(1);
  const names = [...copies, ...ELECTRON];
  const where = shards("all", [...copies, ...repositoryFiles()], "all-eight");
  for (const name of names) assert.equal(where.has(name), true, `${name} is in a shard`);
  assert.deepEqual(shared(where, names), []);
});

// The node shards of the pull-request CI keep the test files that need the controlled Electron apart (ITM-945, ITM-1184): the partition that
// .github/workflows/tests.yml writes as level.mjs in its node job and runs once per shard puts each of those files into a shard of its own,
// however many files sort before them, shares every other file round-robin, in the sorted list's order, among the shards that hold none of
// them, and fails the job, naming the files and the shard count, when there are as many of them as shards or more. The files that need the Electron are found here by the
// partition's own rule (ITM-947), read from the workflow's script, and no list of them is kept.
// Run: node --test tests/test-schedule-ci-shards.test.mjs
//
// Module: MOD-test-schedule
// Guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES; A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
// Level: unit
//
// The expected results are written here, in the cases, and none is read from a document. A file needs the Electron when its text matches
// the rule that the workflow's script holds as `startsElectron`; this file reads that rule out of the script and does not repeat it (a
// repetition in this file would also make this file one of them). A test cannot take the Electron fixture's lock twice at once, and a job
// that gives one shard three of them waits on the lock and runs past its two minutes.
// Readings, each adding no word to the sentence it reads (ITM-945's Acceptance, "No two test files that start Electron share a node shard,
// in every mode"; ITM-947's, "builds exactly as many such files as shards, whatever the real count is"):
//   - "every mode" is the two modes the workflow runs, `all` (a pull request into the default branch) and `rest` (a pull request into a
//     sprint's branch, which leaves out the files of level release); the shard count is the node job's.
//   - "a list with files added before them" is the repository's files with files added whose paths sort before every path of tests/.
//   - "as many such files as shards" is the repository's files that match the rule plus copies of one of them, under other names and added
//     before them, up to eight; "one more than shards" is nine. "A smaller copy" is the repository's other files with seven copies only.
// The counter-proof of the whole file is plain `index % count` over a list of its own (TST-945005), built here so that it puts two
// of these files into one shard whatever files the repository holds (TST-958001), so that the list is able to show the fault. Planted in a scratch copy of the workflow, the partition
// reduced to `index % count` fails the cases that look for distinct shards; the run is recorded in the pull request.

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
// The shards of the node job as its text states them: the matrix list of the shard numbers, and the count its script is run with.
const nodeJobShards = (workflow) => {
  const job = workflow.slice(workflow.indexOf("\n  node:\n"));
  const matrix = /shard: \[([^\]]*)\]/.exec(job);
  const count = /"\$\{\{ matrix\.shard \}\}" (\d+) tests\/\*\.test\.mjs/.exec(job);
  return { matrix: matrix ? matrix[1].split(",").map((n) => Number(n)) : null, count: count ? Number(count[1]) : null };
};
// Whether the matrix runs each shard the count names, once.
const agree = ({ matrix, count }) => matrix !== null && count !== null && matrix.length === count && matrix.every((n, index) => n === index);
// The text of the workflow, read once.
const workflowText = readFileSync(new URL("../.github/workflows/tests.yml", import.meta.url), "utf8");
const SHARDS = nodeJobShards(workflowText).count;
// A file the rule is known to match, for the known positive of the rule read from the workflow.
const KNOWN = "tests/site-usability.test.mjs";

const work = mkdtempSync(join(tmpdir(), "agent-m-945-"));
after(() => rmSync(work, { recursive: true, force: true }));

// The text the node job of the workflow writes as level.mjs: the lines between `<<'JS'` and `JS`, without the indentation of the block.
function workflowScript() {
  const lines = workflowText.split("\n");
  const job = lines.indexOf("  node:");
  assert.ok(job >= 0, "the workflow has a node job");
  const first = lines.findIndex((line, index) => index > job && line.includes("<<'JS'")) + 1;
  assert.ok(first > 0, "the node job writes level.mjs");
  const last = lines.findIndex((line, index) => index >= first && line.trim() === "JS");
  assert.ok(last > first, "level.mjs ends at JS");
  const indent = lines[first].match(/^ */)[0].length;
  return `${lines.slice(first, last).map((line) => line.slice(indent)).join("\n")}\n`;
}
const scriptText = workflowScript();
const script = join(work, "level.mjs");
writeFileSync(script, scriptText);

// The partition's own rule: the regular expression the script tests a file's text with.
const ruleMatch = /startsElectron = \(f\) => \/(.+)\/\.test\(/.exec(scriptText);
assert.ok(ruleMatch, "the workflow's script holds its rule as startsElectron");
const rule = new RegExp(ruleMatch[1]);
const starts = (file, cwd = root) => rule.test(readFileSync(isAbsolute(file) ? file : join(cwd, file), "utf8"));

const repositoryFiles = () => readdirSync(join(root, "tests")).filter((name) => name.endsWith(".test.mjs")).map((name) => `tests/${name}`);
const needing = (files, cwd = root) => files.filter((file) => starts(file, cwd));
// Files added before every path of tests/ (an absolute path sorts before "tests/"): small unit tests, none needing the Electron.
const added = (count) => Array.from({ length: count }, (_, number) => {
  const path = join(work, `a-added-${number}.test.mjs`);
  writeFileSync(path, "// Level: unit\n");
  return path;
});
// Copies of a file the rule matches, under other names and before every path of tests/: files that need the Electron too.
const electronCopies = (count) => Array.from({ length: Math.max(count, 0) }, (_, number) => {
  const path = join(work, `a-electron-copy-${number}.test.mjs`);
  copyFileSync(join(root, KNOWN), path);
  return path;
});

const memory = new Map();
// The files of each of the eight shards, as the workflow's partition gives them: Map<file, shard>. Each file stands in exactly one shard.
function shards(mode, files, key, cwd = root) {
  if (memory.has(key)) return memory.get(key);
  const where = new Map();
  for (let shard = 0; shard < SHARDS; shard += 1) {
    const run = spawnSync(process.execPath, [script, mode, String(shard), String(SHARDS), ...files], { cwd, encoding: "utf8" });
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

// The files that need the Electron among those the mode runs stand in shards of their own, over the repository's files and over the same
// with two files added. They are found by the rule among the files the partition handed out.
function standApart(mode) {
  for (const count of [0, 2]) {
    const where = shards(mode, [...added(count), ...repositoryFiles()], `${mode}-${count}`);
    const names = needing([...where.keys()]);
    assert.equal(names.includes(KNOWN), true, `${count} files added: the rule finds ${KNOWN}`);
    assert.deepEqual(shared(where, names), [], `${count} files added: shards that hold two files needing the Electron`);
  }
}

// TST-945001
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files, and the same files with two small test files added before them; the node job's partition of mode `all` (a pull request into the default branch), of eight shards
// input: the partition run for each shard 0..7 over each list
// expect: the files that the partition's rule finds among those it handed out (at least the known site-usability) stand in different shards, one each, in both lists
test("TST-945001 · mode all: the files that need the Electron stand in shards of their own, over the repository's files and over files added before them", () => {
  standApart("all");
});

// TST-945002
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the same two lists, and the partition of mode `rest` (a pull request into a sprint's branch), which leaves out the files of level release
// input: the partition run for each shard 0..7 over each list
// expect: the files that the rule finds among those handed out stand in different shards, one each, in both lists
test("TST-945002 · mode rest: the files that need the Electron stand in shards of their own, over the repository's files and over files added before them", () => {
  standApart("rest");
});

// TST-945003
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files in mode `rest`, with a file added before them that is a copy of tests/site-usability.test.mjs under another name, so that it needs the Electron too
// input: the partition run for each shard 0..7
// expect: the added copy and the files the rule finds among those handed out stand in different shards: a file is taken to need the Electron by what it does, not by its name
test("TST-945003 · a file added before them that needs the Electron stands apart from the others", () => {
  const [copy] = electronCopies(1);
  const where = shards("rest", [copy, ...repositoryFiles()], "rest-copy");
  const names = needing([...where.keys()]);
  assert.equal(names.includes(copy), true, "the copy is found by the rule and stands in a shard");
  assert.deepEqual(shared(where, names), []);
});

// TST-945004
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files in mode `all`, alone and with two small test files added before them; E is the number of files the rule finds among them
// input: the partition run for each shard 0..19
// expect: the other files, in the sorted list's order, stand round-robin in the shards E to 19: the n-th other file (n from 0) in shard E + n % (20 - E)
test("TST-945004 · every other file stands round-robin in the shards that hold no file needing the Electron", () => {
  for (const count of [0, 2]) {
    const where = shards("all", [...added(count), ...repositoryFiles()], `all-${count}`);
    const sorted = [...where.keys()].sort();
    assert.equal(sorted.length, count + repositoryFiles().length, "every file stands in a shard");
    const electron = sorted.filter((file) => starts(file)).length;
    const others = sorted.filter((file) => !starts(file));
    const moved = others.map((file, index) => [file, electron + (index % (SHARDS - electron))]).filter(([file, shard]) => where.get(file) !== shard).map(([file]) => file);
    assert.deepEqual(moved, [], `${count} files added: files that left the shard the round-robin gives them`);
  }
});

// TST-1184001
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files, in each of the two modes
// input: the partition run for each shard 0..19
// expect: every shard that holds a file needing the Electron holds that one file and no other, so that the other files' tests do not add to a slow Electron file and to the install of xvfb and openbox
test("TST-1184001 · a file that needs the Electron stands alone in its shard", () => {
  for (const mode of ["all", "rest"]) {
    const where = shards(mode, repositoryFiles(), `${mode}-0`);
    const names = needing([...where.keys()]);
    assert.notDeepEqual(names, [], `${mode}: the rule finds files`);
    for (const name of names) {
      const company = [...where].filter(([, shard]) => shard === where.get(name)).map(([file]) => file);
      assert.deepEqual(company, [name], `${mode}: ${name} shares its shard`);
    }
  }
});

// TST-945005
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the counter-proof's own list (ownList), one more file than shards, the first and the last of them files that need the Electron, in each of the two modes
// input: the shards plain `index % 8` gives to the files the rule finds, and the shards the partition of the workflow gives them
// expect: plain `index % 8` puts the two into one shard, which the partition of the workflow does not; no file of the repository enters the list, so adding one changes neither result
test("TST-945005 · counter-proof: on its own list plain index % 8 puts two files that need the Electron into one shard and the partition does not", () => {
  for (const mode of ["all", "rest"]) {
    const outcome = counterProof(mode);
    assert.equal(outcome.plain.length, 1, `${mode}: plain index % 8 puts the two into one shard, so that the list can show the fault`);
    assert.deepEqual(outcome.partition, [], `${mode}: the partition of the workflow keeps them apart`);
  }
});

// The counter-proof's own list: SHARDS + 1 test files, named so that they sort in the order they are numbered. The first and the last
// need the Electron (copies of KNOWN), the others do not. Under plain `index % SHARDS` the first stands at 0 and the last at SHARDS, so both
// fall into shard 0. The list holds no file of the repository, whose list changes with every file added to it.
function ownList() {
  const dir = join(work, "own");
  mkdirSync(dir, { recursive: true });
  return Array.from({ length: SHARDS + 1 }, (_, number) => {
    const path = join(dir, `f-${String(number).padStart(3, "0")}.test.mjs`);
    if (number === 0 || number === SHARDS) copyFileSync(join(root, KNOWN), path);
    else writeFileSync(path, "// Level: unit\n");
    return path;
  });
}
// What the counter-proof finds over its own list in `mode`, with the partition run in `cwd`: the shards that hold two files needing the
// Electron under plain `index % 8`, and under the workflow's partition.
function counterProof(mode, cwd = root) {
  return counterProofOver(mode, ownList(), `own-${mode}-${cwd}`, cwd);
}

// What the counter-proof finds over `files`: the same two results, for any list.
function counterProofOver(mode, files, key, cwd = root) {
  const where = shards(mode, files, key, cwd);
  const names = needing([...where.keys()], cwd);
  return { plain: shared(plain(where), names), partition: shared(where, names) };
}

// A copy of the repository's tests/ folder as links, with `extra` test files (paths under tests/) added to it: the root a partition is
// run in, so that files added between the repository's own sort among them, and the repository itself stays as it is.
function mirror(extra, name) {
  const dir = join(work, name);
  mkdirSync(join(dir, "tests"), { recursive: true });
  for (const entry of ["docs", "src", "package.json"]) symlinkSync(join(root, entry), join(dir, entry));
  for (const file of repositoryFiles()) symlinkSync(join(root, file), join(dir, file));
  for (const file of extra) writeFileSync(join(dir, file), "// Level: unit\n");
  return dir;
}
// Files added to the repository's list that move the files needing the Electron under plain `index % 8`: into eight different shards
// (`together` false) or all into shard 0 (`together` true). Before each of them go as many as bring its place to its residue, right
// after the file that sorts before it.
function shiftingFiles(mode, together) {
  const kept = [...shards(mode, repositoryFiles(), `${mode}-0`).keys()].sort();
  const extra = [];
  const electrons = needing(kept);
  const target = (number) => (together ? 0 : number);
  electrons.forEach((file, number) => {
    const earlier = kept.filter((other) => other < file);
    const before = earlier.length + extra.length;
    for (let count = 0; count < (((target(number) - before) % SHARDS) + SHARDS) % SHARDS; count += 1) extra.push(`${earlier.at(-1)}!${count}.test.mjs`);
  });
  const sorted = [...kept, ...extra].sort();
  assert.deepEqual(electrons.map((file) => sorted.indexOf(file) % SHARDS), electrons.map((_, number) => target(number)), `${mode}: the added files place the files that need the Electron as intended`);
  return extra;
}

// TST-958001
// level: unit
// module: MOD-test-schedule
// guards: A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
// given: the repository's test files, in each of the two modes, and the same files with test files added among them in two ways: as many before each file that needs the Electron as put those files into different shards under plain `index % 8`, and as many as put them all into one; the counter-proof of TST-945005 run in the repository and in a copy of it with the added files
// input: the counter-proof's outcome in each root
// expect: it is the same in all three: adding files to the repository changes neither what plain `index % 8` does nor what the partition does
test("TST-958001 · adding test files to the repository's list leaves the outcome of TST-945005 unchanged", () => {
  for (const mode of ["all", "rest"]) {
    const base = counterProof(mode);
    for (const together of [false, true]) {
      const extra = shiftingFiles(mode, together);
      assert.notEqual(extra.length, 0, `${mode}: files are added`);
      assert.deepEqual(counterProof(mode, mirror(extra, `mirror-${mode}-${together}`)), base, `${mode}, ${extra.length} files added${together ? " that put the Electron files into one shard" : " that put them into different ones"}`);
    }
  }
});

// TST-958002
// level: unit
// module: MOD-test-schedule
// guards: A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
// given: the previous counter-proof of TST-945005, which ran over the repository's own list, and the shifted lists of TST-958001 in mode `all`
// input: that counter-proof over the repository's files with the files added, once to put the Electron files into different shards under plain `index % 8` and once to put them into one
// expect: the previous counter-proof finds plain `index % 8` keeping them apart on the first list and putting two into one shard on the second: it fails on the shifted list, which is the fault TST-958001 guards against
test("TST-958002 · counter-proof: the counter-proof over the repository's list flips when files are added to it", () => {
  for (const mode of ["all"]) {
    const apart = shiftingFiles(mode, false);
    const one = shiftingFiles(mode, true);
    const kept = counterProofOver(mode, [...apart, ...repositoryFiles()], `${mode}-false`, mirror(apart, `old-${mode}-false`));
    const collided = counterProofOver(mode, [...one, ...repositoryFiles()], `${mode}-true`, mirror(one, `old-${mode}-true`));
    assert.deepEqual(kept.plain, [], `${mode}: plain index % 8 keeps them apart on the first list`);
    assert.notDeepEqual(collided.plain, [], `${mode}: plain index % 8 puts two into one shard on the second list`);
  }
});

// The repository's files plus as many copies as bring the files that need the Electron to `total`, whatever the repository holds of them.
const listWith = (total) => {
  const files = repositoryFiles();
  return { copies: electronCopies(total - needing(files).length), files };
};

// TST-945006
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files in mode `all` with as many copies of tests/site-usability.test.mjs added before them as make nine files that need the Electron for eight shards, whatever the repository holds of them
// input: the partition run for the shards 0 and 7
// expect: each run ends with a non-zero status and no file list, and its error text names all nine files and "<shard count> shards", instead of letting two of them share a lock
test("TST-945006 · more files that need the Electron than shards: the partition fails and names the files and the number of shards", () => {
  const { copies, files } = listWith(SHARDS + 1);
  const names = needing([...copies, ...files]);
  assert.equal(names.length, SHARDS + 1);
  for (const shard of [0, SHARDS - 1]) {
    const run = spawnSync(process.execPath, [script, "all", String(shard), String(SHARDS), ...copies, ...files], { cwd: root, encoding: "utf8" });
    assert.notEqual(run.status, 0, `shard ${shard} ends with a failure`);
    assert.equal(run.stdout.trim(), "", `shard ${shard} hands out no files`);
    for (const name of names) assert.equal(run.stderr.includes(name), true, `shard ${shard}: the error names ${name}`);
    assert.equal(run.stderr.includes(`${SHARDS} shards`), true, `shard ${shard}: the error names the number of shards`);
  }
});

// TST-945007
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files in mode `all` with as many copies of tests/site-usability.test.mjs added before them as make exactly one file fewer that needs the Electron than there are shards, whatever the repository holds of them
// input: the partition run for each shard 0..19
// expect: every run succeeds and the files stand in different shards (the limit is as many files as shards: the other files need a shard)
test("TST-945007 · one file fewer that needs the Electron than shards: the partition succeeds and each has a shard of its own", () => {
  const { copies, files } = listWith(SHARDS - 1);
  const where = shards("all", [...copies, ...files], "all-fewer");
  const names = needing([...where.keys()]);
  assert.equal(names.length, SHARDS - 1);
  assert.deepEqual(shared(where, names), []);
});

// TST-1184002
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the repository's test files in mode `all` with as many copies of tests/site-usability.test.mjs added before them as make exactly as many files that need the Electron as there are shards
// input: the partition run for the shards 0 and 19
// expect: each run ends with a non-zero status and no file list, and its error text names all the files and "<shard count> shards": no shard is left for the other files
test("TST-1184002 · as many files that need the Electron as shards: the partition fails, since no shard is left for the other files", () => {
  const { copies, files } = listWith(SHARDS);
  const names = needing([...copies, ...files]);
  assert.equal(names.length, SHARDS);
  for (const shard of [0, SHARDS - 1]) {
    const run = spawnSync(process.execPath, [script, "all", String(shard), String(SHARDS), ...copies, ...files], { cwd: root, encoding: "utf8" });
    assert.notEqual(run.status, 0, `shard ${shard} ends with a failure`);
    assert.equal(run.stdout.trim(), "", `shard ${shard} hands out no files`);
    for (const name of names) assert.equal(run.stderr.includes(name), true, `shard ${shard}: the error names ${name}`);
    assert.equal(run.stderr.includes(`${SHARDS} shards`), true, `shard ${shard}: the error names the number of shards`);
  }
});

// TST-945008
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: a smaller copy of the repository: the files the rule does not find, and seven copies of tests/site-usability.test.mjs added before them, in mode `all`
// input: the partition run for each shard 0..7
// expect: every run succeeds and the seven files that need the Electron stand in seven different shards
test("TST-945008 · over a smaller copy with seven files that need the Electron, each has a shard of its own", () => {
  const copies = electronCopies(7);
  const where = shards("all", [...copies, ...repositoryFiles().filter((file) => !starts(file))], "smaller");
  assert.equal(needing([...where.keys()]).length, 7);
  assert.deepEqual(shared(where, copies), []);
});

// TST-948001
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the node job of .github/workflows/tests.yml
// input: the shard numbers its matrix lists, and the shard count its script is run with
// expect: the matrix lists the shards 0 to 19, one job each, and the script is run with the count 20: the files that need the Electron have a shard each (ten at most), and the other files are spread over the rest so that no job, with the install of xvfb and openbox before its tests, nears the two-minute limit; the matrix and the count agree, so that every file runs once
test("TST-948001 · the node job runs the twenty shards its matrix lists, with the count twenty", () => {
  const stated = nodeJobShards(workflowText);
  assert.deepEqual(stated.matrix, Array.from({ length: 20 }, (_, number) => number));
  assert.equal(stated.count, 20);
  assert.equal(agree(stated), true);
});

// TST-948002
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: node jobs as text: a matrix of twenty shards run with the count eight, a matrix of eight run with the count twenty, a matrix of twenty run with twenty, and a text without a matrix
// input: the agreement check of the matrix and the count
// expect: only the matrix of twenty with the count twenty agrees; the others are named as disagreeing (counter-proof of TST-948001: shards that run no file, or files that run in no shard)
test("TST-948002 · counter-proof: a matrix and a count that disagree are found", () => {
  const job = (matrix, count) => `\n  node:\n    strategy:\n      matrix:\n        shard: [${matrix}]\n    steps:\n      - run: |\n          files=$(node "$RUNNER_TEMP/level.mjs" "$mode" "\${{ matrix.shard }}" ${count} tests/*.test.mjs)\n`;
  const sixteen = Array.from({ length: 20 }, (_, number) => number).join(", ");
  const eight = Array.from({ length: 8 }, (_, number) => number).join(", ");
  assert.equal(agree(nodeJobShards(job(sixteen, 20))), true);
  assert.equal(agree(nodeJobShards(job(sixteen, 8))), false);
  assert.equal(agree(nodeJobShards(job(eight, 20))), false);
  assert.equal(agree(nodeJobShards("\n  node:\n    steps: []\n")), false);
});

// TST-948003
// level: unit
// module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the text of .github/workflows/tests.yml as it stands, and a copy of it with the node job's count planted at 8 while its matrix lists 20 shards
// input: the agreement check of the matrix and the count, on each text
// expect: the real text agrees (the matrix lists the shards 0 to count - 1); the planted copy is found to disagree
test("TST-948003 · the real workflow's node matrix and count agree, and a copy with the count at 8 and the matrix at 16 is found to disagree", () => {
  assert.equal(agree(nodeJobShards(workflowText)), true);
  const planted = workflowText.replace(/(\{\{ matrix\.shard \}\}" )\d+( tests\/\*\.test\.mjs)/, (whole, before, after) => `${before}8${after}`);
  assert.notEqual(planted, workflowText, "the count was planted");
  assert.equal(nodeJobShards(planted).matrix.length, 20);
  assert.equal(nodeJobShards(planted).count, 8);
  assert.equal(agree(nodeJobShards(planted)), false);
});

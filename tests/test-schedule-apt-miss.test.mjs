// A node shard rerun alone installs xvfb and openbox when its cache is gone (ITM-1183): the step "Install xvfb and openbox" of
// `.github/workflows/tests.yml` (job `node`) and of `nightly.yml` (job `nightly`) — MOD-test-schedule's files, named in its Parts
// (docs/architecture/MOD-test-schedule.md, "Taken over, outside this folder") — is run as the shell script it is, against a model of apt
// that fails where the real apt failed on job 120054035567 ("E: Archives directory .../partial is missing."). The step creates apt's archive
// and list folders itself, installs and gives up a stalled mirror within the job's two minutes where the cache is gone, and fetches nothing
// where it is there (SPEC.md, A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES).
// Run: node --test tests/test-schedule-apt-miss.test.mjs
//
// Module: MOD-test-schedule
// Guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// Level: system
//
// Each test states its input and its expected result before it runs (given / input / expect). The workflow is read as text: a job is the block
// under `jobs:` at two spaces of indentation, a step the block at six spaces that starts with `- `, and the step's `run: |` block is the script.
// The script runs unchanged under `bash -e`, as GitHub runs it, with three paths moved into a scratch folder (`/home/runner`, and
// `/etc/apt/apt-mirrors.txt`) and with `sudo`, `timeout`, `apt-get` and `openbox` found first on the PATH as scripts of this file:
//   - `apt-get` models what the log of job 120054035567 shows: `update` and every `install` stop with exit code 100 when the `partial`
//     folder of the lists, or of the archives, is missing; an `install` stops when no package list is there ("Unable to locate package"); an
//     `install --no-download` stops when the archive folder holds no package; a fetch from a mirror whose name is not archive.ubuntu.com
//     (the mirror azure.archive.ubuntu.com, which sends one file so slowly that apt moves on to no other) never ends, which is exit code 124
//     where the call is bounded by `timeout` and a hang past the job's two minutes (recorded as `stalled-unbounded`) where it is not.
//   - `timeout <seconds>` marks the call as bounded, and refuses more than 60 seconds.
// A cache hit is the state a first run leaves: the same folders, with the packages and the lists in them. The counter-proof of every case is
// the case "without the folder" below: the same script with its `mkdir` line removed fails on the model (exit code 100). The run is recorded
// in the pull request.

import assert from "node:assert/strict";
import test, { after } from "node:test";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

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

// The script of the step "Install xvfb and openbox" in a job: its `run: |` block, without the block's indentation.
function installScript(file, job) {
  const step = stepsOf(read(file), job).find((candidate) => /^\s*- name:\s*Install xvfb and openbox\s*$/m.test(candidate));
  assert.ok(step, `${file}: the job ${job} has the step "Install xvfb and openbox"`);
  const lines = step.split("\n");
  const run = lines.findIndex((line) => /^\s+run:\s*\|\s*$/.test(line));
  assert.ok(run >= 0, `${file}: the step runs a script`);
  const indent = /^ */.exec(lines[run + 1])[0].length;
  const block = [];
  for (const line of lines.slice(run + 1)) {
    if (line.trim() !== "" && !line.startsWith(" ".repeat(indent))) break;
    block.push(line.slice(indent));
  }
  return block.join("\n");
}

const APT = `#!/bin/bash
archives=""; lists=""; mode=""; nodownload=0; downloadonly=0
for arg in "$@"; do
  case "$arg" in
    Dir::Cache::archives=*) archives="\${arg#*=}";;
    Dir::State::lists=*) lists="\${arg#*=}";;
    update) mode=update;;
    install) mode=install;;
    --no-download) nodownload=1;;
    --download-only) downloadonly=1;;
  esac
done
echo "apt-get $*" >> "$FAKE_CALLS"
if [ "$mode" = update ]; then
  [ -d "$lists/partial" ] || { echo "E: Lists directory $lists/partial is missing." >&2; exit 100; }
  touch "$lists/index"; echo update >> "$FAKE_EVENTS"; exit 0
fi
[ -d "$archives/partial" ] || { echo "E: Archives directory $archives/partial is missing." >&2; exit 100; }
[ -f "$lists/index" ] || { echo "E: Unable to locate package xvfb" >&2; exit 100; }
if [ "$nodownload" = 1 ]; then
  [ -f "$archives/xvfb.deb" ] && [ -f "$archives/openbox.deb" ] || { echo "E: Can't download packages with --no-download" >&2; exit 100; }
  echo install-from-cache >> "$FAKE_EVENTS"; exit 0
fi
if [ ! -f "$archives/xvfb.deb" ] || [ ! -f "$archives/openbox.deb" ]; then
  if [ -n "$FAKE_STALL" ] && ! grep -q 'archive.ubuntu.com' "$FAKE_MIRRORS" 2>/dev/null; then
    if [ -n "$FAKE_BOUNDED" ]; then echo stall-bounded >> "$FAKE_EVENTS"; exit 124; fi
    echo stalled-unbounded >> "$FAKE_EVENTS"; exit 1
  fi
  touch "$archives/xvfb.deb" "$archives/openbox.deb"; echo fetch >> "$FAKE_EVENTS"
fi
[ "$downloadonly" = 1 ] || echo install >> "$FAKE_EVENTS"
exit 0
`;
const TIMEOUT = `#!/bin/bash
limit="$1"; shift
echo "timeout $limit" >> "$FAKE_EVENTS"
[ "$limit" -le 60 ] 2>/dev/null || { echo timeout-too-long >> "$FAKE_EVENTS"; exit 1; }
FAKE_BOUNDED=1 exec "$@"
`;

const work = mkdtempSync(join(tmpdir(), "agent-m-1183-"));
after(() => rmSync(work, { recursive: true, force: true }));
const shim = join(work, "bin");
mkdirSync(shim);
for (const [name, body] of [["apt-get", APT], ["timeout", TIMEOUT], ["sudo", '#!/bin/bash\nexec "$@"\n'], ["openbox", "#!/bin/bash\necho openbox 3.6.1\n"]]) {
  writeFileSync(join(shim, name), body);
  chmodSync(join(shim, name), 0o755);
}

let counter = 0;
// A machine: its own home with nothing cached (the home of a runner), its own mirrors file and its record of what apt did.
function machine() {
  const dir = join(work, `machine-${counter++}`);
  mkdirSync(join(dir, "home"), { recursive: true });
  return { dir, home: join(dir, "home"), mirrors: join(dir, "apt-mirrors.txt") };
}
// Run a script on a machine, as GitHub runs a step: `bash -e`. Returns the exit status, stderr and the events apt recorded in this run.
function run(script, host, { stall = false } = {}) {
  const events = join(host.dir, `events-${counter++}`);
  const calls = join(host.dir, `calls-${counter++}`);
  writeFileSync(events, "");
  writeFileSync(calls, "");
  const moved = script.replaceAll("/home/runner", host.home).replaceAll("/etc/apt/apt-mirrors.txt", host.mirrors);
  const done = spawnSync("bash", ["-e", "-c", moved], {
    cwd: host.dir,
    encoding: "utf8",
    timeout: 20000,
    env: { PATH: `${shim}:${process.env.PATH}`, HOME: host.home, FAKE_EVENTS: events, FAKE_CALLS: calls, FAKE_MIRRORS: host.mirrors, ...(stall ? { FAKE_STALL: "1" } : {}) },
  });
  const lines = (path) => readFileSync(path, "utf8").split("\n").filter(Boolean);
  return { status: done.status, stderr: done.stderr, events: lines(events), calls: lines(calls) };
}

const CASES = [
  ["tests.yml", "node"],
  ["nightly.yml", "nightly"],
];

// A miss: nothing of the cache is there, and the script finishes with the packages installed.
function onMiss(file, job) {
  const script = installScript(file, job);
  const host = machine();
  const result = run(script, host);
  assert.equal(result.status, 0, `${file}: the step finishes where no cache was restored\n${result.stderr}`);
  assert.ok(result.events.includes("install") || result.events.includes("install-from-cache"), `${file}: xvfb and openbox are installed`);
  assert.ok(existsSync(join(host.home, "apt-archives", "partial")), `${file}: the step made apt's archive folder`);
  assert.ok(existsSync(join(host.home, "apt-lists", "partial")), `${file}: the step made apt's list folder`);
}
// The same script without the folder: the model stops it as the real apt did.
function withoutFolder(file, job) {
  const script = installScript(file, job);
  assert.match(script, /^\s*mkdir -p [^\n]*apt-archives\/partial[^\n]*apt-lists\/partial/m, `${file}: the script makes the folders (known positive of the line removed below)`);
  const without = script.split("\n").filter((line) => !/^\s*mkdir -p /.test(line)).join("\n");
  const result = run(without, machine());
  assert.equal(result.status, 100, `${file}: without the folder the step stops with exit code 100\n${result.stderr}`);
  assert.match(result.stderr, /partial is missing/, `${file}: the model names the missing folder as apt did`);
}
// A miss with a stalled first mirror.
function onStalledMiss(file, job) {
  const script = installScript(file, job);
  const host = machine();
  const result = run(script, host, { stall: true });
  assert.equal(result.status, 0, `${file}: the step finishes where the first mirror stalls; apt did: ${result.events.join(", ")}`);
  assert.ok(!result.events.includes("stalled-unbounded"), `${file}: no fetch from a stalled mirror runs unbounded`);
  assert.ok(!result.events.includes("timeout-too-long"), `${file}: the bound is at most 60 seconds`);
  assert.ok(existsSync(host.mirrors) && /archive\.ubuntu\.com/.test(readFileSync(host.mirrors, "utf8")), `${file}: archive.ubuntu.com became the mirror`);
  assert.ok(result.events.includes("install"), `${file}: xvfb and openbox are installed`);
}
// A hit: the state a first run leaves, run again.
function onHit(file, job) {
  const script = installScript(file, job);
  const host = machine();
  assert.equal(run(script, host).status, 0, `${file}: the first run finishes`);
  const second = run(script, host, { stall: true });
  assert.equal(second.status, 0, `${file}: the second run finishes\n${second.stderr}`);
  assert.deepEqual(second.events, ["install-from-cache"], `${file}: with the cache there, the packages come from it, with no update and no fetch`);
}

// TST-1183001 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml, a machine with no restored cache
// input: the script of the step "Install xvfb and openbox" in the job `node`, run under `bash -e` against the model of apt
// expect: exit code 0; apt's archive folder and list folder, each with its `partial` subfolder, exist afterwards; xvfb and openbox are installed
// Planted fault: removing the `mkdir` line fails TST-1183002 on the same script (exit code 100, "Archives directory ... partial is missing").
test("tests.yml: a node shard with no restored cache creates apt's folders and installs xvfb and openbox", () => onMiss(...CASES[0]));

// TST-1183002 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml, a machine with no restored cache
// input: the script of the step in the job `node` with its `mkdir` line removed, run under `bash -e` against the model of apt
// expect: exit code 100 and the message "partial is missing" — the failure of job 120054035567, which shows that the model is able to fail
// Planted fault: a model of apt that creates the folder itself, or a script that keeps the line, fails this case.
test("tests.yml: the step without the folder fails as the real apt failed", () => withoutFolder(...CASES[0]));

// TST-1183003 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml, a machine with no restored cache whose first mirror (azure.archive.ubuntu.com) stalls
// input: the script of the step in the job `node`, run under `bash -e` against the model of apt
// expect: exit code 0; every fetch from the first mirror is bounded by `timeout` of at most 60 seconds (none is recorded as `stalled-unbounded`); archive.ubuntu.com is written to apt-mirrors.txt; xvfb and openbox are installed
// Planted fault: the fallback install without `timeout`, or without the switch of the mirror, fails.
test("tests.yml: a node shard whose cache is gone gives up a stalled mirror within the job's two minutes", () => onStalledMiss(...CASES[0]));

// TST-1183004 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml, a machine that holds what a first run left (the folders, the packages, the lists), whose first mirror stalls
// input: the script of the step in the job `node`, run a second time under `bash -e` against the model of apt
// expect: exit code 0; apt's calls are exactly one install from the cache — no update, no fetch from any mirror
// Planted fault: an `apt-get update` or an install without `--no-download` before the install from the cache fails.
test("tests.yml: a node shard with the cache restored fetches nothing", () => onHit(...CASES[0]));

// TST-1183005 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/nightly.yml, a machine with no restored cache
// input: the script of the step "Install xvfb and openbox" in the job `nightly`, run under `bash -e` against the model of apt
// expect: exit code 0; apt's archive folder and list folder, each with its `partial` subfolder, exist afterwards; xvfb and openbox are installed
// Planted fault: removing the `mkdir` line fails TST-1183006 on the same script.
test("nightly.yml: the nightly job with no restored cache creates apt's folders and installs xvfb and openbox", () => onMiss(...CASES[1]));

// TST-1183006 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/nightly.yml, a machine with no restored cache
// input: the script of the step in the job `nightly` with its `mkdir` line removed, run under `bash -e` against the model of apt
// expect: exit code 100 and the message "partial is missing"
// Planted fault: a model of apt that creates the folder itself, or a script that keeps the line, fails this case.
test("nightly.yml: the step without the folder fails as the real apt failed", () => withoutFolder(...CASES[1]));

// TST-1183007 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/nightly.yml, a machine with no restored cache whose first mirror (azure.archive.ubuntu.com) stalls
// input: the script of the step in the job `nightly`, run under `bash -e` against the model of apt
// expect: exit code 0; every fetch from the first mirror is bounded by `timeout` of at most 60 seconds; archive.ubuntu.com is written to apt-mirrors.txt; xvfb and openbox are installed
// Planted fault: a download without `timeout`, or without the switch of the mirror, fails.
test("nightly.yml: the nightly job whose cache is gone gives up a stalled mirror", () => onStalledMiss(...CASES[1]));

// TST-1183008 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/nightly.yml, a machine that holds what a first run left (the folders, the packages, the lists), whose first mirror stalls
// input: the script of the step in the job `nightly`, run a second time under `bash -e` against the model of apt
// expect: exit code 0; apt's calls are exactly one install from the cache — no update, no fetch from any mirror
// Planted fault: an `apt-get update` or an install without `--no-download` before the install from the cache fails.
test("nightly.yml: the nightly job with the cache restored fetches nothing", () => onHit(...CASES[1]));

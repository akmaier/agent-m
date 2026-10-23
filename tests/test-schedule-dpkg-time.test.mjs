// The install of xvfb and openbox from the cached archives no longer spends its time before and in dpkg (ITM-1193): in `.github/workflows/tests.yml`
// — MOD-test-schedule's file, named in its Parts (docs/architecture/MOD-test-schedule.md, "Taken over, outside this folder") — the node job
// starts, as its first step and in the background, the read of dpkg's file lists (dpkg reads one small file per installed package before it
// installs anything, and on a runner whose disk is cold that read is the slow part of the install), and its step "Install xvfb and openbox" takes
// away, before it calls apt, the four programs that apt and dpkg would run around the install and that a throwaway runner has no use for: the
// pre-configure hook of debconf (`/usr/sbin/dpkg-preconfigure`, which extracts the templates of every package to be installed), update-notifier's
// check of the available updates after dpkg (`/usr/lib/update-notifier/update-motd-updates-available`, which loads the whole package cache), and
// needrestart's two hooks (`/usr/lib/needrestart/apt-pinvoke` and `dpkg-status`) — on a runner of GitHub Actions only, and without failing the step
// where a program cannot be taken away (SPEC.md, A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES).
// Run: node --test tests/test-schedule-dpkg-time.test.mjs
//
// Module: MOD-test-schedule
// Guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// Level: system
//
// Each test states its input and its expected result before it runs (given / input / expect). A workflow is read as text: a job is the block
// under `jobs:` at two spaces of indentation, a step the block at six spaces that starts with `- `, and the step's `run: |` block is the script.
// The script runs unchanged under `bash -e`, as GitHub runs it, with the paths of the machine moved into a scratch folder (`/home/runner`, the four
// programs above, `/var/lib/dpkg/info`) and with `sudo`, `apt-get`, `openbox` and, in the warm-up cases, `cat` found first on the PATH as scripts
// of this file:
//   - `apt-get` is the model of the hooks: when it is called it records, for each of the four programs in the order above, `hook-ran:<name>` if the
//     file that stands for the program is executable and `hook-skipped:<name>` if it is not (apt and dpkg run a hook only if they can execute it),
//     then `install-from-cache` for a call with `--no-download`; any other call stops with exit code 100, so that a step that leaves the cache path
//     fails loudly.
//   - `sudo` runs its command, or, when FAKE_SUDO_DENY is set, refuses `chmod` with exit code 1 (a machine where the programs cannot be taken away).
//   - `cat` records the files it is given and then waits one second, so that a read that the script waits for takes a second longer than one that it does not.
// The counter-proof of the cases on the hooks is the same script with the `chmod` replaced by `true` (the model then records `hook-ran:` for each);
// that of the cases on the warm-up is the same script with its `&` removed (the script then waits for the read). The runs are recorded in the pull request.

import assert from "node:assert/strict";
import test, { after } from "node:test";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const read = (path) => readFileSync(new URL(`../.github/workflows/${path}`, import.meta.url), "utf8");

// The programs the install step takes away, in the order the model of apt reports them.
const HOOKS = [
  "/usr/sbin/dpkg-preconfigure",
  "/usr/lib/update-notifier/update-motd-updates-available",
  "/usr/lib/needrestart/apt-pinvoke",
  "/usr/lib/needrestart/dpkg-status",
];
const skipped = HOOKS.map((hook) => `hook-skipped:${basename(hook)}`);
const ran = HOOKS.map((hook) => `hook-ran:${basename(hook)}`);

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
const nameOf = (step) => /^\s*- name:\s*(.+?)\s*$/m.exec(step)?.[1] ?? null;

// The script of the step with the given name in the node job: its `run: |` block, without the block's indentation.
function scriptOf(name) {
  const step = stepsOf(read("tests.yml"), "node").find((candidate) => nameOf(candidate) === name);
  assert.ok(step, `the node job of tests.yml has the step "${name}"`);
  const lines = step.split("\n");
  const run = lines.findIndex((line) => /^\s+run:\s*\|\s*$/.test(line));
  assert.ok(run >= 0, `the step "${name}" runs a script`);
  const indent = /^ */.exec(lines[run + 1])[0].length;
  const block = [];
  for (const line of lines.slice(run + 1)) {
    if (line.trim() !== "" && !line.startsWith(" ".repeat(indent))) break;
    block.push(line.slice(indent));
  }
  return block.join("\n");
}

const APT = `#!/bin/bash
echo "apt-get $*" >> "$FAKE_CALLS"
for hook in $FAKE_HOOKS; do
  if [ -x "$hook" ]; then echo "hook-ran:$(basename "$hook")" >> "$FAKE_EVENTS"; else echo "hook-skipped:$(basename "$hook")" >> "$FAKE_EVENTS"; fi
done
case " $* " in *" --no-download "*) echo install-from-cache >> "$FAKE_EVENTS"; exit 0;; esac
echo "E: a call outside the cache path: $*" >&2
exit 100
`;
const SUDO = `#!/bin/bash
if [ -n "$FAKE_SUDO_DENY" ] && [ "$1" = chmod ]; then echo "sudo: chmod refused" >&2; exit 1; fi
exec "$@"
`;
const CAT = `#!/bin/bash
for file in "$@"; do echo "$file" >> "$FAKE_READ"; done
sleep 1
`;

const work = mkdtempSync(join(tmpdir(), "agent-m-1193-"));
after(() => rmSync(work, { recursive: true, force: true }));
const shim = join(work, "bin");
const catShim = join(work, "cat-bin");
mkdirSync(shim);
mkdirSync(catShim);
for (const [dir, name, body] of [[shim, "apt-get", APT], [shim, "sudo", SUDO], [shim, "openbox", "#!/bin/bash\necho openbox 3.6.1\n"], [catShim, "cat", CAT]]) {
  writeFileSync(join(dir, name), body);
  chmodSync(join(dir, name), 0o755);
}

let counter = 0;
// A machine: its own home, a file for each of the four programs (executable), its folder of dpkg's file lists with five lists, and its record.
function machine() {
  const dir = join(work, `machine-${counter++}`);
  const host = { dir, home: join(dir, "home"), hooks: HOOKS.map((hook) => join(dir, "hooks", basename(hook))), info: join(dir, "info"), events: join(dir, "events"), calls: join(dir, "calls"), read: join(dir, "read") };
  mkdirSync(host.home, { recursive: true });
  mkdirSync(join(dir, "hooks"));
  mkdirSync(host.info);
  for (const name of ["a", "b", "c", "d", "e"]) writeFileSync(join(host.info, `${name}.list`), "/usr/bin/x\n");
  for (const hook of host.hooks) {
    writeFileSync(hook, "#!/bin/sh\nexit 0\n");
    chmodSync(hook, 0o755);
  }
  for (const file of [host.events, host.calls, host.read]) writeFileSync(file, "");
  return host;
}
const lines = (path) => readFileSync(path, "utf8").split("\n").filter(Boolean);
const executable = (path) => (statSync(path).mode & 0o111) !== 0;
// Run a script on a machine as GitHub runs a step (`bash -e`), with the machine's paths in place of the runner's. `env` adds to the environment;
// `shims` is the PATH folder of the case. Returns the status, the stderr, the seconds the script took and what the shims recorded.
function run(script, host, { env = {}, shims = shim } = {}) {
  let moved = script.replaceAll("/home/runner", host.home).replaceAll("/var/lib/dpkg/info", host.info);
  HOOKS.forEach((hook, index) => { moved = moved.replaceAll(hook, host.hooks[index]); });
  const started = Date.now();
  const done = spawnSync("bash", ["-e", "-c", moved], {
    cwd: host.dir,
    encoding: "utf8",
    timeout: 20000,
    stdio: ["ignore", "pipe", "pipe"],
    env: { PATH: `${shims}:${process.env.PATH}`, HOME: host.home, FAKE_EVENTS: host.events, FAKE_CALLS: host.calls, FAKE_HOOKS: host.hooks.join(" "), FAKE_READ: host.read, ...env },
  });
  return { status: done.status, stderr: done.stderr, seconds: (Date.now() - started) / 1000, events: lines(host.events), calls: lines(host.calls) };
}
const INSTALL = "Install xvfb and openbox";
const WARM = "Read dpkg's file lists ahead";
// The same script with the removal of the programs made a no-op.
const withoutRemoval = (script) => {
  assert.match(script, /sudo chmod -x "\$hook"/, 'the script takes each program away with sudo chmod -x "$hook" (known positive of the replacement below)');
  return script.replace(/sudo chmod -x "\$hook"/, "true");
};
// Wait up to five seconds for the file `path` to hold `count` lines.
async function linesOf(path, count) {
  for (let waited = 0; waited < 5000; waited += 100) {
    if (lines(path).length >= count) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return lines(path);
}

// TST-1193001 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml, a machine of GitHub Actions (GITHUB_ACTIONS is set) on which the four programs are executable and the cache holds the archives
// input: the script of the step "Install xvfb and openbox" in the job `node`, run under `bash -e` against the model of apt
// expect: exit code 0; when apt is called none of the four programs is executable (`hook-skipped:` for each, in the order dpkg-preconfigure, update-motd-updates-available, apt-pinvoke, dpkg-status), and apt installs from the cache (`install-from-cache`), in this order and nothing else; afterwards none is executable
// Planted fault: a step that leaves one of the four programs executable records `hook-ran:` for it (TST-1193002 shows the model able to).
test("tests.yml: the install step of a node shard takes the hooks of debconf, update-notifier and needrestart away before apt runs them", () => {
  const host = machine();
  const result = run(scriptOf(INSTALL), host, { env: { GITHUB_ACTIONS: "true" } });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.events, [...skipped, "install-from-cache"]);
  assert.deepEqual(host.hooks.map(executable), [false, false, false, false], "none of the four is executable afterwards");
});

// TST-1193002 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the machine of TST-1193001
// input: the same script with `sudo chmod -x "$hook"` replaced by `true`, run under `bash -e` against the model of apt
// expect: exit code 0; the model records `hook-ran:` for each of the four and then `install-from-cache`, which shows that the model sees a hook where the step leaves it
// Planted fault: a model whose apt records `hook-skipped:` whatever the file's mode fails this case and TST-1193001.
test("tests.yml: the same step without the removal leaves the hooks to run, as apt would run them", () => {
  const host = machine();
  const result = run(withoutRemoval(scriptOf(INSTALL)), host, { env: { GITHUB_ACTIONS: "true" } });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.events, [...ran, "install-from-cache"]);
  assert.deepEqual(host.hooks.map(executable), [true, true, true, true]);
});

// TST-1193003 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: a machine that is no runner of GitHub Actions (GITHUB_ACTIONS is not set) on which the four programs are executable
// input: the script of the step "Install xvfb and openbox" in the job `node`, run under `bash -e` against the model of apt
// expect: exit code 0; the four programs are still executable afterwards and apt runs them (`hook-ran:` for each): the step changes nothing on a machine that is not a throwaway runner
// Planted fault: a step that takes the programs away without asking for GITHUB_ACTIONS fails.
test("tests.yml: the install step leaves the hooks alone on a machine that is not a runner of GitHub Actions", () => {
  const host = machine();
  const result = run(scriptOf(INSTALL), host);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.events, [...ran, "install-from-cache"]);
  assert.deepEqual(host.hooks.map(executable), [true, true, true, true]);
});

// TST-1193004 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: a machine of GitHub Actions where sudo refuses `chmod` (FAKE_SUDO_DENY), on which the four programs are executable
// input: the script of the step "Install xvfb and openbox" in the job `node`, run under `bash -e` against the model of apt
// expect: exit code 0 and `install-from-cache`: programs that cannot be taken away only make the install slower, they do not fail the step
// Planted fault: the removal without `|| true` stops the step with exit code 1 (TST-1193005).
test("tests.yml: hooks that cannot be taken away do not fail the install step", () => {
  const host = machine();
  const result = run(scriptOf(INSTALL), host, { env: { GITHUB_ACTIONS: "true", FAKE_SUDO_DENY: "1" } });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.events, [...ran, "install-from-cache"]);
});

// TST-1193005 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the machine of TST-1193004
// input: the same script with `|| true` removed after the removal of a program, run under `bash -e` against the model of apt
// expect: exit code 1 and no `install-from-cache`, which shows that TST-1193004 is able to fail
// Planted fault: a script whose removal ignores the refusal in another way passes TST-1193004 and fails this case, which then names the way.
test("tests.yml: the removal without its guard against a refusal stops the step, as TST-1193004 would show", () => {
  const script = scriptOf(INSTALL);
  const guarded = /sudo chmod -x "\$hook" \|\| true/;
  assert.match(script, guarded, "the script ignores a refusal of the removal with || true (known positive of the replacement below)");
  const host = machine();
  const result = run(script.replace(guarded, (match) => match.replace(" || true", "")), host, { env: { GITHUB_ACTIONS: "true", FAKE_SUDO_DENY: "1" } });
  assert.equal(result.status, 1, result.stderr);
  assert.deepEqual(result.events, []);
});

// TST-1193006 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml, a machine whose folder of dpkg's file lists holds five lists, and a `cat` that records its files and then waits one second
// input: the script of the step "Read dpkg's file lists ahead" in the job `node`, run under `bash -e`
// expect: exit code 0 within half a second, although the read takes a second: the script does not wait for it; and within five seconds the five lists have been given to `cat`
// Planted fault: a script that waits for the read takes more than half a second (TST-1193007); one that reads no list records fewer than five files.
test("tests.yml: the node job reads dpkg's file lists in the background, without waiting for the read", async () => {
  const host = machine();
  const result = run(scriptOf(WARM), host, { shims: catShim });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.seconds < 0.5, `the script returned after ${result.seconds} s`);
  const files = await linesOf(host.read, 5);
  assert.deepEqual(files.map((file) => file.replace(/^.*\//, "")).sort(), ["a.list", "b.list", "c.list", "d.list", "e.list"]);
});

// TST-1193007 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the machine of TST-1193006
// input: the same script with the `&` that puts the read into the background removed, run under `bash -e`
// expect: exit code 0 after at least 0.9 seconds: the script now waits for the read, which shows that TST-1193006 is able to fail
// Planted fault: a `cat` that returns at once fails this case and passes TST-1193006 whatever the script does.
test("tests.yml: the same step without the background waits for the read, as TST-1193006 would show", () => {
  const script = scriptOf(WARM);
  const background = /\s&\s*\)/;
  assert.match(script, background, "the read ends in & before the closing parenthesis (known positive of the replacement below)");
  const host = machine();
  const result = run(script.replace(background, ")"), host, { shims: catShim });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.seconds >= 0.9, `the script returned after ${result.seconds} s`);
});

// TST-1193008 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: .github/workflows/tests.yml
// input: the steps of the job `node`
// expect: the step "Read dpkg's file lists ahead" is the first of the job, so before the checkout, the cache restore and the install step, and the install step is still before the step that runs the tests (`node --test`)
// Planted fault: the step after the checkout, or after the install step, or no such step, fails.
test("tests.yml: the read of dpkg's file lists starts the node job and the install still precedes the tests", () => {
  const steps = stepsOf(read("tests.yml"), "node");
  const names = steps.map((step) => nameOf(step) ?? step.split("\n")[0].trim());
  assert.equal(names[0], WARM, `the first step of the node job is "${WARM}"`);
  const checkout = steps.findIndex((step) => /uses:\s*actions\/checkout@/.test(step));
  const install = names.indexOf(INSTALL);
  const tests = steps.findIndex((step) => /node --test/.test(step));
  assert.ok(0 < checkout && checkout < install && install < tests, `the order is warm-up 0, checkout ${checkout}, install ${install}, tests ${tests}`);
});

// TST-1193009 · level: system · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: a machine of GitHub Actions on which update-notifier's program is not installed (its file is missing) and the other three programs are executable
// input: the script of the step "Install xvfb and openbox" in the job `node`, run under `bash -e` against the model of apt
// expect: exit code 0; dpkg-preconfigure, apt-pinvoke and dpkg-status are not executable when apt is called (`hook-skipped:` for each) and apt installs from the cache: a program that is not there, in the middle of the list, does not stop the removal of the others
// Planted fault: a step that stops at the first missing program leaves apt-pinvoke and dpkg-status executable and fails.
test("tests.yml: a hook that is not installed does not stop the removal of the others", () => {
  const host = machine();
  rmSync(host.hooks[1]);
  const result = run(scriptOf(INSTALL), host, { env: { GITHUB_ACTIONS: "true" } });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.events.filter((event) => !event.endsWith("update-motd-updates-available")), ["hook-skipped:dpkg-preconfigure", "hook-skipped:apt-pinvoke", "hook-skipped:dpkg-status", "install-from-cache"]);
  assert.deepEqual([host.hooks[0], host.hooks[2], host.hooks[3]].map(executable), [false, false, false]);
});

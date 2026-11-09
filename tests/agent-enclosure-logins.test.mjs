// MOD-agent-enclosure — the login a login step prints, kept in the agent's home where the agent cannot keep it itself (ARC-054), as
// docs/architecture/MOD-agent-enclosure.md states it: "With `keeps`, MOD-agent-processes' `Agent.keeps`, the terminal records what the step
// prints into `login.log` with `/usr/bin/script`, at a width that wraps none of its lines, and `login.json` names what to take; only macOS
// records, and elsewhere `keeps` throws `NotEnclosed` before anything is opened."; "Before it builds the environment, `wrap` takes the login of
// a recorded login step ... the last value in `login.log` that matches its pattern — joined with the lines below it that hold nothing but
// letters, digits, `_` and `-`, where a terminal wrapped it — is written to `kept.json` and the record removed; a record that holds none yet
// is left"; and the environment holds "every variable `kept.json` of the home keeps — Claude Code's `CLAUDE_CODE_OAUTH_TOKEN` on macOS".
// Run: node --test tests/agent-enclosure-logins.test.mjs
//
// Module: MOD-agent-enclosure
// Guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; NO SECRET IN THE REPOSITORY; UC-044
// Level: unit
//
// Fast and without network. No real agent and no real token: the token is a fixture string of the form Claude Code's `claude setup-token`
// prints, and the record is written as a terminal records Ink's frames — escape sequences, carriage returns, an earlier frame. The terminal of
// openTerminal is a recorder given to the enclosure, so that no window opens; on macOS the .command file it writes is also run with sh, under
// `/usr/bin/script` and sandbox-exec, around a fixture `claude` that prints such a frame.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { agentEnclosure } from "../src/agent-enclosure/index.mjs";
import { printedValue } from "../src/agent-enclosure/logins.mjs";

const PATTERN = "sk-ant-oat[0-9]+-[A-Za-z0-9_-]+";
const KEEPS = { variable: "CLAUDE_CODE_OAUTH_TOKEN", pattern: PATTERN };
const HEAD = "sk-ant-oat01-FIXTUREnotAtoken0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL";
const TAIL = "MNOPQRSTUVWXYZ_-fixture0123456789";
const TOKEN = `${HEAD}${TAIL}`;
// What a terminal records of Ink's frames: an earlier frame holding another value, then the last one, its token wrapped over two lines.
const FRAMES = [
  "\x1b[?25l\x1b[2K\x1b[1A Browser didn't open? Use the url below to sign in\r\n",
  " Your OAuth token (valid for 1 year):\r\n\r\n \x1b[33msk-ant-oat01-EARLIERframe\x1b[39m\r\n\r\n",
  "\x1b[2K\x1b[1A\x1b[2K\x1b[G \x1b[32m✓ Long-lived authentication token created successfully!\x1b[39m\r\n\r\n",
  ` Your OAuth token (valid for 1 year):\r\n\r\n \x1b[33m${HEAD}\r\n ${TAIL}\x1b[39m\r\n\r\n`,
  " \x1b[2mStore this token securely. You won't be able to see it again.\x1b[22m\r\n",
].join("");

function machine(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "am-logins-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const person = join(root, "person"), data = join(root, "data"), folder = join(root, "work");
  for (const dir of [person, data, folder]) mkdirSync(dir, { recursive: true });
  return { root, person, data, folder };
}
const enclosureOf = (m, platform, extra = {}) => agentEnclosure({ dataFolder: m.data, folder: m.folder, platform, env: { PATH: "/usr/bin:/bin" },
  personHome: m.person, identity: { name: null, email: null }, ...extra });
const record = (home, text) => {
  mkdirSync(join(home, ".agent-m"), { recursive: true, mode: 0o700 });
  writeFileSync(join(home, ".agent-m", "login.json"), JSON.stringify(KEEPS));
  writeFileSync(join(home, ".agent-m", "login.log"), text);
};

// TST-1380008 · level: unit · module: MOD-agent-enclosure
// guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-044
// given: the record of a terminal in which `claude setup-token` drew two frames: an earlier one holding sk-ant-oat01-EARLIERframe, and the last one holding the fixture token wrapped over two lines, each line indented by one space, among colour and cursor escape sequences and carriage returns
// input: printedValue(record, "sk-ant-oat[0-9]+-[A-Za-z0-9_-]+")
// expect: the fixture token, both of its lines joined, without escape sequence or space; counter-proof: a record that holds only the sign-in frame gives null, and so does an empty record
test("TST-1380008: the login a step printed is the last value of its pattern, joined where the terminal wrapped it", () => {
  assert.equal(printedValue(FRAMES, PATTERN), TOKEN);
  assert.equal(printedValue(" Browser didn't open? Use the url below to sign in\r\n https://claude.com/cai/oauth/authorize?code=true\r\n", PATTERN), null, "counter-proof: no token printed");
  assert.equal(printedValue("", PATTERN), null);
});

// TST-1380009 · level: unit · module: MOD-agent-enclosure
// guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; NO SECRET IN THE REPOSITORY
// given: an enclosure on macOS whose home holds no login, then the record of a login step that has printed nothing yet, then the record of FRAMES with login.json naming CLAUDE_CODE_OAUTH_TOKEN and the pattern
// input: wrap("claude", ["auth", "status"]) after each, then once more, and the Linux enclosure of the same working folder
// expect: without a login, and with a record that holds none yet, the environment has no CLAUDE_CODE_OAUTH_TOKEN and the record stays; with the token's record, the environment holds the token in CLAUDE_CODE_OAUTH_TOKEN, .agent-m/kept.json holds it and is readable by its owner only, and the record is removed; the next wrap still gives it, and so does the Linux enclosure; counter-proof: the enclosure of another working folder gives none
test("TST-1380009: wrap takes a recorded login into the home and gives it to the agent in its environment", (t) => {
  const m = machine(t);
  const enclosure = enclosureOf(m, "darwin");
  const at = { workdir: enclosure.home, writable: [] };
  mkdirSync(enclosure.home, { recursive: true });
  assert.equal(enclosure.wrap("claude", ["auth", "status"], at).env.CLAUDE_CODE_OAUTH_TOKEN, undefined, "no login yet");
  record(enclosure.home, " Browser didn't open? Use the url below to sign in\r\n");
  assert.equal(enclosure.wrap("claude", ["auth", "status"], at).env.CLAUDE_CODE_OAUTH_TOKEN, undefined, "the step has printed none yet");
  assert.equal(existsSync(join(enclosure.home, ".agent-m", "login.log")), true, "a record that holds none yet is left");
  record(enclosure.home, FRAMES);
  assert.equal(enclosure.wrap("claude", ["auth", "status"], at).env.CLAUDE_CODE_OAUTH_TOKEN, TOKEN);
  const kept = join(enclosure.home, ".agent-m", "kept.json");
  assert.deepEqual(JSON.parse(readFileSync(kept, "utf8")), { CLAUDE_CODE_OAUTH_TOKEN: TOKEN });
  assert.equal(statSync(kept).mode & 0o777, 0o600, "readable by its owner only");
  assert.equal(existsSync(join(enclosure.home, ".agent-m", "login.log")), false, "the record is removed once the login is taken");
  assert.equal(enclosure.wrap("claude", ["auth", "status"], at).env.CLAUDE_CODE_OAUTH_TOKEN, TOKEN, "kept for the next start");
  assert.equal(enclosureOf(m, "linux").wrap("claude", ["auth", "status"], at).env.CLAUDE_CODE_OAUTH_TOKEN, TOKEN, "the environment is the enclosure's on every platform");
  const other = agentEnclosure({ dataFolder: m.data, folder: join(m.root, "other"), platform: "darwin", env: { PATH: "/usr/bin:/bin" }, personHome: m.person, identity: { name: null, email: null } });
  assert.equal(other.wrap("claude", ["auth", "status"], at).env.CLAUDE_CODE_OAUTH_TOKEN, undefined, "counter-proof: another agent's home keeps none");
});

// TST-1380010 · level: unit · module: MOD-agent-enclosure
// guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-044
// given: an enclosure on macOS whose terminal is a recorder, and enclosures on Linux and Windows with recorders
// input: openTerminal("claude", ["setup-token"], { variable: "CLAUDE_CODE_OAUTH_TOKEN", pattern }) on each, and openTerminal("codex", ["login"]) on macOS
// expect: on macOS the terminal is opened once with /usr/bin/open and the home's agent-login.command, which records with /usr/bin/script -q into the home's .agent-m/login.log, sets the terminal's width with stty cols 1000 and starts sandbox-exec with claude setup-token; .agent-m/login.json names the variable and the pattern; on Linux and Windows the call is refused with NotEnclosed and no terminal is opened; counter-proof: codex's login step, which keeps nothing, writes a .command without /usr/bin/script and no login.json
test("TST-1380010: a login step whose output is kept is recorded by its terminal, on macOS only", async (t) => {
  const m = machine(t);
  const opened = [];
  const enclosure = enclosureOf(m, "darwin", { terminal: (command, args) => opened.push([command, args]) });
  await enclosure.openTerminal("codex", ["login"]);
  const file = join(enclosure.home, "agent-login.command");
  assert.doesNotMatch(readFileSync(file, "utf8"), /\/usr\/bin\/script/, "counter-proof: a step that keeps nothing is not recorded");
  assert.equal(existsSync(join(enclosure.home, ".agent-m", "login.json")), false);
  opened.length = 0;
  await enclosure.openTerminal("claude", ["setup-token"], KEEPS);
  assert.deepEqual(opened, [["/usr/bin/open", [file]]]);
  const text = readFileSync(file, "utf8");
  assert.ok(text.includes(`/usr/bin/script -q '${join(enclosure.home, ".agent-m", "login.log")}'`), text);
  assert.match(text, /stty cols 1000/);
  assert.match(text, /'\/usr\/bin\/sandbox-exec' '-p' .*'claude' 'setup-token'/s);
  assert.deepEqual(JSON.parse(readFileSync(join(enclosure.home, ".agent-m", "login.json"), "utf8")), KEEPS);
  for (const platform of ["linux", "win32"]) {
    const refused = [];
    const elsewhere = enclosureOf(m, platform, { terminal: (command, args) => refused.push([command, args]) });
    await assert.rejects(elsewhere.openTerminal("claude", ["setup-token"], KEEPS), { name: "NotEnclosed" }, platform);
    assert.deepEqual(refused, [], `${platform}: no terminal is opened`);
  }
});

// TST-1380011 · level: unit · module: MOD-agent-enclosure
// guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-044
// given: on macOS, a fixture `claude` on the enclosure's PATH whose `setup-token` prints the width of its terminal and FRAMES, and the .command file openTerminal("claude", ["setup-token"], keeps) wrote
// input: the .command file run with sh, as Terminal runs it; then wrap of the same enclosure
// expect: the step ran inside /usr/bin/script, at a width of 1000 columns, and the next wrap gives CLAUDE_CODE_OAUTH_TOKEN the fixture token; counter-proof: before the step ran, wrap gives none
test("TST-1380011: on macOS the recorded login step's token reaches the next start of the agent", async (t) => {
  if (process.platform !== "darwin") { t.skip("script and sandbox-exec run on macOS only"); return; }
  const m = machine(t);
  const bin = join(m.root, "bin");
  mkdirSync(bin);
  writeFileSync(join(m.root, "frames"), FRAMES);
  writeFileSync(join(bin, "claude"), `#!/bin/sh\n[ "$1" = setup-token ] || exit 64\nprintf 'width %s\\r\\n' "$(stty size | cut -d' ' -f2)"\ncat '${join(m.root, "frames")}'\n`, { mode: 0o755 });
  const enclosure = agentEnclosure({ dataFolder: m.data, folder: m.folder, platform: "darwin", env: { PATH: `${bin}:/usr/bin:/bin` }, personHome: m.person,
    identity: { name: null, email: null }, terminal: () => {} });
  await enclosure.openTerminal("claude", ["setup-token"], KEEPS);
  const at = { workdir: enclosure.home, writable: [] };
  assert.equal(enclosure.wrap("claude", ["auth", "status"], at).env.CLAUDE_CODE_OAUTH_TOKEN, undefined, "counter-proof: not before the step ran");
  const ran = spawnSync("/bin/sh", [join(enclosure.home, "agent-login.command")], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 30000 });
  assert.equal(ran.status, 0, ran.stderr);
  assert.match(readFileSync(join(enclosure.home, ".agent-m", "login.log"), "utf8"), /width 1000/);
  assert.equal(enclosure.wrap("claude", ["auth", "status"], at).env.CLAUDE_CODE_OAUTH_TOKEN, TOKEN);
});

// A fixture coding agent with an interactive terminal interface, for the tests of a CLI session kept running in a pseudo-terminal (ARC-055): installed as
// `claude`, `codex` or `opencode` on a PATH of its own, it answers `--version` and the login check like the real CLI, and, started otherwise, runs as a session
// does in a terminal — it puts its terminal in raw mode, shows a banner and a prompt, takes one bracketed paste followed by Enter as one message, echoes the
// message's lines, answers and then shows the line its register row names as the one that shows it waits for input, as the real CLI's screen was measured to
// show it (Claude Code 2.1.322, Codex 0.167.2, opencode 2.2.5).
//
// Module: MOD-agent-processes
// Level: unit
//
// What it is given travels through files the test names in the environment, never through its output:
//   FIXTURE_ARGV  — the arguments it was started with, written as JSON when it starts;
//   FIXTURE_TOLD  — every message it took, appended, each followed by a line `--- end of message ---`;
//   FIXTURE_CHILD — where a message holds SPAWN-CHILD, it starts a child that sleeps and writes the child's process id here;
//   FIXTURE_ACTION — a command of the shell it runs in its working folder for every message, before it answers, as an agent's own tools would.
// A message's answer is `answer to <its last line>.`, or, where the message holds BANNER-LINES <n>, n numbered lines first; a message `/exit <code>` ends it with
// that code. It writes nothing of a message but its echo and its answer.
//
//   terminalAgent(bin, name) -> void — writes the fixture as `<bin>/<name>`.

import { writeFileSync } from "node:fs";
import { join } from "node:path";

// The line each agent's screen shows once it has answered and waits for input, as measured (src/agent-processes/agents.md, Session column).
export const WAITING = {
  claude: "✻ Cooked for 1s · done 8:31 PM",
  codex: "  Worked for 1s • 20:37",
  opencode: "     Build · Big Pickle · 2.1s · 20.6 tok/s",
};

const SCRIPT = (name) => `
import { writeFileSync, appendFileSync } from "node:fs";
import { execSync, spawn } from "node:child_process";
const name = ${JSON.stringify(name)}, waiting = ${JSON.stringify(WAITING[name])};
const args = process.argv.slice(2);
if (args[0] === "--version") { console.log("9.9.9"); process.exit(0); }
if (["auth", "login", "models"].includes(args[0])) { console.log(name === "opencode" ? "opencode/big-pickle" : "Logged in"); process.exit(0); }
if (process.env.FIXTURE_ARGV) writeFileSync(process.env.FIXTURE_ARGV, JSON.stringify(args));
process.stdin.setRawMode?.(true);
process.stdout.write("fixture " + name + " ready\\r\\n> ");
let pending = "", pasted = null;
const answer = (message) => {
  if (process.env.FIXTURE_TOLD) appendFileSync(process.env.FIXTURE_TOLD, message + "\\n--- end of message ---\\n");
  const lines = message.split(/\\r?\\n/);
  process.stdout.write(lines.map((line) => "> " + line).join("\\r\\n") + "\\r\\n");
  const exit = /^\\/exit (\\d+)$/.exec(message.trim());
  if (exit) { process.stdout.write("bye\\r\\n"); process.exit(Number(exit[1])); }
  if (message.includes("SPAWN-CHILD")) {
    const child = spawn("/bin/sleep", ["300"], { stdio: "ignore" });
    writeFileSync(process.env.FIXTURE_CHILD, String(child.pid));
  }
  if (process.env.FIXTURE_ACTION) execSync(process.env.FIXTURE_ACTION, { stdio: "ignore", shell: "/bin/sh" });
  const banner = /BANNER-LINES (\\d+)/.exec(message);
  if (banner) for (let i = 1; i <= Number(banner[1]); i += 1) process.stdout.write("numbered line " + i + "\\r\\n");
  const last = lines.filter((line) => line.trim()).at(-1) ?? "";
  setTimeout(() => { process.stdout.write("answer to " + last + ".\\r\\n" + waiting + "\\r\\n> "); }, 50);
};
process.stdin.on("data", (chunk) => {
  pending += chunk.toString("utf8");
  for (;;) {
    if (pasted === null) {
      const start = pending.indexOf("\\x1b[200~");
      const enter = pending.indexOf("\\r");
      if (start >= 0 && (enter < 0 || start < enter)) { pending = pending.slice(start + 6); pasted = ""; continue; }
      if (enter >= 0) { pending = pending.slice(enter + 1); continue; }
      return;
    }
    const end = pending.indexOf("\\x1b[201~");
    if (end < 0) return;
    const message = pending.slice(0, end);
    const enter = pending.indexOf("\\r", end);
    if (enter < 0) return;
    pending = pending.slice(enter + 1);
    pasted = null;
    answer(message);
  }
});
`;

export function terminalAgent(bin, name) {
  const script = join(bin, `${name}-terminal.mjs`);
  writeFileSync(script, SCRIPT(name));
  writeFileSync(join(bin, name), `#!/bin/sh\nexec '${process.execPath}' '${script}' "$@"\n`, { mode: 0o755 });
}

// sessions.mjs — a coding agent kept running in a pseudo-terminal, its screen kept as text, messages typed into it, and its answer to each
// (docs/architecture/MOD-agent-processes.md: Parts, Interfaces: startSession; ARC-055).
//
// Module: MOD-agent-processes
//
// The agent is started in node-pty's pseudo-terminal; what it writes is fed to @xterm/headless, which applies the control sequences, so that what the session
// keeps is the text the terminal shows, not the bytes that draw it. Both are the Bridge app's packages (MOD-bridge-build), read where the Bridge keeps them and
// loaded only when a session starts. How an agent is started interactively in its auto mode, and the line its screen shows once it has answered and waits for
// input, are its row's Session cell (agents.md): data, as every other command of the register.

import { createRequire } from "node:module";
import { chromeOptions, modelOptions, stopTree } from "./processes.mjs";

// The terminal's size, which every supported agent draws its screen for.
const COLUMNS = 120, ROWS = 40;
// The lines the emulator holds above its screen until they are handed on; they are cleared once handed, so that a long session holds none of them for long.
const SCROLLBACK = 10000;
// Before the first text is typed, the agent has drawn its screen: it has written, and its output has then been quiet for SETTLED_MS — or it has been running
// for START_LIMIT_MS. A screen the agent shows only when it starts for the first time in a home or a folder — one that its row's `startup` patterns match —
// is answered with the keys its pattern names, at most STARTUP_ANSWERS times.
const SETTLED_MS = 1500, START_LIMIT_MS = 30000, STARTUP_ANSWERS = 6;
// A text is typed as one bracketed paste, followed, after ENTER_AFTER_MS, by Enter: the terminals' way to hand a program a text with line breaks as one input.
const PASTE_START = "\x1b[200~", PASTE_END = "\x1b[201~", ENTER = "\r", ENTER_AFTER_MS = 300;
// Erases the lines above the screen and leaves the screen as it is (ECMA-48 ED with 3, as xterm reads it).
const ERASE_SCROLLBACK = "\x1b[3J";

const failure = (name, message) => Object.assign(new Error(message), { name });
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let packages = null;
// node-pty and @xterm/headless, from the Bridge's packages (MOD-bridge-build), loaded once.
function terminalPackages() {
  if (!packages) {
    const require = createRequire(new URL("../bridge-build/package.json", import.meta.url));
    packages = { spawn: require("node-pty").spawn, Terminal: require("@xterm/headless").Terminal };
  }
  return packages;
}

// The rows `from` to `to` of a buffer as the lines the terminal shows: a row the terminal wrapped onto the next is joined with it; each line without its
// trailing blanks.
function linesOf(buffer, from, to) {
  const lines = [];
  for (let index = from; index < to; index += 1) {
    const row = buffer.getLine(index);
    const text = row?.translateToString(true) ?? "";
    if (row?.isWrapped && lines.length) lines[lines.length - 1] += text;
    else lines.push(text);
  }
  return lines.map((line) => line.trimEnd());
}

// The text of `lines` without the blank lines before and after it.
const trimmed = (lines) => {
  let start = 0, end = lines.length;
  while (start < end && !lines[start].trim()) start += 1;
  while (end > start && !lines[end - 1].trim()) end -= 1;
  return lines.slice(start, end).join("\n");
};

// Whether a line of the screen is the echo of a typed text whose last line is `tail`: it ends with it, or, where the agent broke that line itself, with a
// part of its end of at least twenty characters, or the whole of a shorter one.
function echoes(line, tail) {
  const shown = line.trim();
  if (!shown || !tail) return false;
  return shown.endsWith(tail) || (tail.endsWith(shown) && shown.length >= Math.min(20, tail.length));
}

/**
 * sessionOf(agent, { workdir, enclosure?, writable?, chrome? }, participant, helpers) -> Session — startSession of index.mjs, over `helpers`: the register's
 * row of an agent (`configuration`) and the environment of the person's own login (`ownLoginEnvironment`). `{workdir}` in the row's Session arguments stands
 * for the working folder. Throws AgentMissing, AgentNotLoggedIn and ModelUnsupported before anything starts, and NotEnclosed for an enclosure that would
 * have the terminal given a text before the agent's own — what is typed into a terminal is shown on its screen, which is the session's log.
 */
export function sessionOf(agent, { workdir, enclosure = null, writable = null, chrome = false, cwd = workdir }, participant, helpers) {
  if (!agent?.installed) throw failure("AgentMissing", "the selected agent is not installed");
  if (!agent.loggedIn) throw failure("AgentNotLoggedIn", "the selected agent is not logged in");
  const row = helpers.configuration(agent.name);
  if (!row?.session) throw failure("AgentMissing", "the selected agent is not supported");
  let command = row.command;
  let args = [...row.session.args.map((arg) => arg.replaceAll("{workdir}", cwd)), ...modelOptions(row, participant, null), ...chromeOptions(row, chrome)];
  let env = helpers.ownLoginEnvironment();
  if (enclosure) {
    const wrapped = enclosure.wrap(command, args, { workdir, writable: writable ?? [workdir], cwd });
    if (wrapped.input != null) throw failure("NotEnclosed", "this enclosure gives its agent a text before the agent's own, which a terminal would show");
    ({ command, args, env } = wrapped);
  }
  const waiting = new RegExp(row.session.waiting);
  const startup = (row.session.startup ?? []).map(({ screen: shows, keys }) => ({ shows: new RegExp(shows), keys }));
  const { spawn, Terminal } = terminalPackages();
  const terminal = new Terminal({ cols: COLUMNS, rows: ROWS, scrollback: SCROLLBACK, allowProposedApi: true });
  const child = spawn(command, args, { name: "xterm-256color", cols: COLUMNS, rows: ROWS, cwd, env: { TERM: "xterm-256color", ...env } });

  const startedAt = Date.now();
  let lastOutput = null, ended = null, pending = null;
  const listeners = [];
  // The lines handed on since the last text was typed, and what of that text answer() reads: its last line, and how many waiting lines the screen showed.
  let since = [], typed = null;
  const hand = (line) => {
    since.push(line);
    for (const listener of listeners) listener(line);
  };
  // The lines that scrolled off the screen, handed on once the next row shows they are not continued. `handedRows` rows above the screen have been read;
  // once they are many, the emulator is told to forget them — after the output already queued, whose own reading comes first, so that no row is read twice
  // and none is forgotten unread.
  let handedRows = 0, erasing = false;
  const scrolledOff = () => {
    const buffer = terminal.buffer.normal;
    for (; handedRows < buffer.baseY; handedRows += 1) {
      const row = buffer.getLine(handedRows);
      const text = row?.translateToString(true) ?? "";
      if (row?.isWrapped && pending !== null) pending += text;
      else {
        if (pending !== null) hand(pending.trimEnd());
        pending = text;
      }
    }
    if (handedRows > SCROLLBACK / 2 && !erasing) {
      erasing = true;
      terminal.write(ERASE_SCROLLBACK, () => { handedRows = 0; erasing = false; });
    }
  };
  child.onData((data) => {
    lastOutput = Date.now();
    terminal.write(data, scrolledOff);
  });
  const exited = new Promise((resolve) => child.onExit(({ exitCode }) => {
    ended = { exitCode };
    // What the agent wrote last is applied before its end is told.
    terminal.write("", () => resolve(ended));
  }));

  const screen = () => {
    const buffer = terminal.buffer.active;
    const lines = linesOf(buffer, buffer.baseY, buffer.baseY + ROWS);
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    return lines;
  };
  const transcript = () => [...since, ...(pending === null ? [] : [pending.trimEnd()]), ...screen()];

  let chain = Promise.resolve(), first = true;
  return {
    type(text) {
      const tail = String(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).at(-1) ?? "";
      typed = { tail, written: false, before: 0 };
      const mine = typed;
      chain = chain.then(async () => {
        if (first) {
          first = false;
          // The agent is taken as ready only once two settled screens in a row show no first-run screen: one may follow the last after a pause.
          for (let answers = 0, quiet = 0; ended === null && answers < STARTUP_ANSWERS && quiet < 2;) {
            while (ended === null && (lastOutput === null || Date.now() - lastOutput < SETTLED_MS) && Date.now() - startedAt < START_LIMIT_MS) await pause(50);
            const shown = screen().join("\n");
            const found = startup.find(({ shows }) => shows.test(shown));
            if (found) {
              child.write(found.keys);
              answers += 1;
              quiet = 0;
            } else quiet += 1;
            lastOutput = Date.now();
          }
        }
        if (ended !== null) return;
        since = [];
        mine.before = transcript().filter((line) => waiting.test(line)).length;
        mine.written = true;
        child.write(`${PASTE_START}${text}${PASTE_END}`);
        await pause(ENTER_AFTER_MS);
        if (ended === null) child.write(ENTER);
      });
    },
    onLine(listener) { listeners.push(listener); },
    screen,
    answer() {
      if (!typed?.written) return null;
      const lines = transcript();
      let seen = 0, at = -1;
      for (let index = 0; index < lines.length; index += 1) {
        if (!waiting.test(lines[index])) continue;
        seen += 1;
        if (seen > typed.before) { at = index; break; }
      }
      if (at < 0) return null;
      const echo = lines.slice(0, at).findIndex((line) => echoes(line, typed.tail));
      return trimmed(lines.slice(echo + 1, at));
    },
    exited,
    async stop() {
      if (ended === null) await stopTree(child);
      await exited;
    },
  };
}

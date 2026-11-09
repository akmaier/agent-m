// logins.mjs — the login a login step printed, kept in the agent's home where the agent cannot keep it itself (MOD-agent-enclosure, Data: the
// agent's home; ARC-054). Claude Code keeps its login in the keychain on macOS, which the enclosure closes; its `claude setup-token` prints a
// long-lived token instead, which the terminal of the login step records and this module takes into the home.
//
// Module: MOD-agent-enclosure
//
// A LOCAL AGENT USES THE PERSON'S OWN LOGIN: the login is the agent's own, made by the person with its own login step; the Bridge asks for none.
// It stays in `.agent-m/` of the agent's home, readable by its owner only, and reaches the agent only in the environment its enclosure gives it.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const folderOf = (home) => join(home, ".agent-m");
/** The record of the login step's terminal, in the agent's home. */
export const recordOf = (home) => join(folderOf(home), "login.log");

// Escape sequences a terminal records: OSC (a title, a link), CSI (colours, cursor moves, erasing) and the two-character ones; and carriage returns.
const ESCAPES = /\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)|\x1b\[[0-?]*[ -/]*[@-~]|\x1b[@-Z\\-_]|\r/g;
// A line that continues a value the terminal wrapped holds nothing but such characters.
const CONTINUED = /^\s*([A-Za-z0-9_-]+)\s*$/;

/**
 * printedValue(record, pattern) -> string | null — the last value in a terminal's record that matches `pattern`, joined with the lines below it that hold
 * nothing but letters, digits, `_` and `-`, where the terminal wrapped it; null where the record holds none. Pure.
 */
export function printedValue(record, pattern) {
  const lines = String(record).replace(ESCAPES, "").split("\n");
  const value = new RegExp(pattern, "g");
  let found = null;
  lines.forEach((line, at) => {
    for (const match of line.matchAll(value)) {
      let whole = match[0];
      // Only a value that ends its line can go on below it.
      if (match.index + whole.length === line.trimEnd().length) {
        for (let next = at + 1; next < lines.length && CONTINUED.test(lines[next]); next += 1) whole += CONTINUED.exec(lines[next])[1];
      }
      found = whole;
    }
  });
  return found;
}

/** awaitLogin(home, keeps) -> string — the record the next login step's terminal writes, with what to take from it named beside it. */
export function awaitLogin(home, keeps) {
  mkdirSync(folderOf(home), { recursive: true, mode: 0o700 });
  rmSync(recordOf(home), { force: true });
  writeFileSync(join(folderOf(home), "login.json"), JSON.stringify({ variable: keeps.variable, pattern: keeps.pattern }), { mode: 0o600 });
  return recordOf(home);
}

const readJson = (path) => { try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; } };

/**
 * keptLogins(home) -> Record<string, string> — every login the home keeps, each variable with its value; first the login of a recorded login step is taken
 * into them, and its record removed, where the record holds it. A record that holds none yet is left, since its step may still run. A home that cannot be
 * read keeps none.
 */
export function keptLogins(home) {
  const kept = join(folderOf(home), "kept.json");
  const logins = readJson(kept) ?? {};
  const wanted = readJson(join(folderOf(home), "login.json"));
  try {
    if (wanted?.variable && wanted?.pattern && existsSync(recordOf(home))) {
      const value = printedValue(readFileSync(recordOf(home), "utf8"), wanted.pattern);
      if (value) {
        logins[wanted.variable] = value;
        writeFileSync(kept, JSON.stringify(logins), { mode: 0o600 });
        rmSync(recordOf(home), { force: true });
      }
    }
  } catch { /* a home this process cannot write — a Windows account's profile — keeps what it kept */ }
  return Object.fromEntries(Object.entries(logins).filter(([name, value]) => typeof name === "string" && typeof value === "string"));
}

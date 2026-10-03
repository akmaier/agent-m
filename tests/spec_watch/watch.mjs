// Module: MOD-artifacts
// Guards: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-022
// Level: release
// The node half of the SPEC-read watcher of tests/test_release_sprint_02_c.py (ITM-128, ITM-144, ITM-158), by tester-opus
// (claude-opus-5-5). Loaded first by every node process whose NODE_OPTIONS names it (`--import=<this file's URL>`) — CI's node
// step, the node processes CI's Python step starts, and those the release test starts. Without RELEASE_WATCH_FILE and
// RELEASE_WATCH_LOG it does nothing.
//
// The readers of node:fs and node:fs/promises and the starters of node:child_process are wrapped: every read of the watched
// file and every `git` started inside its folder that names it is noted with the test file:line frames it came from
// ("node <reader> <path> <- <file>:<line> | …", innermost first), or the process's script when no frame is a test's. Every
// process notes that it started ("node start <script>"), so that a run in which the watcher was not loaded is told from a
// run in which it saw nothing.
import fs from "node:fs";
import cp from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (process.env.RELEASE_WATCH_FILE && process.env.RELEASE_WATCH_LOG) {
  const SELF = fileURLToPath(import.meta.url);
  const real = (p) => { try { return fs.realpathSync.native(p); } catch { return path.resolve(p); } };
  const WATCH = real(process.env.RELEASE_WATCH_FILE), LOG = process.env.RELEASE_WATCH_LOG;
  const BASE = path.basename(WATCH), HOME = path.dirname(WATCH);
  // One line of the log per note: an `-e` script argument or a command's words may hold line breaks.
  const append = (log, line) => fs.appendFileSync(log, line.replace(/[\r\n]+$/, "").replace(/[\r\n]/g, " ") + "\n");
  const frames = () => {
    const limit = Error.stackTraceLimit;
    Error.stackTraceLimit = 50;
    const stack = new Error().stack ?? "";
    Error.stackTraceLimit = limit;
    const out = [];
    for (const line of stack.split("\n").slice(1)) {
      const m = /\(?((?:file:\/\/)?\/[^()]*?):(\d+):\d+\)?\s*$/.exec(line);
      if (!m) continue;
      const file = m[1].startsWith("file:") ? fileURLToPath(m[1]) : m[1];
      if (file !== SELF && file.split(path.sep).includes("tests")) out.push(`${path.basename(file)}:${m[2]}`);
    }
    return out.join(" | ");
  };
  const note = (what) => append(LOG, `node ${what} <- ${frames() || (process.argv[1] ?? "?")}\n`);
  const asPath = (p) => (p instanceof URL ? fileURLToPath(p) : Buffer.isBuffer(p) ? p.toString()
    : typeof p === "string" ? (p.startsWith("file:") ? fileURLToPath(p) : p) : null);
  const hit = (p) => { const s = asPath(p); return s !== null && real(s) === WATCH; };
  const wrap = (obj, names, label) => { for (const n of names) { const f = obj[n]; if (typeof f !== "function") continue;
    obj[n] = function (p, ...rest) { if (hit(p)) note(`${label}.${n} ${asPath(p)}`); return f.call(this, p, ...rest); }; } };
  wrap(fs, ["readFileSync", "readFile", "openSync", "open", "createReadStream"], "fs");
  wrap(fs.promises, ["readFile", "open"], "fs.promises");
  for (const n of ["spawn", "spawnSync", "execFile", "execFileSync", "exec", "execSync"]) {
    const f = cp[n];
    cp[n] = function (cmd, ...rest) {
      const args = Array.isArray(rest[0]) ? rest[0] : [], opts = (Array.isArray(rest[0]) ? rest[1] : rest[0]) || {};
      const words = [String(cmd), ...args.map(String)].join(" ");
      let cwd = real(typeof opts === "object" && opts.cwd ? (opts.cwd instanceof URL ? fileURLToPath(opts.cwd) : String(opts.cwd)) : process.cwd());
      const c = args.map(String).indexOf("-C");
      if (c >= 0 && c + 1 < args.length) cwd = real(path.resolve(cwd, String(args[c + 1])));  // git -C <dir> runs in <dir>
      if (/^(?:\S*\/)?git(?:\s|$)/.test(words) && words.includes(BASE) && (cwd + path.sep).startsWith(HOME + path.sep)) note(`git ${words}`);
      return f.call(this, cmd, ...rest);
    };
  }
  syncBuiltinESMExports();
  append(LOG, `node start ${process.argv[1] ?? "?"}\n`);
}

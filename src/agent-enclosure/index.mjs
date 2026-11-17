// MOD-agent-enclosure — the enclosure of an agent on a Bridge (docs/architecture/MOD-agent-enclosure.md; ARC-054).
//
// Module: MOD-agent-enclosure
//
// NO MODEL READS A CREDENTIAL. Every process of a coding agent the Bridge starts runs inside what this module builds: on macOS a Seatbelt profile, on
// Linux bubblewrap, on Windows the Bridge's own account. Inside, the agent lives in its working folder: it reads and writes that folder, reads the
// system, reads and writes nothing else of the person's home, writes temporary files, uses the person's SSH agent, and receives an environment chosen
// for it. Where the enclosure does not work, `works()`
// says why and names the one-time step; the Bridge then starts no agent. Node only, in the Bridge's main process.

import { execFileSync, spawn } from "node:child_process";
import { copyFileSync, mkdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, sep } from "node:path";
import { accountFile, accountHome, accountName, grantCommands, keepAccount, launchCommand, readAccount, setUpCommand } from "./account.mjs";
import { bubblewrapArgs } from "./bubblewrap.mjs";
import { agentEnvironment, hiddenPaths } from "./holders.mjs";
import { awaitLogin, keptLogins } from "./logins.mjs";
import { seatbeltProfile } from "./seatbelt.mjs";

const SANDBOX_EXEC = "/usr/bin/sandbox-exec";

/**
 * AgentEnclosure — MOD-agent-processes' Enclosure ({ wrap }) and:
 * @typedef {{ wrap: Function, home: string,
 *   works(): Promise<{ works: true } | { works: false, reason: string, setup: string }>,
 *   prepare(at: { writable: string[], readable: string[] }): Promise<void>,
 *   setUp(): Promise<{ done: boolean, reason: string | null }>,
 *   openTerminal(command: string, args: string[], keeps?: { variable: string, pattern: string } | null): Promise<void> }} AgentEnclosure
 */

// A path as the system resolves it: its links followed where it exists, else those of its nearest existing folder. The system matches resolved paths.
function resolved(path) {
  const parts = String(path).split("/");
  for (let end = parts.length; end > 0; end -= 1) {
    try { return [realpathSync(parts.slice(0, end).join("/") || "/"), ...parts.slice(end)].join("/"); } catch { /* one folder up */ }
  }
  return path;
}
// Whether `path` is `folder` or lies below it.
const below = (path, folder) => path === folder || path.startsWith(folder.endsWith(sep) ? folder : folder + sep);
// "directory", "file" — or null for a path that does not exist.
const kind = (path) => { try { return statSync(path).isDirectory() ? "directory" : "file"; } catch { return null; } };

// The computer's git identity from its configuration: { name, email }, each null where it names none.
function gitIdentity(env) {
  const value = (key) => {
    try { return execFileSync("git", ["config", "--global", key], { encoding: "utf8", env, stdio: ["ignore", "pipe", "ignore"] }).trim() || null; } catch { return null; }
  };
  return { name: value("user.name"), email: value("user.email") };
}

// One command, waited for: { status, error, stderr }.
function ran(command, args, options = {}) {
  return new Promise((resolve) => {
    let stderr = "";
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"], ...options });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => resolve({ status: null, error, stderr }));
    child.on("close", (status) => resolve({ status, error: null, stderr: stderr.trim() }));
  });
}

// A word of the shell, quoted.
const sh = (word) => `'${String(word).replace(/'/g, "'\\''")}'`;
// The last line of a login step's .command file: Terminal is asked, in the background, to close the window whose tab runs on this terminal once the shell has ended.
const CLOSE_WINDOW = 't=$(tty) && /usr/bin/nohup /usr/bin/osascript -e "tell application \\"Terminal\\" to close (every window whose tty of tab 1 is \\"$t\\")" >/dev/null 2>&1 &';
const notEnclosed = (message) => Object.assign(new Error(message), { name: "NotEnclosed" });

/**
 * agentEnclosure({ dataFolder, folder, platform, env, personHome, identity, terminal }) -> AgentEnclosure — the enclosure of the agent whose working folder is
 * `folder`, for the Bridge whose data folder is `dataFolder`; the platform, the Bridge's environment, the person's home and the git identity default to
 * those of the running process and the computer's git configuration, and `terminal`, the start of the program that opens the system's terminal, to one
 * started detached. Pure until a function of the result is called.
 */
export function agentEnclosure({ dataFolder, folder, platform = process.platform, env = process.env, personHome = homedir(), identity = undefined,
  terminal = (command, args) => spawn(command, args, { stdio: "ignore", detached: true, env: { ...env } }).unref() }) {
  const windows = platform === "win32";
  const account = windows ? accountName(dataFolder) : null;
  const home = windows ? accountHome(account, env) : join(folder, "home");
  let known = identity;
  // The logins the home keeps are read at every start: a login step that has ended since is taken first (logins.mjs).
  const chosenEnvironment = () => agentEnvironment({ platform, env, home, identity: (known ??= gitIdentity(env)), kept: keptLogins(home) });
  // The SSH agent's socket the Bridge's environment names, resolved; null where it names none.
  const agentSocket = () => (typeof env.SSH_AUTH_SOCK === "string" && env.SSH_AUTH_SOCK ? resolved(env.SSH_AUTH_SOCK) : null);
  // The places to hide that exist now, resolved, each with whether it is a folder; one below the person's home is hidden with the home.
  const hidden = () => hiddenPaths({ platform, dataFolder, personHome }).map((path) => ({ path: resolved(path), type: kind(path) }))
    .filter(({ path, type }) => type && !below(path, resolved(personHome)));

  function wrap(command, args, { workdir, writable = [], cwd = workdir }) {
    const chosen = chosenEnvironment();
    // The agent's folders: its working folder, with its home, and the folders the Bridge names.
    const folders = [...new Set([folder, home, workdir, ...writable].map(resolved))];
    if (platform === "darwin") {
      const profile = seatbeltProfile({ personHome: resolved(personHome), folders, hidden: hidden().map(({ path }) => path) });
      return { command: SANDBOX_EXEC, args: ["-p", profile, command, ...args], env: chosen, input: null };
    }
    if (platform === "linux") {
      const socket = agentSocket();
      const masks = hidden().map(({ path, type }) => ({ path, directory: type === "directory" }));
      const runtimeDir = typeof env.XDG_RUNTIME_DIR === "string" && env.XDG_RUNTIME_DIR ? env.XDG_RUNTIME_DIR : null;
      const around = bubblewrapArgs({ personHome: resolved(personHome), writable: folders, hidden: masks, runtimeDir, socket: socket && kind(socket) ? socket : null,
        workdir: resolved(cwd) });
      return { command: "bwrap", args: [...around, "--", command, ...args], env: chosen, input: null };
    }
    if (windows) {
      const kept = readAccount(dataFolder);
      if (!kept) throw notEnclosed(`the account ${account} of this Bridge's agents has not been made`);
      const launched = launchCommand({ account, workdir: cwd, command, args });
      return { command: launched.command, args: launched.args, env: chosen, input: `${kept.password}\n` };
    }
    throw notEnclosed(`a Bridge on ${platform} has no enclosure for its agents`);
  }

  async function works() {
    if (platform === "darwin") {
      const probe = await ran(SANDBOX_EXEC, ["-p", "(version 1)(allow default)", "/usr/bin/true"]);
      return probe.status === 0 ? { works: true } : { works: false, reason: `sandbox-exec did not run a program: ${probe.error?.message ?? probe.stderr}`,
        setup: "none the Bridge knows: this macOS offers no sandbox-exec, and the Bridge starts no agent outside an enclosure" };
    }
    if (platform === "linux") {
      const probe = await ran("bwrap", ["--ro-bind", "/", "/", "--dev", "/dev", "--proc", "/proc", "--unshare-pid", "--die-with-parent", "--", "true"], { env: { PATH: env.PATH ?? "" } });
      if (probe.status === 0) return { works: true };
      if (probe.error?.code === "ENOENT") {
        return { works: false, reason: "bubblewrap (bwrap) is not installed on this computer",
          setup: "an administrator installs the package bubblewrap — `sudo apt install bubblewrap` on Debian and Ubuntu, `sudo dnf install bubblewrap` on Fedora" };
      }
      return { works: false, reason: `bubblewrap could not make its namespaces: ${probe.error?.message ?? probe.stderr}`,
        setup: "an administrator allows bubblewrap to make user namespaces — on Ubuntu 23.10 and later with an AppArmor profile for bwrap" };
    }
    if (windows) {
      const step = `an administrator confirms that the Bridge makes the account ${account}, with the Bridge's *Set up*; then the agent is installed and logged in for that account`;
      if (!readAccount(dataFolder)) return { works: false, reason: `the account ${account} of this Bridge's agents has not been made`, setup: step };
      const probe = await ran("net", ["user", account]);
      return probe.status === 0 ? { works: true } : { works: false, reason: `the account ${account} does not exist: ${probe.error?.message ?? probe.stderr}`, setup: step };
    }
    return { works: false, reason: `a Bridge on ${platform} has no enclosure for its agents`, setup: "none: the Bridge encloses its agents on macOS, Linux and Windows" };
  }

  async function prepare({ writable = [], readable = [] } = {}) {
    if (windows) {
      for (const [command, args] of grantCommands({ account, writable, readable })) {
        const done = await ran(command, args);
        if (done.status !== 0) throw notEnclosed(`${command} ${args.join(" ")} failed: ${done.error?.message ?? done.stderr}`);
      }
      return;
    }
    for (const inside of ["", "tmp", ".config", join(".local", "share"), join(".local", "state"), ".cache", ".ssh"]) mkdirSync(join(home, inside), { recursive: true, mode: 0o700 });
    // The hosts the person's ssh knows, which git's ssh in the enclosure is told (holders.mjs): the person's ~/.ssh is hidden there.
    if (kind(join(personHome, ".ssh", "known_hosts")) === "file") copyFileSync(join(personHome, ".ssh", "known_hosts"), join(home, ".ssh", "known_hosts"));
  }

  async function setUp() {
    if (!windows) {
      const state = await works();
      return state.works ? { done: true, reason: null } : { done: false, reason: state.setup };
    }
    keepAccount(dataFolder);
    const { command, args } = setUpCommand({ account, file: accountFile(dataFolder) });
    const done = await ran(command, args);
    if (done.status !== 0) return { done: false, reason: done.error?.message ?? done.stderr };
    const state = await works();
    return state.works ? { done: true, reason: null } : { done: false, reason: state.reason };
  }

  // `keeps` — what of the step's output the enclosure keeps (MOD-agent-processes' Agent.keeps): only macOS records the step's terminal.
  async function openTerminal(command, args, keeps = null) {
    if (keeps && platform !== "darwin") throw notEnclosed(`the Bridge keeps the login a login step prints on macOS only, not on ${platform}`);
    await prepare({ writable: [], readable: [] });
    if (windows) {
      const kept = readAccount(dataFolder);
      if (!kept) throw notEnclosed(`the account ${account} of this Bridge's agents has not been made`);
      const launched = launchCommand({ account, workdir: home, command, args, console: true });
      const child = spawn(launched.command, launched.args, { env: chosenEnvironment(), stdio: ["pipe", "ignore", "ignore"], detached: true });
      child.stdin.end(`${kept.password}\n`);
      child.unref();
      return;
    }
    const wrapped = wrap(command, args, { workdir: home, writable: [] });
    const words = ["/usr/bin/env", "-i", ...Object.entries(wrapped.env).map(([key, value]) => sh(`${key}=${value}`)), sh(wrapped.command), ...wrapped.args.map(sh)].join(" ");
    if (platform === "darwin") {
      const file = join(home, "agent-login.command");
      // A step whose login is kept runs inside `script`, which records what it prints, at a width that wraps none of its lines.
      const line = keeps ? `/usr/bin/script -q ${sh(awaitLogin(home, keeps))} /bin/sh -c ${sh('stty cols 1000 2>/dev/null; exec "$@"')} sh ${words}` : words;
      // A step that ends well closes its window, which Terminal itself is asked for; one that fails leaves its window open with its error.
      writeFileSync(file, `#!/bin/sh\ncd ${sh(home)} || exit 1\n${line} || exit\n${CLOSE_WINDOW}\n`, { mode: 0o700 });
      terminal("/usr/bin/open", [file]);
      return;
    }
    terminal("x-terminal-emulator", ["-e", "/bin/sh", "-c", `cd ${sh(home)} && exec ${words}`]);
  }

  return Object.freeze({ home, wrap, works, prepare, setUp, openTerminal });
}

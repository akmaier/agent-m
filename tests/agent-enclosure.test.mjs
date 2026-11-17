// MOD-agent-enclosure — the enclosure every coding agent a Bridge starts runs in (ARC-054), as docs/architecture/MOD-agent-enclosure.md
// states it: the agent's working folder read and written, nothing else of the person's home, the places that hold credentials hidden, the
// person's SSH agent open, an
// environment chosen rather than inherited, and per platform a Seatbelt profile (macOS), bubblewrap's arguments (Linux) or the Bridge's own
// account (Windows); whether it works, and the one-time step where it does not.
// Run: node --test tests/agent-enclosure.test.mjs
//
// Module: MOD-agent-enclosure
// Guards: NO MODEL READS A CREDENTIAL; A LOCAL AGENT USES THE PERSON'S OWN LOGIN
// Level: unit
//
// Fast and without network. The profile, the arguments and the Windows commands are checked by construction on every platform; on macOS the
// profile also runs, around a probe in Node that tries what an agent's tool would try, over fixture files and a fixture socket in a
// temporary folder that stands for the person's home, the Bridge's data folder and the agent's working folder. No credential of the computer
// is read: the keychain is probed with a public root certificate. The same probe run without the enclosure is the known positive of each
// negative. Linux and Windows are not run here: bubblewrap and a second account need such a computer.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { agentEnclosure } from "../src/agent-enclosure/index.mjs";
import { agentEnvironment, hiddenPaths } from "../src/agent-enclosure/holders.mjs";
import { seatbeltProfile } from "../src/agent-enclosure/seatbelt.mjs";
import { bubblewrapArgs } from "../src/agent-enclosure/bubblewrap.mjs";
import { accountName } from "../src/agent-enclosure/account.mjs";

const SECRET = "ghp_FIXTUREnotArealToken0123456789abcd";

// A computer in a temporary folder: the person's home with the git login's places and the hosts its ssh knows, the Bridge's data folder with its
// pairing token, and, in the person's home, an agent's working folder with the Bridge's clones and one job's checkout.
function computer(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "am-enc-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const person = join(root, "person"), data = join(root, "data"), folder = join(person, "work");
  for (const dir of [join(person, ".ssh"), join(person, ".config", "gh"), data, join(folder, "instance"), join(folder, "products", "p"), join(folder, "jobs", "J")]) mkdirSync(dir, { recursive: true });
  writeFileSync(join(person, ".ssh", "id_fixture"), `${SECRET}\n`);
  writeFileSync(join(person, ".git-credentials"), `https://x:${SECRET}@github.com\n`);
  writeFileSync(join(person, ".config", "gh", "hosts.yml"), `oauth_token: ${SECRET}\n`);
  writeFileSync(join(person, ".gitconfig"), "[user]\n\tname = Fixture\n");
  writeFileSync(join(person, ".ssh", "known_hosts"), "github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl\n");
  writeFileSync(join(data, "pairing-token"), `${SECRET}\n`);
  writeFileSync(join(folder, "instance", "AGENTS.md"), "the instance\n");
  writeFileSync(join(folder, "jobs", "J", "README.md"), "the checkout\n");
  return { root, person, data, folder, checkout: join(folder, "jobs", "J"), socket: join(root, "a.sock") };
}

// TST-1380001 · level: unit · module: MOD-agent-enclosure
// guards: NO MODEL READS A CREDENTIAL; A LOCAL AGENT USES THE PERSON'S OWN LOGIN
// given: the Bridge's environment with PATH, LANG and TERM, a token in GH_TOKEN, a key in ANTHROPIC_API_KEY, an SSH agent, a session bus and the person's HOME
// input: agentEnvironment for macOS and for Windows, with the agent's home and the identity { name: "Fixture Person", email: "fixture@example.org" }
// expect: on macOS PATH, LANG and TERM are kept; HOME is the agent's home, XDG_CONFIG_HOME, XDG_DATA_HOME, XDG_CACHE_HOME, XDG_STATE_HOME and TMPDIR lie in it; GIT_TERMINAL_PROMPT is 0 and the four git identity variables name the identity; SSH_AUTH_SOCK names the SSH agent and GIT_SSH_COMMAND names the home's .ssh/known_hosts as ssh's UserKnownHostsFile; GH_TOKEN, ANTHROPIC_API_KEY and DBUS_SESSION_BUS_ADDRESS are absent and no value holds the token; on Windows USERPROFILE, APPDATA, LOCALAPPDATA, TEMP and TMP lie in the account's home and PATH begins with its own folders of programs, and SSH_AUTH_SOCK is absent — the person's agent is another user's; counter-proof: PATH, the one variable passed as it is, is there
test("TST-1380001: the agent's environment is chosen, not inherited", () => {
  const env = { PATH: "/usr/bin:/bin", LANG: "de_DE.UTF-8", TERM: "xterm", GH_TOKEN: SECRET, ANTHROPIC_API_KEY: "sk-ant-fixture", SSH_AUTH_SOCK: "/tmp/agent.sock",
    DBUS_SESSION_BUS_ADDRESS: "unix:path=/run/user/501/bus", HOME: "/Users/person", SystemRoot: "C:\\Windows" };
  const identity = { name: "Fixture Person", email: "fixture@example.org" };
  const mac = agentEnvironment({ platform: "darwin", env, home: "/work/home", identity });
  assert.equal(mac.PATH, env.PATH, "counter-proof: PATH is passed as it is");
  assert.equal(mac.LANG, env.LANG);
  assert.equal(mac.TERM, env.TERM);
  assert.equal(mac.HOME, "/work/home");
  for (const name of ["XDG_CONFIG_HOME", "XDG_DATA_HOME", "XDG_CACHE_HOME", "XDG_STATE_HOME", "TMPDIR"]) assert.ok(mac[name].startsWith("/work/home/"), `${name} lies in the home: ${mac[name]}`);
  assert.equal(mac.GIT_TERMINAL_PROMPT, "0");
  assert.deepEqual([mac.GIT_AUTHOR_NAME, mac.GIT_COMMITTER_NAME, mac.GIT_AUTHOR_EMAIL, mac.GIT_COMMITTER_EMAIL], ["Fixture Person", "Fixture Person", "fixture@example.org", "fixture@example.org"]);
  assert.equal(mac.SSH_AUTH_SOCK, "/tmp/agent.sock", "the person's SSH agent signs for the agent");
  assert.equal(mac.GIT_SSH_COMMAND, "ssh -o UserKnownHostsFile='/work/home/.ssh/known_hosts'");
  for (const name of ["GH_TOKEN", "ANTHROPIC_API_KEY", "DBUS_SESSION_BUS_ADDRESS"]) assert.equal(name in mac, false, `${name} is not passed`);
  assert.equal(Object.values(mac).some((value) => value.includes(SECRET)), false, "no value holds the token");

  const win = agentEnvironment({ platform: "win32", env, home: "C:\\Users\\agentm-0123456789ab", identity });
  assert.equal(win.USERPROFILE, "C:\\Users\\agentm-0123456789ab");
  for (const name of ["APPDATA", "LOCALAPPDATA", "TEMP", "TMP"]) assert.ok(win[name].startsWith("C:\\Users\\agentm-0123456789ab\\"), `${name}: ${win[name]}`);
  assert.equal(win.SystemRoot, "C:\\Windows");
  assert.ok(win.PATH.startsWith("C:\\Users\\agentm-0123456789ab\\"), `the account's own programs come first: ${win.PATH}`);
  assert.equal("GH_TOKEN" in win, false);
  assert.equal("SSH_AUTH_SOCK" in win, false);
});

// TST-1380002 · level: unit · module: MOD-agent-enclosure
// guards: NO MODEL READS A CREDENTIAL
// given: the person's home /Users/person and the Bridge's data folder /Users/person/Library/Application Support/io.github.acme.agent-m.bridge
// input: hiddenPaths for macOS and for Linux
// expect: both hide the data folder and, in the person's home, .ssh, .git-credentials, .config/git/credentials, .netrc, .cache/git/credential, .git-credential-cache, .config/gh and .config/glab-cli; macOS also Library/Keychains; counter-proof: the person's home itself is not hidden
test("TST-1380002: the places that hold the Bridge's and the git login's credentials are hidden", () => {
  const dataFolder = "/Users/person/Library/Application Support/io.github.acme.agent-m.bridge";
  const login = [".ssh", ".git-credentials", ".config/git/credentials", ".netrc", ".cache/git/credential", ".git-credential-cache", ".config/gh", ".config/glab-cli"].map((place) => `/Users/person/${place}`);
  const mac = hiddenPaths({ platform: "darwin", dataFolder, personHome: "/Users/person" });
  const linux = hiddenPaths({ platform: "linux", dataFolder, personHome: "/Users/person" });
  for (const path of [dataFolder, ...login]) {
    assert.ok(mac.includes(path), `macOS hides ${path}`);
    assert.ok(linux.includes(path), `Linux hides ${path}`);
  }
  assert.ok(mac.includes("/Users/person/Library/Keychains"));
  assert.equal(mac.includes("/Users/person"), false, "counter-proof: the home itself stays readable");
});

// TST-1380003 · level: unit · module: MOD-agent-enclosure
// guards: NO MODEL READS A CREDENTIAL
// given: the person's home /h, the agent's folders /h/work and /w/"jobs", the hidden place /d
// input: seatbeltProfile
// expect: the profile allows by default, denies every write, allows writing /private/tmp, /private/var/folders and /dev, then denies reading and writing /h, then allows reading and writing the two folders, and only then denies reading and writing /d — a later rule overrides an earlier one —; it refuses the keychain's three services; the quote in a path is escaped; counter-proof: no rule refuses a Unix socket, so the SSH agent's stays open
test("TST-1380003: the Seatbelt profile lets the agent read and write its folders, and nothing else of the person's home", () => {
  const profile = seatbeltProfile({ personHome: "/h", folders: ["/h/work", '/w/"jobs"'], hidden: ["/d"] });
  const at = (text, from = 0) => { const index = profile.indexOf(text, from); assert.notEqual(index, -1, `the profile holds ${text}:\n${profile}`); return index; };
  const allowDefault = at("(allow default)"), denyWrite = at("(deny file-write*)"), allowWrite = at("(allow file-write*");
  const denyHome = at("(deny file-read* file-write*"), allowFolders = at("(allow file-read* file-write*"), hide = at("(deny file-read* file-write*", allowFolders);
  assert.ok(allowDefault < denyWrite && denyWrite < allowWrite && allowWrite < denyHome && denyHome < allowFolders && allowFolders < hide, profile);
  for (const path of ['(subpath "/private/tmp")', '(subpath "/private/var/folders")', '(subpath "/dev")']) { const index = at(path, allowWrite); assert.ok(index < denyHome, `temporary: ${path}`); }
  assert.ok(at('(subpath "/h")', denyHome) < allowFolders, "the person's home is refused");
  for (const path of ['(subpath "/h/work")', '(subpath "/w/\\"jobs\\"")']) { const index = at(path, allowFolders); assert.ok(index < hide, `the agent's folder: ${path}`); }
  assert.ok(at('(subpath "/d")', hide) > hide, "hidden after the folders");
  for (const service of ["com.apple.SecurityServer", "com.apple.securityd.xpc", "com.apple.secd"]) at(`(global-name "${service}")`);
  assert.equal(/unix-socket|network-outbound/.test(profile), false, "counter-proof: the SSH agent's socket is not refused");
});

// TST-1380004 · level: unit · module: MOD-agent-enclosure
// guards: NO MODEL READS A CREDENTIAL
// given: the person's home /h, the writable folders /h/work and /h/work/jobs/J, the hidden folder /d, the hidden file /e/.netrc, the runtime folder /run/user/1000, the SSH agent's socket /tmp/ssh-x/agent.1, the working folder /h/work/jobs/J
// input: bubblewrapArgs
// expect: in this order: --die-with-parent, --new-session, --unshare-pid, the whole file system read-only (--ro-bind / /), a new /dev and /proc, a private /tmp; an empty tmpfs over /h and over the runtime folder; the two folders bound writable; the socket bound in; /d replaced by an empty tmpfs and /e/.netrc by /dev/null — each after the binds, so that a hidden place inside a writable folder stays hidden —; --chdir /h/work/jobs/J last; counter-proof: without a socket nothing is bound in for it
test("TST-1380004: bubblewrap's arguments hide the person's home, bind the agent's folders and the SSH agent in, and hide the credential holders after them", () => {
  const given = { personHome: "/h", writable: ["/h/work", "/h/work/jobs/J"], hidden: [{ path: "/d", directory: true }, { path: "/e/.netrc", directory: false }], runtimeDir: "/run/user/1000", workdir: "/h/work/jobs/J" };
  const args = bubblewrapArgs({ ...given, socket: "/tmp/ssh-x/agent.1" });
  const joined = args.join(" ");
  const at = (text) => { const index = joined.indexOf(text); assert.notEqual(index, -1, `the arguments hold ${text}: ${joined}`); return index; };
  assert.deepEqual(args.slice(0, 3), ["--die-with-parent", "--new-session", "--unshare-pid"]);
  const ro = at("--ro-bind / /"), dev = at("--dev /dev"), proc = at("--proc /proc"), tmp = at("--tmpfs /tmp "), home = at("--tmpfs /h "), runtime = at("--tmpfs /run/user/1000");
  const work = at("--bind /h/work /h/work"), job = at("--bind /h/work/jobs/J /h/work/jobs/J"), socket = at("--bind /tmp/ssh-x/agent.1 /tmp/ssh-x/agent.1");
  const data = at("--tmpfs /d"), netrc = at("--ro-bind /dev/null /e/.netrc");
  assert.ok(ro < dev && dev < proc && proc < tmp && tmp < home && home < runtime && runtime < work && work < job && job < socket && socket < data && socket < netrc, joined);
  assert.deepEqual(args.slice(-2), ["--chdir", "/h/work/jobs/J"]);
  assert.equal(bubblewrapArgs({ ...given, socket: null }).join(" ").includes("ssh-x"), false, "counter-proof: no socket, no bind");
});

// TST-1380005 · level: unit · module: MOD-agent-enclosure
// guards: NO MODEL READS A CREDENTIAL
// given: a Bridge whose data folder holds agent-account.json with the account's password, on Windows
// input: the account's name, and wrap("claude", ["-p", "--output-format", "json"], { workdir: C:\work\jobs\J, writable: [C:\work\jobs\J] }) of its enclosure
// expect: the name is agentm- and the first twelve hex digits of the SHA-256 of the data folder's path; the command is powershell.exe with -EncodedCommand, whose script is launcher.ps1 followed by one call of Invoke-Launch with -Account <name>, -Directory C:\work\jobs\J, -Program claude and -ArgumentLine the command line `-p --output-format json` in base64; the password reaches the launcher only as the first line of its input, in no argument, not in the script and in no variable; the environment names the account's profile; launcher.ps1 loads the account's profile, reads the password from the first line, and puts the program in a job object that ends it with the launcher; setup.ps1 makes a local account whose password never expires, hidden from the sign-in screen; counter-proof: the input holds the password
test("TST-1380005: on Windows the agent runs as the Bridge's own account, its password only in the launcher's input", (t) => {
  const machine = computer(t);
  const password = "Fixture-Passw0rd-not-real";
  writeFileSync(join(machine.data, "agent-account.json"), JSON.stringify({ account: accountName(machine.data), password }));
  const name = accountName(machine.data);
  assert.equal(name, `agentm-${createHash("sha256").update(machine.data).digest("hex").slice(0, 12)}`);
  assert.ok(name.length <= 20);
  const enclosure = agentEnclosure({ dataFolder: machine.data, folder: "C:\\work", platform: "win32", env: { PATH: "C:\\Windows\\system32", SystemDrive: "C:" }, personHome: "C:\\Users\\person", identity: { name: null, email: null } });
  const wrapped = enclosure.wrap("claude", ["-p", "--output-format", "json"], { workdir: "C:\\work\\jobs\\J", writable: ["C:\\work\\jobs\\J"] });
  assert.equal(wrapped.command, "powershell.exe");
  assert.equal(wrapped.args.at(-2), "-EncodedCommand", wrapped.args.join(" "));
  const script = Buffer.from(wrapped.args.at(-1), "base64").toString("utf16le");
  const launcher = readFileSync(new URL("../src/agent-enclosure/launcher.ps1", import.meta.url), "utf8");
  assert.ok(script.startsWith(launcher), "the script is the launcher");
  const call = /^Invoke-Launch -Account '([^']*)' -Directory '([^']*)' -Program '([^']*)' -ArgumentLine '([^']*)'$/m.exec(script);
  assert.ok(call, script.slice(-400));
  assert.deepEqual(call.slice(1, 4), [name, "C:\\work\\jobs\\J", "claude"]);
  assert.equal(Buffer.from(call[4], "base64").toString("utf8"), "-p --output-format json");
  assert.equal(wrapped.input, `${password}\n`, "counter-proof: the launcher's input holds the password");
  assert.equal(wrapped.args.some((arg) => arg.includes(password)) || script.includes(password), false, "no argument and not the script holds the password");
  assert.equal(Object.values(wrapped.env).some((each) => each.includes(password)), false, "no variable holds the password");
  assert.equal(wrapped.env.USERPROFILE, `C:\\Users\\${name}`);
  for (const text of ["LoadUserProfile", "ReadLine()", "JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE", "AssignProcessToJobObject", "RedirectStandardInput"]) assert.ok(launcher.includes(text), `launcher.ps1 holds ${text}`);
  const setup = readFileSync(new URL("../src/agent-enclosure/setup.ps1", import.meta.url), "utf8");
  for (const text of ["New-LocalUser", "PasswordNeverExpires", "SpecialAccounts\\UserList"]) assert.ok(setup.includes(text), `setup.ps1 holds ${text}`);
});

// TST-1380006 · level: unit · module: MOD-agent-enclosure
// guards: NO MODEL READS A CREDENTIAL
// given: a Linux computer whose PATH holds no bwrap, and a Windows Bridge whose data folder holds no agent-account.json
// input: works() of each enclosure
// expect: Linux answers that it does not work, naming bubblewrap in its reason and an administrator installing the package bubblewrap as its one-time step; Windows answers that it does not work, naming the account in its reason and an administrator confirming that the Bridge makes it as its step; counter-proof: on macOS, where sandbox-exec is part of the system, works() answers that it works
test("TST-1380006: an enclosure that cannot work says why and names its one-time step", async (t) => {
  const machine = computer(t);
  const empty = join(machine.root, "empty-bin");
  mkdirSync(empty);
  const linux = await agentEnclosure({ dataFolder: machine.data, folder: machine.folder, platform: "linux", env: { PATH: empty }, personHome: machine.person, identity: { name: null, email: null } }).works();
  assert.equal(linux.works, false);
  assert.match(linux.reason, /bubblewrap|bwrap/);
  assert.match(linux.setup, /administrator installs the package bubblewrap/);
  const windows = await agentEnclosure({ dataFolder: machine.data, folder: "C:\\work", platform: "win32", env: { PATH: empty }, personHome: machine.person, identity: { name: null, email: null } }).works();
  assert.equal(windows.works, false);
  assert.match(windows.reason, new RegExp(accountName(machine.data)));
  assert.match(windows.setup, /administrator confirms/);
  if (process.platform !== "darwin") { t.diagnostic("the counter-proof needs macOS"); return; }
  assert.deepEqual(await agentEnclosure({ dataFolder: machine.data, folder: machine.folder, personHome: machine.person }).works(), { works: true }, "counter-proof: macOS encloses");
});

// The probe an agent's tool would be: it tries each way to a credential and says what it got, as JSON on its standard output.
const PROBE = `
const fs = require("node:fs"), net = require("node:net"), { spawnSync } = require("node:child_process");
const [data, person, checkout, instance, socket] = process.argv.slice(2);
const read = (path) => { try { return fs.readFileSync(path, "utf8").includes(${JSON.stringify(SECRET)}) ? "secret" : "read"; } catch (error) { return error.code; } };
const write = (path) => { try { fs.writeFileSync(path, "x"); return "written"; } catch (error) { return error.code; } };
const keychain = spawnSync("/usr/bin/security", ["find-certificate", "-c", "Apple Root CA", "/System/Library/Keychains/SystemRootCertificates.keychain"]).status;
const found = { data: read(data + "/pairing-token"), ssh: read(person + "/.ssh/id_fixture"), credentials: read(person + "/.git-credentials"), gh: read(person + "/.config/gh/hosts.yml"),
  gitconfig: write(person + "/.gitconfig"), instance: write(instance + "/planted"), checkout: write(checkout + "/new.txt"), home: write(process.env.HOME + "/new.txt"),
  readme: read(checkout + "/README.md"), personFile: read(person + "/.gitconfig"), knownHosts: read(process.env.HOME + "/.ssh/known_hosts"),
  gitSsh: process.env.GIT_SSH_COMMAND ?? null, env: Object.values(process.env).some((value) => value.includes(${JSON.stringify(SECRET)})), sshAuthSock: process.env.SSH_AUTH_SOCK ?? null,
  homeVar: process.env.HOME, keychain };
const c = net.connect(socket);
c.on("data", (d) => { found.socket = String(d); console.log(JSON.stringify(found)); process.exit(0); });
c.on("error", (error) => { found.socket = error.code; console.log(JSON.stringify(found)); process.exit(0); });
`;

const ran = (command, args, options) => new Promise((resolve, reject) => {
  const child = spawn(command, args, options);
  let out = "", err = "";
  child.stdout.on("data", (chunk) => { out += chunk; });
  child.stderr.on("data", (chunk) => { err += chunk; });
  child.on("error", reject);
  child.on("close", (status) => resolve({ status, out, err }));
});

// TST-1380007 · level: unit · module: MOD-agent-enclosure
// guards: NO MODEL READS A CREDENTIAL
// given: on macOS, a fixture computer — the person's home with .ssh/id_fixture, .ssh/known_hosts, .git-credentials, .config/gh/hosts.yml and .gitconfig, the Bridge's data folder with its pairing token, in the person's home an agent's working folder with the clone of the instance and the job's checkout —, a fixture SSH agent socket that answers "hello", and a Bridge whose environment holds a token in GH_TOKEN and the socket in SSH_AUTH_SOCK
// input: the probe run in the agent's enclosure — wrap(node, [probe, …], { workdir: the checkout, writable: [the checkout] }) after prepare —, and the same probe run as a plain child with the Bridge's environment
// expect: in the enclosure, the pairing token, the SSH key, git's credentials, gh's token and the person's .gitconfig cannot be read (EPERM), the person's .gitconfig cannot be written (EPERM), the clone of the instance, the checkout and the agent's home — all in the working folder — can, the checkout's README is read, the home's .ssh/known_hosts is the person's copy and GIT_SSH_COMMAND names it, no variable holds the token, SSH_AUTH_SOCK names the socket, HOME is the agent's home, the keychain does not find the public root certificate (44) and the SSH agent's socket answers; counter-proof: as a plain child each holder is read and the .gitconfig written, the variable holds the token and the keychain finds the certificate (0)
test("TST-1380007: on macOS an enclosed agent lives in its working folder with the person's SSH agent, and reaches no credential", async (t) => {
  if (process.platform !== "darwin") { t.skip("Seatbelt runs on macOS only"); return; }
  const machine = computer(t);
  const probe = join(machine.root, "probe.cjs");
  writeFileSync(probe, PROBE);
  const server = createServer((connection) => connection.end("hello"));
  await new Promise((resolve) => server.listen(machine.socket, resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const bridgeEnv = { PATH: process.env.PATH, HOME: machine.person, GH_TOKEN: SECRET, SSH_AUTH_SOCK: machine.socket };
  const args = [probe, machine.data, machine.person, machine.checkout, join(machine.folder, "instance"), machine.socket];

  const plain = JSON.parse((await ran(process.execPath, args, { env: bridgeEnv })).out);
  assert.deepEqual([plain.data, plain.ssh, plain.credentials, plain.gh, plain.personFile], ["secret", "secret", "secret", "secret", "read"], "known positive: a plain child reads every holder and the person's files");
  assert.deepEqual([plain.gitconfig, plain.instance, plain.env, plain.keychain, plain.socket], ["written", "written", true, 0, "hello"], "known positive: and writes, sees, finds and connects");

  const enclosure = agentEnclosure({ dataFolder: machine.data, folder: machine.folder, platform: "darwin", env: bridgeEnv, personHome: machine.person, identity: { name: "Fixture", email: "f@example.org" } });
  await enclosure.prepare({ writable: [machine.checkout], readable: [join(machine.folder, "instance")] });
  const wrapped = enclosure.wrap(process.execPath, args, { workdir: machine.checkout, writable: [machine.checkout] });
  const done = await ran(wrapped.command, wrapped.args, { cwd: machine.checkout, env: wrapped.env });
  assert.equal(done.status, 0, done.err);
  const inside = JSON.parse(done.out);
  assert.deepEqual([inside.data, inside.ssh, inside.credentials, inside.gh, inside.personFile], ["EPERM", "EPERM", "EPERM", "EPERM", "EPERM"], JSON.stringify(inside));
  assert.equal(inside.gitconfig, "EPERM", "the person's git configuration is not written");
  assert.deepEqual([inside.instance, inside.checkout, inside.home, inside.readme], ["written", "written", "written", "read"], "the agent works in its working folder");
  assert.equal(inside.knownHosts, "read", "the home holds the copy of the hosts the person's ssh knows");
  assert.equal(readFileSync(join(enclosure.home, ".ssh", "known_hosts"), "utf8"), readFileSync(join(machine.person, ".ssh", "known_hosts"), "utf8"));
  assert.equal(inside.gitSsh, `ssh -o UserKnownHostsFile='${join(enclosure.home, ".ssh", "known_hosts")}'`);
  assert.equal(inside.env, false);
  assert.equal(inside.sshAuthSock, machine.socket);
  assert.equal(inside.homeVar, enclosure.home);
  assert.equal(inside.keychain, 44, "the keychain finds nothing");
  assert.equal(inside.socket, "hello", "the SSH agent's socket answers");
  assert.equal(readFileSync(join(machine.person, ".gitconfig"), "utf8"), "x", "the plain child's write stands, the enclosed one's did not happen");
  assert.equal(existsSync(join(enclosure.home, "new.txt")), true);
});

// TST-1380012 · level: unit · module: MOD-agent-enclosure
// guards: NO MODEL READS A CREDENTIAL
// given: the Bridge's environment with PATH and an SSL_CERT_FILE of its own, /opt/proxy/roots.pem
// input: agentEnvironment for macOS, for Linux and for Windows
// expect: on macOS SSL_CERT_FILE names the system's certificate bundle /etc/ssl/cert.pem, the roots without the keychain, whose services the enclosure refuses;
// on Linux and Windows the agent receives no SSL_CERT_FILE, the Bridge's own among it; counter-proof: /etc/ssl/cert.pem exists on this macOS computer
test("TST-1380012: on macOS an agent finds the trusted roots in the system's bundle, not in the keychain", () => {
  const env = { PATH: "/usr/bin:/bin", SSL_CERT_FILE: "/opt/proxy/roots.pem" };
  assert.equal(agentEnvironment({ platform: "darwin", env, home: "/work/home" }).SSL_CERT_FILE, "/etc/ssl/cert.pem");
  assert.equal("SSL_CERT_FILE" in agentEnvironment({ platform: "linux", env, home: "/work/home" }), false);
  assert.equal("SSL_CERT_FILE" in agentEnvironment({ platform: "win32", env, home: "C:\\Users\\agentm-0123456789ab" }), false);
  if (process.platform === "darwin") assert.ok(existsSync("/etc/ssl/cert.pem"), "counter-proof: the bundle exists");
});

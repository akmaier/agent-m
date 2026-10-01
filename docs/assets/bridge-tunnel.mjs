// Bridge tunnel — the SSH tunnels between a machine behind NAT, a jump host and the person's machine: the settings they are
// written from are checked, a session gets its port, both commands are written, and every written command is checked.
//
// Module: MOD-bridge-tunnel
//
// Adapter (ARC-003, ARC-013). The jump host and the sessions are passed in by the caller; this module keeps none of them.
// probeLocalPort is the one request it makes: whether anything answers at a session's local port.
//
// A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL: the machine behind NAT opens `ssh -R` to a jump host the person
// names, the person's machine opens `ssh -L` to it, and the dashboard reaches the session at http://localhost:<port>.
// EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE · THE DASHBOARD WRITES THE TUNNEL COMMANDS · A REVERSE TUNNEL
// LISTENS ONLY ON THE JUMP HOST'S LOOPBACK. The bridge's own port on the NAT machine is a setting of each session
// (`bridgePort`): no bridge exists in this repository yet, so there is no port convention to take it from.
// Every value that enters a command is checked first, so that no setting can add an option or an address to it.

const HOST_RE = /^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
const SSH_USER_RE = /^[A-Za-z_][A-Za-z0-9_.-]{0,31}$/;
const KEY_FILE_RE = /^(?:~\/|\/)?[A-Za-z0-9._][A-Za-z0-9._-]*(?:\/[A-Za-z0-9._][A-Za-z0-9._-]*)*$/;
const SESSION_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$/;
export const KEEPALIVE_SECONDS = 30;
const isPort = (p, min = 1) => Number.isInteger(p) && p >= min && p <= 65535;

// What is wrong with a jump host's settings, or null.
export function jumpHostProblem(j) {
  if (!j || typeof j !== "object") return "No jump host is set.";
  if (!HOST_RE.test(String(j.host ?? ""))) return "The jump host is a host name or an IPv4 address, such as jump.example.org.";
  if (!SSH_USER_RE.test(String(j.user ?? ""))) return "The SSH user is a login name on the jump host, such as agentm.";
  if (!isPort(j.portFrom, 1024) || !isPort(j.portTo, 1024)) return "The port range lies between 1024 and 65535.";
  if (j.portFrom > j.portTo) return "The port range starts at its lower end.";
  for (const [k, what] of [["reverseKey", "machine behind NAT"], ["forwardKey", "your machine"]]) {
    const v = j[k] ?? "";
    if (v && !KEY_FILE_RE.test(v)) return `The key file on the ${what} is a file name, such as ~/.ssh/id_ed25519 — its name only, never the key itself.`;
  }
  return null;
}

// The lowest port of the range that no session uses.
export function nextFreePort(jump, sessions) {
  const used = new Set(sessions.map((s) => s.port));
  for (let p = jump.portFrom; p <= jump.portTo; p++) if (!used.has(p)) return p;
  throw new Error(`No free port left in ${jump.portFrom}–${jump.portTo}: every port of the range has a session. Widen the range or ` +
    "remove a session.");
}

// + Remote session: the list with the new session; its port is the lowest free one unless one of the range is chosen.
export function addRemoteSession(jump, sessions, { name, port = null, bridgePort, token = "" }) {
  const bad = jumpHostProblem(jump);
  if (bad) throw new Error(`Set the jump host first. ${bad}`);
  const n = String(name ?? "").trim(), t = String(token ?? "").trim(), bp = Number(bridgePort);
  if (!SESSION_NAME_RE.test(n)) throw new Error("Name the session with letters, digits, '.', '_' or '-', such as lab-pc.");
  if (sessions.some((s) => s.name === n)) throw new Error(`A session named ${n} already exists.`);
  if (!isPort(bp)) throw new Error("The bridge port is the port the bridge listens on, on the machine behind NAT (1–65535).");
  if (/\s/.test(t)) throw new Error("A bridge token has no spaces.");
  let p;
  if (port === null || port === undefined || port === "") p = nextFreePort(jump, sessions);
  else {
    p = Number(port);
    if (!Number.isInteger(p) || p < jump.portFrom || p > jump.portTo) throw new Error(`The port lies in the jump host's range ${jump.portFrom}–${jump.portTo}.`);
    const other = sessions.find((s) => s.port === p);
    if (other) throw new Error(`Port ${p} is used by the session ${other.name}; each session has its own port.`);
  }
  return [...sessions, { name: n, port: p, bridgePort: bp, token: t }];
}

const LOOPBACK_BIND = new Set(["127.0.0.1", "localhost", "[::1]"]);

// A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK: every -R and -L of a command binds its listening end to a loopback
// address, explicitly, and forwards to 127.0.0.1; nothing switches on listening for other hosts. -> [] or the problems.
export function tunnelBindProblems(cmd) {
  const words = String(cmd).trim().split(/\s+/), out = [];
  let forwards = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w === "-g") out.push("-g lets other hosts connect to the forwarded port");
    if (w === "-o" && /^GatewayPorts/i.test(words[i + 1] || "")) out.push("GatewayPorts is not set by a command of the dashboard");
    if (w !== "-R" && w !== "-L") continue;
    forwards++;
    const spec = words[i + 1] || "", parts = spec.split(":");
    if (parts.length !== 4) { out.push(`${w} ${spec}: no bind address — it must name 127.0.0.1`); continue; }
    const [bind, , dest] = parts;
    if (bind === "" || bind === "*" || bind === "0.0.0.0" || !LOOPBACK_BIND.has(bind)) out.push(`${w} ${spec}: binds ${bind || "(empty)"}, not the loopback address`);
    if (dest !== "127.0.0.1") out.push(`${w} ${spec}: forwards to ${dest}, not to 127.0.0.1`);
  }
  if (!forwards) out.push("no -R or -L in the command");
  return out;
}

// THE DASHBOARD WRITES THE TUNNEL COMMANDS: both ends of one session's tunnel, and the address the dashboard reaches it at.
export function tunnelCommands(jump, session) {
  const bad = jumpHostProblem(jump);
  if (bad) throw new Error(bad);
  if (!SESSION_NAME_RE.test(session?.name ?? "") || !isPort(session.port) || !isPort(session.bridgePort)) throw new Error("not a remote session");
  const opts = `-N -o ServerAliveInterval=${KEEPALIVE_SECONDS} -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes`;
  const key = (f) => (f ? ` -i ${f}` : "");
  const to = `${jump.user}@${jump.host}`;
  const reverse = `ssh ${opts}${key(jump.reverseKey)} -R 127.0.0.1:${session.port}:127.0.0.1:${session.bridgePort} ${to}`;
  const forward = `ssh ${opts}${key(jump.forwardKey)} -L 127.0.0.1:${session.port}:127.0.0.1:${session.port} ${to}`;
  for (const c of [reverse, forward]) {
    const p = tunnelBindProblems(c);
    if (p.length) throw new Error(`refused to write a tunnel command: ${p.join("; ")}`);
  }
  return { reverse, forward, url: `http://localhost:${session.port}` };
}

// Test of a remote session: does anything answer at its local port — the forward, and through it the tunnel? A request
// without token or header, whose answer the page cannot read (no-cors): it tells only that a connection was made.
export async function probeLocalPort(port) {
  if (typeof port !== "number" || !isPort(port)) throw new Error(`not a port: ${port}`);
  try {
    await fetch(`http://localhost:${port}/`, { method: "GET", mode: "no-cors", credentials: "omit", cache: "no-store" });
    return true;
  } catch { return false; }
}

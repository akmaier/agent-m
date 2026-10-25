import { bridgeApi } from "../bridge-http/index.mjs";

const LOOPBACK = "127.0.0.1";
// Every value that enters a command is checked first, so that no setting can add an option or an address to it: the jump
// host is a host name or an IPv4 address, the SSH user a login name, each key file a file name — its name only, never the key.
const HOST = /^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
const SSH_USER = /^[A-Za-z_][A-Za-z0-9_.-]{0,31}$/;
const KEY_FILE = /^(?:~\/|\/)?[A-Za-z0-9._][A-Za-z0-9._-]*(?:\/[A-Za-z0-9._][A-Za-z0-9._-]*)*$/;
// The range of the jump host's ports lies above the privileged ports.
const LOWEST_RANGE_PORT = 1024;
const LOOPBACK_BIND = new Set(["127.0.0.1", "localhost", "[::1]"]);

function isPort(value, lowest = 1) {
  return Number.isInteger(value) && value >= lowest && value <= 65535;
}

function requiredText(value, name) {
  if (typeof value !== "string" || !value) throw new TypeError(`${name} is required`);
  return value;
}

// A value checked against its form before it enters a command: a TypeError naming what it must be.
function checked(value, name, form, what) {
  requiredText(value, name);
  if (!form.test(value)) throw new TypeError(`${name} is ${what}`);
  return value;
}

// A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK: what in a written command lets a forward listen elsewhere —
// every -R and -L binds its listening end to a loopback address, explicitly, and forwards to 127.0.0.1; nothing switches on
// listening for other hosts. -> [] or the problems. Private to this module: tunnelCommands refuses to write a command that
// has any; exported from this file, not from index.mjs, for its test.
export function tunnelBindProblems(command) {
  const words = String(command).trim().split(/\s+/), out = [];
  let forwards = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word === "-g") out.push("-g lets other hosts connect to the forwarded port");
    if (word === "-o" && /^GatewayPorts/i.test(words[i + 1] || "")) out.push("GatewayPorts is not set by a command of the dashboard");
    if (word !== "-R" && word !== "-L") continue;
    forwards++;
    const spec = words[i + 1] || "", parts = spec.split(":");
    if (parts.length !== 4) { out.push(`${word} ${spec}: no bind address — it must name 127.0.0.1`); continue; }
    const [bind, , destination] = parts;
    if (!LOOPBACK_BIND.has(bind)) out.push(`${word} ${spec}: binds ${bind || "(empty)"}, not the loopback address`);
    if (destination !== LOOPBACK) out.push(`${word} ${spec}: forwards to ${destination}, not to 127.0.0.1`);
  }
  if (!forwards) out.push("no -R or -L in the command");
  return out;
}

export function allocatePort(range, sessions) {
  const [first, last] = Array.isArray(range) ? range : [];
  if (!isPort(first, LOWEST_RANGE_PORT) || !isPort(last, LOWEST_RANGE_PORT) || first > last) {
    throw new TypeError(`portRange is an inclusive [first, last] range between ${LOWEST_RANGE_PORT} and 65535`);
  }
  const occupied = new Set((Array.isArray(sessions) ? sessions : []).map((session) => session?.port));
  for (let port = first; port <= last; port += 1) if (!occupied.has(port)) return port;
  const error = new Error(`No free port in ${first}-${last}.`);
  error.name = "NoFreePort";
  throw error;
}

export function tunnelCommands(jumpHost, session, bridgePort = bridgeApi.defaultPort, keyFiles) {
  const hostname = checked(jumpHost?.hostname, "jump host hostname", HOST, "a host name or an IPv4 address, such as jump.example.org");
  const user = checked(jumpHost?.user, "jump host user", SSH_USER, "a login name on the jump host, such as agentm");
  const sshPort = jumpHost?.sshPort;
  const remotePort = session?.port;
  const remoteKey = checked(keyFiles?.remote, "remote key file", KEY_FILE, "a file name, such as ~/.ssh/id_ed25519 — its name only, never the key itself");
  const localKey = checked(keyFiles?.local, "local key file", KEY_FILE, "a file name, such as ~/.ssh/id_ed25519 — its name only, never the key itself");
  if (!isPort(sshPort) || !isPort(remotePort) || !isPort(bridgePort)) throw new TypeError("tunnel ports are integers from 1 to 65535");

  const target = `${user}@${hostname}`;
  const options = `-N -p ${sshPort} -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes`;
  const reverse = `ssh ${options} -i ${remoteKey} -R ${LOOPBACK}:${remotePort}:${LOOPBACK}:${bridgePort} ${target}`;
  const forward = `ssh ${options} -i ${localKey} -L ${LOOPBACK}:${remotePort}:${LOOPBACK}:${remotePort} ${target}`;
  for (const command of [reverse, forward]) {
    const problems = tunnelBindProblems(command);
    if (problems.length) throw new TypeError(`refused to write a tunnel command: ${problems.join("; ")}`);
  }
  const plans = [
    { direction: "reverse", jumpHost: hostname, user, sshPort, remotePort, bind: LOOPBACK, bridgePort, keyFile: remoteKey },
    { direction: "forward", jumpHost: hostname, user, sshPort, remotePort, bind: LOOPBACK, bridgePort, keyFile: localKey },
  ];
  const service = [
    "# Keep the reverse tunnel running as a service on the computer behind NAT.",
    `[Service]`,
    `ExecStart=${reverse}`,
    "Restart=always",
  ].join("\n");
  return { reverse, forward, plans, service };
}

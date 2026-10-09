import { bridgeApi } from "../bridge-http/index.mjs";

const LOOPBACK = "127.0.0.1";

function isPort(value) {
  return Number.isInteger(value) && value >= 1 && value <= 65535;
}

function requiredText(value, name) {
  if (typeof value !== "string" || !value) throw new TypeError(`${name} is required`);
  return value;
}

export function allocatePort(range, sessions) {
  const [first, last] = Array.isArray(range) ? range : [];
  if (!isPort(first) || !isPort(last) || first > last) throw new TypeError("portRange is an inclusive [first, last] range");
  const occupied = new Set((Array.isArray(sessions) ? sessions : []).map((session) => session?.port));
  for (let port = first; port <= last; port += 1) if (!occupied.has(port)) return port;
  const error = new Error(`No free port in ${first}-${last}.`);
  error.name = "NoFreePort";
  throw error;
}

export function tunnelCommands(jumpHost, session, bridgePort = bridgeApi.defaultPort, keyFiles) {
  const hostname = requiredText(jumpHost?.hostname, "jump host hostname");
  const user = requiredText(jumpHost?.user, "jump host user");
  const sshPort = jumpHost?.sshPort;
  const remotePort = session?.port;
  const remoteKey = requiredText(keyFiles?.remote, "remote key file");
  const localKey = requiredText(keyFiles?.local, "local key file");
  if (!isPort(sshPort) || !isPort(remotePort) || !isPort(bridgePort)) throw new TypeError("tunnel ports are integers from 1 to 65535");

  const target = `${user}@${hostname}`;
  const options = `-N -p ${sshPort} -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes`;
  const reverse = `ssh ${options} -i ${remoteKey} -R ${LOOPBACK}:${remotePort}:${LOOPBACK}:${bridgePort} ${target}`;
  const forward = `ssh ${options} -i ${localKey} -L ${LOOPBACK}:${remotePort}:${LOOPBACK}:${remotePort} ${target}`;
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

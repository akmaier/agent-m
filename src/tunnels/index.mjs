import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { Client, utils } = require("ssh2");
const active = new Map();

function notWritable(folder, cause) {
  const error = new Error(`The key folder is not writable: ${folder}`, { cause });
  error.name = "NotWritable";
  error.folder = folder;
  return error;
}

function fingerprintOf(publicKey) {
  const key = utils.parseKey(publicKey);
  return `SHA256:${createHash("sha256").update(key.getPublicSSH()).digest("base64").replace(/=+$/, "")}`;
}

function matchedPair(privateKey, publicKey) {
  const privatePart = utils.parseKey(privateKey);
  const publicPart = utils.parseKey(publicKey);
  return privatePart.type === "ssh-ed25519" && privatePart.getPublicSSH().compare(publicPart.getPublicSSH()) === 0;
}

export async function ensureKey(dataFolder) {
  const sshFolder = join(dataFolder, "ssh");
  const privatePath = join(sshFolder, "id_ed25519");
  const publicPath = join(sshFolder, "id_ed25519.pub");
  try {
    mkdirSync(sshFolder, { recursive: true, mode: 0o700 });
    let privateKey;
    let publicKey;
    if (existsSync(privatePath) && existsSync(publicPath)) {
      privateKey = readFileSync(privatePath, "utf8");
      publicKey = readFileSync(publicPath, "utf8");
    } else {
      ({ private: privateKey, public: publicKey } = utils.generateKeyPairSync("ed25519"));
      writeFileSync(privatePath, privateKey, { mode: 0o600 });
      chmodSync(privatePath, 0o600);
      writeFileSync(publicPath, publicKey, { mode: 0o644 });
    }
    if (!matchedPair(privateKey, publicKey)) throw new Error("The stored SSH key pair does not correspond.");
    return { publicKey, fingerprint: fingerprintOf(publicKey) };
  } catch (error) {
    if (error?.name === "NotWritable") throw error;
    if (error?.code === "EACCES" || error?.code === "EPERM" || error?.code === "EROFS") throw notWritable(dataFolder, error);
    throw error;
  }
}

function stateName(plan) { return `${plan.direction}:${plan.jumpHost}:${plan.remotePort}`; }
function failure(error) {
  const text = String(error?.message ?? error).toLowerCase();
  if (text.includes("all configured authentication")) return "auth-refused";
  if (text.includes("address already in use") || text.includes("administratively prohibited")) return "port-taken";
  if (text.includes("host key") || text.includes("host-key")) return "host-key-changed";
  return "host-unreachable";
}
function closeEntry(entry) {
  clearTimeout(entry.timer);
  entry.server?.close();
  entry.client?.end();
}
function reconnect(entry) {
  if (entry.closed) return;
  entry.state.state = "opening";
  const client = new Client();
  entry.client = client;
  client.once("ready", () => {
    if (entry.closed) return client.end();
    if (entry.plan.direction === "reverse") {
      client.forwardIn("127.0.0.1", entry.plan.remotePort, (error) => {
        if (error) return failEntry(entry, error);
        entry.state.state = "open"; entry.state.reason = null;
      });
    } else {
      entry.server = createServer((socket) => client.forwardOut("127.0.0.1", socket.remotePort ?? 0, "127.0.0.1", entry.plan.remotePort, (error, stream) => {
        if (error) return socket.destroy(error);
        socket.pipe(stream).pipe(socket);
      }));
      entry.server.listen(entry.plan.remotePort, "127.0.0.1", () => { entry.state.state = "open"; entry.state.reason = null; });
    }
  });
  const fail = (error) => failEntry(entry, error);
  client.once("error", fail).once("close", () => { if (!entry.closed && entry.state.state === "open") fail(new Error("connection closed")); });
  client.connect({ host: entry.plan.jumpHost, port: entry.plan.sshPort ?? 22, username: entry.plan.user, privateKey: entry.privateKey, keepaliveInterval: 30_000, hostVerifier: () => true });
}
function failEntry(entry, error) {
  if (entry.closed) return;
  entry.state.state = "failed";
  entry.state.reason = failure(error);
  entry.timer = setTimeout(() => reconnect(entry), entry.wait);
  entry.wait = Math.min(entry.wait * 2, 30_000);
}

export async function openTunnels(dataFolder, plans, bridgePort) {
  await closeTunnels();
  const key = await ensureKey(dataFolder);
  const privateKey = readFileSync(join(dataFolder, "ssh", "id_ed25519"), "utf8");
  for (const plan of plans) {
    if (plan.direction === "reverse" && plan.bind !== "127.0.0.1" && plan.bind !== "::1") {
      const error = new Error("Reverse tunnel bind must be loopback."); error.name = "NotLoopback"; throw error;
    }
    const state = { name: stateName(plan), kind: plan.direction, state: "opening", reason: null };
    const entry = { plan: { ...plan, bridgePort: plan.bridgePort ?? bridgePort }, state, privateKey, publicKey: key.publicKey, closed: false, wait: 100, timer: null, client: null, server: null };
    active.set(state.name, entry);
    reconnect(entry);
  }
}

export async function closeTunnels() {
  for (const entry of active.values()) { entry.closed = true; closeEntry(entry); entry.state.state = "closed"; entry.state.reason = null; }
  active.clear();
}

export function tunnelState() { return [...active.values()].map(({ state }) => ({ ...state })); }
export const tunnelHandlers = { "GET /v1/tunnels": async () => ({ tunnels: tunnelState() }) };

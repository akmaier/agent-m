// The checks of buildPlatform (docs/architecture/MOD-bridge-build.md, Interfaces): a compiled Node addon in the app, each platform's own verifier of a
// code signature, and the tunnel check — "each platform's packaged app opens a reverse tunnel and a forward to a test SSH server and answers a request
// through them before anything is published" (Data). Each failure is one of the module's errors.
//
// Module: MOD-bridge-build

import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import http from "node:http";
import net from "node:net";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { ReleaseError } from "./publish.mjs";

// Runs a program and waits for it: { code, output } — standard output and standard error together.
export function run(command, args, { cwd, env } = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, env, shell: globalThis.process.platform === "win32" && command !== "powershell", stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    child.on("error", (error) => resolve({ code: -1, output: String(error.message) }));
    child.on("close", (code) => resolve({ code, output }));
  });
}

// The first compiled Node addon, a `.node` file, below `root`, as a path relative to `base`; null when there is none.
export function nativeAddon(root, base = root) {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      const found = nativeAddon(path, base);
      if (found) return found;
    } else if (entry.name.endsWith(".node")) {
      return relative(base, path);
    }
  }
  return null;
}

// Each platform's own verifier of the code signature (ARC-050). Linux checks no code signature. `app` is the unpacked macOS app, `installer` the
// Windows installer; `file` is the name of the released file the signature belongs to.
export async function verifyCodeSignature({ platform, app, installer, file, env }) {
  const failed = (verifier, result) => new ReleaseError("SignatureInvalid", { file }, `${file}: ${verifier} does not accept its code signature: ${result.output.trim().slice(-500)}`);
  if (platform === "macos") {
    for (const [command, args] of [
      ["codesign", ["--verify", "--deep", "--strict", app]],
      ["spctl", ["--assess", "--type", "execute", app]],
      ["xcrun", ["stapler", "validate", app]],
    ]) {
      const result = await run(command, args, { env });
      if (result.code !== 0) throw failed(command, result);
    }
  } else if (platform === "windows") {
    const result = await run("powershell", ["-NoProfile", "-Command", `(Get-AuthenticodeSignature -LiteralPath '${installer.replaceAll("'", "''")}').Status`], { env });
    if (result.code !== 0 || result.output.trim() !== "Valid") throw failed("Get-AuthenticodeSignature", result);
  }
}

const freePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});

function fetchOnce(port) {
  return new Promise((resolve) => {
    const request = http.get({ host: "127.0.0.1", port, path: "/", timeout: 2000, agent: false }, (response) => {
      let body = "";
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, body }));
    });
    request.on("timeout", () => request.destroy());
    request.on("error", () => resolve(null));
  });
}

// A test SSH server that takes any login, opens the reverse listener a client asks for (tcpip-forward) and answers a forwarded connection
// (direct-tcpip) from a small web server of its own. Returns { port, answerPort, close }.
async function testSshServer(ssh2) {
  const { Server, utils } = ssh2;
  const sockets = new Set();
  const answer = http.createServer((_request, response) => response.end("ok"));
  const answerPort = await new Promise((resolve) => answer.listen(0, "127.0.0.1", () => resolve(answer.address().port)));
  const listeners = [];
  const server = new Server({ hostKeys: [utils.generateKeyPairSync("ed25519").private] }, (client) => {
    client.on("error", () => {});
    client.on("authentication", (context) => context.accept());
    client.on("request", (accept, reject, name, info) => {
      if (name !== "tcpip-forward") return reject();
      const listener = net.createServer((socket) => client.forwardOut(info.bindAddr, info.bindPort, "127.0.0.1", socket.remotePort ?? 0, (error, stream) => {
        if (error) return socket.destroy();
        socket.pipe(stream).pipe(socket);
        stream.once("error", () => socket.destroy());
        socket.once("error", () => stream.destroy());
      }));
      listeners.push(listener);
      listener.once("error", () => reject());
      listener.listen(info.bindPort, "127.0.0.1", () => accept());
    });
    client.on("tcpip", (accept, reject) => {
      const upstream = net.connect(answerPort, "127.0.0.1");
      upstream.once("connect", () => {
        const stream = accept();
        sockets.add(stream);
        stream.pipe(upstream).pipe(stream);
        stream.once("error", () => upstream.destroy());
        upstream.once("error", () => stream.destroy());
      });
      upstream.once("error", () => reject());
    });
  });
  const port = await new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
  return {
    port,
    answerPort,
    close() {
      for (const listener of listeners) listener.close();
      for (const stream of sockets) stream.destroy();
      answer.close();
      server.close();
    },
  };
}

// The per-user data folder of an app, in the platform's place for it (MOD-desktop-shell, Data), below the home the check gives the app.
const dataFolderIn = (platform, home, appId) => join(platform === "macos" ? join(home, "Library", "Application Support") : platform === "windows" ? join(home, "AppData", "Roaming") : join(home, ".config"), appId);

/**
 * The tunnel check: starts the packaged app with a home of its own whose settings name a reverse tunnel and a forward to a test SSH server, and waits
 * until a request through each is answered. Errors: TunnelCheckFailed { reason }.
 */
export async function tunnelCheck({ platform, executable, appId, ssh2, timeout = 60_000 }) {
  const failed = (reason) => new ReleaseError("TunnelCheckFailed", { reason }, `the tunnel check failed: ${reason}`);
  const home = mkdtempSync(join(tmpdir(), "bridge-tunnel-check-"));
  let server = null;
  let child = null;
  try {
    server = await testSshServer(ssh2);
    const [bridgePort, reversePort, forwardPort] = [await freePort(), await freePort(), await freePort()];
    const plan = (direction, remotePort) => ({ direction, jumpHost: "127.0.0.1", user: "check", sshPort: server.port, remotePort, bind: "127.0.0.1", bridgePort, keyFile: "ssh/id_ed25519" });
    const dataFolder = dataFolderIn(platform, home, appId);
    mkdirSync(dataFolder, { recursive: true });
    writeFileSync(join(dataFolder, "settings.json"), JSON.stringify({
      "agent-m-bridge-settings": 1, name: "tunnel-check", port: bridgePort, agents: [], products: [], every: 300, paused: false,
      jumpHost: { hostname: "127.0.0.1", user: "check", sshPort: server.port }, tunnels: [plan("reverse", reversePort), plan("forward", forwardPort)],
    }));
    let exited = null;
    child = spawn(executable, [], {
      env: { ...globalThis.process.env, HOME: home, USERPROFILE: home, XDG_CONFIG_HOME: join(home, ".config"), APPDATA: join(home, "AppData", "Roaming") },
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-500); });
    child.on("error", (error) => { exited = `could not be started: ${error.message}`; });
    child.on("close", (code) => { exited ??= `ended with code ${code} ${stderr.trim()}`; });
    const through = { reverse: null, forward: null };
    for (const deadline = Date.now() + timeout; Date.now() < deadline;) {
      if (exited) throw failed(`the packaged app ${exited}`);
      through.reverse ??= (await fetchOnce(reversePort))?.status ? "answered" : null;
      through.forward ??= (await fetchOnce(forwardPort))?.body === "ok" ? "answered" : null;
      if (through.reverse && through.forward) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw failed(`no request was answered through the ${through.reverse ? "forward" : "reverse tunnel"} within ${timeout / 1000} seconds`);
  } finally {
    child?.kill("SIGKILL");
    server?.close();
    rmSync(home, { recursive: true, force: true });
  }
}

// ssh2, from the app's packages as the build installed them, else from this module's own.
export function loadSsh2(appFolder) {
  for (const base of [join(appFolder, "package.json"), new URL("./package.json", import.meta.url)]) {
    try {
      return createRequire(base)("ssh2");
    } catch { /* the next place */ }
  }
  throw new ReleaseError("TunnelCheckFailed", { reason: "ssh2 is not installed" }, "the tunnel check failed: ssh2 is not installed");
}

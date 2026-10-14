// The Bridge answers the mail routes (ITM-430) — MOD-desktop-shell composes MOD-mail-protocols' mailHandlers into
// MOD-bridge-http's real loopback server, as MOD-desktop-shell states: the server starts on 127.0.0.1 with the handlers
// of MOD-bridge-jobs, MOD-mail-protocols and MOD-tunnels. Local IMAP and SMTP fixtures stand in for the mailbox servers.
// Run: node --test tests/mod-desktop-shell-mail-composition.test.mjs
//
// Module: MOD-desktop-shell; MOD-mail-protocols; MOD-bridge-http
// Guards: UC-037; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY; THE LOCAL BRIDGE REQUIRES A TOKEN; THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST; THE MAIL SERVER IS REACHED ONLY OVER TLS
// Level: component

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import Module from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import http from "node:http";
import net from "node:net";
import tls from "node:tls";
import { bridgeApi } from "../src/bridge-http/index.mjs";

const ORIGIN = "https://shell-owner.github.io";
const PASSWORD = "mail-composition-marker-password-430";
const ACCOUNT = "reports@example.org";
const SSH2_FIXTURE = join(tmpdir(), "agent-m-430-ssh2-fixture");
let desktopModule;

function fakeSsh2Module() {
  const folder = join(SSH2_FIXTURE, "node_modules", "ssh2");
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, "package.json"), JSON.stringify({ name: "ssh2", version: "1.17.0", main: "index.js" }));
  writeFileSync(join(folder, "index.js"), `
    const publicKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE1vZC1kZXNrdG9wLXNoZWxsLW1haWwtNDMw";
    const publicBuffer = Buffer.from(publicKey);
    exports.Client = class { on() { return this; } once() { return this; } connect() {} end() {} };
    exports.utils = {
      generateKeyPairSync() { return { private: "fixture-private-key", public: publicKey }; },
      parseKey() { return { type: "ssh-ed25519", getPublicSSH() { return publicBuffer; } }; }
    };
  `);
  assert.equal(existsSync(join(folder, "index.js")), true, "known positive: local ssh2 fixture is present");
  return join(SSH2_FIXTURE, "node_modules");
}

async function desktopCompose(root) {
  process.env.NODE_PATH = fakeSsh2Module();
  Module._initPaths();
  desktopModule ??= await import(`../src/desktop-shell/compose.mjs?itm430=${Date.now()}-${Math.random()}`);
  return desktopModule;
}

function certPair() {
  const folder = mkdtempSync(join(tmpdir(), "agent-m-mail-compose-cert-"));
  const key = join(folder, "key.pem");
  const cert = join(folder, "cert.pem");
  execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
    "-subj", "/CN=localhost", "-keyout", key, "-out", cert], { stdio: "ignore" });
  return { key: readFileSync(key), cert: readFileSync(cert) };
}

const TLS = certPair();
const onceListening = (server) => new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => { server.off("error", reject); resolve(); });
});
function startTlsSocket(socket, logs, attach, sockets) {
  const secure = new tls.TLSSocket(socket, { isServer: true, secureContext: tls.createSecureContext(TLS) });
  sockets.add(secure);
  secure.on("close", () => sockets.delete(secure));
  secure.on("error", (error) => logs.errors.push(error.message));
  attach(secure, true);
}

async function imapServer({ advertiseStartTls = true } = {}) {
  const logs = { commands: [], logins: [], errors: [] };
  const sockets = new Set();
  const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    let active = socket, secure = false, buffer = "";
    const write = (line) => active.write(`${line}\r\n`);
    const ok = (tag, text) => write(`${tag} OK ${text}`);
    const no = (tag, text) => write(`${tag} NO ${text}`);
    const quoted = (line) => [...line.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
    const capability = () => `* CAPABILITY IMAP4rev1 NAMESPACE SPECIAL-USE${!secure && advertiseStartTls ? " STARTTLS" : " AUTH=PLAIN"}`;
    const attach = (stream, isSecure) => {
      active = stream;
      secure = isSecure;
      stream.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
        for (;;) {
          const at = buffer.indexOf("\r\n");
          if (at < 0) return;
          const line = buffer.slice(0, at);
          buffer = buffer.slice(at + 2);
          handle(line);
        }
      });
    };
    const handle = (line) => {
      logs.commands.push({ secure, line });
      const [tag, commandRaw] = line.split(" ");
      const command = commandRaw?.toUpperCase();
      if (command === "CAPABILITY") { write(capability()); ok(tag, "CAPABILITY completed"); return; }
      if (command === "STARTTLS") {
        if (!advertiseStartTls) { no(tag, "STARTTLS unavailable"); return; }
        active.write(`${tag} OK Begin TLS negotiation\r\n`, () => {
          active.removeAllListeners("data");
          startTlsSocket(active, logs, attach, sockets);
        });
        return;
      }
      if (command === "LOGIN") {
        const [user, password] = quoted(line);
        logs.logins.push({ secure, user, password });
        secure && password === PASSWORD ? ok(tag, "LOGIN completed") : no(tag, "AUTHENTICATIONFAILED Invalid credentials");
        return;
      }
      if (command === "NAMESPACE") { write('* NAMESPACE (("" "/")) NIL NIL'); ok(tag, "NAMESPACE completed"); return; }
      if (command === "LIST") { write('* LIST (\\Drafts) "/" "Drafts"'); write('* LIST (\\Sent) "/" "Sent"'); write('* LIST () "/" "INBOX"'); write('* LIST () "/" "Reports"'); ok(tag, "LIST completed"); return; }
      if (command === "LSUB" || command === "ID" || command === "ENABLE" || command === "UNSELECT") { ok(tag, `${command} completed`); return; }
      if (command === "EXAMINE") {
        const folder = quoted(line).at(-1) ?? line.split(" ").slice(2).join(" ");
        if (folder === "INBOX") { write("* 2 EXISTS"); ok(tag, "[READ-ONLY] EXAMINE completed"); return; }
        if (folder === "Reports") { write("* 1 EXISTS"); ok(tag, "[READ-ONLY] EXAMINE completed"); return; }
        no(tag, `[NONEXISTENT] Mailbox doesn't exist: ${folder}`);
        return;
      }
      if (command === "LOGOUT") { write("* BYE"); ok(tag, "LOGOUT completed"); active.end(); return; }
      ok(tag, `${command} completed`);
    };
    attach(socket, false);
    write("* OK fixture IMAP ready");
  });
  await onceListening(server);
  return { server, sockets, logs, port: server.address().port, security: "starttls" };
}

function parseAuthPlain(token) {
  const parts = Buffer.from(token, "base64").toString("utf8").split("\u0000");
  return { user: parts.at(-2) ?? "", password: parts.at(-1) ?? "" };
}

async function smtpServer({ advertiseStartTls = true } = {}) {
  const logs = { commands: [], auths: [], errors: [] };
  const sockets = new Set();
  const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    let active = socket, secure = false, buffer = "";
    const write = (line) => active.write(`${line}\r\n`);
    const attach = (stream, isSecure) => {
      active = stream;
      secure = isSecure;
      stream.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
        for (;;) {
          const at = buffer.indexOf("\r\n");
          if (at < 0) return;
          const line = buffer.slice(0, at);
          buffer = buffer.slice(at + 2);
          handle(line);
        }
      });
    };
    const handle = (line) => {
      logs.commands.push({ secure, line });
      const [commandRaw, method, token] = line.split(" ");
      const command = commandRaw.toUpperCase();
      if (command === "EHLO" || command === "HELO") { write("250-localhost"); if (!secure && advertiseStartTls) write("250-STARTTLS"); write("250 AUTH PLAIN"); return; }
      if (command === "STARTTLS") {
        if (!advertiseStartTls) { write("454 TLS unavailable"); return; }
        active.write("220 Ready to start TLS\r\n", () => {
          active.removeAllListeners("data");
          startTlsSocket(active, logs, attach, sockets);
        });
        return;
      }
      if (command === "AUTH" && method?.toUpperCase() === "PLAIN" && token) {
        const login = parseAuthPlain(token);
        logs.auths.push({ secure, ...login });
        write(secure && login.password === PASSWORD ? "235 2.7.0 Authentication successful" : "535 5.7.8 Authentication credentials invalid");
        return;
      }
      if (command === "MAIL" || command === "RCPT" || command === "DATA") { write("503 no mail is accepted by this fixture"); return; }
      if (command === "QUIT") { write("221 bye"); active.end(); return; }
      write("250 OK");
    };
    attach(socket, false);
    write("220 fixture SMTP ready");
  });
  await onceListening(server);
  return { server, sockets, logs, port: server.address().port, security: "starttls" };
}

function connection(imap, smtp) {
  return { address: ACCOUNT, route: "imap", folders: ["INBOX", "Reports"], places: [],
    imap: { bridge: "lab-bridge", jumpHostNoted: false, imap: { host: "127.0.0.1", port: imap.port, security: imap.security },
      smtp: { host: "127.0.0.1", port: smtp.port, security: smtp.security }, account: ACCOUNT, password: PASSWORD } };
}

async function mailRequest(bridge, token, body, origin = ORIGIN) {
  const target = new URL(`${bridge.address}/v1/mail/test`);
  return new Promise((resolve, reject) => {
    const request = http.request({
      host: target.hostname,
      port: target.port,
      path: target.pathname,
      method: "POST",
      agent: false,
      headers: { Origin: origin, "content-type": "application/json", connection: "close", [bridgeApi.tokenHeader]: token },
    }, (response) => {
      let text = "";
      response.on("data", (chunk) => { text += chunk; });
      response.on("end", () => {
        request.destroy();
        resolve({ status: response.statusCode, body: text ? JSON.parse(text) : null });
      });
    });
    request.on("error", reject);
    request.end(JSON.stringify(body));
  });
}

function filesUnder(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

async function closeFixture(fixture) {
  for (const socket of fixture.sockets) socket.destroy();
  fixture.server.close(() => {});
  fixture.server.unref?.();
  await new Promise((resolve) => setImmediate(resolve));
}

async function startComposedBridge(options = {}) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-430-compose-"));
  const lines = [];
  const priorInfo = console.info;
  try {
    const mod = await desktopCompose(root);
    assert.equal(typeof mod.composeBridgeHandlers, "function", "failure node: desktop composition exposes all Bridge handlers");
    console.info = (...parts) => lines.push(parts.join(" "));
    const paused = { value: options.paused ?? false };
    const bridge = await mod.compose({ instance: "shell-owner/agent-m", origin: ORIGIN, dataFolder: join(root, "data"), port: 0, paused: () => paused.value });
    const close = async () => {
      console.info = priorInfo;
      await bridge.close().catch(() => {});
      rmSync(root, { recursive: true, force: true });
    };
    return { bridge, dataFolder: join(root, "data"), lines, paused, close };
  } catch (error) {
    console.info = priorInfo;
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
}

// TST-430001 · level: component · module: MOD-desktop-shell; MOD-mail-protocols; MOD-bridge-http
// guards: UC-037; THE LOCAL BRIDGE REQUIRES A TOKEN; THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
// given: MOD-desktop-shell's production compose entry, a paired loopback Bridge, and local IMAP/SMTP servers accepting the marker password only after STARTTLS
// input: POST /v1/mail/test with the pairing token and mailbox connection; then the same route without the token and from another origin
// expect: the paired request answers with counts for INBOX and Reports, Drafts and Sent found and sending "works"; the refused requests are 401 and 403 before any mail-server login; no file under the Bridge data folder and no Bridge log line contains the marker password
test("TST-430001: composed Bridge serves the mailbox test route with pairing, origin and password boundaries", { concurrency: false }, async () => {
  const imap = await imapServer();
  const smtp = await smtpServer();
  let composed;
  try {
    composed = await startComposedBridge();
    const { bridge, dataFolder, lines } = composed;
    assert.match(bridge.address, /^http:\/\/127\.0\.0\.1:\d+$/, "known positive: compose binds the Bridge to loopback");

    const { status, body } = await mailRequest(bridge, bridge.token, { connection: connection(imap, smtp), args: {} });
    assert.equal(status, 200, JSON.stringify(body));
    assert.deepEqual({ ...body, encryption: "checked below" },
      { counts: { INBOX: 2, Reports: 1 }, drafts: true, sent: true, sending: "works", route: "imap", encryption: "checked below" });
    assert.equal(typeof body.encryption, "string");
    assert.ok(body.encryption.length > 0);
    assert.ok(imap.logs.logins.every((login) => login.secure), "failure node: IMAP login is after TLS");
    assert.ok(smtp.logs.auths.every((login) => login.secure), "failure node: SMTP auth is after TLS");

    const before = imap.logs.logins.length + smtp.logs.auths.length;
    assert.equal((await mailRequest(bridge, "", { connection: connection(imap, smtp), args: {} })).status, 401);
    assert.equal((await mailRequest(bridge, bridge.token, { connection: connection(imap, smtp), args: {} }, "https://other.example")).status, 403);
    assert.equal(imap.logs.logins.length + smtp.logs.auths.length, before, "failure node: refused requests do not reach mail servers");

    for (const file of filesUnder(dataFolder)) assert.equal(readFileSync(file, "utf8").includes(PASSWORD), false, `${file} contains password`);
    assert.equal(lines.join("\n").includes(PASSWORD), false, "Bridge logs do not contain the mailbox password");
  } finally {
    await Promise.all([closeFixture(imap), closeFixture(smtp)]);
    await composed?.close();
  }
});

// TST-430002 · level: component · module: MOD-desktop-shell; MOD-mail-protocols; MOD-bridge-http
// guards: THE LOCAL BRIDGE REQUIRES A TOKEN; THE MAIL SERVER IS REACHED ONLY OVER TLS
// given: the composed Bridge starts paused, and local IMAP/SMTP servers that do not offer STARTTLS
// input: POST /v1/mail/test while paused; then after unpausing, POST /v1/mail/test with the no-STARTTLS mailbox connection
// expect: paused answers 503 before any mail-server command; unpaused answers `no-encryption`, and no LOGIN, AUTHENTICATE or AUTH command was sent to either mail server
test("TST-430002: composed Bridge pauses mail work and refuses no-TLS mail servers before login", { concurrency: false }, async () => {
  const imap = await imapServer({ advertiseStartTls: false });
  const smtp = await smtpServer({ advertiseStartTls: false });
  let composed;
  try {
    composed = await startComposedBridge({ paused: true });
    const { bridge, paused } = composed;
    const whilePaused = await mailRequest(bridge, bridge.token, { connection: connection(imap, smtp), args: {} });
    assert.equal(whilePaused.status, 503);
    assert.deepEqual(whilePaused.body, { error: "paused", message: "Bridge is paused." });
    assert.deepEqual([...imap.logs.commands, ...smtp.logs.commands], [], "failure node: paused mail work never reaches mail servers");

    paused.value = false;
    const { status, body } = await mailRequest(bridge, bridge.token, { connection: connection(imap, smtp), args: {} });
    assert.equal(status, 502);
    assert.equal(body.error, "no-encryption");
    assert.match(body.message, /IMAP|SMTP|127\.0\.0\.1|TLS/i);
    assert.equal([...imap.logs.commands, ...smtp.logs.commands].some((entry) => /\b(LOGIN|AUTHENTICATE|AUTH)\b/i.test(entry.line)), false,
      "failure node: no login or auth is sent before TLS exists");
  } finally {
    await Promise.all([closeFixture(imap), closeFixture(smtp)]);
    await composed?.close();
  }
});

// The Bridge's test of a mailbox over IMAP and SMTP (ITM-420) — MOD-mail-protocols' mailHandlers, as
// docs/architecture/MOD-mail-protocols.md and ITM-420 state it: operation `test` logs in to IMAP only over TLS or
// STARTTLS, opens named folders read-only and counts their mails, recognises Drafts and Sent by special-use markings,
// logs in to SMTP over TLS and disconnects without sending, keeps the mailbox password only for the request, and returns
// named errors. The local servers below are loopback fixtures; nothing reaches a server off this computer.
// Run: node --test tests/mail-protocols.test.mjs
//
// Module: MOD-mail-protocols
// Guards: UC-037; A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; THE MAIL SERVER IS REACHED
// ONLY OVER TLS; READING THE MAILBOX CHANGES NOTHING IN IT; THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import net from "node:net";
import tls from "node:tls";

const loaded = await import("../src/mail-protocols/index.mjs").catch((error) => ({ error }));
const { mailHandlers } = loaded;

const PASSWORD = "mail-protocols-marker-password-420";
const ACCOUNT = "reports@example.org";

const connection = (imap, smtp, folders = ["INBOX", "Reports"]) => ({
  address: ACCOUNT,
  route: "imap",
  folders,
  places: [],
  imap: {
    bridge: "lab-bridge",
    jumpHostNoted: false,
    imap: { host: "127.0.0.1", port: imap.port, security: imap.security },
    smtp: { host: "127.0.0.1", port: smtp.port, security: smtp.security },
    account: ACCOUNT,
    password: PASSWORD,
  },
});

function assertModule() {
  assert.ok(mailHandlers, `mailHandlers: ${loaded.error?.message}`);
}

function certPair() {
  const folder = mkdtempSync(join(tmpdir(), "agent-m-mail-cert-"));
  const key = join(folder, "key.pem");
  const cert = join(folder, "cert.pem");
  execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
    "-subj", "/CN=localhost", "-keyout", key, "-out", cert], { stdio: "ignore" });
  return { key: readFileSync(key), cert: readFileSync(cert) };
}

const TLS = certPair();

function onceListening(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
}

async function close(server) {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

function startTlsSocket(socket, logs, attach) {
  const context = tls.createSecureContext(TLS);
  const secure = new tls.TLSSocket(socket, { isServer: true, secureContext: context });
  secure.on("error", (error) => logs.errors.push(error.message));
  attach(secure, true);
}

function parseAuthPlain(token) {
  const parts = Buffer.from(token, "base64").toString("utf8").split("\u0000");
  return { user: parts.at(-2) ?? "", password: parts.at(-1) ?? "" };
}

async function imapServer(options = {}) {
  const logs = { commands: [], logins: [], errors: [] };
  const folders = options.folders ?? { INBOX: 2, Reports: 1 };
  const specials = options.specials ?? { Drafts: "\\Drafts", Sent: "\\Sent" };
  const allowLogin = options.allowLogin ?? true;
  const advertiseStartTls = options.advertiseStartTls !== false;
  const server = net.createServer((socket) => {
    let active = socket;
    let secure = false;
    let buffer = "";
    const write = (line) => active.write(`${line}\r\n`);
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
    const ok = (tag, text) => write(`${tag} OK ${text}`);
    const no = (tag, text) => write(`${tag} NO ${text}`);
    const quoted = (line) => [...line.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
    const handle = (line) => {
      logs.commands.push({ secure, line });
      const [tag, commandRaw, ...rest] = line.split(" ");
      const command = commandRaw?.toUpperCase();
      if (command === "CAPABILITY") { write(capability()); ok(tag, "CAPABILITY completed"); return; }
      if (command === "STARTTLS") {
        if (!advertiseStartTls) { no(tag, "STARTTLS unavailable"); return; }
        active.write(`${tag} OK Begin TLS negotiation\r\n`, () => {
          active.removeAllListeners("data");
          startTlsSocket(active, logs, attach);
        });
        return;
      }
      if (command === "LOGIN") {
        const [user, password] = quoted(line);
        logs.logins.push({ secure, user, password, method: "LOGIN" });
        if (!secure) { no(tag, "LOGIN requires TLS"); return; }
        allowLogin && password === PASSWORD ? ok(tag, "LOGIN completed") : no(tag, "AUTHENTICATIONFAILED Invalid credentials");
        return;
      }
      if (command === "AUTHENTICATE" && rest[0]?.toUpperCase() === "PLAIN" && rest[1]) {
        const login = parseAuthPlain(rest[1]);
        logs.logins.push({ secure, ...login, method: "AUTHENTICATE PLAIN" });
        if (!secure) { no(tag, "AUTHENTICATE requires TLS"); return; }
        allowLogin && login.password === PASSWORD ? ok(tag, "AUTHENTICATE completed") : no(tag, "AUTHENTICATIONFAILED Invalid credentials");
        return;
      }
      if (command === "NAMESPACE") { write('* NAMESPACE (("" "/")) NIL NIL'); ok(tag, "NAMESPACE completed"); return; }
      if (command === "ID" || command === "ENABLE" || command === "UNSELECT") { ok(tag, `${command} completed`); return; }
      if (command === "LIST") {
        for (const [name, special] of Object.entries(specials)) write(`* LIST (${special}) "/" "${name}"`);
        for (const name of Object.keys(folders)) write(`* LIST () "/" "${name}"`);
        ok(tag, "LIST completed");
        return;
      }
      if (command === "EXAMINE") {
        const name = quoted(line).at(-1) ?? rest.join(" ");
        if (!Object.hasOwn(folders, name)) { no(tag, `[NONEXISTENT] Mailbox doesn't exist: ${name}`); return; }
        write(`* ${folders[name]} EXISTS`);
        ok(tag, "[READ-ONLY] EXAMINE completed");
        return;
      }
      if (command === "SELECT" || command === "STORE" || command === "COPY" || command === "MOVE" || command === "EXPUNGE") {
        no(tag, `${command} is not allowed in this fixture`);
        return;
      }
      if (command === "LOGOUT") { write("* BYE"); ok(tag, "LOGOUT completed"); active.end(); return; }
      ok(tag, `${command} completed`);
    };
    attach(socket, false);
    write("* OK fixture IMAP ready");
  });
  await onceListening(server);
  return { server, logs, port: server.address().port, security: "starttls" };
}

async function smtpServer(options = {}) {
  const logs = { commands: [], auths: [], errors: [] };
  const allowAuth = options.allowAuth ?? true;
  const advertiseStartTls = options.advertiseStartTls !== false;
  const server = net.createServer((socket) => {
    let active = socket;
    let secure = false;
    let buffer = "";
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
    const ehlo = () => {
      write("250-localhost");
      if (!secure && advertiseStartTls) write("250-STARTTLS");
      write("250 AUTH PLAIN LOGIN");
    };
    const handle = (line) => {
      logs.commands.push({ secure, line });
      const [commandRaw, ...rest] = line.split(" ");
      const command = commandRaw.toUpperCase();
      if (command === "EHLO" || command === "HELO") { ehlo(); return; }
      if (command === "STARTTLS") {
        if (!advertiseStartTls) { write("454 TLS unavailable"); return; }
        active.write("220 Ready to start TLS\r\n", () => {
          active.removeAllListeners("data");
          startTlsSocket(active, logs, attach);
        });
        return;
      }
      if (command === "AUTH" && rest[0]?.toUpperCase() === "PLAIN" && rest[1]) {
        const login = parseAuthPlain(rest[1]);
        logs.auths.push({ secure, ...login });
        if (!secure) { write("538 Encryption required for requested authentication mechanism"); return; }
        write(allowAuth && login.password === PASSWORD ? "235 2.7.0 Authentication successful" : "535 5.7.8 Authentication credentials invalid");
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
  return { server, logs, port: server.address().port, security: "starttls" };
}

async function withServers(fn, options = {}) {
  const imap = await imapServer(options.imap);
  const smtp = await smtpServer(options.smtp);
  try {
    return await fn(imap, smtp);
  } finally {
    await Promise.all([close(imap.server), close(smtp.server)]);
  }
}

async function runTest(connection) {
  const handler = mailHandlers()["POST /v1/mail/test"];
  return handler({ params: { operation: "test" }, body: { connection, args: {} } });
}

// TST-420001 · level: unit · module: MOD-mail-protocols
// guards: UC-037; A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; THE MAIL SERVER IS REACHED ONLY OVER TLS
// given: local IMAP and SMTP fixture servers on loopback; both offer STARTTLS and accept the marker password only after TLS; IMAP has INBOX with 2 mails, Reports with 1, and special-use Drafts and Sent
// input: the handler `POST /v1/mail/test` receives the mailbox connection and empty args
// expect: the answer has the counts of INBOX and Reports, Drafts and Sent true, sending "works", route "imap", and a non-empty encryption text; both logins happened after TLS, and the password appears in no plaintext command
test("TST-420001: mailHandlers test counts folders and verifies SMTP only over TLS", async () => {
  assertModule();
  await withServers(async (imap, smtp) => {
    const answer = await runTest(connection(imap, smtp));
    assert.deepEqual(answer.counts, { INBOX: 2, Reports: 1 });
    assert.equal(answer.drafts, true);
    assert.equal(answer.sent, true);
    assert.equal(answer.sending, "works");
    assert.equal(answer.route, "imap");
    assert.equal(typeof answer.encryption, "string");
    assert.ok(answer.encryption.length > 0);
    assert.ok(imap.logs.logins.every((login) => login.secure), "IMAP login after TLS");
    assert.ok(smtp.logs.auths.every((login) => login.secure), "SMTP auth after TLS");
    const plaintext = [...imap.logs.commands, ...smtp.logs.commands].filter((entry) => !entry.secure).map((entry) => entry.line).join("\n");
    assert.ok(!plaintext.includes(PASSWORD), plaintext);
  });
});

// TST-420002 · level: unit · module: MOD-mail-protocols
// guards: READING THE MAILBOX CHANGES NOTHING IN IT
// given: the same local IMAP fixture, recording every IMAP command
// input: the mailbox test handler
// expect: each named folder is opened with EXAMINE; no SELECT, STORE, COPY, MOVE, EXPUNGE or non-peek FETCH is issued; SMTP receives no MAIL, RCPT or DATA command
test("TST-420002: mailHandlers test opens IMAP folders read-only and sends no mail", async () => {
  assertModule();
  await withServers(async (imap, smtp) => {
    await runTest(connection(imap, smtp));
    const imapCommands = imap.logs.commands.map((entry) => entry.line.toUpperCase());
    assert.ok(imapCommands.some((line) => /\bEXAMINE\b.*INBOX/.test(line)), "INBOX examined");
    assert.ok(imapCommands.some((line) => /\bEXAMINE\b.*REPORTS/.test(line)), "Reports examined");
    assert.equal(imapCommands.some((line) => /\b(SELECT|STORE|COPY|MOVE|EXPUNGE)\b/.test(line)), false);
    assert.equal(imapCommands.some((line) => /\bFETCH\b/.test(line) && !/\bBODY\.PEEK\b|RFC822\.PEEK/.test(line)), false);
    const smtpCommands = smtp.logs.commands.map((entry) => entry.line.toUpperCase());
    assert.equal(smtpCommands.some((line) => /^(MAIL|RCPT|DATA)\b/.test(line)), false);
  });
});

// TST-420003 · level: unit · module: MOD-mail-protocols
// guards: THE MAIL SERVER IS REACHED ONLY OVER TLS; THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
// given: local IMAP and SMTP servers that do not offer STARTTLS
// input: the mailbox test handler
// expect: it fails with code/name `no-encryption`, naming one of the servers; neither server receives LOGIN, AUTHENTICATE or AUTH, and no plaintext command contains the marker password
test("TST-420003: mailHandlers test refuses a server without TLS before login", async () => {
  assertModule();
  await withServers(async (imap, smtp) => {
    await assert.rejects(runTest(connection(imap, smtp)), (error) => {
      assert.equal(error.code ?? error.name, "no-encryption");
      assert.match(error.message, /127\.0\.0\.1|IMAP|SMTP|TLS/i);
      return true;
    });
    const all = [...imap.logs.commands, ...smtp.logs.commands];
    assert.equal(all.some((entry) => /\b(LOGIN|AUTHENTICATE|AUTH)\b/i.test(entry.line)), false);
    assert.equal(all.some((entry) => entry.line.includes(PASSWORD)), false);
  }, { imap: { advertiseStartTls: false }, smtp: { advertiseStartTls: false } });
});

// TST-420004 · level: unit · module: MOD-mail-protocols
// guards: THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST; UC-037 7c
// given: an IMAP server over STARTTLS that refuses the marker password with its answer
// input: the mailbox test handler
// expect: it fails with code/name `login-refused`, preserving the server's answer
test("TST-420004: mailHandlers test preserves a refused-login answer", async () => {
  assertModule();
  await withServers(async (imap, smtp) => {
    await assert.rejects(runTest(connection(imap, smtp)), (error) => {
      assert.equal(error.code ?? error.name, "login-refused");
      assert.match(error.message, /AUTHENTICATIONFAILED Invalid credentials/);
      return true;
    });
  }, { imap: { allowLogin: false } });
});

// TST-420005 · level: unit · module: MOD-mail-protocols
// guards: UC-037 7d
// given: an IMAP server over STARTTLS that has INBOX but no Missing folder
// input: the mailbox test handler for folders INBOX and Missing
// expect: it fails with code/name `not-found`, naming the Missing folder
test("TST-420005: mailHandlers test names a missing folder as not-found", async () => {
  assertModule();
  await withServers(async (imap, smtp) => {
    await assert.rejects(runTest(connection(imap, smtp, ["INBOX", "Missing"])), (error) => {
      assert.equal(error.code ?? error.name, "not-found");
      assert.match(error.message, /Missing/);
      return true;
    });
  });
});

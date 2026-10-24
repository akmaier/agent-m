// The Bridge reads and finds mails without changing the mailbox (ITM-822) — MOD-mail-protocols' mailHandlers, operations
// read, find, drafts and sent, as docs/architecture/MOD-mail-protocols.md states them. The local IMAP server of
// this file serves the mails over STARTTLS on loopback; nothing reaches a server off this computer.
// Run: node --test tests/mail-protocols-read.test.mjs
//
// Module: MOD-mail-protocols
// Guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT; A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
// Guards: THE MAIL SERVER IS REACHED ONLY OVER TLS; THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import net from "node:net";
import tls from "node:tls";

// The loopback IMAP fixture that serves mails over STARTTLS; every command is recorded and mutating commands are refused.
const loaded = await import("../src/mail-protocols/index.mjs").catch((error) => ({ error }));
const { mailHandlers } = loaded;

const PASSWORD = "mail-protocols-marker-password-822";
const ACCOUNT = "reports@example.org";
const CRLF = "\r\n";

const raw = (lines) => lines.join(CRLF) + CRLF;

// The fixture's mails, as bytes. Their identifiers in the tests are SHA-256 of the Message-ID inside the brackets, checked with shasum.
const A1 = raw(["Message-ID: <a1@example.org>", "Date: Mon, 05 Oct 2026 09:00:00 +0000", "From: Ada Reporter <ada@example.net>",
  "To: reports@example.org", "Subject: Login fails", "Content-Type: text/plain; charset=utf-8", "", "The login page shows an error."]);
const A2 = raw(["Message-ID: <a2@example.org>", "In-Reply-To: <a1@example.org>", "References: <a1@example.org>", "Date: Tue, 06 Oct 2026 10:30:00 +0000",
  "From: Bo Writer <bo@example.net>", "Reply-To: Bo Elsewhere <bo@example.com>", "To: reports@example.org", "Cc: Cy Copy <cy@example.net>",
  "Subject: Re: Login fails", "MIME-Version: 1.0", 'Content-Type: multipart/mixed; boundary="fx"', "",
  "--fx", "Content-Type: text/plain; charset=utf-8", "", "It also fails on Safari.", "--fx",
  'Content-Type: text/plain; name="log.txt"', 'Content-Disposition: attachment; filename="log.txt"', "", "error 42", "--fx--"]);
const R1 = raw(["Message-ID: <r1@example.org>", "Date: Wed, 07 Oct 2026 08:15:00 +0000", "From: Cy Reporter <cy@example.net>",
  "To: reports@example.org", "Subject: Export is empty", "Content-Type: text/plain; charset=utf-8", "", "The export has no rows."]);
const S1 = raw(["Message-ID: <s1@example.org>", "In-Reply-To: <a1@example.org>", "Date: Mon, 05 Oct 2026 11:00:00 +0000", "From: reports@example.org",
  "To: Ada Reporter <ada@example.net>", "Subject: Re: Login fails", "Content-Type: text/plain; charset=utf-8", "", "We look into it."]);
const D1 = raw(["Message-ID: <d1@example.org>", "In-Reply-To: <a2@example.org>", "Date: Tue, 06 Oct 2026 12:00:00 +0000", "From: reports@example.org",
  "To: Bo Writer <bo@example.net>", "Subject: Re: Re: Login fails", "Content-Type: text/plain; charset=utf-8", "", "Which version of Safari?"]);

const MAILS = { INBOX: [A1, A2], Reports: [R1], Drafts: [D1], Sent: [S1] };
const UID_VALIDITY = 7;

const connection = (imap, smtp, folders = ["INBOX", "Reports"]) => ({
  address: ACCOUNT, route: "imap", folders, places: [],
  imap: { bridge: "lab-bridge", jumpHostNoted: false,
    imap: { host: "127.0.0.1", port: imap.port, security: "starttls" },
    smtp: { host: "127.0.0.1", port: smtp.port, security: "starttls" }, account: ACCOUNT, password: PASSWORD },
});

function certPair() {
  const folder = mkdtempSync(join(tmpdir(), "agent-m-mail-cert-"));
  const key = join(folder, "key.pem"), cert = join(folder, "cert.pem");
  execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1", "-subj", "/CN=localhost", "-keyout", key, "-out", cert], { stdio: "ignore" });
  return { key: readFileSync(key), cert: readFileSync(cert) };
}
const TLS = certPair();

const listening = (server) => new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
const closed = (server) => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));

const nstring = (value) => (value === undefined || value === null ? "NIL" : `"${String(value).replace(/(["\\])/g, "\\$1")}"`);
const header = (message, name) => new RegExp(`^${name}: (.*)$`, "im").exec(message)?.[1] ?? null;
const address = (value) => {
  if (value === null) return "NIL";
  const [, name, mailbox, host] = /^(?:(.*?) )?<?([^@<>\s]+)@([^<>\s]+)>?$/.exec(value);
  return `((${nstring(name)} NIL ${nstring(mailbox)} ${nstring(host)}))`;
};
const envelope = (message) => `ENVELOPE (${nstring(header(message, "Date"))} ${nstring(header(message, "Subject"))} ${address(header(message, "From"))} ${address(header(message, "From"))} ${address(header(message, "Reply-To") ?? header(message, "From"))} ${address(header(message, "To"))} ${address(header(message, "Cc"))} NIL ${nstring(header(message, "In-Reply-To"))} ${nstring(header(message, "Message-ID"))})`;

// `mails` maps a folder name to its messages (uid = position + 1); `advertiseStartTls: false` serves no TLS at all.
async function imapServer({ mails = MAILS, advertiseStartTls = true } = {}) {
  const logs = { commands: [], logins: [] };
  const server = net.createServer((socket) => {
    let active = socket, secure = false, buffer = "";
    const write = (text) => active.write(text + CRLF);
    const attach = (stream, isSecure) => {
      active = stream; secure = isSecure;
      stream.on("error", () => {});
      stream.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
        for (let at = buffer.indexOf(CRLF); at >= 0; at = buffer.indexOf(CRLF)) { const line = buffer.slice(0, at); buffer = buffer.slice(at + 2); handle(line); }
      });
    };
    let folder = null;
    const handle = (line) => {
      logs.commands.push({ secure, line });
      const [tag, verb, ...rest] = line.split(" ");
      const command = verb.toUpperCase();
      const ok = (text) => write(`${tag} OK ${text}`);
      const quoted = [...line.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
      if (command === "CAPABILITY") { write(`* CAPABILITY IMAP4rev1 NAMESPACE SPECIAL-USE${!secure && advertiseStartTls ? " STARTTLS" : " AUTH=PLAIN"}`); ok("done"); return; }
      if (command === "STARTTLS") {
        active.write(`${tag} OK Begin TLS negotiation${CRLF}`, () => {
          active.removeAllListeners("data");
          const secured = new tls.TLSSocket(active, { isServer: true, secureContext: tls.createSecureContext(TLS) });
          secured.on("error", () => {});
          attach(secured, true);
        });
        return;
      }
      if (command === "LOGIN") {
        logs.logins.push({ secure, user: quoted[0], password: quoted[1] });
        secure && quoted[1] === PASSWORD ? ok("LOGIN completed") : write(`${tag} NO AUTHENTICATIONFAILED Invalid credentials`);
        return;
      }
      if (command === "NAMESPACE") { write('* NAMESPACE (("" "/")) NIL NIL'); ok("NAMESPACE completed"); return; }
      if (command === "LIST") {
        write('* LIST (\\Drafts) "/" "Drafts"'); write('* LIST (\\Sent) "/" "Sent"');
        for (const name of Object.keys(mails).filter((each) => each !== "Drafts" && each !== "Sent")) write(`* LIST () "/" "${name}"`);
        ok("LIST completed"); return;
      }
      if (command === "EXAMINE") {
        const name = quoted.at(-1) ?? rest.join(" ");
        if (!Object.hasOwn(mails, name)) { write(`${tag} NO [NONEXISTENT] Mailbox doesn't exist: ${name}`); return; }
        folder = name;
        write(`* ${mails[name].length} EXISTS`); write(`* OK [UIDVALIDITY ${UID_VALIDITY}] valid`); write(`* OK [UIDNEXT ${mails[name].length + 1}] next`);
        ok("[READ-ONLY] EXAMINE completed"); return;
      }
      if (command === "SELECT" || command === "STORE" || command === "COPY" || command === "MOVE" || command === "EXPUNGE" || command === "APPEND") {
        write(`${tag} NO ${command} is not allowed in this fixture`); return;
      }
      if (command === "UID" && rest[0].toUpperCase() === "FETCH") {
        const wanted = rest[1], items = line.slice(line.indexOf("(")).toUpperCase();
        const uids = mails[folder].map((_, index) => index + 1).filter((uid) => wanted.split(",").some((part) => {
          const [from, to] = part.split(":"); return uid >= Number(from) && uid <= (to === undefined ? Number(from) : to === "*" ? Infinity : Number(to));
        }));
        for (const uid of uids) {
          const message = mails[folder][uid - 1];
          const parts = [`UID ${uid}`];
          if (items.includes("ENVELOPE")) parts.push(envelope(message));
          if (items.includes("BODY.PEEK[]")) parts.push(`BODY[] {${Buffer.byteLength(message)}}${CRLF}${message}`);
          write(`* ${uid} FETCH (${parts.join(" ")})`);
        }
        ok("UID FETCH completed"); return;
      }
      if (command === "LOGOUT") { write("* BYE"); ok("LOGOUT completed"); active.end(); return; }
      ok(`${command} completed`);
    };
    attach(socket, false);
    write("* OK fixture IMAP ready");
  });
  await listening(server);
  return { server, logs, port: server.address().port };
}

// A SMTP server is needed only because a connection names one; it is never asked for anything by these operations.
async function idleSmtp() {
  const commands = [];
  const server = net.createServer((socket) => { socket.on("error", () => {}); socket.on("data", (chunk) => commands.push(chunk.toString("utf8"))); socket.write("220 fixture SMTP ready" + CRLF); });
  await listening(server);
  return { server, commands, port: server.address().port };
}

async function withMails(fn, options = {}) {
  const imap = await imapServer(options);
  const smtp = await idleSmtp();
  try { return await fn(imap, smtp); } finally { await Promise.all([closed(imap.server), closed(smtp.server)]); }
}

async function call(operation, connectionValue, args = {}) {
  if (!mailHandlers) throw new Error(`mailHandlers: ${loaded.error?.message}`);
  return mailHandlers()[`POST /v1/mail/${operation}`]({ params: { operation }, body: { connection: connectionValue, args } });
}


const ADA = { name: "Ada Reporter", address: "ada@example.net" };
const TO_REPORTS = [{ name: null, address: "reports@example.org" }];
const MAIL_A1 = { id: "MAIL-bc650707dea32515", messageId: "<a1@example.org>", inReplyTo: null, references: [], from: ADA, replyTo: [], to: TO_REPORTS, cc: [],
  subject: "Login fails", date: "2026-10-05T09:00:00.000Z", text: "The login page shows an error.\n", attachments: [], folder: "INBOX" };
const MAIL_A2 = { id: "MAIL-58d1373af240df45", messageId: "<a2@example.org>", inReplyTo: "<a1@example.org>", references: ["<a1@example.org>"],
  from: { name: "Bo Writer", address: "bo@example.net" }, replyTo: [{ name: "Bo Elsewhere", address: "bo@example.com" }], to: TO_REPORTS,
  cc: [{ name: "Cy Copy", address: "cy@example.net" }], subject: "Re: Login fails", date: "2026-10-06T10:30:00.000Z", text: "It also fails on Safari.",
  attachments: [{ name: "log.txt", type: "text/plain", size: 8, text: "error 42" }], folder: "INBOX" };
const MAIL_R1 = { id: "MAIL-d2919bc6154c366f", messageId: "<r1@example.org>", inReplyTo: null, references: [], from: { name: "Cy Reporter", address: "cy@example.net" },
  replyTo: [], to: TO_REPORTS, cc: [], subject: "Export is empty", date: "2026-10-07T08:15:00.000Z", text: "The export has no rows.\n", attachments: [], folder: "Reports" };

// TST-822001 · level: unit · module: MOD-mail-protocols
// guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT
// given: a local IMAP fixture over STARTTLS with INBOX holding the mails a1 and a2 (a2 a reply with Cc, Reply-To and a text attachment log.txt) and Reports holding r1; the connection names INBOX and Reports
// input: the handler `POST /v1/mail/read` with empty args
// expect: the answer is the three mails in folder order, each with exactly the fields, folder and MAIL- identifier of MAIL_A1, MAIL_A2 and MAIL_R1 above (a1 MAIL-bc650707dea32515, a2 MAIL-58d1373af240df45, r1 MAIL-d2919bc6154c366f)
test("TST-822001: read gives the fixture mails with their fields and identifiers", async () => {
  await withMails(async (imap, smtp) => {
    assert.deepEqual(await call("read", connection(imap, smtp)), [MAIL_A1, MAIL_A2, MAIL_R1]);
  });
});

// TST-822002 · level: unit · module: MOD-mail-protocols
// guards: READING THE MAILBOX CHANGES NOTHING IN IT
// given: the fixture of TST-822001, recording every IMAP command it receives
// input: `read` and then `find` of MAIL-d2919bc6154c366f, each on its own connection
// expect: both answered; the record shows EXAMINE of INBOX and Reports and at least one FETCH; no SELECT, STORE, COPY, MOVE, EXPUNGE or APPEND; no FETCH that asks for a body or RFC822 without PEEK
test("TST-822002: read and find issue no STORE, COPY, MOVE, EXPUNGE and no non-peek FETCH", async () => {
  await withMails(async (imap, smtp) => {
    assert.equal((await call("read", connection(imap, smtp))).length, 3);
    assert.equal((await call("find", connection(imap, smtp), { id: "MAIL-d2919bc6154c366f" })).folder, "Reports");
    const lines = imap.logs.commands.map((entry) => entry.line.toUpperCase());
    assert.ok(lines.some((line) => /\bEXAMINE INBOX\b/.test(line)) && lines.some((line) => /\bEXAMINE REPORTS\b/.test(line)), "both folders examined");
    assert.ok(lines.some((line) => /\bFETCH\b/.test(line)), "positive: mails were fetched");
    assert.equal(lines.some((line) => /\b(SELECT|STORE|COPY|MOVE|EXPUNGE|APPEND)\b/.test(line)), false);
    assert.equal(lines.filter((line) => /\bFETCH\b/.test(line)).some((line) => /BODY\[|RFC822/.test(line.replace(/BODY\.PEEK\[|RFC822\.PEEK/g, ""))), false);
  });
});

// TST-822003 · level: unit · module: MOD-mail-protocols
// guards: A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
// given: a local IMAP fixture in which the mail a2 (MAIL-58d1373af240df45) has been moved from INBOX to Reports; INBOX holds a1, Reports holds a2 and r1; the connection names INBOX and Reports
// input: the handler `POST /v1/mail/find` with args { id: "MAIL-58d1373af240df45" }
// expect: the answer is MAIL_A2 with folder "Reports" and nothing else
test("TST-822003: find finds a mail moved to a named folder", async () => {
  const moved = { ...MAILS, INBOX: [MAILS.INBOX[0]], Reports: [MAILS.INBOX[1], MAILS.Reports[0]] };
  await withMails(async (imap, smtp) => {
    assert.deepEqual(await call("find", connection(imap, smtp), { id: "MAIL-58d1373af240df45" }), { ...MAIL_A2, folder: "Reports" });
  }, { mails: moved });
});

// TST-822004 · level: unit · module: MOD-mail-protocols
// guards: A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
// given: the fixture of TST-822001, in which no mail has the identifier MAIL-0000000000000000
// input: the handler `POST /v1/mail/find` with args { id: "MAIL-0000000000000000" }
// expect: it fails with code `not-found` naming the identifier; it answers no mail
test("TST-822004: find answers not-found for an identifier no mail has", async () => {
  await withMails(async (imap, smtp) => {
    await assert.rejects(call("find", connection(imap, smtp), { id: "MAIL-0000000000000000" }), (error) => {
      assert.equal(error.code, "not-found");
      assert.match(error.message, /MAIL-0000000000000000/);
      return true;
    });
  });
});

// TST-822005 · level: unit · module: MOD-mail-protocols
// guards: THE MAIL SERVER IS REACHED ONLY OVER TLS
// given: a local IMAP server that offers no STARTTLS and no implicit TLS
// input: the handlers `read` and `find` of MAIL-bc650707dea32515, each with the connection of the fixture
// expect: each fails with code `no-encryption`; the server receives no LOGIN or AUTHENTICATE, and no command contains the marker password
test("TST-822005: read and find on a server without TLS answer no-encryption with no login sent", async () => {
  await withMails(async (imap, smtp) => {
    for (const [operation, args] of [["read", {}], ["find", { id: "MAIL-bc650707dea32515" }]]) {
      await assert.rejects(call(operation, connection(imap, smtp), args), (error) => error.code === "no-encryption");
    }
    assert.ok(imap.logs.commands.length > 0, "positive: the server was reached");
    assert.equal(imap.logs.commands.some((entry) => /\b(LOGIN|AUTHENTICATE)\b/i.test(entry.line) || entry.line.includes(PASSWORD)), false);
    assert.deepEqual(imap.logs.logins, []);
  }, { advertiseStartTls: false });
});

// TST-822006 · level: unit · module: MOD-mail-protocols
// guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT
// given: the fixture of TST-822001, whose LIST marks Drafts with \Drafts and Sent with \Sent; Drafts holds the draft d1 (a reply to a2), Sent holds the mail s1
// input: the handlers `drafts` and `sent` with empty args
// expect: `drafts` is one entry with ref { route: "bridge", uid: 1, uidValidity: 7 }, inReplyTo "<a2@example.org>" and the mail d1 (MAIL-dcf1b7df7f873a3e, subject "Re: Re: Login fails", folder "Drafts"); `sent` is one mail, s1 (MAIL-763a50eeff46cb66, subject "Re: Login fails", folder "Sent"); only EXAMINE of Drafts and Sent opens them
test("TST-822006: drafts and sent give the folders the mailbox marks as Drafts and Sent", async () => {
  await withMails(async (imap, smtp) => {
    const drafts = await call("drafts", connection(imap, smtp));
    assert.equal(drafts.length, 1);
    assert.deepEqual(drafts[0].ref, { route: "bridge", uid: 1, uidValidity: 7 });
    assert.equal(drafts[0].inReplyTo, "<a2@example.org>");
    assert.deepEqual([drafts[0].mail.id, drafts[0].mail.subject, drafts[0].mail.folder], ["MAIL-dcf1b7df7f873a3e", "Re: Re: Login fails", "Drafts"]);
    const sent = await call("sent", connection(imap, smtp), {});
    assert.deepEqual(sent.map((mail) => [mail.id, mail.subject, mail.folder]), [["MAIL-763a50eeff46cb66", "Re: Login fails", "Sent"]]);
    const lines = imap.logs.commands.map((entry) => entry.line);
    assert.ok(lines.some((line) => /EXAMINE Drafts$/.test(line)) && lines.some((line) => /EXAMINE Sent$/.test(line)), "both examined");
    assert.equal(lines.some((line) => /\b(SELECT|STORE|COPY|MOVE|EXPUNGE|APPEND)\b/i.test(line)), false);
  });
});

// TST-822007 · level: unit · module: MOD-mail-protocols
// guards: THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
// given: the fixture of TST-822001 with the marker password; every write function of node:fs and the process output are watched
// input: `read`, `find` of MAIL-bc650707dea32515, `drafts` and `sent`, each once
// expect: all four answered; no file is written, created, truncated or removed; nothing written to stdout or stderr contains the marker password; no answer contains it
test("TST-822007: reading writes no file and no output holds the marker password", async (t) => {
  const writes = [], output = [];
  for (const name of ["writeFile", "writeFileSync", "appendFile", "appendFileSync", "createWriteStream", "mkdir", "mkdirSync", "rename", "renameSync", "unlink", "unlinkSync", "rm", "rmSync", "truncate", "truncateSync"]) {
    const original = fs[name];
    t.mock.method(fs, name, function (...args) { writes.push(`${name} ${String(args[0])}`); return original.apply(this, args); });
  }
  for (const stream of [process.stdout, process.stderr]) {
    const original = stream.write;
    t.mock.method(stream, "write", function (chunk, ...rest) { output.push(String(chunk)); return original.call(this, chunk, ...rest); });
  }
  syncBuiltinESMExports();
  const answers = [];
  try {
    await withMails(async (imap, smtp) => {
      const c = connection(imap, smtp);
      answers.push(await call("read", c), await call("find", c, { id: "MAIL-bc650707dea32515" }), await call("drafts", c), await call("sent", c));
      assert.ok(imap.logs.logins.length > 0, "positive: the fixture was logged in to");
    });
  } finally { t.mock.restoreAll(); syncBuiltinESMExports(); }
  assert.equal(answers.length, 4);
  assert.deepEqual(writes, []);
  assert.equal(output.some((text) => text.includes(PASSWORD)), false);
  assert.equal(JSON.stringify(answers).includes(PASSWORD), false);
});

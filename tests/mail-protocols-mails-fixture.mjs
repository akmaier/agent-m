// Module: MOD-mail-protocols
// Owned loopback IMAP fixture that serves mails, for this module's unit tests of read, find, drafts and sent (ITM-822).
// STARTTLS only; the marker password is accepted only after TLS; every command is recorded; mutating commands are refused.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import net from "node:net";
import tls from "node:tls";

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

export { PASSWORD, MAILS, connection, withMails, call };

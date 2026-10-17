// imap.mjs — reading folders, finding a mail, Drafts and Sent (MOD-mail-protocols, Parts). Every folder is opened read-only
// (READING THE MAILBOX CHANGES NOTHING IN IT); a login is sent only over TLS (THE MAIL SERVER IS REACHED ONLY OVER TLS).
//
// Module: MOD-mail-protocols

import { createRequire } from "node:module";
import { mailId } from "../mail-records/index.mjs";

const requireBridgePackage = createRequire(new URL("../bridge-build/package.json", import.meta.url));
const { ImapFlow } = requireBridgePackage("imapflow");
const PostalMime = requireBridgePackage("postal-mime").default;

export const STARTTLS = "starttls";
export const TLS = "tls";
const LOOPBACK = new Set(["127.0.0.1", "::1", "localhost"]);
const MISSING = /doesn'?t exist|does not exist|no such|not exist|unknown|not found|nonexistent|cannot select|can't select|\[NONEXISTENT\]/i;
const LOGIN = /auth|login|credential|password|AUTHENTICATIONFAILED|EAUTH/i;
const ENCRYPTION = /STARTTLS|TLS|SSL|secure|certificate|wrong version number|self-signed|handshake|encryption/i;

export function bridgeFailure(code, message, fields = {}) {
  const error = new Error(message);
  error.code = code;
  Object.assign(error, fields);
  return error;
}

function serverName(server) {
  return `${server?.host ?? "mail server"}:${server?.port ?? "?"}`;
}

export function tlsOptions(server) {
  return LOOPBACK.has(server?.host) ? { rejectUnauthorized: false } : {};
}

export function normaliseSecurity(server, kind) {
  const security = String(server?.security ?? "").toLowerCase();
  if (security === TLS || security === STARTTLS) return security;
  throw bridgeFailure("no-encryption", `${kind} ${serverName(server)} is not configured for TLS; no login was sent.`);
}

function errorText(error) {
  return [
    error?.responseText,
    error?.response,
    error?.serverResponse,
    error?.message,
    String(error),
  ].filter(Boolean).map(String).join(" ");
}

export function mapMailFailure(error, kind, server, folder) {
  if (["no-encryption", "login-refused", "not-found", "upstream-failed"].includes(error?.code)) throw error;
  const said = errorText(error);
  if (folder && (error?.mailboxMissing || MISSING.test(said))) throw bridgeFailure("not-found", `${folder}: ${said}`);
  if (LOGIN.test(said) || error?.code === "AUTHENTICATIONFAILED" || error?.code === "EAUTH") throw bridgeFailure("login-refused", said);
  if (ENCRYPTION.test(said)) throw bridgeFailure("no-encryption", `${kind} ${serverName(server)} offers no TLS; no login was sent. ${said}`);
  throw bridgeFailure("upstream-failed", said);
}

export function connectionParts(connection) {
  if (!connection || typeof connection !== "object" || connection.route !== "imap" || !connection.imap) {
    throw bridgeFailure("upstream-failed", "The mail connection is not an IMAP Bridge connection.");
  }
  const imap = connection.imap.imap;
  const smtp = connection.imap.smtp;
  const account = connection.imap.account ?? connection.address;
  const password = connection.imap.password;
  const folders = Array.isArray(connection.folders) && connection.folders.length ? connection.folders : ["INBOX"];
  if (!imap || !smtp || !account || !password) throw bridgeFailure("upstream-failed", "The mail connection is incomplete.");
  return { imap, smtp, account, password, folders };
}


async function withClient(imap, account, password, Flow, work) {
  const security = normaliseSecurity(imap, "IMAP");
  const client = new Flow({
    host: imap.host,
    port: imap.port,
    secure: security === TLS,
    doSTARTTLS: security === STARTTLS,
    auth: { user: account, pass: password, loginMethod: "LOGIN" },
    logger: false,
    disableAutoIdle: true,
    tls: tlsOptions(imap),
  });
  let connected = false;
  try {
    await client.connect();
    connected = true;
    return await work(client, security);
  } catch (error) {
    mapMailFailure(error, "IMAP", imap);
  } finally {
    if (connected && !client.isClosed) await client.logout().catch(() => client.close());
    else if (!client.isClosed) client.close();
  }
}

async function open(client, folder, imap) {
  try {
    return await client.mailboxOpen(folder, { readOnly: true });
  } catch (error) {
    mapMailFailure(error, "IMAP", imap, folder);
  }
}

export function testImap(connection, Flow) {
  const { imap, account, password, folders } = connection;
  return withClient(imap, account, password, Flow, async (client, security) => {
    const counts = {};
    for (const folder of folders) counts[folder] = (await open(client, folder, imap)).exists ?? 0;
    const listed = await client.list({ listOnly: true });
    return {
      counts,
      drafts: listed.some((folder) => folder.specialUse === "\\Drafts" || folder.flags?.has?.("\\Drafts")),
      sent: listed.some((folder) => folder.specialUse === "\\Sent" || folder.flags?.has?.("\\Sent")),
      encryption: client.tls?.version ?? (security === TLS ? "implicit TLS" : "STARTTLS"),
    };
  });
}

const person = ({ name, address }) => ({ name: name || null, address });

// A MOD-mail-routes Mail, parsed from the mail's bytes; its identifier is the MAIL- identifier of MOD-mail-records.
async function parseMail(source, folder) {
  const parsed = await PostalMime.parse(source);
  const messageId = parsed.messageId ?? null;
  return {
    id: await mailId({ messageId, bytes: messageId === null ? new Uint8Array(source) : null }),
    messageId,
    inReplyTo: parsed.inReplyTo ?? null,
    references: (parsed.references ?? "").split(/\s+/).filter(Boolean),
    from: person(parsed.from ?? { address: "" }),
    replyTo: (parsed.replyTo ?? []).map(person),
    to: (parsed.to ?? []).map(person),
    cc: (parsed.cc ?? []).map(person),
    subject: parsed.subject ?? "",
    date: parsed.date ?? "",
    text: parsed.text ?? "",
    attachments: (parsed.attachments ?? []).map((part) => ({
      name: part.filename ?? "", type: part.mimeType, size: part.content.byteLength,
      text: part.mimeType.startsWith("text/") ? new TextDecoder().decode(part.content) : null,
    })),
    folder,
  };
}

async function fetchAll(client, query) {
  const found = [];
  for await (const message of client.fetch("1:*", query, { uid: true })) found.push(message);
  return found;
}

// The mails of one folder with their uids, opened read-only; `since` keeps the mails dated on or after it.
async function mailsOf(client, folder, imap, since) {
  const opened = await open(client, folder, imap);
  const uidValidity = Number(opened.uidValidity);
  const mails = [];
  if (opened.exists) {
    for (const message of await fetchAll(client, { uid: true, source: true })) mails.push({ uid: message.uid, uidValidity, mail: await parseMail(message.source, folder) });
  }
  return mails.filter(({ mail }) => since === null || since === undefined || Date.parse(mail.date) >= Date.parse(since));
}

export function readMails(connection, Flow, since) {
  const { imap, account, password, folders } = connection;
  return withClient(imap, account, password, Flow, async (client) => {
    const all = [];
    for (const folder of folders) all.push(...(await mailsOf(client, folder, imap, since)).map(({ mail }) => mail));
    return all;
  });
}

// The mail of one identifier: the envelopes' Message-IDs are hashed, and only the mail that matches is fetched in full.
export function findMail(connection, Flow, id) {
  const { imap, account, password, folders } = connection;
  return withClient(imap, account, password, Flow, async (client) => {
    for (const folder of folders) {
      const opened = await open(client, folder, imap);
      if (!opened.exists) continue;
      for (const { uid, envelope } of await fetchAll(client, { uid: true, envelope: true })) {
        if (!envelope?.messageId || (await mailId({ messageId: envelope.messageId, bytes: null })) !== id) continue;
        const { source } = await client.fetchOne(uid, { source: true }, { uid: true });
        return parseMail(source, folder);
      }
    }
    throw bridgeFailure("not-found", `${id}: no mail with this identifier in ${folders.join(", ")}`);
  });
}

// The folder the mailbox marks with a special use (\\Drafts or \\Sent), read.
export function markedFolder(connection, Flow, use, since) {
  const { imap, account, password } = connection;
  return withClient(imap, account, password, Flow, async (client) => {
    const folder = (await client.list({ listOnly: true })).find((each) => each.specialUse === use || each.flags?.has?.(use));
    if (!folder) throw bridgeFailure("not-found", `${use}: the mailbox marks no such folder`);
    return mailsOf(client, folder.path, imap, since);
  });
}

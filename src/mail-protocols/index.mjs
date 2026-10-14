import { createRequire } from "node:module";

const requireBridgePackage = createRequire(new URL("../bridge-build/package.json", import.meta.url));
const { ImapFlow } = requireBridgePackage("imapflow");
const nodemailer = requireBridgePackage("nodemailer");

const STARTTLS = "starttls";
const TLS = "tls";
const LOOPBACK = new Set(["127.0.0.1", "::1", "localhost"]);
const MISSING = /doesn'?t exist|does not exist|no such|not exist|unknown|not found|nonexistent|cannot select|can't select|\[NONEXISTENT\]/i;
const LOGIN = /auth|login|credential|password|AUTHENTICATIONFAILED|EAUTH/i;
const ENCRYPTION = /STARTTLS|TLS|SSL|secure|certificate|wrong version number|self-signed|handshake|encryption/i;

function bridgeFailure(code, message, fields = {}) {
  const error = new Error(message);
  error.code = code;
  Object.assign(error, fields);
  return error;
}

function serverName(server) {
  return `${server?.host ?? "mail server"}:${server?.port ?? "?"}`;
}

function tlsOptions(server) {
  return LOOPBACK.has(server?.host) ? { rejectUnauthorized: false } : {};
}

function normaliseSecurity(server, kind) {
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

function mapMailFailure(error, kind, server, folder) {
  if (["no-encryption", "login-refused", "not-found", "upstream-failed"].includes(error?.code)) throw error;
  const said = errorText(error);
  if (folder && (error?.mailboxMissing || MISSING.test(said))) throw bridgeFailure("not-found", `${folder}: ${said}`);
  if (LOGIN.test(said) || error?.code === "AUTHENTICATIONFAILED" || error?.code === "EAUTH") throw bridgeFailure("login-refused", said);
  if (ENCRYPTION.test(said)) throw bridgeFailure("no-encryption", `${kind} ${serverName(server)} offers no TLS; no login was sent. ${said}`);
  throw bridgeFailure("upstream-failed", said);
}

function connectionParts(connection) {
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

async function testImap(connection, Flow) {
  const { imap, account, password, folders } = connection;
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
    const counts = {};
    for (const folder of folders) {
      try {
        const opened = await client.mailboxOpen(folder, { readOnly: true });
        counts[folder] = opened.exists ?? 0;
      } catch (error) {
        mapMailFailure(error, "IMAP", imap, folder);
      }
    }
    const listed = await client.list({ listOnly: true });
    return {
      counts,
      drafts: listed.some((folder) => folder.specialUse === "\\Drafts" || folder.flags?.has?.("\\Drafts")),
      sent: listed.some((folder) => folder.specialUse === "\\Sent" || folder.flags?.has?.("\\Sent")),
      encryption: client.tls?.version ?? (security === TLS ? "implicit TLS" : "STARTTLS"),
    };
  } catch (error) {
    mapMailFailure(error, "IMAP", imap);
  } finally {
    if (connected && !client.isClosed) await client.logout().catch(() => client.close());
    else if (!client.isClosed) client.close();
  }
}

async function testSmtp(connection, mailer) {
  const { smtp, account, password } = connection;
  const security = normaliseSecurity(smtp, "SMTP");
  const transport = mailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: security === TLS,
    requireTLS: security === STARTTLS,
    auth: { user: account, pass: password },
    logger: false,
    debug: false,
    tls: tlsOptions(smtp),
  });
  try {
    await transport.verify();
  } catch (error) {
    mapMailFailure(error, "SMTP", smtp);
  } finally {
    transport.close();
  }
}

async function testMailbox(connection, libraries) {
  const parts = connectionParts(connection);
  const imap = await testImap(parts, libraries.ImapFlow);
  await testSmtp(parts, libraries.nodemailer);
  return { counts: imap.counts, drafts: imap.drafts, sent: imap.sent, sending: "works", route: "imap", encryption: imap.encryption };
}

export function mailHandlers(libraries = {}) {
  const resolved = { ImapFlow, nodemailer, ...libraries };
  return {
    "POST /v1/mail/test": async ({ body }) => testMailbox(body?.connection, resolved),
  };
}

import { createRequire } from "node:module";
import { STARTTLS, TLS, bridgeFailure, normaliseSecurity, mapMailFailure, connectionParts, tlsOptions, testImap, readMails, findMail, markedFolder } from "./imap.mjs";

const requireBridgePackage = createRequire(new URL("../bridge-build/package.json", import.meta.url));
const { ImapFlow } = requireBridgePackage("imapflow");
const nodemailer = requireBridgePackage("nodemailer");

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
    "POST /v1/mail/read": async ({ body }) => readMails(connectionParts(body?.connection), resolved.ImapFlow, body?.args?.since ?? null),
    "POST /v1/mail/find": async ({ body }) => findMail(connectionParts(body?.connection), resolved.ImapFlow, body?.args?.id),
    "POST /v1/mail/drafts": async ({ body }) => (await markedFolder(connectionParts(body?.connection), resolved.ImapFlow, "\\Drafts", null))
      .map(({ uid, uidValidity, mail }) => ({ ref: { route: "bridge", uid, uidValidity }, inReplyTo: mail.inReplyTo, mail })),
    "POST /v1/mail/sent": async ({ body }) => (await markedFolder(connectionParts(body?.connection), resolved.ImapFlow, "\\Sent", body?.args?.since ?? null))
      .map(({ mail }) => mail),
  };
}

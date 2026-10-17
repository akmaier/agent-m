// bridge-route.mjs — the IMAP and SMTP route through the Bridge (MOD-mail-routes, Parts): the mailbox's test (ITM-425) and its read, find,
// drafts and sent (ITM-834). The draft and send operations of the route are UC-039's.
//
// Module: MOD-mail-routes
//
// THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE: the connection with its password goes in the body of the one request
// MOD-bridge-client's mailCall makes, to the Bridge the caller hands in; it is put nowhere else.

import { mailCall } from "../bridge-client/index.mjs";
import { failure } from "./errors.mjs";

const MISSING = /doesn'?t exist|does not exist|no such|not exist|unknown|not found|nonexistent|cannot select|can't select/i;

// What MOD-bridge-client throws, and what the Bridge answers with, as the module file names it. An error that is none of these is
// thrown as it is.
function named(error, connection) {
  const said = error?.message ?? String(error);
  // The Bridge's `not-found` for a named folder begins with the folder's name.
  if (error?.name === "BridgeFailed" && error.error === "not-found") {
    const folder = connection.folders.find((name) => said.startsWith(`${name}:`));
    if (folder !== undefined) return failure("FolderNotFound", { folder }, said);
  }
  if (["TokenMissing", "NoAnswer", "TokenRefused", "JumpHostLoginRefused", "Timeout"].includes(error?.name)
      || (error?.name === "BridgeFailed" && ["paused", "origin-refused", "not-found", "invalid-request"].includes(error.error))) {
    return failure("BridgeUnavailable", { reason: said, ...(error.likely ? { likely: error.likely } : {}) }, `The Bridge is unavailable: ${said}`);
  }
  if (error?.name !== "BridgeFailed") return error;
  if (error.error === "no-encryption") {
    const { imap, smtp } = connection.imap;
    const server = [imap.host, smtp.host].find((host) => said.includes(host)) ?? said;
    return failure("NoEncryption", { server }, said);
  }
  if (error.error === "login-refused") return failure("LoginRefused", { answer: said }, said);
  if (error.error === "upstream-failed") {
    const folder = MISSING.test(said) ? connection.folders.find((name) => said.includes(name)) : undefined;
    if (folder !== undefined) return failure("FolderNotFound", { folder }, said);
    return failure("Unreachable", { reason: said }, said);
  }
  return error;
}

/**
 * bridgeMailbox(connection: MailConnection, bridge: Bridge) -> Mailbox — the mailbox on the Bridge route: ITM-425 builds its test, ITM-834 its read, find, drafts and sent.
 */
export function bridgeMailbox(connection, bridge) {
  // One request to the Bridge; its failures are the module file's.
  async function ask(operation, args) {
    try {
      return await mailCall(bridge, operation, connection, args);
    } catch (error) {
      throw named(error, connection);
    }
  }
  return {
    // The mails of the named folders, opened read-only by the Bridge: nothing marked, moved, flagged or deleted.
    read: (since) => ask("read", { since }),
    // The Bridge answers a miss with `not-found` whose message begins with the identifier: that is null, never a guess.
    async find(id) {
      try {
        return await mailCall(bridge, "find", connection, { id });
      } catch (error) {
        if (error?.name === "BridgeFailed" && error.error === "not-found" && String(error.message).startsWith(`${id}:`)) return null;
        throw named(error, connection);
      }
    },
    drafts: () => ask("drafts", {}),
    sent: (since) => ask("sent", { since }),
    // The Bridge logs in to the IMAP server over TLS, counts the mails of the named folders read-only, finds Drafts and Sent, logs in to
    // the SMTP server over TLS without sending, and forgets the password; its answer is returned as it gave it.
    async test() {
      return ask("test", {});
    },
  };
}

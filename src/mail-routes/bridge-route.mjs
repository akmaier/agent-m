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

// A usable reply address: one address, "name@host", in the one `to` of a Draft (A REPLY GOES TO ONE REPORTER). The module file fixes no rule; this one
// refuses what is plainly none: missing, empty, without "@", or several in one.
const USABLE_ADDRESS = /^[^\s@,;<>]+@[^\s@,;<>]+$/;
function replyAddressed(draft) {
  const address = draft?.to?.address;
  if (Array.isArray(draft?.to) || typeof address !== "string" || !USABLE_ADDRESS.test(address)) {
    throw failure("NoReplyAddress", {}, "The mail has no usable reply address; nothing was stored.");
  }
  return draft;
}

// The Bridge's confirmation-refused as the module file's ConfirmationRefused with the reason; anything else is not this.
function refusal(error) {
  return error?.name === "BridgeFailed" && error.error === "confirmation-refused"
    ? failure("ConfirmationRefused", { reason: error.message }, error.message) : undefined;
}

/**
 * bridgeMailbox(connection: MailConnection, bridge: Bridge) -> Mailbox — the mailbox on the Bridge route: ITM-425 builds its test, ITM-834 its read, find, drafts and sent, ITM-835 its draft and send operations.
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
    // The reply is stored by the Bridge in Drafts; a draft without a usable reply address is refused here, before any request.
    storeDraft: async (draft) => ask("store-draft", { draft: replyAddressed(draft) }),
    updateDraft: async (ref, draft) => ask("update-draft", { ref, draft: replyAddressed(draft) }),
    showDraft: (ref) => ask("show-draft", { ref }),
    // The Bridge's single-use confirmation for the SHA-256 of the mail shown first, then the send with it. The Bridge's confirmation-refused to
    // send, when it says the draft is not the mail that was confirmed, is DraftChanged; any other is ConfirmationRefused with its message.
    async sendDraft(shown) {
      let confirmed;
      try {
        confirmed = await mailCall(bridge, "confirm-send", connection, { ref: shown.ref, sha256: shown.sha256 });
      } catch (error) {
        throw refusal(error) ?? named(error, connection);
      }
      try {
        return await mailCall(bridge, "send", connection, { confirmation: confirmed.confirmation });
      } catch (error) {
        if (error?.name === "BridgeFailed" && error.error === "confirmation-refused" && /not the mail that was confirmed/i.test(error.message)) {
          throw failure("DraftChanged", {}, error.message);
        }
        if (error?.name === "BridgeFailed" && error.error === "upstream-failed") {
          throw failure("SendRefused", { answer: error.message }, error.message);
        }
        throw refusal(error) ?? named(error, connection);
      }
    },
    sent: (since) => ask("sent", { since }),
    // The Bridge logs in to the IMAP server over TLS, counts the mails of the named folders read-only, finds Drafts and Sent, logs in to
    // the SMTP server over TLS without sending, and forgets the password; its answer is returned as it gave it.
    async test() {
      return ask("test", {});
    },
  };
}

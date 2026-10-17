// graph-route.mjs — the Microsoft Graph route (MOD-mail-routes, Parts): Microsoft's sign-in, signIn (ITM-424), and the mailbox's test on
// Microsoft Graph (ITM-425), read, find, drafts and sent (ITM-836). The draft and send operations of the route are UC-039's.
//
// Module: MOD-mail-routes
//
// THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER; A CREDENTIAL IS NEVER
// PLACED IN A URL; READING THE MAILBOX CHANGES NOTHING IN IT. The sign-in is Microsoft's library @azure/msal-browser 5.24.0 (ARC-053), vendored as one minified file beside its
// licence. The file puts itself at globalThis.msal when it is loaded; a page that does not reach a mailbox never loads this module. The
// token is taken from the library's cache and goes only into the authorisation header of the one request function below, whose
// address is always Microsoft Graph's.

import "./vendor/msal-browser.min.js";
import { instanceOfPagesAddress, pagesAddress } from "../identifiers/index.mjs";
import { mailId } from "../mail-records/index.mjs";
import PostalMime from "./vendor/postal-mime/postal-mime.js";

import { failure } from "./errors.mjs";
import { SIGN_IN_SERVICE } from "./index.mjs";

const GRAPH = "https://graph.microsoft.com/v1.0";
const SCOPES = Object.freeze(["Mail.ReadWrite", "Mail.Send", "offline_access"]);

// The tenant a sign-in goes to: the domain of the first of the mail addresses given that has one — the part after the last @, in lower case —,
// the institution's own tenant, where its administrators registered the app. Where none has a domain no tenant is known, and the person is
// asked for the mail address: there is no tenant to fall back to.
function authorityOf(...addresses) {
  for (const address of addresses) {
    const at = typeof address === "string" ? address.lastIndexOf("@") : -1;
    const domain = at < 0 ? "" : address.slice(at + 1).trim().toLowerCase();
    if (domain) return `${SIGN_IN_SERVICE}/${domain}`;
  }
  throw failure("MailAddressNeeded", {}, "Microsoft's sign-in goes to the institution's own tenant, named by the domain of the mail address: enter the mailbox's mail address (name@institution.org) and try again.");
}

// The return address Microsoft's window comes back to: the Pages address of the instance whose page this is, as registered with the app
// (UC-037 step 2); on any other page, that page's own address without its query and fragment.
function returnAddress() {
  const { hostname, pathname, origin } = globalThis.location;
  const instance = instanceOfPagesAddress({ hostname, pathname });
  return instance ? pagesAddress(instance) : `${origin}${pathname}`;
}

const REGISTRATION = /AADSTS(?:700016|50011|700025|7000218|900144)\b/;
const DECLINED = /AADSTS65004\b/;

// What the library throws, as signIn names it. An error that is none of these is thrown as it is.
function named(error) {
  const code = error?.errorCode ?? "";
  const said = error?.errorMessage || error?.message || String(error);
  if (code === "popup_window_error" || code === "empty_window_error") {
    return failure("PopupBlocked", {}, "The browser blocked Microsoft's sign-in window. Allow pop-ups for this page and try again.");
  }
  if (code === "user_cancelled") return failure("SignInCancelled", {}, "The sign-in window was closed before the sign-in was finished.");
  if (code === "access_denied" || code === "consent_required" || DECLINED.test(said)) {
    const permission = SCOPES.find((scope) => said.toLowerCase().includes(scope.toLowerCase())) ?? SCOPES.join(", ");
    return failure("PermissionDeclined", { permission }, `The permission ${permission} was not granted.`);
  }
  if (code === "invalid_client" || code === "unauthorized_client" || REGISTRATION.test(said)) {
    return failure("RegistrationRefused", {}, said);
  }
  if (["network_error", "get_request_failed", "post_request_failed"].includes(code)) {
    return failure("Unreachable", { reason: said }, `Microsoft's sign-in service could not be reached: ${said}`);
  }
  return error;
}

// The library's client for the app: the authority, the return address and the token cache in localStorage.
async function application(clientId, ...addresses) {
  const library = globalThis.msal;
  if (!library?.createStandardPublicClientApplication) throw new Error("Microsoft's sign-in library is not loaded.");
  return library.createStandardPublicClientApplication({
    auth: { clientId, authority: authorityOf(...addresses), redirectUri: returnAddress() },
    cache: { cacheLocation: "localStorage" },
  });
}

/**
 * signIn(clientId: string, address: string | null) -> Promise<{ account: string }> — Microsoft's sign-in in Microsoft's own window,
 * asking for exactly Mail.ReadWrite, Mail.Send and offline_access and nothing else, through the authorisation-code flow with PKCE;
 * the library's token cache is placed in localStorage. Returns the signed-in account's name; no token is returned, logged or placed
 * in an address. Crosses the network. Fails with PopupBlocked, SignInCancelled, PermissionDeclined { permission },
 * RegistrationRefused (its message Microsoft's own) and Unreachable { reason }.
 * @param {string} clientId
 * @param {string | null} address — the mailbox's address, offered to Microsoft as the account to sign in
 */
export async function signIn(clientId, address) {
  if (typeof clientId !== "string" || !clientId.trim()) throw new TypeError("Enter the app's client identifier.");
  try {
    const client = await application(clientId.trim(), address);
    const result = await client.loginPopup({ scopes: [...SCOPES], ...(address ? { loginHint: address } : {}) });
    return { account: result.account.username };
  } catch (error) {
    throw named(error);
  }
}

// ---------------------------------------------------------------- the mailbox's test

const EXPIRED = ["interaction_required", "login_required", "no_account_error", "invalid_grant", "no_tokens_found", "refresh_token_expired",
  "token_refresh_required"];

// The token the library's cache holds for the account, for exactly the three scopes, taken silently: no window opens, nothing is asked
// of the person. A sign-in that has run out — Microsoft's refresh tokens for a page expire after a day — is SignInExpired.
async function cachedToken({ clientId, account }, address) {
  const expired = () => failure("SignInExpired", {}, "The sign-in has expired: sign in with Microsoft again.");
  const client = await application(clientId, account, address);
  const known = client.getAllAccounts().find((each) => String(each.username).toLowerCase() === String(account).toLowerCase());
  if (!known) throw expired();
  try {
    const { accessToken, scopes } = await client.acquireTokenSilent({ scopes: [...SCOPES], account: known });
    return { accessToken, scopes };
  } catch (error) {
    if (EXPIRED.includes(error?.errorCode) || error?.name === "InteractionRequiredAuthError") throw expired();
    throw named(error);
  }
}

// The one request to Microsoft Graph: a GET, with the token in the authorisation header and nowhere else.
async function graphRequest(token, path) {
  return fetch(`${GRAPH}${path}`, { headers: { Authorization: `Bearer ${token}` }, credentials: "omit", cache: "no-store" });
}

// A resource of Graph, read: its answer, or null where it is not there. Failures as the module file names them.
async function graphRead(token, path, as = "json") {
  let answer;
  try {
    answer = await graphRequest(token, path);
  } catch (error) {
    throw failure("Unreachable", { reason: error?.message ?? String(error) }, `Microsoft Graph could not be reached: ${error?.message ?? error}`);
  }
  if (answer.status === 404) return null;
  if (answer.status === 401) throw failure("SignInExpired", {}, "Microsoft Graph refused the sign-in: sign in with Microsoft again.");
  if (answer.status === 403) throw failure("PermissionDeclined", { permission: "Mail.ReadWrite" }, "Microsoft Graph refused the permission Mail.ReadWrite.");
  if (answer.status === 429) {
    const retryAfter = Number(answer.headers.get("Retry-After")) || null;
    throw failure("Throttled", { retryAfter }, `Microsoft Graph asks to wait${retryAfter ? ` ${retryAfter} seconds` : ""}.`);
  }
  if (!answer.ok) throw failure("Unreachable", { reason: `Microsoft Graph answered ${answer.status}` }, `Microsoft Graph answered ${answer.status}.`);
  return as === "bytes" ? new Uint8Array(await answer.arrayBuffer()) : answer.json();
}

// ---------------------------------------------------------------- reading: read, find, drafts and sent (UC-038)

const person = ({ name, address }) => ({ name: name || null, address });

// A MOD-mail-routes Mail, parsed with postal-mime from the raw form Graph returns; its identifier is the MAIL- identifier of MOD-mail-records.
async function parseMail(bytes, folder) {
  const parsed = await PostalMime.parse(bytes);
  const messageId = parsed.messageId ?? null;
  return {
    id: await mailId({ messageId, bytes: messageId === null ? bytes : null }),
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

// The resource of a named folder: INBOX is the well-known inbox, any other name the top-level folder of that display name.
async function folderResource(token, name) {
  if (name.toUpperCase() === "INBOX") return "/me/mailFolders/inbox";
  const found = await graphRead(token, `/me/mailFolders?$filter=${encodeURIComponent(`displayName eq '${name.replaceAll("'", "''")}'`)}&$select=id`);
  const id = found?.value?.[0]?.id;
  if (!id) throw failure("FolderNotFound", { folder: name }, `The folder ${name} is not in the mailbox.`);
  return `/me/mailFolders/${encodeURIComponent(id)}`;
}

// The messages of a folder as Graph lists them ({ id, internetMessageId }), page after page. A next page is followed only when it is an
// address of Microsoft Graph: the token goes nowhere else.
async function listMessages(token, folder, name) {
  const messages = [];
  let path = `${folder}/messages?$select=id,internetMessageId&$top=100`;
  while (path) {
    const page = await graphRead(token, path);
    if (page === null) throw failure("FolderNotFound", { folder: name }, `The folder ${name} is not in the mailbox.`);
    messages.push(...page.value);
    const next = page["@odata.nextLink"];
    if (next && !next.startsWith(`${GRAPH}/`)) {
      throw failure("Unreachable", { reason: "Microsoft Graph named a next page at another address" }, "Microsoft Graph named a next page at another address; it was not followed.");
    }
    path = next ? next.slice(GRAPH.length) : null;
  }
  return messages;
}

// One message in full, read in its raw form; a message that is gone since it was listed is null.
async function fetchMail(token, id, folder) {
  const bytes = await graphRead(token, `/me/messages/${encodeURIComponent(id)}/$value`, "bytes");
  return bytes === null ? null : parseMail(bytes, folder);
}

async function mailsOf(token, folder, name, from) {
  const mails = [];
  for (const { id } of await listMessages(token, folder, name)) {
    const mail = await fetchMail(token, id, name);
    if (mail) mails.push({ id, mail });
  }
  return mails.filter(({ mail }) => from === null || from === undefined || Date.parse(mail.date) >= Date.parse(from));
}

/**
 * graphMailbox(connection: MailConnection) -> Mailbox — the mailbox on the Microsoft route: ITM-425 builds its test, ITM-836 its read,
 * find, drafts and sent. Every request is a GET.
 */
export function graphMailbox(connection) {
  const token = async () => (await cachedToken(connection.graph, connection.address)).accessToken;
  return {
    // The mails of the named folders, read in their raw form: nothing is marked, moved, flagged or deleted.
    async read(from) {
      const accessToken = await token();
      const mails = [];
      for (const name of connection.folders) {
        mails.push(...(await mailsOf(accessToken, await folderResource(accessToken, name), name, from)).map(({ mail }) => mail));
      }
      return mails;
    },
    // The Message-IDs of the named folders' mails are hashed; only the mail that matches is fetched in full. None: null, never a guess.
    async find(id) {
      const accessToken = await token();
      for (const name of connection.folders) {
        const folder = await folderResource(accessToken, name);
        for (const message of await listMessages(accessToken, folder, name)) {
          if (!message.internetMessageId || (await mailId({ messageId: message.internetMessageId, bytes: null })) !== id) continue;
          const mail = await fetchMail(accessToken, message.id, name);
          if (mail) return mail;
        }
      }
      return null;
    },
    // The mailbox's Drafts, each with the reference of the draft on this route.
    async drafts() {
      const accessToken = await token();
      return (await mailsOf(accessToken, "/me/mailFolders/drafts", "Drafts", null))
        .map(({ id, mail }) => ({ ref: { route: "graph", id }, inReplyTo: mail.inReplyTo, mail }));
    },
    async sent(from) {
      const accessToken = await token();
      return (await mailsOf(accessToken, "/me/mailFolders/sentitems", "Sent Items", from)).map(({ mail }) => mail);
    },
    // The mails in each named folder, whether Drafts and Sent are there, and whether sending works — the token holds Mail.Send; nothing
    // is sent to find out. Every request reads; nothing in the mailbox changes (READING THE MAILBOX CHANGES NOTHING IN IT).
    async test() {
      const { accessToken, scopes } = await cachedToken(connection.graph, connection.address);
      const counts = {};
      for (const name of connection.folders) {
        const path = name.toUpperCase() === "INBOX" ? "/me/mailFolders/inbox?$select=totalItemCount"
          : `/me/mailFolders?$filter=${encodeURIComponent(`displayName eq '${name.replaceAll("'", "''")}'`)}&$select=totalItemCount`;
        const found = await graphRead(accessToken, path);
        const folder = name.toUpperCase() === "INBOX" ? found : found?.value?.[0];
        if (!folder) throw failure("FolderNotFound", { folder: name }, `The folder ${name} is not in the mailbox.`);
        counts[name] = folder.totalItemCount;
      }
      const drafts = (await graphRead(accessToken, "/me/mailFolders/drafts?$select=id")) !== null;
      const sent = (await graphRead(accessToken, "/me/mailFolders/sentitems?$select=id")) !== null;
      return { counts, drafts, sent, sending: scopes?.includes("Mail.Send") ? "works" : "the sign-in did not grant Mail.Send",
        route: "graph", encryption: "TLS to Microsoft Graph" };
    },
  };
}

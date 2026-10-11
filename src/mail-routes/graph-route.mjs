// graph-route.mjs — the Microsoft Graph route (MOD-mail-routes, Parts): Microsoft's sign-in, signIn. ITM-424 builds it; the mailbox
// operations on this route are built by ITM-425.
//
// Module: MOD-mail-routes
//
// THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER; A CREDENTIAL IS NEVER
// PLACED IN A URL. The sign-in is Microsoft's library @azure/msal-browser 5.24.0 (ARC-053), vendored as one minified file beside its
// licence. The file puts itself at globalThis.msal when it is loaded; a page that does not reach a mailbox never loads this module.

import "./vendor/msal-browser.min.js";
import { instanceOfPagesAddress, pagesAddress } from "../identifiers/index.mjs";

const AUTHORITY = "https://login.microsoftonline.com/common";
const SCOPES = Object.freeze(["Mail.ReadWrite", "Mail.Send", "offline_access"]);

// A failure of signIn: an error with the name the module file gives it and its fields.
function failure(name, fields, message) {
  return Object.assign(new Error(message), { name }, fields);
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
  const library = globalThis.msal;
  if (!library?.createStandardPublicClientApplication) throw new Error("Microsoft's sign-in library is not loaded.");
  try {
    const client = await library.createStandardPublicClientApplication({
      auth: { clientId: clientId.trim(), authority: AUTHORITY, redirectUri: returnAddress() },
      cache: { cacheLocation: "localStorage" },
    });
    const result = await client.loginPopup({ scopes: [...SCOPES], ...(address ? { loginHint: address } : {}) });
    return { account: result.account.username };
  } catch (error) {
    throw named(error);
  }
}

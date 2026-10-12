// Microsoft's sign-in for a mailbox (ITM-424) — MOD-mail-routes' signIn, as the accepted text of docs/architecture/MOD-mail-routes.md
// and ARC-053 state it: "signIn(clientId, address | null) -> Promise<{ account }> — Microsoft's sign-in in Microsoft's own window,
// asking for exactly Mail.ReadWrite, Mail.Send and offline_access and nothing else, through the authorisation-code flow with PKCE
// (ARC-053). … No token is ever placed in an address or link. Errors: PopupBlocked, SignInCancelled, PermissionDeclined with the
// permission declined, RegistrationRefused with Microsoft's message — the client identifier or the return address is not registered —,
// Unreachable"; ARC-053: the sign-in opens Microsoft's own window (loginPopup) and asks for the three scopes and nothing else, and
// MSAL's token cache is placed in localStorage with cacheLocation "localStorage". For UC-037 step 3 and the alternative flows 3a, 3b.
// Run: node --test tests/mail-routes-sign-in.test.mjs
//
// Module: MOD-mail-routes
// Guards: UC-037; AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN; THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER; A CREDENTIAL IS NEVER PLACED IN A URL
// Level: unit
//
// The library's client is a stand-in of the tests' own, put where the vendored @azure/msal-browser puts itself (globalThis.msal) after
// the module is loaded: createStandardPublicClientApplication(config), the way the library's version 5 creates and initialises its
// client, and the client's loginPopup(request); it records both and answers as the test says. The library's errors are objects with
// `name`, `errorCode`, `errorMessage` and `subError`, as its AuthError has them; the module file does not say which codes of the
// library each error of signIn stands for, nor which fields they carry: this file reads popup_window_error and empty_window_error as
// PopupBlocked, user_cancelled as SignInCancelled, access_denied and consent_required, or Microsoft's AADSTS65004, as
// PermissionDeclined naming the scope Microsoft's message names, else the three together in one text; the AADSTS codes of an unknown
// application (700016), a return address that is not registered (50011) and the codes invalid_client and unauthorized_client as
// RegistrationRefused whose `message` is Microsoft's own; network_error, get_request_failed and post_request_failed as Unreachable
// with `reason`. The authority is the institution's own tenant, `https://login.microsoftonline.com/<domain of the mail address>` (the accepted text), the domain being the part after the last @, in lower case; no `/common` is ever used. Where the texts name nothing for a sign-in without an address, the reading taken is a refusal that names how to fix it: MailAddressNeeded, asking for the mailbox's mail address, before any client is made. The return address
// is the Pages address of the instance whose page this is. Nothing reaches the network. Each test states its input and its expected
// result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";

const mailRoutes = await import("../src/mail-routes/index.mjs").catch((error) => ({ error }));
const { signIn } = mailRoutes;

const SCOPES = ["Mail.ReadWrite", "Mail.Send", "offline_access"];
const CLIENT = "11111111-2222-3333-4444-555555555555";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.SECRET-ACCESS-TOKEN";

// The page: the instance alice/agent-m, on its GitHub Pages address.
globalThis.location = { hostname: "alice.github.io", pathname: "/agent-m/", origin: "https://alice.github.io", href: "https://alice.github.io/agent-m/" };

// The stand-in. answer: what loginPopup answers — an Error to throw, or the result to return. Everything it is asked is recorded.
function standIn(answer) {
  const seen = { configs: [], logins: [], redirects: 0, opened: [] };
  globalThis.open = (...args) => { seen.opened.push(args); return null; };
  globalThis.msal = {
    createStandardPublicClientApplication: async (config) => {
      seen.configs.push(structuredClone(config));
      return {
        loginPopup: async (request) => {
          seen.logins.push(structuredClone(request));
          if (answer instanceof Error) throw answer;
          return answer;
        },
        loginRedirect: async () => { seen.redirects += 1; },
        acquireTokenRedirect: async () => { seen.redirects += 1; },
      };
    },
  };
  return seen;
}
const signedIn = { account: { username: "reports@example.org", homeAccountId: "x.y", tenantId: "t" }, accessToken: TOKEN, idToken: TOKEN,
  scopes: SCOPES };
const failure = (name, errorCode, errorMessage, subError = "") => Object.assign(new Error(`${errorCode}: ${errorMessage}`),
  { name, errorCode, errorMessage, subError });

// guards: THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING; A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
// given: the stand-in, which signs the account reports@example.org in
// input: signIn(CLIENT, "reports@example.org")
// expect: one login, whose request asks for exactly the three scopes — Mail.ReadWrite, Mail.Send, offline_access — and nothing else:
//         no extra scope to consent to, no other field than the scopes and the hint of the address
test("signIn — asks for exactly Mail.ReadWrite, Mail.Send and offline_access, and nothing else", async () => {
  assert.ok(signIn, `signIn: ${mailRoutes.error?.message}`);
  const seen = standIn(signedIn);
  await signIn(CLIENT, "reports@example.org");
  assert.equal(seen.logins.length, 1);
  assert.deepEqual([...seen.logins[0].scopes].sort(), [...SCOPES].sort(), "the three scopes");
  assert.equal(seen.logins[0].scopes.length, 3, "each once");
  assert.deepEqual(Object.keys(seen.logins[0]).sort(), ["loginHint", "scopes"], "no other field");
  assert.equal(seen.logins[0].loginHint, "reports@example.org");
});

// guards: AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
// given: the stand-in, on the page of the instance alice/agent-m
// input: signIn(CLIENT, "reports@example.org")
// expect: the client created once with the client identifier, the institution's tenant as authority, the instance's Pages address as the return
//         address and the cache in localStorage; the window used is the popup — no redirect
test("signIn — Microsoft's own window and the token cache in localStorage are configured", async () => {
  assert.ok(signIn, `signIn: ${mailRoutes.error?.message}`);
  const seen = standIn(signedIn);
  await signIn(CLIENT, "reports@example.org");
  assert.equal(seen.configs.length, 1);
  const { auth, cache } = seen.configs[0];
  assert.equal(auth.clientId, CLIENT);
  assert.equal(auth.authority, "https://login.microsoftonline.com/example.org");
  assert.equal(auth.redirectUri, "https://alice.github.io/agent-m/");
  assert.equal(cache.cacheLocation, "localStorage");
  assert.equal(seen.logins.length, 1, "the popup is the window");
  assert.equal(seen.redirects, 0, "no redirect of the page");
});

// guards: AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
// given: the stand-in, whose login answers with the account and, as the library's result has them, an access token and an id token
// input: signIn(CLIENT, "reports@example.org")
// expect: { account: "reports@example.org" } and nothing else: no token in what is returned
test("signIn — returns the account, and no token", async () => {
  assert.ok(signIn, `signIn: ${mailRoutes.error?.message}`);
  standIn(signedIn);
  const answer = await signIn(CLIENT, "reports@example.org");
  assert.deepEqual(answer, { account: "reports@example.org" });
  assert.ok(!JSON.stringify(answer).includes("SECRET"), "no token");
});

// guards: A CREDENTIAL IS NEVER PLACED IN A URL; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
// given: the stand-in, which answers with an access token; the page's own window.open and address recorded
// input: signIn(CLIENT, "reports@example.org")
// expect: the module opens no window and changes no address itself; every address it hands the library — authority, return address —
//         is a plain address with no query, no fragment and no token; the token is nowhere in what the module handed over
test("signIn — no token in any address the page opens", async () => {
  assert.ok(signIn, `signIn: ${mailRoutes.error?.message}`);
  const seen = standIn(signedIn);
  const before = globalThis.location.href;
  await signIn(CLIENT, "reports@example.org");
  assert.deepEqual(seen.opened, [], "the module opens nothing itself");
  assert.equal(globalThis.location.href, before, "the page's address is not changed");
  for (const address of [seen.configs[0].auth.authority, seen.configs[0].auth.redirectUri]) {
    const page = new URL(address);
    assert.equal(page.search + page.hash + page.username + page.password, "", `${address}: no query, fragment or user`);
  }
  assert.ok(!JSON.stringify([seen.configs, seen.logins]).includes("SECRET"), "no token handed over");
});

// guards: UC-037 (3a, 3b); AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
// given: the stand-in, whose login fails, each time as the library fails
// input: signIn(CLIENT, "reports@example.org") for each answer
// expect: the error named after it — PopupBlocked (the browser blocked the window), SignInCancelled (the person closed it),
//         PermissionDeclined naming the permission, RegistrationRefused with Microsoft's own message, Unreachable with the reason
const MISSING = "AADSTS700016: Application with identifier '11111111-2222-3333-4444-555555555555' was not found in the directory 'Contoso'.";
const MISMATCH = "AADSTS50011: The redirect URI 'https://alice.github.io/agent-m/' specified in the request does not match the redirect URIs configured for the application.";
for (const [what, answer, name, check] of [
  ["a blocked window", failure("BrowserAuthError", "popup_window_error", "Error opening popup window."), "PopupBlocked"],
  ["a window that did not open", failure("BrowserAuthError", "empty_window_error", "window handle is empty"), "PopupBlocked"],
  ["a closed window", failure("BrowserAuthError", "user_cancelled", "User cancelled the flow."), "SignInCancelled"],
  ["a declined permission, named by Microsoft", failure("ServerError", "access_denied", "AADSTS65004: The user declined to consent to access the app. Scope Mail.Send."),
    "PermissionDeclined", (error) => assert.equal(error.permission, "Mail.Send")],
  ["a declined consent, no permission named", failure("InteractionRequiredAuthError", "consent_required", "AADSTS65001: consent is needed."),
    "PermissionDeclined", (error) => assert.equal(error.permission, "Mail.ReadWrite, Mail.Send, offline_access")],
  ["an unknown application", failure("ServerError", "invalid_request", MISSING), "RegistrationRefused", (error) => assert.equal(error.message, MISSING)],
  ["a return address that is not registered", failure("ServerError", "invalid_request", MISMATCH), "RegistrationRefused",
    (error) => assert.equal(error.message, MISMATCH)],
  ["a client Microsoft refuses", failure("ServerError", "invalid_client", "Client authentication failed."), "RegistrationRefused",
    (error) => assert.equal(error.message, "Client authentication failed.")],
  ["a network that fails", failure("BrowserAuthError", "network_error", "Network request failed."), "Unreachable",
    (error) => assert.match(error.reason, /Network request failed/)],
  ["a token endpoint that is not reached", failure("BrowserAuthError", "post_request_failed", "Post request failed."), "Unreachable",
    (error) => assert.match(error.reason, /Post request failed/)],
]) {
  test(`signIn — ${what} is answered with ${name}`, async () => {
    assert.ok(signIn, `signIn: ${mailRoutes.error?.message}`);
    standIn(answer);
    await assert.rejects(signIn(CLIENT, "reports@example.org"), (error) => {
      assert.equal(error.name, name);
      check?.(error);
      return true;
    });
  });
}

// guards: AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER; UC-037 (step 3)
// given: the stand-in; the page of the instance alice/agent-m
// input: signIn(CLIENT, address) for reports@example.org, for Reports@Uni-Example.DE, 
// expect: the authority the institution's own tenant: https://login.microsoftonline.com/example.org, .../uni-example.de (the domain in lower case),
//         for a quoted local part holding an @ the domain after the last @, and for the address with no domain Microsoft's multi-tenant /common; always on the host login.microsoftonline.com, no query
test("signIn — signs in at the tenant of the mail address's domain", async () => {
  assert.ok(signIn, `signIn: ${mailRoutes.error?.message}`);
  for (const [address, tenant] of [["reports@example.org", "example.org"], ["Reports@Uni-Example.DE", "uni-example.de"], ["\"a@b\"@example.org", "example.org"]]) {
    const seen = standIn(signedIn);
    await signIn(CLIENT, address);
    assert.equal(seen.configs[0].auth.authority, `https://login.microsoftonline.com/${tenant}`, address);
  }
});

// guards: AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN; UC-037 (step 3)
// given: the stand-in; no address (null), an empty one, one without a domain ("reports"), one ending in @
// input: signIn(CLIENT, address) for each
// expect: each refused with MailAddressNeeded whose message asks for the mail address; no client created, no window opened, nothing common
test("signIn — without a domain no tenant is known: refused, asking for the mail address", async () => {
  assert.ok(signIn, `signIn: ${mailRoutes.error?.message}`);
  for (const address of [null, "", "reports", "reports@"]) {
    const seen = standIn(signedIn);
    await assert.rejects(signIn(CLIENT, address), (error) => error.name === "MailAddressNeeded" && /mail address/i.test(error.message), `${address}`);
    assert.equal(seen.configs.length, 0, "no client made");
    assert.equal(seen.logins.length, 0, "no window");
  }
});

---
id: ARC-053
title: The Microsoft sign-in in the page
refines: ARC-037
forced_by:
  - AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
  - THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING
  - THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
  - NO SERVER
  - CONFIGURATION LIVES IN THE BROWSER
  - CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
  - A CLEAR IS A REAL CLEAR
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - UC-037
  - UC-038
  - UC-039
---
# ARC-053 The Microsoft sign-in in the page

## Context

A Microsoft 365 mailbox is opened by Microsoft's own sign-in, in Microsoft's own window; Agent M never sees a password
(`AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN`, UC-037). The sign-in asks for exactly `Mail.ReadWrite`,
`Mail.Send` and `offline_access` (`THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING`). The token it yields
goes only to Microsoft's API (`THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER`); it is kept in the browser's
`localStorage` (`CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE`), listed on the settings page (`EVERY SETTING
IS REACHED FROM ONE PAGE`), and removed by a clear (`A CLEAR IS A REAL CLEAR`). There is no server to keep a client secret
(`NO SERVER`): the page is a public client, registered with Microsoft as a single-page application whose return address
is the instance's Pages address (UC-037).

## Decision

MOD-mail-routes signs in with **@azure/msal-browser**, Microsoft's library for exactly this case: it serves
"authentication in JavaScript Single-Page Applications without backend servers" and "uses the OAuth 2.0 Authorization
Code Flow with PKCE" (its README).

- The sign-in opens Microsoft's own window (`loginPopup`) and asks for the three scopes and nothing else.
- MSAL's token cache is placed in `localStorage` with `cacheLocation: "localStorage"`, one of the values its
  configuration documents (`"sessionStorage"`, `"localStorage"`, `"memoryStorage"`). The cache's keys are MSAL's own;
  MOD-browser-store lists them among the browser's settings and removes them on a clear.
- A token from the cache goes only into the authorisation header of requests to Microsoft Graph.
- The library is vendored as the single minified file its package publishes, `lib/msal-browser.min.js`, in
  `src/mail-routes/vendor/`, with its licence file, and is loaded only by the pages that reach the mailbox.

## Alternatives

- **oauth4webapi.** MIT, without dependencies: a "Low-Level OAuth 2 / OpenID Connect Client API for JavaScript Runtimes"
  that implements the authorization code flow with PKCE and the refresh token grant, and runs in browsers among other
  runtimes (its README). It offers routines, not a sign-in: handling Microsoft's window, keeping and refreshing the tokens,
  and Microsoft's own behaviour around accounts and consent would be Agent M's own code — the part of the mail route where
  a mistake costs most. Rejected.
- **Writing the authorisation code flow with PKCE ourselves**, with `fetch` to Microsoft's endpoints and WebCrypto for the
  code challenge. No dependency at all, and even more of that code Agent M's own. Rejected for the same reason
  (`KEEP IT SIMPLE`).

## Due diligence

Agent M's own licence is MIT (its `LICENSE` file). Adoption is the package's downloads from the npm registry between
2026-09-05 and 2026-10-04. Releases count every version the registry lists, and in brackets those without a pre-release
tag. Issues are those of the source repository the registry names.

| Candidate | Licence | Compatible with MIT | First release | Latest release | Releases | Open / closed issues | Adoption | Read from | Read on |
|---|---|---|---|---|---|---|---|---|---|
| @azure/msal-browser — chosen | MIT | yes | 2020-01-18 | 5.24.0, 2026-10-02 | 207 (185) | 150 / 3,770, in the repository of Microsoft's authentication libraries for JavaScript, which holds more packages than this one | 78,813,493 | [1] | 2026-10-05 |
| oauth4webapi | MIT | yes | 2022-10-10 | 3.8.8, 2026-09-05 | 79 (79) | 0 / 31 | 59,699,229 | [2] | 2026-10-05 |
| our own code | Agent M's MIT licence | yes | — | — | — | — | — | — | — |

No candidate is marked: every licence is known to be compatible with MIT. Writing the flow ourselves reuses nothing, so
no registry has facts about it.

Where each fact was read — from a registry entry: licence, first release (`time.created`), latest release
(`dist-tags.latest` and its time), releases (`versions`), dependencies; from a package's file list: the files it
publishes; adoption from the downloads address; open and closed issues as `total_count` of the two searches:

- [1] https://registry.npmjs.org/@azure%2Fmsal-browser (one dependency, `@azure/msal-common`) ·
  https://unpkg.com/@azure/msal-browser@5.24.0/?meta (`lib/msal-browser.min.js`, 288,797 bytes) ·
  https://api.npmjs.org/downloads/point/last-month/@azure/msal-browser ·
  https://api.github.com/search/issues?q=repo:AzureAD/microsoft-authentication-library-for-js+is:issue+is:open and
  `+is:closed` · its README and documentation:
  https://raw.githubusercontent.com/AzureAD/microsoft-authentication-library-for-js/dev/lib/msal-browser/README.md,
  …/lib/msal-browser/docs/configuration.md, …/lib/msal-browser/docs/login-user.md
- [2] https://registry.npmjs.org/oauth4webapi (no dependencies) · https://unpkg.com/oauth4webapi@3.8.8/?meta
  (`build/index.js`, 99,856 bytes) · https://api.npmjs.org/downloads/point/last-month/oauth4webapi ·
  https://api.github.com/search/issues?q=repo:panva/oauth4webapi+is:issue+is:open and `+is:closed` · its README:
  https://raw.githubusercontent.com/panva/oauth4webapi/main/README.md

## Consequences

- "Refresh tokens sent to a redirect URI registered as spa expire after 24 hours" (Microsoft's documentation,
  https://learn.microsoft.com/en-us/entra/identity-platform/refresh-tokens, read on 2026-10-05): a person signs in again
  at least once a day on which they use the mail pages, as UC-037 foresees for an expired sign-in.
- Agent M places no credential in an address (`A CREDENTIAL IS NEVER PLACED IN A URL`): no key, token or password
  appears in any address or link Agent M makes. Microsoft's sign-in, which UC-037 prescribes, returns its one-time
  authorisation code in the address of its own window when that window comes back to the instance's page, as the
  authorisation code flow does; the code grants nothing without the PKCE verifier, which never leaves the page, MSAL
  exchanges it once, and the window closes. The tokens it yields travel only in the authorisation header.
- MOD-browser-store must know MSAL's cache keys, so that they appear on the settings page and a clear removes them.
- The app registration with Microsoft is the person's own (UC-037); its client identifier is a setting in this browser.

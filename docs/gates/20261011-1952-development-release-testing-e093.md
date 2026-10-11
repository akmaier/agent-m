---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a4f05b0749cafbe729c972e50c2ed1ee06ec01a6
  - https://github.com/akmaier/agent-m/pull/410
date: 2026-10-11 19:52 UTC
---
# Development → Release testing: ITM-424, Microsoft's sign-in for a mailbox

**REGISTER**

## Reason

ITM-424, pull request #410 by developer-sonnet-d into `sprint/team1/19`, head `a4f05b0`. The first commit `5d3466d`
holds only `tests/mail-routes-sign-in.test.mjs`, and CI was red on it (run 38169425155): its 14 tests fail, and no
other test does. CI is green on `a4f05b0` (run 38169596682, node 1790 tests, 0 failures; python OK). The change is
only `src/mail-routes/`: `graph-route.mjs` with `signIn`, its export in `index.mjs`, and the vendored
`vendor/msal-browser.min.js` with its MIT licence, as ARC-053 decides. Its sha256 is `ceddf899…d976f`, the file of the
5.24.0 tarball whose shasum is the registry's (checked by the Scrum Master), and the guard of #407 passes on it. The new
test names MOD-mail-routes and its guards, and 25 faults planted on the draft are recorded, none surviving. The
Acceptance holds: the three scopes and nothing else, the window and the `localStorage` cache, each error, the account,
no token in an address.

The readings weighed: the return address is the instance's Pages address, as ARC-053 states ("registered ... as a
single-page application whose return address is the instance's Pages address") and UC-037 step 2 shows; the authority
`https://login.microsoftonline.com/common` is named by no accepted text, and is the library's own default on Microsoft's
sign-in service, which `NO SERVER` permits — noted for the review, with whether `organizations` is meant for Microsoft
365 organisations; the library's codes mapped to the five errors MOD-mail-routes' file names; the library loaded with
`index.mjs`, which no page imports yet, so it reaches only the pages that will reach the mailbox (ARC-053), noted for
the review once a page imports the module for `routeFor` alone; no round trip to Microsoft, which the Acceptance's
stand-in for the library's client does not ask for.

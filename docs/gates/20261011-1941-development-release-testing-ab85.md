---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 555cbd40e3d3f29ecc3463ca17de1fa5f12d1432
  - https://github.com/akmaier/agent-m/pull/407
date: 2026-10-11 19:41 UTC
---
# Development → Release testing: sprint team1/19, between jobs — NO SERVER and msal-browser's sign-in requests

**REGISTER**

## Reason

The change between jobs the sprint's record names for ITM-424, pull request #407 by developer-sonnet-d into
`sprint/team1/19`, head `555cbd4`. It changes only `tests/test_no_backend.py`, of the kind
`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` names: it lets the whole repository's check allow MOD-mail-routes what its
file and ARC-053 state it uses. As the record says: `src/mail-routes/vendor/` joins the vendored folders, and in
`src/mail-routes/vendor/msal-browser.min.js` only, with the version 5.24.0 written in it, four channels read from the
library's file (the npm registry's tarball, its shasum equal to the registry's, 288,797 bytes as ARC-053 states) are
permitted: its network client's GET and POST to the address it is given, the preconnect link to its authority's origin,
and the hidden iframe of its silent sign-in — the requests of Microsoft's sign-in, which `NO SERVER` permits as the
mail provider's sign-in; the authority's address stays in MOD-mail-routes' own code, which check 1 still reads. The
test commit `82f0dae` was red on its new test alone (run 38168656470); CI is green on `555cbd4` (run 38168836818).
The test names MOD-mail-routes, with 8 guard faults recorded.

The point weighed: the green commit changes one assertion of the new test, from exactly four findings for the library's
text placed elsewhere to at least four, the first four at that path. It corrects a count the red commit stated wrongly:
for a path under `src/mail-routes/`, #400's folder entry adds its own finding of a fetch count. Each of the four
channels is still found at every other path, and every other expectation is unchanged; an exact count per path would be
stricter and is noted for the review.

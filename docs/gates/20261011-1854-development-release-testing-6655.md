---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c1a622381175d7ef7755c80fa798eb2b80a650ae
  - https://github.com/akmaier/agent-m/pull/400
date: 2026-10-11 18:54 UTC
---
# Development → Release testing: sprint team1/18, between jobs — NO SERVER permits MOD-mail-routes' lookup and pages

**REGISTER**

## Reason

The change between jobs that the sprint's record names (`d4db024`), pull request #400 by developer-sonnet-a into
`sprint/team1/18`, head `c1a6223`. It changes only `tests/test_no_backend.py`, a file no module owns, in one kind
`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` names: it lets the whole repository's check allow `src/mail-routes/`
what MOD-mail-routes' file states it uses — one fetch at Microsoft's sign-in service, `login.microsoftonline.com`,
already a permitted host, and the two pages of `providerLinks()` as links only. The test commit `2d243d7` was red on
its new counter-proof (run 38165433299); CI is green on `c1a6223` (run 38165578817). The new test names MOD-mail-routes,
and 9 faults are recorded; the same text in `src/home/` is found, the known positive.

The point weighed: MOD-mail-routes' file names the pages — Microsoft's page for registering the app (UC-037 step 2) and
its page on which the app's access is withdrawn — but not their hosts. `entra.microsoft.com` (the Entra admin centre,
where an app is registered) and `myapps.microsoft.com` (where a person reviews and removes the apps that have access)
are Microsoft's addresses of exactly those two pages, allowed as links in `src/mail-routes/` only and never as a
channel. That reads the file as it stands; no accepted text changes.

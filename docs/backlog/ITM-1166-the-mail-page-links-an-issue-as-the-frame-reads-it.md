---
id: ITM-1166
title: The mail page links an issue's page as the frame reads it
level: module
realises:
  - UC-038
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-582
tests:
  - unit
origin:
  - the gate of #1255 (ITM-582, team 2's sprint 100), developer-sonnet-f's finding
---
# ITM-1166 The mail page links an issue's page as the frame reads it

**REGISTER**

## Outcome

`src/maintenance-pages/mail.mjs:250` (*Propose SPEC change*) and `:386` (an issue's number) link `#issue/<n>`, and
`tests/maintenance-pages-mail.test.mjs:159` and `:200` pin that form. Both come from ITM-963.
- The frame's `routeOf` (`src/site-frame/routing.mjs:14-22`) reads a fragment's parameters as `key=value` parts only, as
  MOD-site-frame.md states. So `<n>` is no parameter, and the route `issue` that ITM-582 built (`#issue/number=<n>`) gets
  no issue.
- It is the defect ITM-1108 fixed on the replies page.

## Acceptance

- Both links lead to `#issue/number=<n>`, and a test opens each and finds that issue's page, with a counter-proof.
- The tests that pin the old form change with them. They are MOD-maintenance-pages' own unit and component tests.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

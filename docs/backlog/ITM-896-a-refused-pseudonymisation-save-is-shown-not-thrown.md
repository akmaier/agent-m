---
id: ITM-896
title: A pseudonymisation Save that is refused is shown on the page, not thrown
level: module
realises:
  - NO SECRET IN THE REPOSITORY
  - UC-042
modules:
  - MOD-settings-pages
builds_on:
  - ITM-884
tests:
  - unit
origin:
  - developer-sonnet-a's finding on ITM-884's pull request #851 (sprint team1/87)
---
# ITM-896 A pseudonymisation Save that is refused is shown on the page, not thrown

**REGISTER**

## Outcome

The pseudonymisation's Save (`src/settings-pages/settings.mjs:960`) calls `saveFile` on `docs/settings.md` without catching
what it throws. A `SecretRefused` (MOD-artifact-edits.md:98) becomes an unhandled rejection, and the person sees nothing.
It is the same defect as ITM-884's three collaborator handlers, in a handler that item does not name. This is a lead from
the code, found by developer-sonnet-a on #851, and its red test confirms it.

## Acceptance

- A pseudonymisation Save that `saveFile` refuses shows the refusal in its result line, naming the file and never the
  secret, as ITM-884's handlers do. A test checks this, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

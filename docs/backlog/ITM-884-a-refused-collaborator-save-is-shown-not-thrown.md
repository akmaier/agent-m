---
id: ITM-884
title: A collaborator's Save that is refused is shown on the page, not thrown
level: module
realises:
  - NO SECRET IN THE REPOSITORY
  - UC-042
modules:
  - MOD-settings-pages
builds_on:
  - ITM-868
tests:
  - unit
origin:
  - developer-sonnet-a's findings on ITM-868's pull request #844 (sprint team1/87)
---
# ITM-884 A collaborator's Save that is refused is shown on the page, not thrown

**REGISTER**

## Outcome

The settings page's Save handlers for collaborators call `saveFile` without catching what it throws:
`src/settings-pages/settings.mjs:979`, `:989` and `:1009`. A `SecretRefused` (MOD-artifact-edits.md:98) becomes an
unhandled rejection, and the person sees nothing. The recording's `write` and the workflow's *Install* catch it. This is
a lead from the code, confirmed by its red test.

## Acceptance

- A collaborator's Save that `saveFile` refuses shows the refusal in the handler's result, naming the file and never the
  secret, as the recording's `write` does. Tests check each handler, with counter-proofs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

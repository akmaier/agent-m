---
id: ITM-861
title: A derivation page without a token says how to store one
level: unit
realises:
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - ITM-852's pull request #816 (sprint team1/80), from developer-sonnet-d's finding 1
---
# ITM-861 A derivation page without a token says how to store one

**REGISTER**

## Outcome

`src/review-pages/jobs.mjs:308` (`showRequirementsDraft`) and `:538` (`showArchitectureDraft`) call `tokenStep(context)`.
`context` is not taken from `where` in either function. So without a token, both pages end in "context is not defined
Store a token" instead of their step to store one. `showDraft` does it right. It is so on the base, and no test covers
the text.

A test opens each page without a token and asserts the step `tokenStep` gives, as `showDraft` shows it. It fails first.
Then both functions take `context` from `where`.

## Acceptance

- Without a token, both derivation pages show the step to store a token, and the tests pin it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

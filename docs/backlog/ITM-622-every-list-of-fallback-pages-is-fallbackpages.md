---
id: ITM-622
title: Every list of fallback pages is fallbackPages
level: module
realises:
  - UC-018
  - UC-019
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
modules:
  - MOD-review-pages
builds_on:
  - ITM-612
tests:
  - unit
origin:
  - ITM-612's gate (docs/gates/20261016-2328-development-release-testing-f290.md)
---
# ITM-622 Every list of fallback pages is fallbackPages

**REGISTER**

## Outcome

Three parts of MOD-review-pages build their own list of GitHub's pages without a token, each with its own sentence:
- `src/review-pages/entry-edit.mjs:77`, an entry edited in place;
- `src/review-pages/file-drafts.mjs:39`, a draft of files saved;
- `src/review-pages/requirements-draft.mjs:81`, a draft of requirements saved.

`fallbackPages` (`src/review-pages/file-edit.mjs:47`) gives that list with each file's text and the warning of a file
that differs. Each of the three calls it instead (nothing twice).

**Not ready for a sprint yet.** Before its start, the tests of the three paths' fallback output are grepped and named.
Each path is also checked to be reached through the real host, as when the host cannot write.

## Acceptance

- Each of the three paths shows `fallbackPages`' list and sentence.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

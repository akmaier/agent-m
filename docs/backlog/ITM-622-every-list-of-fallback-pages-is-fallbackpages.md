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

**The readings, settled at sprint team1/59's start:**
- **The grep of every removed text** (sprint 58's agreement). A grep over `tests` and `src` for the two sentences that
  go:
  - "There is no token: GitHub's page opens for each file of the entry, and you commit them there." finds only
    `src/review-pages/entry-edit.mjs:77`;
  - "There is no token: GitHub's pages open for the proposal files." finds only
    `src/review-pages/requirements-draft.mjs:81`.

  No test asserts either. The known positive is `fallbackPages`' sentence, which the same grep finds in
  `tests/review-pages-fallback-wording.test.mjs:23`.
- `file-drafts.mjs:39` already says `fallbackPages`' sentence. Its own list goes, and it calls `fallbackPages` instead.
- **Reachable through the real host.** Each path's fallback comes from a host that cannot write:
  - `saveEntry`'s for `entry-edit`;
  - `proposeSection`'s for `requirements-draft`;
  - MOD-artifact-edits' for `file-drafts`.
- **Existing tests.** The three paths' tests count the pages and their links, which stay, so none changes.

## Acceptance

- Each of the three paths shows `fallbackPages`' list and sentence.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

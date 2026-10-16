---
id: ITM-612
title: The fallback pages speak of each file
level: module
realises:
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
modules:
  - MOD-review-pages
builds_on:
  - ITM-592
tests:
  - unit
origin:
  - ITM-592's gate (docs/gates/20261016-2309-development-release-testing-df68.md): the shared `fallbackPages` says "GitHub's page opens for the file", and a requirement's entry has two files
---
# ITM-612 The fallback pages speak of each file

**REGISTER**

## Outcome

`fallbackPages` (`src/review-pages/file-edit.mjs:47`) says "There is no token: GitHub's page opens for the file, and you
commit it there." Both the use-case path and, since ITM-592, the requirement path show it. A requirement's entry has
two files, the proposal and its rationale. The sentence speaks of each file, so that it fits both paths: "There is no
token: GitHub's page opens for each file, and you commit them there."

**Existing tests.** No test asserts the sentence. A grep of `tests/` for "GitHub's page opens for the file" finds none,
while the same grep finds the sentence in `src/review-pages/file-edit.mjs`.

## Acceptance

- Both paths show the sentence for each file. A test states it whole.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

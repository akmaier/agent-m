---
id: ITM-552
title: The account of the person who prompts is read in one place
level: module
realises:
  - THE PERSON WHO PROMPTS IS A SOURCE
modules:
  - MOD-source-register
  - MOD-trace-pages
  - MOD-review-pages
builds_on:
  - ITM-508
  - ITM-507
tests:
  - unit
origin:
  - ITM-508's gate (#600): `accountOf` in `src/trace-pages/subject.mjs` copies the private `accountOf` of `src/review-pages/requirements-prompt.mjs` line for line
  - architecture draft for akmaier: MOD-source-register provides personAccount
---
# ITM-552 The account of the person who prompts is read in one place

**REGISTER**

## Outcome

MOD-source-register's `personAccount(instance: Snapshot) -> string | null`, as the draft of its file states it: the
owner of the instance's repository on its server's host, `<server>/<owner>`, or `null`. The specification browser
(`src/trace-pages/subject.mjs`) and the review pages call it in place of their own `accountOf`, and both copies are
removed (AGENTS.md §2, "Nothing twice"). This includes the copy ITM-507 uses, should it still stand after ITM-551.

It waits for akmaier's acceptance of the draft, which adds `personAccount` to MOD-source-register's provides and to the
uses of MOD-trace-pages and MOD-review-pages.

No existing test's expected result changes: the account is the same.

## Acceptance

- **The function.** `personAccount` gives `github.com/<owner>` for a GitHub instance, `<host>/<owner>` for a GitLab one,
  and `null` without an owner.
- **No copy left.** `git grep "function accountOf"` in `src/` finds none, with a known positive shown before the change.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.

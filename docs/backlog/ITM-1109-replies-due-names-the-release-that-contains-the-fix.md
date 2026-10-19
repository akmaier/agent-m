---
id: ITM-1109
title: repliesDue names the release that contains what solved an issue
level: module
realises:
  - UC-039
  - CLOSING AN ISSUE PREPARES ITS REPLIES
modules:
  - MOD-mail-handling
builds_on:
  - ITM-953
tests:
  - unit
origin:
  - finding 4 of #1142 (ITM-969, developer-sonnet-i), on main at 740567ed
---
# ITM-1109 repliesDue names the release that contains what solved an issue

**REGISTER**

## Outcome

MOD-mail-handling's `Due` has `release: string | null` (MOD-mail-handling.md:99), and its Uses name
`MOD-repository-hosts.listTags` for "the release that contains it" (:150-151). `repliesDue` gives `release: null` always, so the
replies page says "Release: not known" on every issue. "Where known" (:127) means where a tag contains the commit, not never.

## Acceptance

- Unit tests naming MOD-mail-handling, over a fixture host:
  - an issue closed by a pull request whose merge commit the tag `v1.2.0` contains gives `release: "v1.2.0"`, the earliest
    such tag;
  - an issue whose fix no tag contains yet gives `null`.
- Counter-proof: `null` always fails the first case.
- The callers of `repliesDue` and the tests that pin `Due` are named and run (agreement 95).
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/mail-handling/` and its tests change.

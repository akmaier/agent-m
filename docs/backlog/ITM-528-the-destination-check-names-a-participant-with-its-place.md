---
id: ITM-528
title: The destination check names a participant with its place, and no test guards the withdrawn name
level: system
realises:
  - THE PAGE NAMES WHERE IT SENDS
modules:
  - MOD-review-pages
builds_on:
tests:
  - system
origin:
  - ITM-519, as cut in Sprint 39's start decision
---
# ITM-528 The destination check names a participant with its place, and no test guards the withdrawn name

**REGISTER**

## Outcome

`tests/test_destination_disclosure.py`, the check SPEC.md names for `THE PAGE NAMES WHERE IT SENDS`, covers only the
GitHub token's destination. It does not check that, before a run, the page names each destination — a participant with
its processing place — and it shows no counter-proof of a participant shown without its place. The test headers that
still guard the withdrawn `THE PAGE STATES WHAT IT SENDS WHERE` name the requirement that replaced it.

The conversation's part of the check — "before a message of a conversation is sent" — needs the prompt bar and is written
with ITM-513.

## Acceptance

- The check shows, for a run on the review pages, each destination named with its processing place before anything is
  sent; a counter-proof of a participant shown without its place fails.
- No test header guards `THE PAGE STATES WHAT IT SENDS WHERE`.
- Only test files change; they are written by a Developer who implemented none of the run panel's behaviour.

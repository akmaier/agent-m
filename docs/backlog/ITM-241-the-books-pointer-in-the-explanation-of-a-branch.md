---
id: ITM-241
title: The book's pointer in the explanation of a branch
level: module
realises:
  - UC-002
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
  - ITM-221
tests:
  - unit
origin:
  - UC-002
---
# ITM-241 The book's pointer in the explanation of a branch

**REGISTER**

## Outcome

MOD-site-frame's `explanations.md`, in `src/site-frame/`: the topic `branch-of-its-own` points to the book, as UC-002 asks
of every choice (F7 of ITM-223). The chapter is taken from the book as the instance's source register holds it
(`docs/sources/SRC-vibe-coding/2026-10-05/`), never from memory. Where the book explains no such branch, the topic points
to the chapter closest to it, and the pull request names that reading.

## Acceptance

- A unit test that names MOD-site-frame states, before the change, that each UC-002 topic of `explanations.md` points to
  a chapter of the book.
- The first commit holds only this test, and CI is red on it; its counter-proof is recorded in the pull request.
- ITM-223's test of F7 passes; its file does not change in this item, and the release tester removes its todo mark.
- The existing tests stay green, with no expected result changed.
- Only `src/site-frame/` and the new test that names MOD-site-frame change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

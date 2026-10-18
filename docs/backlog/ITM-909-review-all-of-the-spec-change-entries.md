---
id: ITM-909
title: Review all of the SPEC change entries
level: module
realises:
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
  - UC-006
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - ITM-880's measurement (docs/measurements/2026-10-18_page-loads-once-per-commit.md §6), checked by po-opus-b at #869's gate
---
# ITM-909 Review all of the SPEC change entries

**REGISTER**

## Outcome

MOD-review-pages gives every kind a route `<k>/all`, *Review all*: every open or changed file of the kind in sequence,
and *Accept all N shown* in one commit (MOD-review-pages.md:195-198). SPEC change entries are one of its kinds
(MOD-review-pages.md:101-102). The live app serves no such page for them.

**The path, on `main` at `84ecaf8c`.**
- `src/review-pages/spec-entries.mjs:67`: the service of SPEC change entries, `queueService`, has `reviewAll: false`.
- `src/review-pages/flow.mjs:157`: `params.id === "all"` reaches `showAll` only where `service.reviewAll` is true.
  For SPEC change entries, `:158` reads `all` as an entry's identifier instead.
- `flow.mjs:212` draws the *Review all* link only where `service.reviewAll` is true, so the SPEC changes list has none.
- Actual, through `tests/app-harness.mjs` with every text file of `84ecaf8c` and a token: `#spec-entry/id=all` shows
  "No SPEC change entry all on the default branch." Expected: the open entries in sequence, each as its proposal against
  the section that holds now, with *Accept all N shown*.
- The known positive: `#use-case/id=all` on the same commit shows "Review all — Use cases".

Accepting several entries in one commit is MOD-spec-changes' `acceptEntries(host, shown, …)` (MOD-spec-changes.md:180),
which `queueService.accept` already calls with the entries shown (`spec-entries.mjs:116-122`).

## Acceptance

- A unit test naming MOD-review-pages: over a fixture with two open entries in two queues and one decided entry,
  `spec-entry/all` shows both open entries and not the decided one. *Accept all 2 shown* calls `acceptEntries` once with
  both. An entry whose proposal changed after it was shown is left out and named.
- The SPEC changes list links *Review all* with the number of open entries. With none open, it shows the same "Nothing
  to review" page the other kinds show.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

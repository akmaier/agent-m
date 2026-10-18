---
id: ITM-910
title: The release test reports are a kind of the review pages, with Review all
level: module
realises:
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
  - UC-030
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - ITM-880's measurement (docs/measurements/2026-10-18_page-loads-once-per-commit.md §6), checked by po-opus-b at #869's gate
---
# ITM-910 The release test reports are a kind of the review pages, with Review all

**REGISTER**

## Outcome

MOD-review-pages names five kinds: use cases, architecture decisions, module files, SPEC change entries and release
test reports (MOD-review-pages.md:101-102). It serves "the acceptance of an open release test report of UC-030"
(:105-106). Its routes, among them `<k>/<id>` with `release-v<version>` for a release test report and `<k>/all`, hold
for each kind (:173-198).

**The path, on `main` at `84ecaf8c`.**
- `src/review-pages/kinds.mjs` declares routes for `use-case`, `decision`, `module`, `spec-entry` and `requirement`.
  It declares none for release test reports.
- Actual, through `tests/app-harness.mjs` with every text file of `84ecaf8c` and a token: `#release-report/id=all`
  shows the use case list ("Use cases Review all 0 not accepted"). Expected: the open release test reports with
  *Accept all N shown*.
- The known positive: `#use-case/id=all` on the same commit shows "Review all — Use cases".

The start names each input with the accepted interface that gives it, called on a real case (agreements 82 and 86):
- the reports and their status: MOD-approvals' `statusOf`/`statuses` and the kind `release-report` of `approvalSchema`;
- where a report lies: MOD-release-evidence.

This repository holds no release test report yet. So, as for ITM-887, the tests use a fixture.

## Acceptance

- A unit test naming MOD-review-pages, over a fixture with one open and one accepted release test report:
  - `release-report` lists both with their status;
  - `release-report/release-v<version>` shows the open one with *Accept*;
  - `release-report/all` shows only the open one, with *Accept all 1 shown*, which writes one record of kind
    `release-report` naming its blob.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

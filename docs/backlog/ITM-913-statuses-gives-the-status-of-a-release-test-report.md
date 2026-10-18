---
id: ITM-913
title: statuses gives the status of a release test report
level: unit
realises:
  - STATUS IS DERIVED FROM THE RECORDS
  - UC-030
modules:
  - MOD-approvals
builds_on:
tests:
  - unit
origin:
  - po-opus-b's start decision of sprint team2/91, checking ITM-910's inputs (agreements 82 and 86)
---
# ITM-913 statuses gives the status of a release test report

**REGISTER**

## Outcome

MOD-approvals' accepted text counts a release test report among the reviewed files:
- its Responsibility names "use case, architecture decision, module file, SPEC change entry, release test report"
  (`docs/architecture/MOD-approvals.md:42`);
- its Files read "every reviewed file", `docs/tests/releases/v*.md` among them (`:155-156`);
- `statuses` gives "the status of every reviewed file of a snapshot" (`:108-109`).

**The path, on `main` at `5a86fdf1`.**
- `statuses(snapshot)` (`src/approvals/status.mjs:64`) calls `reviewedFile(path)` for each path (`:74`).
- `reviewedFile` (`:34-47`) knows only UC, ARC and MOD (`RECORD_KIND`, `:28`). For `docs/tests/releases/v2026.1.0.md` it
  gives `null`, so `statuses` skips the report (`:75`).
- `statusOf` (`:103-104`) calls `reviewedFile(path) ?? releaseReport(path)`. `releaseReport` (`:87-90`) gives the
  identifier `release-v<version>` and the kind `release-report`. The comment at `:86` says "Only statusOf reads it".
- A probe on `1f0e1ef0`, with a snapshot of one report, one use case and a record of each that names its blob:
  - `statuses` gives `{"id":"UC-001","kind":"use-case","status":"accepted"}` for the use case, and nothing for the report.
  - `statusOf` gives `accepted` for both. Without the records it gives `open` for both. This is the known positive: a
    report's status is derivable from the same records.

Expected: `statuses` gives the report with `{ id: "release-v<version>", kind: "release-report", status }`, as `statusOf`
does. Each caller reads `statuses` by kind or by identifier. A caller that wants only some kinds keeps filtering by
kind, as `src/progress-measures/stages.mjs:23, :200` does.

## Acceptance

- A unit test naming MOD-approvals, over a snapshot with a release test report and a use case:
  - `statuses` gives the report with the identifier `release-v<version>`, the kind `release-report` and the status
    `open`, then `accepted` once a record names its blob, then `changed` once the report's blob differs;
  - each status equals `statusOf` for the same path and blob.
  - Counter-proof: with `statuses` calling `reviewedFile` alone, the test fails.
- A path under `docs/tests/releases/` that is no `v<YYYY.MINOR.PATCH>.md` is not listed.
- The existing tests stay green, with no expected result changed. Every caller of `statuses` under `src/` gives the same
  result on this repository's files, which hold no release test report.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/approvals/` and the tests that name MOD-approvals change.

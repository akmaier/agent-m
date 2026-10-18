---
id: ITM-887
title: statusOf gives the status of one reviewed file
level: module
realises:
  - STATUS IS DERIVED FROM THE RECORDS
  - UC-030
modules:
  - MOD-approvals
builds_on:
tests:
  - unit
origin:
  - po-opus-b's settling of ITM-756's third question at sprint team2/89's start, 2026-10-18
---
# ITM-887 statusOf gives the status of one reviewed file

**REGISTER**

## Outcome

MOD-approvals' `statusOf(path, blob, snapshot)` (MOD-approvals.md:104-107), accepted and not built
(`src/approvals/index.mjs:7`: "statusOf is not built yet"): the status of one reviewed file — `open`, `accepted` or
`changed` — from the records in the same snapshot, matched by the identifier in the file name, so a renamed file keeps
its status; a record whose `kind` does not fit the file's folder is not counted; `NotReviewed` for a path that is no
reviewed file. It covers every kind of the record, `release-report` among them, whose report ITM-756 asks about.

## Acceptance

- With fixture snapshots: a file with no record `open`; a record naming its blob `accepted`; a record naming an earlier
  blob `changed`; a renamed file keeping its status; a record of another kind not counted; a release test report
  `docs/tests/releases/v<version>.md` with its `release-v<version>` record `accepted`; `NotReviewed` for a path that is
  no reviewed file. Expected values literal.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/approvals/` and the tests that name MOD-approvals change.

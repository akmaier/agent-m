---
id: ITM-757
title: The audit document of a release
level: module
realises:
  - UC-030
  - THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
  - ARTIFACTS ARE MARKDOWN
  - THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
modules:
  - MOD-release-evidence
builds_on:
  - ITM-756
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-757 The audit document of a release

**REGISTER**

## Outcome

MOD-release-evidence's `auditDocument(audit, release)`, as its file states it under Data (the audit document). It is
one Markdown document with:
- the tag and its commit SHA;
- the summary;
- every row;
- the source versions with their hashes;
- the blob SHAs of the report and of the approval records.

Anyone with the repository can check each statement without Agent M (UC-030 step 5).

## Acceptance

- From a fixture audit, the document holds each named part and every row, including a row with *no test*.
- It holds no address of Agent M's dashboard as the only way to check a statement.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/release-evidence/` and the tests that name MOD-release-evidence change.

## Read at sprint team2/94's start decision (po-opus-b)

The draft `b67e1631` is accepted: MOD-release-evidence's approval record `8654bba2ce96` names its blob (`234d3b66`).
`auditRows` now takes `accepted: { person, date } | null` as its last argument and returns `evidence`, "read from `head`:
the report `docs/tests/releases/v<version>.md` with its blob; every approval record that names it ... and the acceptance"
(MOD-release-evidence.md:151-157, blob `8654bba2`). `auditDocument` takes the audit with its `evidence`
(MOD-release-evidence.md:158). So this item also builds `evidence` and the new argument of `auditRows`, whose callers are
`src/release-evidence/index.mjs` and two tests. Its Acceptance adds: the document holds the acceptance (who, when, the
blob SHA) and the blob SHAs of the report and of its approval records, from a fixture `head`.

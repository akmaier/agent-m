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

---
id: ITM-770
title: The audit is exported, and committed on a click
level: module
realises:
  - UC-030
  - ARTIFACTS ARE MARKDOWN
  - THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - ONE CLICK PER DECISION
modules:
  - MOD-trace-pages
builds_on:
  - ITM-768
  - ITM-757
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-770 The audit is exported, and committed on a click

**REGISTER**

## Outcome

The extras of the `audit` view (UC-030 step 5, 5a), in `export.mjs`:
- **Export** saves `auditDocument`'s text in the browser.
- **Commit export**, for a person with write access, commits it to `docs/audits/<tag>.md` through MOD-artifact-edits'
  `saveFile`, as the person's own input.

Nothing else is written.

## Acceptance

- With a fake browser download, one click saves exactly `auditDocument`'s text.
- With a fake host, *Commit export* makes one commit of that file. It is not offered without write access.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.

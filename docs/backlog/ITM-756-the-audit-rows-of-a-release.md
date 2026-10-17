---
id: ITM-756
title: The audit rows of a release
level: module
realises:
  - UC-030
  - THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A SOURCE DECLARES ITS AUTHORITY
  - A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
  - THE TRACEABILITY MATRIX IS DERIVED
modules:
  - MOD-release-evidence
builds_on:
  - ITM-254
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-756 The audit rows of a release

**REGISTER**

## Outcome

MOD-release-evidence's `auditRows(at, results, release, gates, instanceSpec)`, in `audit.mjs`, as its file states it.
`src/release-evidence/index.mjs` says the audit is UC-030's and is not built.

It gives one row per requirement valid at the release (UC-030 step 2). Each row holds:
- what the requirement constrains;
- its sources with authority, version and hashes;
- its tests by level, with outcome or rate and counter-proof;
- for a process requirement, the gate records it is given.

The summary (step 3) counts:
- passing requirements, requirements without a test, with a test that did not pass, with a flaky test, and with a worse
  rate;
- release tests written by the implementer;
- whether the report is accepted, and its limitations.

It also handles:
- **2a** an unaccepted report;
- **2b** the limitations of an accepted one;
- **2c** a requirement with no test, which is counted;
- **1a** a release before Agent M's records, which says what cannot be derived.

## Acceptance

- On a fixture repository at a tag, with its `test-results` branch, approval records and source register, the tests
  state each part above.
- A requirement without a test has a row and is counted.
- A release test whose author is the implementer by the job ledger is counted.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/release-evidence/` and the tests that name MOD-release-evidence change.

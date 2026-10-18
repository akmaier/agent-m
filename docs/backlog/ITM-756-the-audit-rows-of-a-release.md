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
  - ITM-887
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

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (b) for two questions, (a) for the third

Sprint 86's three questions for akmaier (`docs/backlog/sprints/team2/86.md:144-151`):

1. **Which snapshot holds the release report and its approval record: (b).** `acceptAndRelease` commits them on the
   default branch, then tags the candidate's commit (`src/release-evidence/report.mjs:393-399`), as SPEC.md:1544-1546
   asks ("sets the release tag on the tested commit"). The tagged snapshot never holds them, so MOD-release-evidence.md
   :155 ("Reads the product at the tagged commit — …, the report, the approval records —") cannot hold, and `statusOf`
   needs the report and its records in one snapshot (MOD-approvals.md:104-106). UC-030's precondition asks only that the
   report "is in the product repository" (UC-030:50-51). The module already reads the default branch's
   `docs/tests/releases/` for `reportsAwaitingAcceptance` (MOD-release-evidence.md:158).
2. **The source register as a parameter: (b).** `linkedVersion(links, register: Document[], source)`
   (MOD-source-register.md:155) needs the instance's register, which the signature does not pass. The form has a known
   positive: `acceptEntries(…, sources: { links, register })` (MOD-spec-changes.md:180-181).
3. **`statusOf` first: (a).** It is accepted text (MOD-approvals.md:104), and not built (`src/approvals/index.mjs:7`).
   That is an order of the backlog: an item builds it, and this item builds on it. ITM-887 is that item.

**The draft**, committed as `c2f0a91e`: `auditRows(at, results, head: Snapshot, release, gates, instanceSpec, register:
Document[])`, `head` the default branch, which holds the report and its approval record that `acceptAndRelease` commits
after the tagged commit; `register` the instance's source register; the Files line reads the report and its record on
the default branch. Principles: *one responsibility* — the caller reads, as it reads `gates` and `instanceSpec`;
*nothing twice* — `statusOf`'s one-snapshot rule and `linkedVersion`'s `register`, as they stand.

The item builds on the acceptance of that draft and on ITM-887. While team 1's sprint 87 runs, MOD-release-evidence is
used by MOD-review-pages and MOD-trace-pages, so the item is held.

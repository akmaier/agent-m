---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - cd7029d6fbb5dba175825b44671f31955a490cf1
  - https://github.com/akmaier/agent-m/pull/835
date: 2026-10-18 01:51 UTC
---
# Development → Release testing: ITM-756, the audit rows of a release

**REGISTER**

## Reason

ITM-756 (MOD-release-evidence, `auditRows`), pull request #835 into `sprint/team2/86`, is rejected because it is not
buildable as specified (agreement 79). This fails check 5 for a real release. The decision is taken on the module
file's text at blob `dbd34f3c7bf0`.

**Acceptance and limitations need input that `at` cannot give.** The module file gives `at` as "the product at the
release's commit". But `acceptAndRelease` (`src/release-evidence/report.mjs`) does two separate things:
- it commits the report and its approval record on the default branch;
- it tags the candidate's own commit, which is an earlier one.

So at the tagged commit, neither the report nor its record is in the tree. The signature has no other snapshot that
holds them. The fixture puts both into `at`, so the tests pass on a state that no release leaves behind.

This was replayed on the head with the test's own fixture:
- **The fixture as committed:** `accepted: true`, with the two limitations.
- **The same fixture without the report and record in `at`, as a real release leaves it:** `accepted: false` and
  `limitations: []`, with no statement of what cannot be derived.

So a release accepted with limitations would show as unaccepted.

**Whether the report is accepted.** The map of sprint 86 names MOD-approvals' `statusOf` for this. `statusOf` is not
built (`src/approvals/index.mjs:7`). The known positive in that map exercised `acceptShown`, which is the start
decision's error. The pull request matches the record's name against the report's blob itself. That reproduces
`statusOf`, so the input is derived another way. Reading the record's limitations through `approvalSchema` is
accepted.

**The instance's source register.** The module file's Files say the source register is the instance's. The signature
passes only `instanceSpec`. The pull request reads `docs/sources/SRC-*.md` from the product's `at` instead, which is
also derived another way.

The job records are the product's own (`docs/jobs/`), and `listJobs` reads them from `at`. Taking the job records from
`at` is a reading the text allows.

**The questions for akmaier:**
1. From which snapshot does `auditRows` read the release test report and its approval record? The tagged commit
   cannot hold them.
2. Does the instance's source register come in as a parameter?
3. Is `statusOf`, for a report of kind `release-report`, built first?

**The other checks hold:**
1. The first commit, `6127f098`, holds only `tests/release-evidence-audit.test.mjs`. CI run 39087431766 is red on it
   (node (1)): `auditRows` is not exported, and there is no stub.

   **The force-push.** The implementation commits were replaced once (`4ec30ca2`, which added 300 files including
   `src/bridge-build/node_modules/`, then `2db89a15`). CI was red on both, not green as the pull request says. The
   tests-only commit and its red run are unchanged, so the red-then-code history can still be read.
2. Run 39087725685 passed all twelve jobs on `cd7029d6`.
3. The changed files are all in `src/release-evidence/` or are the new test:
   - `audit.mjs` (new);
   - `index.mjs` (the export and its header);
   - `report.mjs` (`lastReleaseCommit` exported, one word, inside the module);
   - the new test, whose header names MOD-release-evidence.
4. TST-756001 to 756009 name the requirements they guard and the module. Four counter-proofs were replayed in a
   checkout of the head, and each made its test fail:
   - 756006: a row with no test skipped;
   - 756007: any writer counted as the implementer;
   - 756008: the limitations dropped;
   - 756009: 1a never detected.

**Agreement 83.** The Bridge packages were installed as CI does. Then these tests pass on the head:
- release-evidence (20), -293 (2), -293-release (2) and -audit (9);
- release- and system-uc-013 (2, 8);
- release- and system-uc-047 (1, 1);
- release-itm-289 (1);
- release-sprint-07-uc-047 (10);
- the traceability release test, release-sprint-02-d (8).

**Readings not decided here.** Encoding 1a and 2a into `summary.limitations` and the outcome strings is not
decided here. The result type has no place for 1a or 2a, or for who accepted the report and when. That goes with
question 1.

---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 0b7990df3150198887308df9dc812210aff5b1ad
  - https://github.com/akmaier/agent-m/pull/876
date: 2026-10-18 10:04 UTC
---
# Development → Release testing: ITM-756, The audit rows of a release

**REGISTER**

## Reason

ITM-756 (MOD-release-evidence, `auditRows`). Its pull request #876 into `sprint/team2/90` passes on `0b7990df`.
- The first commit `de409784` holds only `tests/release-evidence-audit.test.mjs`. CI run 39116804751 is red on it: the
  import of `auditRows` fails, and there is no stub.
- CI run 39116925444 is green on the head. Its merge line is `0b7990df` into `e331456f`. The sprint head has since moved to
  `ca0d42dc` (#877, #879: `src/product-process/`, `src/review-pages/`). The merge with `ca0d42dc` is clean, and I ran the
  set below on it too.
- Changed: `src/release-evidence/audit.mjs` (new), `index.mjs` (the export), `report.mjs` (`lastReleaseCommit` exported),
  and the new test, whose header names `Module: MOD-release-evidence` and `Level: unit`. All are in scope.
  `lastReleaseCommit` is imported only by `audit.mjs`. `index.mjs` does not export it, so it stays between the module's
  Parts.
- Agreement 83, with LC_ALL=C after the install. The 162 test files whose imports reach a changed file, and
  `tests/release-sprint-02-d-traceability.test.mjs`, with no file that only reads one:
  - on the head: 1,787 tests, 1,783 pass, 0 fail, 4 todo;
  - on the merge with `ca0d42dc`: 1,794 tests, 1,790 pass, 0 fail, 4 todo.
- Counter-proofs replayed, each planted in `audit.mjs`:
  - acceptance read from `at` fails TST-756010, 756008 and 756005;
  - 1a never detected fails TST-756009;
  - any writer counted as the implementer fails TST-756007 and 756005;
  - the counter-proof always null fails TST-756003.
  The baseline passes 11 of 11.

The developer's gaps, settled by the texts:
1. Job records read from `at` follow the Files line, "Reads the product at the tagged commit". The Uses already name
   `listJobs` for implementer against writer. The code goes beyond the text, so `113ab1dc` drafts the Files line and the
   implementer rule for akmaier.
2. The accepted result type has `accepted` and `limitations` and no other place. 2a as `accepted: false` is the type's
   own meaning. 1a in `summary.limitations` is drafted in `113ab1dc`. Who and when accepted (UC-030 step 2) is in no field
   of the accepted type, and the item's Outcome does not ask for it. It is not a defect of this item.
3. Not a defect. `auditRows` counts "a requirement without a test" (MOD-release-evidence.md:141-142), and only the
   product's graph is named (`traceGraph`, Files "the tests" at the tagged commit). No accepted sentence exempts a process
   requirement.
4. A defect, against MOD-approvals' accepted Data: `limitation` is "one line per failing test or worse rate". The probe
   is on `0b7990df`. MOD-documents writes the list on one line, and refuses a reason with a comma at write. So such a
   reason is never written, and `acceptAndRelease` fails. Registered as ITM-911 (MOD-documents).

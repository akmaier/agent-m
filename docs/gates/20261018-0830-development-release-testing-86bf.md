---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - a104afa293a6e936fa39cd43983f83891e0dbdba
  - https://github.com/akmaier/agent-m/pull/865
date: 2026-10-18 08:30 UTC
---
# Development → Release testing: ITM-890, a proposed case names the paid service it calls

**REGISTER**

## Reason

ITM-890, pull request #865 into `sprint/team2/89`, at head `a104afa2`.

- **The texts are accepted.** I ran MOD-approvals' `statuses` on `origin/main` at `740aa6a5`.
  - UC-026 is *accepted* (`ab2f060f`), and so is MOD-job-catalogue (`a406cf6b`). This is the known positive.
  - MOD-test-document is *changed*: the draft `c2f0a91e` changed it. But its accepted text `a17a85a9`, named by
    `docs/approvals/MOD-test-document-a17a85a9b29e.md`, already holds the row the item cites: "`paid` | the name of a
    paid service it calls, if any | when it calls one". The draft adds only `title`. So the item does not rest on an
    unaccepted draft, and agreement 79 does not apply.
- **The prompt sentence comes from accepted lines.** It reads: "A case that really calls a paid service names the
  service in `paid`; a case that does not leaves `paid` out." It follows that MOD-test-document row and UC-026 step 5,
  "if it also needs the real call".
- **Red first.** The tests-only commit `411d94e4` was red in run 39110726706, on all three tests:
  - TST-890001 and TST-890003 failed on the missing behaviour.
  - TST-890002 failed on its known-positive line, because the expected text lacked the runner's "the answer." prefix.
  - Only the green commit corrected that text. I put the corrected test on the base code (`dccd7cc3`), and TST-890002
    then fails at `:57`: "actual: 'passed'" against `unusable`. So the red holds, and the Acceptance holds.
- **CI.** Run 39111196726 passed on attempt 2. Attempt 1 failed in node (6), in
  `tests/desktop-shell-endpoint-composition.test.mjs`, with "ssh2 staging failed". That test installs ssh2 from the
  registry and ignores the staged copy. It is a flaky test outside this item, so I registered ITM-902 for it.
- **Merge.** `git merge-tree` with the sprint head `99d95c97` merges cleanly.
- **Scope.** Three files changed:
  - `answer.schema.json` and `prompt.md`, both in `src/job-catalogue/kinds/propose-tests/`;
  - the new `tests/job-catalogue-propose-tests.test.mjs`, whose header names MOD-job-catalogue.

**Replayed on the head with LC_ALL=C**, after the bridge-build install:
- **Release tests.** I ran 23 files: the 20 release tests whose imports reach `src/job-catalogue/`, release-uc-011, the
  traceability release test and the new test.
- **Result.** 132 tests passed and 1 failed.
  - The failure is TST-320321902. It compares `/var/…` with macOS's `/private/var/…` realpath.
  - It fails the same way on the base `dccd7cc3`, so it is not this item.
- **Counter-proofs.** Each of these failed as expected:
  - `paid` typed as a number: TST-890001 and TST-890002 fail.
  - `paid` removed: TST-890001 and TST-890002 fail.
  - `paid` required: TST-890001 and TST-890002 fail.
  - The key in the prompt renamed: TST-890003 fails.

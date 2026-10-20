---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1c206bbec40d1127da050238fe36ae8b66ca198b
  - https://github.com/akmaier/agent-m/pull/1261
date: 2026-10-20 23:17 UTC
---
# Development → Release testing: ITM-649, a guards entry names a requirement or a use case, nothing else

**REGISTER**

## Reason

Pull request #1261 into `sprint/team1/102` passes on `1c206bbe`. CI is green (run 39513587288). The rejection on
`68e6f216` (`docs/gates/20261020-2306-development-release-testing-1261.md`) is answered.

1. **The way back was taken.**
   - `818c495f` (developer-sonnet-d) changes only `expect:` lines of the system tests of UC-017, 038, 039, 040 and 049.
     The flows they walk stand there, and no `guards` entry carries a step.
   - `1c206bbe` (developer-sonnet-b, who built none of ITM-649) changes only TST-1041101. It now reads each case's
     comment block beside its `guards`. Its expected values are unchanged.
2. **The replay**, in a clean worktree at `1c206bbe`, with a private `TMPDIR`:
   - **All 72 release-test files:** 435 pass, 0 fail, 9 `todo`, as at the base `83ee5208`. The five earlier failures
     pass. sonnet-b's two local failures, TST-290115 and TST-320321902, do not occur here.
   - **The module's tests:** `tests/test-document-*.test.mjs`, 27 of 27 pass.
   - **The counter-proof:** with `src/test-document/` checked out at `83ee5208`, they fail 4 of 27.
3. **The earlier commits** stand as recorded at the rejection. The tests-only `0bec84c4` is red: job 118929571558,
   "# fail 4", "# cancelled 0".
4. **The merge.** `git merge-tree` with `sprint/team1/102` at `394d4940` is clean.
5. **sonnet-b's finding beside the gate: a new item, ITM-1169.** The reader follows MOD-test-document's text: "each
   following line is `key: value`", and "a declaration ends at the first line that is not a comment line of this
   form". So a wrapped field is the header's fault, not the reader's.
   - On `1c206bbe`, 78 of 4838 declarations in `tests/` are read with `given`, `input` or `expect` missing, in 44 files.
     TST-1041015 is one of them, read with `input` and `expect` as `null`.
   - That is not ITM-649's concern, which is the `guards` entries. ITM-1169 writes each field on one line.

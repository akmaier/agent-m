---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d363d8eb94c54cc80169eaa491934fe9aa625a73
  - https://github.com/akmaier/agent-m/pull/732
date: 2026-10-17 13:46 UTC
---
# Development → Release testing: ITM-677, the queues are read in batches

**REGISTER**

## Reason

ITM-677, pull request #732 into `sprint/team1/73`, at head `d363d8eb`. This is the rework after the rejection on
`01bca866` (`docs/gates/20261017-1335-development-release-testing-e0f5.md`). It is mergeable, and run 39037743427
passed every check.

**The lead is measured, and it held.** The tests-only commit `7350271a` adds TST-677005 in
`tests/spec-changes-accept-batched.test.mjs`. It accepts entries of two queues that name `SPEC.md`, with a token. Run
39037529669 failed exactly that test: `SPEC.md` was asked for twice, against once expected. The commit itself was made,
which is the test's known positive.

**The fix stays in MOD-spec-changes,** and MOD-repository-hosts is unchanged.
- `queuesAt(snapshot, bases)` makes one read-ahead in two rounds for all the queues.
- `queueAt` is `queuesAt` of one base.
- `acceptEntries` calls `queuesAt` in place of `Promise.all` over `queueAt`.
- **No new interface.** `src/spec-changes/index.mjs:8` still exports only `queues` from `queues.mjs`, and MOD-spec-changes'
  file names neither `queueAt` nor `queuesAt`. `queuesAt` is used inside the module only (`accept.mjs:47` and `:204`).

**Concurrent callers.** The developer checked every caller of `queues` and `queueAt`. `acceptEntries` was the only
`Promise.all`; every other caller reads one after another on one snapshot. Two views calling `queues` at once on one
shared snapshot cannot be told from the code, and no route here does it.

**The counter-proof** is TST-677005's red against the code before the fix. The counts per click are unchanged from the
first round: with a token, 112/115/118 → 2/5/8. The node suite fails no test only on the head, and the four affected
suites pass 151 of 151. ITM-018 passes.

**The reading.** For the rework, the developer read in full the rejection's record and the updated item, and read the
three files it changed in part. The first round's full reading stands. Its gate asked for one test and one fix in
named functions, and the parts read cover them.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9cdf37941edfa8500354158faa040b4066437ceb
  - https://github.com/akmaier/agent-m/pull/754
date: 2026-10-17 19:31 UTC
---
# Development → Release testing: ITM-718, a last accepted text is the blob its record names

**REGISTER**

## Reason

ITM-718, pull request #754 into `sprint/team1/75`, at head `9cdf3794`. It is mergeable, and run 39062541262 is green. It
changes `src/approvals/status.mjs` and `tests/approvals-last-accepted.test.mjs`.

**The lead was a fault, and it is shown.**
- `status.mjs:111` compared the tree's blob with the record's.
- `:114` then returned the text read, without hashing it.
- TST-718001 plants a host whose tree names V2's blob and whose read gives V3. On the base, V3 is returned as the last
  accepted text.
- The tests-only commit `c87920a0` was red in run 39062160986 on exactly TST-718001, and TST-718002 passed. The code was
  pushed after that run had ended.

**The fix.**
- The text that was read is hashed with `MOD-text-tools.blobSha`, which is in MOD-approvals' Uses.
- A text of another blob throws `NotFound` naming the file. That is one of `lastAcceptedText`'s listed failures, and the
  caller shows it as a problem line (`src/review-pages/flow.mjs:243`, `:355`).
- This follows `A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT` read with `AN APPROVAL NAMES THE EXACT TEXT`. The
  text a record names is the text whose blob is the record's. That reading is accepted.

**No cost and no regression.**
- The requests are identical on the base and the head: 9, 13 and 27 for UC-013, UC-006 and UC-042, that is 2R+7.
- TST-718002 pins the count for UC-010.
- All 573 blobs that this repository's records name hash to themselves, so an honest host never meets the check.
- 482 tests of the affected modules: 477 pass and 1 fails on the base, and 478 pass on the head. No release result
  changed, and ITM-018 passes.
- Both counter-proofs are caught.

**Findings.**
- `readHistory`'s `changes: false` is not built (`github.mjs:214`, `gitlab.mjs:174`), so each record costs a request for
  its commit's changes. That is ITM-652, and a note there says `lastAcceptedText` then passes `changes: false`.
- `HostError` is imported past MOD-approvals' named Uses (`status.mjs:18`, before this item). This is ITM-816, a draft for
  akmaier.

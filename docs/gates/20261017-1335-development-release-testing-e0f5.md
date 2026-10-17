---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 01bca866a34dd3029a623c42623f1ff0ad18f3c0
  - https://github.com/akmaier/agent-m/pull/732
date: 2026-10-17 13:35 UTC
---
# Development → Release testing: ITM-677, the queues are read in batches

**REGISTER**

## Reason

ITM-677, pull request #732 into `sprint/team1/73`, at head `01bca866`. It is mergeable, and run 39036532818 passed every
check.

**What holds.**
- **Red first.** The tests-only commit `f6a69738` was red in run 39036364025, with 7 failures: TST-479101 to 479104,
  TST-677001 and 677004, and TST-611011's whole click. These are exactly the new and changed tests.
- **The change.** `queues` and `queueAt` read ahead through `Snapshot.readMany`. Without a token, nothing changes.
- **Requests with a token, at this repository's size:** `queues()` 112 → 2, the SPEC entries list 115 → 5, an entry
  page 118 → 8.
- **Counter-proofs:** F1 and F2 are each caught. The notifications' "each notified" case, TST-418106, TST-479201 to
  479203 and TST-521201 pass unchanged. ITM-018 passes.

**Readings.**
- **Two rounds are accepted** for "reads them first through `Snapshot.readMany`": the targets are known only once the
  indexes are read. This is sprint 72's two-wave reading.
- **TST-611011 is in scope.** `tests/spec-changes-fallback-requests.test.mjs` names MOD-spec-changes. Its fake batch
  answered with an empty repository, which hid the batch. It was corrected in the tests-only commit and was red there
  (sprint 56's agreement).
- **TST-479101 to 479104's new counts** are named in the item's outcome. ITM-680 leaves that file to this item
  (`73.md`).
- **`tests/spec-changes-queues-batched.test.mjs` names MOD-repository-hosts as well.** ITM-677 changes no code of it, so
  MOD-repository-hosts joins ITM-677's modules for that test only. Team 2's ITM-653 uses its code, which is unchanged.

**What is missing: the developer's own lead, which this item's change opens, is not measured** (sprint 62's agreement).
- `src/spec-changes/accept.mjs:203` calls `queueAt` for each folder at once (`Promise.all`), and each call now reads
  ahead with `readMany`.
- In `src/repository-hosts/index.mjs:213-228`, `readMany` skips a blob only once `texts` holds it, and `texts` is set
  only when a batch returns. `read` (:229-235) keeps a request in flight, so on the base two concurrent reads of
  `SPEC.md` are one request.
- So by the code, an acceptance of entries from two queues may now fetch `SPEC.md`, and any target the queues share,
  once per queue. `A PAGE LOAD READS THE REPOSITORY IN BATCHES` asks that "a file whose blob the page has read already
  is not read again".
- This is read from the code, not run. A committed test decides it.

## What the rework does

1. A committed test accepts entries of two queues that share `SPEC.md`, with a token, and asserts that every blob is
   read once. If it fails on this head, it is the rework's red.
2. If it is red, the fix stays in MOD-spec-changes. For example, `acceptEntries` gathers every folder's paths into one
   read-ahead before its `queueAt` calls. MOD-repository-hosts is not changed, since Team 2's ITM-653 uses it.
3. Every other caller that runs `queues` or `queueAt` concurrently is checked the same way and named.

## Findings, registered in this commit

- ITM-712: the fakes of the batch request answer as GitHub does.
- `tests/uc-006-batched-reads-harness.mjs` has no `Module:` line. MOD-review-pages' Parts name it, so ITM-680 moves it,
  as `73.md` now says.

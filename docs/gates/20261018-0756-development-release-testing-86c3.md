---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 85c7e807f2717b33c25908f8254f4e6874dfe33c
  - https://github.com/akmaier/agent-m/pull/860
date: 2026-10-18 07:56 UTC
---
# Development → Release testing: ITM-887, statusOf gives the status of one reviewed file

**REGISTER**

## Reason

ITM-887 (MOD-approvals), pull request #860 into `sprint/team2/89`, passes on `85c7e807`.

1. **Red first.** `665687dd` holds only `tests/approvals-status-of.test.mjs`. Run 39108583081 is red on it, because
   `index.mjs` does not export `statusOf`.
2. **Green.** Run 39108752098 passes on `85c7e807`. The developer force-pushed once. The replaced `6cf99dce` committed
   773 files under `src/bridge-build/node_modules` and was red in run 39108666473. The head holds three files.
   `git merge-tree --write-tree` merges it into `sprint/team2/89` at `42006a80` (#857) without a conflict (tree
   `cfa8fdb3`).
3. **Scope.** The head changes three files:
   - `src/approvals/status.mjs`;
   - `src/approvals/index.mjs`, its export and header line;
   - the new test file, whose header names MOD-approvals.
   `strategies.mjs`, ITM-724's file, is untouched.
4. **Counter-proofs.** I replayed six of them in a checkout of the head, and each made its own test fail: 887002 to
   887007.
5. **Readings taken** (AGENTS.md §6a.6, §6a.7):
   - "a record whose `kind` does not fit the file's folder is not counted" (MOD-approvals.md:106-107). The
     accepted signature of `statusOf` is synchronous, and `Snapshot.read` is async. So a record's kind is the one
     its name's identifier gives (MOD-approvals.md:70), as in `statuses`. A record counts only when its identifier
     equals the file's.
   - "the blob is the file's current blob in that snapshot" says what the caller passes. The interface names no error
     for a blob that differs, so the given blob is used.
   The code goes no further than the text, so no draft is needed.
6. **Agreement 83.** I installed the Bridge packages as CI does. No release test imports `src/approvals/`
   directly. The 16 whose import graph reaches it pass 109 of 109. The approvals unit tests pass 34 of 34, and the
   traceability release test passes 8 of 8.

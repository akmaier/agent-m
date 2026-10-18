---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4dfbae90a2cd18558f4a8505120df8b47ed93c38
  - https://github.com/akmaier/agent-m/pull/913
date: 2026-10-18 16:06 UTC
---
# Development → Release testing: ITM-945, the CI shards keep the files that start Electron apart

**REGISTER**

## Reason

ITM-945 (MOD-test-schedule), pull request #913 into `sprint/team1/91`, passes on `4dfbae90`, under its Acceptance as amended
in `9cf2cb21`.

1. **The participant trailers are present.** All three commits carry `developer-sonnet-a`.
2. **Red first, twice, tests only.** `8c87b42c` is red in run 39142434747. `8a61d222` adds the case of more files than
   shards and is red in run 39142889077 on TST-945001 to 945003 and 945005 to 945007.
3. **The change** is only the node job's partition in `.github/workflows/tests.yml`, a file MOD-test-schedule.md:70 names as
   this module's.
   - A file whose text calls `stageElectron` or names `native-fixture-lock` takes the shards in turn, in sorted order.
   - Every other file keeps `index % count`.
   - With more such files than shards, the job fails and names them: "N test files start Electron for 8 shards: <paths>".
   - The python job's copy is untouched; that is ITM-946.
4. **Green.** Run 39143154233 (mode rest) on `4dfbae90` passes all twelve jobs, the longest node (3) at 1 min 27 s.
   `git merge-tree --write-tree` merges the head into `sprint/team1/91` without a conflict (tree `ef65aa01`).
5. **The Acceptance holds, for what a pull request into the sprint can show.**
   - I ran `tests/test-schedule-ci-shards.test.mjs` on the head: 7 of 7. `test_ci_budget` passes.
   - I replayed the counter-proof in a clean checkout of the head: with the limit check removed, TST-945006 fails.
     Restored, it is clean.
   - The developer's other counter-proof, the rank frozen at 0, fails five tests.
   - "Every node job of the next mode=all run stays within two minutes" is read at the sprint pull request's end gate, where
     mode=all runs.
6. **No release test imports a file the item changes.**

**ITM-935 (#911) then merges the sprint branch and reruns on the new partition.**

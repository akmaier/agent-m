---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ef9d5e4a90f1bfb1d424b6f03e0d690b191505fa
  - https://github.com/akmaier/agent-m/pull/916
date: 2026-10-18 16:30 UTC
---
# Development → Release testing: ITM-947, the shard test finds the Electron files by the partition's rule

**REGISTER**

## Reason

ITM-947 (MOD-test-schedule, test code only), pull request #916 into `sprint/team1/91`, passes on `ef9d5e4a`.

1. **The participant trailer is present:** `developer-sonnet-a`.
2. **The red is #911's run 39143619737, job 117722884113, and that is accepted.**
   - The defect shows only with an eighth real Electron file, which the sprint branch does not hold until ITM-935 merges.
   - On #911's merged head, the old test fails TST-945004 and 945007.
   - That is the item's red. A copy of ITM-935's file committed here only to make CI red would be a workaround.
3. **The change** is only `tests/test-schedule-ci-shards.test.mjs`.
   - It keeps no list. It reads `startsElectron` out of the workflow script it already extracts and applies it to the files
     the partition hands out. The test holds neither rule word itself (0 matches), and the rule finds `site-usability`, its
     known positive.
   - TST-945006 builds nine Electron files, TST-945007 eight, and the new TST-945008 seven.
4. **My runs in a clean checkout of the head:**
   - 8 of 8 with the branch's seven Electron files;
   - 8 of 8 again with ITM-935's `tests/site-usability-boot-window.test.mjs` copied in from its branch, uncommitted, then
     removed.
   The developer's local run of the old test with that file fails TST-945004 and 945007.
5. **Green.** CI on `ef9d5e4a` passes all twelve jobs. node (3) passed on its rerun after ITM-935's "/ is loaded" flake.
   `git merge-tree --write-tree` merges the head into `sprint/team1/91` without a conflict (tree `4d75349f`).

**ITM-935 (#911) then merges the sprint branch, and its run is read for green.**

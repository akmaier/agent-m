---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - e16163c6c33b68d3769ee08ff74745fa55b1238b
  - https://github.com/akmaier/agent-m/pull/1202
date: 2026-10-20 12:08 UTC
---
# Development → Release testing: ITM-1117, passed — a commit's facts are stored beside its overview, and productFacts reads them

**REGISTER**

## Reason

ITM-1117 (MOD-progress-measures), pull request #1202 into `sprint/team1/97`, passes on `e16163c6`.

- **Three commits, one parent each, no merge, all with the trailer `developer-sonnet-b`.**
  - `6a46a721` holds only tests: TST-1117001 to TST-1117008, and TST-940004 and TST-940005 to the two files.
  - `f965b2b7` holds only tests.
  - `e16163c6` changes only `src/progress-measures/`: the new `stored.mjs`, and `facts.mjs`, `stages.mjs` and
    `index.mjs`.
- **The red,** run 39417899409, job 118611298618 on `6a46a721`: `# fail 9`, `# cancelled 0`, exactly TST-940004 and
  TST-1117001 to TST-1117008.
- **The tests changed after the red are kept.** No change weakens what a test asks.
  - TST-1117001 sorts both sides of a file list.
  - TST-1117007's elapsed time is the right sum, 75 hours from 2026-10-14 09:00 to 2026-10-17 12:00, where the red had 74.
    The test now derives the row as the caller does (`listJobs`), since the store holds records, not rows, and it adds
    a known positive.
  - The counts of a page load rise by the one read of the stored facts. That read is what the accepted draft
    `9a2c9f4a` adds, and it stays within `A PAGE LOAD READS THE REPOSITORY IN BATCHES`.
  - The tests are of level `unit`, of MOD-main-page, MOD-progress-measures and MOD-workflow-entries.
  - `f965b2b7` has no CI run of its own. The rule asks for the red of the first commit (SPEC.md:1426-1428).
- **sonnet-b's readings are kept:**
  - documents and records are stored as text and read again with their schemas;
  - an `Unreachable` read counts as no stored facts;
  - a practice's workflow is derived from the instance's files.
- **It meets the Acceptance:**
  - the stored facts are read with no file they come from, and equal those read from the files;
  - both files are added in one commit;
  - records, not rows, are stored, and a job's elapsed time is taken at the read;
  - an unreadable model is not stored, and another format's number reads as `null`.
- **CI:** 20 of 20 checks passed on the head (run 39419231524).
- **Merge:** `git merge-tree --write-tree` onto `sprint/team1/97` (`b7297984`) is clean.
- **Replayed in a clean worktree, with `sprint/team1/97` merged in:**
  - The 172 tests of `tests/progress-measures*`, `tests/main-page*` and `workflow-entries-main-changed` pass.
  - Counter-proof: with `591d5a24`'s `src/progress-measures/`, nine tests of `progress-measures-product-facts` fail.

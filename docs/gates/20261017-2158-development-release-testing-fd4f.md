---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - f8930e6c03b87599c31bbcf4de3bb89f365c2430
  - https://github.com/akmaier/agent-m/pull/788
date: 2026-10-17 21:58 UTC
---
# Development → Release testing: ITM-745, the committed configuration against the schedule

**REGISTER**

## Reason

This is ITM-745, pull request #788 into `sprint/team2/79`, at head `f8930e6c`. It is the second rejection, after
`fde029ad`. It is the last decision on this item within the sprint.

**What the rework fixed.** My failing case from `fde029ad` now passes. I replayed it on the head with a schedule that has
a paid secret (`ci:ORACLE_KEY`) and a participant runner (`lab-runner`):
- The unedited generated files give no difference on GitHub and on GitLab, and nothing throws.
- Each single line of the GitHub file, edited, gives exactly one difference.
- I replayed both new counter-proofs in TST-745005, each with its fault planted at the call in `configurationDrift`.
  With resources not read, 2 tests fail on `deepEqual`. With participants not read, 2 tests fail with
  `InvalidSchedule`.
- Only `src/test-schedule/generate.mjs` and the test file changed. CI is green, 10 of 10.

**Check 5 does not hold.** The Acceptance says "One edited line gives one difference with its path". The rework reads the
secret names and runner labels back from the committed file, so it compares those lines with themselves. A hand edit to
them disappears.

I replayed this on the head with a valid schedule: `paid`, and `component` on `lab-runner`, ticked for release candidate
only. Each of these one-line hand edits gives **no** difference, on both servers:
- secret line `ORACLE_KEY: ${{ secrets.ORACLE_KEY }}` renamed to `OTHER_KEY` (GitHub);
- `# Secrets, read from the CI variables: ORACLE_KEY` renamed to `OTHER_KEY` (GitLab);
- `runs-on: [self-hosted, lab]` changed to `other` (GitHub);
- `tags: [lab]` changed to `other` (GitLab);
- the only secret line removed by hand (both servers).

With the original schedule, the same edits made to every occurrence also give no difference. On GitLab, a suffix on the
first secret comment line gives 89 differences, not one. These lines are exactly the ones UC-027 1b must report: a
configuration that lost its paid secret or moved to another runner would be shown as agreeing with the schedule.

**The reading is not in the accepted text.** MOD-test-schedule, Files: the module reads the resources from the product's
`docs/resources.md` and the participants from the instance's `docs/participants.md`. It reads the committed configuration
"for its drift", that is, as the thing compared, not as the source of the generation's inputs. The phrase "what the
generated files themselves record" is in no accepted document of the repository. Reading inputs back from the compared
file is behaviour the text does not state.

**For akmaier, not decided here.** The signature `configurationDrift(files, schedule, target)` has no resources and no
participants. These are the readings I see:
- add both to the signature, as `ciConfiguration` and `proposeSchedule` have them;
- read `docs/resources.md` and `docs/participants.md` from `files`, which the Files section names. The participants are
  the instance's, though, not the product's.

Either needs akmaier's word on MOD-test-schedule before a rework.

**Noted, not conditions:** a secret name shared by two resources is read back as one. This only matters once the inputs
come from the registers.

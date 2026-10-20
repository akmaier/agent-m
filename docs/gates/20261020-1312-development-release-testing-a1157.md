---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 473ef6216e77b3d1f3f39336461d8686beac734a
  - https://github.com/akmaier/agent-m/pull/1209
date: 2026-10-20 13:12 UTC
---
# Development → Release testing: ITM-1157, passed — every python job of a pull request into main ends within two minutes

**REGISTER**

## Reason

ITM-1157 (MOD-test-schedule), pull request #1209 into `sprint/team1/97`, passes on `473ef621`.

- **One commit, one parent (`c8ffc9ae`, the sprint branch now), with the trailer `developer-sonnet-b`, declared as
  refactoring.** It changes only `.github/workflows/tests.yml`: the python job runs seven shards instead of four.
  - The workflow is named in MOD-test-schedule's parts (MOD-test-schedule.md:71), so it belongs to that module
    (`EVERY CODE FILE BELONGS TO A MODULE`, SPEC.md:1448-1451). This item is that module's job.
  - No test is left out, and no expected result changes. `tests/test_ci_budget.py` passes, here and on CI.
- **The first task's measurement** (developer-sonnet-b, each file alone in `mode=all`):
  - 399 s in all.
  - The longest files are `test_release_sprint_02_d` (36.4 s) and `test_backlog_item_fields` (27.1 s).
  - `test_verbatim` takes 8.0 s, so the lead that it caused the delay is not borne out. The job was long as a whole.
  - The longest shard falls from 118.8 s at four shards to 65.7 s at seven, which is the smallest count at the floor
    the two longest files set.
- **CI:** 23 of 23 checks passed on the head (run 39427108029), in `mode=rest`. The python jobs took between 22 and
  58 s.
- **The proof in `mode=all` is #1208's next run,** since a pull request into the sprint's branch leaves the release
  tests out. The Product Owner's own local replay of the shards was not faithful to the runner: no installed Bridge
  packages, and local failures that CI does not have. It was stopped, and it is not counted as evidence.
- **What the next runs will show:** shards are assigned by place in the sorted list, so a new test file can move files
  between shards. The end gates read each python job's time.

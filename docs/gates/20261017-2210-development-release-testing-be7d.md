---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 190cb959b204036bf4261cdf663a080c6f256a01
  - https://github.com/akmaier/agent-m/pull/795
date: 2026-10-17 22:10 UTC
---
# Development → Release testing: between jobs, the Python suite runs in four shards

**REGISTER**

## Reason

This is pull request #795 into `sprint/team2/79`, at head `190cb959`. It is a change between jobs, with no item. It
changes only `.github/workflows/tests.yml`: the Python matrix goes from two shards to four.

**The condition that does not hold.** A change between jobs passes only if it is one of the kinds that
`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` names. That requirement is no longer in the SPEC:
- Queue `2026-10-17d_every-code-file-belongs-to-a-module`, entry 01, was accepted in `45dbf4d8`, which is in the
  sprint's base. It removed the requirement "with its forms of a pull request between jobs".
- `EVERY CODE FILE BELONGS TO A MODULE` and `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` replaced it.
- `docs/architecture/MOD-test-schedule.md`, Parts, names `.github/workflows/tests.yml` as taken over, "in this
  module's own implementation jobs".

So only an implementation job of MOD-test-schedule may change this file. The pull request is not such a job.

**Checked, and holding:**
- Check 2: CI is green on `190cb959`, run 39073795297, 12 of 12.
- The timings: run 39073698881 ran on the same head, all 12 jobs green. The Python shards took 58 s, 38 s, 60 s and
  32 s (from the jobs' start and end times), so each is within `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`.
- The workflow's header names splitting the suite as a remedy.
- Check 4: no new test is required. `tests/test_ci_budget.py` keeps `timeout-minutes: 2` in place and passes
  unchanged.

**For the Scrum Master, not decided here:** #792 stays red until an item of MOD-test-schedule makes this change, or until
akmaier gives his word.

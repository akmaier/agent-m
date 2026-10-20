---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 131f1ff6cff11bca88c993d7393d9dd90de5155d
  - https://github.com/akmaier/agent-m/pull/1102
date: 2026-10-19 17:12 UTC
---
# Development → Release testing: ITM-1078, the explanation of a tab job says that its record is kept, and recommends CI or a Bridge for long jobs

**REGISTER**

## Reason

ITM-1078, pull request #1102 into `sprint/team2/97`, passes on `131f1ff6`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `8fa7ba8c` holds only the test, and CI failed on it.
2. **The text.** The topic `job-runtime-tab` in `src/site-frame/explanations.md` now says three things, which UC-036 1b
   (UC-036-inspect-running-jobs.md:136-138) and the record's `## Taken` support:
   - the job's record is kept in the product repository;
   - its live state and log exist only in the tab that runs it;
   - a long job is better started on CI or a Bridge.
   The old sentence "leaves no record in the repository" is gone, and is the test's counter-proof.
3. **Scope.** Only the explanations file and a test naming MOD-site-frame.

---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 570869e0e0bc5de0781a16d9b76ebb60822673cf
  - https://github.com/akmaier/agent-m/pull/1123
date: 2026-10-19 18:16 UTC
---
# Development → Release testing: ITM-1097, a Bridge lists the jobs it runs, with their live states (GET /v1/jobs)

**REGISTER**

## Reason

ITM-1097, pull request #1123 into `sprint/team2/97`, passes on `570869e0`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `f57f32aa` holds only the test, and CI failed on it.
2. **The accepted text.** MOD-bridge-jobs.md:100.
   - `GET /v1/jobs` answers the jobs the Bridge runs, with their live states, in the form MOD-bridge-client's `bridgeJobs`
     reads.
   - `watch.mjs` gives its running set to the handler, which it kept private before.
   - i planted 9 faults, each caught.
3. **Named in the pull request, and registered.** `GET /v1/jobs/{id}/log` and `POST /v1/jobs/{id}/cancel` are not built
   either, and no item covered them. They are ITM-1101 (MOD-bridge-jobs).
4. **Scope.** `src/bridge-jobs/` and its test.

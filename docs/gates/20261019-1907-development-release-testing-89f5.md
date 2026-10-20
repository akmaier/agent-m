---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d5540f79257af3e868db7f16ec062540b6772b47
  - https://github.com/akmaier/agent-m/pull/1133
date: 2026-10-19 19:07 UTC
---
# Development → Release testing: ITM-1101, a Bridge streams a job's log and cancels it

**REGISTER**

## Reason

ITM-1101, pull request #1133 into `sprint/team2/97`, passes on `d5540f79`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `34751b38` holds only tests, and CI run 39304277534 failed on it.
2. **The accepted text.** MOD-bridge-jobs.md:100-102.
   - `GET /v1/jobs/{id}/log` gives the lines from `from` on, in the form `bridgeJobLog` reads.
   - `POST /v1/jobs/{id}/cancel` answers only once the agent's process has ended, and nothing is committed after it.
   - f planted 11 faults. One of them is caught only by the runner's timeout, which is still a failure.
3. **f's reading, accepted, and its gap registered.**
   - The Bridge's own `cancelled` end record stays as ITM-327 built it (`watch.mjs:143-149`), and this item does not change
     it.
   - The text has the person's page append the record of the cancel. So for a cancel through the page, the Bridge's own end
     is a second writer.
   - That is registered as ITM-1104, which keeps the Bridge's end for a quit.
4. **Scope.** `src/bridge-jobs/` and its test.

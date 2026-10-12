---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8914200a251ae893049b24e5cfe31ad1e932c609
  - https://github.com/akmaier/agent-m/pull/429
date: 2026-10-11 21:12 UTC
---
# Development → Release testing: ITM-391, a job in a checkout of the instance

**REGISTER**

## Reason

ITM-391, pull request #429 by developer-sonnet-c into `sprint/team1/21`, head `8914200`. The first commit `96ba4cf`
holds only `tests/job-runner-checkout.test.mjs`, and CI was red on it (run 38174962533): the refusal's test fails, and
no other test does. CI is green on `8914200` (run 38175222121, 1959 tests, 0 failures). The code changes only
`src/job-runner/`; the new test names MOD-job-runner and its guards, and 12 faults are recorded, one more dropped as
equivalent. The Acceptance holds: a context with a checkout read through it, one without read as before, and a checkout
at another commit than the record names refused by name.

The points weighed:
- The refusal is not an added check: the item's Acceptance asks for it — "a checkout at another commit than the record
  names refused by name" —, and it rests on MOD-job-runner's file, whose `instance.checkout` is on a Bridge "the
  instance at the job's `agent_m` commit", and on `A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE`, which
  reads the chapters of that checkout. That the module file names no error for it is noted for the review.
- The chapters read from the checkout are not this item's: its Outcome leaves "the chapter recipes that read it
  (ITM-392)" and "the routes that set it (ITM-327, ITM-365)" out. What it asks — `JobContext`'s `instance.checkout`,
  and `prepareJob` reading the instance through the snapshot read from the checkout — it builds; two of its three tests
  pin what the runner did already, as the snapshot was read through the context before.

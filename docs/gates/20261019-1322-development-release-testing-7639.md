---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 814ce9dffe544dc9b0d700af08407d6d5722209d
  - https://github.com/akmaier/agent-m/pull/1066
date: 2026-10-19 13:22 UTC
---
# Development → Release testing: ITM-851, a proposed commit test that reaches a paid service is an error

**REGISTER**

## Reason

ITM-851, pull request #1066 into `sprint/team2/96`, passes on `814ce9df`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `7d32f9bc` holds only `tests/result-records-test-proposals-paid.test.mjs`. CI run 39257945844 failed on it,
   in exactly the new cases (not ok 119 to 121).
2. **Scope.** Only `src/result-records/strategies.mjs` and the new test change.
3. **The accepted text.** MOD-result-records' Uses name `MOD-test-schedule.scheduleSchema`, `defaultSchedule` and `occasionsOf`
   (MOD-result-records.md:21-24, :173), and `paidServices` (:171). The check uses exactly those. It reads
   `docs/tests/schedule.md`, or the default where none is saved, and errors under COMMIT TESTS CALL NO PAID SERVICE.
4. **Reading accepted.** Only a `paid` that names a service the product's resources mark paid counts. A name the list does
   not hold gives no finding. That is the reading recorded at sprint 89's start: a case "reaches a service `paidServices`
   marks paid".
5. **Callers.** `servicesText` keeps its output, now built on `servicesOf`, so the recipe that lists the services is
   unchanged.

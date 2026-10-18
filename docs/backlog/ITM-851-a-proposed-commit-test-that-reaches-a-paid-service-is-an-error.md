---
id: ITM-851
title: A proposed commit test that reaches a paid service is an error
level: module
realises:
  - UC-026
  - COMMIT TESTS CALL NO PAID SERVICE
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - A FINDING READS LIKE A COMPILER MESSAGE
modules:
  - MOD-result-records
builds_on:
  - ITM-753
  - ITM-890
tests:
  - unit
origin:
  - developer-sonnet-g's stop of ITM-753 in team 2's sprint 80, 2026-10-18
---
# ITM-851 A proposed commit test that reaches a paid service is an error

**REGISTER**

## Outcome

The check `test-proposals` of `resultStrategies`, for the kind `propose-tests`, as MOD-result-records' file states it
(UC-026 step 6): an error finding for a case of a level that runs on a commit or pull request and reaches a service
`paidServices` marks paid.

The item waits for akmaier's decision on two inputs: a field of the `propose-tests` answer that names the services a
case reaches, and a source from which MOD-result-records reads which levels run on a commit or pull request. It cannot
be settled from the accepted texts: the answer schema (`src/job-catalogue/kinds/propose-tests/answer.schema.json`) has
no such field — its `response` marks a case that does not call the service but uses a recorded or constructed answer
instead —, and the schedule is MOD-test-schedule's, which MOD-result-records' Uses do not name and `JobContext` does not
carry.

## Acceptance

- On fixture proposals, the tests state the error with its requirement's name for a commit-level case reaching a paid
  service, and no finding for the same case at a level that runs only nightly or on a release.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/result-records/` and the tests that name MOD-result-records change.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (b), a module text change and a data change

The two inputs the Outcome names as waiting for akmaier:
- **The levels that run on a commit or pull request.** The source is the product's schedule, which `JobContext.product.
  snapshot` reads (`docs/tests/schedule.md`), through MOD-test-schedule's `occasionsOf(row, schedule)` — "the occasions on
  which a row runs" (MOD-test-schedule.md:138-139) —, or `defaultSchedule()` where none is saved (:120). The recipe
  `commit-and-levels` already takes "the commands the product's schedule names" (MOD-result-records.md:135). No cycle:
  MOD-test-schedule uses no MOD-result-records. **The draft**, committed as `c2f0a91e`: MOD-result-records' Uses gain
  `MOD-test-schedule.scheduleSchema`, `defaultSchedule` and `occasionsOf`, and its Files `docs/tests/schedule.md`.
  Principle: *nothing twice* — `occasionsOf`, not a second reading of the table.
- **The services a case reaches.** UC-026:94-96 asks that "a case that would call a paid service … is marked"; the
  format already has the key: a test declaration's `paid`, "the name of a paid service it calls, if any"
  (MOD-test-document.md:61). The answer schema of `propose-tests` is data of MOD-job-catalogue
  (`src/job-catalogue/kinds/propose-tests/answer.schema.json`), whose fields no module text states. **The reading:** a
  proposed case carries `paid`, the name of the paid service it really calls; it reaches a service `paidServices` marks
  paid when its `paid` names one. ITM-890 adds the field to the schema and the prompt. Principle: *no special first case*
  — the same key a written test declares.

The item builds on the acceptance of the draft and on ITM-890. While team 1's sprint 87 runs, ITM-878's MOD-trace-pages
uses MOD-result-records, so the item is held.

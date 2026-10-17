---
id: ITM-635
title: Append a run result without rewriting earlier records
level: module
realises:
  - UC-028
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - TEST RESULTS ARE KEPT IN THE REPOSITORY
  - A RESULT RECORD IS NEVER REWRITTEN
modules:
  - MOD-result-records
builds_on:
  - ITM-251
tests:
  - unit
origin:
  - MOD-result-records, Interfaces appendResult and Parts append.mjs
  - ITM-476's accepted append-only result-record prerequisite, used also by ITM-586
---
# ITM-635 Append a run result without rewriting earlier records

**REGISTER**

## Outcome

Implement the existing accepted public appendResult(host: Host, record: Document)
-> Promise<{ commit: string, path: string }> in MOD-result-records' append.mjs and public index.
It adds the supplied run record as a new file on test-results, through the existing public Host
and the existing resultSchema.run and MOD-documents writer. The commit is made only on the head
that was read; existing files are neither changed nor deleted, and no push is forced.

This is the bounded writer prerequisite separated from ITM-476, not another JUnit parser or a
second result writer. ITM-476 consumes this implementation unchanged. No prior partial sprint
change, cancelled job, unpublished source or historical CI receipt is copied or treated as
default-delivered work.

Only src/result-records/ and new owned unit tests naming MOD-result-records change. Preserve
the existing result readers, schemas, case bodies and expected results. parseOutcomes, testHistory,
resultStrategies and its recipes/checks/writer, schedule generation/filtering, workflow registration,
CI adoption, page integration and whole UC-028/module completion remain outside this item.

## Acceptance

- On a constructed existing test-results head, a valid supplied record is serialized through the
  existing public document writer and added at its own path by one commit on exactly that head.
  The returned commit and path identify that addition; all earlier records remain byte-for-byte.
- An already present record path is refused as Exists, not replaced, even when its text would agree.
  A positive addition is shown before the refusal. A head that moved is not overwritten: preserve
  the Host's named Moved failure, with no force, deletion, amendment or hidden retry-until-success.
- The accepted token/permission/rate-limit/unreachable failures propagate by name. Deterministic
  unit fixtures capture public Host calls; no credential, real repository write, service or device
  is used. Tests state literal input, precondition and expected result, not a runtime document's
  expected result, and exercise the append-only behavior at its actual call/failure node.
- Follow the existing implementation-job and counter-proof rules: tests-only first with actual
  intended server red before further source assignment; each new case has its actual source-fault
  assertion failure and exact restoration. A loader failure is not an assertion counter-proof.
- Existing expected-result changes: none. Keep all old assertions, including planGrid, branch
  privacy, mailId and modelDiagram. No other module source, new public contract, schema, data,
  dependency, workflow, SPEC, use case, architecture, process or instruction change. Unit-only;
  no new release case or release-author job is selected.

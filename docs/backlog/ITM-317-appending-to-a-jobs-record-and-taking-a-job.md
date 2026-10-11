---
id: ITM-317
title: Appending to a job's record, and taking a job
level: module
realises:
  - UC-005
  - UC-007
  - UC-010
  - UC-011
  - UC-019
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
  - A REMOTE INTERFACE NAMES HOW IT FAILS
modules:
  - MOD-job-ledger
builds_on:
  - ITM-252
tests:
  - unit
origin:
  - UC-005 step 4
  - UC-010 steps 2 and 4
  - UC-011 steps 3 and 5
---
# ITM-317 Appending to a job's record, and taking a job

**REGISTER**

## Outcome

MOD-job-ledger's `appendToRecord` and `takeJob`, as its file states them. `appendToRecord` appends a part after the
record's last section, every byte before it unchanged, each kind of `RecordPart` in the form the record's schema reads
back, and an End with its round record in MOD-job-runner's `roundsText` form, which the reader now reads back into the
End's `rounds`; `RecordEnded` for a record that has its end, `NotWaiting` for a resumption of a job not at a gate.
`takeJob` reads the record at the head, appends `Taken` and commits only on that head; when the branch moved, it reads
again and takes the job on the new head or reports who took it. The routes call them (ITM-319, ITM-327, ITM-365).

## Acceptance

- Unit tests that name MOD-job-ledger state, before the code exists, with the host replaced by a fake: each kind of
  part appended and read back as the same part, the bytes before it unchanged; an End with two rounds read back with
  them; `RecordEnded` and `NotWaiting`; a job taken on the head read; on a moved head, taken on the new head or
  reported as taken by the participant that did.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-ledger/` and the tests that name MOD-job-ledger change.

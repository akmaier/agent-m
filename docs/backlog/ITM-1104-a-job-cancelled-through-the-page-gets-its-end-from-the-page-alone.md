---
id: ITM-1104
title: A Bridge job cancelled through the page gets the record of its cancel from the page alone
level: module
realises:
  - UC-036
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-bridge-jobs
builds_on:
  - ITM-1101
tests:
  - unit
origin:
  - the gate of #1133 (ITM-1101), sprint team2/97, on main at a5d42f90
---
# ITM-1104 A Bridge job cancelled through the page gets the record of its cancel from the page alone

**REGISTER**

## Outcome

MOD-bridge-jobs.md:101-102: `POST /v1/jobs/{id}/cancel` "stops the agent's process and confirms once it has ended; the job
then commits nothing more (`A CANCELLED JOB WRITES NOTHING MORE`), and the person's page appends the record of the cancel".
`src/bridge-jobs/watch.mjs:143-149` (ITM-327) appends the end itself, with `cancelled` and "the job was cancelled", when
the agent's run fails as `Cancelled`. ITM-1101 left that as it was. For a cancel through the page, both may write an end:
the Bridge's commit after the cancel, and the page's. A quit is not this case: MOD-desktop-shell.md:180-181 has the jobs
"end as cancelled" with no page to write it.

## Acceptance

- A unit test naming MOD-bridge-jobs: a job cancelled through `POST /v1/jobs/{id}/cancel` gets no commit from the Bridge after
  the cancel is confirmed. A job ended by a quit still gets its `cancelled` end ("the Bridge was quit").
- Counter-proof: the Bridge's own end written after a page's cancel fails it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/bridge-jobs/` and the tests that name MOD-bridge-jobs change.

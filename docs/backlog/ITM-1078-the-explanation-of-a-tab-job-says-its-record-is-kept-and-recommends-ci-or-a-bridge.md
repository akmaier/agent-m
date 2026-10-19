---
id: ITM-1078
title: The explanation of a tab job says that its record is kept, and recommends CI or a Bridge for long jobs
level: module
realises:
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-1025's stop (developer-sonnet-i, sprint 96), read against the accepted texts on main at c53134a8
---
# ITM-1078 The explanation of a tab job says that its record is kept, and recommends CI or a Bridge for long jobs

**REGISTER**

## Outcome

UC-036-inspect-running-jobs.md:136-138 (1b): "Its record is listed, with the note that its live state and log exist only
in that tab; the folded explanation recommends a CI or bridge route for long jobs." The topic `job-runtime-tab` in
`src/site-frame/explanations.md` says a tab job "leaves no record in the repository and ends when you close the tab". That
contradicts the record and its `## Taken` that the tab's route writes (MOD-runtimes.md, `queueJob`; MOD-job-ledger.md:91),
and it recommends nothing.

## The accepted text

Quoted from `main` at c53134a8, MOD-site-frame.md:111: "**The explanations file** `explanations.md`: one section `## <topic>` per
topic, its body the Markdown shown …". The topic's text is data of that file.

## Acceptance

- The topic `job-runtime-tab` says three things: a tab job's record is kept in the product repository, its live state and
  log exist only in the tab that runs it, and a long job is better started on CI or a Bridge. A unit test naming
  MOD-site-frame checks each of the three in the rendered topic.
- Counter-proof: the old sentence "leaves no record in the repository" fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/site-frame/explanations.md` and a test naming MOD-site-frame change. The frame's check that every topic a
  view names exists stays green.

---
id: ITM-1150
title: The usability tests of the site take a small part of their shard's two minutes
level: system
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-site-frame
builds_on:
tests:
  - system
origin:
  - CI of #1184, sprint team2/97, run on dc1a4d72's predecessor (node (6), 2 min 9 s)
---
# ITM-1150 The usability tests of the site take a small part of their shard's two minutes

**REGISTER**

## Outcome

On #1184, CI's job node (6) ran 2 min 9 s, past the two minutes of SPEC.md:1523. TST-904001 of
`tests/site-usability.test.mjs` took 106.6 s of it. That shard took 72, 79, 85 and then 129 s on recent runs. One more
case, or a slower runner, stops the job for every pull request it falls into. Find where the time goes, as a data-flow
path with the run that showed it (AGENTS.md §2), and make the tests fit.

## Acceptance

- The cause is named in the pull request, with timings before and after.
- TST-904001 and its shard finish well within the job's two minutes: 20 CI runs in a row stay under 90 s for that shard,
  recorded in the pull request.
- It is declared as refactoring: no expected result changes, and CI is green on every commit.

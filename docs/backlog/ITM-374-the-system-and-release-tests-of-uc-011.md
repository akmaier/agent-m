---
id: ITM-374
title: The system and release tests of UC-011
level: system
realises:
  - UC-011
modules:
  - MOD-runtimes
  - MOD-bridge-client
  - MOD-bridge-http
  - MOD-bridge-jobs
  - MOD-agent-processes
  - MOD-desktop-shell
  - MOD-job-ledger
  - MOD-repository-hosts
builds_on:
  - ITM-325
  - ITM-367
  - ITM-363
  - ITM-267
  - ITM-291
  - ITM-294
  - ITM-405
  - ITM-406
  - ITM-407
tests:
  - system
  - release
origin:
  - UC-011
---
# ITM-374 The system and release tests of UC-011

**REGISTER**

## Outcome

UC-011 checked as a whole, once the items it builds on and the change between jobs by which the dashboard reaches the
use case's prompt page (ITM-363) are merged: pairing once, the Bridge kept under the name it reports; a
`change-use-case` job handed from the page over the Bridge route (ITM-325) to the source Bridge with a fixture agent it
offers in a temporary working folder (ITM-367, ITM-407), the clones there at the job's commits, its artifacts committed
open to a fixture origin with its end record; 1a, a Bridge paired at a forwarded address kept as one more Bridge; 1c,
through a reverse tunnel and over HTTPS through a jump host, with the fixtures of ITM-286 and ITM-294; 1d, two Bridges,
each job going to the one its participant names; 1b, pairing anew; 3a, a wrong token reaching no agent; 3b, an agent not
offered refused with the reason; 3c, a repository the computer's git login does not reach refused and named; 2a, a
blocked call named with the route over HTTPS and UC-010; and that no Bridge listened beyond loopback. Release tests, one
or more for each requirement UC-011 realises, `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` by ITM-267's measurement.
The tests are written by a Developer who implemented none of the items they build on (`RELEASE TESTS ARE NOT WRITTEN BY
THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-011 realises has a release test, and the system test walks the main flow and each alternative
  flow named; each test states its input, precondition and expected result where they can be read without running it,
  and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the dashboard or the Bridge and UC-011 disagree, the test follows UC-011 and the disagreement is named as a
  finding.
- Only new test files change.

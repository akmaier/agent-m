---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 11dcbf1f149914114a420e7a43c301138aafd55c
  - https://github.com/akmaier/agent-m/pull/404
date: 2026-10-11 19:43 UTC
---
# Development → Release testing: ITM-405, the Bridges this browser keeps on the settings page

**REGISTER**

## Reason

ITM-405, pull request #404 by developer-sonnet-a into `sprint/team1/19`, head `11dcbf1`. The tests-only commits
`d7bea3a` and `ed70aa7` were red on the seven new tests alone (runs 38168248501, 38168434297); the code `75a298d` was
red on the existing TST-280901, which the dashboard reaches by `import()`; the tests-only `6f66260` was red on the new
pairing case (run 38168759038), and `11dcbf1` is green (run 38168903812, 1741 tests, 0 failures). Only
`src/settings-pages/` and the new test change; the test names MOD-settings-pages and its guards, and 26 faults are
recorded, the four that survived on the draft killed by `ed70aa7`. The Acceptance holds: two Bridges listed and tested
by name, one through the jump host at its HTTPS path, *Clear* naming the endpoint that names it first, pairing storing
the reported name, a new jump-host Bridge with the lowest free port and its commands, the jump host's *Test*.

The readings weighed:
- The single `bridge` kept as the Bridge paired last, and the remote sessions beside the Bridges by name: TST-280901
  and the endpoints page still read the single key, and no expected result may change — as #392 kept the store's old
  keys. The endpoints page's `throughBridge` is outside this Outcome.
- The jump host's *Test*: with its login over HTTPS, an answer of its web server shows that the address is reached,
  its certificate trusted and the login accepted, which is what the jump host itself is; a refused login, no answer
  and a missing HTTPS address are not taken as working. Whether a Bridge behind it answers is that Bridge's own *Test*.
  The placeholder in the token header carries no secret.
- *Clear* names the endpoints only. The Acceptance asks for that; the Outcome and MOD-settings-pages' file (UC-042 2a)
  also name the participants, the mailbox and the resources. The mailbox has no key yet (ITM-422); but the participants
  are `docs/participants.md`, which this module writes, so the pull request's reason does not hold for them. Naming
  the participants, the mailbox and the resources is noted for the review, as unfinished in the Outcome.

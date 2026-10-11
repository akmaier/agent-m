---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 36981d497fc1db7c5248387a54568e434dda24a1
  - https://github.com/akmaier/agent-m/pull/420
date: 2026-10-11 20:34 UTC
---
# Development → Release testing: ITM-456, clearing a Bridge names the participants and the mailbox that name it

**REGISTER**

## Reason

ITM-456, pull request #420 by developer-sonnet-a into `sprint/team1/20`, head `36981d4`. The tests-only commits
`df01876` and `f010390` were red on the four new tests alone (runs 38172317757, 38172377317); CI is green on
`36981d4` (run 38172544224, 1840 tests, 0 failures). The code changes only `src/settings-pages/settings.mjs`; the new
test names MOD-settings-pages and its guards, and 11 faults are recorded, the one that survived on the draft killed by
`f010390`, one more equivalent and not counted. The Acceptance holds: *Clear* of a Bridge names its participants
— rows of the instance's `docs/participants.md` whose route is `bridge <name> agent <agent>` — and the mailbox whose
connection names it, as MOD-mail-routes' `imap.bridge` does, and none of another Bridge's; a no clears nothing, and a
yes leaves the participants and the mailbox as they were.

The readings named — participants that cannot be read said with the reason, the question still asked; no instance host,
nothing said of participants; the resources left out, as the item says — fill points the texts leave open. Over this
repository, 27 participants are read and none names a Bridge, with 13 rows of Claude Code as the known positive.

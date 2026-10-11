---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 442880bb5bf3878f71784af009daf631ec07b8a2
  - https://github.com/akmaier/agent-m/pull/370
date: 2026-10-11 15:29 UTC
---
# Development → Release testing: ITM-339

**REGISTER**

## Reason

ITM-339, pull request #370 by developer-sonnet-a into `sprint/team1/16`, on head `442880b`, against the item and
MOD-spec-changes' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `9708e2c`, holds only `tests/spec-changes-entry-view.test.mjs`, and CI was red on it (run
  38149006141): node failed on its 14 cases, and on TST-276901, MOD-desktop-shell's Electron start timing out, which
  the commit does not touch. The tests-only commits `32d5beb` and `773839d`, which add what the faults planted on the
  draft and this repository's own queues showed, were red on exactly their 18 and 19 cases (runs 38149461568,
  38149891345).
- CI is green on the head (run 38150245183): node 1454 tests, 0 failed; python 441 tests, OK.
- Only MOD-spec-changes' folder — the two states and `createdBy` in `queues.mjs`, `entryView` in the new `accept.mjs`,
  the export and header of `index.mjs` — and the new test whose header names the module change; no existing test or
  expected result changes. `entryView` calls what the module file's uses name.
- The 19 new tests name what they guard — among them `NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT`, `A REQUIREMENT IS
  NOT CHANGED WITHOUT AN IMPACT LIST` and `A STALE APPROVAL IS NOT APPLIED` — and MOD-spec-changes, with 48 planted
  faults recorded.
- The Acceptance holds: an entry whose section changed after it was shown reads `stale`; an entry whose anchor an
  earlier entry creates reads `waiting for its anchor`, `createdBy` naming it; `entryView` of a changed requirement
  gives its impact list, of a renamed one the old name withdrawn and the new one added, of a new section `current` as
  `null`.

The start decision's note holds: over this repository's 46 queues, 95 entries are in SPEC and 16 open before and after,
none stale or waiting, so the backlog page's count does not change today. Noted for the sprint's review, no condition
of this gate: every queue's line `Zieldatei aller Einträge` names `products/agent-m/SPEC.md`, a path this repository
does not have, while its rows name `SPEC.md`, so an entry's target is the file its own row names and `Queue.target`
stays the line's; `entryView` returns a Promise where the module file writes a plain result, as the snapshot is read
asynchronously; it stands in `accept.mjs`, as the start decision listed it, where the module file's Parts name no part
for it; and the readings the pull request names for ITM-340.

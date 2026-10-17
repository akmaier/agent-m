---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 31ad00a0bcffd0e2fd8305a0c1bf9d6350142bed
  - https://github.com/akmaier/agent-m/pull/771
date: 2026-10-17 20:34 UTC
---
# Development → Release testing: ITM-823

**REGISTER**

## Reason

ITM-823, MOD-mail-protocols' `store-draft`, `update-draft`, `show-draft`, `confirm-send` and `send`: pull request #771
into `sprint/team2/78`, on head `31ad00a`.

The condition that does not hold: check 5, the Outcome "an update replaces the Bridge's own draft" (MOD-mail-protocols,
Files: "it appends and removes only the Bridge's own drafts"). `removeDraft` (`src/mail-protocols/imap.mjs:219-222`,
called from `storeDraft` at :234 for `update-draft`) deletes the ref's uid without checking its `uidValidity`, unlike
`draftBytes` for `show-draft` and `send`. Replayed on the head against the PR's own fixture: Drafts of validity 7 holding
a person's draft at uid 50, `update-draft` with the stale ref `{ uid: 50, uidValidity: 99 }` appended the new draft and
deleted the person's draft, where the PR's own reading answers a stale ref `not-found`. Known positive: the same call
with validity 7 deletes it as intended.

The other checks hold. First commit `7a9bb9b` holds only `tests/mail-protocols-send.test.mjs`, and CI was red on it
(run 39066574629, TST-823001..: `mailHandlers` lacks the operations); CI is green on the head (run 39066919115). Only
`src/mail-protocols/` (new `smtp.mjs` and `confirmations.mjs`, both in the file's Parts; `testSmtp` moved into
`smtp.mjs` unchanged) and the new test, whose header names MOD-mail-protocols and its requirements, change; no
dependency. The fixture line changed after the tests-only commit (APPEND folder unquoted) prepares the fixture and
changes no assertion. The tests of ITM-420 and ITM-822 pass on the head (4 files, 25 tests). Counter-proofs replayed on
the head: SHA-256 comparison removed (TST-823005), confirmation never spent (TST-823006), expiry ignored (TST-823009),
SMTP error swallowed (TST-823007) — each red. The hard rule holds as far as read: `send` takes ref and SHA-256 from the
confirmation only, spends it before any network step, and transmits only the re-read bytes whose SHA-256 is confirmed.
The developer's readings — argument and answer shapes, a 5-minute lifetime that no test asserts, a confirmation spent
at the first attempt, `not-found` for a stale ref — are gaps for the module file, no reason by themselves.

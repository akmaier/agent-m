---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - ffb72717000044a2cf8c853d6065354b1a2a15d4
  - https://github.com/akmaier/agent-m/pull/771
date: 2026-10-17 20:39 UTC
---
# Development → Release testing: ITM-823

**REGISTER**

## Reason

ITM-823, MOD-mail-protocols' `store-draft`, `update-draft`, `show-draft`, `confirm-send` and `send`: pull request #771
into `sprint/team2/78`, reworked once after the rejection on `31ad00a` (docs/gates/20261017-2034-development-release-testing-557f.md),
decided on head `ffb7271`.

The condition of the rejection now holds: `update-draft` removes only the Bridge's own draft. The rework changes only
`src/mail-protocols/imap.mjs` (`ownDraftBytes` checks the ref's UIDVALIDITY and the Bridge's mark before `storeDraft`
appends and before `sendDraft` sends), `src/mail-protocols/index.mjs` (the reply carries the header `X-Agent-M-Draft`)
and adds TST-823010; no expected result and no dependency changes. Replayed on the head: a stale ref `{ uid: 50,
uidValidity: 99 }` against Drafts of validity 7 answers `not-found`, appends nothing, and the person's draft at uid 50
survives byte for byte; the same replay on `31ad00a`'s code deletes it (known positive), and the Bridge's own draft with
a valid ref is still replaced. TST-823010's counter-proof replayed: the check before removal dropped turns it red, and so
does the mark check dropped with the UIDVALIDITY check kept.

The mark: MOD-mail-protocols, Files, says only that it "appends and removes only the Bridge's own drafts", names no way to
recognise them, and its Data keeps nothing across requests; a mark in the draft's bytes is a reading within the module.
The pull request names it as a gap, no test asserts the header's name, and the bytes shown are the bytes sent. The
header's name, and that it reaches the reporter in the sent mail, are a gap for the module file, no reason by themselves.

CI run 39067394505 is green on the head; the mail-protocols tests pass there (4 files, 26 tests, ITM-420 and ITM-822
unchanged). Checks 1 to 4 hold as recorded at `31ad00a`.

---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 418049cb5b9accf0cbf82da8693d515ff2382eeb
  - https://github.com/akmaier/agent-m/pull/766
date: 2026-10-17 20:16 UTC
---
# Development → Release testing: ITM-822, The Bridge reads and finds mails without changing the mailbox

**REGISTER**

## Reason

ITM-822, pull request #766 into `sprint/team2/78`, at head `418049cb`. developer-sonnet-g wrote it.

**The condition that does not hold: check 3, scope.** `tests/mail-protocols-mails-fixture.mjs` is new. It declares no
test: it exports `PASSWORD`, `MAILS`, `connection`, `withMails` and `call`, so it is a test helper. The SPEC tells tests
and test helpers apart (`EVERY CODE FILE BELONGS TO A MODULE`). `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`
admits code in the module's folders and tests that name the module. `docs/instructions/developers.md` step 3 says "no
test helper". The fixture has a single importer, so it can live in the test file itself. The developer may rework this
once, on exactly this condition.

**What holds.**
1. The first commit `327f5a5c` holds only the two test files, and CI was red on it: node (3) failed.
2. CI is green on `418049cb`, ten of ten.
3. Apart from the helper, the change stays in scope:
   - `src/mail-protocols/imap.mjs` is new and is the module file's part for reading;
   - `src/mail-protocols/index.mjs` moves the IMAP code out to it;
   - `tests/mail-protocols-read.test.mjs` is new and names MOD-mail-protocols.
   No dependency changes, and TST-420001 to TST-420005 are unchanged.
4. TST-822001 to TST-822007 each name a requirement and MOD-mail-protocols. Each has a counter-proof recorded in the
   description.
5. The Acceptance holds as far as the tests show.

**The developer's readings are accepted under the accepted text.**
- `read`, `drafts` and `sent` answer bare arrays, and `find` answers one `Mail`.
- `find` fails with `not-found`. The module file says "*not found* when none matches" and lists `not-found` among the
  errors. How MOD-mail-routes maps that to its `null` is that module's matter.
- A mailbox with no Drafts or Sent marking answers `not-found`.
- `since` is untested, and the Acceptance asks for no such test.

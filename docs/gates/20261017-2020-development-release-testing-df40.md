---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - c42a66c8af4e45fdd0296063654a4b4ae00bd564
  - https://github.com/akmaier/agent-m/pull/766
date: 2026-10-17 20:20 UTC
---
# Development → Release testing: ITM-822, The Bridge reads and finds mails without changing the mailbox

**REGISTER**

## Reason

ITM-822, pull request #766 into `sprint/team2/78`, at head `c42a66c8` — the one rework of `418049cb`, which was
rejected on check 3 because `tests/mail-protocols-mails-fixture.mjs` was a test helper
(`docs/gates/20261017-2016-development-release-testing-5389.md`).

**The rejected condition now holds.** The rework commit `c42a66c8` deletes the helper and puts its code into
`tests/mail-protocols-read.test.mjs`; the code is identical apart from the dropped export line and its header comments,
and nothing references the helper any more. Between `418049cb` and `c42a66c8` nothing under `src/` changed, and no
test input or expected result changed.

**The other checks still hold.**
1. The first commit `327f5a5c` holds only tests, and CI was red on it.
2. CI run 39066109152 is green on `c42a66c8`, ten of ten.
3. Changed files: `src/mail-protocols/imap.mjs` and `src/mail-protocols/index.mjs` (the module's folder) and
   `tests/mail-protocols-read.test.mjs` (new, names MOD-mail-protocols). No test helper, no dependency change.
4. TST-822001 to TST-822007 each name a requirement and MOD-mail-protocols, with counter-proofs recorded.
5. The Acceptance holds as far as the tests show; the readings accepted in the earlier record stand.

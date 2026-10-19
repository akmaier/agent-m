---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 6da63ed4fcec085ba021b42c62a2bdf953c1e0a5
  - https://github.com/akmaier/agent-m/pull/925
date: 2026-10-18 18:53 UTC
---
# Development → Release testing: ITM-952, new mail is read without the decided ones, and a person's decision is carried out

**REGISTER**

## Reason

ITM-952, pull request #925 into `sprint/team2/94`, passes on `6da63ed4`. I checked it in a clone of my own.

1. **Red first.** The first commit, `80d181d4`, holds only `tests/mail-handling-intake.test.mjs`. In CI run 39155312348,
   job node (7) fails on exactly the new tests. Its log (job 117757205892) holds `not ok` for TST-952001 to TST-952019,
   19 of 19, and no other test fails there.
2. **Green.** Run 39155499506 is green on the head, on 20 of 20 jobs.
3. **Scope.** Only `src/mail-handling/` (new: `index.mjs`, `intake.mjs`) and one test file naming MOD-mail-handling
   changed.
4. **Counter-proofs** are recorded. I replayed one: with the marks ignored, TST-952001 fails (18 of 19 pass).
5. **The Acceptance after the split holds:**
   - `readNewMail` leaves out listed and marked mails, attaches a reply by a `mail-added` note, keeps a closed issue
     closed and changes nothing in the mailbox;
   - `decideMail` *create* refuses with `PersonFound` and writes nothing on a hit, and otherwise creates one issue labelled
     `defect` or `change` ending with the identifier;
   - *add* writes one note, and *not an issue* throws a `TypeError` naming ITM-956.
   - The quotes of MOD-mail-handling.md:74-94 agree with the accepted blob `be10efd1`.

**The deviation `unwritten`: admissible.** The accepted `readNewMail` says "an issue that cannot be written to is named,
and its mail stays proposable" (MOD-mail-handling.md:83-84). The function goes on after the failure, so the naming can
only be in its result. The accepted `NewMail` (:74-76) has no field for it. So the accepted sentence asks for what the
type does not hold, and the one field added fulfils the sentence without changing the three accepted fields. The draft
`8e6a6d8d` puts the field into `NewMail` for akmaier, beside `0fbe0bf0`. If akmaier decides otherwise, the field and
TST-952011's last assertion go.

**The readings named in the pull request:** `decided` without the attached mails; threads per product; `create` refusing
other labels; title and text searched apart; `listIssues({ state: "all" })`; a comment's `date` as `createdAt`; the hosts'
errors unchanged. Each fits the accepted text.

**Agreements 83 and 89.** On the head, with the Bridge packages installed as CI installs them (`--omit=dev
--ignore-scripts`) and LC_ALL=C:
- every release test file: 358 tests, 349 pass, 1 fails, the known TST-320321902;
- `tests/test_mail_import.py` and `tests/test_mail_routes.py`: 5 pass;
- the tests of MOD-mail-handling, MOD-mail-records and MOD-personal-data: 124 pass.
The head branched before #923, so the Scrum Master tests the merge with `sprint/team2/94` before merging.

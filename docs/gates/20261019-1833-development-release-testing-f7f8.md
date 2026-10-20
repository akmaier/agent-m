---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d87bdffc95d9c7879d2bd2f966bde4bd07a7d242
  - https://github.com/akmaier/agent-m/pull/1131
date: 2026-10-19 18:33 UTC
---
# Development → Release testing: ITM-993, an expired Microsoft sign-in is renewed on the stored connection

**REGISTER**

## Reason

ITM-993, pull request #1131 into `sprint/team2/97`, passes on `d87bdffc`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `b76c9558` holds only the tests, and CI run 39302311335 failed on it. TST-993004 is the known positive,
   green before the fix.
2. **The Acceptance.**
   - A *Test* that finds `SignInExpired` on the Microsoft route offers *Sign in with Microsoft*.
   - One click signs in with the stored client identifier, and for no other.
   - Only `graph.account` of the stored `mailbox` entry is rewritten.
   - The next *Test* is recorded as `working`.
   - The offer is not repeated after the renewal.
   - f planted 17 faults, the fresh-connection counter-proof among them.
3. **Changes to this item's tests in the fix commit.** They make the tests stricter: a single client identifier, the offer
   not repeated, and a whole renewal walked through. The fixture's Bridge name changed with them. The empty password is
   asserted as "no value", which allows only an empty field or none.
4. **f's reading, accepted.** The route `mailbox`, opened with a stored connection, prefills its fields but never a password
   or a token (`A STORED SECRET IS HIDDEN UNTIL SHOWN`), so IMAP's *Store and test* asks for the password again.
5. **Scope.** `src/settings-pages/mailbox.mjs` and its test.

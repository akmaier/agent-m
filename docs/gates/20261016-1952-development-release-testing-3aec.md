---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 769f192b1ab112084a585731bd12c062e478483d
  - https://github.com/akmaier/agent-m/pull/625
date: 2026-10-16 19:52 UTC
---
# Development → Release testing: ITM-550, A mail's people

**REGISTER**

## Reason

ITM-550, pull request #625 into `sprint/team1/51`, at head `769f192b`. developer-sonnet-d wrote it, as `51.md` assigns.
It lists AGENTS.md, SPEC.md, the item, `51.md`, MOD-personal-data, UC-038 and chapters 9, 11, 12 and 13 as read in full.

1. **The tests-only commit is red.** `16a6c2af` was pushed alone. Run 38957352049 fails exactly the file's 21 tests, on
   node (6), because `peopleIn` was missing.
   - In the uncommitted stub run, 17 fail on behaviour, and the 4 that expect no one pass.
   - The implementation commit corrects one expected value of the developer's own new test: `0911/1234567` and
     `09111234567` are one person by their digits. The pull request says so, as in ITM-535 and ITM-536.
   - The listing of `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38957807346, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module.** `src/personal-data/people.mjs` and `index.mjs`, and the new test file.
   `peopleIn` reuses the module's own `kept`, `digitsOf` and `PHONE_RUN`, and calls no other module.
   - The module's tests pass 44 of 44, and the related ones 68 of 68.
   - `test_no_backend` passes, and ITM-018 passes.
   - A throwing `fetch` spy shows the function is pure.
4. **Each fault is caught.** Each known positive has a known negative beside it, among them:
   - a six-digit number is no phone;
   - an `@` inside an address is no handle;
   - "Dearest" and "Hello, team" give no name;
   - `--` alone is no signature.

   Five planted faults are each caught.
5. **The Acceptance holds.** A fixture mail with each form gives each person under the right kind, once. A mail naming no
   one beyond its headers gives only the headers' people.

**The readings are taken as the accepted MOD-personal-data states the forms, and none adds a word:**
- a greeting starts a line, and a comma right after it gives no name;
- a closing is its own line, and the line that follows it is the next one, so a blank line gives no name;
- the signature begins after the first line that is exactly `-- `;
- a handle ends at the first character that is not a letter, a digit or `_`;
- an address's domain needs no dot;
- a phone is a run of seven digits or more, so a date such as 2026-10-16 or an address of four numbers counts as one;
- people are listed once, ignoring case, and phones by their digits.

A date taken for a phone errs toward naming too much, which the rule asks for. `Regards,` followed by a blank line and
then a name, and a signature after `--` without its blank, give no name by the accepted forms. The module file leaves
such names to the three checking participants (UC-038 step 6). Finding them here would be a change of that text, which
nothing asks for yet.

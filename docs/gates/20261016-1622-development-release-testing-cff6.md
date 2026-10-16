---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - d22e0f686c867a058e5c3cfb8b1b73d69577ad3e
  - https://github.com/akmaier/agent-m/pull/604
date: 2026-10-16 16:22 UTC
---
# Development → Release testing: ITM-549, Where a text names a mail's people

**REGISTER**

## Reason

ITM-549, pull request #604 into `sprint/team1/47`, at head `d22e0f68`. developer-sonnet-d wrote it, as `47.md` assigns.

**A phone number written after other digits is not found.** `src/personal-data/people.mjs:13` matches `PHONE_RUN`, the
longest run of digits and separators. `phonesAt` (line 28 on) then compares the digits of that whole run with each
phone's digits. In "Ticket 4711 / 0912 345678", the run's digits are `47110912345678`, so the phone `0912 345678` is no
hit. That is the developer's own reading 5, which it named for confirmation.

The item says "a run of digits … is a hit where its digits equal the digits of one of `people.phones`". It does not
say the longest run, and reading it so adds that word (AGENTS.md §6a.7). The result misses a person's phone number in a
mail's text, the case `A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE` exists for.

The item now settles it. A stretch of whole digit groups within a run is a hit where its digits equal the phone's
digits. Such a stretch begins at the run's start or after a separator, and ends at the run's end or before a separator.

The developer adds this as a new commit, with a test of exactly that case. The test is red on `d22e0f68`, and a planted
fault that compares only the whole run must fail it. The existing counter-proofs stay: other digits, and a number split
by a line break.

**The other checks hold on this head and carry over:**
1. **Red first.** The tests-only commit `6e7c8860` was pushed alone. In run 38930691659, exactly the file's 19 tests
   fail. In the uncommitted stub run, 17 fail on behaviour, and the 2 that expect `[]` pass. The listing of
   `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green** on `d22e0f68`, in run 38931096836.
3. **Scope.** Only `src/personal-data/index.mjs`, the named part `people.mjs`, and the new test file change. The function
   is pure, as a throwing `fetch` spy shows.
4. **Counter-proofs.** Seven planted faults are each caught, and each known positive has a known negative beside it.

**The developer's other readings are within the item:**
- whole words, with letter and digit boundaries;
- name parts separated by blanks;
- the local part, as the text before the first `@`;
- an account's leading `@` dropped;
- lines ending at LF or CRLF, and columns counting UTF-16 units;
- the order of the hits.

Reading 7 is taken as the item means it: "the same place" means a part that lies within the whole name's extent gives
one hit, the whole name's.

The developer's report said `47.md` does not list ITM-549. It does, in the selection of `865da283`.

---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 6c3884a85b9123ca18805b09316e1ee921c65c30
  - https://github.com/akmaier/agent-m/pull/1100
date: 2026-10-19 16:58 UTC
---
# Development → Release testing: ITM-1090, an item identifier takes three or more digits in the scheme and in identity.mjs

**REGISTER**

## Reason

ITM-1090, pull request #1100 into `sprint/team2/97`, passes on `6c3884a8`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `6f7ec606` holds only the tests, and CI failed on it.
2. **The accepted text.** MOD-identifiers.md:54: `ITM-<nnn>`, three or more digits.
   - `src/identifiers/scheme.mjs` takes `ITM-\d{3,}`, and its comment now says so.
   - `docs/assets/artifacts/identity.mjs:31` and `:50` take it too. It is taken over by MOD-identifiers
     (MOD-identifiers.md:39).
   - `identity.mjs` orders paths with an item's number as a number (`inOrder`), so ITM-999 comes before ITM-1000.
3. **Callers and the tests that pin them** (agreements 92 and 95).
   - `nextIdentifier` gives ITM-1000 after ITM-999 instead of a `RangeError`. That follows from the scheme.
     MOD-identifiers.md:75 states `nextIdentifier` over the scheme's kinds.
   - TST-472248 in `tests/identifiers-next.test.mjs` pinned the `RangeError` for ITM, and now states ITM-1000.
   - `tests/test_identifiers.py`, level unit, changes in its own commit: ITM-1000 is an item, and `ITM-99` replaces
     `ITM-0001` among the malformed. `ITM-0001` has four digits, and is an identifier under "three or more digits".
   - Neither is a release test.
4. **Run here.** `identifiers-item-digits` and `identifiers-next` pass, 15 of 15, and `test_identifiers` passes.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a11fd12a98758fa854d0c9e945f8a55e25f7f3d2
  - https://github.com/akmaier/agent-m/pull/122
date: 2026-10-06 21:16 UTC
---
# Development → Release testing: ITM-216

**REGISTER**

## Reason

ITM-216, pull request #122 by developer-opus-d, on head `a11fd12`, against the item as `main` holds it since `60b7de4`.
All five points hold:
- The first commit, `a9f3944`, holds only `tests/participant-list.test.mjs`, and CI was red on it: the test file could
  not load the module that did not exist yet.
- CI is green on the head, whose base is `sprint/05`'s tip.
- Only MOD-participant-list's folder — `index.mjs`, `eligibility.mjs`, `participants.schema.md`, read once in the form
  `tests/test_no_backend.py` allows — and the new test naming the module change.
- The 5 new tests have 7 counter-proofs.
- The Acceptance holds:
  - this instance's register read with `participantSchema`, with type, capabilities, place and model;
  - a type outside the five, and a participant based on a language model without its model, named by
    `documentFindings` under their requirements;
  - `eligible` offering for a role exactly the participants with every capability it needs.

The two further tests stay within the item: the schema read from the module's own file, and a need's places, which the
module file gives `eligible` and the first start decision gives this item. The developer's three gaps do not bear on
this item:
- No function turns a register row into a `Participant`. This is a change request on MOD-participant-list that ITM-218
  meets.
- The language cannot state the forms of `Name`, `Price` and `Route`.
- A person is left out against a restricted source's places. Callers ask places only of the types that drive jobs.

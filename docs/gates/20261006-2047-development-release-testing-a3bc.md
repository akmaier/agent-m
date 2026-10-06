---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 30209e358020e90b4aae33fbd9f7aa145444db72
  - https://github.com/akmaier/agent-m/pull/121
date: 2026-10-06 20:47 UTC
---
# Development → Release testing: ITM-227

**REGISTER**

## Reason

ITM-227, pull request #121 by developer-opus-c, on head `30209e3`, against the item as `main` holds it since `60b7de4`.
All five points hold:
- The first commit, `b9514e0`, holds only `tests/documents-findings.test.mjs`, and CI was red on it: of 651 tests, exactly
  the 15 new ones failed.
- CI is green on the head, whose base is `sprint/05`'s tip.
- Only MOD-documents' folder — `checks.mjs`, `schema-language.mjs`, `index.mjs` — and the new test naming the module
  change.
- The 15 new tests have 15 counter-proofs.
- The Acceptance holds:
  - each kind of finding with its line, in the one text form;
  - the rule a finding names, condition, variant, value specification, section, schema, each with the closer rule
    present and absent;
  - `loadSchema` reading the rules and refusing one that is no requirement's name in capitals.

The developer's four gaps do not bear on this item: the callers' schemas use no section fields and no `lines` records.
Key lines are counted for front matter as `writeDocument` writes it. A schema without a rule breaks the accepted
language. A form's new rows concern ITM-221.

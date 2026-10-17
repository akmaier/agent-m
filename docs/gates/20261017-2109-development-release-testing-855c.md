---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - fcddabd246b80d0882d83ae6ad81ff9b127a9f75
  - https://github.com/akmaier/agent-m/pull/775
date: 2026-10-17 21:09 UTC
---
# Development → Release testing: ITM-838

**REGISTER**

## Reason

ITM-838, MOD-personal-data's `checkersFor` and `namedPersonFindings`: pull request #775 into `sprint/team2/79`, the
reworked head `fcddabd`, decided on the condition of the rejection on `07a897e`
(`docs/gates/20261017-2105-development-release-testing-8a0d.md`).

The condition now holds. Replayed at the failure node with a collaborators file read by MOD-documents' `readDocument`
and `collaborators.schema.md`: "Ada Example wrote." gives one finding on line 1 with Agreed `no` and with Agreed
empty, none with Agreed `yes`; the same replay against `07a897e`'s `consent.mjs` gives none for `no` and empty, so
the replay sees the fault. `yes` is what an agreement is: the schema's Agreed is the enum `["yes"]`, and
MOD-personal-data says *Agreed* (`yes`). The new TST-838013 names `A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT` and
MOD-personal-data; its counter-proof, the Agreed filter replaced by `true`, replayed: red. The rework changes only
`src/personal-data/consent.mjs` (the filter and its doc comment) and appends TST-838013 to the item's own new test
file. 65 tests of MOD-personal-data and the collaborators release test pass on the head; CI run 39069498736 is green on
it, all ten jobs. The other checks hold as recorded at the rejection.

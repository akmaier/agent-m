---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 21665c2a5ae2972f529360670c0502f2e8ec5632
  - https://github.com/akmaier/agent-m/pull/446
date: 2026-10-12 19:52 UTC
---
# Development → Release testing: ITM-350, the library, and registering a source

**REGISTER**

## Reason

ITM-350, pull request #446 by developer-sonnet-a into `sprint/team1/22`, selected anew (`4b9b1ed`), head `21665c2`,
resumed from #431's branch with `sprint/team1/22` and ITM-458 merged in. The condition its earlier rejection named
(`a9ff1110`) holds: the form of the common fields is MOD-site-frame's `schemaForm` over the entry's schema
(`library.mjs`: `schemaForm(ENTRY, draft, { onSave, extraChecks })`), the page's own checks handed in as
`extraChecks`, which `schemaForm`'s interface offers, and the schema's rule named in the findings since ITM-458.

The test commit `fb3a337` was red on two tests of `tests/settings-pages-library.test.mjs` alone (run 38299672213), and
`21665c2` is green (run 38299999191, 2098 tests, 0 failures). The two tests it changes, the Save helper and one
wording, are tests of that file, which ITM-350 itself began (`a07e29e`) and which the sprint branch does not hold: no
existing test of another item changes. Against `sprint/team1/22` only `src/settings-pages/` and that file differ.
46 faults are recorded, H1 to H4 new, F44 to F46 dropped where `documentFindings` now gives their checks. What the
rejection read besides stands.

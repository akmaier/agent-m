---
id: ITM-1143
title: A resource list whose table carries a participant's columns is rejected
level: module
realises:
  - A RESOURCE IS USED, A PARTICIPANT DEVELOPS
modules:
  - MOD-resource-list
builds_on:
  - ITM-1130
tests:
  - unit
origin:
  - developer-sonnet-f's tests/test_resources.py (ITM-1130, pull request #1174, head fe4b41fa), TST-1130013
---
# ITM-1143 A resource list whose table carries a participant's columns is rejected

**REGISTER**

## Outcome

SPEC.md:2197-2200: "Whatever does work on the product's artifacts is declared as a participant, never as a resource.
*Check:* `tests/test_resources.py` — a resource entry carrying participant fields (capabilities, role) is rejected".
TST-1130013 shows that a `docs/resources.md` whose table has the columns Capabilities and Role, with an agent that fills
them, is accepted. `documentFindings` reports no unknown column, and the list's readers (`resourceOf`, in
`src/resource-list/strategies.mjs` and `src/settings-pages/resources.mjs`) build a Resource from the ten named columns
only. So `resourceFindings`, which refuses an entry that carries them, never sees them.

Read first where the list's columns are judged: in the schema (MOD-documents, MOD-resource-list's Data) or in
`resourceFindings`. Build it in the accepted text's place. If no accepted text names an unknown column, stop and name
the gap.

## Acceptance

- TST-1130013 passes, and its `@unittest.expectedFailure` is removed by a participant other than this item's implementer.
  Counter-proof: the same list without the two columns is accepted.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

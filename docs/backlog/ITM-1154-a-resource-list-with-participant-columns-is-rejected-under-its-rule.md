---
id: ITM-1154
title: A resource list with a participant's columns is rejected under A RESOURCE IS USED, A PARTICIPANT DEVELOPS
level: module
realises:
  - A RESOURCE IS USED, A PARTICIPANT DEVELOPS
modules:
  - MOD-resource-list
builds_on:
  - ITM-1143
tests:
  - unit
origin:
  - ITM-1143's gate on pull request #1200 (sprint team1/97), from developer-sonnet-c's finding
---
# ITM-1154 A resource list with a participant's columns is rejected under A RESOURCE IS USED, A PARTICIPANT DEVELOPS

**REGISTER**

## Outcome

SPEC.md:2197-2200: a resource entry carrying participant fields (capabilities, role) is rejected. Since ITM-1143,
`documentFindings` rejects a `docs/resources.md` whose table adds the columns Capabilities and Role, but under the
schema's rule, A PRODUCT DECLARES ITS RESOURCES (`src/resource-list/resources.schema.md:23`). TST-1130013
(`tests/test_resources.py:167-177`) judges the list by A RESOURCE IS USED, A PARTICIPANT DEVELOPS, and is still marked
`@unittest.expectedFailure`.

**First task:** read where the rule of a finding on the list's columns comes from in MOD-resource-list's text. A
schema's `rule` would also become the rule that every cell finding of Name, Address and Route falls back to. Where the
text gives no place for the finding of a participant's columns, the item stops for a draft.

## Acceptance

- TST-1130013 passes, and its `@unittest.expectedFailure` is removed by a participant other than this item's
  implementer. Counter-proof: the same list without the two columns is accepted.
- No other finding of the resource list changes its rule.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

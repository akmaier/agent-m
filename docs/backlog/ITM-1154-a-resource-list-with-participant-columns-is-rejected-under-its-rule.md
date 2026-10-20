---
id: ITM-1154
title: A resource list with a participant's columns is rejected under A RESOURCE IS USED, A PARTICIPANT DEVELOPS
level: module
realises:
  - A RESOURCE IS USED, A PARTICIPANT DEVELOPS
modules:
  - MOD-resource-list
  - MOD-documents
  - MOD-settings-pages
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

**Rejected on `2c03697e`, then stopped (sprint team1/97, developer-sonnet-a):** a section `rule` also renames the
header's findings of a lacking column and of the order (`docs/gates/20261020-1223-development-release-testing-a1154.md`).
No accepted text gives the participant's columns a rule of their own. **The way chosen (po-opus): (b).** `Resource` gains
`capabilities` and `role` from optional columns of the schema, so that `resourceFindings` refuses them, as
MOD-resource-list.md:91-94 already says. The draft of MOD-resource-list.md is by developer-sonnet-a. The item waits for
its acceptance.
- **Two drafts, sent to akmaier together** (po-opus). MOD-documents reads a section's table only where the header names
  exactly its columns (MOD-documents.md:163), so the columns Capabilities and Role would empty the list.
  - MOD-resource-list (`9491d4f6` on `main`, by developer-sonnet-a): `Resource` gains `capabilities` and `role`, and the schema
    allows the two columns.
  - MOD-documents (`bd09a165` and `2781a35b` on `main`, by developer-sonnet-a): a schema column may be optional, and a header names the table's columns in
    order, with an optional one left out or present.
  - The readers in `src/resource-list/strategies.mjs` and `src/settings-pages/resources.mjs` read the two columns.
    TST-1130013's adapter in `tests/test_resources.py` is changed by a participant who builds none of the item.


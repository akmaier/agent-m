---
id: ITM-1143
title: A register whose table's header does not name exactly its schema's columns is named, not read as empty
level: module
realises:
  - A RESOURCE IS USED, A PARTICIPANT DEVELOPS
modules:
  - MOD-documents
builds_on:
  - ITM-1130
tests:
  - unit
origin:
  - developer-sonnet-f's tests/test_resources.py (ITM-1130, pull request #1174, head fe4b41fa), TST-1130013
---
# ITM-1143 A register whose table's header does not name exactly its schema's columns is named, not read as empty

**REGISTER**

## Outcome

SPEC.md:2197-2200: "Whatever does work on the product's artifacts is declared as a participant, never as a resource.
*Check:* `tests/test_resources.py` — a resource entry carrying participant fields (capabilities, role) is rejected".
TST-1130013 shows that a `docs/resources.md` whose table has the columns Capabilities and Role, with an agent that fills
them, is accepted. `documentFindings` reports no unknown column, and the list's readers (`resourceOf`, in
`src/resource-list/strategies.mjs` and `src/settings-pages/resources.mjs`) build a Resource from the ten named columns
only. So `resourceFindings`, which refuses an entry that carries them, never sees them.

**h's stop (§6a.6), verified.** The cause is not the resource list. `readRegister` finds a section's table as "the first
table … whose header row names exactly the table's columns" (MOD-documents.md:163), so a table with one more column is no
table. The section reads as empty, and `documentFindings` names nothing. Any extra column, even "Notes", silently empties
any register: the participants register read 34 rows as it stands and 0 rows, with 0 findings, once a "Notes" column was
added.

## Not ready: a draft for akmaier

The draft is `7ae44f81`, on `main` and reviewed. `documentFindings` names such a table, with the columns its header adds,
lacks or puts out of order, for every schema. The item is built once an approval record names the draft's blob.

## Acceptance

- TST-1130013 passes, and its `@unittest.expectedFailure` is removed by a participant other than this item's implementer.
  Counter-proof: the same list without the two columns is accepted.
- A unit test of `documentFindings` names a participants register with a `Notes` column. Over every document on `main`,
  read with `readDocument`, the new finding fires on none.
- A row with more cells than its table has columns is checked to give a finding; if it does not, that is a new item.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

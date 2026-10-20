---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - bed5d28404d5ef449ae5895b52c7a2f0a23564b7
  - https://github.com/akmaier/agent-m/pull/1213
date: 2026-10-20 14:34 UTC
---
# Development → Release testing: ITM-1154, passed — a resource list with a participant's columns is refused under its rule

**REGISTER**

## Reason

ITM-1154 (MOD-resource-list, MOD-documents, MOD-settings-pages), pull request #1213 into `sprint/team1/98`, passes on
`bed5d284`. Its rejection on `2c03697e` (#1205) is answered by the accepted drafts `9491d4f6`, `bd09a165` and `2781a35b`.

- **The commits:**
  - `b4a45353` (developer-sonnet-a) holds only tests.
  - `4020ccbe` (developer-sonnet-a) is the code. It brings:
    - optional columns in MOD-documents, with `headerColumns` as the one reading rule;
    - the optional columns Capabilities and Role in the resource schema, under A RESOURCE IS USED, A PARTICIPANT
      DEVELOPS;
    - `Resource` with both fields, and both readers (`src/resource-list/strategies.mjs`,
      `src/settings-pages/resources.mjs`).
  - `aa3cc39b` (developer-sonnet-d, who built none of the item) changes only `tests/test_resources.py`. TST-1130013's
    adapter reads the two cells, and the test is no longer an expected failure, as the Acceptance asks.
  - `bed5d284` (developer-sonnet-d) merges `sprint/team1/98` at `d3d56c68`.
- **The merge's resolution in `src/documents/checks.mjs`** (`git show --cc`) keeps both items.
  - `sectionTable` finds the table by `headerColumns`, and returns the columns its header names.
  - ITM-1155's `overlongRows` counts the cells beyond those columns.
  - So a left-out optional column is not counted as a cell too many.
- **The red,** run 39430115127 on `b4a45353`, with `# cancelled 0` in each failing job:
  - job 118652649935: `# fail 6`, exactly tests 82 to 85 and 174 to 175;
  - job 118652650030: `# fail 1`, test 204 of `settings-pages-resources`.
- **The finding of the rejection is gone.** The probe `probe1154.mjs` at the head:
  - a header that lacks Secret, or holds the columns out of order, keeps A PRODUCT DECLARES ITS RESOURCES;
  - the cell findings keep their rules;
  - the added Capabilities is read, and `resourceFindings` refuses it under A RESOURCE IS USED, A PARTICIPANT DEVELOPS
    (tests 174 and 204, TST-1130013).
- **TST-1143004** now names Notes and Owner as added columns, since the accepted text makes Capabilities and Role
  optional ones. It is a unit test of MOD-documents.
- **The surviving mutant,** `resourceOf` in `src/resource-list/strategies.mjs` dropping the two fields, is kept as a
  finding without an item. No reader in that module uses them, and the item asks the reader to read them.
- **CI:** 23 of 23 checks passed on the head (run 39436986028).
- **Merge:** `git merge-tree --write-tree` onto `sprint/team1/98` (`01993d7e`, after #1214, #1215 and #1216) is clean.
- **Replayed in a clean worktree, with `sprint/team1/98` at `01993d7e` merged in,** the Bridge's packages installed as
  CI installs them, and a temporary folder of its own:
  - The 501 tests of `tests/documents*`, `tests/resource-list*` and `tests/settings-pages*` pass.
  - `tests/test_resources.py` is OK, with no expected failure.
  - The release tests that touch the three modules pass: 27 files with 221 tests, none failed.
  - Counter-proof: with the sprint branch's `src/documents/`, `src/resource-list/` and `src/settings-pages/`, eight
    tests fail.

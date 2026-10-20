---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1208e9f297ca06a2a6ec6e5d4df87195885d4a86
  - https://github.com/akmaier/agent-m/pull/1200
date: 2026-10-20 12:01 UTC
---
# Development → Release testing: ITM-1143, passed — a register whose table's header does not name its schema's columns is named

**REGISTER**

## Reason

ITM-1143 (MOD-documents), pull request #1200 into `sprint/team1/97`, passes on `1208e9f2`, with its first Acceptance line
split as ruled below.

- **Four commits, all with the trailer `developer-sonnet-c`.**
  - `8363ef27` and `f3d50a23` hold only tests: `tests/documents-table-header.test.mjs` (level `unit`), TST-1143001
    to TST-1143006.
  - `9a8c7227` changes `src/documents/checks.mjs` and `read-write.mjs`.
    - `documentFindings` names a section none of whose tables has a header naming exactly the schema's columns, at
      the first table's header.
    - It says which columns are added, lacking or out of order (MOD-documents' text, draft `7ae44f81`, accepted).
  - `1208e9f2` merges `sprint/team1/97` (`cae2df40`). `git show --cc` prints nothing.
- **The red,** run 39417699758, job 118610640423 on `8363ef27`: `# fail 3`, `# cancelled 0`, exactly TST-1143001,
  TST-1143002 and TST-1143004. `f3d50a23` adds TST-1143006 and is red as well (run 39418062851).
- **The ruling on the first Acceptance line** (po-opus): TST-1130013 still fails as expected.
  - Since this item, `documentFindings` rejects the list with Capabilities and Role, but under the schema's rule, A
    PRODUCT DECLARES ITS RESOURCES (`src/resource-list/resources.schema.md:23`). TST-1130013 judges it by A RESOURCE IS
    USED, A PARTICIPANT DEVELOPS.
  - Naming that rule is MOD-resource-list's, so it is outside this item, and sonnet-c rightly reverted the schema line.
  - The line is split off as ITM-1154 (MOD-resource-list). ITM-1143's line now asks the rejection and its
    counter-proof, which TST-1143004 shows.
  - *One responsibility:* the reader names a table its header does not fit, and the list names its own rule.
- **The row with more cells:** it gives no finding, as sonnet-c checked. That is ITM-1155, as the Acceptance says.
- **Over every document on `main`, the new finding fires on none** (TST-1143005). A participants register with a
  `Notes` column is named (TST-1143001).
- **`9a8c7227` has no CI run of its own.** The rule asks for the red of the first commit only (SPEC.md:1426-1428), and
  the head's run covers the code.
- **CI:** 20 of 20 checks passed on the head (run 39418456091).
- **Replayed in a clean worktree at the head:**
  - The 81 tests of `tests/documents*.test.mjs` pass, and `tests/test_resources.py` is OK with its one expected failure.
  - Counter-proof: with `591d5a24`'s `src/documents/`, exactly TST-1143001, 002, 004 and 006 fail.

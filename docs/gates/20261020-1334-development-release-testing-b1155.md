---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 621fb0cf13e2aa72fb9bdfdd366dfba93c67a21b
  - https://github.com/akmaier/agent-m/pull/1210
date: 2026-10-20 13:34 UTC
---
# Development → Release testing: ITM-1155, passed — a row with more cells than its table has columns is named

**REGISTER**

## Reason

ITM-1155 (MOD-documents), pull request #1210 into `sprint/team1/98`, passes on `621fb0cf`.

- **Three commits, one parent each, no merge, all with the trailer `developer-sonnet-c`.**
  - `eaf3a2fe` and `5506229e` hold only tests: `tests/documents-extra-cell.test.mjs` (level `unit`).
  - `621fb0cf` changes `src/documents/checks.mjs` and `read-write.mjs`. `documentFindings` names a row with cells beyond
    the last column, at its line, with and without a header row, as the accepted text says (`09e796d8`).
- **The red,** run 39429786189, job 118651515413 on `eaf3a2fe`: `# fail 3`, `# cancelled 0`, exactly TST-1155001,
  TST-1155002 and TST-1155004. `5506229e` is red as well, adding TST-1155006 (run 39430012809).
- **sonnet-c's readings are kept:**
  - an empty cell or a dash beyond the last column loses nothing;
  - an escaped `\|` is one cell;
  - a fenced line and the separator line are no rows.
- The finding fires on no document of the repository (TST-1155005).
- **CI:** 23 of 23 checks passed on the head (run 39430593795).
- **Merge:**
  - `git merge-tree --write-tree` with #1211's head is clean.
  - With ITM-1154's #1213 it conflicts in `src/documents/checks.mjs`, as both change it. The second of the two to be
    merged takes the sprint branch in first, and is gated on its merged head.
- **Replayed** together with #1211, as that record states. With the base's `src/documents/`, its four tests fail.

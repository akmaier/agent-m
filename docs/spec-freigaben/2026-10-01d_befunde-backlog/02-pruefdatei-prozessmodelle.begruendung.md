# §5: the check of a rule on where content may go names its module's test file

**Finding (backlog refinement, 2026-10-01).** ARC-016 decision 1 (accepted): "Every requirement whose check
names `tests/review-core.test.mjs` today moves with its code into a test file per module
(`tests/<module>.test.mjs`)". The SPEC still names `tests/review-core.test.mjs` for 43 requirements, 29 of
which belong to modules other than MOD-review-core; the backlog had to work around it with a folder
`tests/review-core.d/` (ITM-004, a stopgap by its own note, and `docs/backlog/order.md`, "Conventions").

**The change:** in each requirement below, the file in the `*Check:*` field becomes the test file of the one
module whose `realises` lists the rule (ARC-020 decision 5: each rule under one module); the text after the
file name is unchanged. The source keeps its original text and adds "changed 2026-10-01". Rule and occasion
are untouched. Requirements of MOD-review-core keep `tests/review-core.test.mjs`. The rest of the section is
carried over byte for byte.

| Requirement | Check before | Check after | Module (`realises`) | Backlog items quoting the old file |
|---|---|---|---|---|
| `RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS` | `tests/review-core.test.mjs` | `tests/job-harness.test.mjs` | MOD-job-harness | ITM-025 |

**Impact list, common to every check-field entry of this queue:** the checks themselves live today in
`tests/review-core.test.mjs`; moving them is the refactoring of ARC-016 (consequences: "part of the
refactoring job of ARC-003", expected results unchanged — `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
`.github/workflows/tests.yml` runs `node --test tests/*.test.mjs` and picks the new files up without a
change. `docs/backlog/order.md` ("Conventions": a check named as `tests/review-core.test.mjs` goes into
`tests/review-core.d/`) and ITM-004 (the folder as a stopgap) become unnecessary for these requirements once
the entry is accepted; both are registers and change with the next backlog refinement, as do the backlog
items in the table, which quote the old file. The Testing sections of MOD-git-host, MOD-settings-store and
MOD-bridge-tunnel named `tests/review-core.test.mjs` and are updated in the same commit as this queue (open for
review). No use case names these check files.

---
id: ITM-589
title: MOD-source-register gives affectedRequirements and changedPassages
level: module
realises:
  - UC-015
  - UC-016
modules:
  - MOD-source-register
builds_on:
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-589 MOD-source-register gives affectedRequirements and changedPassages

**REGISTER**

## Outcome

UC-015 2b: "lists the product's requirements that name this source before saving"; UC-016 step 4: "which passages changed". Both functions are in MOD-source-register's `provides:`, and neither has code.

**The readings, settled at sprint team1/54:**
- **`affectedRequirements(spec, source)`.**
  - `source` is a register entry's identifier. The requirements are those `parseSpec` (MOD-spec-document) reads, in the
    SPEC's order.
  - A source item names the source when it begins with that identifier, followed by the item's end or by `, ` and the
    part. This is the grammar `sourceFindings` reads (`src/source-register/index.mjs:270-277`), and the matcher is
    shared, not copied (nothing twice).
  - The signature carries no register entry, so a title or a designation is not matched.
- **`changedPassages(before, after)`** is MOD-text-tools' `lineDiff(before, after)` without its `same` lines.
- **No interface outside the Uses.** `MOD-spec-document.parseSpec`, `MOD-text-tools.lineDiff` and
  `MOD-text-tools.DiffLine` are in MOD-source-register's `uses:`.
- **Existing tests: none changes.** `git grep -E "affectedRequirements|changedPassages" -- src tests` finds nothing.
  The same grep for `sourceFindings` finds its tests, as the known positive.

## Acceptance

- `affectedRequirements(spec, source)` and `changedPassages(before, after)` work as the module file states them, each with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

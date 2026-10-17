---
id: ITM-578
title: A flagged candidate is split into entries of its own
level: module
realises:
  - UC-005
modules:
  - MOD-review-pages
builds_on:
  - ITM-361
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-578 A flagged candidate is split into entries of its own

**REGISTER**

## Outcome

UC-005 6a: "The author splits a flagged candidate. Each part becomes an entry of its own." ITM-361's Outcome names the split, but no code or test exists.

**The readings, settled at sprint team1/62's start:**
- **Flagged.** A candidate is flagged when a finding the loop left (`outcome.remaining`, shown at
  `src/review-pages/jobs.mjs:382`) names it as its `artifact`. A typical one is a rule that states two things
  (`ONE STATEMENT PER REQUIREMENT`).
- **The split.**
  - A flagged candidate offers *Split*. It adds a second candidate after it, with the same class, `of` and source
    passage, and its own name and rule fields for the person to fill. The first keeps what it had.
  - The split happens in the panel, and nothing is written until *Write proposals*.
- **Each part an entry.** *Write proposals* writes the draft as the person left it, through `editedResult` and the
  existing writer `queue-entries` of MOD-spec-changes. That writer already writes one entry per candidate per section.
  MOD-review-pages' Uses name the writer through `specStrategies`.
- **No rule of another module is followed.** The split is the panel's own, and the entries are the writer's.
- **The grep of what goes:** nothing goes.
- **Reachable through the real host.** The flag comes from a real loop's remaining findings.
- **Existing tests.** The panel's tests (`tests/review-pages-draft-requirements.test.mjs`) click no *Split*, which only a
  flagged candidate offers, so their expected results stay.

## Acceptance

- On the review panel, a flagged candidate is split into parts, and `queue-entries` writes each part as an entry of its own.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

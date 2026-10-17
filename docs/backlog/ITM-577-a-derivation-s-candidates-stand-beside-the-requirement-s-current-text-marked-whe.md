---
id: ITM-577
title: A derivation's candidates stand beside the requirement's current text, marked when they constrain the process
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
# ITM-577 A derivation's candidates stand beside the requirement's current text, marked when they constrain the process

**REGISTER**

## Outcome

UC-005 step 7: "each beside the existing requirement it refers to"; 5b: "It is marked as such"; 7b: "Every candidate is a duplicate. The panel says so". `candidateItem` (`src/review-pages/jobs.mjs:349`) shows only "Beside <name>.". `candidateRows` (`src/review-pages/candidates.mjs`) already renders the text for UC-019.

**The readings, settled at sprint team1/61's start:**
- **Nothing twice, inside the module.** `candidateRows`' rendering of the current requirement (`showCurrent`,
  `src/review-pages/candidates.mjs:55-61`) becomes a function of `candidates.mjs` of its own. Both pages call it:
  - `candidateRows`;
  - `candidateItem` of the derivation's panel (`src/review-pages/jobs.mjs:349`), in place of "Beside <name>.".

  The two pages are parts of one module, MOD-review-pages, so no other module's rule is followed.
- **The current text** comes from the SPEC of the panel's snapshot, read with MOD-spec-document's `parseSpec`, which
  MOD-review-pages' Uses name.
- **The mark.**
  - A candidate whose answer carries `constrains` is marked as constraining the process. The derivation's answer
    schema declares `constrains` (`src/job-catalogue/kinds/derive-requirements/answer.schema.json:18`).
  - When every candidate's class is `duplicate`, the panel says that writing only adds sources.
- **The grep of what goes.** The line "Beside <name>." (`class="refers-to"`) is found in no test: a grep of `tests`
  for `refers-to` finds none. The known positive is the same grep over `src/review-pages/jobs.mjs`, which finds it once.
- **Reachable through the real host.** The panel shows a derivation's draft from a real job's answer.
- **Existing tests.** None asserts the line that goes, so none changes. The UC-019 table plants faults in
  `src/review-pages/candidates.mjs`, so its developer runs the table on the base and on the head.

## Acceptance

- Each candidate shows the current text of the requirement it refers to, through the same part UC-019's page uses (nothing twice).
- A candidate that constrains the process is marked.
- When every candidate is a duplicate, the panel says that writing only adds sources.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

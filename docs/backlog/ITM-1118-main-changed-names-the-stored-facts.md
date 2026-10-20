---
id: ITM-1118
title: onMainChanged names the stored facts in its summary and its workflow
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-1117
tests:
  - unit
origin:
  - akmaier's request of 2026-10-19, measured in docs/measurements/2026-10-19_main-pages-load-work.md
---
# ITM-1118 onMainChanged names the stored facts in its summary and its workflow

**REGISTER**

## Outcome

The summary of `onMainChanged` (`src/workflow-entries/instance.mjs`) and the header of `.github/workflows/main-changed.yml`
name the facts that `publishOverview` now stores beside the overview. The entry runs within the job's two minutes.

## Not ready: a draft for akmaier

The draft is 9a2c9f4a. Build this item only once an approval record names the draft's blob of
`docs/architecture/MOD-workflow-entries.md`.

## Acceptance

- A run of `onMainChanged` on a fake host leaves `<commit>.json` and `<commit>.facts.json` on `overview-cache`, and its
  summary names both. Counter-proof: a branch that holds both already ends with `nothing to do` for them.

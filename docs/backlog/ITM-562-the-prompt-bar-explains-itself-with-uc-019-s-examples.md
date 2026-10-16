---
id: ITM-562
title: The prompt bar's explanation gives UC-019's examples of an instruction
level: module
realises:
  - UC-019
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
  - ITM-530
  - ITM-514
tests:
  - unit
origin:
  - ITM-514's finding S15 (TST-377116), gate docs/gates/20261016-1655-development-release-testing-70c2.md
---
# ITM-562 The prompt bar's explanation gives UC-019's examples of an instruction

**REGISTER**

## Outcome

The topic `prompt-bar` of `src/site-frame/explanations.md` gives the examples of an instruction that UC-019 step 1
names. Today they stand only in the topic `change-instruction`, which belonged to the old prompt pages that ITM-551
removes.
- The examples move rather than being copied (AGENTS.md §2, "Nothing twice").
- `change-instruction` goes where nothing shows it any more.

ITM-514's todo test TST-377116 then passes.

## Acceptance

- **The examples.** The topic `prompt-bar` holds UC-019 step 1's examples, as the todo test states them.
- **One place.** No other topic repeats them.
- **Counter-proof.** A planted removal fails the test.

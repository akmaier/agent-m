---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d84c73680b4f9cad1b582ec350b62e2444d1a894
  - https://github.com/akmaier/agent-m/pull/624
date: 2026-10-16 19:52 UTC
---
# Development → Release testing: ITM-564, A change kind takes the conversation's draft as it stands

**REGISTER**

## Reason

ITM-564, pull request #624 into `sprint/team1/51`, at head `d84c7368`. developer-sonnet-c wrote it, as `51.md` assigns.
It lists AGENTS.md, SPEC.md, the item, `51.md`, MOD-job-catalogue, MOD-job-runner and chapters 9, 11, 12 and 13 as read
in full.

1. **The tests-only commits are red.** The tests came in two tests-only commits.
   - `707f8647` failed TST-564003 on a stand-in of its own test, not on behaviour. `e617f448` mends the stand-in.
   - Run 38957487469 on `e617f448` fails exactly TST-472283 and TST-472284 on node (0), and TST-564001–003 on node (4).
     TST-564003 fails on behaviour: it expected a part `draft` and got none.

   The listing of `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38957874358. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module.** Only data of MOD-job-catalogue changes:
   - the three change kinds' `kind.md`, which name `draft?` right after `conversation`;
   - their `prompt.md`, which gain a section *The draft as it stands* holding `{{draft}}` after the conversation.

   The recipe is MOD-job-runner's registered `draft` (`src/job-runner/builtins.mjs:140`), and no code changes.
   TST-476059 holds. ITM-018 passes. The UC-019 files that fail locally fail on Node 26's known cycle (ITM-566), as on
   the base, and pass in CI.
4. **Each fault is caught.**
   - Without `draft?`, all five fail.
   - Without the place `{{draft}}`, TST-472284 and TST-564002 fail.
   - `draft` without `?` fails TST-472283 and TST-564001.
5. **The Acceptance holds.** Each of the three kinds' prompts holds the draft where one is handed. Where none is handed,
   it holds `(none)`, as a `DriverInput` writes an empty place, and `prepareJob` gives no part `draft` and leaves nothing
   out.

**TST-472284's change** is taken. The item named it as changing. It compared each prompt's places with the kind's own
recipes, read from the same files, so a missing place could not make it red. The developer added a stated list of the
kinds whose prompt holds `{{draft}}`:
- the three change kinds;
- `review-architecture`, `write-tests` and `check-for-persons`, as they stand.

This states the expected result in the test's own text, which is what `A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A
DOCUMENT` asks.

The section's wording, which the texts leave open, follows ITM-529's pattern for `instruction?`.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - de1dacff7e88f2ae10a8113fa9339fc1edfe9270
  - https://github.com/akmaier/agent-m/pull/570
date: 2026-10-16 11:33 UTC
---
# Development → Release testing: ITM-486, The runner offers a kind's tools to its drafter and carries out their calls

**REGISTER**

## Reason

ITM-486, pull request #570 into `sprint/team1/40`, at head `de1dacff`. developer-sonnet-c made both commits. It lists
AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `40.md`, UC-049, MOD-job-runner and MOD-job-catalogue as read in
full.

1. **The red commit.** The tests-only commit `b505823d` was pushed alone, and CI was red on it: run 38893738068, with 17
   failures, exactly the 17 tests of `tests/job-runner-tools.test.mjs`.
   - The implementation commit changes one allowed path in that test's counter-proof, `docs/backlog/ITM-009-allowed.md`
     to `docs/notes/allowed.md`, since an item's path is judged by the document schema.
   - That changes how the test prepares its fixture, not what it expects.
2. **CI is green on the head**: ten of ten jobs, run 38894324903. Locally:
   - 552 node tests across MOD-job-runner and its callers pass, with the release and system tests of UC-010, UC-019 and
     UC-022;
   - 32 Python tests pass.
3. **The changes stay in the item's scope.**
   - `src/job-runner/tools.mjs` is new, and `loop.mjs`, `registry.mjs` and `index.mjs` changed — all the item's module.
   - The new test file names MOD-job-runner. No existing test changed.
4. **The new tests.** TST-486001 to TST-486017 state their values in their own text. Sixteen planted-fault counter-proofs
   are recorded in #570.
5. **The Acceptance holds, with the values the start decision named.**
   - Only a `model endpoint` declaring *use tools* gets the kind's tools, less undeclared capabilities and `refuses`, with
     the kind's `toolLimit`.
   - Arguments are checked with `misfit`.
   - The reading tools answer at the commit read and refuse a restricted path.
   - `propose-edit` holds edits below `docs/` and refuses the named paths.
   - `hand-over` holds `{ kind, works_on, task }`.
   - Reviewers get `tools: null`, and nothing is written by any tool.

Noted for the retrospective, as the Scrum Master names them:
- one temporary file was written outside the scratchpad and deleted after use;
- a scratch script named two Python modules that do not exist.

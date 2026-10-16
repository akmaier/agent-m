---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 5c8a7a54e5ab24efa51e755db4bb009325a6b487
  - https://github.com/akmaier/agent-m/pull/621
date: 2026-10-16 19:23 UTC
---
# Development → Release testing: ITM-505, A hand-over is shown, queued on the person's click and followed

**REGISTER**

## Reason

ITM-505, pull request #621 into `sprint/team1/50`, at head `5c8a7a54`. developer-sonnet-b wrote it, as `50.md` assigns.
It lists the following as read in full: AGENTS.md, SPEC.md, the item, `50.md`, MOD-prompt-bar, MOD-runtimes,
MOD-work-plans, MOD-progress-measures, MOD-product-process, UC-049 and chapters 9, 11, 12 and 13.

1. **The tests-only commit is red.** `95090d83` was pushed alone. Run 38953688735 failed on it:
   - TST-505001–017 on node (0);
   - the changed TST-600030 on node (3).

   The listing of `/private/tmp/claude-501/` was the same before and after the work, and scratch files were written
   only with the shell.
2. **CI is green on the head**: run 38953994434, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module.** `src/prompt-bar/` (`bar`, `follow`, `hand-over`, `index`, `send`) and its
   tests. TST-600030 changes as `50.md` names it.
   - Under a `fetch` spy, 268 tests send nothing, and the spy was proven against a known positive.
   - ITM-018 passes.
   - The Node 26 failures are as on the base (ITM-566).
   - UC-019's release tests first run on Linux in the sprint's pull request into `main`.
4. **The tests state their values, and each fault is caught.** TST-505001–017 cover:
   - the proposal;
   - each refusal: sprint, use case, an item built on, role, the limit of work in progress, gate, and route;
   - a script's click, and the person's click;
   - the task's words reaching only the hand-over;
   - following on CI and on a Bridge, with a fake clock: nothing is read at 14,999 ms, and one read follows 1 ms later;
   - *Stop*, resuming on the next page, and recording.

   Ten planted faults are each caught. TST-377013 stays `todo`.
5. **The Acceptance holds.** A hand-over refused for each reason names it and queues nothing. An allowed one is queued
   on the click only, followed to its end, and cancelled by *Stop*.

The readings in the pull request are within the item:
- the role assignment and the sprint are those `facts.held` names, else `null`; without sprints, the product's one
  role assignment;
- an entry of `works_on` that `plan.states` does not list has no start rule;
- the participant is the one the message went to;
- the route is the first offer that is not the tab and is available;
- *Hand over* appears only where no reason holds and a route exists;
- the task is no job parameter.

## Taken up outside this gate

- **Two uses and two parts that the module file does not name.** `hand-over.mjs` imports MOD-job-ledger's `newJobId`
  and builds a `JobStart`, which MOD-prompt-bar's uses do not list. Its new parts `hand-over.mjs` and `follow.mjs` are
  not in its Parts.
  - A draft of MOD-prompt-bar for akmaier adds both uses and both parts. It follows the pattern of the accepted
    `settingsOf` use and of the drafts for MOD-trace-pages and MOD-review-pages.
  - The alternative, building the identifier without `newJobId`, would copy the job ledger's format.
- **The main hand-over kind fails in production.** `implement`'s recipe `implementation-inputs` belongs to
  MOD-run-planner's `runStrategies`, and nothing registers it. `git grep implementation-inputs` in `src/` finds only the
  job catalogue's `kind.md` and `prompt.md` files, and `src/run-planner/` does not exist.
  - So a hand-over of `implement` is refused at the click with `UnknownStrategy`, shown by name. Until that recipe is
    built, ITM-505 works for kinds whose recipes are built.
  - ITM-568 registers the recipe.

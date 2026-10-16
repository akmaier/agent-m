---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f8df914b11435c95bbd71825f3e3ced7222c9e05
  - https://github.com/akmaier/agent-m/pull/602
date: 2026-10-16 16:19 UTC
---
# Development → Release testing: ITM-507, The review pages show the conversation's draft

**REGISTER**

## Reason

ITM-507, pull request #602 into `sprint/team1/47`, at head `f8df914b`. developer-sonnet-c wrote it, as `47.md` assigns.
It lists the following as read in full: AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `47.md`,
MOD-review-pages, MOD-prompt-bar, MOD-site-frame, UC-049 and UC-019.
- Its first report read chapter 12 through `cut -c1-1500`. The Scrum Master sent it back, and it was read in full and the
  pull request checked against it, with no change.

1. **The tests-only commit is red.** `2061f3ce` was pushed alone. Run 38928960921 failed on it:
   - TST-472605, the changed list of route names, on node (0);
   - TST-507020–037, the page of the draft, on node (1);
   - TST-507001–008 and 010, the subjects, on node (5).

   TST-507009, which checks that the old prompt routes stay, passes on the base, as the cut intends. The uncommitted stub
   run fails 26 tests on behaviour. After the red, the developer changed its own new TST-507005 (a SPEC entry's
   `version`), which had already been red on the base.

   The listing of `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38930346938. GitHub reports the pull request mergeable, also after #601 was merged
   into the sprint branch (`git merge-tree` gives no conflict).
3. **The changes stay in the item's module.** `src/review-pages/` (MOD-review-pages) and its tests.
   - Of the existing tests, only TST-472605 changes, as the item names. UC-019's system and release tests are untouched.
   - The shared code of the old prompt pages was moved, not copied.
   - `accountOf` now stands once in `common.mjs`, which `requirements-prompt.mjs` imports, so there is no third copy.
   - Every test runs under a refusing `fetch` spy, and none reached the network. The whole suite fails as on the base.
4. **The tests state their values, and each fault is caught.** Seven planted faults are each caught. The item's own tests
   pass 87 of 87, and the old prompt tests 55 of 55.
5. **The Acceptance holds, except for two parts that need a text change**, and both are cut here:
   - **The impact list.** The route shows an architecture file with its rounds and its due diligence, but no impact
     list. MOD-trace-graph's `architectureImpact` is not built (`src/trace-graph/index.mjs`: "architectureImpact … not
     built yet"). The grep of sprint 45's agreement at this item's start did not include it, and that miss is the
     Product Owner's. ITM-554 (MOD-trace-graph) and ITM-556 (the list on `draft`) are registered.
   - **Dropping the draft.** *Save* and *Discard* leave the draft in the tab. No interface drops it:
     `writeTabValue` is not among MOD-review-pages' uses, and MOD-prompt-bar provides only `latestDraft`. A draft adds
     `dropDraft` to MOD-prompt-bar for akmaier's acceptance, and ITM-555 builds it.

   Each part that the accepted texts allow holds: each kind of draft is shown against the current text and saved as
   stated, a save on a moved text is refused with the edit kept, and each route's subject is as stated.

The readings in the pull request are within the texts:
- the draft route is `draft/subject=<key>`, since `go(draftRoute)` takes no parameters;
- `version` is the blob of the file or of the SPEC section;
- a missing source of the person is `NoPersonSource` (UC-019 4b);
- an undecided conflict is not saved;
- the other routes give `converse`;
- a `converse` file is saved only when its owner's schema finds no error.

## Taken up with drafts for akmaier, not holding this pull request

- **The parts.** MOD-review-pages' Parts give `flow.mjs` the draft of a conversation and the subjects. The pull request
  puts them in five new files, each with one responsibility. Five existing files are not named either (`common.mjs`,
  `file-edit.mjs`, `edit.mjs`, `entry-edit.mjs`, `spec-entries.mjs`). A draft lists them all, as was done for
  MOD-trace-pages (`69516b63`). `prompt.mjs` and `requirements-prompt.mjs` stay unnamed, since ITM-551 removes them.
- **A copy of the frame's default subject.** The review pages keep a copy of the frame's default subject for the routes
  that give `converse`, because a route cannot give no subject for some of its parameters. A draft of MOD-site-frame lets
  a route's `subject` give `null` for the frame's default, and ITM-555 removes the copy.
- **Two-line repetitions with `prompt.mjs`.** These go with ITM-551.

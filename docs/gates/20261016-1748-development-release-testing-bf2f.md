---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 65a55cd4735a74cf344fc3bb497b985463d89821
  - https://github.com/akmaier/agent-m/pull/611
date: 2026-10-16 17:48 UTC
---
# Development → Release testing: ITM-551, The old prompt routes and Change by prompt are removed

**REGISTER**

## Reason

ITM-551, pull request #611 into `sprint/team1/48`, at head `65a55cd4`. developer-sonnet-c wrote it, as `48.md` assigns.

**The old routes leave code behind that nothing reads any more.** The Outcome is that "the review pages lose the routes",
and these are their remains. Checked on the head with `git grep`:
- **`refineOnTab`** (`src/review-pages/jobs.mjs:208–210`) has no caller in `src/` or `tests/`. Its only caller was
  `requirements-prompt.mjs:117`, which this item removes.
- **`params.prompt`** in `factsOf` (`src/review-pages/subjects.mjs:75`) is never set now.
- **The descriptors' `prompt:` keys** (`src/review-pages/kinds.mjs:19`, `:41`) are not read in `src/review-pages/`. The
  same grep on the sprint branch finds their readers at `flow.mjs:118` and `:126`, as the known positive.
- **The descriptors' `instruction: "change-instruction"` keys** (`kinds.mjs:19`, `:38`) were read only by the removed
  `prompt.mjs:28`. ITM-562 removes the topic they name, and would leave them pointing at nothing.

Leaving them would keep dead code (KISS), and would make ITM-562 reach into MOD-review-pages. The item now names them,
and the developer removes them as a new commit on this pull request. The change is a removal, so the existing red stands
for it. A planted fault that brings `refineOnTab` back with no caller is no test. The developer instead shows with
`git grep`, with a known positive taken before the removal, that none of the four remains.

**The other checks hold on this head and carry over:**
1. **Red first.** The tests-only commit `f7e0ee02` was pushed alone. Run 38940776723 failed exactly:
   - TST-399001–003 on node (3);
   - the changed TST-507009 on node (6);
   - TST-551001–003 on node (2).
2. **CI is green** on `65a55cd4`, in run 38942207826.
3. **Scope.** MOD-review-pages and MOD-trace-pages, their tests, and three header comments.
   - TST-507009 ("the old prompt routes stay") and TST-507008's `prompt=1` case change, although the item did not name
     them. They asserted that the routes exist, which the Outcome removes, so they are taken as this item's; the item
     now names them.
   - UC-019's system and release tests: 112 pass, 0 fail and 10 todo, before and after, with no old route in them.
   - ITM-018 passes before and after, and the whole suite fails as on the base.
4. **Counter-proofs.** Four planted faults are each caught: the link back, a button on a requirement, a button on a
   group, and an empty `prompt.mjs`.

**The developer's reading of the grep** is taken. The item's "`git grep` for `/prompt` in `src/` finds nothing" cannot
hold literally, because `../prompt-bar/` imports and `job-catalogue/index.mjs:112`'s `./${folder}/prompt.md` contain it.
So it is read as the routes: `git grep -P "/prompt(?!-bar)" src` finds only that line of the job catalogue.

`docs/tests/counter-proofs/TST-398*.md` are dated records and stay as they are.

# 11. Architecture and implementation: an implementation job changes only its code

**The change.** In `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`, "tests that name one of those modules" becomes "tests,
test helpers". A job's code changes stay in its modules' folders and in the files its modules' files name as taken over;
the tests and test helpers it changes are not limited. The name of the requirement stays. The rest of the section is as it
stands.

**Why.** akmaier, 2026-11-01: "I think you are overregulating this. Do we really need this?", then "Make sure that we are
not overregulating things." and "A overly complex rule is an indication for a mistake in another part of the rule set."

- The rule holds two limits. The limit on code is needed: `A BACKLOG ITEM NAMES THE MODULES IT CHANGES`, `SPRINTS OF
  DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES` and `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` rest on a
  job's code staying in its modules.
- The limit on tests rests on an assumption no rule makes true: that a test depends only on the module its header names.
  A test names "the module it exercises" (`EVERY ARTIFACT NAMES ITS ORIGIN`) to trace it, not to fence it. A component or
  system test runs the code of the modules it names and of the modules they use; a test fakes another module's interface
  in its own file; a test counts the requests a page sends, whichever module sends them. Such a test moves when a module it
  does not name changes, and then no job may change it. Sprint 140 met this with ITM-1291: a MOD-site-frame test whose fake
  host lacks `readFileAt`, and a count of batches that goes from 1 to 2. ITM-614 meets it with a known positive of two
  MOD-site-frame tests that names a strategy MOD-work-plans now hands.
- The limit on tests protects nothing that another rule does not already protect: CI runs every test (`A PULL REQUEST IS
  MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS`), the gate reads every changed file, a refactoring changes no expected
  result (`A REFACTORING JOB CHANGES NO EXPECTED RESULT`), and a test that belongs to no module is still changed only by
  the job its module's file names (`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT`).
- Its check, `tests/test_implementation_job.py` through MOD-product-process' `doneCheck`, already checks code files alone:
  it reports a code file outside the job's modules' folders and passes over test files. It stays as it is.

**Alternatives.**
- Keep the rule and give a job the modules of every test it moves, as sprint 136 gave ITM-1261 MOD-site-frame for a
  generated file. The item then claims modules whose code it does not change, and other teams' sprints cannot hold them.
- Add a rule on what a test may fake or count, so that a test moves with its own module only. That adds a rule where one
  can be loosened, and component and system tests still run other modules' code.
- Remove the requirement. Its limit on code would go with it, which the three requirements above need.

**Design principles** (AGENTS.md §2):
- One responsibility per rule: the rule bounds where a job writes code; what a test asserts is bound by §12 and by
  `A REFACTORING JOB CHANGES NO EXPECTED RESULT`.
- Nothing twice: CI, the gate and the refactoring rule already guard other modules' tests; the second guard goes.
- Nothing the SPEC already says: no requirement is added.
- Adding one of a kind changes nothing of another kind: a new module, or a new test of one, changes no other job's scope.
- No special first case: every test is treated alike, whichever module its header names.

**Impact list.**
- `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`: changed. Named by `THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`
  ("it changes only the job's modules", read through this rule; unchanged), ARC-042 and `docs/groups/requirements.md`
  (by name; unchanged), `tests/test_implementation_job.py` with its `.md` and `src/product-process/done.mjs` (unchanged:
  their case of this rule changes a code file), `docs/instructions/developers.md` and `docs/instructions/product-owner.md`
  (each restates the old limit on tests; on this branch they name the rule instead of restating it), and the backlog items
  that quote the old clause (ITM-526, 614, 809, 1291, 1325 and 1332; registers, unchanged).

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).

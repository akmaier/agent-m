---
gate: Release testing → Sprint review
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 577382e50e71ebb933c26b3580e657b628f303ef
  - https://github.com/akmaier/agent-m/pull/881
date: 2026-10-18 10:21 UTC
---
# Release testing → Sprint review: sprint team2/90

**REGISTER**

## Reason

Sprint team2/90 was ended on `sprint/team2/90` at `577382e5` (`3bdb784b`) and closed (`43b522c4`). Eight of nine items
are done. Each merge's second parent is the head its gate passed:
- ITM-888 #872 (`5afa9296`, `7e8eb0e9`); ITM-889 #871 (`3961f10c`, `7b7e0890`); ITM-653 #875 (`79ac2cba`, `f7567bc7`);
- ITM-785 #877 (`53fa403d`, `fecb52c6`); ITM-909 #879 (`c8501174`, `29b1cc46`, after the rejection `2178c9f9` on
  `6eb31763` in #873, which was closed); ITM-799 #878 (`9a177701`, `be1a3c5f`);
- ITM-756 #876 (`7504fe93`, `0b7990df`); ITM-912 #880 (`3ff0a1cb`, `24d1702c`).

ITM-906 (#874) is not done. It was rejected twice and goes into the next sprint.

**The release tests.** Run 39118464040, on #881 at `577382e5`, checks out "Merge 577382e5… into 43b522c4…". It runs
every level (mode=all) and passes all twelve jobs. The longest job, python (2), takes 75 s, under the two-minute limit
(agreement 80).
- The eight node jobs end with `# fail 0`: 4405 tests, 4393 pass, 12 todo.
- The four Python jobs end with `OK`: 524 tests (5 skipped, 5 expected failures).
- `ok 169 - TST-320321902` passes there on Node 22.

**Agreement 83, widened.** I checked out `577382e5` and ran `npm install --prefix src/bridge-build --omit=dev
--ignore-scripts` with `LC_ALL=C`. After the install, `git status` is clean, so ITM-912's rule holds on the head.
- **The selection.** I took the 38 of 88 release files that reach one of the 21 changed files, by transitive relative
  imports, `new URL(…, import.meta.url)` or a path literal. I also took the files that list a tree (`git ls-files`,
  `readdirSync`, `os.walk`).
- **The known positive.** `tests/release-sprint-02-d-traceability.test.mjs` is selected for its tree listing, though it
  imports no changed file.
- **30 node files:** 184 tests, 178 pass, 1 fail, 5 todo.
  - The failure is TST-320321902 (`tests/release-itm-320-321-agent-processes.test.mjs`).
  - It fails the same way on `main` at `43b522c4` on this Node 25.9, as noted at #870.
  - Neither the test nor `src/agent-processes/` changed in the sprint.
- **`tests/release-sprint-02-d-traceability.test.mjs` alone:** 8 of 8 pass.
- **8 Python files** (`test_bridge_mail`, `test_catalogue_is_data`, `test_definition_of_done`, `test_implementation_job`,
  `test_no_history`, `test_release_sprint_02_c`, `test_release_sprint_02_d`, `test_settings_disclosure`): 36 tests, OK
  (2 skipped).

**No installed packages in the history.** `git log --stat origin/main..577382e5 -- src/bridge-build/node_modules` prints
nothing. The known positive: `git log --all` on the same path finds #873's `3f40f2dc` and `6c99402e`, and neither is an
ancestor of `577382e5`.

Since `43b522c4`, `main` (`1f0e1ef0`) changed only `docs/backlog/sprints/team2/91.md`. Since the merge base `b23ceeac`,
nothing under `src/`, `tests/` or `.github/` changed. So the run stands for the merge into today's `main` at `1f0e1ef0`.

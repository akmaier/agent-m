---
gate: Release testing → Sprint review
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 7150229e8c7fede3cdb7942e2e2b696fefb0fee0
  - https://github.com/akmaier/agent-m/pull/870
date: 2026-10-18 09:19 UTC
---
# Release testing → Sprint review: sprint team2/89

**REGISTER**

## Reason

Sprint team2/89 was ended on `sprint/team2/89` at `7150229e` (`90cfa6e9`) and closed (`f2de4e9c`). All eleven items
are done; each merge's second parent is the head its gate passed:
- ITM-797 #858 (`d91d8d65`, `cae7d809`); ITM-892 #857 (`3ffecc25`, `72934f7c`); ITM-887 #860 (`85c7e807`, `1cfac493`);
- ITM-724 #861 (`a2011e18`, `145d44cc`); ITM-891 #864 (`91dd1a31`, `245fedde`); ITM-881 #863 (`9f39e01d`, `740aa6a5`);
- ITM-890 #865 (`a104afa2`, `338a2dbf`); ITM-901 #866 (`e163dbc3`, `2f122643`);
- ITM-778 #867 (`77a6b6f9`, `e30f2a44`, after the rejection `f09e40a8` on `dfa4828d`);
- ITM-902 #868 (`c640da5e`, `84ecaf8c`); ITM-880 #869 (`ff408f0d`, `d8ddc48a`).

**The release tests.** Run 39114486880, on #870 at `7150229e`, checks out "Merge 7150229e… into f2de4e9c…", runs every
level (mode=all) and passes all twelve jobs. The longest job, python (2), takes 75 s, under the two-minute limit
(agreement 80). I read all twelve job logs through the API.
- The eight node jobs end with `# fail 0`: 4367 tests, 4355 pass, 12 todo, the known findings.
- The four Python jobs end with `OK`: 524 tests (5 skipped, 5 expected failures).
- **The release tests named every sprint:** `ok 214 - TST-418104`, `ok 227 - TST-276901`, `ok 529 - TST-377012`,
  `ok 530 - TST-377013` and `ok 182 - TST-292101`.

**Agreement 83, widened.** In a checkout of `7150229e`, after `npm install --prefix src/bridge-build --omit=dev
--ignore-scripts`, with `LC_ALL=C`, I ran the 58 of 87 release files whose imports, `new URL(…, import.meta.url)` or path
literals reach one of the 41 changed files, or that list or read a whole tree (`git ls-files`, `readdirSync`). The known
positive: `tests/release-sprint-02-d-traceability.test.mjs` is selected by its `git ls-files` (it is no import of a changed
file).
- 51 node files: 295 tests, 286 pass, 1 fail, 1 skipped, 7 todo. The failure is TST-320321902
  (`tests/release-itm-320-321-agent-processes.test.mjs`). It fails the same way on `main` at `f2de4e9c` on this Node 25.9,
  as the sprint's Review notes. Neither the test nor `src/agent-processes/` changed in the sprint, and it passes in the
  run above on Node 22 (`ok 145`).
- `tests/release-sprint-02-d-traceability.test.mjs` alone: 8 of 8 pass.
- 7 Python files (`test_bridge_mail`, `test_catalogue_is_data`, `test_definition_of_done`, `test_implementation_job`,
  `test_no_history`, `test_release_sprint_02_c`, `test_release_sprint_02_d`): 22 tests, OK (2 skipped).

Since `f2de4e9c`, `main` (`4708b65a`) changed only the backlog: four items and `docs/backlog/sprints/team2/90.md`
(`f9a707fa`). Since the sprint's last merge of `main` (`b22a5e3e`), nothing under `src/`, `tests/` or `.github/`. So the
run stands for the merge into today's `main` at `4708b65a`.

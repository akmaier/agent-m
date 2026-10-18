---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4029987914d0cf367e494054f21195376af34913
  - https://github.com/akmaier/agent-m/pull/917
date: 2026-10-18 16:51 UTC
---
# Development → Release testing: ITM-937, each route holds the numbers of its generated tests

**REGISTER**

## Reason

ITM-937 (MOD-site-frame, test code only), pull request #917 into `sprint/team1/91`, passes on `40299879`.

1. **The participant trailer is present** on all three commits: `developer-sonnet-e`.
2. **The red is `50144487`**, which holds tests only and follows the ruling in 91.md: the numbers are held with the routes,
   with no hash. Its run 39145936838 fails on the missing `CASES` export. The earlier tests-only commit `74881ee9` (the
   hash design, red on a missing `testId`) stands, and `50144487` reworks its tests to the ruling. The changed expected values are named
   by the developer: TST-937001 compares the numbers each route holds, TST-937003 checks that no number is used twice and
   the form `TST-<series><nnn>`, and TST-937005 and 937006 are new.
3. **The change** is `tests/site-usability.d/routes.mjs` and the two checks. Each route holds `ids` per series, the
   planted and multi-route tests are in `CASES`, and both checks take their identifiers from `testId` on these. No
   `number++` is left.
4. **The identifiers stay as they were.** I ran both checks on the head and on `sprint/team1/91` and compared the test
   names. Each side has 280 names, all 280 carry a distinct identifier, and the two sorted lists are identical. The runs
   themselves could not get the Electron fixture lock, which other agents' runs held at the time, so their results here
   say nothing about the pages. CI runs both checks.
5. **Counter-proofs, replayed by me on the head:**
   - the ids test passes 6 of 6;
   - with `number++` put back into `site-usability.test.mjs` and the route `/` given the drawn number 3, which `#uc`
     already holds, TST-937003 and TST-937004 fail and the others pass.
6. **`tests/site-usability-ids.test.mjs` is not an Electron file under ITM-947's rule.** The rule is `startsElectron`
   in `.github/workflows/tests.yml:101`, which reads a file's own text for `stageElectron` or `native-fixture-lock`. The
   ids test has 0 matches, and `site-usability.test.mjs`, the rule's known positive, has 2. The ids test starts no window:
   it imports `routes.mjs` and passes in a plain node run.
7. **Green.** CI run 39146339035 on `40299879` passes all twelve jobs. The head does not yet contain #911's merge, which
   changed only `tests/site-usability.d/browser.mjs`. `git merge-tree --write-tree` merges the head into
   `sprint/team1/91` without a conflict (tree `eff35c6a`). The merged sprint branch's run is read at the sprint's end gate.

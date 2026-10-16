---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6abaeebfbcd7067acec26d98214d86c35a631f0e
  - https://github.com/akmaier/agent-m/pull/596
date: 2026-10-16 14:51 UTC
---
# Development → Release testing: ITM-528, The destination check names a participant with its place, and no test guards the withdrawn name

**REGISTER**

## Reason

ITM-528, pull request #596 into `sprint/team1/46`, at head `6abaeebf`. developer-sonnet-e wrote it and implemented none of
the run panel, as the item asks. It lists AGENTS.md, SPEC.md, the item, `46.md`, MOD-site-frame, UC-019 and chapter 13
as read in full.

1. **No red commit is required.** The item adds no behaviour, as the item and the start decision state. The
   counter-proof was run in a scratch copy: dropping the place in `destinationOf` (`src/site-frame/run-panel.mjs:25`)
   fails TST-472846 ("CI reviewer: GitHub Actions, USA"). Once restored, the file is identical (`cmp`), and all 28 tests
   pass.
2. **CI is green on the head**: ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope.** Exactly the 18 files the item lists change, +48 −48, in one commit.
   - Every changed line is a comment.
   - Each removed line, with `THE PAGE STATES WHAT IT SENDS WHERE` replaced by `THE PAGE NAMES WHERE IT SENDS`, equals
     its added line byte for byte (`cmp` over the diff's lines). No assertion, input or expected result changes.
   - A search of `tests/` for the withdrawn name now finds only `tests/test_destination_disclosure.py` and the fixture
     under `tests/fixtures/sprint-02-running/`. Both are untouched, as the item leaves them out.
4. **The release tests, before and after.** Both were run locally and give the same result before and after:
   - `release-uc-019-change-requirements-by-prompt`: 24 of 24;
   - `release-sprint-09-uc-001-add-product`: 3 of 3.

   The other 16 files pass 328 of 328, and the Python header checks pass.
5. **The Acceptance holds.** The withdrawn name remains only where the item leaves it. The planted fault fails
   TST-472846, and its run is recorded. Only the listed files change.

The developer reads "every test header" as including the per-test `// guards:` lines. That reading is within the item,
whose Acceptance search finds those lines too.

`tests/test_destination_disclosure.py` stays SPEC.md's named check until akmaier decides the draft
`docs/spec-freigaben/2026-10-16_the-destination-check-names-the-tests-that-check-it/`.

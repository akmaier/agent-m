# 11. Architecture and implementation: the module use-case rule gives way to the test rule

**The change.** `NO MODULE IS CHECKED AGAINST THE USE CASES` is removed. The rest of the section is as it stands.

**Why.** akmaier, 2026-10-30, on a proposal that narrowed the rule to the architecture's reviewers: "I actually should
make sure that NO TEST CASE reads SPEC or USE CASE text verbatim in a test case. that is the reason for this requirement.
With this change it results in it's very opposite intention." and "Maybe the spec wording is not clear enough". Standing
among the review levels of §11, the rule was read as a rule of review. Its purpose is held by `A TEST DOES NOT TAKE ITS
EXPECTED RESULT FROM A DOCUMENT` (§12): a test that checks code never reads its expected result from the SPEC, a use case
or an architecture file. Asked how to make it clearer, akmaier chose: "Remove it; §12 covers it".

**Design principles** (AGENTS.md §2):
- One responsibility per rule: the rule on what a test may read stands once, in §12.
- Nothing twice: a second sentence for the same purpose, which could be read otherwise, goes.
- Nothing the SPEC already says: `A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT` already says it.
- Adding one of a kind changes nothing of another kind: the review levels of §11 keep their rules.
- No special first case: none touched.

**Impact list.**
- NO MODULE IS CHECKED AGAINST THE USE CASES: removed; named by UC-022, UC-023, UC-025, ARC-046 and
  `docs/groups/requirements.md`, each changed in the same commit to name it no more (open for acceptance where reviewed),
  and by the fixture `tests/fixtures/requirements-repair/`, a fixture of its own SPEC, left as it is.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).

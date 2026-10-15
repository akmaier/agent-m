# 12. Tests and continuous integration: a test does not take its expected result from a document

**The change.** A new requirement follows `A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS`: `A TEST DOES NOT TAKE ITS
EXPECTED RESULT FROM A DOCUMENT` — "A test that checks code never reads its expected result from the SPEC, a use case or an
architecture file when it runs." The rest of the section is carried over byte for byte.

**Why.** akmaier's decision of 2026-10-15. Accepting the architecture of the prompt bar (`7e893c63`) was a commit of
documents only, and it turned tests red on `main` without any pull request and without any change of code:
`tests/job-catalogue.test.mjs` reads `docs/architecture/MOD-job-catalogue.md` and `tests/job-runner-records.test.mjs` reads
`docs/architecture/MOD-job-runner.md` when they run, and take the kinds and the trailer lines they expect from those files;
`tests/system-uc-019-change-by-prompt.test.mjs` takes the passages it expects from UC-019. Every pull request of both teams
then failed on a red base, and two items each waited for the other to be merged first (Sprint 28's start decisions). A
test whose expected result is read from a document makes every accepted change of that document a red test, which
`CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI` is meant to prevent; and it checks the code against
the document's text while the architecture itself is checked by review (`AN ARCHITECTURE IS CHECKED BY REVIEW, NOT BY
TESTS`). With the expected result in the test's own text, a changed document changes no test; the item that implements
the change changes the test's expected values, which its gate checks.

**Against the rest of the SPEC.** It sharpens `A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS`, which asks for an
expected result that "can be read without running it". It does not touch tests that check documents — that a use case
names its fields (`tests/test_usecase_fields.py`), that a requirement names its check: there the document is the input
under test, not the source of the expected result. It is checked for review, as `ONE STATEMENT PER REQUIREMENT` is,
since telling an expected result from an input needs a person.

**Impact list.** No artifact names the new requirement yet. Tests it concerns: a search of `tests/` for code lines that
read such a file finds at least 8 test files reading a file under `docs/architecture/`, 20 reading a use case and 12
reading `SPEC.md`; it misses `tests/job-catalogue.test.mjs`, which builds the path on one line and reads it on another,
so these are lower bounds, and which of them take an expected result rather than an input is what the new check lists.
New: `tests/test_expected_results_stated.py`. Work for the teams after acceptance: the check, and the tests it lists
changed to state their expected values.

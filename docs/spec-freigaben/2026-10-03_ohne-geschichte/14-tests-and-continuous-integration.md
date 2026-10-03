## 12. Tests and continuous integration

**EVERY TEST HAS ONE LEVEL** *(PO A. Maier; Vibe Coding, ch. 13 §4, §6, §7)*
Every test declares exactly one level from: `unit`, `component`, `system`, `release`, `user`.
*Check:* `tests/test_test_levels.py`

**A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS** *(PO A. Maier)*
Every test case names its input, its precondition and its expected result in a form that can be
read without running it.
*Check:* `tests/test_test_battery.py`

**TEST GENERATION SEES THE EXISTING TESTS** *(PO A. Maier)*
When tests are generated, every existing test of the product that guards the same requirements,
use cases or modules is part of the input the generating participant receives.
*Check:* `tests/test_test_generation_context.py`

**A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT** *(PO A. Maier)*
A new test is accepted only with a recorded counter-proof: a fault deliberately introduced into the
code it guards, and the test's failing result on it.
*Check:* `tests/test_counter_proof.py`

**A MODEL-DEPENDENT TEST IS MEASURED AS A RATE** *(PO A. Maier)*
A test whose outcome depends on a model's answer reports a pass rate over a number of runs fixed
before the first run, compared with the rate of the last release.
*Check:* `tests/test_rate_reporting.py`

**RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER** *(Vibe Coding, ch. 13 §4 and §6; ch. 12 §2)*
A test of level `release` is generated or written by a participant other than the one that
implemented the behaviour it tests.
*Check:* `tests/test_test_battery.py` — a release test whose recorded author equals the implementing
participant of its guarded use case fails.

**THE TEST SCHEDULE IS DECLARED PER PRODUCT** *(PO A. Maier)*
Each product declares, in a data file of its own repository, which test levels run on every commit,
on a pull request, nightly, on a release candidate, and on demand.
*Check:* `tests/test_ci_schedule.py`

**THE DEFAULT SCHEDULE FOLLOWS THE BOOK** *(Vibe Coding, ch. 12 §5; ch. 13 §4, §6, Exercises)*
Without a declaration, `unit`, `component` and `system` tests run on every commit and pull request,
tests calling a paid service run nightly, and every test runs on a release candidate.
*Check:* `tests/test_ci_schedule.py`

**COMMIT TESTS CALL NO PAID SERVICE** *(Vibe Coding, ch. 13 §4.1)*
A test that runs on every commit or pull request calls no external service that charges per call;
it uses a recorded or constructed response instead.
*Check:* `tests/test_ci_schedule.py` — a commit-level test that opens a connection to a configured
paid endpoint fails the run.

**THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE** *(PO A. Maier)*
A product's CI configuration — a GitHub Actions workflow on GitHub, a GitLab CI pipeline on a GitLab
server — is generated from its declared test schedule.
*Check:* `tests/test_ci_schedule.py` — the generated configuration triggers exactly the levels the
schedule names for each event.

**A JOB RECORD STARTS NO CI RUN** *(PO A. Maier)*
The generated CI configuration starts no run for a commit that changes only job records under
`docs/jobs/`.
*Check:* `tests/test_ci_schedule.py` — the generated configuration ignores a push touching only
`docs/jobs/`; counter-proof: a push also touching code starts a run.

**A RELEASE RUNS EVERY TEST AT EVERY LEVEL** *(PO A. Maier)*
A release is tagged only after every test of the product, at every level, has run on the release
candidate's commit.
*Check:* `tests/test_release_run.py`

**EVERY TEST RUN LEAVES A RESULT RECORD** *(PO A. Maier)*
Every test run leaves a record naming the commit, the levels run, the participant that ran it, the
date, and each test's outcome.
*Check:* `tests/test_result_records.py`

**A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY** *(PO A. Maier)*
A deterministic test with both a passing and a failing outcome recorded on the same commit is shown
as flaky, never as passed.
*Check:* `tests/review-core.test.mjs`

**THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON** *(PO A. Maier; Vibe Coding, ch. 13 §7)*
The report of a release run counts as accepted only when an approval record names its text.
*Check:* `tests/review-core.test.mjs`

**ACCEPTING THE RELEASE TEST REPORT RELEASES** *(PO A. Maier)*
Accepting a release test report on the dashboard also commits the changelog entry and sets the release
tag on the tested commit, as part of the same click.
*Check:* `tests/test_release_run.py` — after accepting a green report the tag exists on the tested
commit; counter-proof: rejecting it sets no tag.

**THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE** *(PO A. Maier)*
The audit view of a release lists every requirement valid at that release with the tests guarding
it, their outcomes on the release commit, and the acceptance of the release test report — including
requirements with no test or no passing outcome.
*Check:* `tests/test_audit_view.py`

**A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED** *(PO A. Maier)*
A release whose run has failing tests or worse rates is tagged only after a person accepts the
release test report with each failing test and the reason recorded in the approval.
*Check:* `tests/test_release_run.py` — a red run without a recorded limitation cannot be tagged;
counter-proof: with one it can.

**TEST RESULTS ARE KEPT IN THE REPOSITORY** *(PO A. Maier)*
Every result record is committed to the branch `test-results` of the product repository.
*Check:* `tests/test_result_records.py`

**A RESULT RECORD IS NEVER REWRITTEN** *(PO A. Maier)*
The branch `test-results` only grows: no record on it is changed or deleted, and it is never
force-pushed.
*Check:* `tests/test_result_records.py` — the branch's history is checked for rewritten or deleted
records; counter-proof with a fixture that amends one.

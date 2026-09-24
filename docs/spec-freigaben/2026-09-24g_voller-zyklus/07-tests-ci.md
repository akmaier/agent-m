## 12. Tests and continuous integration

**EVERY TEST HAS ONE LEVEL** *(PO A. Maier, 2026-09-24; Vibe Coding, ch. 13 §4, §6, §7)*
Every test declares exactly one level from: `unit`, `component`, `system`, `release`, `user`.
*Occasion:* PO, 2026-09-24: "There should be different levels of tests … check the vibe coding
book". The book separates development testing (unit, component, system), release testing and user
testing (alpha, beta, acceptance); test-driven development is a way of working, not a level, and is
therefore not in the set.
*Check:* `tests/test_test_levels.py`

**A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS** *(PO A. Maier, 2026-09-24; SOFTWARE_MAINTENANCE.md §4.0a rule 1)*
Every test case names its input, its precondition and its expected result in a form that can be
read without running it.
*Occasion:* without an expected result a test is a demonstration, not a test. Readable without
running, the expectation can be reviewed before any code exists — the book starts test design during
requirements work (ch. 13 §3).
*Check:* `tests/test_test_battery.py`

**TEST GENERATION SEES THE EXISTING TESTS** *(PO A. Maier, 2026-09-24)*
When tests are generated, every existing test of the product that guards the same requirements,
use cases or modules is part of the input the generating participant receives.
*Occasion:* the same argument as `DERIVATION SEES THE EXISTING REQUIREMENTS`: a participant that
does not see the existing battery writes the same test a second time, and two tests guarding one
thing drift apart.
*Check:* `tests/test_test_generation_context.py`

**A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT** *(PO A. Maier, 2026-09-24; SOFTWARE_MAINTENANCE.md §4.0a rule 5)*
A new test is accepted only with a recorded counter-proof: a fault deliberately introduced into the
code it guards, and the test's failing result on it.
*Occasion:* a test that cannot fail checks nothing, and a green run of it proves nothing about the
requirement it names. The book warns that a poorly specified test "will pass and hide the error"
(ch. 13 §5).
*Check:* `tests/test_counter_proof.py`

**A MODEL-DEPENDENT TEST IS MEASURED AS A RATE** *(PO A. Maier, 2026-09-24; SOFTWARE_MAINTENANCE.md §4.0a rule 4)*
A test whose outcome depends on a model's answer reports a pass rate over a number of runs fixed
before the first run, compared with the rate of the last release.
*Occasion:* a single run of a stochastic check is a coin toss; a threshold on it trains everyone to
ignore red. The release question is "is this state worse than the one in use", not "is it good
enough".
*Check:* `tests/test_rate_reporting.py`

**RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER** *(Vibe Coding, ch. 13 §4 and §6; ch. 12 §2)*
A test of level `release` is generated or written by a participant other than the one that
implemented the behaviour it tests.
*Occasion:* the book assigns release testing to a team "independent of feature development", and
separates the role that finds problems from the role that fixes them. An agent that writes both the
code and its release tests tests its own assumptions.
*Check:* `tests/test_test_battery.py` — a release test whose recorded author equals the implementing
participant of its guarded use case fails.

**THE TEST SCHEDULE IS DECLARED PER PRODUCT** *(PO A. Maier, 2026-09-24)*
Each product declares, in a data file of its own repository, which test levels run on every commit,
on a pull request, nightly, on a release candidate, and on demand.
*Occasion:* PO, 2026-09-24: "which tests to execute when". A static-site product and a product that
calls a paid model need different answers; a data file answers it for each product, changes by
commit, and is read the same way by the dashboard and by CI.
*Check:* `tests/test_ci_schedule.py`

**THE DEFAULT SCHEDULE FOLLOWS THE BOOK** *(Vibe Coding, ch. 12 §5; ch. 13 §4, §6, Exercises)*
Without a declaration, `unit`, `component` and `system` tests run on every commit and pull request,
tests calling a paid service run nightly, and every test runs on a release candidate.
*Occasion:* the book: with CI "every commit triggers an automated build, runs the complete test
suite"; paid external calls are mocked and exercised for real only in "a limited nightly integration
test". A default is offered so that a product without a decision still has CI; it is shown as the
default until the author saves their own.
*Check:* `tests/test_ci_schedule.py`

**COMMIT TESTS CALL NO PAID SERVICE** *(Vibe Coding, ch. 13 §4.1)*
A test that runs on every commit or pull request calls no external service that charges per call;
it uses a recorded or constructed response instead.
*Occasion:* "every test run should not charge the account" (ch. 13 §4.1). Mocks also make rare
failure paths — timeout, rate limit, malformed answer — testable at all.
*Check:* `tests/test_ci_schedule.py` — a commit-level test that opens a connection to a configured
paid endpoint fails the run.

**THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE** *(PO A. Maier, 2026-09-24)*
A product's CI configuration — a GitHub Actions workflow on GitHub, a GitLab CI pipeline on a GitLab
server — is generated from its declared test schedule.
*Occasion:* two places that both say which tests run when will disagree; the schedule is the one
the dashboard shows, so it is the one that must be true. Generated, the configuration reaches the
default branch through a pull request like any other code.
*Check:* `tests/test_ci_schedule.py` — the generated configuration triggers exactly the levels the
schedule names for each event.

**A RELEASE RUNS EVERY TEST AT EVERY LEVEL** *(PO A. Maier, 2026-09-24)*
A release is tagged only after every test of the product, at every level, has run on the release
candidate's commit.
*Occasion:* PO, 2026-09-24: "Release should trigger a full run of the test-suite." Release testing
evaluates "a concrete release candidate" (ch. 13 §6); a test that did not run on that commit is no
evidence for it.
*Check:* `tests/test_release_run.py`

**EVERY TEST RUN LEAVES A RESULT RECORD** *(PO A. Maier, 2026-09-24)*
Every test run leaves a record naming the commit, the levels run, the participant that ran it, the
date, and each test's outcome.
*Occasion:* PO, 2026-09-24: "the execution and review of actual test results on specific commits".
A result that cannot be tied to a commit cannot be reviewed, compared or shown to an auditor.
*Check:* `tests/test_result_records.py`

**A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY** *(PO A. Maier, 2026-09-24; SOFTWARE_MAINTENANCE.md §4.0a rule 5)*
A deterministic test with both a passing and a failing outcome recorded on the same commit is shown
as flaky, never as passed.
*Occasion:* a check that is sometimes red without a change teaches everyone to ignore red. Shown
as its own state, it is repaired or removed instead of being retried until green.
*Check:* `tests/review-core.test.mjs`

**THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON** *(PO A. Maier, 2026-09-24; Vibe Coding, ch. 13 §7)*
The report of a release run counts as accepted only when an approval record names its text.
*Occasion:* the audit must say who accepted the evidence, not only that tests ran. The book's
acceptance step is a decision — accept, accept with known limitations, or reject — and a decision is
recorded like every other gate (`THE GATE IS RECORDED`).
*Check:* `tests/review-core.test.mjs`

**THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE** *(PO A. Maier, 2026-09-24)*
The audit view of a release lists every requirement valid at that release with the tests guarding
it, their outcomes on the release commit, and the acceptance of the release test report — including
requirements with no test or no passing outcome.
*Occasion:* PO, 2026-09-24: "dash boards … for tests for auditing". A normative process source such
as IEC 62304 asks for evidence that each requirement was verified (ch. 13 §6: "regulators may demand
evidence"); a list that omits the gaps is not evidence. The view is derived like the traceability
matrix and exported as Markdown (`ARTIFACTS ARE MARKDOWN`).
*Check:* `tests/test_audit_view.py`

**A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED** *(PO A. Maier, 2026-09-24)*
A release whose run has failing tests or worse rates is tagged only after a person accepts the
release test report with each failing test and the reason recorded in the approval.
*Occasion:* PO, 2026-09-24: the book's conditional acceptance (ch. 13 §7) is right. A release that
knowingly ships with a limitation must say so where an auditor looks — the approval and the
changelog — not in someone's memory.
*Check:* `tests/test_release_run.py` — a red run without a recorded limitation cannot be tagged;
counter-proof: with one it can.

**TEST RESULTS ARE KEPT IN THE REPOSITORY** *(PO A. Maier, 2026-09-24)*
Every result record is committed to the branch `test-results` of the product repository.
*Occasion:* PO, 2026-09-24: "we need to be able to audit the test results. Therefore, they need a
permanent location in the repo." CI servers delete run logs after a retention period. A branch of
their own keeps the results permanent without a commit on the default branch per run — which would
also trigger CI again.
*Check:* `tests/test_result_records.py`

**A RESULT RECORD IS NEVER REWRITTEN** *(PO A. Maier, 2026-09-24)*
The branch `test-results` only grows: no record on it is changed or deleted, and it is never
force-pushed.
*Occasion:* evidence that can be edited afterwards is no evidence. Appending only makes every audit
repeatable against the same records.
*Check:* `tests/test_result_records.py` — the branch's history is checked for rewritten or deleted
records; counter-proof with a fixture that amends one.

# 12. Tests and continuous integration: no participant waits more than two minutes

**The change.** `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES` keeps its limit on every job and adds: no participant waits
more than two minutes for a pull request's CI; a test that does not fit runs nightly instead; each team decides which tests
run on a pull request; every test runs nightly. Its check adds that `nightly.yml` runs every test file. The rest of the
section is carried over byte for byte.

**Why.** akmaier's decision of 2026-10-13, as entry 01. The limit alone made a job fail when it grew past two minutes but
said nothing of where the test then goes; the nightly run ensures no test is dropped for the sake of the limit.

**Against the rest of the SPEC.** `THE TEST SCHEDULE IS DECLARED PER PRODUCT` and `THE DEFAULT SCHEDULE FOLLOWS THE BOOK`
concern the products Agent M manages and their generated configuration; this requirement concerns Agent M's own
repository, as before. `A RELEASE RUNS EVERY TEST AT EVERY LEVEL` is unaffected. The gate "Release testing → Sprint review"
of `docs/process-models/scrum-wip.md` asks for the release tests green on the sprint's branch; where a team moves them to
the nightly run, the nightly result is what that gate reads — how, the team settles in its process, not the SPEC.

**Impact list.** `tests/test_ci_budget.py` gains the check that `nightly.yml` runs every test file (an item); a change
between jobs then lets `nightly.yml` run every test, and the teams move tests as they decide.

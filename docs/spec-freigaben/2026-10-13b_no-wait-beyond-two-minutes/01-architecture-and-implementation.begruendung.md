# 11. Architecture and implementation: a test moves between the pull-request run and the nightly run

**The change.** The kind of change between jobs accepted at 4ed77fe2 — moving the tests of level `release` out of the run on
a pull request into a sprint's branch — becomes moving a test between the run on a pull request and the nightly run. Its
check names the case. The rest of the section is carried over byte for byte.

**Why.** akmaier, 2026-10-13: no agent waits for CI for more than two minutes in this project, and any further tests run
overnight; which tests run on a pull request, the teams decide on their own. A team carries such a decision out by changing
`.github/workflows/tests.yml` and `nightly.yml`, files no module owns, so the kind of change must admit it. On the sprint's
pull request into main (#494) the node job ran 1m56 of its two minutes, since that run still holds every test.

**Impact list.** As entry 02.

# 12. Tests and continuous integration: a pull request's CI runs within two minutes

**The change.** New: `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`, after `COMMIT TESTS CALL NO PAID SERVICE`. Every other
requirement of §12 is carried over byte for byte.

**Why.** PO, 2026-10-06: "Please check the CI test durations. They seem long again. Make sure that they stay below 2 min.
Everything else needs to go to a nightly build or we have to make them modular."

**Measured, 2026-10-06, from GitHub's records of the last eight runs of `tests.yml`** (`gh run view`, start and end of each job
and step): a whole run took 48–58 s; of it the step *Python checks* 38–45 s and *Dashboard core* 30–34 s, the two jobs side by
side. Today's runs are below two minutes; the limit keeps them there. The nightly build (`nightly.yml`) took 84–86 s and runs
the whole-repository scan of `tests/test_release_sprint_02_c.py`, which is where a test goes that does not fit.

**How it is kept:** each job of `tests.yml` gets GitHub's `timeout-minutes: 2`. A job that runs longer is stopped and the
pull request's run fails, so a test that makes it longer is moved to the nightly build or the suite is split, before it is
merged. The rule binds Agent M's own repository; the test schedules of the products Agent M manages are declared per product
(`THE TEST SCHEDULE IS DECLARED PER PRODUCT`) and are not changed by it.

**Impact list:** a new requirement; nothing names it yet.

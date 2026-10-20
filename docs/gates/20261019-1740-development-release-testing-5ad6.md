---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 7cacced2ad40ef06358864a0aa8515fc5a14f77a
  - https://github.com/akmaier/agent-m/pull/1115
date: 2026-10-19 17:40 UTC
---
# Development → Release testing: ITM-1095, the nightly run builds the real Linux Bridge

**REGISTER**

## Reason

ITM-1095, pull request #1115 into `sprint/team2/97`, passes on `7cacced2`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `462c4c33` holds only `tests/test-schedule-nightly.test.mjs`, and CI run 39294627014 failed on it.
2. **The change.** `nightly.yml` gains the job `bridge-build-real`:
   - `ubuntu-latest` with xvfb;
   - the Bridge app's packages installed as CI installs them;
   - `BRIDGE_BUILD_REAL=1 xvfb-run … node --test tests/bridge-build-build-platform.test.mjs`;
   - a timeout of its own, 30 minutes.
   `tests.yml` is unchanged, so A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES (SPEC.md:1523-1526) stands. SPEC.md:1509 names
   the nightly run.
3. **It works.** Its dispatched run 39294775021, on the helper branch that merges ITM-961, ran TST-961006 for real. It failed
   on #930's own defect, `NativeAddonFound` on electron's build-tool addon. That is ITM-961's matter, not this job's.
4. **Scope.** `.github/workflows/nightly.yml`, which MOD-test-schedule takes over (MOD-test-schedule.md:71), and a test
   naming MOD-test-schedule.

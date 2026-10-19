---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 04a54a77c22a4fef1430945a2dc2c0f7dbadc397
  - https://github.com/akmaier/agent-m/pull/930
date: 2026-10-19 18:02 UTC
---
# Development → Release testing: ITM-961, the Bridge's file of one platform is built, signed and checked

**REGISTER**

## Reason

ITM-961, pull request #930 into `sprint/team2/97`, passes on `04a54a77`. CI is green on the head, on 20 of 20 jobs.

1. **The pre-gate condition is met.** In the nightly run 39298074804, the job `bridge-build-real` ran TST-961006 for real, on
   a Linux runner under xvfb, and it passed. The run was on the helper branch `itm-1095-run`: #930's head merged with #1115
   (ITM-1095).
2. **Red first.** The tests-only commits `6d85e356` (run 39295738612) and `9f91ae6b` (run 39297242765) failed on CI.
3. **g's two fixes, accepted.**
   - The scan for native add-ons covers only the dependencies that ship, recursively, as MOD-bridge-build.md:62-64 and
     :75-76 state at the accepted blob `160ad6a1`. It no longer covers the build tools that `node_modules` holds while
     building, which made the first real run fail with `NativeAddonFound`.
   - The Linux tunnel check starts the built app with `--no-sandbox` (`check.mjs:184`, TST-961009). That is the release
     check's own start of the app on the CI runner, not how a person starts the Bridge.
4. **Scope.** `src/bridge-build/` and its test.

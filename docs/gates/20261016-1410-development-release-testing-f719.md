---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8f6292c9fbfef7c5d0713d453baeaa17897d5e60
  - https://github.com/akmaier/agent-m/pull/589
date: 2026-10-16 14:10 UTC
---
# Development → Release testing: ITM-543, A test's apt install waits for the package lock

**REGISTER**

## Reason

ITM-543, pull request #589 into `sprint/team1/45`, at head `8f6292c9`. developer-sonnet-e wrote it, and built none of
MOD-settings-pages. It lists AGENTS.md, SPEC.md, the item, `45.md`, MOD-settings-pages and chapter 13 as read in full.

1. **No red commit is required.** The item adds no behaviour, as the start decision named. The counter-proofs, in a
   harness of the fixtures' own functions with stand-ins for `sudo`, `xvfb-run`, `openbox` and `apache2`:
   - a planted install of a package that does not exist still fails, naming the install;
   - a stand-in that holds the package lock for three seconds makes both files wait and go on with the option, and fail
     at once without it — "Could not get lock … held by process 4242".
   The developer's first plant in TST-294001 hit the wrong line. It was corrected and run again, and the pull request says
   so. The stand-ins show the call and its paths, not apt on a real mirror.
2. **CI is green on the head**: ten of ten jobs. TST-294001 ran on Linux, where the packages were already present, so the
   install was not reached. TST-290115, a release test, first runs on Linux in the sprint's pull request into `main`.
3. **The changes stay in the item's scope.** Three `apt-get` calls in two test files that name MOD-settings-pages:
   - `tests/component-itm-294-https-reverse-tunnel.test.mjs`, its `update` and its install;
   - `tests/release-itm-290-public-settings-layout.test.mjs`, its install.
   Each gets `-o DPkg::Lock::Timeout=50 -o Acquire::Retries=3` and a limit of 60 seconds; the existing `command()` and
   `requireSuccess()` take that limit as an option. No assertion, message, workflow or expected result changed, and
   `tests/dashboard-backlog-layout.test.mjs` is left out, as the item names.
4. **The release test, before and after.** TST-290115 passes on macOS, where the install is not reached, before and after.
   TST-294001 is skipped on macOS before and after.
5. **The Acceptance holds, as far as can be seen before the Linux run.** The installs wait for the lock and retry a slow
   mirror, and a failed install still fails.

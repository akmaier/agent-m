---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f4f9d46a86463fd02964be50bedefc96d41147f5
  - https://github.com/akmaier/agent-m/pull/586
date: 2026-10-16 13:46 UTC
---
# Development → Release testing: ITM-541, The desktop fixtures do not wait on an apt install

**REGISTER**

## Reason

ITM-541, pull request #586 into `sprint/team1/44`, at head `f4f9d46a`. developer-sonnet-e wrote it, and built none of the
desktop shell. It lists AGENTS.md, SPEC.md, the item, `44.md`, MOD-desktop-shell and chapter 13 as read in full.

1. **No red commit is required.** The item adds no behaviour, as the start decision named. Its counter-proof is a planted
   failed install. In a harness that runs the fixture's own install with stand-ins for `sudo`, `xvfb-run` and
   `openbox`:
   - the package `openbox` gives the fixture ready, with `Acquire::Retries=3` and a limit of 60 seconds;
   - a package that does not exist fails the fixture in both files, naming the install stage and apt's status 100.
   The stand-ins show the call and the failure path, not apt retrying a real mirror, and the pull request says so.
2. **CI is green on the head**: ten of ten jobs, run 38910278231. `tests/desktop-shell.test.mjs` ran on Linux there and
   passed.
3. **The changes stay in the item's scope.** One line in each of `tests/desktop-shell.test.mjs` and
   `tests/release-itm-276-desktop-shell.test.mjs`, both naming MOD-desktop-shell. Each adds `-o Acquire::Retries=3` to the
   Openbox install and raises its limit from 40 to 60 seconds. No expected result changes, nothing is skipped, and no
   workflow changes.
4. **The release test, before and after.** TST-276901 cannot run on macOS, where its guard skips it, so the local runs
   are seven skipped before and after, and the file parses. It runs on Linux in sprint 44's pull request into `main`, at
   the end gate.
5. **The Acceptance holds, as far as can be seen before that run.** The install retries a slow mirror within the job's
   two minutes, and a failed install still fails the fixture.

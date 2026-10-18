---
id: ITM-924
title: The look and accessibility checks start their browser reliably under load
level: unit
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
  - THE SITE SERVES A SCREEN READER
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-site-frame
builds_on:
  - ITM-904
  - ITM-905
tests:
  - unit
origin:
  - the Scrum Master's reading of run 39124280229 (sprint team1/89)
---
# ITM-924 The look and accessibility checks start their browser reliably under load

**REGISTER**

## Outcome

ITM-904's `tests/site-usability.test.mjs` failed all 124 of its tests once on CI. That was run 39124280229, ITM-900's
tests-only commit, which changes nothing of the check, in job node (1) 117666025638. The browser hook gave "/ is loaded did not
hold within 30 s; last error: Runtime.evaluate was not answered within 30 s" (`tests/site-usability.d/browser.mjs:36`). The
rerun, job 117666693942, passed (`# tests 779`, `# fail 0`, `# todo 8`). In that shard the check ran beside other files, and
its fixed 30-second wait did not hold under that load. ITM-905's `tests/site-accessibility.test.mjs` boots the same way.

**First task:** read both jobs' logs for what the page and the DevTools connection were doing while the wait ran out, and
name the cause before any change. A longer fixed wait alone is not a fix: the job also has to stay within `A PULL REQUEST'S
CI RUNS WITHIN TWO MINUTES`.

## Acceptance

- The cause is named from the logs and removed in the boot that both checks share, so that an unanswered evaluation is
  retried or the page's own readiness is awaited, within the job's time. A test with a page that answers slowly shows that
  the boot waits for it, with a counter-proof.
- Both checks pass in a shard beside other Electron files.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 5fc8e004ccb07658bf50073c0fe40bc49a24f15d
  - https://github.com/akmaier/agent-m/pull/891
date: 2026-10-18 12:05 UTC
---
# Development → Release testing: ITM-924, the look and accessibility checks start their browser reliably under load

**REGISTER**

## Reason

ITM-924 (MOD-site-frame, test code only), pull request #891 into `sprint/team1/89`, passes on `5fc8e004`.

1. **The cause is named from both jobs' logs.** The first `Runtime.evaluate` after `Page.navigate` was never answered by
   the DevTools session. `until` gave that one evaluation the whole 30 s, so it was never sent again. Staging took 12 s, so
   load alone was not the cause.
2. **Red first.** `3a78ddce` holds only the new `tests/site-usability-boot.test.mjs`, over a fake page. Run 39125183574 is
   red in node (1) with exactly TST-924001, 924003 and 924004 cancelled at their timeouts. TST-924002, a slow answer that
   is waited for, passes on the old code by design.
3. **The change** is only in `tests/site-usability.d/browser.mjs` and `routes.mjs`. `show(page, site, address, {
   answerWithin = 3000, limit = 30000 })` sends each evaluation again after `answerWithin`, within the same total `limit`.
   Setting the hash again is harmless: it sets the same value. No longer wait was added, and the total stays 30 s.
4. **Green.** Run 39125456403 on `5fc8e004` passes all twelve jobs. `git merge-tree --write-tree` merges the head into
   `sprint/team1/89` without a conflict (tree `7e38161a`).
5. **The Acceptance holds.**
   - I ran the boot test on the head: 4 of 4.
   - I replayed the developer's counter-proof in a clean checkout of the head: with `answerWithin` equal to `limit`, so that
     nothing is sent again, TST-924001 fails. Restored, it is clean.
   - My first attempt at a counter-proof changed only the first evaluation (`ask`), which the fake does not lose, and
     passed. The evaluation that is lost is the "is loaded" check, which the developer's counter-proof covers.
   - The local run of usability, accessibility and backlog-layout: 195 tests, 0 failed, 36 todos.
6. **"Beside other Electron files" holds.** On CI, usability ran in node (2) beside `desktop-shell.test.mjs` in 1 min 7 s,
   and accessibility in node (5) beside `dashboard-backlog-layout.test.mjs` in 58 s. Every job stays under two minutes
   (`A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`). The two checks did not share a shard in this run, and the sprint pull
   request's mode=all run will show that case.

**developer-sonnet-e is on ITM-878 under the conditions of `127bb7e5`.**

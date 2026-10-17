---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 87373adb9fb7c6858f1d59f8bf35736e575e3627
  - https://github.com/akmaier/agent-m/pull/743
date: 2026-10-17 19:08 UTC
---
# Development → Release testing: ITM-683, the old settings view goes (narrowed to the token banner)

**REGISTER**

## Reason

ITM-683, pull request #743 into `sprint/team1/74`, at head `87373adb`. That head is #745 merged onto developer-sonnet-d's
`25ee2f21`. It follows the rejection on `82b4ac97` (`docs/gates/20261017-1853-development-release-testing-7486.md`).
#743's checks passed ten of ten. #745's run 39060795062 on an equal tree ran in mode=all, and every node job ends with
`# fail 0`.

**The rejection is met.** `src/site-frame/notices.mjs:66-67` draws "Your GitHub token expires on <date> (<name>).", as
UC-042 1a quotes the line. A product's GitHub token gets the same line, and a GitLab project token is named by its kind.
Each line has **Renew**: GitHub's token list, or a GitLab project's *Access tokens* page. The refusal line of 1b is
unchanged.

**Red, then code.** The tests-only commit `9e098dea` was red in run 39060227459 on exactly the six changed expiry cases:
TST-683001, 003, 004 and 006, and two in dashboard-review-flows. The unchanged cases passed. The code was pushed after the
red was read.

**Release tests.** #745 moves one expectation, release-sprint-01's UC-042 1a, to the line as the use case quotes it.
The token's name, the date and the Renew address are still asserted. The three refusal cases needed no change, since 1b
is unchanged. The whole files pass: 34+2 todo, 18+1 todo, and 10 of 10. ITM-018 passes. `#settings` makes 8 requests
before and after, with and without a token.

**Everything accepted at the first gate stands:**
- the narrowing;
- `settings-view.mjs` and `endpoints.mjs` staying until ITM-810;
- six planted faults caught;
- the unchanged counts.

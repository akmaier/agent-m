---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - e1c2ca6c3c0f73a57fbb66c70a3ba2c719ce2ba0
  - https://github.com/akmaier/agent-m/pull/461
date: 2026-10-12 21:56 UTC
---
# Development → Release testing: ITM-467, ITM-357's test waits by time, not by turns

**REGISTER**

## Reason

ITM-467, pull request #461 by developer-sonnet-d into `sprint/team1/23` (UC-041 7b), head `e1c2ca6`, one commit that
changes only `until()` in `tests/review-pages-spec-entries.test.mjs`, ITM-357's test: it polls with `setImmediate`
until two seconds have passed and then checks once more, where it gave up after 400 turns. No expected result changes,
and no other file. The Acceptance holds: CI is green on `e1c2ca6` (run 38313492512); the counter-proof, a condition
that never holds, still fails, after 2002 ms; and the file ran green twenty times beside six busy loops. The item adds no
behaviour and repairs a wait that failed only under load, so its first commit has no deterministic red, as its
Acceptance allows; the pull request names it. #460, the increment of sprint team1/23, is decided again on the head this
merge gives `sprint/team1/23`.

---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 7d0b9126b4ae81c1cc09f48873802805826d6433
  - https://github.com/akmaier/agent-m/pull/1186
date: 2026-10-19 23:57 UTC
---
# Development → Release testing: ITM-1125, the explanation resource-check says what the page does through a Bridge

**REGISTER**

## Reason

ITM-1125, pull request #1186 into `sprint/team2/97`, passes on `7d0b9126`. CI is green, on 20 of 20 jobs.

1. **Red first.** `69f30d50` holds only `tests/site-frame-resource-explanations.test.mjs`, and its CI failed.
2. **The change** is the explanation's text alone. It now says what the page does through the Bridge the route names.
   MOD-site-frame's file holds the uses draft `7377eaa2`, and this text does not rest on it.
3. **The mark.** TST-1041020's `todo` mark is removed by developer-sonnet-i, who did not implement ITM-1125, in a commit
   of its own on this branch before the merge.
4. **The description** is a placeholder. g's text is kept for akmaier.

---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - af20bebc384fa5ecb503c1fd6feb813c887e9312
  - https://github.com/akmaier/agent-m/pull/1113
date: 2026-10-19 18:02 UTC
---
# Development → Release testing: ITM-957 with ITM-1044, the key not-an-issue and its line of the settings page

**REGISTER**

## Reason

ITM-957, pull request #1113 into `sprint/team2/97`, passes on `af20bebc`, together with ITM-1044, which it carries. CI is
green on the head, on 20 of 20 jobs.

1. **Red first.** `c88731e0` holds only tests, and CI failed on it.
2. **Why ITM-1044 rides here.**
   - MOD-browser-store.md:83-84: a key of the catalogue has its line on the settings page, and `tests/test_settings_page.py`
     checks every catalogue key. So the key `not-an-issue` alone cannot go green.
   - It is the same case as ITM-1077 with `browser`, which joined the key and its line in one item.
   - Both items are selected (97.md, this commit), and this record gates both.
   - The settings line, the count of marked mails with *Clear*, is ITM-1044's Acceptance.
3. **Scope.** `src/browser-store/`, `src/settings-pages/settings.mjs`, their tests, and `tests/test_settings_page.py`, a unit test
   whose list of catalogue keys gains the key. These are the two items' modules.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 616e830a1a63079f7f533f6698064367a9f9e6ec
  - https://github.com/akmaier/agent-m/pull/414
date: 2026-10-11 20:24 UTC
---
# Development → Release testing: ITM-345, the explanations of registering a source

**REGISTER**

## Reason

ITM-345, pull request #414 by developer-sonnet-b into `sprint/team1/20`, head `616e830`. The first commit `7e7dfa8`
holds only `tests/site-frame-source-explanations.test.mjs`, and CI was red on it (run 38171662411): its nine tests fail,
and no other test does. CI is green on `616e830` (run 38171872063, 1825 tests, 0 failures). The change is only
`src/site-frame/explanations.md`, seven topics; the new test names MOD-site-frame and its guards, and 67 faults planted
on the draft are recorded, the two that survived there pinned since. The Acceptance holds: `explain` gives each new
topic, folded, with its text.

The reading weighed: no accepted text defines *normative*, *advisory* and *informational* beyond naming them — UC-004
step 3, UC-015, MOD-source-register's `authority`, and `A SOURCE DECLARES ITS AUTHORITY`, which says only that the
declaration is made at the source, not inferred from how often it is cited. The topic words them as they ordinarily
mean — must be followed, recommended, background — and states UC-005 7a's rule that a normative source does not win
automatically; it states no rule the texts do not give. The slugs, the cover page's place of a designation, and no
pointer into the book are the developer's, named in the pull request.

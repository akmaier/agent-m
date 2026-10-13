---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - b5b389c908d3b862c766db0909a18f0bc1415cb6
  - https://github.com/akmaier/agent-m/pull/486
date: 2026-10-13 00:30 UTC
---
# Development → Release testing: ITM-471, the spec-with-queues test classes a restated requirement of the SPEC

**REGISTER**

## Reason

ITM-471, pull request #486 by developer-sonnet-e into `sprint/team1/26`, head `b5b389c`, one commit, CI green (run
38327334334). It changes only `tests/spec-changes-requirement-recipes.test.mjs`, and no expected result. The second
candidate now restates A DECIDED RULE's rule, so it is a duplicate by rule before ITM-450 and after it, which the item
needs.

The change is not the one ITM-471 states. Its Outcome has the candidate state A DECIDED RULE's rule "under its name", and
the test's title "names a restated requirement of the SPEC in place of a taken name". The pull request puts the rule
under another name, A RESTATED DECIDED RULE, and leaves the title "a restated rule and a taken name are duplicates",
which the test no longer shows. The Acceptance names the counter-proof as "the part of `spec-with-queues` planted
without the SPEC's requirements". The one recorded plants a fault in MOD-documents' `classifyCandidates` instead, and
does not show what the test is for: that the part carries the SPEC's requirements. The Developer worked from the Scrum
Master's message, not the item's file, which stands on `main`.

Condition for the one rework: the candidate, the title and the counter-proof as ITM-471's Outcome and Acceptance state
them.

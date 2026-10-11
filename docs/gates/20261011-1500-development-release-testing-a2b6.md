---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 30e1cde7f14045c2bfb367ea1b6f7435750b27d3
  - https://github.com/akmaier/agent-m/pull/368
date: 2026-10-11 15:00 UTC
---
# Development → Release testing: ITM-347

**REGISTER**

## Reason

ITM-347, pull request #368 by developer-sonnet-b into `sprint/team1/16`, on head `30e1cde`, against the item and
MOD-site-frame's accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `3ba15bf`, holds only `tests/site-frame-review-explanations.test.mjs`, and CI was red on it (run
  38148513938): node failed on exactly its 8 tests. The second tests-only commit, `d01256b`, red on the same 8 (run
  38148787573), adds what the faults planted on the draft left unstated, as the team agreement asks.
- CI is green on the head (run 38149187591): node 1422 tests, 0 failed; python 441 tests, OK. The last commit, after the
  topics, changes only the new test: the known positive of its stray-markup check is now the renderer's own instead of
  each topic's marks, so a topic written without emphasis is asked nothing more.
- Only MOD-site-frame's folder — six topics in `explanations.md`, `explain` and `index.mjs` unchanged — and the new test
  whose header names the module change; no existing test or expected result changes.
- The 8 new tests name what they guard — `EVERY STEP EXPLAINS ITSELF` and the requirements each topic states — and
  MOD-site-frame, with 120 planted faults recorded.
- The Acceptance holds: `explain` gives each of the six new topics folded, with its text. Each topic states what UC-006,
  UC-008 and UC-018 and their requirements say of its step, and five point to the book — chapter 12, section 10, and
  chapter 8, section 6, as the existing topics count the sections by the book's headings —; the book has no passage on
  a blob SHA.

The tests beyond the Acceptance stay: they guard what the Outcome asks of the texts. Noted for the sprint's review, no
condition of this gate: the readings the pull request names — the six slugs, which the review pages will name; "every
step" as the Outcome's six topics, leaving the old dashboard's further explanations out; the book's sections.

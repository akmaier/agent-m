---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - b3e8d5f1dd949392627a4b359f05d573db360d58
  - https://github.com/akmaier/agent-m/pull/834
date: 2026-10-18 01:49 UTC
---
# Development → Release testing: ITM-729, the impact list of a changed decision or module file

**REGISTER**

## Reason

ITM-729, pull request #834 into `sprint/team2/86`, at head `b3e8d5f1`. Run 39087486765 passed all twelve jobs. The
pull request changes `src/review-pages/conversation-draft.mjs`, `flow.mjs` and `sections.mjs`, and adds
`tests/review-pages-impact-list.test.mjs`.

**Red, then code.** The tests-only commit `373e412e` was red in run 39087329438 on exactly TST-729003, the list on
`draft`. TST-729001/002 pin the list that ITM-680 built on `decision/<id>` and `module/<id>`, which the Acceptance
asks for.

**Scope and refactoring.** `changeImpact` and `graphOnce` moved unchanged from `flow.mjs` to `sections.mjs`. No
existing test file changed. The new test imports `tests/review-pages-draft-world.mjs` unchanged.

**The acceptance is met.**
- *Breaks* is listed first.
- The fixture shows code files, tests with their guards, the names newly named and no longer named, and the items.
- A folder without code says *no code yet*.
- `draft` shows the same list as `module/<id>`.

**Counter-proofs.** Five planted faults were replayed in a checkout of the head, and each made its test fail: the badge
removed, "no code yet" changed, the draft's impact dropped, the modules reversed, and before = after on draft.

**Agreement 83.** The release and system tests of UC-006, 008, 018, 019 and 022, the sprint dashboard-app tests,
system-itm-597, and the traceability and trace-pages release tests pass with the Bridge packages installed. There is no
release test of UC-023 yet (ITM-739).

**The readings accepted.**
- *No code yet* is shown for the whole list, because `ArchitectureImpact` gives one flat list.
- 5a is not in the Acceptance.
- Plan steps reach the Items line through `items`.
- On `draft`, the problem paragraph is shown and Save is not blocked.

**Findings.** The header of `sections.mjs` still says nothing there reads the repository. A file that a draft adds gets
no impact list on `draft`.

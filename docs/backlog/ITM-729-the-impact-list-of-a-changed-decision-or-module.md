---
id: ITM-729
title: The impact list of a changed decision or module file
level: module
realises:
  - UC-023
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
  - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-review-pages
builds_on:
  - ITM-554
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-729 The impact list of a changed decision or module file

**REGISTER**

## Outcome

UC-023 step 4 and step 6. MOD-review-pages names "impact list of a change" among the extra sections of the decision and
the module, and among what the route `draft` shows of an architecture file. Neither is built:
`src/review-pages/conversation-draft.mjs:10` says "Not built: the impact list of a change of the architecture". The
function it waited for, MOD-trace-graph's `architectureImpact`, is built (ITM-554).

This item builds the section in `sections.mjs` and shows it:
- on `decision/<id>` and `module/<id>` of a file *changed since acceptance*, beside the difference, from
  `architectureImpact` with the last accepted text as before and the default branch's text as after;
- on `draft` for an architecture file, with the current text as before and the draft as after;
- the modules the change concerns, a module that uses an interface it alters or removes listed first and marked
  *breaks* (4a); the code files of each affected module's folder, or *no code yet* (4c); the tests and the requirements
  they guard; the requirements and use cases named and no longer named; the plan steps and backlog items naming an
  affected module, which then need to be looked at again (step 6);
- after an edit before accepting, the list derived again for the new text (5a).

*Accept* stays as it is: disabled while the file names what is not accepted (4b, ITM-440).

## Acceptance

- In a small DOM with a fixture snapshot holding an accepted decision, its changed text, a module using a removed
  interface, code files, tests and a backlog item: the section lists each part as stated, *breaks* first; a module
  folder without code says *no code yet*.
- The same change on `draft` shows the same list.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

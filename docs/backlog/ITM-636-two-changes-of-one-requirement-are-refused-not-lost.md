---
id: ITM-636
title: Two changes of one requirement are refused, not lost
level: module
realises:
  - UC-005
  - UC-019
  - A CHANGE IS PROPOSED UNDER THE EXISTING NAME
modules:
  - MOD-spec-changes
  - MOD-review-pages
builds_on:
  - ITM-634
tests:
  - unit
origin:
  - ITM-634's development, the lead measured by developer-sonnet-d (pull request #680)
---
# ITM-636 Two changes of one requirement are refused, not lost

**REGISTER**

## Outcome

When two candidates change one requirement, `entrySections` (MOD-spec-changes) composes the section with both blocks
under that name, and the second replaces the first. One change is lost without a word. The two candidates can be two
different candidates, or a split part and another candidate. developer-sonnet-d measured this during ITM-634.

ITM-634's refusal covers only a candidate and its own parts, in the panel (`splitProblem`).

The loss happens in the writer, and every caller of `entrySections` can hand it two changes of one name. So the
refusal belongs there, once (nothing twice):
- `entrySections` throws `TwoChanges { name, candidates }` and composes nothing.
- The derivation's panel shows that refusal before anything is written.
- ITM-634's narrower check in `splitProblem` goes, since it is the same rule.

It waits for akmaier's acceptance of the draft committed with it, which states `TwoChanges` in MOD-spec-changes'
`entrySections`.

## Acceptance

- A draft with two `change` candidates of one requirement writes nothing. The panel names the requirement and both
  candidates.
- A draft with one `change` of each requirement is written as before.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

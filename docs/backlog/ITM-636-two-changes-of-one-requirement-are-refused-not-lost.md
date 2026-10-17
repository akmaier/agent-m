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

**Settled at sprint team1/68's start. Selectable.**
- **The modules whose files it changes:**
  - MOD-spec-changes: `propose.mjs`, `entrySections` (:66-73) throws `TwoChanges { name, candidates }`, as its accepted
    text gives it. The writer `queue-entries` (:259) lets it pass, and nothing is written. Also the header lines of
    `propose.mjs:1-2` and `index.mjs:4`, whose item history goes (sprint 67).
  - MOD-review-pages: `candidates.mjs`'s check of two parts changing one `of` (`splitProblem`, :140-150) goes, since
    the same rule now stands in the writer (nothing twice). The derivation's panel (`jobs.mjs:428`) and
    `requirements-draft.mjs:42, 61` show the refusal, naming the requirement and both candidates.
- **The grep, full output read:**
  - `grep -rn entrySections src tests` finds the callers above. It also finds review-pages' own `sections.mjs:73`
    `entrySections(view, …)`, another function of the same name, which stays.
  - Tests of `entrySections`: `tests/spec-changes-sections.test.mjs`, `tests/spec-changes-queue-entries.test.mjs` and
    `tests/test_prompted_source.py:45`.
  - `grep -rn "Two parts of" tests` finds `tests/review-pages-derivation-split-candidate.test.mjs:427-459` and :527-543.
    Their expected messages change to the refusal's.
- **Reads, against the token budget:** none. `entrySections` is pure.
- **No measurement is claimed.**
- **Reachable:** the derivation's panel on the live dashboard's review pages, and the draft route.
- **Sprint 64:** the developer runs the modules' tests and their callers', release tests included, on a draft, and lists
  every changed one before the tests-only commit.
- **Sprint 65:** DOM assertions compare a boolean or a string.
- **Sprint 66:** no refusal is worked around.
- **Sprint 67:** each shell command does one action, and a module header it touches loses its item history.

## Acceptance

- A draft with two `change` candidates of one requirement writes nothing. The panel names the requirement and both
  candidates.
- A draft with one `change` of each requirement is written as before.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-spec-changes' `TwoChanges` of `entrySections` (accepted blob bfbc5fce5845). It is free of drafts; its readings are read at its start.

---
id: ITM-450
title: A requirement's rule decides its duplicates, not its name
level: module
realises:
  - UC-005
  - UC-019
  - A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
  - EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
  - CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
  - A CHANGE IS PROPOSED UNDER THE EXISTING NAME
modules:
  - MOD-documents
builds_on:
  - ITM-303
tests:
  - unit
origin:
  - UC-005 step 6
  - MOD-documents, Interfaces: classifyCandidates
---
# ITM-450 A requirement's rule decides its duplicates, not its name

**REGISTER**

## Outcome

MOD-documents' `classifyCandidates`, as its file states it. Today (ITM-303) `same` in `candidates.mjs` takes two keys as one
when any one of their values is equal at its place, so a candidate under an existing requirement's name with another rule
is a duplicate of it by rule, and two candidates of one name with different rules are merged into one class. The accepted
texts ask: an exact duplicate restates an existing requirement — its normalised rule equals the existing one's
(`EXACT DUPLICATES ARE FOUND WITHOUT A MODEL`); a candidate under an existing name with another rule is no duplicate, and
keeps the class its participant proposed, a change (`A CHANGE IS PROPOSED UNDER THE EXISTING NAME`); candidates of one run
are merged when they state the same rule (`CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES`). A requirement's key is its name
and its rule, as `Candidate` states it: its rule decides, and its name alone joins nothing. A key of one field — the title
of a use case, a decision or an item, the identifier of a module — is decided by that field, as today.

## Acceptance

- Unit tests that name MOD-documents state, before the code exists: a candidate under an existing requirement's name with
  another rule keeps its class change and is no duplicate by rule; a candidate whose normalised rule equals an existing
  requirement's is a duplicate of it by rule, under another name too; two candidates of one name with different rules stay
  two classes, and two that state one rule are merged; a key of one field is decided as before.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green; the expected results this item changes are those of ITM-303's cases that take a matching
  name alone for a duplicate or for one class, and every other stays.
- Only `src/documents/` and the tests that name MOD-documents change.

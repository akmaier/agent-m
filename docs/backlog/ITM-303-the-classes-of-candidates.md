---
id: ITM-303
title: The classes of candidates
level: module
realises:
  - UC-005
  - UC-019
  - A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
  - EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
  - CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
modules:
  - MOD-documents
builds_on:
tests:
  - unit
origin:
  - UC-005 step 6, 5b
---
# ITM-303 The classes of candidates

**REGISTER**

## Outcome

MOD-documents' `Candidate`, `Classified` and `classifyCandidates(candidates, existing)`, as its file states them, in its
part `candidates.mjs`: candidates with the same normalised key merged into one, naming every passage; a candidate whose
normalised key equals an existing artifact's classed as a duplicate of it, by rule; every other candidate keeping its
participant's class. Keys are normalised for case, white space, quotation marks and dashes; the caller gives the key.
The writer `queue-entries` (ITM-338) calls it. The check `candidate-classes` is not part of this item.

## Acceptance

- Unit tests that name MOD-documents state, before the code exists: two candidates of one rule merged with both
  passages; a candidate proposed `new` whose name equals an existing requirement's classed `duplicate` by rule; one
  differing only in case, quotation marks or dashes the same; a `conflict` kept as proposed.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/documents/` and the tests that name MOD-documents change.

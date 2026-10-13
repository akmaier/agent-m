---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - caf27c626fe09fc3db7906c82c7955fe31148b23
  - https://github.com/akmaier/agent-m/pull/483
date: 2026-10-13 00:56 UTC
---
# Development → Release testing: ITM-450, a requirement's rule decides its duplicates, not its name

**REGISTER**

## Reason

ITM-450, pull request #483 by developer-sonnet-b into `sprint/team1/26`, head `caf27c6`. The first commit
`41b7966` holds only tests, and CI is red on it on MOD-documents' tests alone (run 38326111311). The code `d16b148`
was red on two tests of other modules that took a name alone for a duplicate. ITM-470 and ITM-471 changed their fixtures,
and `caf27c6` merges `sprint/team1/26` with both, green (run 38329395125: 2425 pass, 0 fail). Changed:
`src/documents/candidates.mjs`, the new `tests/documents-rule-decides.test.mjs`, and two cases of
`tests/documents-classify-candidates.test.mjs`, all naming MOD-documents. The two cases changed are the expected
results ITM-450's Acceptance names, "those of ITM-303's cases that take a matching name alone for a duplicate or for one
class": c2 under PRINT TWICE's name with another rule keeps its change, and the chain c4, c6, c5 gives two classes. This
is what `docs/instructions/developers.md` rule 3 allows when the item names it, and the change is in the tests-only
commit. 12 planted faults are recorded, all killed. The Acceptance holds.

The readings stand against the texts. A requirement's key decides by its rule; `Candidate`'s keys are `[name, rule]`
and the Outcome says its name alone joins nothing. A blank rule joins nothing. Merging within a run is by rule, as
`CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES` asks for one rule stated twice. A key of one field is decided by that
field, as the item says; the problem it leaves for titles and identifiers is with akmaier since #485.

FINDING ITM-369-1 now passes, and CI reads it `ok … # TODO`. Dropping its marker is developer-sonnet-e's, by an item.

Correction of the record `7a4d0ac` (#482). It says FINDING ITM-369-1 "rests on two requirements of SPEC.md, `EXACT
DUPLICATES ARE FOUND WITHOUT A MODEL` and `A CHANGE IS PROPOSED UNDER THE EXISTING NAME`, which the Scrum Master puts
to akmaier". That is not so. akmaier had ruled that duplicate and change are two different things (sprint 14's
record), so there is no conflict and nothing went to him. The finding was a defect in MOD-documents, which this item
corrects. The decision of `7a4d0ac` stands.

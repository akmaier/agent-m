---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 3d3373e031411d76831e7c4ff98cc5301df64894
  - https://github.com/akmaier/agent-m/pull/421
date: 2026-10-11 20:40 UTC
---
# Development → Release testing: ITM-396, the kinds' data files follow the catalogue's table

**REGISTER**

## Reason

ITM-396, pull request #421 by developer-sonnet-c into `sprint/team1/20`, head `3d3373e`. The first commit `9897ab5`
holds only `tests/job-catalogue-kinds-data.test.mjs`, and CI was red on it (run 38172787671): five of its tests fail,
and no other test does. CI is green on `3d3373e` (run 38173024646, 1874 tests, 0 failures). The change is only the
data files under `src/job-catalogue/kinds/`; the new test names MOD-job-catalogue and its guards, and 28 faults are
recorded. `tests/job-catalogue.test.mjs`, which compares the table and the data files, passes unchanged. The
Acceptance holds: the three answer schemas and the parameter as MOD-job-catalogue's table and text state them; a
`GroupMove` answer accepted and an `{ item, group }` answer refused.

The readings weighed: `source`, the optional key of a candidate's rule source, names what the table states; the
parameter `source` of `change-requirements` stands in its purpose, since a kind's definition has no key for
parameters and its schema is not this item's to change; a `GroupMove` is one object with `op` required and the other
fields optional, since the answer schema's language has no alternatives — that the fields each `op` needs are checked
where MOD-group-document applies the moves is noted for the review.

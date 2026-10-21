---
id: ITM-1163
title: The audit's numbers worse and by the implementer open their rows
level: module
realises:
  - UC-030
modules:
  - MOD-release-evidence
  - MOD-trace-pages
builds_on:
  - ITM-768
tests:
  - unit
origin:
  - ITM-768's pull request #1248 (sprint team1/102), from developer-sonnet-a's report
---
# ITM-1163 The audit's numbers worse and by the implementer open their rows

**REGISTER**

## Outcome

UC-030 step 3: "Each number opens the rows it counts." The audit's `worse` and `byImplementer` numbers open their rows,
as the other four numbers do. The accepted MOD-release-evidence `auditRows` gives each row test the boolean fields
`worse` and `byImplementer`, alongside its unchanged `id`, `level`, `outcome` and `counterProof`.

`worse` compares that test's rate with the preceding release. `byImplementer` identifies a release test whose writer
implemented the requirement, from the existing job-record provenance. The summary counts rows holding a worse test
and distinct tests written by an implementer; the page filters the rows using those supplied flags. No count, writer
rule or evidence format is invented by the view.

## Existing test scope

TST-756003 in `tests/release-evidence-audit.test.mjs` changes only its exact expected row-test shape to include the
two newly accepted booleans. In its unchanged first-row fixture, TST-756101 has `worse: false, byImplementer: false`,
TST-756102 has `worse: false, byImplementer: true`, and TST-756103 has `worse: false, byImplementer: false`.
All existing identifiers, levels, outcomes, counter-proof values, source records and assertions of them remain.
The fixture's TST-756105 rate is worse than its previous release and is not an implementer-written release test
(`worse: true, byImplementer: false`); new cases can assert its flags and the two filters. Other old expected
results, including the four existing filters and the audit export, do not change.

## Acceptance

- On a fixture release, pressing each of the two numbers leaves exactly the rows it counts.
- The provider's flags and the view agree with the accepted counting/provenance rules, without recomputing those rules
  in the view. Existing evidence and old expected results remain unchanged except for the named additive row shape.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

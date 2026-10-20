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

UC-030 step 3: "Each number opens the rows it counts." ITM-768's audit view shows six numbers. Four of them open their
rows: passing, no test, not passed and flaky. Two of them cannot:
- "Rate worse than the last release" (`summary.worse`);
- "Release tests written by the implementer" (`summary.byImplementer`).

The reason is in the text. `auditRows`' rows (MOD-release-evidence.md:136-143) carry each test's `id`, `level`, `outcome`
and `counterProof`. They carry nothing that tells which rows these two numbers count.

## Not ready: it begins with a draft for akmaier

The draft is of MOD-release-evidence's `auditRows`: what each row carries, so that the rows counted by `worse` and by
`byImplementer` can be told from the rows alone. MOD-trace-pages then makes both numbers open those rows, as it does for
the other four.

## Acceptance

- On a fixture release, pressing each of the two numbers leaves exactly the rows it counts.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft is on `main` as `3e4f84c0`** (MOD-release-evidence, by developer-sonnet-a). The item is built once it is accepted.

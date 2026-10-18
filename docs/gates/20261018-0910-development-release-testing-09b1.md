---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - ff408f0d66cffcf326ec09674a8073efa26bfc24
  - https://github.com/akmaier/agent-m/pull/869
date: 2026-10-18 09:10 UTC
---
# Development → Release testing: ITM-880, the page loads analysed for a trace computed once per commit

**REGISTER**

## Reason

ITM-880, akmaier's request, is an analysis. Its pull request #869 into `sprint/team2/89` passes on `ff408f0d`. CI is 12
of 12 green, on the merge with `e4785d89`, which is the head of the sprint's branch.

- **Scope.** It changes the MEASUREMENT `docs/measurements/2026-10-18_page-loads-once-per-commit.md` and two drafts for
  akmaier, committed as drafts and not accepted: `50b09201` (MOD-repository-hosts, `Snapshot.readOn`) and `f90e1187`
  (MOD-trace-graph, the stored graph). It changes no code, no SPEC and no approval record.
- **The Acceptance holds.**
  - Every page named is measured with and without a token, with its method and a known positive for each count.
    `<k>/all` for SPEC entries and release reports is not served, and the measurement says so.
  - The results that depend on the commit alone are classified.
  - The two places are compared, and the recommendation is a file `<commit>.json` on the branch `trace-cache`. That
    fits "precomputed and read from git".
  - The build items are ITM-906, ITM-907 and ITM-908 (`48ad3b88`), registered on main with the developer's text, each
    building on ITM-880.
- **Replayed** at `dccd7cc3` through `tests/app-harness.mjs`. The live main page sends 1,072 requests, 1,069 of them
  single reads, with and without a token. `#uc` sends 48 file reads and `#arc` 71, both without a token. All three are
  the measurement's numbers.
- **The open question** of §6 is settled from the texts in ITM-908: the workflow is written like
  `apply-approvals.yml`, as an entry of MOD-workflow-entries. No SPEC change is needed.
- The architecture and backlog form tests and `tests/release-sprint-02-d-traceability.test.mjs` pass on the merge,
  run with `LC_ALL=C`.

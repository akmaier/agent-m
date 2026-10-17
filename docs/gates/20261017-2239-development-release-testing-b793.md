---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 140e8847cdb808d5959d8faba4a5eaa75220ab83
  - https://github.com/akmaier/agent-m/pull/802
date: 2026-10-17 22:39 UTC
---
# Development → Release testing: ITM-812, the process page groups the catalogue's models by their kind

## Reason
Check 5 does not hold for ITM-812 (MOD-implementation-pages): its Acceptance "a fixture model of each kind added as data
appears in its group without a change to code" is shown by no test. A fault in `process.mjs` that fills Plan-driven with
the first three shipped models and Agile with the rest, ignoring `kind`, passes TST-812001–005. The pull request calls the
line unreachable because `catalogue` reads shipped models only from `shipped.md`; it is reachable: a test that loads the
module tree with a `shipped.md` naming a planned and a pulled fixture file (TST-472409's way for `catalogue`) passes on
140e8847, and fails on the red commit's code and on that fault.
Checks 1–4 hold: the first commit c20fdf8f holds only the test file and CI was red on it (run 39075025724, node (4):
TST-812004 and 812005); CI is green on the head (run 39075670878); the two changed files are `process.mjs` in the module's
folder and a new test naming it; each new test names its requirement and module, and each of the five recorded
counter-proofs, replayed, fails its test. No shipped model or practice name is left in `src/implementation-pages/`.

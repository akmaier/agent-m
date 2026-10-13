# SPEC approvals — queue 2026-10-13b · no participant waits more than two minutes for a pull request's CI

**PO decision:** no participant waits more than two minutes for the CI of a pull request; a test that does not fit runs
nightly, each team decides which tests run on a pull request, and every test runs nightly.

**Size:** two entries. 01, §11 *Architecture and implementation*: `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` names
moving a test between the run on a pull request and the nightly run as a change between jobs, in place of moving only the
tests of level `release`. 02, §12 *Tests and continuous integration*: `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES` states
the wait, where a test that does not fit runs, who decides, and that every test runs nightly. Every other requirement of the
two sections is carried over byte for byte.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 11. Architecture and implementation | — | — |
| 02 | `SPEC.md` | ## 12. Tests and continuous integration | — | — |

# SPEC approvals — queue 2026-10-13 · release tests leave the run on a pull request into a sprint's branch

**PO decision:** a change between jobs may move the tests of level `release` out of the run on a pull request into a
sprint's branch, into the nightly run and the run on a pull request into the default branch, so that the run on each
item's pull request stays within its two minutes.

**Size:** one entry. 01, §11 *Architecture and implementation*: `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` names this
move as one more kind of change between jobs, and its check names the case. Every other requirement of the section is
carried over byte for byte. `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES` is unchanged.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 11. Architecture and implementation | — | — |

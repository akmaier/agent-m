# SPEC approvals — queue 2026-10-13c · Agent M declares its own test schedule

**PO decision:** Agent M declares its own test schedule and generates its CI configuration from it, as every managed product
does; the kind of change between jobs that moved only the tests of level `release` is removed again, since a workflow
generated from the schedule is already one that only runs an entry a module's file names.

**Size:** two entries. 01, §11 *Architecture and implementation*: `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` returns to
its text before 4ed77fe2. 02, §12 *Tests and continuous integration*: `THE TEST SCHEDULE IS DECLARED PER PRODUCT` and
`THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE` name Agent M beside every managed product. Every other requirement of
the two sections is carried over byte for byte.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 11. Architecture and implementation | — | — |
| 02 | `SPEC.md` | ## 12. Tests and continuous integration | — | — |

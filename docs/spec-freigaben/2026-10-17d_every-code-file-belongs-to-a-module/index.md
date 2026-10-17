# SPEC approvals — queue 2026-10-17d · every code file belongs to a module

**PO decision:** open for akmaier's acceptance. Proposed by po-opus after akmaier rejected entry 02 of queue
`2026-10-17`. The scope is measured in `docs/measurements/2026-10-17_code-outside-every-module.md`.

**Size:** one entry. **01, §11 *Architecture and implementation*.**
- `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` is replaced by `EVERY CODE FILE BELONGS TO A MODULE` and `CODE OUTSIDE
  THE ARCHITECTURE IS MOVED INTO IT`.
- `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` also allows the files its modules take over.
- `MODULE GAPS ARE REPORTED, NOT FORBIDDEN` no longer tolerates a code file outside every module.

Every other line of the section is carried over byte for byte.

**Zieldatei aller Einträge:** `SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 11. Architecture and implementation | — | — |

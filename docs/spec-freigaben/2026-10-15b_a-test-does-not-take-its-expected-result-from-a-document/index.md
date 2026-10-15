# SPEC approvals — queue 2026-10-15b · a test does not take its expected result from a document

**PO decision:** a test that checks code states its expected result itself; it never reads it from the SPEC, a use case
or an architecture file when it runs, so that accepting a document never turns a test red.

**Size:** one entry. 01, §12 *Tests and continuous integration*: the new requirement `A TEST DOES NOT TAKE ITS EXPECTED
RESULT FROM A DOCUMENT` follows `A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS`. Every other requirement of the section
is carried over byte for byte.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 12. Tests and continuous integration | — | — |

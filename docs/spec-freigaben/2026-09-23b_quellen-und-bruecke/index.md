# SPEC approvals — queue 2026-09-23b · sources and bridge

**Two corrections to the accepted text of queue `2026-09-23_agent-m-v1`, as instructed by the PO
on 2026-09-23.**

1. *"In the cases where the source is missing, the source is PO."* Fifteen requirements carried
   no source with a date, which §2 `A REQUIREMENT HAS A REGISTERED SOURCE` and §3
   `A REQUIREMENT HAS FIVE FIELDS` both require. Each gets `*(PO A. Maier, 2026-09-23)*`. In §9
   the quoted rule name stays in place and the source is put in front of it.
2. *"Fix the bridge requirement; it needs to be two requirements."* The accepted entry had two
   statements in one rule, which §3 `ONE STATEMENT PER REQUIREMENT` forbids, and a garbled name.
   It becomes `THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY` and
   `REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL`.

No other line changes. Each proposal was generated from the current `SPEC.md` section, and the
diff was checked line by line before it was queued.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 2. Requirement sources | — | — |
| 02 | `SPEC.md` | ## 3. Requirements | — | — |
| 03 | `SPEC.md` | ## 6. Runtimes | — | — |
| 04 | `SPEC.md` | ## 8. Versioning | — | — |
| 05 | `SPEC.md` | ## 9. Human gates | — | — |

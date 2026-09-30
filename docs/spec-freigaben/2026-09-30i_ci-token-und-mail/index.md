# SPEC approvals — queue 2026-09-30i · the job's token as a CI secret; Gmail through the bridge; the narrowest mail permissions

**PO, 2026-09-30,** on the findings of `docs/measurements/2026-09-30_architecture-open-points.md`:
*"A (a)"* — a job writes with the person's own token, stored as a CI secret; *"B (b)"* — Gmail only through
the bridge over IMAP; *"C rewording is fine. We will need to be able to create new drafts in the mailbox."*

**Size:** 1 new requirement; 3 existing requirements changed under their names. The level-1 sentence about
Gmail in §6 is changed in queue 2026-09-30h, entry 01, which holds §6.

**Order:** none — the two entries are independent of each other and of queue 2026-09-30h.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 7. Configuration and secrets | — | — |
| 02 | `SPEC.md` | ## 14. Issues, mail and personal data | — | — |

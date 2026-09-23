# SPEC approvals — queue 2026-09-23 · Agent M `SPEC.md`

**The initial specification of Agent M, version 2026.1.0.** Nothing here has been written into the
SPEC. The file currently holds the section headings and a placeholder per section; each entry
below proposes the text for exactly one section.

Operated through `scripts/spec_dashboard.py` in the process repository (loopback only). Accepting
an entry writes the section, commits in *this* repository, and appends a line to
`entscheidungen.md`. The replaced text stays reachable through the git history
(`git show <commit>^:SPEC.md`).

**Why the sections are empty rather than pre-filled:** `SOFTWARE_MAINTENANCE.md`
*"JEDE SPEC-AENDERUNG LAEUFT UEBER DAS FREIGABE-WERKZEUG"* — a specification written first and
approved afterwards is a specification that was never approved. The skeleton fixes the anchors so
the tool can find them; the content arrives only through this queue.

**Scope of this queue:** stages 1–3 of the cycle (sources, requirements, use cases), as decided by
the Product Owner on 2026-09-23. Architecture, code, tests, release and manual get their own
queue when their stage becomes current — specifying them now would fix decisions that stages 1–3
have not yet informed.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 0. Hard product rules | — | — |
| 02 | `SPEC.md` | ## 1. Identity and traceability | — | — |
| 03 | `SPEC.md` | ## 2. Requirement sources | — | — |
| 04 | `SPEC.md` | ## 3. Requirements | — | — |
| 05 | `SPEC.md` | ## 4. Use cases and models | — | — |
| 06 | `SPEC.md` | ## 5. Process models and profiles | — | — |
| 07 | `SPEC.md` | ## 6. Runtimes | — | — |
| 08 | `SPEC.md` | ## 7. Configuration and secrets | — | — |
| 09 | `SPEC.md` | ## 8. Versioning | — | — |
| 10 | `SPEC.md` | ## 9. Human gates | — | — |

## Reading order

Entries 01–02 fix the spine (what Agent M is, and how identity works); everything else depends on
them. 03–05 are the three stages of version 2026.1.0. 06 is the model catalogue. 07–10 are the
cross-cutting rules that apply to every stage.

Each entry is a **block** containing several named requirements, as
`SOFTWARE_MAINTENANCE.md` permits — presenting them one at a time would not be workable — but
every requirement inside a block is individually recognisable by its name, source and single rule,
so that any one of them can be struck out or reworded without touching the rest.
